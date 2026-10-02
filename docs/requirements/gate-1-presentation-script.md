# Gate 1 Presentation Script — Team 07

> **Project Title**: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow
> **Institution**: KLE Technological University (Dr. M. S. Sheshgiri College of Engineering & Technology, Belagavi)
> **Course / Framework**: Engine-Based Mini-Project Framework with Hybrid SDLC (Theme 01)
> **Team Members**:
> - Vaibhav Chavanpatil (`02FE24BCS013`) — Engine 04: Web Technologies
> - Purvi Sammatshetti (`02FE24BCS022`) — Engine 03: DBMS
> - Darshan Kittur (`02FE24BCS053`) — Engine 02: DSA & Software Engineering
> - Vaishnavi Modekar (`02FE24BCS060`) — Engine 01: Operating Systems
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1)
> **Gate 1 Status**: `CONDITIONAL — READY FOR EVALUATION`

---

## 1. Problem Statement

### What to say
> "Respected evaluators, existing freelance marketplaces suffer from three structural points of failure that cause severe economic and legal friction:
> 1. Payment uncertainty: Clients worry about paying upfront for incomplete or poor-quality work, while freelancers frequently face payment withholding or delayed client reviews after delivering work.
> 2. Disorganized deliverable verification: Deliverables and communications are scattered across unauthenticated channels like WhatsApp, email, or cloud links, making proof of delivery difficult to establish.
> 3. Subjective and arbitrary dispute resolution: When disagreements occur, platforms either rely on opaque customer-service staff or force one-sided decisions without cryptographic proof of what was delivered and when.
>
> Our problem analysis in Gate 0 proved that without an atomic milestone lock and a deterministic evidence chain, neither party has cryptographic safety."

### Evidence / Source
- `Mini_Project_Gate_0_details_FILLED.docx`: Step 1 (Problem Understanding), Step 3 (Stakeholder Pain Points), and Step 4 (Problem Statement formulation).
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 2 ("Background & Real-World Problem") and Slide 3 ("Current As-Is vs To-Be Workflow").

### Likely Evaluator Follow-up
- **Q**: *"Why can't existing platforms like Upwork or Freelancer just solve this with their existing systems?"*
- **Response**: *"Existing commercial platforms operate centralized, proprietary dispute resolution where evidence consists of unverified chat logs or subjective support tickets. Our system introduces two computer science fundamentals: first, an immutable in-memory Evidence Tree with SHA-256 deliverable fingerprints (Engine 02), and second, an atomic Finite State Machine that prevents out-of-order transitions and enforces review timeouts deterministically (Engine 01)."*

---

## 2. Proposed Solution

### What to say
> "We propose a web-based, milestone-oriented collaboration platform structured around two primary pillars:
> 1. A simulated Escrow Ledger governed by a rigorous Finite State Machine. Client funds are locked atomically per milestone before work begins, and released only upon explicit client acceptance or dispute resolution.
> 2. An Evidence-Based Dispute Resolution Workflow. Deliverables require cryptographic SHA-256 fingerprinting upon submission. If a dispute occurs, all submissions, revision requests, and timestamped actions are assembled into a hierarchical Evidence Tree inspected by an authorized human dispute reviewer."

### Evidence / Source
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 4 ("Proposed Solution Overview"), Slide 8 ("To-Be Process Architecture"), Slide 16 ("Full System Block Diagram").
- `Mini_Project_Gate_0_details_FILLED.docx`: Step 4 ("To-Be Solution Architecture").

### Likely Evaluator Follow-up
- **Q**: *"Why do you use human dispute reviewers instead of an AI model to arbitrate disputes automatically?"*
- **Response**: *"In accordance with Gate 0 Step 5, autonomous AI dispute arbitration is strictly Out-of-Scope. Algorithmic arbitration creates severe legal liability and hallucination risks. Instead, our human dispute reviewers act as impartial arbiters whose decisions are supported by immutable evidence trees and verifiable checksums, ensuring complete accountability."*

---

## 3. Project Objective

### What to say
> "The core engineering objective of this project is to model, design, and verify a four-engine collaborative platform where:
> 1. 100% of escrow deposits, releases, and refunds execute through atomic, ACID-compliant database transactions.
> 2. Every deliverable file has an immutable SHA-256 hash preventing post-submission tampering.
> 3. Contract and milestone states strictly obey a formal Finite State Machine with zero invalid state transitions.
> 4. All functional modules map directly to our core curriculum areas: Operating Systems, DSA and Software Engineering, DBMS, and Web Technologies."

### Evidence / Source
- `Mini_Project_Gate_0_details_FILLED.docx`: Step 4 ("Project Goals & Objectives").
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 5 ("Core Objectives") and Slide 9 ("Four-Engine Curricular Mapping").

### Likely Evaluator Follow-up
- **Q**: *"Is your objective to build a commercial startup or an academic engineering project?"*
- **Response**: *"Our primary objective is academic engineering rigor. We are solving real distributed workflow problems using Computer Science principles—specifically operating systems scheduling, tree algorithms, relational ACID guarantees, and secure web architectures."*

---

## 4. Scope

### What to say
> "Our functional scope is strictly bounded across the project lifecycle:
> - User registration, authentication, and Role-Based Access Control for Clients, Freelancers, and Dispute Reviewers.
> - Project posting, proposal submission, and heuristic tag-based skill matching.
> - Contract creation with multiple sequential milestones.
> - Milestone lifecycle execution: deposit locking, deliverable submission with SHA-256 checksums, client approval, and simulated fund release.
> - Full dispute escalation workflow with evidence tree compilation and reviewer adjudication."

### Evidence / Source
- `Mini_Project_Gate_0_details_FILLED.docx`: Step 5 ("In-Scope Boundary Definition").
- `docs/requirements/project-scope.md`: Section 1 ("In-Scope Requirements").

### Likely Evaluator Follow-up
- **Q**: *"Can a client fund milestone 2 before milestone 1 is finished?"*
- **Response**: *"Our FSM enforces sequential or explicit milestone activation rules under FR-02 and FR-12. Milestone funds are locked prior to work commencement (`AWAITING_DEPOSIT` → `FUNDED`), but release occurs per milestone sequentially to guarantee deliverable verification before subsequent fund movement."*

---

## 5. Actors

### What to say
> "The system identifies four primary actors and three secondary stakeholders:
> 1. The Client: Posts projects, deposits simulated funds into milestone escrow, reviews submitted deliverables, approves release, or files disputes.
> 2. The Freelancer: Browses projects, submits proposals, deposits deliverable files with cryptographic hashes, and requests milestone release.
> 3. The Dispute Reviewer: An authenticated impartial arbiter who accesses the evidence tree and audit log to resolve disputes via release or refund.
> 4. The Escrow Officer / System Watchdog: System daemon and supervisor that enforces timeout transitions and audits fund locks.
> Secondary stakeholders include the System Administrator, Auditor, and College Project Evaluators."

### Evidence / Source
- `Mini_Project_Gate_0_details_FILLED.docx`: Step 2 ("Stakeholder Matrix").
- `docs/requirements/use-cases.md`: Section 1 ("System Actors & Role Definitions").
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 16 ("User Roles").

### Likely Evaluator Follow-up
- **Q**: *"What prevents a Freelancer from acting as a Dispute Reviewer on their own project?"*
- **Response**: *"NFR-02 and FR-08 enforce strict RBAC middleware. The dispute adjudication route validates that the session actor possesses the `DISPUTE_REVIEWER` role and has no foreign-key association with either the Client or Freelancer user records on that contract."*

---

## 6. Major Use Cases

### What to say
> "We have formalized five core Use Cases covering the entire contract and dispute lifecycle:
> - UC-01: Contract Initiation & Escrow Fund Locking — Client accepts proposal, initiates milestone, and locks funds atomically.
> - UC-02: Deliverable Submission & Integrity Checksumming — Freelancer uploads work; Engine 02 computes SHA-256 hash and updates milestone to `UNDER_REVIEW`.
> - UC-03: Milestone Review, Acceptance & Fund Release — Client inspects deliverable and approves; funds transfer to freelancer balance with audit logging.
> - UC-04: Dispute Escalation & Evidence Tree Compilation — In case of rejection, either party escalates to dispute; Engine 02 compiles all artifacts into an Evidence Tree.
> - UC-05: Dispute Adjudication & Fund Settlement — Dispute reviewer evaluates evidence nodes, renders a binding verdict, and executes fund release or refund."

### Evidence / Source
- `docs/requirements/use-cases.md`: Complete specifications of UC-01 through UC-05.
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slides 3, 17, 21, and 22.

### Likely Evaluator Follow-up
- **Q**: *"What is the exception flow if the client does not review the milestone within the required timeframe?"*
- **Response**: *"UC-02 alternate flow 2A and FR-02 state that if the review timeout expires, the watchdog transitions the milestone from `UNDER_REVIEW` to `REVIEW_TIMEOUT`, enabling auto-release or escalation to dispute review."*

---

## 7. Functional Requirements

### What to say
> "We have defined exactly 12 Functional Requirements, each mapped to a single primary owning engine:
> - FR-01: Escrow Fund Locking (Engine 01 · Vaishnavi)
> - FR-02: Milestone State Tracking (Engine 01 · Vaishnavi)
> - FR-03: Cryptographic Checksum Verification (Engine 02 · Darshan)
> - FR-04: Tamper-Evident Evidence Tree Construction (Engine 02 · Darshan)
> - FR-05: ACID-Compliant Payment Ledger Processing (Engine 03 · Purvi)
> - FR-06: Append-Only Tamper-Resistant Audit Log (Engine 03 · Purvi)
> - FR-07: Multi-Role Workflow Dashboards (Engine 04 · Vaibhav)
> - FR-08: Authentication & Role-Based Access Control (Engine 04 · Vaibhav)
> - FR-09: Dispute Escalation & Resolution Workflow (Engine 04 · Vaibhav)
> - FR-10: Real-Time FSM State Visualizer (Engine 04 · Vaibhav)
> - FR-11: Heuristic Tag-Based Semantic Proposal Matcher (Engine 02 · Darshan Primary, E3 Purvi Supporting)
> - FR-12: Contract Lifecycle Orchestration (Engine 01 · Vaishnavi)"

### Evidence / Source
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 18 ("Functional Requirements FR-01 to FR-12").
- `docs/requirements/functional-requirements.md`.

### Likely Evaluator Follow-up
- **Q**: *"Why does FR-11 have an engine dependency between Engine 02 and Engine 03?"*
- **Response**: *"Engine 02 owns the matching algorithm—the taxonomy tokenization, Jaccard/weighted scoring heuristic, and ranking. Engine 03 provides the persistence dependency—the indexed queries and schema retrieval of proposal tags. To preserve single-owner academic accountability, Darshan (E2) is the primary owner, and Purvi (E3) is the supporting persistence owner."*

---

## 8. Non-Functional Requirements

### What to say
> "We have formulated 10 quantifiable Non-Functional Requirements:
> - NFR-01 (Performance): API endpoint 95th percentile latency must be ≤ 500 ms under a benchmark of 50 concurrent requests against 100 projects and 500 milestones.
> - NFR-02 (Security): 100% of protected routes enforce RBAC middleware with unauthorized requests rejected with HTTP 401 or 403.
> - NFR-03 (Data Integrity): 100% detection rate for any file payload alteration matching SHA-256 digests.
> - NFR-04 (Input Validation): 100% of incoming API payloads validated using Zod 4 schemas with zero unhandled type exceptions.
> - NFR-05 (FSM Reliability): 0 invalid or out-of-order state transitions permitted by the FSM validator.
> - NFR-06 (Responsiveness): Multi-role dashboard renders responsively across 360px mobile viewports to 1920px desktop viewports.
> - NFR-07 (Maintainability): Zero circular dependencies across the 4 engine modules.
> - NFR-08 (Consistency): Zero balance discrepancies or double-spending anomalies across simulated balances.
> - NFR-09 (Auditability): 100% of state transitions and fund movements written to append-only audit logs.
> - NFR-10 (Fault Tolerance): Standardized JSON error envelopes with zero uncaught server crashes."

### Evidence / Source
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 19 ("Non-Functional Requirements NFR-01 to NFR-10").
- `docs/requirements/non-functional-requirements.md`.

### Likely Evaluator Follow-up
- **Q**: *"How did you come up with the 500ms p95 latency figure? Is that realistic for an SQLite embedded database?"*
- **Response**: *"Yes. Embedded SQLite operates in-process with sub-millisecond local disk read speeds. A 500ms p95 latency provides ample headroom for Zod schema validation, JSON serialization, and cryptographic hashing while enforcing that algorithmic operations like tree traversals remain optimal ($O(V+E)$)."*

---

## 9. Four Academic Engines

### What to say
> "Our architecture is directly partitioned into four academic engines reflecting the 4th/5th semester CSE curriculum:
> 1. Engine 01 · Operating Systems (Vaishnavi Modekar): Handles concurrency, race condition prevention during fund locking, watchdog timers for review timeouts, and deterministic FSM scheduling.
> 2. Engine 02 · DSA & Software Engineering (Darshan Kittur): Handles SHA-256 cryptographic hashing, tree traversal algorithms for dispute evidence hierarchies, and software verification via the RTM.
> 3. Engine 03 · DBMS (Purvi Sammatshetti): Enforces BCNF normalized schema design, ACID transactional boundaries for simulated funds, and append-only audit trail integrity.
> 4. Engine 04 · Web Technologies (Vaibhav Chavanpatil): Implements multi-role responsive dashboards, RBAC session middleware, dispute workflow views, and real-time FSM progress visualizers."

### Evidence / Source
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 9 (Decomposition Overview), Slides 10–14 (Individual Engine Profiles), Slide 15 (Integration Flow).
- `docs/requirements/team-project-overview.md`: Section 3.

### Likely Evaluator Follow-up
- **Q**: *"Operating Systems usually deals with processes and memory. How is an Escrow FSM an OS concept?"*
- **Response**: *"Operating Systems is fundamentally about state transitions (Ready, Running, Blocked), mutual exclusion, critical section protection, and timer-driven interrupts. Our escrow engine models funds as a shared critical resource that requires mutual exclusion during state transitions, and uses watchdog timers to prevent starvation when clients fail to review submissions."*

---

## 10. Requirements Traceability

### What to say
> "Every single requirement is tracked bi-directionally across the project lifecycle:
> - Stakeholder Needs identified in Gate 0 map directly to Functional Requirements FR-01 through FR-12.
> - Each FR maps to a specific Use Case (UC-01 through UC-05).
> - Each FR has an explicit Owning Engine and accountable student engineer.
> - Each FR has measurable Non-Functional targets and verified acceptance criteria.
> Our Requirements Traceability Matrix guarantees zero orphan requirements and complete forward and backward traceability."

### Evidence / Source
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 23 ("Requirements Traceability Matrix").
- `docs/requirements/requirements.md`: Section 3 ("Bidirectional Requirements Traceability Matrix").

### Likely Evaluator Follow-up
- **Q**: *"Show me how a dispute is traced from the user need to the technical engine."*
- **Response**: *"Gate 0 Step 3 identifies 'Unresolvable client-freelancer conflict' as a primary stakeholder pain point. This maps to Need N-04 ('Verifiable Dispute Adjudication'), which traces to FR-04 (Evidence Trees, Engine 02), FR-09 (Dispute Workflow, Engine 04), and FR-06 (Audit Log, Engine 03), exercised in Use Cases UC-04 and UC-05, and governed by NFR-03 (Data Integrity) and NFR-09 (Auditability)."*

---

## 11. Acceptance Criteria

### What to say
> "In accordance with strict Software Engineering principles, our requirements do not rely on subjective descriptions. Each requirement has observable, binary pass/fail criteria.
> For example:
> - FR-01: Funds locking passes if and only if the project balance decreases by the milestone amount, the milestone escrow balance increases by that exact amount, and the state changes to `FUNDED` within an atomic transaction.
> - FR-03: Hash verification passes if any single byte change in a deliverable payload causes the computed SHA-256 digest to mismatch the registered digest, resulting in submission rejection."

### Evidence / Source
- `docs/requirements/functional-requirements.md`: Section 2 ("Observable Acceptance Criteria").
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 18.

### Likely Evaluator Follow-up
- **Q**: *"How will you test these acceptance criteria if code has not been written yet?"*
- **Response**: *"In Stage S1, acceptance criteria define the verification contract before implementation begins. In Stage S3, we will follow Test-Driven Development (TDD), implementing unit and integration tests that directly assert these exact binary criteria before writing production code."*

---

## 12. Risks

### What to say
> "During Gate 0 Step 7, we identified 8 critical technical and operational risks, each paired with an explicit architectural mitigation:
> - R1: Concurrent double-spending on milestone funding — mitigated by ACID transactional locking in SQLite.
> - R2: Client deliverable review abandonment — mitigated by Engine 01 timeout watchdogs.
> - R3: Deliverable file tampering post-submission — mitigated by Engine 02 SHA-256 checksum validation.
> - R4: Dispute evidence omission or tampering — mitigated by hierarchical Evidence Trees and append-only audit logs.
> - R5: Role privilege escalation — mitigated by Engine 04 server-side RBAC session middleware.
> - R6: Large deliverable upload timeout — mitigated by deliverable file size limits (50 MB) and hash-first registration.
> - R7: Concurrency lock contention — mitigated by isolated milestone-level state transactions.
> - R8: Proposal spamming — mitigated by proposal status validation and user bidding quotas."

### Evidence / Source
- `Mini_Project_Gate_0_details_FILLED.docx`: Step 7 ("Risk Management Plan").
- `docs/requirements/project-scope.md`: Section 3 ("Risk Management Register").

### Likely Evaluator Follow-up
- **Q**: *"What is your biggest technical risk among these eight?"*
- **Response**: *"Risk R1—ensuring absolute balance integrity during concurrent escrow operations. We mitigate this through Engine 03's strict ACID transaction boundaries and Engine 01's FSM locking, ensuring no intermediate balance state is ever persisted or visible."*

---

## 13. Out-of-Scope Boundaries

### What to say
> "To prevent feature creep and maintain academic depth over commercial breadth, we have formally declared 6 items out of scope:
> 1. Real banking and payment gateways (Stripe, Razorpay, PayPal) — we utilize simulated currency ledgers.
> 2. Legal court arbitration or formal legal jurisdiction enforcement.
> 3. Native mobile applications (iOS/Android) — we deliver a responsive web application.
> 4. Autonomous AI dispute verdict generation — dispute decisions are strictly made by human reviewers.
> 5. Unlimited video or multi-gigabyte media storage — uploads are capped at 50 MB per deliverable.
> 6. Corporate taxation, invoicing, and statutory compliance."

### Evidence / Source
- `Mini_Project_Gate_0_details_FILLED.docx`: Step 5 ("Out-of-Scope Boundary Definition").
- `docs/requirements/project-scope.md`: Section 1.2 ("Explicitly Out-of-Scope Items").

### Likely Evaluator Follow-up
- **Q**: *"Why didn't you integrate a free sandbox payment gateway like Stripe Test Mode?"*
- **Response**: *"Relying on external third-party API sandboxes introduces network dependencies, external API rate limits, and authentication overhead that obscure our core academic deliverables. A simulated ledger directly in SQLite allows Engine 03 to prove ACID isolation, double-entry balance constraints, and rollback mechanisms under our direct test control."*

---

## 14. Technology Baseline

### What to say
> "Our technology stack baseline was formally approved in ADR-001 in direct alignment with our project slide 16:
> - Language & Runtime: TypeScript 5 on Node.js (ensuring type safety across all engine boundaries).
> - Frontend & UI: Next.js 16 (App Router), React 19, Tailwind CSS 4, Lucide Icons.
> - Backend & Validation: Next.js Server Route Handlers with Zod 4 input schema validation.
> - Persistence & ORM: Prisma 5.22 ORM with SQLite relational database and ACID transactions.
> - Cryptography & Security: Node.js standard `crypto` module (SHA-256) and HTTP-only RBAC session cookies."

### Evidence / Source
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 16 ("Technology Stack Architecture").
- `docs/decisions/ADR-001-technology-stack-baseline.md`.

### Likely Evaluator Follow-up
- **Q**: *"Why SQLite instead of PostgreSQL or MongoDB?"*
- **Response**: *"SQLite is an embedded, zero-configuration relational database with full ACID transaction compliance. For an academic project evaluated on local laboratory machines, SQLite guarantees complete reproducibility without external database server daemon setup, while fully demonstrating BCNF normalization, relational joins, foreign keys, and transaction rollbacks."*

---

## 15. Pending Team Decisions

### What to say
> "To maintain strict academic integrity and avoid treating AI recommendations as decisions, we have explicitly documented our team decisions register:
> - Decision D-01 (FR-11 Primary Engine Ownership): We propose Engine 02 (Darshan Kittur) as the primary owner for the matching algorithm, with Engine 03 (Purvi Sammatshetti) as the supporting persistence dependency (Status: PENDING TEAM RATIFICATION).
> - Decision D-02 (Client Review Timeout Duration): We propose a default of 7 calendar days before watchdog auto-release escalation occurs (Status: PENDING TEAM RATIFICATION).
> - Decision D-03 (Production Cloud Hosting): External cloud deployment target selection is deferred to the post-academic phase; all Gate 1–4 demonstrations run locally on standard Ubuntu hardware (Status: DEFERRED).
> All three items are formally tracked in `docs/requirements/gate-1-team-decisions.md`."

### Evidence / Source
- `docs/requirements/gate-1-team-decisions.md`.
- `Team07_Escrow_Mini_Project_KLE_Theme.pptx`: Slide 11, Slide 12, Slide 17.

### Likely Evaluator Follow-up
- **Q**: *"Why didn't you just decide these before the presentation?"*
- **Response**: *"Under our engineering governance model, no requirement or ownership assignment can be finalized without student consensus and guide approval. Tracking them openly demonstrates disciplined requirements management rather than unverified assumptions."*
