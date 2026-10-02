import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import { LedgerCoordinator } from '@/core/engine-03-dbms/ledger';
import { AuditLogger } from '@/core/engine-03-dbms/audit-logger';
import { InsufficientFundsError, DoubleAllocationError } from '@/lib/errors';

describe('Engine 03 (DBMS) — ACID Ledger Coordinator & Balance Conservation', () => {
  const ledger = new LedgerCoordinator();

  let testClient: { id: string; balance: number };
  let testFreelancer: { id: string; balance: number };
  let testProject: { id: string };
  let testContract: { id: string; totalAmount: number };
  let testMilestone: { id: string; amount: number };

  beforeEach(async () => {
    // Create clean test user accounts
    testClient = await prisma.user.create({
      data: {
        email: `test-client-${Date.now()}@test.local`,
        passwordHash: 'hashed',
        name: 'Test Client',
        role: 'CLIENT',
        balance: 1000.0,
      },
    });

    testFreelancer = await prisma.user.create({
      data: {
        email: `test-dev-${Date.now()}@test.local`,
        passwordHash: 'hashed',
        name: 'Test Dev',
        role: 'FREELANCER',
        balance: 100.0,
      },
    });

    testProject = await prisma.project.create({
      data: {
        clientId: testClient.id,
        title: 'Ledger Test Project',
        description: 'Testing ACID escrow balance transactions.',
        budget: 500.0,
        skillTags: JSON.stringify(['typescript', 'sqlite']),
        status: 'OPEN',
      },
    });

    testContract = await prisma.contract.create({
      data: {
        projectId: testProject.id,
        clientId: testClient.id,
        freelancerId: testFreelancer.id,
        totalAmount: 500.0,
        escrowBalance: 0.0,
        status: 'AWAITING_DEPOSIT',
      },
    });

    testMilestone = await prisma.milestone.create({
      data: {
        contractId: testContract.id,
        title: 'Milestone 1',
        description: 'First deliverable',
        amount: 500.0,
        sequenceOrder: 1,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 86400000),
      },
    });
  });

  it('should execute atomic deposit, debiting client and crediting escrow with net zero drift', async () => {
    const preClientBalance = testClient.balance;

    const receipt = await ledger.depositEscrow({
      contractId: testContract.id,
      clientId: testClient.id,
      amount: 500.0,
    });

    expect(receipt.success).toBe(true);

    const updatedClient = await prisma.user.findUnique({ where: { id: testClient.id } });
    const updatedContract = await prisma.contract.findUnique({ where: { id: testContract.id } });

    expect(updatedClient!.balance).toBe(preClientBalance - 500.0);
    expect(updatedContract!.escrowBalance).toBe(500.0);
    expect(updatedContract!.status).toBe('FUNDED');

    // Mathematical balance conservation assertion: Delta Client + Delta Escrow = 0
    const deltaClient = updatedClient!.balance - preClientBalance;
    const deltaEscrow = updatedContract!.escrowBalance - 0.0;
    expect(deltaClient + deltaEscrow).toBe(0.0);
  });

  it('should reject deposit if client has insufficient balance', async () => {
    // Attempt to deposit 5,000 when client only has 1,000
    await expect(
      ledger.depositEscrow({
        contractId: testContract.id,
        clientId: testClient.id,
        amount: 5000.0,
      })
    ).rejects.toThrow(InsufficientFundsError);

    const contract = await prisma.contract.findUnique({ where: { id: testContract.id } });
    expect(contract!.status).toBe('AWAITING_DEPOSIT');
    expect(contract!.escrowBalance).toBe(0.0);
  });

  it('should prevent double funding of an already funded contract', async () => {
    await ledger.depositEscrow({
      contractId: testContract.id,
      clientId: testClient.id,
      amount: 500.0,
    });

    // Second deposit attempt must be rejected
    await expect(
      ledger.depositEscrow({
        contractId: testContract.id,
        clientId: testClient.id,
        amount: 500.0,
      })
    ).rejects.toThrow(DoubleAllocationError);
  });

  it('should execute atomic escrow release to freelancer with net zero drift', async () => {
    // 1. Fund escrow first
    await ledger.depositEscrow({
      contractId: testContract.id,
      clientId: testClient.id,
      amount: 500.0,
    });

    // Set milestone to APPROVED
    await prisma.milestone.update({
      where: { id: testMilestone.id },
      data: { status: 'APPROVED' },
    });

    const preDevBalance = testFreelancer.balance;

    // 2. Release escrow
    const releaseReceipt = await ledger.releaseMilestoneEscrow({
      contractId: testContract.id,
      milestoneId: testMilestone.id,
      freelancerId: testFreelancer.id,
      amount: 500.0,
      actorId: testClient.id,
    });

    expect(releaseReceipt.success).toBe(true);

    const updatedDev = await prisma.user.findUnique({ where: { id: testFreelancer.id } });
    const updatedContract = await prisma.contract.findUnique({ where: { id: testContract.id } });
    const updatedMilestone = await prisma.milestone.findUnique({ where: { id: testMilestone.id } });

    expect(updatedDev!.balance).toBe(preDevBalance + 500.0);
    expect(updatedContract!.escrowBalance).toBe(0.0);
    expect(updatedMilestone!.status).toBe('RELEASED');
    expect(updatedContract!.status).toBe('RELEASED');

    // Conservation check: Delta Escrow (-500) + Delta Dev (+500) = 0
    const deltaEscrow = updatedContract!.escrowBalance - 500.0;
    const deltaDev = updatedDev!.balance - preDevBalance;
    expect(deltaEscrow + deltaDev).toBe(0.0);
  });
});

describe('Engine 03 (DBMS) — Append-Only Cryptographic Audit Logger', () => {
  const auditLogger = new AuditLogger();

  it('should append audit records with chained cryptographic SHA-256 hashes', async () => {
    const entityId = `entity-${Date.now()}`;

    const record1 = await auditLogger.logAction({
      actorId: 'user-1',
      entityName: 'Contract',
      entityId,
      action: 'DEPOSIT_ESCROW',
      previousState: 'AWAITING_DEPOSIT',
      newState: 'FUNDED',
    });

    const record2 = await auditLogger.logAction({
      actorId: 'user-2',
      entityName: 'Milestone',
      entityId,
      action: 'SUBMIT_DELIVERABLE',
      previousState: 'IN_PROGRESS',
      newState: 'SUBMITTED',
    });

    expect(record1.verificationHash).toHaveLength(64);
    expect(record2.verificationHash).toHaveLength(64);
    expect(record2.prevHash).toBe(record1.verificationHash);
  });

  it('should successfully verify the cryptographic integrity of the audit chain', async () => {
    const verification = await auditLogger.verifyAuditChain();
    expect(verification.isValid).toBe(true);
    expect(verification.tamperedRecordIds).toHaveLength(0);
    expect(verification.totalVerified).toBeGreaterThan(0);
  });
});
