# Performance Architecture & Verification Standards

> **Classification**: Authoritative Performance Architecture Specification (Stage S2 — Shared Architecture)
> **Source Documents**:
> - `docs/requirements/non-functional-requirements.md` (NFR-01 through NFR-10)
> - `docs/architecture/architecture.md`
> - `docs/database/indexing-strategy.md`

---

## 1. Performance Engineering Strategy

The platform achieves predictable, low-latency performance through architectural discipline rather than over-engineered infrastructure:
1. **In-Memory Concurrency Serialization**: Lightweight `KeyedMutex` protects critical sections in Node.js memory without remote distributed Redis lock overhead.
2. **Targeted Relational Indexing**: B-Tree composite indexes eliminate full-table scans for polling and filtering hot paths.
3. **Hardware-Accelerated Hashing**: Direct streaming to Node.js `node:crypto` utilizing OpenSSL SIMD/AVX instructions for SHA-256 computation.
4. **Lightweight Server Route Handlers**: Minimal middleware layers ensuring route invocation overhead is $< 5\text{ ms}$.

---

## 2. Measurable NFR Verification Matrix

Every performance-related Non-Functional Requirement is bound to a rigorous, reproducible benchmark protocol:

### 2.1 NFR-01: Standard API Response Latency
- **Metric**: 95th Percentile ($P_{95}$) HTTP Response Latency.
- **Target Operation**: `GET /api/projects`, `GET /api/contracts/{id}`, `POST /api/contracts` (Escrow Actions).
- **Target Workload**: 50 concurrent simulated users executing 500 total requests over 30 seconds.
- **Target Environment**: Standard Ubuntu 24.04 LTS laboratory machine (4 vCPUs, 8 GB RAM, NVMe/SSD storage).
- **Measurement Method**: Automated load test execution script (`k6` or `autocannon`).
- **Acceptance Threshold**: $P_{95} \le 500\text{ ms}$; zero failed HTTP 5xx responses.

---

### 2.2 NFR-03: Deliverable Cryptographic Integrity Verification
- **Metric**: SHA-256 Hashing Throughput and Verification Accuracy.
- **Target Operation**: Hashing and verification of deliverable archives.
- **Target Workload**: Payloads ranging from 1 KB to 50 MB (typical deliverable size).
- **Target Environment**: Node.js 22 LTS runtime.
- **Measurement Method**: Automated benchmark measuring CPU time for SHA-256 digest creation and byte comparison.
- **Acceptance Threshold**: Hashing duration $\le 100\text{ ms}$ for 10 MB payload; $100\%$ detection of single-bit byte modifications.

---

### 2.3 NFR-05: System Fault Recovery & Availability
- **Metric**: Crash Recovery Time to Clean Operational State (MTTR).
- **Target Operation**: Simulated process termination (`SIGKILL`) during active SQLite write transaction.
- **Target Workload**: Process killed while executing deposit transaction.
- **Target Environment**: Local Node.js application process with SQLite WAL mode.
- **Measurement Method**: Post-restart automated health check verifying SQLite journal recovery.
- **Acceptance Threshold**: Complete recovery in $\le 5.0\text{ seconds}$; zero uncommitted partial ledger records; balance conservation maintained.

---

### 2.4 NFR-08: Financial Concurrency & Transactional Consistency
- **Metric**: Balance Drift Under Heavy Concurrency ($\sum \Delta\text{Balance}$).
- **Target Operation**: 50 simultaneous deposit, release, and refund requests targeting the same escrow contracts.
- **Target Workload**: 50 concurrent asynchronous threads.
- **Target Environment**: SQLite WAL mode with Prisma transaction coordinator.
- **Measurement Method**: Automated concurrency stress test comparing pre-test and post-test system-wide balance sums.
- **Acceptance Threshold**: Net balance drift $= 0.00$; zero double-funding occurrences; zero negative account balances.

---

### 2.5 NFR-10: Client Polling State Synchronization
- **Metric**: Synchronization Latency for Milestone Visual State Updates.
- **Target Operation**: `GET /api/contracts/{id}/milestones` (Client Poller).
- **Target Workload**: Polling interval of 5.0 seconds across active dashboard sessions.
- **Target Environment**: Next.js App Router client running on Chrome/Firefox.
- **Measurement Method**: UI interaction test verifying that an escrow release triggers visible UI status update within $5.0\text{ seconds} + \text{network latency}$.
- **Acceptance Threshold**: Polling response payload size $\le 5\text{ KB}$; database query execution time $\le 15\text{ ms}$; UI visual update within 5.5 seconds.
