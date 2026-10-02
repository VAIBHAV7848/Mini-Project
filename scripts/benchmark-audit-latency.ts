import crypto from 'node:crypto';
import prisma from '../src/lib/db';

interface LatencyStats {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
}

function calculatePercentiles(latencies: number[]): LatencyStats {
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] ?? 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] ?? 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] ?? 0;
  const sum = latencies.reduce((acc, val) => acc + val, 0);
  const mean = sum / latencies.length;
  const min = latencies[0] ?? 0;
  const max = latencies[latencies.length - 1] ?? 0;

  return {
    p50: Math.round(p50 * 100) / 100,
    p90: Math.round(p90 * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    p99: Math.round(p99 * 100) / 100,
    mean: Math.round(mean * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
  };
}

async function main() {
  console.log('================================================================');
  console.log('NFR-09 Audit Log Retrieval Latency Benchmark: 100,000 Records');
  console.log('Target KPI: Low-latency indexed retrieval on 100k audit logs');
  console.log('================================================================\n');

  const TOTAL_RECORDS = 100000;
  const BATCH_SIZE = 5000;
  const TARGET_ENTITY_ID = 'target-milestone-for-benchmark-lookup';

  console.log(`Step 1: Ingesting ${TOTAL_RECORDS.toLocaleString()} synthetic audit log records in batches of ${BATCH_SIZE}...`);
  const ingestStart = performance.now();

  let prevHash = 'GENESIS_BENCHMARK';

  for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE; j++) {
      const idx = i + j;
      const entityId = idx % 200 === 0 ? TARGET_ENTITY_ID : `bench-entity-${idx % 10000}`;
      const action = idx % 4 === 0 ? 'ESCROW_RELEASE' : idx % 4 === 1 ? 'DELIVERABLE_SUBMIT' : idx % 4 === 2 ? 'DISPUTE_FILED' : 'MILESTONE_APPROVE';
      const hash = crypto.createHash('sha256').update(`${prevHash}:${idx}:${action}`).digest('hex');
      prevHash = hash;

      batch.push({
        actorId: 'bench-actor-sys',
        entityName: 'Milestone',
        entityId,
        action,
        previousState: 'IN_PROGRESS',
        newState: 'RELEASED',
        prevHash: 'prev-hash-mock',
        verificationHash: hash,
        timestamp: new Date(Date.now() - (TOTAL_RECORDS - idx) * 1000),
      });
    }

    await prisma.auditLog.createMany({
      data: batch,
    });

    if ((i + BATCH_SIZE) % 25000 === 0) {
      console.log(`  -> Ingested ${(i + BATCH_SIZE).toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} records...`);
    }
  }

  const ingestDuration = (performance.now() - ingestStart) / 1000;
  console.log(`Ingestion completed in ${ingestDuration.toFixed(2)}s (${Math.round(TOTAL_RECORDS / ingestDuration)} records/sec).\n`);

  const ITERATIONS = 100;

  // 1. Indexed Entity Lookup (entityName + entityId)
  console.log(`Running Benchmark 1: Indexed Entity Lookup (${ITERATIONS} iterations)...`);
  const entityLatencies: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    await prisma.auditLog.findMany({
      where: {
        entityName: 'Milestone',
        entityId: TARGET_ENTITY_ID,
      },
      take: 50,
      orderBy: { timestamp: 'desc' },
    });
    entityLatencies.push(performance.now() - start);
  }
  const entityStats = calculatePercentiles(entityLatencies);

  // 2. Timestamp Range Query (latest 1 hour)
  console.log(`Running Benchmark 2: Timestamp Range Query (${ITERATIONS} iterations)...`);
  const timeLatencies: number[] = [];
  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    await prisma.auditLog.findMany({
      where: {
        timestamp: { gte: oneHourAgo },
      },
      take: 100,
      orderBy: { timestamp: 'desc' },
    });
    timeLatencies.push(performance.now() - start);
  }
  const timeStats = calculatePercentiles(timeLatencies);

  // 3. Paginated System Audit Log Scan
  console.log(`Running Benchmark 3: Paginated System Audit Log View (page 10, take 50) (${ITERATIONS} iterations)...`);
  const pageLatencies: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    await prisma.auditLog.findMany({
      skip: 450,
      take: 50,
      orderBy: { timestamp: 'desc' },
    });
    pageLatencies.push(performance.now() - start);
  }
  const pageStats = calculatePercentiles(pageLatencies);

  console.log('\n================================================================');
  console.log('NFR-09 AUDIT LOG LATENCY BENCHMARK RESULTS (100k Records):');
  console.log('================================================================');
  const resultsTable = [
    { Query: 'Indexed Entity Lookup (entityName, entityId)', ...entityStats },
    { Query: 'Timestamp Range Query (indexed timestamp)', ...timeStats },
    { Query: 'Paginated Audit Log (skip 450, take 50)', ...pageStats },
  ];
  console.table(resultsTable);

  // Step 4: Cleanup
  console.log('\nStep 4: Cleaning up synthetic benchmark records...');
  const cleanupStart = performance.now();
  await prisma.auditLog.deleteMany({
    where: {
      actorId: 'bench-actor-sys',
    },
  });
  console.log(`Cleanup completed in ${((performance.now() - cleanupStart) / 1000).toFixed(2)}s.`);

  return resultsTable;
}

main()
  .catch((err) => {
    console.error('Audit latency benchmark failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
