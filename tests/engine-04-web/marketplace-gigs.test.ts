import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import { GET as getGigsHandler, POST as createGigHandler } from '@/app/api/gigs/route';
import { GET as getGigByIdHandler } from '@/app/api/gigs/[id]/route';
import { GET as getOrdersHandler, POST as placeOrderHandler } from '@/app/api/orders/route';
import { SessionService } from '@/core/engine-04-web/session';

describe('Engine 04 (Web) & Engine 03 (DBMS) — Marketplace Gigs & Service Catalog (FR-09, UC-05)', () => {
  let devUser: any;
  let clientUser: any;
  let devToken: string;
  let clientToken: string;

  beforeEach(async () => {
    await prisma.order.deleteMany({});
    await prisma.gig.deleteMany({});

    const timestamp = Date.now();

    devUser = await prisma.user.create({
      data: {
        email: `marketplace-dev-${timestamp}@test.local`,
        passwordHash: 'hashed',
        name: 'Marketplace Freelancer',
        role: 'FREELANCER',
        balance: 0.0,
        devScore: 92.0,
      },
    });

    clientUser = await prisma.user.create({
      data: {
        email: `marketplace-client-${timestamp}@test.local`,
        passwordHash: 'hashed',
        name: 'Marketplace Client',
        role: 'CLIENT',
        balance: 5000.0,
      },
    });

    devToken = SessionService.createToken({
      id: devUser.id,
      email: devUser.email,
      role: 'FREELANCER',
      name: devUser.name,
    });

    clientToken = SessionService.createToken({
      id: clientUser.id,
      email: clientUser.email,
      role: 'CLIENT',
      name: clientUser.name,
    });
  });

  it('POST /api/gigs should allow a freelancer to publish a tiered service gig', async () => {
    const req = new Request('http://localhost/api/gigs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${devToken}`,
      },
      body: JSON.stringify({
        title: 'Fullstack Next.js and Tailwind Web Application',
        description: 'End-to-end responsive web application built with Next.js 16 and TypeScript.',
        category: 'web-development',
        tiers: [
          { name: 'Basic', price: 200.0, deliveryDays: 3, description: 'Landing page' },
          { name: 'Standard', price: 600.0, deliveryDays: 7, description: '5-page web app with auth' },
          { name: 'Premium', price: 1200.0, deliveryDays: 14, description: 'Complete SaaS MVP' },
        ],
      }),
    });

    const res = await createGigHandler(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBeDefined();
    expect(json.data.tiers).toHaveLength(3);
    expect(json.data.category).toBe('web-development');
  });

  it('POST /api/gigs should reject clients attempting to publish gigs with HTTP 403', async () => {
    const req = new Request('http://localhost/api/gigs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Client Gig Creation',
        description: 'Clients are consumers and cannot publish gigs directly.',
        category: 'design',
        tiers: [{ name: 'Basic', price: 100.0, deliveryDays: 2, description: 'Logo design' }],
      }),
    });

    const res = await createGigHandler(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/gigs should return paginated gigs with category filtering and keyword search', async () => {
    // Seed 2 distinct gigs
    await prisma.gig.create({
      data: {
        freelancerId: devUser.id,
        title: 'Python Machine Learning Pipelines',
        description: 'Data ingestion and model fine-tuning with PyTorch.',
        category: 'ai-data',
        tiers: JSON.stringify([{ name: 'Standard', price: 500.0, deliveryDays: 5, description: 'Pipeline' }]),
      },
    });

    await prisma.gig.create({
      data: {
        freelancerId: devUser.id,
        title: 'React Modern Design System',
        description: 'Figma to Tailwind CSS component kit.',
        category: 'frontend-ui',
        tiers: JSON.stringify([{ name: 'Standard', price: 300.0, deliveryDays: 4, description: 'UI Kit' }]),
      },
    });

    // 1. Filter by category
    const catReq = new Request('http://localhost/api/gigs?category=ai-data');
    const catRes = await getGigsHandler(catReq);
    expect(catRes.status).toBe(200);
    const catJson = await catRes.json();
    expect(catJson.data.items).toHaveLength(1);
    expect(catJson.data.items[0].category).toBe('ai-data');

    // 2. Keyword search
    const searchReq = new Request('http://localhost/api/gigs?search=Figma');
    const searchRes = await getGigsHandler(searchReq);
    expect(searchRes.status).toBe(200);
    const searchJson = await searchRes.json();
    expect(searchJson.data.items).toHaveLength(1);
    expect(searchJson.data.items[0].title).toContain('React Modern Design');

    // 3. Empty results query
    const emptyReq = new Request('http://localhost/api/gigs?search=nonexistentkeywordxyz');
    const emptyRes = await getGigsHandler(emptyReq);
    expect(emptyRes.status).toBe(200);
    const emptyJson = await emptyRes.json();
    expect(emptyJson.data.items).toHaveLength(0);
    expect(emptyJson.data.pagination.total).toBe(0);
  });

  it('GET /api/gigs/[id] should fetch detailed gig specification and tiers', async () => {
    const gig = await prisma.gig.create({
      data: {
        freelancerId: devUser.id,
        title: 'Smart Contract Security Audit',
        description: 'Vulnerability assessment and symbolic execution report.',
        category: 'security',
        tiers: JSON.stringify([
          { name: 'Quick Scan', price: 350.0, deliveryDays: 2, description: 'Automated review' },
          { name: 'Deep Audit', price: 900.0, deliveryDays: 7, description: 'Manual analysis' },
        ]),
      },
    });

    const req = new Request(`http://localhost/api/gigs/${gig.id}`);
    const res = await getGigByIdHandler(req, { params: Promise.resolve({ id: gig.id }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe(gig.id);
    expect(json.data.tiers).toHaveLength(2);
    expect(json.data.freelancer.name).toBe(devUser.name);
  });

  it('POST /api/orders should allow client to place an order for a valid gig tier', async () => {
    const gig = await prisma.gig.create({
      data: {
        freelancerId: devUser.id,
        title: 'Backend REST API Optimization',
        description: 'Postgres indexing and query tuning.',
        category: 'backend',
        tiers: JSON.stringify([
          { name: 'Basic Tuning', price: 250.0, deliveryDays: 2, description: 'Index audit' },
        ]),
      },
    });

    // 1. Client places order
    const orderReq = new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`,
      },
      body: JSON.stringify({
        gigId: gig.id,
        tierName: 'Basic Tuning',
        amount: 250.0,
      }),
    });

    const orderRes = await placeOrderHandler(orderReq);
    expect(orderRes.status).toBe(201);
    const orderJson = await orderRes.json();
    expect(orderJson.data.id).toBeDefined();
    expect(orderJson.data.tierName).toBe('Basic Tuning');
    expect(orderJson.data.status).toBe('PENDING');

    // 2. Fetch orders list
    const listReq = new Request('http://localhost/api/orders', {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    const listRes = await getOrdersHandler(listReq);
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.data.some((o: any) => o.id === orderJson.data.id)).toBe(true);
  });
});
