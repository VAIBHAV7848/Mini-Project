import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import { ContractManager } from '@/core/engine-03-dbms/contract-manager';
import { LedgerCoordinator } from '@/core/engine-03-dbms/ledger';
import { AuditLogger } from '@/core/engine-03-dbms/audit-logger';
import { AuthorizationError, InvalidStateTransitionError, ValidationError } from '@/lib/errors';

describe('Engine 03 (DBMS) & Engine 04 (Web) — Dispute Workflow & Evidence Resolution (FR-09, UC-04)', () => {
  const contractManager = new ContractManager();
  const ledger = new LedgerCoordinator();
  const auditLogger = new AuditLogger();

  let client: any;
  let freelancer: any;
  let reviewer: any;
  let bystander: any;
  let contract: any;
  let milestone: any;

  beforeEach(async () => {
    const timestamp = Date.now();

    client = await prisma.user.create({
      data: {
        email: `dispute-client-${timestamp}@test.local`,
        passwordHash: 'hash',
        name: 'Dispute Client',
        role: 'CLIENT',
        balance: 2000.0,
      },
    });

    freelancer = await prisma.user.create({
      data: {
        email: `dispute-dev-${timestamp}@test.local`,
        passwordHash: 'hash',
        name: 'Dispute Freelancer',
        role: 'FREELANCER',
        balance: 100.0,
      },
    });

    reviewer = await prisma.user.create({
      data: {
        email: `dispute-rev-${timestamp}@test.local`,
        passwordHash: 'hash',
        name: 'Independent Reviewer',
        role: 'REVIEWER',
        balance: 0.0,
      },
    });

    bystander = await prisma.user.create({
      data: {
        email: `dispute-bystander-${timestamp}@test.local`,
        passwordHash: 'hash',
        name: 'Unrelated User',
        role: 'CLIENT',
        balance: 500.0,
      },
    });

    const project = await prisma.project.create({
      data: {
        clientId: client.id,
        title: 'Disputed Platform Build',
        description: 'Complete project requiring escrow and dispute handling',
        budget: 1000.0,
        skillTags: '["typescript", "nextjs"]',
      },
    });

    contract = await prisma.contract.create({
      data: {
        projectId: project.id,
        clientId: client.id,
        freelancerId: freelancer.id,
        totalAmount: 1000.0,
        escrowBalance: 0.0,
        status: 'AWAITING_DEPOSIT',
      },
    });

    milestone = await prisma.milestone.create({
      data: {
        contractId: contract.id,
        title: 'Core Milestone 1',
        description: 'Frontend component deliverable',
        amount: 1000.0,
        sequenceOrder: 1,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
    });

    // Fund escrow
    await ledger.depositEscrow({
      contractId: contract.id,
      clientId: client.id,
      amount: 1000.0,
    });

    // Start work & submit deliverable
    await contractManager.startMilestoneWork(milestone.id, freelancer.id);
    await contractManager.submitMilestoneDeliverable({
      milestoneId: milestone.id,
      freelancerId: freelancer.id,
      fileName: 'milestone-1-release.zip',
      fileUrl: 'https://storage.local/deliverables/m1.zip',
      sha256Checksum: 'a'.repeat(64),
      submissionNotes: 'Deliverable complete',
    });
  });

  it('should execute full dispute lifecycle: filing -> counter-evidence -> Merkle tree -> reviewer ruling in favor of freelancer', async () => {
    // 1. Client raises dispute
    const dispute = await contractManager.raiseMilestoneDispute({
      milestoneId: milestone.id,
      raisedById: client.id,
      reason: 'Code submitted has severe defects and fails specifications.',
    });

    expect(dispute.id).toBeDefined();
    expect(dispute.status).toBe('OPEN');

    // Verify milestone and contract transitioned to DISPUTED
    const updatedMilestone = await prisma.milestone.findUnique({ where: { id: milestone.id } });
    expect(updatedMilestone!.status).toBe('DISPUTED');
    const updatedContract = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(updatedContract!.status).toBe('DISPUTED');

    // 2. Freelancer submits counter-evidence
    const evidence1 = await contractManager.addDisputeEvidence({
      disputeId: dispute.id,
      submittedById: freelancer.id,
      fileUrl: 'https://storage.local/evidence/test-runs.log',
      sha256Checksum: 'b'.repeat(64),
      description: 'Automated test suite execution logs proving 100% test pass rate',
    });
    expect(evidence1.id).toBeDefined();

    // 3. Client submits supplementary defect logs
    const evidence2 = await contractManager.addDisputeEvidence({
      disputeId: dispute.id,
      submittedById: client.id,
      fileUrl: 'https://storage.local/evidence/defect-screenshots.pdf',
      sha256Checksum: 'c'.repeat(64),
      description: 'Screenshots demonstrating broken navigation bar',
    });
    expect(evidence2.id).toBeDefined();

    // 4. Reviewer inspects dispute and Merkle EvidenceTree
    const treeData = await contractManager.getDisputeWithEvidenceTree(dispute.id);
    expect(treeData.evidenceTree.children).toHaveLength(3); // deliverable + 2 evidence items
    expect(treeData.rootHash).toBeDefined();
    expect(treeData.isTampered).toBe(false);

    // 5. Reviewer renders binding ruling: RELEASE_TO_FREELANCER
    const receipt = await contractManager.resolveDispute({
      disputeId: dispute.id,
      reviewerId: reviewer.id,
      ruling: 'RELEASE_TO_FREELANCER',
      rulingNotes: 'Code meets functional acceptance criteria; defect is minor out-of-scope styling.',
    });

    expect(receipt.success).toBe(true);

    // Check post-ruling balances
    const freshFreelancer = await prisma.user.findUnique({ where: { id: freelancer.id } });
    expect(freshFreelancer!.balance).toBe(1100.0); // 100 original + 1000 release

    const freshMilestone = await prisma.milestone.findUnique({ where: { id: milestone.id } });
    expect(freshMilestone!.status).toBe('RELEASED');

    const freshDispute = await prisma.dispute.findUnique({ where: { id: dispute.id } });
    expect(freshDispute!.status).toBe('RESOLVED');
    expect(freshDispute!.ruling).toBe('RELEASE_TO_FREELANCER');

    // Audit chain verified
    const chain = await auditLogger.verifyAuditChain();
    expect(chain.isValid).toBe(true);
  });

  it('should execute dispute ruling in favor of client (REFUND_TO_CLIENT)', async () => {
    const dispute = await contractManager.raiseMilestoneDispute({
      milestoneId: milestone.id,
      raisedById: client.id,
      reason: 'Empty deliverable uploaded.',
    });

    await contractManager.resolveDispute({
      disputeId: dispute.id,
      reviewerId: reviewer.id,
      ruling: 'REFUND_TO_CLIENT',
      rulingNotes: 'Work was incomplete and non-functional. Full refund granted to client.',
    });

    const freshClient = await prisma.user.findUnique({ where: { id: client.id } });
    expect(freshClient!.balance).toBe(2000.0); // 2000 original - 1000 deposit + 1000 refund = 2000

    const freshMilestone = await prisma.milestone.findUnique({ where: { id: milestone.id } });
    expect(freshMilestone!.status).toBe('REFUNDED');
  });

  it('should reject dispute filing by unrelated third parties (AuthorizationError)', async () => {
    await expect(
      contractManager.raiseMilestoneDispute({
        milestoneId: milestone.id,
        raisedById: bystander.id,
        reason: 'Malicious attempt by unauthorized user',
      })
    ).rejects.toThrow(AuthorizationError);
  });

  it('should reject evidence submission by unrelated third parties', async () => {
    const dispute = await contractManager.raiseMilestoneDispute({
      milestoneId: milestone.id,
      raisedById: client.id,
      reason: 'Dispute for evidence test',
    });

    await expect(
      contractManager.addDisputeEvidence({
        disputeId: dispute.id,
        submittedById: bystander.id,
        fileUrl: 'https://storage.local/fake.pdf',
        sha256Checksum: 'd'.repeat(64),
        description: 'Unauthorized evidence',
      })
    ).rejects.toThrow(AuthorizationError);
  });

  it('should reject duplicate rulings on an already resolved dispute', async () => {
    const dispute = await contractManager.raiseMilestoneDispute({
      milestoneId: milestone.id,
      raisedById: client.id,
      reason: 'Dispute for duplicate ruling test',
    });

    await contractManager.resolveDispute({
      disputeId: dispute.id,
      reviewerId: reviewer.id,
      ruling: 'REFUND_TO_CLIENT',
      rulingNotes: 'Initial ruling executed.',
    });

    // Second ruling attempt on resolved dispute must fail
    await expect(
      contractManager.resolveDispute({
        disputeId: dispute.id,
        reviewerId: reviewer.id,
        ruling: 'RELEASE_TO_FREELANCER',
        rulingNotes: 'Attempting conflicting second ruling.',
      })
    ).rejects.toThrow(InvalidStateTransitionError);
  });

  it('should reject malformed SHA-256 checksums on evidence submission', async () => {
    const dispute = await contractManager.raiseMilestoneDispute({
      milestoneId: milestone.id,
      raisedById: client.id,
      reason: 'Checksum test dispute',
    });

    await expect(
      contractManager.addDisputeEvidence({
        disputeId: dispute.id,
        submittedById: client.id,
        fileUrl: 'https://storage.local/test.pdf',
        sha256Checksum: 'invalid-short-hash',
        description: 'Malformed checksum test',
      })
    ).rejects.toThrow(ValidationError);
  });
});
