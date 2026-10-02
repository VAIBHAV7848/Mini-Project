import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import { ContractManager } from '@/core/engine-03-dbms/contract-manager';
import { LedgerCoordinator } from '@/core/engine-03-dbms/ledger';
import { AuditLogger } from '@/core/engine-03-dbms/audit-logger';
import { InvalidStateTransitionError } from '@/lib/errors';

describe('Engine 01 (OS) & Engine 03 (DBMS) — Contract Lifecycle Orchestration & Milestone Sequencing (FR-12)', () => {
  const contractManager = new ContractManager();
  const ledger = new LedgerCoordinator();
  const auditLogger = new AuditLogger();

  let client: any;
  let freelancer: any;
  let project: any;
  let proposal: any;

  beforeEach(async () => {
    const timestamp = Date.now();

    client = await prisma.user.create({
      data: {
        email: `lifecycle-client-${timestamp}@test.local`,
        passwordHash: 'hashed',
        name: 'Lifecycle Client',
        role: 'CLIENT',
        balance: 3000.0,
      },
    });

    freelancer = await prisma.user.create({
      data: {
        email: `lifecycle-dev-${timestamp}@test.local`,
        passwordHash: 'hashed',
        name: 'Lifecycle Dev',
        role: 'FREELANCER',
        balance: 0.0,
      },
    });

    project = await prisma.project.create({
      data: {
        clientId: client.id,
        title: 'Multi-Milestone Lifecycle Project',
        description: 'Testing sequential milestone dependencies and final completion',
        budget: 1000.0,
        skillTags: '["typescript", "react"]',
      },
    });

    proposal = await prisma.proposal.create({
      data: {
        projectId: project.id,
        freelancerId: freelancer.id,
        bidAmount: 1000.0,
        coverLetter: 'Expert implementation with phased milestones.',
      },
    });
  });

  it('should enforce strict sequential milestone progression and auto-activate subsequent milestones', async () => {
    // 1. Contract formation with 2 sequential milestones
    const contract = await contractManager.createContractFromProposal({
      proposalId: proposal.id,
      actorId: client.id,
      milestones: [
        {
          title: 'Milestone 1: Backend Architecture',
          description: 'Core models and database setup',
          amount: 600.0,
          dueDate: new Date(Date.now() + 5 * 86400000),
        },
        {
          title: 'Milestone 2: Frontend Integration',
          description: 'Responsive user dashboard',
          amount: 400.0,
          dueDate: new Date(Date.now() + 10 * 86400000),
        },
      ],
    });

    expect(contract).toBeDefined();
    if (!contract) throw new Error('Contract creation failed');

    expect(contract.status).toBe('AWAITING_DEPOSIT');
    expect(contract.milestones).toHaveLength(2);

    const m1 = contract.milestones.find((m: any) => m.sequenceOrder === 1);
    const m2 = contract.milestones.find((m: any) => m.sequenceOrder === 2);
    expect(m1).toBeDefined();
    expect(m2).toBeDefined();
    if (!m1 || !m2) throw new Error('Milestones missing');

    expect(m1.status).toBe('PENDING');
    expect(m2.status).toBe('PENDING');

    // 2. Deposit full contract escrow ($1000)
    await ledger.depositEscrow({
      contractId: contract.id,
      clientId: client.id,
      amount: 1000.0,
    });

    // Milestone 1 auto-transitions to FUNDED upon deposit, Milestone 2 remains PENDING
    const m1Funded = await prisma.milestone.findUnique({ where: { id: m1.id } });
    const m2Pending = await prisma.milestone.findUnique({ where: { id: m2.id } });
    expect(m1Funded!.status).toBe('FUNDED');
    expect(m2Pending!.status).toBe('PENDING');

    // 3. Milestone Sequencing Guard (FR-12): Freelancer attempts to start M2 before M1 is completed -> REJECTED
    await expect(contractManager.startMilestoneWork(m2.id, freelancer.id)).rejects.toThrow(
      InvalidStateTransitionError
    );

    // 4. Freelancer starts M1 -> IN_PROGRESS
    await contractManager.startMilestoneWork(m1.id, freelancer.id);
    const m1Working = await prisma.milestone.findUnique({ where: { id: m1.id } });
    expect(m1Working!.status).toBe('IN_PROGRESS');

    // 5. Freelancer submits M1 deliverable
    await contractManager.submitMilestoneDeliverable({
      milestoneId: m1.id,
      freelancerId: freelancer.id,
      fileName: 'm1-deliverable.zip',
      fileUrl: 'https://storage.local/m1.zip',
      sha256Checksum: '1'.repeat(64),
      submissionNotes: 'Backend architecture complete',
    });

    // 6. Client approves and releases M1 ($600)
    await contractManager.approveMilestone({ milestoneId: m1.id, clientId: client.id });
    const m1Receipt = await ledger.releaseMilestoneEscrow({
      contractId: contract.id,
      milestoneId: m1.id,
      freelancerId: freelancer.id,
      amount: 600.0,
      actorId: client.id,
    });
    expect(m1Receipt.success).toBe(true);

    // 7. Verify milestone sequencing auto-activation:
    // Milestone 1 is RELEASED; remaining contract escrow is $400 >= M2 amount ($400); M2 auto-activates to FUNDED!
    const m1Released = await prisma.milestone.findUnique({ where: { id: m1.id } });
    const m2Activated = await prisma.milestone.findUnique({ where: { id: m2.id } });
    expect(m1Released!.status).toBe('RELEASED');
    expect(m2Activated!.status).toBe('FUNDED');

    // Contract must NOT be RELEASED yet because M2 is pending completion
    const contractMidway = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(contractMidway!.status).toBe('FUNDED');
    expect(contractMidway!.escrowBalance).toBe(400.0);

    // 8. Freelancer now executes M2
    await contractManager.startMilestoneWork(m2.id, freelancer.id);
    await contractManager.submitMilestoneDeliverable({
      milestoneId: m2.id,
      freelancerId: freelancer.id,
      fileName: 'm2-deliverable.zip',
      fileUrl: 'https://storage.local/m2.zip',
      sha256Checksum: '2'.repeat(64),
      submissionNotes: 'Frontend integration complete',
    });
    await contractManager.approveMilestone({ milestoneId: m2.id, clientId: client.id });

    // 9. Release M2 ($400)
    const m2Receipt = await ledger.releaseMilestoneEscrow({
      contractId: contract.id,
      milestoneId: m2.id,
      freelancerId: freelancer.id,
      amount: 400.0,
      actorId: client.id,
    });
    expect(m2Receipt.success).toBe(true);

    // 10. All milestones resolved -> Contract automatically completes and marks RELEASED
    const contractCompleted = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(contractCompleted!.status).toBe('RELEASED');
    expect(contractCompleted!.escrowBalance).toBe(0.0);

    // 11. Balance Conservation Invariant: Client balance debited by 1000, Freelancer credited by 1000
    const finalClient = await prisma.user.findUnique({ where: { id: client.id } });
    const finalFreelancer = await prisma.user.findUnique({ where: { id: freelancer.id } });
    expect(finalClient!.balance).toBe(2000.0); // 3000 - 1000
    expect(finalFreelancer!.balance).toBe(1000.0); // 0 + 600 + 400

    // 12. Audit Trail Immutability
    const auditChain = await auditLogger.verifyAuditChain();
    expect(auditChain.isValid).toBe(true);
    expect(auditChain.tamperedRecordIds).toHaveLength(0);
  });
});
