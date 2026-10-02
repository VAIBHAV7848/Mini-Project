import prisma from '../src/lib/db';
import { GET as getContractByIdHandler } from '../src/app/api/contracts/route';
import { SessionService } from '../src/core/engine-04-web/session';

interface SyncBenchmarkStats {
  metric: string;
  measured: string | number;
  targetThreshold: string;
  status: 'PASS' | 'FAIL';
}

function calculatePercentiles(latencies: number[]): { p50: number; p90: number; p95: number; p99: number; mean: number } {
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] ?? 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] ?? 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] ?? 0;
  const mean = latencies.reduce((acc, val) => acc + val, 0) / latencies.length;

  return {
    p50: Math.round(p50 * 100) / 100,
    p90: Math.round(p90 * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    p99: Math.round(p99 * 100) / 100,
    mean: Math.round(mean * 100) / 100,
  };
}

async function main() {
  console.log('================================================================');
  console.log('NFR-10 Client Polling & Real-time State Synchronization Benchmark');
  console.log('Target KPIs:');
  console.log('  1. Snapshot Payload Size <= 5 KB (5,120 bytes)');
  console.log('  2. Database Query Execution Time <= 15 ms');
  console.log('  3. Total Polling Loop Sync Latency <= 5,500 ms (5s poll + latency)');
  console.log('================================================================\n');

  // Setup representative realistic contract with 4 milestones, deliverables, and audit state
  const timestamp = Date.now();
  const client = await prisma.user.create({
    data: {
      email: `sync-client-${timestamp}@test.local`,
      passwordHash: 'hash',
      name: 'Sync Client',
      role: 'CLIENT',
      balance: 10000.0,
    },
  });

  const freelancer = await prisma.user.create({
    data: {
      email: `sync-dev-${timestamp}@test.local`,
      passwordHash: 'hash',
      name: 'Sync Dev',
      role: 'FREELANCER',
      balance: 100.0,
      devScore: 94.0,
    },
  });

  const project = await prisma.project.create({
    data: {
      clientId: client.id,
      title: 'Enterprise Real-time Sync Target System',
      description: 'System requiring high-frequency client state synchronization.',
      skillTags: 'typescript,react,nextjs',
      budget: 4000.0,
      status: 'IN_PROGRESS',
    },
  });

  const contract = await prisma.contract.create({
    data: {
      projectId: project.id,
      clientId: client.id,
      freelancerId: freelancer.id,
      totalAmount: 4000.0,
      escrowBalance: 2000.0,
      status: 'FUNDED',
    },
  });

  // Create 4 milestones
  for (let i = 1; i <= 4; i++) {
    await prisma.milestone.create({
      data: {
        contractId: contract.id,
        title: `Milestone ${i}: Implementation Slice ${i}`,
        description: `Deliverable milestone requirements for phase ${i}`,
        amount: 1000.0,
        status: i === 1 ? 'IN_PROGRESS' : 'PENDING',
        sequenceOrder: i,
        dueDate: new Date(Date.now() + i * 7 * 86400 * 1000),
      },
    });
  }

  const clientToken = SessionService.createToken({
    id: client.id,
    email: client.email,
    role: 'CLIENT',
    name: client.name,
  });

  const ITERATIONS = 100;
  const dbLatencies: number[] = [];
  const reqLatencies: number[] = [];
  let payloadBytes = 0;

  console.log(`Executing ${ITERATIONS} sync cycles against contract ${contract.id}...`);

  for (let i = 0; i < ITERATIONS; i++) {
    // 1. Direct database sync query execution
    const dbStart = performance.now();
    const dbSnapshot = await prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        milestones: {
          include: {
            deliverable: true,
            dispute: true,
          },
          orderBy: { sequenceOrder: 'asc' },
        },
        client: {
          select: { id: true, name: true, email: true },
        },
        freelancer: {
          select: { id: true, name: true, devScore: true },
        },
        escrowTransactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    const dbEnd = performance.now();
    dbLatencies.push(dbEnd - dbStart);

    // 2. HTTP Endpoint polling simulation
    const req = new Request(`http://localhost/api/contracts?contractId=${contract.id}`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    const reqStart = performance.now();
    const res = await getContractByIdHandler(req);
    const bodyText = await res.text();
    const reqEnd = performance.now();
    reqLatencies.push(reqEnd - reqStart);

    if (i === 0) {
      payloadBytes = Buffer.byteLength(bodyText, 'utf8');
    }
  }

  const dbStats = calculatePercentiles(dbLatencies);
  const reqStats = calculatePercentiles(reqLatencies);

  // Theoretical 5-second polling interval + request network/compute latency
  const POLLING_INTERVAL_MS = 5000;
  const totalSyncP95Ms = POLLING_INTERVAL_MS + reqStats.p95;

  const results: SyncBenchmarkStats[] = [
    {
      metric: 'Snapshot Payload Size',
      measured: `${payloadBytes} bytes (${(payloadBytes / 1024).toFixed(2)} KB)`,
      targetThreshold: '<= 5,120 bytes (5 KB)',
      status: payloadBytes <= 5120 ? 'PASS' : 'FAIL',
    },
    {
      metric: 'Database Snapshot Query (P95)',
      measured: `${dbStats.p95} ms`,
      targetThreshold: '<= 15.0 ms',
      status: dbStats.p95 <= 15.0 ? 'PASS' : 'FAIL',
    },
    {
      metric: 'Database Snapshot Query (Mean)',
      measured: `${dbStats.mean} ms`,
      targetThreshold: '<= 10.0 ms',
      status: dbStats.mean <= 10.0 ? 'PASS' : 'FAIL',
    },
    {
      metric: 'API Polling Route Latency (P95)',
      measured: `${reqStats.p95} ms`,
      targetThreshold: '<= 100.0 ms',
      status: reqStats.p95 <= 100.0 ? 'PASS' : 'FAIL',
    },
    {
      metric: 'Total 5s Polling Sync Latency (P95)',
      measured: `${totalSyncP95Ms.toFixed(2)} ms (${(totalSyncP95Ms / 1000).toFixed(3)} s)`,
      targetThreshold: '<= 5,500 ms (5.5 s)',
      status: totalSyncP95Ms <= 5500 ? 'PASS' : 'FAIL',
    },
  ];

  console.log('\n================================================================');
  console.log('NFR-10 REAL-TIME STATE SYNC BENCHMARK RESULTS:');
  console.log('================================================================');
  console.table(results);

  // Clean up
  await prisma.milestone.deleteMany({ where: { contractId: contract.id } });
  await prisma.contract.delete({ where: { id: contract.id } });
  await prisma.project.delete({ where: { id: project.id } });
  await prisma.user.deleteMany({ where: { id: { in: [client.id, freelancer.id] } } });

  const allPassed = results.every(r => r.status === 'PASS');
  console.log(`\nNFR-10 Overall Verification: ${allPassed ? 'ALL THRESHOLDS SATISFIED' : 'THRESHOLD EXCEEDED'}`);

  return results;
}

main()
  .catch((err) => {
    console.error('Sync benchmark failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
