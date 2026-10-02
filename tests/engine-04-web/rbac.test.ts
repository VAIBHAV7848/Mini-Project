import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import { RbacEnforcer } from '@/core/engine-04-web/rbac';
import { SessionService } from '@/core/engine-04-web/session';
import { StatePoller } from '@/core/engine-04-web/poller';
import { AuthorizationError, AuthenticationError } from '@/lib/errors';
import { SessionContext } from '@/types';

describe('Engine 04 (Web) — Server-Side RBAC Enforcement (FR-08)', () => {
  const clientSession: SessionContext = {
    userId: 'user-client-1',
    email: 'client1@test.local',
    role: 'CLIENT',
    name: 'Alice Client',
  };

  const devSession: SessionContext = {
    userId: 'user-dev-1',
    email: 'dev1@test.local',
    role: 'FREELANCER',
    name: 'Bob Dev',
  };

  const reviewerSession: SessionContext = {
    userId: 'user-rev-1',
    email: 'reviewer@test.local',
    role: 'REVIEWER',
    name: 'Judge Reviewer',
  };

  it('should allow authorized roles and reject unauthorized roles', () => {
    // Client allowed
    expect(() => RbacEnforcer.enforceRole(clientSession, ['CLIENT', 'ADMIN'])).not.toThrow();

    // Freelancer rejected when CLIENT required
    expect(() => RbacEnforcer.enforceRole(devSession, ['CLIENT'])).toThrow(AuthorizationError);

    // Reviewer allowed for dispute actions
    expect(() => RbacEnforcer.enforceRole(reviewerSession, ['REVIEWER', 'ADMIN'])).not.toThrow();

    // Missing session throws AuthenticationError
    expect(() => RbacEnforcer.enforceRole(null, ['CLIENT'])).toThrow(AuthenticationError);
  });

  it('should restrict contract access to contracted parties and reviewers', () => {
    const contract = {
      clientId: clientSession.userId,
      freelancerId: devSession.userId,
    };

    // Client has access
    expect(() => RbacEnforcer.enforceContractAccess(clientSession, contract)).not.toThrow();

    // Freelancer has access
    expect(() => RbacEnforcer.enforceContractAccess(devSession, contract)).not.toThrow();

    // Reviewer has oversight access
    expect(() => RbacEnforcer.enforceContractAccess(reviewerSession, contract)).not.toThrow();

    // Unrelated 3rd party user is blocked
    const thirdPartySession: SessionContext = {
      userId: 'stranger-danger',
      email: 'stranger@test.local',
      role: 'CLIENT',
      name: 'Intruder',
    };
    expect(() => RbacEnforcer.enforceContractAccess(thirdPartySession, contract)).toThrow(
      AuthorizationError
    );
  });

  it('should correctly evaluate contract action permissions by role', () => {
    expect(RbacEnforcer.canExecuteContractAction('CLIENT', 'DEPOSIT')).toBe(true);
    expect(RbacEnforcer.canExecuteContractAction('FREELANCER', 'DEPOSIT')).toBe(false);

    expect(RbacEnforcer.canExecuteContractAction('FREELANCER', 'SUBMIT_DELIVERABLE')).toBe(true);
    expect(RbacEnforcer.canExecuteContractAction('CLIENT', 'SUBMIT_DELIVERABLE')).toBe(false);

    expect(RbacEnforcer.canExecuteContractAction('REVIEWER', 'RESOLVE_RELEASE')).toBe(true);
    expect(RbacEnforcer.canExecuteContractAction('FREELANCER', 'RESOLVE_RELEASE')).toBe(false);
  });
});

describe('Engine 04 (Web) — Cryptographic Session Management', () => {
  it('should create and verify HMAC signed session tokens', () => {
    const user = {
      id: 'usr-12345',
      email: 'verified@test.local',
      role: 'CLIENT' as const,
      name: 'Verified User',
    };

    const token = SessionService.createToken(user);
    expect(token).toContain('.');

    const session = SessionService.verifyToken(token);
    expect(session).not.toBeNull();
    expect(session!.userId).toBe(user.id);
    expect(session!.role).toBe('CLIENT');
  });

  it('should reject tampered session tokens', () => {
    const user = {
      id: 'usr-12345',
      email: 'verified@test.local',
      role: 'CLIENT' as const,
      name: 'Verified User',
    };

    const token = SessionService.createToken(user);
    const [payload, signature] = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...user, role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 })
    ).toString('base64url');

    const forgedToken = `${tamperedPayload}.${signature}`;
    const session = SessionService.verifyToken(forgedToken);
    expect(session).toBeNull();
  });
});

describe('Engine 04 (Web) — 5-Second Real-Time Polling Engine (FR-10)', () => {
  it('should generate lightweight state snapshot for contract and milestones', async () => {
    const client = await prisma.user.create({
      data: {
        email: `poller-client-${Date.now()}@test.local`,
        passwordHash: 'hash',
        name: 'Poll Client',
        role: 'CLIENT',
        balance: 1000,
      },
    });

    const dev = await prisma.user.create({
      data: {
        email: `poller-dev-${Date.now()}@test.local`,
        passwordHash: 'hash',
        name: 'Poll Dev',
        role: 'FREELANCER',
        balance: 0,
      },
    });

    const project = await prisma.project.create({
      data: {
        clientId: client.id,
        title: 'Poller Project',
        description: 'Test description',
        budget: 300,
        skillTags: '["react"]',
      },
    });

    const contract = await prisma.contract.create({
      data: {
        projectId: project.id,
        clientId: client.id,
        freelancerId: dev.id,
        totalAmount: 300,
        escrowBalance: 300,
        status: 'FUNDED',
      },
    });

    await prisma.milestone.create({
      data: {
        contractId: contract.id,
        title: 'M1',
        description: 'First milestone',
        amount: 300,
        sequenceOrder: 1,
        status: 'FUNDED',
        dueDate: new Date(Date.now() + 86400000),
      },
    });

    const snapshot = await StatePoller.pollContractState(contract.id);

    expect(snapshot.contractId).toBe(contract.id);
    expect(snapshot.status).toBe('FUNDED');
    expect(snapshot.escrowBalance).toBe(300);
    expect(snapshot.milestones).toHaveLength(1);
    expect(snapshot.milestones[0].status).toBe('FUNDED');
    expect(snapshot.milestones[0].hasDeliverable).toBe(false);
  });
});
