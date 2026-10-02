import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { SessionService } from '@/core/engine-04-web/session';
import { RbacEnforcer } from '@/core/engine-04-web/rbac';
import { globalContractManager } from '@/core/engine-03-dbms/contract-manager';
import { formatSuccessResponse, formatErrorResponse } from '@/lib/errors';

const formContractSchema = z.object({
  proposalId: z.string().uuid(),
  milestones: z
    .array(
      z.object({
        title: z.string().min(3),
        description: z.string().min(5),
        amount: z.number().positive(),
        dueDate: z.string().datetime(),
      })
    )
    .min(1),
});

export async function GET(request: Request) {
  try {
    const session = await SessionService.getSessionFromHeaders(request.headers);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const whereClause: any = {};
    if (session.role === 'CLIENT') {
      whereClause.clientId = session.userId;
    } else if (session.role === 'FREELANCER') {
      whereClause.freelancerId = session.userId;
    }

    const contracts = await prisma.contract.findMany({
      where: whereClause,
      include: {
        project: { select: { title: true, budget: true } },
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } },
        milestones: {
          orderBy: { sequenceOrder: 'asc' },
          select: {
            id: true,
            title: true,
            amount: true,
            status: true,
            sequenceOrder: true,
            reviewDeadline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(formatSuccessResponse(contracts));
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await SessionService.getSessionFromHeaders(request.headers);
    RbacEnforcer.enforceRole(session, ['CLIENT', 'ADMIN']);

    const body = await request.json();
    const validated = formContractSchema.parse(body);

    const contract = await globalContractManager.createContractFromProposal({
      proposalId: validated.proposalId,
      actorId: session!.userId,
      milestones: validated.milestones.map((m) => ({
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: new Date(m.dueDate),
      })),
    });

    return NextResponse.json(formatSuccessResponse(contract), { status: 201 });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
