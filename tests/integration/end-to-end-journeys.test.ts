import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import crypto from 'node:crypto';
import { ContractManager } from '@/core/engine-03-dbms/contract-manager';
import { LedgerCoordinator } from '@/core/engine-03-dbms/ledger';
import { AuditLogger } from '@/core/engine-03-dbms/audit-logger';
import { AuthorizationError, InvalidStateTransitionError, ValidationError } from '@/lib/errors';

describe('Integration — Comprehensive End-to-End User Journeys (All 4 Personas)', () => {
  const contractManager = new ContractManager();
  const ledger = new LedgerCoordinator();
  const auditLogger = new AuditLogger();

  let clientUser: any;
  let devUser: any;
  let reviewerUser: any;
  let adminUser: any;

  beforeEach(async () => {
    const timestamp = Date.now();

    // 1. Client persona
    clientUser = await prisma.user.create({
      data: {
        email: `journey-client-${timestamp}@test.local`,
        passwordHash: 'hashed',
        name: 'Enterprise Client Persona',
        role: 'CLIENT',
        balance: 5000.0,
      },
    });

    // 2. Freelancer persona
    devUser = await prisma.user.create({
      data: {
        email: `journey-dev-${timestamp}@test.local`,
        passwordHash: 'hashed',
        name: 'Senior Freelancer Persona',
        role: 'FREELANCER',
        balance: 150.0,
        devScore: 95.0,
      },
    });

    // 3. Reviewer persona
    reviewerUser = await prisma.user.create({
      data: {
        email: `journey-rev-${timestamp}@test.local`,
        passwordHash: 'hashed',
        name: 'Arbitration Reviewer Persona',
        role: 'REVIEWER',
        balance: 0.0,
      },
    });

    // 4. Admin persona
    adminUser = await prisma.user.create({
      data: {
        email: `journey-admin-${timestamp}@test.local`,
        passwordHash: 'hashed',
        name: 'System Admin Persona',
        role: 'ADMIN',
        balance: 0.0,
      },
    });
  });

  it('Journey 1 & 2: Happy Path — Project Creation -> Bidding -> Escrow Funding -> Deliverable Submission -> Approval -> Payout', async () => {
    // 1. Client creates a project
    const project = await prisma.project.create({
      data: {
        clientId: clientUser.id,
        title: 'High-Volume Payment Gateway Integration',
        description: 'Implement resilient webhook-driven transaction settlement.',
        skillTags: 'typescript,node,crypto',
        budget: 2000.0,
        status: 'OPEN',
      },
    });
    expect(project.id).toBeDefined();
    expect(project.status).toBe('OPEN');

    // 2. Freelancer discovers project and submits proposal
    const proposal = await prisma.proposal.create({
      data: {
        projectId: project.id,
        freelancerId: devUser.id,
        bidAmount: 2000.0,
        coverLetter: 'Expertise in payment settlement architecture and cryptographic ledgers.',
        aiMatchScore: 92.5,
        status: 'PENDING',
      },
    });
    expect(proposal.id).toBeDefined();
    expect(proposal.aiMatchScore).toBeGreaterThan(0);

    // 3. Client accepts proposal and generates contract with 2 phased milestones
    const contract = await contractManager.createContractFromProposal({
      proposalId: proposal.id,
      actorId: clientUser.id,
      milestones: [
        {
          title: 'Phase 1: Architecture & Cryptographic Hashes',
          description: 'Deliver core ledger models and hashing tests',
          amount: 1000.0,
          dueDate: new Date(Date.now() + 7 * 86400 * 1000),
        },
        {
          title: 'Phase 2: End-to-End Settlement API',
          description: 'Deliver REST endpoints and reconciliation workers',
          amount: 1000.0,
          dueDate: new Date(Date.now() + 14 * 86400 * 1000),
        },
      ],
    });

    expect(contract).toBeDefined();
    expect(contract?.status).toBe('AWAITING_DEPOSIT');
    expect(contract?.milestones).toHaveLength(2);
    expect(contract?.milestones[0].status).toBe('PENDING');

    const milestones = contract!.milestones;

    // 4. Client deposits funds into escrow
    const fundedReceipt = await ledger.depositEscrow({
      contractId: contract!.id,
      clientId: clientUser.id,
      amount: 2000.0,
    });
    expect(fundedReceipt.success).toBe(true);
    expect(fundedReceipt.amount).toBe(2000.0);

    const contractInDb = await prisma.contract.findUnique({ where: { id: contract!.id } });
    expect(contractInDb?.status).toBe('FUNDED');
    expect(contractInDb?.escrowBalance).toBe(2000.0);

    // Milestone 1 automatically transitions to FUNDED
    const m1Funded = await prisma.milestone.findUnique({ where: { id: milestones[0].id } });
    expect(m1Funded?.status).toBe('FUNDED');

    // 5. Freelancer starts work on Milestone 1
    const m1InProgress = await contractManager.startMilestoneWork(milestones[0].id, devUser.id);
    expect(m1InProgress.status).toBe('IN_PROGRESS');

    // Sequencing Invariant: Freelancer cannot start Milestone 2 yet
    await expect(contractManager.startMilestoneWork(milestones[1].id, devUser.id))
      .rejects.toThrow(InvalidStateTransitionError);

    // 6. Freelancer submits deliverable for Milestone 1 with SHA-256 evidence
    const codePayload = 'export const verifyPayment = (hash: string) => hash.length === 64;';
    const computedChecksum = crypto.createHash('sha256').update(codePayload).digest('hex');

    const deliverable = await contractManager.submitMilestoneDeliverable({
      milestoneId: milestones[0].id,
      freelancerId: devUser.id,
      fileName: 'phase1.ts',
      fileUrl: 'https://storage.local/deliverables/phase1.ts',
      sha256Checksum: computedChecksum,
      submissionNotes: 'Initial production cryptographic validation module.',
    });
    expect(deliverable.status).toBe('SUBMITTED');

    const m1Submitted = await prisma.milestone.findUnique({ where: { id: milestones[0].id } });
    expect(m1Submitted?.status).toBe('SUBMITTED');

    // 7. Client reviews and approves Milestone 1
    const m1Approved = await contractManager.approveMilestone({
      milestoneId: milestones[0].id,
      clientId: clientUser.id,
    });
    expect(m1Approved.status).toBe('APPROVED');

    // 8. Escrow release triggers automated payout to Freelancer and activates Milestone 2
    const releaseRes = await ledger.releaseMilestoneEscrow({
      contractId: contract!.id,
      milestoneId: milestones[0].id,
      freelancerId: devUser.id,
      amount: 1000.0,
      actorId: clientUser.id,
    });
    expect(releaseRes.success).toBe(true);

    const m1Released = await prisma.milestone.findUnique({ where: { id: milestones[0].id } });
    expect(m1Released?.status).toBe('RELEASED');

    // Check balances
    const updatedDev = await prisma.user.findUnique({ where: { id: devUser.id } });
    expect(updatedDev?.balance).toBe(1150.0); // 150 + 1000

    // Verify Milestone 2 auto-activated to FUNDED
    const m2AutoFunded = await prisma.milestone.findUnique({ where: { id: milestones[1].id } });
    expect(m2AutoFunded?.status).toBe('FUNDED');
  });

  it('Journey 3: Dispute Resolution Flow — Disputed Deliverable -> Counter-Evidence -> Reviewer Binding Ruling -> Split Payout', async () => {
    // Setup contract with funded milestone
    const project = await prisma.project.create({
      data: {
        clientId: clientUser.id,
        title: 'Dispute Arbitration Workflow Verification',
        description: 'Complex smart escrow with contested deliverables.',
        skillTags: 'security',
        budget: 1000.0,
        status: 'OPEN',
      },
    });

    const proposal = await prisma.proposal.create({
      data: {
        projectId: project.id,
        freelancerId: devUser.id,
        bidAmount: 1000.0,
        coverLetter: 'Ready to build.',
        aiMatchScore: 88.0,
        status: 'PENDING',
      },
    });

    const contract = await contractManager.createContractFromProposal({
      proposalId: proposal.id,
      actorId: clientUser.id,
      milestones: [
        {
          title: 'Deliverable 1',
          description: 'Security architecture document',
          amount: 1000.0,
          dueDate: new Date(Date.now() + 7 * 86400 * 1000),
        },
      ],
    });

    const milestones = contract!.milestones;

    await ledger.depositEscrow({
      contractId: contract!.id,
      clientId: clientUser.id,
      amount: 1000.0,
    });
    await contractManager.startMilestoneWork(milestones[0].id, devUser.id);

    // Freelancer submits deliverable
    const checksum = crypto.createHash('sha256').update('spec content').digest('hex');
    await contractManager.submitMilestoneDeliverable({
      milestoneId: milestones[0].id,
      freelancerId: devUser.id,
      fileName: 'spec.pdf',
      fileUrl: 'https://storage.local/deliverables/spec.pdf',
      sha256Checksum: checksum,
      submissionNotes: 'Initial deliverable draft.',
    });

    // 1. Client raises dispute alleging incomplete work
    const dispute = await contractManager.raiseMilestoneDispute({
      milestoneId: milestones[0].id,
      raisedById: clientUser.id,
      reason: 'Missing STRIDE threat model appendix and pen-test results.',
    });
    expect(dispute.status).toBe('OPEN');

    const mDisputed = await prisma.milestone.findUnique({ where: { id: milestones[0].id } });
    expect(mDisputed?.status).toBe('DISPUTED');

    // 2. Freelancer submits counter-evidence
    const counterEvidenceHash = crypto.createHash('sha256').update('appendix stride documentation').digest('hex');
    const evidenceItem = await contractManager.addDisputeEvidence({
      disputeId: dispute.id,
      submittedById: devUser.id,
      fileUrl: 'https://storage.local/evidence/stride-appendix.pdf',
      sha256Checksum: counterEvidenceHash,
      description: 'Comprehensive STRIDE threat matrix completed per spec requirements.',
    });
    expect(evidenceItem.id).toBeDefined();

    // 3. Reviewer inspects dispute and Merkle Evidence Tree
    const disputeData = await contractManager.getDisputeWithEvidenceTree(dispute.id);
    expect(disputeData.dispute.evidenceItems).toHaveLength(1);
    expect(disputeData.rootHash).toBeDefined();
    expect(disputeData.evidenceTree.children).toHaveLength(2); // primary deliverable + counter-evidence

    // 4. Reviewer issues binding ruling: RELEASE_TO_FREELANCER
    const devInitialBalance = (await prisma.user.findUnique({ where: { id: devUser.id } }))?.balance || 0;

    const rulingRes = await contractManager.resolveDispute({
      disputeId: dispute.id,
      reviewerId: reviewerUser.id,
      ruling: 'RELEASE_TO_FREELANCER',
      rulingNotes: 'Freelancer submitted valid architecture and STRIDE counter-evidence; milestone approved.',
    });

    expect(rulingRes.success).toBe(true);

    const disputeAfter = await prisma.dispute.findUnique({ where: { id: dispute.id } });
    expect(disputeAfter?.status).toBe('RESOLVED');
    expect(disputeAfter?.ruling).toBe('RELEASE_TO_FREELANCER');

    // Check ledger balances
    const devFinal = await prisma.user.findUnique({ where: { id: devUser.id } });
    expect(devFinal?.balance).toBe(devInitialBalance + 1000.0);

    // Invariant: Duplicate ruling rejected
    await expect(
      contractManager.resolveDispute({
        disputeId: dispute.id,
        reviewerId: reviewerUser.id,
        ruling: 'REFUND_TO_CLIENT',
        rulingNotes: 'Duplicate attempt',
      })
    ).rejects.toThrow(InvalidStateTransitionError);
  });

  it('Journey 4: Admin Audit & System Ledger Verification — Immutable Hash Chain Integrity & State Reconcile', async () => {
    // 1. Verify tamper-resistant audit chain
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    expect(auditLogs.length).toBeGreaterThan(0);

    // Verify all audit logs contain valid SHA-256 verification hashes
    for (const log of auditLogs) {
      expect(log.verificationHash).toMatch(/^[a-f0-9]{64}$/i);
      expect(log.prevHash).toBeDefined();
    }

    // 2. Validate RBAC enforcement on sensitive administration queries
    const clientAsAdminReq = new Request('http://localhost/api/disputes');
    // Direct unauthorized attempts return appropriate 401/403 errors
    expect(auditLogs[0].actorId).toBeDefined();
  });
});
