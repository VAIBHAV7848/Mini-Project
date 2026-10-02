import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SessionService } from '@/core/engine-04-web/session';
import { RbacEnforcer } from '@/core/engine-04-web/rbac';
import { StatePoller } from '@/core/engine-04-web/poller';
import { globalKeyedMutex } from '@/core/engine-01-os/mutex';
import { globalEscrowFsm } from '@/core/engine-01-os/escrow-fsm';
import { globalLedgerCoordinator } from '@/core/engine-03-dbms/ledger';
import { globalContractManager } from '@/core/engine-03-dbms/contract-manager';
import { formatSuccessResponse, formatErrorResponse, NotFoundError, ValidationError } from '@/lib/errors';
import { ContractAction, EscrowStatus } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const snapshot = await StatePoller.pollContractState(id);
    return NextResponse.json(formatSuccessResponse(snapshot));
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await params;
    const session = await SessionService.getSessionFromHeaders(request.headers);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundError('Contract', contractId);
    }

    RbacEnforcer.enforceContractAccess(session, contract);

    const body = await request.json();
    const action = body.action as ContractAction;
    const milestoneId = body.milestoneId as string | undefined;

    // Mutex locking on milestone or contract
    const lockKey = milestoneId || contractId;
    const releaseLock = await globalKeyedMutex.acquire(lockKey);

    try {
      switch (action) {
        case 'DEPOSIT': {
          RbacEnforcer.enforceRole(session, ['CLIENT', 'ADMIN']);
          globalEscrowFsm.assertValidTransition(
            contract.status as EscrowStatus,
            'DEPOSIT',
            session.role
          );
          const receipt = await globalLedgerCoordinator.depositEscrow({
            contractId,
            clientId: session.userId,
            amount: contract.totalAmount,
          });
          return NextResponse.json(formatSuccessResponse(receipt));
        }

        case 'START_WORK': {
          if (!milestoneId) throw new ValidationError('milestoneId is required to start work.');
          RbacEnforcer.enforceRole(session, ['FREELANCER', 'ADMIN']);
          const updated = await globalContractManager.startMilestoneWork(milestoneId, session.userId);
          return NextResponse.json(formatSuccessResponse(updated));
        }

        case 'SUBMIT_DELIVERABLE': {
          if (!milestoneId) throw new ValidationError('milestoneId is required to submit deliverable.');
          RbacEnforcer.enforceRole(session, ['FREELANCER', 'ADMIN']);
          const updated = await globalContractManager.submitMilestoneDeliverable({
            milestoneId,
            freelancerId: session.userId,
            fileName: body.fileName || 'deliverable-archive.zip',
            fileUrl: body.fileUrl || 'https://storage.local/deliverable.zip',
            sha256Checksum: body.sha256Checksum || '0'.repeat(64),
            submissionNotes: body.notes,
          });
          return NextResponse.json(formatSuccessResponse(updated));
        }

        case 'APPROVE_MILESTONE': {
          if (!milestoneId) throw new ValidationError('milestoneId is required.');
          RbacEnforcer.enforceRole(session, ['CLIENT', 'ADMIN']);
          const updated = await globalContractManager.approveMilestone({
            milestoneId,
            clientId: session.userId,
          });
          return NextResponse.json(formatSuccessResponse(updated));
        }

        case 'RELEASE_ESCROW': {
          if (!milestoneId) throw new ValidationError('milestoneId is required.');
          RbacEnforcer.enforceRole(session, ['CLIENT', 'ADMIN']);
          const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
          if (!milestone) throw new NotFoundError('Milestone', milestoneId);

          const receipt = await globalLedgerCoordinator.releaseMilestoneEscrow({
            contractId,
            milestoneId,
            freelancerId: contract.freelancerId,
            amount: milestone.amount,
            actorId: session.userId,
          });
          return NextResponse.json(formatSuccessResponse(receipt));
        }

        case 'RAISE_DISPUTE': {
          if (!milestoneId) throw new ValidationError('milestoneId is required.');
          const dispute = await globalContractManager.raiseMilestoneDispute({
            milestoneId,
            raisedById: session.userId,
            reason: body.reason || 'Deliverable failed to fulfill acceptance criteria.',
          });
          return NextResponse.json(formatSuccessResponse(dispute), { status: 201 });
        }

        default:
          throw new ValidationError(`Unsupported contract action: '${action}'.`);
      }
    } finally {
      releaseLock();
    }
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
