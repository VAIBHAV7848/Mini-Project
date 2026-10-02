import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import { LedgerCoordinator } from '@/core/engine-03-dbms/ledger';
import { ContractManager } from '@/core/engine-03-dbms/contract-manager';
import { AuditLogger } from '@/core/engine-03-dbms/audit-logger';
import { KeyedMutex } from '@/core/engine-01-os/mutex';
import { InsufficientFundsError, DoubleAllocationError, InvalidStateTransitionError } from '@/lib/errors';

describe('Engine 03 (DBMS) & Engine 01 (OS) — Adversarial Concurrency & Transaction Boundary Tests', () => {
  const auditLogger = new AuditLogger();
  const ledger = new LedgerCoordinator(auditLogger);
  const contractManager = new ContractManager(auditLogger, ledger);
  const mutex = new KeyedMutex();

  let client: any;
  let freelancer: any;
  let project: any;
  let contract: any;
  let milestone: any;

  beforeEach(async () => {
    client = await prisma.user.create({
      data: {
        email: `adv-client-${Date.now()}-${Math.random()}@test.local`,
        passwordHash: 'hash',
        name: 'Adversarial Client',
        role: 'CLIENT',
        balance: 2000.0,
      },
    });

    freelancer = await prisma.user.create({
      data: {
        email: `adv-dev-${Date.now()}-${Math.random()}@test.local`,
        passwordHash: 'hash',
        name: 'Adversarial Dev',
        role: 'FREELANCER',
        balance: 500.0,
      },
    });

    project = await prisma.project.create({
      data: {
        clientId: client.id,
        title: 'Adversarial Concurrency Project',
        description: 'Simulating race conditions and rollback scenarios',
        budget: 1000.0,
        skillTags: '["concurrency", "acid"]',
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
        title: 'Concurrent Milestone',
        description: 'High-concurrency test milestone',
        amount: 1000.0,
        sequenceOrder: 1,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 86400000),
      },
    });
  });

  it('should prevent double-deposit race condition when two deposit requests arrive simultaneously', async () => {
    const initialClientBalance = client.balance;

    // Fire two simultaneous deposit attempts
    const [res1, res2] = await Promise.allSettled([
      ledger.depositEscrow({
        contractId: contract.id,
        clientId: client.id,
        amount: 1000.0,
      }),
      ledger.depositEscrow({
        contractId: contract.id,
        clientId: client.id,
        amount: 1000.0,
      }),
    ]);

    // Exactly one should succeed and one must fail
    const successes = [res1, res2].filter((r) => r.status === 'fulfilled');
    const failures = [res1, res2].filter((r) => r.status === 'rejected');

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);

    // Verify balance conservation
    const updatedClient = await prisma.user.findUnique({ where: { id: client.id } });
    const updatedContract = await prisma.contract.findUnique({ where: { id: contract.id } });

    expect(updatedClient!.balance).toBe(initialClientBalance - 1000.0);
    expect(updatedContract!.escrowBalance).toBe(1000.0);
    expect(updatedContract!.status).toBe('FUNDED');

    // Mathematical conservation check: Delta Client + Delta Escrow = 0
    expect((updatedClient!.balance - initialClientBalance) + updatedContract!.escrowBalance).toBe(0.0);

    // Verify exactly one deposit transaction record was created
    const txRecords = await prisma.escrowTransaction.findMany({
      where: { contractId: contract.id, type: 'DEPOSIT' },
    });
    expect(txRecords).toHaveLength(1);
  });

  it('should prevent double-release race condition when two release calls execute concurrently', async () => {
    // 1. Fund escrow first
    await ledger.depositEscrow({
      contractId: contract.id,
      clientId: client.id,
      amount: 1000.0,
    });

    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: 'APPROVED' },
    });

    const preDevBalance = freelancer.balance;

    // 2. Fire two concurrent release calls
    const [res1, res2] = await Promise.allSettled([
      ledger.releaseMilestoneEscrow({
        contractId: contract.id,
        milestoneId: milestone.id,
        freelancerId: freelancer.id,
        amount: 1000.0,
        actorId: client.id,
      }),
      ledger.releaseMilestoneEscrow({
        contractId: contract.id,
        milestoneId: milestone.id,
        freelancerId: freelancer.id,
        amount: 1000.0,
        actorId: client.id,
      }),
    ]);

    const successes = [res1, res2].filter((r) => r.status === 'fulfilled');
    const failures = [res1, res2].filter((r) => r.status === 'rejected');

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);

    const postDev = await prisma.user.findUnique({ where: { id: freelancer.id } });
    const postContract = await prisma.contract.findUnique({ where: { id: contract.id } });

    // Freelancer received exactly 1000, not 2000
    expect(postDev!.balance).toBe(preDevBalance + 1000.0);
    expect(postContract!.escrowBalance).toBe(0.0);

    // Delta Escrow (-1000) + Delta Dev (+1000) = 0
    expect((postContract!.escrowBalance - 1000.0) + (postDev!.balance - preDevBalance)).toBe(0.0);
  });

  it('should reject simultaneous release and dispute race, ensuring consistent state', async () => {
    // 1. Fund escrow
    await ledger.depositEscrow({
      contractId: contract.id,
      clientId: client.id,
      amount: 1000.0,
    });

    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: 'APPROVED' },
    });

    // 2. Attempt simultaneous release and dispute
    const [releaseRes, disputeRes] = await Promise.allSettled([
      ledger.releaseMilestoneEscrow({
        contractId: contract.id,
        milestoneId: milestone.id,
        freelancerId: freelancer.id,
        amount: 1000.0,
        actorId: client.id,
      }),
      contractManager.raiseMilestoneDispute({
        milestoneId: milestone.id,
        raisedById: client.id,
        reason: 'Work disputed at the last minute',
      }),
    ]);

    // Either release succeeded and milestone is RELEASED, or dispute succeeded and milestone is DISPUTED
    const finalMilestone = await prisma.milestone.findUnique({ where: { id: milestone.id } });
    expect(['RELEASED', 'DISPUTED']).toContain(finalMilestone!.status);

    const finalContract = await prisma.contract.findUnique({ where: { id: contract.id } });
    if (finalMilestone!.status === 'RELEASED') {
      expect(finalContract!.escrowBalance).toBe(0.0);
    } else {
      expect(finalContract!.escrowBalance).toBe(1000.0);
    }
  });

  it('should completely rollback all mutations if an error occurs midway through a transaction', async () => {
    const preClientBalance = client.balance;
    const preContractEscrow = contract.escrowBalance;

    // Simulate an aborted custom transaction that updates client balance but throws before commit
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: client.id },
          data: { balance: { decrement: 500.0 } },
        });

        // Intentional mid-flight crash
        throw new Error('SIMULATED_DATABASE_IO_ERROR_DURING_MUTATION');
      })
    ).rejects.toThrow('SIMULATED_DATABASE_IO_ERROR_DURING_MUTATION');

    // Assert that client balance was NOT debited (zero partial state mutation)
    const clientAfterCrash = await prisma.user.findUnique({ where: { id: client.id } });
    const contractAfterCrash = await prisma.contract.findUnique({ where: { id: contract.id } });

    expect(clientAfterCrash!.balance).toBe(preClientBalance);
    expect(contractAfterCrash!.escrowBalance).toBe(preContractEscrow);
  });
});
