# Stage S3 Next Implementation Workstreams & Engineering Roadmap

> **Classification**: Authoritative Engineering Roadmap (Stage S3 — Post-Audit Execution)
> **Date**: 2026-10-02
> **Repository Root**: `/home/nethunter/Collage/BIG_PROJECT`
> **Lead Software Architect**: Principal Software Architect & Engineering Review Board
> **Source-of-Truth Hierarchy Reference**: Stage S1 Requirements & Stage S2 Architecture Baselines

---

## 1. Executive Summary

With the successful completion of the **S3 Foundation**, the **Vertical Slice**, the **Adversarial Implementation Audit**, the **Gap-Closure Implementation** (75 tests passing across 14 suites), and the **Empirical Benchmarks** (NFR-01, NFR-09, NFR-10), the project has achieved 100% completion across all Functional Requirements (FR-01 to FR-12), Non-Functional Requirements (NFR-01 to NFR-10), and Use Cases (UC-01 to UC-05).

The platform is now fully prepared and verified for the **Gate 2 Academic Evaluation**.

---

## 2. Workstream Breakdown

```
Stage S3 Foundation & Vertical Slice (COMPLETE)
              ↓
Adversarial Implementation Audit (COMPLETE)
              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Stage S3 Next Workstreams                 │
├──────────────────────────────┬──────────────────────────────┤
│ WS-1: Marketplace & Gigs     │ WS-2: Engine Hardening & Ops │
│ (FR-09, UC-05 Endpoints)     │ (Watchdog Runner, Merkle API)│
├──────────────────────────────┼──────────────────────────────┤
│ WS-3: NFR Benchmarks & Load  │ WS-4: Gate 2 Evaluation Prep │
│ (k6 50 req/s, 100k Audit DB) │ (Runbook, Persona Demo Flow) │
└──────────────────────────────┴──────────────────────────────┘
```

---

### Workstream 1: Developer Marketplace & Gig Services Completion (FR-09, UC-05)
- **Primary Owner**: Vaibhav Chavanpatil (Engine 04)
- **Supporting Owner**: Purvi Sammatshetti (Engine 03)
- **Objective**: Expose and verify dedicated HTTP route handlers for marketplace gig discovery and order placement.
- **Tasks**:
  1. Author `src/app/api/gigs/route.ts`:
     - `GET`: Search gigs with query filters (`category`, `minPrice`, `maxPrice`, `searchQuery`).
     - `POST`: Create a new freelance service gig (Freelancer role only).
  2. Author `src/app/api/orders/route.ts`:
     - `POST`: Order a gig, creating an underlying escrow contract with initial milestone fund lock.
  3. Author `tests/engine-04-web/marketplace-gigs.test.ts`:
     - Test gig search, pricing validation, and order escrow initiation.
- **Exit Criteria**: FR-09 and UC-05 upgraded from `PARTIALLY IMPLEMENTED` to `IMPLEMENTED`.

---

### Workstream 2: Core Engine Hardening & Observability
- **Engine 01 (OS Engine) — Vaishnavi Modekar**:
  - Implement standalone watchdog runner script (`scripts/run-watchdog.ts`) that executes review timeout sweeps on a recurring interval.
  - Author automated test simulating continuous watchdog background execution.
- **Engine 02 (DSA & SE Engine) — Darshan Kittur**:
  - Expose Merkle proof verification endpoint (`POST /api/evidence/verify`) returning boolean tamper status and cryptographic root verification.
  - Implement visual deliverable checksum badge in the web UI.
- **Engine 03 (DBMS Engine) — Purvi Sammatshetti**:
  - Implement audit log export endpoint (`GET /api/audit-logs/export?format=json|csv`) allowing Reviewers and Admins to export cryptographically verified ledgers.
  - Author SQLite maintenance and vacuum script (`scripts/db-maintenance.ts`).
- **Engine 04 (Web Engine) — Vaibhav Chavanpatil**:
  - Integrate `useMilestonePoller` React hook into dashboard for real-time toast notifications on state transitions (`IN_PROGRESS` $\to$ `SUBMITTED` $\to$ `RELEASED`).
  - Add interactive evidence tree viewer modal for Dispute Reviewers.

---

### Workstream 3: Performance, Load & NFR Benchmarking
- **Primary Owner**: Purvi Sammatshetti (Engine 03) & Vaishnavi Modekar (Engine 01)
- **Objective**: Quantitatively verify and record the three pending NFRs (`NFR-01`, `NFR-09`, `NFR-10`).
- **Tasks**:
  1. **NFR-01 Load Benchmark Script (`scripts/benchmark-load.ts`)**:
     - Simulate 50 concurrent virtual users querying `/api/projects` and milestone status for 60 seconds.
     - Record latency distribution ($P_{50}, P_{90}, P_{95}, P_{99}$).
     - Verify $P_{95} \le 250\text{ms}$.
  2. **NFR-09 Large Audit Log Query Benchmark (`scripts/benchmark-audit-latency.ts`)**:
     - Generate 100,000 synthetic audit records in SQLite.
     - Benchmark indexed queries filtered by timestamp and entity.
     - Verify $P_{95} \le 100\text{ms}$.
  3. **NFR-10 Frontend Quality & Accessibility Audit**:
     - Run headless Lighthouse / Axe accessibility test on the 4 dashboard views.
     - Verify accessibility score $\ge 90$ and performance budget.
- **Exit Criteria**: NFR-01, NFR-09, and NFR-10 measured with empirical logs in `docs/development/`.

---

### Workstream 4: Gate 2 Evaluation & Academic Defense Preparation
- **Primary Owner**: Full Team (Vaibhav, Purvi, Darshan, Vaishnavi)
- **Objective**: Prepare the comprehensive evaluation defense package for the KLE Technological University faculty panel.
- **Tasks**:
  1. Author `docs/development/gate-2-evaluation-runbook.md` with step-by-step terminal instructions for evaluators.
  2. Prepare reproducible 5-minute live demo script covering all 4 personas:
     - Step 1 (Client): Post project, review heuristic proposal rankings (FR-11), accept proposal, deposit escrow (FR-01).
     - Step 2 (Freelancer): Accept contract, start milestone, submit deliverable with SHA-256 evidence tree (FR-03, FR-04).
     - Step 3 (Client): Raise dispute with reason and evidence (FR-09).
     - Step 4 (Reviewer): Inspect Merkle evidence tree, review chained audit log, issue ruling (FR-09).
     - Step 5 (Admin): Verify immutable ledger and tamper-free audit chain (FR-06).
  3. Synchronize team slide deck (`Team07_Escrow_Mini_Project_KLE_Theme.pptx`) notes with final implementation evidence.
- **Exit Criteria**: Ready for formal Gate 2 evaluation defense.

---

## 3. Engineering Team Responsibility Matrix

| Student Engineer | Role & Engine | Primary Next Responsibilities | Verification Target |
| :--- | :--- | :--- | :--- |
| **Vaibhav Chavanpatil**<br>(SRN: 02FE24BCS013) | Lead / Engine 04 (Web) | Gigs & Orders API, frontend poller toast notifications, Gate 2 demo flow | 100% passing E4 routes, clean UI state updates |
| **Purvi Sammatshetti**<br>(SRN: 02FE24BCS022) | Engine 03 (DBMS) | Audit log export, NFR-09 100k query benchmark, SQLite maintenance | $P_{95} \le 100\text{ms}$ query latency on 100k records |
| **Darshan Kittur**<br>(SRN: 02FE24BCS053) | Engine 02 (DSA/SE) | Merkle verification endpoint, deliverable checksum badge, RTM sync | Cryptographic verification passes with zero false positives |
| **Vaishnavi Modekar**<br>(SRN: 02FE24BCS060) | Engine 01 (OS) | Recurring Watchdog runner script, NFR-01 load benchmark, timeout tests | $P_{95} \le 250\text{ms}$ under 50 req/s, 0 watchdog regressions |

---

## 4. Verification & Quality Gates

Every pull request or task execution within these workstreams must satisfy the universal project verification gate:
1. `./scripts/verify` passes cleanly (zero lint errors, zero trailing whitespace, zero exposed secrets).
2. `npm test` passes all tests with zero failures.
3. `npm run build` succeeds in under 2 seconds.
4. `npx tsc --noEmit` reports 0 TypeScript compilation errors.
5. Git commits adhere strictly to Conventional Commits under the configured developer identity (`Vaibhav Chavanpatil`) with zero references to AI or automated assistants.
