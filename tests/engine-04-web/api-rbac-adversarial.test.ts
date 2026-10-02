import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as createProjectHandler } from '@/app/api/projects/route';
import { POST as submitProposalHandler } from '@/app/api/proposals/route';
import { POST as milestoneActionHandler } from '@/app/api/contracts/[id]/milestones/route';
import { GET as auditLogsHandler } from '@/app/api/audit-logs/route';
import { POST as disputeRulingHandler } from '@/app/api/disputes/[id]/ruling/route';

describe('Engine 04 (Web) — Adversarial API RBAC & Security Boundary Audit', () => {
  let clientUser: any;
  let intruderClient: any;
  let devUser: any;
  let reviewerUser: any;
  let testProject: any;
  let testContract: any;
  let testMilestone: any;

  beforeEach(async () => {
    const passwordHash = bcrypt.hashSync('Password123!', 8);

    clientUser = await prisma.user.create({
      data: {
        email: `api-client-${Date.now()}@test.local`,
        passwordHash,
        name: 'Contracted Client',
        role: 'CLIENT',
        balance: 5000.0,
      },
    });

    intruderClient = await prisma.user.create({
      data: {
        email: `api-intruder-${Date.now()}@test.local`,
        passwordHash,
        name: 'Intruder Client',
        role: 'CLIENT',
        balance: 5000.0,
      },
    });

    devUser = await prisma.user.create({
      data: {
        email: `api-dev-${Date.now()}@test.local`,
        passwordHash,
        name: 'Contracted Dev',
        role: 'FREELANCER',
        balance: 100.0,
      },
    });

    reviewerUser = await prisma.user.create({
      data: {
        email: `api-rev-${Date.now()}@test.local`,
        passwordHash,
        name: 'Dispute Reviewer',
        role: 'REVIEWER',
        balance: 0.0,
      },
    });

    testProject = await prisma.project.create({
      data: {
        clientId: clientUser.id,
        title: 'RBAC Security Project',
        description: 'Testing strict endpoint authorization boundaries',
        budget: 1000.0,
        skillTags: '["security", "nextjs"]',
      },
    });

    testContract = await prisma.contract.create({
      data: {
        projectId: testProject.id,
        clientId: clientUser.id,
        freelancerId: devUser.id,
        totalAmount: 1000.0,
        escrowBalance: 0.0,
        status: 'AWAITING_DEPOSIT',
      },
    });

    testMilestone = await prisma.milestone.create({
      data: {
        contractId: testContract.id,
        title: 'M1 Security Audit',
        description: 'Auditing API permissions',
        amount: 1000.0,
        sequenceOrder: 1,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 86400000),
      },
    });
  });

  it('POST /api/auth/login should authenticate valid credentials and reject invalid credentials with 401', async () => {
    // 1. Valid login
    const validReq = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: clientUser.email,
        password: 'Password123!',
      }),
    });
    const validRes = await loginHandler(validReq);
    expect(validRes.status).toBe(200);
    const validBody = await validRes.json();
    expect(validBody.success).toBe(true);
    expect(validBody.data.token).toBeDefined();

    // 2. Wrong password -> 401
    const invalidReq = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: clientUser.email,
        password: 'WrongPassword!',
      }),
    });
    const invalidRes = await loginHandler(invalidReq);
    expect(invalidRes.status).toBe(401);
  });

  it('POST /api/projects should enforce CLIENT role and reject FREELANCER with 403', async () => {
    // Freelancer attempts project creation
    const devReq = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': devUser.id,
      },
      body: JSON.stringify({
        title: 'Unauthorized Project Creation',
        description: 'Freelancers must not be allowed to post projects.',
        budget: 500.0,
        skillTags: ['typescript'],
      }),
    });

    const devRes = await createProjectHandler(devReq);
    expect(devRes.status).toBe(403);
    const body = await devRes.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('POST /api/projects should reject invalid request payloads with 400 VALIDATION_FAILED', async () => {
    const invalidReq = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': clientUser.id,
      },
      body: JSON.stringify({
        title: 'Tiny', // Too short (min 5)
        description: 'Short', // Too short (min 20)
        budget: -100, // Negative budget
        skillTags: [], // Empty tags
      }),
    });

    const res = await createProjectHandler(invalidReq);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_FAILED');
    expect(body.error.details).toBeDefined();
  });

  it('POST /api/proposals should enforce FREELANCER role and reject CLIENT with 403', async () => {
    // Client attempts to bid on project
    const clientReq = new Request('http://localhost/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': clientUser.id,
      },
      body: JSON.stringify({
        projectId: testProject.id,
        bidAmount: 1000.0,
        coverLetter: 'Clients should not be allowed to bid on projects.',
      }),
    });

    const res = await submitProposalHandler(clientReq);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('POST /api/contracts/[id]/milestones should reject cross-user IDOR access attempts', async () => {
    // Intruder Client attempts to execute DEPOSIT on testContract belonging to clientUser
    const idorReq = new Request(`http://localhost/api/contracts/${testContract.id}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': intruderClient.id,
      },
      body: JSON.stringify({
        action: 'DEPOSIT',
      }),
    });

    const res = await milestoneActionHandler(idorReq, { params: Promise.resolve({ id: testContract.id }) });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('POST /api/contracts/[id]/milestones SUBMIT_DELIVERABLE should require valid sha256Checksum', async () => {
    const invalidShaReq = new Request(`http://localhost/api/contracts/${testContract.id}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': devUser.id,
      },
      body: JSON.stringify({
        action: 'SUBMIT_DELIVERABLE',
        milestoneId: testMilestone.id,
        fileName: 'code.zip',
        fileUrl: 'https://storage.local/code.zip',
        sha256Checksum: 'invalid-not-64-hex',
      }),
    });

    const res = await milestoneActionHandler(invalidShaReq, { params: Promise.resolve({ id: testContract.id }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('GET /api/audit-logs should reject non-auditor roles with 403 and allow REVIEWER/ADMIN', async () => {
    // 1. Client denied
    const clientReq = new Request('http://localhost/api/audit-logs', {
      headers: { 'x-user-id': clientUser.id },
    });
    const clientRes = await auditLogsHandler(clientReq);
    expect(clientRes.status).toBe(403);

    // 2. Freelancer denied
    const devReq = new Request('http://localhost/api/audit-logs', {
      headers: { 'x-user-id': devUser.id },
    });
    const devRes = await auditLogsHandler(devReq);
    expect(devRes.status).toBe(403);

    // 3. Reviewer allowed
    const revReq = new Request('http://localhost/api/audit-logs', {
      headers: { 'x-user-id': reviewerUser.id },
    });
    const revRes = await auditLogsHandler(revReq);
    expect(revRes.status).toBe(200);
    const revBody = await revRes.json();
    expect(revBody.success).toBe(true);
    expect(revBody.data.integrity.isValid).toBe(true);
  });
});
