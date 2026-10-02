import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SessionService } from '@/core/engine-04-web/session';
import { RbacEnforcer } from '@/core/engine-04-web/rbac';
import { globalAuditLogger } from '@/core/engine-03-dbms/audit-logger';
import { formatSuccessResponse, formatErrorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const session = await SessionService.getSessionFromHeaders(request.headers);
    RbacEnforcer.enforceRole(session, ['ADMIN', 'REVIEWER']);

    const [logs, integrity] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100,
      }),
      globalAuditLogger.verifyAuditChain(),
    ]);

    return NextResponse.json(
      formatSuccessResponse({
        integrity,
        totalRecords: logs.length,
        logs,
      })
    );
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
