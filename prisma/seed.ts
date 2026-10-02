import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('==> Seeding database with baseline evaluation data...');

  const passwordHash = bcrypt.hashSync('Password123!', 10);

  // 1. Create Baseline Personas
  const admin = await prisma.user.upsert({
    where: { email: 'admin@escrow.local' },
    update: {},
    create: {
      email: 'admin@escrow.local',
      passwordHash,
      name: 'System Auditor',
      role: 'ADMIN',
      balance: 0.0,
      devScore: 100,
    },
  });

  const client1 = await prisma.user.upsert({
    where: { email: 'client1@escrow.local' },
    update: {},
    create: {
      email: 'client1@escrow.local',
      passwordHash,
      name: 'Alice Client',
      role: 'CLIENT',
      balance: 5000.0,
      devScore: 50,
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: 'client2@escrow.local' },
    update: {},
    create: {
      email: 'client2@escrow.local',
      passwordHash,
      name: 'Bob Client',
      role: 'CLIENT',
      balance: 3000.0,
      devScore: 50,
    },
  });

  const dev1 = await prisma.user.upsert({
    where: { email: 'dev1@escrow.local' },
    update: {},
    create: {
      email: 'dev1@escrow.local',
      passwordHash,
      name: 'Charlie Developer',
      role: 'FREELANCER',
      balance: 500.0,
      devScore: 88,
      githubProfile: 'charliedev',
    },
  });

  const dev2 = await prisma.user.upsert({
    where: { email: 'dev2@escrow.local' },
    update: {},
    create: {
      email: 'dev2@escrow.local',
      passwordHash,
      name: 'Dana Developer',
      role: 'FREELANCER',
      balance: 250.0,
      devScore: 75,
      githubProfile: 'danadev',
    },
  });

  const reviewer1 = await prisma.user.upsert({
    where: { email: 'reviewer1@escrow.local' },
    update: {},
    create: {
      email: 'reviewer1@escrow.local',
      passwordHash,
      name: 'Judge Reviewer',
      role: 'REVIEWER',
      balance: 0.0,
      devScore: 95,
    },
  });

  // 2. Create Sample Open Projects
  const project1 = await prisma.project.create({
    data: {
      clientId: client1.id,
      title: 'Next.js 16 Escrow Dashboard with Tailwind CSS',
      description: 'Build responsive multi-role frontend dashboard with real-time milestone visualization and polling.',
      budget: 1200.0,
      skillTags: JSON.stringify(['react', 'nextjs', 'typescript', 'tailwind']),
      status: 'OPEN',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      clientId: client2.id,
      title: 'SQLite ACID Ledger & Audit Trail Engine',
      description: 'Implement high-integrity double-entry transaction coordinator with cryptographic verification hash chaining.',
      budget: 1500.0,
      skillTags: JSON.stringify(['sqlite', 'typescript', 'node', 'prisma']),
      status: 'OPEN',
    },
  });

  // 3. Create Sample Marketplace Gig
  await prisma.gig.create({
    data: {
      freelancerId: dev1.id,
      title: 'Full Stack Next.js & TypeScript Engineering',
      description: 'Production-ready web application development with responsive layouts and strict typing.',
      category: 'WEB_DEV',
      tiers: JSON.stringify([
        { name: 'Basic', price: 200, deliveryDays: 3, description: 'Component implementation' },
        { name: 'Standard', price: 600, deliveryDays: 7, description: 'Full feature vertical slice' },
        { name: 'Premium', price: 1200, deliveryDays: 14, description: 'End-to-end platform deployment' },
      ]),
    },
  });

  // 4. Initial Audit Log with cryptographically chained verification hash
  const timestamp = new Date();
  const prevHash = 'GENESIS';
  const newState = JSON.stringify({ version: '1.0.0', status: 'READY' });
  const payload = `${admin.id}:System:${admin.id}:SYSTEM_INITIALIZED:${newState}:${timestamp.toISOString()}:${prevHash}`;
  const verificationHash = crypto.createHash('sha256').update(payload).digest('hex');

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      entityName: 'System',
      entityId: admin.id,
      action: 'SYSTEM_INITIALIZED',
      previousState: null,
      newState,
      prevHash,
      verificationHash,
      timestamp,
    },
  });

  console.log(`  [OK] Seeded 6 users: Admin, 2 Clients, 2 Freelancers, 1 Reviewer`);
  console.log(`  [OK] Seeded 2 projects: '${project1.title}', '${project2.title}'`);
  console.log('==> Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
