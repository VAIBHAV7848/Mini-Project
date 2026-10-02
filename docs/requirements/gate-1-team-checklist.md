# Gate 1 Final Team Rehearsal & Readiness Checklist

> **Institution**: KLE Technological University (Dr. M. S. Sheshgiri College of Engineering & Technology, Belagavi)
> **Department**: Department of Computer Science and Engineering
> **Course / Framework**: Engine-Based Mini-Project Framework with Hybrid SDLC (Theme 01)
> **Project Title**: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow
> **Team**: Team 07 (Vaibhav Chavanpatil, Vaishnavi Modekar, Darshan Kittur, Purvi Sammatshetti)
> **Academic Phase**: Stage S1 Requirements Engineering Baseline Freeze
> **Gate Status**: `CONDITIONAL — READY FOR EVALUATION`
> **Important Gate Rule**: Gate 1 approval has **NOT** been recorded. Stage S2 (Shared Architecture) remains strictly blocked until formal evaluator approval is granted.

---

## 1. Master Team Rehearsal Checklist

Every member of Team 07 must personally verify and check off each of the following items prior to the evaluation session:

- [ ] **Project title memorized**: *Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow* (Theme 01, Team 07).
- [ ] **Problem statement understood**: Root causes (payment starvation, deliverable scope creep, arbitrary dispute outcomes) and AS-IS workflow bottlenecks.
- [ ] **Objective understood**: Five quantifiable engineering objectives established in Gate 0 Step 4.
- [ ] **Scope understood**: Explicit in-scope system boundaries established in `project-scope.md`.
- [ ] **All actors understood**: Clients, Freelancers, Dispute Reviewers, and System Engines (OS, DSA/SE, DBMS, Web).
- [ ] **UC-01 → UC-05 understood**: Normal flows, alternate flows, and exception conditions across all 5 use cases in `use-cases.md`.
- [ ] **FR-01 → FR-12 understood**: Detailed functional behaviors and observable acceptance criteria across all 12 FRs in `functional-requirements.md`.
- [ ] **NFR-01 → NFR-10 understood**: Quantifiable KPI benchmark targets and verification methodologies in `non-functional-requirements.md`.
- [ ] **RTM understood**: End-to-end bidirectional traceability linking Gate 0 needs to FRs, engines, and NFR targets in `requirements.md`.
- [ ] **Four-engine ownership understood**: Clear division of technical responsibilities across E1 (OS), E2 (DSA/SE), E3 (DBMS), and E4 (Web).
- [ ] **Each member knows their own engine**:
  - [ ] Vaishnavi Modekar owns Engine 01 (OS: FSM, concurrency, mutexes, watchdog timeouts).
  - [ ] Darshan Kittur owns Engine 02 (DSA/SE: SHA-256 digests, in-memory EvidenceTree, heuristic matching).
  - [ ] Purvi Sammatshetti owns Engine 03 (DBMS: BCNF normalization, ACID transactions, audit logs).
  - [ ] Vaibhav Chavanpatil owns Engine 04 (Web: Next.js App Router, RBAC middleware, dispute forms, polling).
- [ ] **D-01 discussed**: FR-11 Primary Engine Ownership (Engine 02 / Darshan = Primary, Engine 03 / Purvi = Supporting Dependency; `STATUS: PENDING TEAM RATIFICATION`).
- [ ] **D-02 discussed**: Client Review Timeout Duration (Proposed default: 7 calendar days before watchdog escalation; `STATUS: PENDING TEAM RATIFICATION`).
- [ ] **D-03 discussed**: Production Cloud Hosting Target Selection (Deferred until post-academic phase; `STATUS: DEFERRED`).
- [ ] **Hard questions rehearsed**: All 20 tough evaluator questions and answers in `gate-1-hard-questions.md` reviewed.
- [ ] **Out-of-scope boundaries understood**: 6 explicit exclusions (no real banking, no legal courts, no native mobile apps, no autonomous AI arbitration, no video streaming, no corporate tax systems).
- [ ] **Technology baseline understood**: Next.js 16 App Router, React 19, Tailwind CSS 4, Next.js Server Route Handlers, TypeScript 5, Zod 4, Prisma 5.22, SQLite, Node.js Crypto SHA-256.
- [ ] **Source documents available**: Original PowerPoint (`Team07_Escrow_Mini_Project_KLE_Theme.pptx`) and Word document (`Mini_Project_Gate_0_details_FILLED.docx`) verified and accessible in `docs/source-material/`.

---

## 2. Engine-by-Engine Verification Gates

### Vaishnavi Modekar — Engine 01 (OS Engine)
- [ ] Can draw the complete milestone FSM state transition diagram on a whiteboard.
- [ ] Can explain how atomic fund locking prevents race conditions and double-allocation.
- [ ] Can articulate how the timer interrupt watchdog enforces Decision D-02 (7-day review timeout).
- [ ] Knows the exact return code for illegal state jumps (HTTP 422 `INVALID_STATE_TRANSITION`).

### Darshan Kittur — Engine 02 (DSA & SE Engine)
- [ ] Can draw the N-ary `EvidenceTree` class hierarchy showing root, deliverable, and counter-exhibit nodes.
- [ ] Can state the time complexity of the evidence tree traversal ($O(V+E)$).
- [ ] Can explain the cryptographic properties of SHA-256 (collision resistance, avalanche effect).
- [ ] Can explain the mathematical formula for FR-11 heuristic matching (Jaccard tag overlap, budget fit, commit velocity).
- [ ] Can defend primary ownership of FR-11 per Decision D-01.

### Purvi Sammatshetti — Engine 03 (DBMS Engine)
- [ ] Can explain why the relational schema satisfies Boyce-Codd Normal Form (BCNF).
- [ ] Can explain how `prisma.$transaction` guarantees Atomicity, Consistency, Isolation, and Durability.
- [ ] Can articulate why SQLite WAL mode was selected over PostgreSQL for local academic evaluation.
- [ ] Can describe the exact schema fields of the tamper-resistant append-only audit log.
- [ ] Can explain why write transactions are serialized in SQLite to prevent concurrent balance corruption.

### Vaibhav Chavanpatil — Engine 04 (Web Technologies Engine)
- [ ] Can articulate the authorization boundary enforced by the RBAC middleware on private route handlers.
- [ ] Can explain the distinction between Server Components and Client Components in Next.js 16 App Router.
- [ ] Can justify why short-interval polling (5 seconds on active views) was selected over WebSockets for FR-10.
- [ ] Can explain how Zod 4 schemas validate incoming payloads at the API boundary to block injection attacks.
- [ ] Can present the complete dispute escalation form workflow (UC-04).

---

## 3. Team Decisions Register Standing

| Decision ID | Title | Proposed Resolution | Status |
| :--- | :--- | :--- | :--- |
| **D-01** | FR-11 Primary Engine Ownership | Engine 02 (Darshan Kittur) = Primary Owner<br>Engine 03 (Purvi Sammatshetti) = Supporting Dependency | **`PENDING TEAM RATIFICATION`** |
| **D-02** | Client Review Timeout Duration | Default review window: 7 calendar days before watchdog escalation | **`PENDING TEAM RATIFICATION`** |
| **D-03** | Production Cloud Hosting | Defer cloud hosting target selection until post-academic phase | **`DEFERRED`** |

---

## 4. Evaluation Gate Discipline Reminder

```text
GATE 1 STATUS: CONDITIONAL — READY FOR EVALUATION
STAGE S2 STATUS: BLOCKED
```

- **Strict Academic Boundary**: No code scaffolding, no Prisma schema generation, and no React UI components may be authored until the evaluation panel explicitly records Gate 1 approval.
- **Evaluation Focus**: Gate 1 evaluates *what* the system must do, *how* quality is verified, and *who* is accountable for each technical domain.
