import { NextResponse } from 'next/server';
import { SessionService } from '@/core/engine-04-web/session';
import { RbacEnforcer } from '@/core/engine-04-web/rbac';
import { addEvidenceSchema } from '@/lib/validation';
import { globalContractManager } from '@/core/engine-03-dbms/contract-manager';
import { formatSuccessResponse, formatErrorResponse, AuthenticationError } from '@/lib/errors';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: disputeId } = await params;
    const session = await SessionService.getSessionFromHeaders(request.headers);
    if (!session) {
      throw new AuthenticationError('Authentication required.');
    }
    RbacEnforcer.enforceRole(session, ['CLIENT', 'FREELANCER', 'ADMIN']);

    const rawBody = await request.json();
    const validated = addEvidenceSchema.parse(rawBody);

    const evidence = await globalContractManager.addDisputeEvidence({
      disputeId,
      submittedById: session.userId,
      fileUrl: validated.fileUrl,
      sha256Checksum: validated.sha256Checksum,
      description: validated.description,
    });

    return NextResponse.json(formatSuccessResponse(evidence), { status: 201 });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
