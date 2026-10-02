import { NextResponse } from 'next/server';
import { SessionService } from '@/core/engine-04-web/session';
import { RbacEnforcer } from '@/core/engine-04-web/rbac';
import { globalContractManager } from '@/core/engine-03-dbms/contract-manager';
import { formatSuccessResponse, formatErrorResponse, AuthenticationError, AuthorizationError } from '@/lib/errors';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: disputeId } = await params;
    const session = await SessionService.getSessionFromHeaders(request.headers);
    if (!session) {
      throw new AuthenticationError('Authentication required.');
    }

    const disputeData = await globalContractManager.getDisputeWithEvidenceTree(disputeId);

    // Authorization: Client, Freelancer, Reviewer, or Admin
    const contract = disputeData.dispute.milestone.contract;
    const isParty = contract.client.id === session.userId || contract.freelancer.id === session.userId;
    const isReviewerOrAdmin = session.role === 'REVIEWER' || session.role === 'ADMIN';

    if (!isParty && !isReviewerOrAdmin) {
      throw new AuthorizationError('You do not have permission to view this dispute.');
    }

    return NextResponse.json(formatSuccessResponse(disputeData));
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
