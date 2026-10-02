import prisma from '@/lib/db';
import { globalEscrowFsm } from './escrow-fsm';
import { globalKeyedMutex } from './mutex';
import { logger } from '@/lib/logger';

export interface WatchdogTimeoutResult {
  milestoneId: string;
  contractId: string;
  autoApproved: boolean;
  error?: string;
}

export class WatchdogScheduler {
  async processOverdueMilestones(now = new Date()): Promise<WatchdogTimeoutResult[]> {
    const overdueMilestones = await prisma.milestone.findMany({
      where: {
        status: 'UNDER_REVIEW',
        reviewDeadline: {
          lte: now,
        },
      },
      include: {
        contract: true,
      },
    });

    const results: WatchdogTimeoutResult[] = [];

    for (const milestone of overdueMilestones) {
      const releaseLock = await globalKeyedMutex.acquire(milestone.id);

      try {
        // Re-check milestone status inside mutex critical section (prevent TOCTOU)
        const freshMilestone = await prisma.milestone.findUnique({
          where: { id: milestone.id },
          include: { contract: true },
        });

        if (!freshMilestone || freshMilestone.status !== 'UNDER_REVIEW') {
          continue;
        }

        // Validate FSM transition legality for watchdog auto-approval
        const nextState = globalEscrowFsm.assertValidTransition(
          'UNDER_REVIEW',
          'TIMEOUT_WATCHDOG',
          'SYSTEM'
        );

        // Atomic milestone transition and audit log insertion
        await prisma.$transaction(async (tx) => {
          await tx.milestone.update({
            where: { id: freshMilestone.id },
            data: {
              status: nextState,
              updatedAt: new Date(),
            },
          });

          await tx.auditLog.create({
            data: {
              actorId: 'SYSTEM_WATCHDOG',
              entityName: 'Milestone',
              entityId: freshMilestone.id,
              action: 'WATCHDOG_TIMEOUT_AUTO_APPROVAL',
              previousState: 'UNDER_REVIEW',
              newState: nextState,
              prevHash: 'GENESIS',
              verificationHash: 'watchdog_auto_approval_sha256_placeholder',
            },
          });
        });

        logger.info('Watchdog auto-approved milestone due to review timeout expiration', {
          service: 'engine-01-os',
          milestoneId: freshMilestone.id,
          contractId: freshMilestone.contractId,
        });

        results.push({
          milestoneId: freshMilestone.id,
          contractId: freshMilestone.contractId,
          autoApproved: true,
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error('Failed to auto-approve overdue milestone', {
          service: 'engine-01-os',
          milestoneId: milestone.id,
          error: errorMsg,
        });
        results.push({
          milestoneId: milestone.id,
          contractId: milestone.contractId,
          autoApproved: false,
          error: errorMsg,
        });
      } finally {
        releaseLock();
      }
    }

    return results;
  }
}

export const globalWatchdog = new WatchdogScheduler();
