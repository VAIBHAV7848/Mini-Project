import crypto from 'node:crypto';
import prisma from '@/lib/db';
import { SessionContext, UserRole } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-key-32-chars-minimum-escrow-session';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  exp: number;
}

export class SessionService {
  /**
   * Generates a tamper-resistant signed HMAC session token.
   */
  static createToken(user: { id: string; email: string; role: UserRole; name: string }, expiresInSeconds = 86400): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');

    return `${encoded}.${signature}`;
  }

  /**
   * Verifies an HMAC signature and decodes the session context.
   */
  static verifyToken(token: string): SessionContext | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return null;

      const [encoded, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(encoded)
        .digest('base64url');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null;
      }

      const decodedStr = Buffer.from(encoded, 'base64url').toString('utf-8');
      const payload: TokenPayload = JSON.parse(decodedStr);

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Expired
      }

      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };
    } catch {
      return null;
    }
  }

  /**
   * Resolves SessionContext from standard HTTP headers or development simulation headers.
   */
  static async getSessionFromHeaders(headers: Headers): Promise<SessionContext | null> {
    // 1. Check Bearer Authorization Header
    const authHeader = headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = SessionService.verifyToken(token);
      if (session) return session;
    }

    // 2. Check Cookie Header
    const cookieHeader = headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/escrow_session=([^;]+)/);
      if (match) {
        const session = SessionService.verifyToken(match[1]);
        if (session) return session;
      }
    }

    // 3. Simulated direct test headers (for automated test runners & curl testing)
    const simulatedUserId = headers.get('x-user-id');
    if (simulatedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: simulatedUserId },
      });
      if (user) {
        return {
          userId: user.id,
          email: user.email,
          role: user.role as UserRole,
          name: user.name,
        };
      }
    }

    return null;
  }
}
