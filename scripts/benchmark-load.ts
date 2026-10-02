import prisma from '../src/lib/db';
import { GET as getProjectsHandler } from '../src/app/api/projects/route';
import { GET as getGigsHandler } from '../src/app/api/gigs/route';
import { GET as getContractsHandler } from '../src/app/api/contracts/route';
import { SessionService } from '../src/core/engine-04-web/session';

interface BenchmarkResult {
  endpoint: string;
  totalRequests: number;
  concurrency: number;
  durationMs: number;
  throughputRps: number;
  p50Ms: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  meanMs: number;
  minMs: number;
  maxMs: number;
  errorCount: number;
}

function calculatePercentiles(latencies: number[]): { p50: number; p90: number; p95: number; p99: number; mean: number; min: number; max: number } {
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] ?? 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] ?? 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] ?? 0;
  const sum = latencies.reduce((acc, val) => acc + val, 0);
  const mean = sum / latencies.length;
  const min = latencies[0] ?? 0;
  const max = latencies[latencies.length - 1] ?? 0;

  return { p50, p90, p95, p99, mean, min, max };
}

async function runConcurrentBenchmark(
  endpointName: string,
  requestFactory: () => Request,
  handler: (req: Request) => Promise<Response>,
  totalRequests = 500,
  concurrency = 50
): Promise<BenchmarkResult> {
  const latencies: number[] = [];
  let errorCount = 0;
  const startTime = performance.now();

  const batches = Math.ceil(totalRequests / concurrency);

  for (let b = 0; b < batches; b++) {
    const batchPromises = Array.from({ length: concurrency }).map(async () => {
      const req = requestFactory();
      const reqStart = performance.now();
      try {
        const res = await handler(req);
        if (!res.ok) {
          errorCount++;
        }
      } catch {
        errorCount++;
      } finally {
        const reqEnd = performance.now();
        latencies.push(reqEnd - reqStart);
      }
    });

    await Promise.all(batchPromises);
  }

  const durationMs = performance.now() - startTime;
  const throughputRps = (totalRequests / (durationMs / 1000));
  const stats = calculatePercentiles(latencies);

  return {
    endpoint: endpointName,
    totalRequests,
    concurrency,
    durationMs: Math.round(durationMs),
    throughputRps: Math.round(throughputRps * 10) / 10,
    p50Ms: Math.round(stats.p50 * 100) / 100,
    p90Ms: Math.round(stats.p90 * 100) / 100,
    p95Ms: Math.round(stats.p95 * 100) / 100,
    p99Ms: Math.round(stats.p99 * 100) / 100,
    meanMs: Math.round(stats.mean * 100) / 100,
    minMs: Math.round(stats.min * 100) / 100,
    maxMs: Math.round(stats.max * 100) / 100,
    errorCount,
  };
}

async function main() {
  console.log('================================================================');
  console.log('NFR-01 Performance Benchmark: 50 Concurrent Requests Load Test');
  console.log('Target KPI: P95 latency <= 500ms across all endpoints');
  console.log('================================================================\n');

  // Ensure test user exists for authenticated routes
  let testUser = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: `bench-client-${Date.now()}@test.local`,
        passwordHash: 'hashed',
        name: 'Benchmark Client',
        role: 'CLIENT',
        balance: 10000.0,
      },
    });
  }

  const clientToken = SessionService.createToken({
    id: testUser.id,
    email: testUser.email,
    role: 'CLIENT',
    name: testUser.name,
  });

  const results: BenchmarkResult[] = [];

  // 1. GET /api/projects
  console.log('Running Benchmark: GET /api/projects (500 requests, 50 concurrency)...');
  const projectsResult = await runConcurrentBenchmark(
    'GET /api/projects',
    () => new Request('http://localhost/api/projects?limit=10'),
    getProjectsHandler,
    500,
    50
  );
  results.push(projectsResult);

  // 2. GET /api/gigs
  console.log('Running Benchmark: GET /api/gigs (500 requests, 50 concurrency)...');
  const gigsResult = await runConcurrentBenchmark(
    'GET /api/gigs',
    () => new Request('http://localhost/api/gigs?limit=10'),
    getGigsHandler,
    500,
    50
  );
  results.push(gigsResult);

  // 3. GET /api/contracts (Authenticated)
  console.log('Running Benchmark: GET /api/contracts (500 requests, 50 concurrency)...');
  const contractsResult = await runConcurrentBenchmark(
    'GET /api/contracts',
    () => new Request('http://localhost/api/contracts', {
      headers: { Authorization: `Bearer ${clientToken}` },
    }),
    getContractsHandler,
    500,
    50
  );
  results.push(contractsResult);

  console.log('\n================================================================');
  console.log('NFR-01 BENCHMARK RESULTS SUMMARY:');
  console.log('================================================================');
  console.table(results);

  const allPassed = results.every(r => r.p95Ms <= 500 && r.errorCount === 0);
  console.log(`\nNFR-01 Compliance Check (P95 <= 500ms, 0 errors): ${allPassed ? 'PASS' : 'FAIL'}`);

  return results;
}

main()
  .catch((err) => {
    console.error('Benchmark failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
