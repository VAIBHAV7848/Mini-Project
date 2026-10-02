import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SessionService } from '@/core/engine-04-web/session';
import { formatSuccessResponse, formatErrorResponse, AuthenticationError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const session = await SessionService.getSessionFromHeaders(request.headers);
    if (!session) {
      throw new AuthenticationError('Active session required.');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        balance: true,
        devScore: true,
        githubProfile: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('User account not found.');
    }

    return NextResponse.json(formatSuccessResponse(user));
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
