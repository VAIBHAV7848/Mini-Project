# S1 $\to$ S2 Architecture Traceability Matrix (Extended RTM)

> **Classification**: Authoritative Requirements-to-Architecture Traceability Specification (Stage S2 — Shared Architecture)
> **Engine Owner**: Engine 02 (DSA & SE Engine) — Darshan Kittur
> **Source Documents**:
> - `docs/requirements/requirements.md`
> - `docs/requirements/functional-requirements.md`
> - `docs/requirements/non-functional-requirements.md`
> - `docs/requirements/use-cases.md`
> - `docs/architecture/architecture.md`

---

## 1. Traceability Architecture & Coverage Guarantee

This Extended Requirements Traceability Matrix guarantees that $100\%$ of frozen Stage S1 Functional Requirements (FR-01 through FR-12) and Non-Functional Requirements (NFR-01 through NFR-10) are mapped to concrete architectural components, domain models, database tables, API contracts, and test strategies in Stage S2.

```mermaid
flowchart LR
    S0["S0 Need"] --> S1_FR["S1 Functional Req"]
    S1_FR --> UC["Use Case (UC-01..05)"]
    UC --> AC["Acceptance Criteria"]
    AC --> Engine["Academic Engine (E1..E4)"]
    Engine --> ArchComp["Architecture Component"]
    ArchComp --> DomainObj["Domain Entity"]
    DomainObj --> Contract["API & DB Contract"]
    Contract --> Test["Verification Test Strategy"]
```

---

## 2. Functional Requirements Traceability Matrix (FR-01 to FR-12)

| Req ID | Requirement Title | Use Case | Owning Engine & Owner | Architecture Component | Domain Entity & Invariant | API Route & DB Table | Verification Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Escrow FSM Validation | UC-01, UC-02 | **E1 (OS)** · Vaishnavi | `EscrowFsmValidator` (`escrow-fsm.ts`) | `Contract`, `Milestone` (INV-01, INV-02, INV-04) | `POST /api/contracts` $\to$ `contracts`, `milestones` | Unit test state transition matrix; assert 400 on illegal jumps. |
| **FR-02** | Review Timeout Watchdog | UC-02 | **E1 (OS)** · Vaishnavi | `WatchdogScheduler` (`watchdog.ts`) | `Milestone` (INV-09, Decision D-02: 7 days) | Interval cron $\to$ `milestones(review_deadline)` | Mock clock time-travel test; assert auto-approval at $T \ge 7\text{d}$. |
| **FR-03** | SHA-256 Deliverable Checksums | UC-02 | **E2 (DSA/SE)** · Darshan | `Sha256Hasher` (`hasher.ts`) | `Deliverable` (INV-06) | `POST /api/contracts` $\to$ `deliverables(sha256_checksum)` | Cryptographic digest test against standard vectors; assert tamper detection. |
| **FR-04** | N-ary EvidenceTree Indexing | UC-04 | **E2 (DSA/SE)** · Darshan | `EvidenceTreeManager` (`evidence-tree.ts`) | `DisputeEvidence`, `Dispute` (INV-06) | `GET /api/disputes/{id}` $\to$ `dispute_evidence` | $O(V+E)$ BFS/DFS traversal test; Merkle root verification test. |
| **FR-05** | ACID Financial Ledger Transfers | UC-01, UC-02 | **E3 (DBMS)** · Purvi | `LedgerCoordinator` (`ledger.ts`) | `EscrowTransaction`, `User` (INV-03, INV-01) | `POST /api/contracts` $\to$ `escrow_transactions`, `users` | Concurrent stress test; assert balance conservation $\sum \Delta B = 0$. |
| **FR-06** | Append-Only Audit Logging | UC-01–05 | **E3 (DBMS)** · Purvi | `AuditLogger` (`audit-logger.ts`) | `AuditLog` (INV-07) | `GET /api/audit-logs` $\to$ `audit_logs` | SQLite trigger test asserting error on `UPDATE`/`DELETE`. |
| **FR-07** | Dispute Submission Forms | UC-04 | **E4 (Web)** · Vaibhav | `DisputeWizard` UI Component | `Dispute`, `DisputeEvidence` | `POST /api/disputes` $\to$ `disputes` | E2E form submission test with multi-step evidence upload. |
| **FR-08** | Server-Side RBAC Enforcement | UC-01–05 | **E4 (Web)** · Vaibhav | `RbacGuard` Middleware (`rbac.ts`) | `User` (INV-05) | Next.js Route Middleware $\to$ `users(role)` | Penetration test asserting HTTP 403 on role spoofing attempts. |
| **FR-09** | Developer Marketplace & Gigs | UC-05 | **E4 (Web)** · Vaibhav | `GigCatalog` & `DeveloperDirectory` | `Gig`, `Order`, `User` | `GET /api/gigs`, `GET /api/developers` $\to$ `gigs`, `users` | Component render test; search filter and category query tests. |
| **FR-10** | 5s Polling State Synchronization | UC-02 | **E4 (Web)** · Vaibhav | `MilestoneStatePoller` (`poller.ts`) | `Milestone` View Model | `GET /api/contracts/{id}/milestones` | UI synchronization test verifying state update within 5.5s. |
| **FR-11** | Heuristic Semantic Proposal Matcher | UC-01 | **E2 (DSA/SE)** · Darshan (Primary) / **E3** (Supporting) | `HeuristicSemanticMatcher` (`matcher.ts`) | `Proposal`, `Project` (INV-08, Decision D-01) | `POST /api/proposals` $\to$ `proposals(ai_match_score)` | Unit test verifying deterministic Jaccard math & ranking. |
| **FR-12** | Atomic Multi-State Transitions | UC-01–04 | **E1 (OS)** · Vaishnavi | `KeyedMutex` & `EscrowFsmValidator` | `Contract`, `Milestone` (INV-01, INV-04) | `POST /api/contracts` $\to$ `contracts`, `milestones` | Parallel race test asserting zero duplicate state executions. |

---

## 3. Non-Functional Requirements Traceability Matrix (NFR-01 to NFR-10)

| NFR ID | Target Quality Attribute | Target Metric & Acceptance Threshold | Owning Engine | Architecture Enforcement Mechanism | Verification Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-01** | Performance & Latency | $P_{95} \le 500\text{ ms}$ under 50 concurrent users | All Engines | B-Tree composite indexes, lightweight Next.js route handlers. | Automated load test (`k6` / `autocannon`). |
| **NFR-02** | Access Control & Authorization | Zero unauthorized state mutations; 100% 403 rejection | **E4 (Web)** | Server-side RBAC middleware inspecting session role against matrix. | Automated RBAC permission test suite. |
| **NFR-03** | Data & Deliverable Integrity | 100% SHA-256 verification; sub-100ms hashing | **E2 (DSA/SE)** | Node.js `node:crypto` streaming SHA-256 with immutable DB checksum. | Cryptographic unit test with byte modification fixtures. |
| **NFR-04** | Input Sanitization & Security | Zero SQLi/XSS vulnerabilities; 100% Zod validation | All Engines | Zod 4 runtime schema allowlisting and Prisma parameterized queries. | Automated boundary fuzzing and injection test suite. |
| **NFR-05** | Fault Tolerance & Recovery | MTTR $\le 5.0\text{ s}$; zero uncommitted partial state | **E1 (OS)** | SQLite WAL mode atomic recovery and graceful process reboot. | Process `SIGKILL` crash injection during active transaction. |
| **NFR-06** | Browser & Mobile Accessibility | Lighthouse Accessibility Score $\ge 90$; responsive | **E4 (Web)** | Semantic HTML, Tailwind CSS responsive grid, ARIA tags. | Automated Lighthouse CI and viewport regression tests. |
| **NFR-07** | Requirements Traceability | 100% requirements mapped to architecture and tests | **E2 (DSA/SE)** | Programmatic RTM engine (`rtm.ts`) validating matrix graph. | Automated RTM completeness verification script. |
| **NFR-08** | Transactional Concurrency | Zero balance drift under 50 concurrent transactions | **E3 (DBMS)** | SQLite serialized write transactions (`prisma.$transaction`). | Concurrent double-spend stress test. |
| **NFR-09** | Auditability & Compliance | 100% critical actions audited with chained SHA-256 | **E3 (DBMS)** | SQLite triggers preventing delete/update; Merkle-Damgård hash chain. | Audit log hash chain recalculation and tampering test. |
| **NFR-10** | Client State Consistency | UI updates within $5.0\text{ s} + \text{network latency}$ | **E4 (Web)** | Dedicated 5-second polling route reading covered B-Tree indexes. | E2E browser test verifying UI update timing. |
