import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { loginSchema } from '@/lib/validation';
import { SessionService } from '@/core/engine-04-web/session';
import { formatSuccessResponse, formatErrorResponse, AuthenticationError } from '@/lib/errors';
import { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const isValidPassword = bcrypt.compareSync(validated.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const token = SessionService.createToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    });

    const response = NextResponse.json(
      formatSuccessResponse({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          balance: user.balance,
          devScore: user.devScore,
        },
      })
    );

    // Set HTTP-only session cookie
    response.cookies.set('escrow_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
