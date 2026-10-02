import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import { EscrowFsmValidator } from '@/core/engine-01-os/escrow-fsm';
import { KeyedMutex } from '@/core/engine-01-os/mutex';
import { Sha256Hasher } from '@/core/engine-02-dsa-se/hasher';
import { EvidenceTreeManager, EvidenceNodeType } from '@/core/engine-02-dsa-se/evidence-tree';
import { HeuristicSemanticMatcher } from '@/core/engine-02-dsa-se/matcher';
import { LedgerCoordinator } from '@/core/engine-03-dbms/ledger';
import { ContractManager } from '@/core/engine-03-dbms/contract-manager';
import { AuditLogger } from '@/core/engine-03-dbms/audit-logger';
import { RbacEnforcer } from '@/core/engine-04-web/rbac';
import { StatePoller } from '@/core/engine-04-web/poller';

describe('Vertical Slice End-to-End Integration Test (Engines 01 + 02 + 03 + 04)', () => {
  const fsm = new EscrowFsmValidator();
  const mutex = new KeyedMutex();
  const hasher = new Sha256Hasher();
  const matcher = new HeuristicSemanticMatcher();
  const auditLogger = new AuditLogger();
  const ledger = new LedgerCoordinator(auditLogger);
  const contractManager = new ContractManager(auditLogger, ledger);

  let clientUser: any;
  let devUser: any;
  let reviewerUser: any;

  beforeEach(async () => {
    // 1. Setup personas
    clientUser = await prisma.user.create({
      data: {
        email: `slice-client-${Date.now()}@test.local`,
        passwordHash: 'hash',
        name: 'Enterprise Client',
        role: 'CLIENT',
        balance: 2000.0,
      },
    });

    devUser = await prisma.user.create({
      data: {
        email: `slice-dev-${Date.now()}@test.local`,
        passwordHash: 'hash',
        name: 'Fullstack Dev',
        role: 'FREELANCER',
        balance: 100.0,
        devScore: 90,
      },
    });

    reviewerUser = await prisma.user.create({
      data: {
        email: `slice-judge-${Date.now()}@test.local`,
        passwordHash: 'hash',
        name: 'Dispute Magistrate',
        role: 'REVIEWER',
        balance: 0.0,
      },
    });
  });

  it('should successfully complete the entire happy-path milestone lifecycle across all 4 engines', async () => {
    // --- STAGE 1: Client posts project ---
    RbacEnforcer.enforceRole(
      { userId: clientUser.id, email: clientUser.email, role: 'CLIENT', name: clientUser.name },
      ['CLIENT']
    );

    const project = await prisma.project.create({
      data: {
        clientId: clientUser.id,
        title: 'Distributed Escrow Platform Build',
        description: 'Implement four-engine architecture for KLE mini-project',
        budget: 1000.0,
        skillTags: JSON.stringify(['typescript', 'nextjs', 'sqlite', 'tailwind']),
      },
    });

    // --- STAGE 2: Freelancer submits proposal with Engine 02 Heuristic AI Match Score ---
    const matchAnalysis = matcher.calculateMatchScore(
      { budget: 1000.0, skillTags: ['typescript', 'nextjs', 'sqlite', 'tailwind'] },
      { bidAmount: 1000.0, freelancerSkills: ['typescript', 'nextjs', 'sqlite', 'react'], devScore: devUser.devScore }
    );

    expect(matchAnalysis.compositeScore).toBeGreaterThan(70);

    const proposal = await prisma.proposal.create({
      data: {
        projectId: project.id,
        freelancerId: devUser.id,
        bidAmount: 1000.0,
        coverLetter: 'I have extensive experience with Next.js and SQLite architectures.',
        aiMatchScore: matchAnalysis.compositeScore,
      },
    });

    // --- STAGE 3: Client accepts proposal and forms Contract with 2 milestones (Engine 03) ---
    const contract = await contractManager.createContractFromProposal({
      proposalId: proposal.id,
      actorId: clientUser.id,
      milestones: [
        {
          title: 'Milestone 1: Foundation & Engines',
          description: 'Core state machine and database coordination',
          amount: 600.0,
          dueDate: new Date(Date.now() + 86400000),
        },
        {
          title: 'Milestone 2: UI & Verification',
          description: 'Responsive dashboard and test coverage',
          amount: 400.0,
          dueDate: new Date(Date.now() + 172800000),
        },
      ],
    });

    expect(contract!.status).toBe('AWAITING_DEPOSIT');
    expect(contract!.milestones).toHaveLength(2);

    // --- STAGE 4: Client deposits escrow funds (Engine 01 Mutex & FSM + Engine 03 ACID Ledger) ---
    const m1 = contract!.milestones[0];
    const release = await mutex.acquire(m1.id);

    try {
      const fsmCheck = fsm.validateTransition('AWAITING_DEPOSIT', 'DEPOSIT', 'CLIENT');
      expect(fsmCheck.allowed).toBe(true);

      const depositReceipt = await ledger.depositEscrow({
        contractId: contract!.id,
        clientId: clientUser.id,
        amount: 1000.0,
      });

      expect(depositReceipt.success).toBe(true);
    } finally {
      release();
    }

    // Verify balance conservation
    const updatedClient = await prisma.user.findUnique({ where: { id: clientUser.id } });
    const fundedContract = await prisma.contract.findUnique({ where: { id: contract!.id } });
    expect(updatedClient!.balance).toBe(1000.0);
    expect(fundedContract!.escrowBalance).toBe(1000.0);
    expect(fundedContract!.status).toBe('FUNDED');

    // --- STAGE 5: Freelancer starts work on Milestone 1 (Engine 01 & 03) ---
    const startedM1 = await contractManager.startMilestoneWork(m1.id, devUser.id);
    expect(startedM1.status).toBe('IN_PROGRESS');

    // --- STAGE 6: Freelancer submits deliverable with SHA-256 checksum (Engine 02 & 03) ---
    const deliverableContent = Buffer.from('const answer = 42; // Verified Deliverable Source Code');
    const checksum = hasher.computeDigest(deliverableContent);
    expect(checksum).toHaveLength(64);

    const submittedM1 = await contractManager.submitMilestoneDeliverable({
      milestoneId: m1.id,
      freelancerId: devUser.id,
      fileName: 'core-engines.tar.gz',
      fileUrl: 'https://storage.local/deliverables/m1-code.tar.gz',
      sha256Checksum: checksum,
      submissionNotes: 'All unit test suites passing.',
    });

    expect(submittedM1.status).toBe('SUBMITTED');
    expect(submittedM1.reviewDeadline).not.toBeNull();

    // Verify Engine 04 Polling State reflects submission
    const polledState = await StatePoller.pollContractState(contract!.id);
    expect(polledState.milestones[0].status).toBe('SUBMITTED');
    expect(polledState.milestones[0].hasDeliverable).toBe(true);

    // --- STAGE 7: Client reviews and approves Milestone 1 (Engine 03 & 04) ---
    const approvedM1 = await contractManager.approveMilestone({
      milestoneId: m1.id,
      clientId: clientUser.id,
    });
    expect(approvedM1.status).toBe('APPROVED');

    // --- STAGE 8: Atomic Escrow Release for Milestone 1 (Engine 01 Mutex + Engine 03 Ledger) ---
    const releaseLock = await mutex.acquire(m1.id);
    try {
      const releaseReceipt = await ledger.releaseMilestoneEscrow({
        contractId: contract!.id,
        milestoneId: m1.id,
        freelancerId: devUser.id,
        amount: 600.0,
        actorId: clientUser.id,
      });

      expect(releaseReceipt.success).toBe(true);
    } finally {
      releaseLock();
    }

    const devAfterM1 = await prisma.user.findUnique({ where: { id: devUser.id } });
    const contractAfterM1 = await prisma.contract.findUnique({ where: { id: contract!.id } });
    expect(devAfterM1!.balance).toBe(700.0); // 100 + 600
    expect(contractAfterM1!.escrowBalance).toBe(400.0); // 1000 - 600

    // --- STAGE 9: Cryptographic Audit Trail Verification ---
    const auditVerification = await auditLogger.verifyAuditChain();
    expect(auditVerification.isValid).toBe(true);
    expect(auditVerification.tamperedRecordIds).toHaveLength(0);
  });

  it('should handle dispute branch with Merkle evidence tree indexing and binding resolution', async () => {
    // Form contract directly with 1 milestone
    const project = await prisma.project.create({
      data: {
        clientId: clientUser.id,
        title: 'Dispute Branch Project',
        description: 'Testing dispute arbitration',
        budget: 500.0,
        skillTags: '["crypto"]',
      },
    });

    const contract = await prisma.contract.create({
      data: {
        projectId: project.id,
        clientId: clientUser.id,
        freelancerId: devUser.id,
        totalAmount: 500.0,
        escrowBalance: 0.0,
        status: 'AWAITING_DEPOSIT',
      },
    });

    const milestone = await prisma.milestone.create({
      data: {
        contractId: contract.id,
        title: 'Disputed Milestone',
        description: 'Contested work quality',
        amount: 500.0,
        sequenceOrder: 1,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 86400000),
      },
    });

    // Fund escrow
    await ledger.depositEscrow({
      contractId: contract.id,
      clientId: clientUser.id,
      amount: 500.0,
    });

    // Client raises formal dispute
    const dispute = await contractManager.raiseMilestoneDispute({
      milestoneId: milestone.id,
      raisedById: clientUser.id,
      reason: 'Deliverable missing critical automated test reports.',
    });

    expect(dispute.status).toBe('OPEN');

    // Construct hierarchical EvidenceTree (Engine 02)
    const treeManager = new EvidenceTreeManager();
    const root = treeManager.createRoot(dispute.id, 'Contested work quality dispute');
    const clientEvidenceNode = treeManager.addNode(root, {
      id: 'ev-client-1',
      type: EvidenceNodeType.CLAIM,
      title: 'Console log output showing critical errors',
      metadata: { fileUrl: 'https://storage.local/evidence/failing-tests.log' },
      payload: 'Test Suite Failed: 3 errors',
    });

    const devRebuttalNode = treeManager.addNode(clientEvidenceNode, {
      id: 'ev-dev-1',
      type: EvidenceNodeType.CLAIM,
      title: 'Original spec did not mandate end-to-end browser tests',
      metadata: { fileUrl: 'https://storage.local/evidence/spec-doc.pdf' },
      payload: 'Official Specification v1.0',
    });

    treeManager.computeMerkleHashes(root);
    const integrityCheck = treeManager.verifyTreeIntegrity(root);
    expect(integrityCheck.isValid).toBe(true);

    // Independent Reviewer issues binding ruling: REFUND_TO_CLIENT
    const preClientBalance = (await prisma.user.findUnique({ where: { id: clientUser.id } }))!.balance;

    const rulingReceipt = await contractManager.resolveDispute({
      disputeId: dispute.id,
      reviewerId: reviewerUser.id,
      ruling: 'REFUND_TO_CLIENT',
      rulingNotes: 'Work failed to meet acceptance criteria stipulated in project brief.',
    });

    expect(rulingReceipt.success).toBe(true);

    const postClientBalance = (await prisma.user.findUnique({ where: { id: clientUser.id } }))!.balance;
    const finalContract = await prisma.contract.findUnique({ where: { id: contract.id } });

    expect(postClientBalance).toBe(preClientBalance + 500.0);
    expect(finalContract!.escrowBalance).toBe(0.0);
    expect(finalContract!.status).toBe('REFUNDED');
  });
});
