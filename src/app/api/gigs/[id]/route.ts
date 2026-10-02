import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { formatSuccessResponse, formatErrorResponse, NotFoundError } from '@/lib/errors';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        freelancer: {
          select: { id: true, name: true, devScore: true, githubProfile: true },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!gig) {
      throw new NotFoundError('Gig', id);
    }

    let parsedTiers = [];
    try {
      parsedTiers = JSON.parse(gig.tiers);
    } catch {
      parsedTiers = [];
    }

    return NextResponse.json(
      formatSuccessResponse({
        ...gig,
        tiers: parsedTiers,
      })
    );
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
