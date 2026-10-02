import { NextResponse } from 'next/server';
import { SessionService } from '@/core/engine-04-web/session';
import { RbacEnforcer } from '@/core/engine-04-web/rbac';
import { disputeRulingSchema } from '@/lib/validation';
import { globalContractManager } from '@/core/engine-03-dbms/contract-manager';
import { formatSuccessResponse, formatErrorResponse } from '@/lib/errors';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: disputeId } = await params;
    const session = await SessionService.getSessionFromHeaders(request.headers);
    RbacEnforcer.enforceRole(session, ['REVIEWER', 'ADMIN']);

    const rawBody = await request.json();
    const validated = disputeRulingSchema.parse(rawBody);

    const result = await globalContractManager.resolveDispute({
      disputeId,
      reviewerId: session!.userId,
      ruling: validated.ruling,
      rulingNotes: validated.rulingNotes,
    });

    return NextResponse.json(formatSuccessResponse(result));
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
