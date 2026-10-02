# Empirical Performance Benchmark Report (S3 Baseline)

> **Project**: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow
> **Evaluation Stage**: Phase 3 (S3 Implementation Baseline Verification)
> **Authors**: Team 07 (KLE Technological University)
> **Date**: October 2, 2026
> **Verification Gate**: Gate 2 Readiness Verification

---

## 1. Executive Summary

This document presents empirical benchmark measurements for the non-functional performance requirements specified in the system requirements baseline:
- **NFR-01**: Low-latency response times ($P_{95} \le 500\text{ms}$ under 50 concurrent requests).
- **NFR-09**: High-scale auditability and retrieval latency on an append-only ledger with 100,000 records.
- **NFR-10**: Real-time client state synchronization (polling interval 5s, payload $\le 5\text{KB}$, DB query $\le 15\text{ms}$, total sync $\le 5.5\text{s}$).

All tests were executed on local bare-metal hardware against the production SQLite WAL database engine and compiled Next.js Route Handlers. **All three NFR criteria passed with substantial safety margins.**

---

## 2. Test Environment Specification

| Parameter | Specification |
| :--- | :--- |
| **Operating System** | Linux 6.6.137+ (x86_64) |
| **Node.js Runtime** | v22.22.0 |
| **TypeScript / TSX** | TypeScript 5.7.0 / tsx 4.19.2 |
| **Next.js Engine** | Next.js 16.3.8 (Turbopack Engine) |
| **Database Engine** | SQLite 3 via Prisma 5.22.0 (WAL Journal Mode, Busy Timeout 5000ms) |
| **Concurrency Runner** | Asynchronous promise-pooled load executor |
| **Timer Precision** | High-resolution `performance.now()` (sub-millisecond precision) |

---

## 3. NFR-01: API Endpoint Load & Concurrency Benchmark

### 3.1 Workload Condition
- **Concurrency**: 50 simultaneous parallel requests.
- **Sample Size**: 500 requests per endpoint (1,500 requests total).
- **Target Threshold**: $P_{95} \text{ latency} \le 500.0\text{ ms}$ with 0 error responses.

### 3.2 Empirical Measurements

| Endpoint | Concurrency | Total Requests | Throughput | $P_{50}$ (ms) | $P_{90}$ (ms) | $P_{95}$ (ms) | $P_{99}$ (ms) | Max (ms) | Errors | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `GET /api/projects` | 50 | 500 | 674.7 req/s | 48.96 | 69.06 | **74.07** | 90.24 | 94.01 | 0 | **PASS** |
| `GET /api/gigs` | 50 | 500 | 7,455.3 req/s | 5.03 | 6.80 | **7.17** | 7.44 | 7.66 | 0 | **PASS** |
| `GET /api/contracts` *(Auth)* | 50 | 500 | 5,247.0 req/s | 6.70 | 8.80 | **9.84** | 11.78 | 12.26 | 0 | **PASS** |

### 3.3 Engineering Analysis
- `GET /api/projects` achieved a $P_{95}$ of 74.07 ms, outperforming the 500 ms threshold by a **6.7x factor**.
- `GET /api/gigs` achieved a $P_{95}$ of 7.17 ms, exceeding the requirement by a **69.7x factor**.
- `GET /api/contracts` under authenticated HMAC session parsing and role checking achieved a $P_{95}$ of 9.84 ms (**50.8x margin**).
- Zero errors or dropped connections were recorded across all 1,500 requests under 50 concurrent workers.

---

## 4. NFR-09: 100,000 Audit Log Retrieval Latency Benchmark

### 4.1 Workload Condition
- **Dataset Size**: 100,000 synthetic cryptographically chained audit log records in SQLite.
- **Batch Insertion Rate**: 22,340 records/second (4.48s total ingestion).
- **Sample Size**: 100 iterations per query pattern.

### 4.2 Empirical Measurements

| Query Pattern | Index Utilized | $P_{50}$ (ms) | $P_{90}$ (ms) | $P_{95}$ (ms) | $P_{99}$ (ms) | Mean (ms) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Indexed Entity Lookup** | `@@index([entityName, entityId])` | 2.29 | 3.29 | **3.42** | 6.14 | 2.42 | **PASS** |
| **Timestamp Range Query** | `@@index([timestamp(sort: Desc)])` | 1.07 | 1.53 | **2.40** | 2.85 | 1.21 | **PASS** |
| **Paginated System Audit Log** | `@@index([timestamp(sort: Desc)])` | 0.59 | 0.72 | **0.78** | 0.87 | 0.61 | **PASS** |

### 4.3 Engineering Analysis
- The BCNF composite index `(entity_name, entity_id)` guarantees $O(\log N)$ search complexity, yielding a $P_{95}$ lookup latency of 3.42 ms over 100k rows.
- Chained tamper verification traversal and pagination operate entirely in sub-millisecond to low-millisecond bounds.
- SQLite WAL mode ensures zero lock contention between reader queries and append-only audit ingestion.

---

## 5. NFR-10: Client Polling & Real-time State Synchronization

### 5.1 Workload Condition
- **Architecture**: Simulated 5-second polling interval against an active contract with 4 sequenced milestones, deliverable evidence, dispute state, and recent escrow transactions.
- **Sample Size**: 100 consecutive synchronization cycles.

### 5.2 Empirical Measurements

| Quality Metric | Measured Value | Target Threshold | Safety Margin | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Snapshot Payload Size** | 1,343 bytes (1.31 KB) | $\le 5,120$ bytes (5.0 KB) | 73.8% below cap | **PASS** |
| **DB Snapshot Query ($P_{95}$)** | 1.70 ms | $\le 15.0$ ms | 8.8x faster | **PASS** |
| **DB Snapshot Query (Mean)** | 1.02 ms | $\le 10.0$ ms | 9.8x faster | **PASS** |
| **API Route Latency ($P_{95}$)** | 1.82 ms | $\le 100.0$ ms | 54.9x faster | **PASS** |
| **Total 5s Polling Sync ($P_{95}$)** | 5,001.82 ms (5.002 s) | $\le 5,500$ ms (5.500 s) | 498.18 ms buffer | **PASS** |

### 5.3 Engineering Analysis
- Selective field projection ensures the contract dashboard snapshot is compact (1.31 KB), minimizing bandwidth consumption.
- Prisma relations are eagerly fetched in a single optimized query plan, executing in 1.70 ms at $P_{95}$.
- The client receives updated contract and milestone states within 2 ms of poll dispatch, comfortably satisfying the 5.5s real-time sync budget.

---

## 6. Verification Artifacts & Reproducibility

The benchmark test harness is version-controlled and reproducible via:
```bash
# Execute NFR-01 load benchmark (50 concurrent requests)
npx tsx scripts/benchmark-load.ts

# Execute NFR-09 audit retrieval benchmark (100k records)
npx tsx scripts/benchmark-audit-latency.ts

# Execute NFR-10 real-time synchronization benchmark
npx tsx scripts/benchmark-nfr10-sync.ts
```
