import prisma from '@/lib/db';
import { AuditLogger, globalAuditLogger } from '@/core/engine-03-dbms/audit-logger';
import {
  InsufficientFundsError,
  DoubleAllocationError,
  NotFoundError,
  InvalidStateTransitionError,
} from '@/lib/errors';

export interface DepositEscrowInput {
  contractId: string;
  clientId: string;
  amount: number;
}

export interface ReleaseEscrowInput {
  contractId: string;
  milestoneId: string;
  freelancerId: string;
  amount: number;
  actorId: string;
}

export interface RefundEscrowInput {
  contractId: string;
  milestoneId?: string;
  clientId: string;
  amount: number;
  actorId: string;
  reason?: string;
}

export interface TransactionReceipt {
  success: boolean;
  transactionId: string;
  contractId: string;
  amount: number;
  type: 'DEPOSIT' | 'RELEASE' | 'REFUND';
  timestamp: Date;
}

export class LedgerCoordinator {
  private auditLogger: AuditLogger;

  constructor(auditLogger: AuditLogger = globalAuditLogger) {
    this.auditLogger = auditLogger;
  }

  /**
   * Atomic Escrow Deposit:
   * Debits client balance and credits contract escrow_balance within a single ACID transaction.
   * Mathematical invariant: Delta Client (-amount) + Delta Escrow (+amount) = 0.
   */
  async depositEscrow(input: DepositEscrowInput): Promise<TransactionReceipt> {
    return await prisma.$transaction(async (tx) => {
      // 1. Read & validate client balance
      const client = await tx.user.findUnique({
        where: { id: input.clientId },
      });

      if (!client) {
        throw new NotFoundError('User', input.clientId);
      }

      if (client.balance < input.amount) {
        throw new InsufficientFundsError(client.balance, input.amount);
      }

      // 2. Read & validate contract state
      const contract = await tx.contract.findUnique({
        where: { id: input.contractId },
      });

      if (!contract) {
        throw new NotFoundError('Contract', input.contractId);
      }

      if (contract.status === 'FUNDED' || contract.escrowBalance > 0) {
        throw new DoubleAllocationError(input.contractId);
      }

      if (contract.status !== 'AWAITING_DEPOSIT') {
        throw new InvalidStateTransitionError(
          contract.status,
          'DEPOSIT',
          `Cannot deposit to contract with status '${contract.status}'.`
        );
      }

      // 3. Debit client balance
      await tx.user.update({
        where: { id: input.clientId },
        data: {
          balance: { decrement: input.amount },
        },
      });

      // 4. Credit contract escrow balance and transition status
      await tx.contract.update({
        where: { id: input.contractId },
        data: {
          escrowBalance: { increment: input.amount },
          status: 'FUNDED',
        },
      });

      // 5. Update first milestone if in PENDING state
      await tx.milestone.updateMany({
        where: {
          contractId: input.contractId,
          sequenceOrder: 1,
          status: 'PENDING',
        },
        data: {
          status: 'FUNDED',
        },
      });

      // 6. Record transaction in ledger
      const txRecord = await tx.escrowTransaction.create({
        data: {
          contractId: input.contractId,
          fromUserId: input.clientId,
          toUserId: null,
          amount: input.amount,
          type: 'DEPOSIT',
          status: 'COMPLETED',
        },
      });

      // 7. Chained audit logging
      await this.auditLogger.logAction(
        {
          actorId: input.clientId,
          entityName: 'Contract',
          entityId: input.contractId,
          action: 'DEPOSIT_ESCROW',
          previousState: 'AWAITING_DEPOSIT',
          newState: 'FUNDED',
        },
        tx
      );

      return {
        success: true,
        transactionId: txRecord.id,
        contractId: input.contractId,
        amount: input.amount,
        type: 'DEPOSIT',
        timestamp: txRecord.createdAt,
      };
    });
  }

  /**
   * Atomic Escrow Release:
   * Debits contract escrow_balance and credits freelancer balance within a single ACID transaction.
   * Mathematical invariant: Delta Escrow (-amount) + Delta Freelancer (+amount) = 0.
   */
  async releaseMilestoneEscrow(input: ReleaseEscrowInput): Promise<TransactionReceipt> {
    return await prisma.$transaction(async (tx) => {
      // 1. Read & validate contract escrow funds
      const contract = await tx.contract.findUnique({
        where: { id: input.contractId },
        include: { milestones: true },
      });

      if (!contract) {
        throw new NotFoundError('Contract', input.contractId);
      }

      if (contract.escrowBalance < input.amount) {
        throw new InsufficientFundsError(contract.escrowBalance, input.amount);
      }

      // 2. Read & validate milestone state
      const milestone = await tx.milestone.findUnique({
        where: { id: input.milestoneId },
      });

      if (!milestone) {
        throw new NotFoundError('Milestone', input.milestoneId);
      }

      if (milestone.status !== 'APPROVED' && milestone.status !== 'DISPUTED') {
        throw new InvalidStateTransitionError(
          milestone.status,
          'RELEASE_ESCROW',
          `Cannot release escrow for milestone with status '${milestone.status}'. Must be APPROVED or DISPUTED.`
        );
      }

      // 3. Debit contract escrow balance
      const updatedContract = await tx.contract.update({
        where: { id: input.contractId },
        data: {
          escrowBalance: { decrement: input.amount },
        },
      });

      // 4. Credit freelancer balance
      await tx.user.update({
        where: { id: input.freelancerId },
        data: {
          balance: { increment: input.amount },
        },
      });

      // 5. Update milestone state to RELEASED
      await tx.milestone.update({
        where: { id: input.milestoneId },
        data: {
          status: 'RELEASED',
        },
      });

      // 6. Check contract overall status
      const allMilestones = await tx.milestone.findMany({
        where: { contractId: input.contractId },
      });
      const allResolved = allMilestones.every(
        (m) => m.id === input.milestoneId || m.status === 'RELEASED' || m.status === 'REFUNDED'
      );

      if (allResolved || updatedContract.escrowBalance <= 0) {
        await tx.contract.update({
          where: { id: input.contractId },
          data: { status: 'RELEASED' },
        });
      }

      // 7. Record transaction in ledger
      const txRecord = await tx.escrowTransaction.create({
        data: {
          contractId: input.contractId,
          milestoneId: input.milestoneId,
          fromUserId: null,
          toUserId: input.freelancerId,
          amount: input.amount,
          type: 'RELEASE',
          status: 'COMPLETED',
        },
      });

      // 8. Chained audit logging
      await this.auditLogger.logAction(
        {
          actorId: input.actorId,
          entityName: 'Milestone',
          entityId: input.milestoneId,
          action: 'RELEASE_ESCROW',
          previousState: milestone.status,
          newState: 'RELEASED',
        },
        tx
      );

      return {
        success: true,
        transactionId: txRecord.id,
        contractId: input.contractId,
        amount: input.amount,
        type: 'RELEASE',
        timestamp: txRecord.createdAt,
      };
    });
  }

  /**
   * Atomic Escrow Refund:
   * Debits contract escrow_balance and credits client balance within a single ACID transaction.
   * Mathematical invariant: Delta Escrow (-amount) + Delta Client (+amount) = 0.
   */
  async refundMilestoneEscrow(input: RefundEscrowInput): Promise<TransactionReceipt> {
    return await prisma.$transaction(async (tx) => {
      // 1. Read & validate contract escrow funds
      const contract = await tx.contract.findUnique({
        where: { id: input.contractId },
      });

      if (!contract) {
        throw new NotFoundError('Contract', input.contractId);
      }

      if (contract.escrowBalance < input.amount) {
        throw new InsufficientFundsError(contract.escrowBalance, input.amount);
      }

      // 2. Debit contract escrow balance
      const updatedContract = await tx.contract.update({
        where: { id: input.contractId },
        data: {
          escrowBalance: { decrement: input.amount },
        },
      });

      // 3. Credit client balance
      await tx.user.update({
        where: { id: input.clientId },
        data: {
          balance: { increment: input.amount },
        },
      });

      // 4. Update milestone state if specified
      if (input.milestoneId) {
        const milestone = await tx.milestone.findUnique({
          where: { id: input.milestoneId },
        });

        if (milestone) {
          await tx.milestone.update({
            where: { id: input.milestoneId },
            data: { status: 'REFUNDED' },
          });

          await this.auditLogger.logAction(
            {
              actorId: input.actorId,
              entityName: 'Milestone',
              entityId: input.milestoneId,
              action: 'REFUND_ESCROW',
              previousState: milestone.status,
              newState: 'REFUNDED',
            },
            tx
          );
        }
      }

      // 5. Update contract status if fully refunded
      if (updatedContract.escrowBalance <= 0) {
        await tx.contract.update({
          where: { id: input.contractId },
          data: { status: 'REFUNDED' },
        });
      }

      // 6. Record transaction in ledger
      const txRecord = await tx.escrowTransaction.create({
        data: {
          contractId: input.contractId,
          milestoneId: input.milestoneId ?? null,
          fromUserId: null,
          toUserId: input.clientId,
          amount: input.amount,
          type: 'REFUND',
          status: 'COMPLETED',
        },
      });

      // 7. Chained audit logging
      await this.auditLogger.logAction(
        {
          actorId: input.actorId,
          entityName: 'Contract',
          entityId: input.contractId,
          action: 'REFUND_ESCROW',
          previousState: contract.status,
          newState: 'REFUNDED',
        },
        tx
      );

      return {
        success: true,
        transactionId: txRecord.id,
        contractId: input.contractId,
        amount: input.amount,
        type: 'REFUND',
        timestamp: txRecord.createdAt,
      };
    });
  }
}

export const globalLedgerCoordinator = new LedgerCoordinator();
