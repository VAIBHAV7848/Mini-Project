import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SessionService } from '@/core/engine-04-web/session';
import { RbacEnforcer } from '@/core/engine-04-web/rbac';
import { fileDisputeSchema } from '@/lib/validation';
import { globalContractManager } from '@/core/engine-03-dbms/contract-manager';
import { formatSuccessResponse, formatErrorResponse, AuthenticationError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const session = await SessionService.getSessionFromHeaders(request.headers);
    if (!session) {
      throw new AuthenticationError('Authentication required.');
    }

    const whereClause: any = {};
    if (session.role === 'CLIENT' || session.role === 'FREELANCER') {
      whereClause.OR = [
        { raisedById: session.userId },
        { milestone: { contract: { clientId: session.userId } } },
        { milestone: { contract: { freelancerId: session.userId } } },
      ];
    }

    const disputes = await prisma.dispute.findMany({
      where: whereClause,
      include: {
        raisedBy: { select: { id: true, name: true, role: true } },
        reviewer: { select: { id: true, name: true } },
        evidenceItems: {
          select: {
            id: true,
            fileUrl: true,
            sha256Checksum: true,
            description: true,
            submittedAt: true,
            submittedBy: { select: { id: true, name: true } },
          },
        },
        milestone: {
          select: {
            id: true,
            title: true,
            amount: true,
            status: true,
            contract: {
              select: {
                id: true,
                status: true,
                totalAmount: true,
                escrowBalance: true,
                client: { select: { id: true, name: true } },
                freelancer: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(formatSuccessResponse(disputes));
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await SessionService.getSessionFromHeaders(request.headers);
    if (!session) {
      throw new AuthenticationError('Authentication required.');
    }
    RbacEnforcer.enforceRole(session, ['CLIENT', 'FREELANCER', 'ADMIN']);

    const rawBody = await request.json();
    const validated = fileDisputeSchema.parse(rawBody);

    const dispute = await globalContractManager.raiseMilestoneDispute({
      milestoneId: validated.milestoneId,
      raisedById: session.userId,
      reason: validated.reason,
    });

    return NextResponse.json(formatSuccessResponse(dispute), { status: 201 });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
