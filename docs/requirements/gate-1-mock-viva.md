# Gate 1 Mock Viva Voce & Evaluator Defense Guide

> **Institution**: KLE Technological University (Dr. M. S. Sheshgiri College of Engineering & Technology, Belagavi)
> **Department**: Department of Computer Science and Engineering
> **Course / Framework**: Engine-Based Mini-Project Framework with Hybrid SDLC (Theme 01)
> **Project Title**: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow
> **Team**: Team 07 (Vaibhav Chavanpatil, Purvi Sammatshetti, Darshan Kittur, Vaishnavi Modekar)
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1 Defense)
> **Evaluation Note**: Gate 1 strictly evaluates the requirements baseline (SRS, Use Cases, RTM, Engine Boundaries). Code, UI scaffolding, and database implementations are out-of-scope for Gate 1. Gate 1 approval has not yet been granted; Stage S2 remains blocked.

---

## 1. Project Identity & Academic Context

### Question 1
*"What is the exact academic theme and purpose of this mini-project within the KLE CSE curriculum?"*

- **What the evaluator is testing**: Whether the team understands the curricular framing of the Engine-Based Mini-Project Framework (Theme 01) and can articulate the project scope without giving a generic web-app description.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 1–2; `Mini_Project_Gate_0_details_FILLED.docx` Step 1.
- **Strong answer**:
  "Our project is developed under Theme 01 of the Department's Engine-Based Mini-Project Framework with Hybrid SDLC. The project is titled *Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow*. It is specifically designed to integrate four core foundational computer science course areas into a unified, demonstrable workflow: Operating Systems (Escrow & State Scheduler), Data Structures & Software Engineering (Evidence & QA), Database Management Systems (Transaction Ledger & Contracts), and Web Technologies (Role-Based Workflow Dashboard). Rather than an arbitrary commercial app, each engine addresses a concrete academic challenge mapped to 4th and 5th-semester core competencies."
- **Possible follow-up**:
  *"Why not build a standard freelancing website like Upwork or Fiverr?"*
  *(Answer: Commercial platforms treat escrow as a proprietary black box with centralized banking. Our project isolates the computer science mechanisms—deterministic state machines, cryptographic deliverable proofs, and BCNF relational transactions—into independently demonstrable academic engines.)*

---

## 2. Problem Statement & AS-IS Bottlenecks

### Question 2
*"What specific real-world problem does this system solve, and what is flawed with current freelance workflows?"*

- **What the evaluator is testing**: Understanding of Stage S0 Problem Definition, root-cause analysis, and stakeholder pain points.
- **Evidence from project documents**: `Mini_Project_Gate_0_details_FILLED.docx` Steps 1, 3, and 4; `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 3–5.
- **Strong answer**:
  "Current freelancing workflows suffer from three structural flaws identified in Gate 0 Step 3:
  1. *Payment Starvation*: Freelancers complete work but face arbitrary client approval delays or non-payment due to lack of enforced milestones and automated review timeout watchdogs.
  2. *Deliverable Ambiguity & Version Creep*: Clients receive code or design files that deviate from initial requirements, without an immutable cryptographic fingerprint proving what was delivered and when.
  3. *Arbitrary Dispute Resolution*: When disagreements occur, disputes are resolved through subjective, opaque administrative channels without a verifiable audit trail of deliverable revisions."
- **Possible follow-up**:
  *"Can you cite specific evidence of this problem from your Gate 0 research?"*
  *(Answer: Yes, in Gate 0 Step 1, we cited academic studies showing over 60% of digital freelancers report late payments or scope creep disputes, with existing platforms taking 14–30 days to resolve disagreements without evidence traceability.)*

---

## 3. Measurable Project Objectives

### Question 3
*"What are your quantifiable engineering objectives, and how do they map to stakeholder needs?"*

- **What the evaluator is testing**: Whether the project objectives are measurable engineering targets rather than vague marketing aspirations.
- **Evidence from project documents**: `Mini_Project_Gate_0_details_FILLED.docx` Step 4; `GATE-1-PACKAGE.md` Section 3.
- **Strong answer**:
  "Gate 0 Step 4 establishes five measurable objectives:
  1. Reduce milestone approval latency by enforcing deterministic timeout triggers within 7 calendar days (D-02).
  2. Eliminate deliverable tampering by computing 256-bit cryptographic SHA-256 hashes for 100% of uploaded artifacts.
  3. Guarantee zero financial double-allocation anomalies across all simulated escrow transactions via ACID database isolation.
  4. Provide an objective proposal ranking mechanism using heuristic tag overlap and GitHub velocity scores.
  5. Provide an immutable audit trail capturing 100% of milestone state changes and dispute rulings."
- **Possible follow-up**:
  *"How will you prove that double-allocation is eliminated in subsequent gates?"*
  *(Answer: Through Engine 03's concurrent automated stress tests simulating simultaneous transfer attempts on the same milestone balance inside explicit database transaction blocks.)*

---

## 4. Scope Boundaries & Exclusions

### Question 4
*"What is strictly out-of-scope for this project, and why did you exclude these capabilities?"*

- **What the evaluator is testing**: Project management discipline, risk management, and prevention of scope creep.
- **Evidence from project documents**: `Mini_Project_Gate_0_details_FILLED.docx` Step 5; `project-scope.md` Section 1.2.
- **Strong answer**:
  "In Gate 0 Step 5, the team formally established six explicit out-of-scope boundaries:
  1. *Real Payment Gateways / Banking APIs*: No Stripe, PayPal, or credit cards; we use an internal simulated currency ledger to eliminate monetary liability and KYC overhead.
  2. *Legal Court Adjudication*: Rulings are binding solely within the application environment.
  3. *Native Mobile Applications*: No native iOS/Android binaries; we implement a responsive web application.
  4. *Autonomous AI Arbitration*: AI does not decide disputes; human Dispute Reviewers make final decisions using evidence trees.
  5. *Unlimited Video / Streaming Media Hosting*: Deliverable uploads are bounded to 50 MB archives or repository links.
  6. *Corporate Accounting & Tax Filing*: No statutory tax or VAT compliance calculations."
- **Possible follow-up**:
  *"If you don't integrate real banking, is the project realistic?"*
  *(Answer: Yes, because the computer science challenge of escrow is atomic state transition, mutual exclusion, and transactional balance consistency, which is identical whether the ledger unit is simulated credits or fiat currency.)*

---

## 5. Use Case Modeling (UC-01 to UC-05)

### Question 5
*"Walk me through Use Case UC-03 (Milestone Verification & Fund Release). What happens if a duplicate release request is sent?"*

- **What the evaluator is testing**: Familiarity with use case scenarios, exception handling, and idempotency.
- **Evidence from project documents**: `docs/requirements/use-cases.md` Section 2 (UC-03); `functional-requirements.md` (FR-02, FR-05).
- **Strong answer**:
  "In UC-03, the client inspects the submitted deliverable and its verified SHA-256 digest on the dashboard. Upon clicking 'Approve & Release Funds', Engine 01 verifies that the milestone is currently in `UNDER_REVIEW` / `SUBMITTED`. Engine 03 opens an atomic transaction, deducts the milestone amount from `escrow_balance`, credits the freelancer's ledger balance, transitions the milestone to `RELEASED`, and appends an audit record.
  If a duplicate `RELEASE_ESCROW` request is transmitted concurrently or sequentially, Engine 01's FSM validator rejects the transition because `RELEASED` is a terminal milestone state for that phase. The request fails with HTTP 422 `INVALID_STATE_TRANSITION`, ensuring zero duplicate disbursements."
- **Possible follow-up**:
  *"What if the client wants revisions instead?"*
  *(Answer: Under UC-03 alternate flow, the client submits feedback notes; the milestone transitions back to `IN_PROGRESS`; funds remain locked in escrow.)*

---

## 6. Functional Requirements Completeness (FR-01 to FR-12)

### Question 6
*"How did the team ensure that FR-01 through FR-12 form a complete and testable specification?"*

- **What the evaluator is testing**: Understanding of SRS standards, observable acceptance criteria, and requirement testability.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 18; `functional-requirements.md` Section 2.
- **Strong answer**:
  "Every one of our 12 Functional Requirements defines an unambiguous functional behavior, maps to exactly one primary student owner, and specifies binary, observable acceptance criteria without subjective adjectives. For example, FR-01 requires that funds move from available to locked status with zero double-allocation permitted; FR-02 specifies deterministic state transitions where illegal transitions are rejected with explicit error codes; and FR-03 specifies SHA-256 generation at submission and re-verification upon inspection."
- **Possible follow-up**:
  *"Which requirement handles the transition from proposal acceptance to milestone creation?"*
  *(Answer: FR-12, Contract Lifecycle Orchestration, owned by Engine 01.)*

---

## 7. Non-Functional Requirements & Metrics (NFR-01 to NFR-10)

### Question 7
*"How will you objectively verify NFR-01 (API Latency) and NFR-03 (Data Integrity)?"*

- **What the evaluator is testing**: Whether non-functional requirements have quantifiable targets and concrete verification procedures.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 19; `non-functional-requirements.md` Section 2.
- **Strong answer**:
  "For NFR-01, our metric is p95 latency $\le 500\text{ ms}$ across all core REST endpoints under a benchmark workload of 50 concurrent simulated requests against a pre-seeded test database of 100 projects and 500 milestones. This will be verified using an automated benchmarking script.
  For NFR-03, our metric is a 100% detection rate for file tampering. This will be verified through automated byte-level injection tests where single bits in deliverable files are flipped, asserting that Engine 02 detects a hash mismatch."
- **Possible follow-up**:
  *"What is the metric for NFR-08 (Consistency)?"*
  *(Answer: Zero double-allocation or balance discrepancy anomalies under parallel concurrent transfer stress tests.)*

---

## 8. Requirements Traceability Matrix (RTM)

### Question 8
*"Explain the structure of your RTM and prove that you have forward and backward traceability."*

- **What the evaluator is testing**: Software Engineering rigor, verification planning, and absence of orphan requirements.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 23; `requirements.md` Section 3.
- **Strong answer**:
  "Our RTM links every originating Gate 0 Stakeholder Need (N-01 to N-05) to a Functional Requirement (FR-01 to FR-12), a Use Case (UC-01 to UC-05), an Owning Engine and Student, an Observable Acceptance Criterion, and a Target NFR.
  - Forward Traceability: Every stakeholder need maps to at least one FR and test boundary, ensuring no requirement is unaddressed.
  - Backward Traceability: Every FR traces back to an originating stakeholder need, proving zero scope creep or unrequested features."
- **Possible follow-up**:
  *"Which engine owner is responsible for defending the RTM?"*
  *(Answer: Darshan Kittur, under Engine 02 — Software Engineering QA.)*

---

## 9. Operating Systems Engine (Engine 01 Architecture)

### Question 9
*"How does Engine 01 demonstrate Operating Systems principles? Isn't it just a simple status column update?"*

- **What the evaluator is testing**: Vaishnavi Modekar's mastery of OS course mapping and concurrency concepts.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 9, 12, 18; `engine-01-os.md`.
- **Strong answer**:
  "Engine 01 is not a simple status update; it operates as an Escrow & State Scheduler that embodies three fundamental OS concepts:
  1. *Finite State Machine (FSM)*: Enforces deterministic process scheduling where milestone states follow strict lifecycle transitions, rejecting illegal state jumps.
  2. *Critical Sections & Mutual Exclusion*: Protects fund allocation from race conditions, preventing double-allocation when parallel API requests attempt to lock the same balance.
  3. *Timer Interrupt Watchdog*: Implements review timeout mechanics where milestones in `UNDER_REVIEW` automatically trigger timeout handling after a specified time window (D-02: 7 days), preventing deadlock where a freelancer is blocked indefinitely."
- **Possible follow-up**:
  *"What data structure is used for milestone state scheduling?"*
  *(Answer: A deterministic state transition table combined with a prioritized scheduling queue for milestone review timeouts.)*

---

## 10. DSA & Software Engineering Engine (Engine 02 Architecture)

### Question 10
*"Where is the Data Structures & Algorithms contribution in Engine 02? Why can't you just use database queries?"*

- **What the evaluator is testing**: Darshan Kittur's algorithmic defense and justification of in-memory data structures.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 10, 11, 13; `engine-02-dsa-se.md`; `gate-1-hard-questions.md` Q3 & Q4.
- **Strong answer**:
  "Dispute arbitration requires analyzing a causal, hierarchical timeline of deliverables, feedback, and counter-evidence. Merely running a SQL query returns a flat list of rows. Engine 02 implements an in-memory `EvidenceTree` class:
  - The milestone serves as the root node.
  - Deliverable submissions, client revision notes, and dispute exhibits form child and leaf nodes.
  - Each node contains payload metadata, timestamps, and SHA-256 integrity hashes.
  - Engine 02 performs depth-first recursive tree traversals with $O(V+E)$ complexity to verify the integrity chain from leaf to root before rendering the hierarchy to the dispute reviewer.
  Additionally, Engine 02 owns FR-11's semantic matching algorithm, utilizing set intersection/union (Jaccard similarity) and weighted multi-attribute ranking."
- **Possible follow-up**:
  *"What is the time complexity of the SHA-256 hashing?"*
  *(Answer: $O(n)$ where $n$ is the byte length of the uploaded deliverable stream.)*

---

## 11. DBMS Engine (Engine 03 Architecture)

### Question 11
*"Why did you choose SQLite over PostgreSQL, and how do you guarantee database consistency?"*

- **What the evaluator is testing**: Purvi Sammatshetti's database architecture justification and ACID transaction understanding.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 10, 14, 16; `engine-03-dbms.md`; `ADR-001-technology-stack-baseline.md`.
- **Strong answer**:
  "For an academic project evaluated on local laboratory workstations, SQLite provides embedded, zero-configuration execution with full ACID compliance, guaranteeing reproducible demonstrations without external database daemons.
  To ensure consistency:
  1. We normalize our schema to Boyce-Codd Normal Form (BCNF) across Users, Projects, Gigs, Contracts, Milestones, and Payments to eliminate update anomalies.
  2. All escrow balance transfers execute within explicit `prisma.$transaction` blocks with SQLite WAL (Write-Ahead Logging) mode.
  3. Every state change writes an immutable append-only record to `AUDIT_LOG` with foreign key integrity."
- **Possible follow-up**:
  *"How does SQLite handle concurrent writes during high load?"*
  *(Answer: SQLite uses single-writer serialized locking in WAL mode. For our academic workload of 50 concurrent requests, read queries execute concurrently while write transactions queue with short busy-timeouts, maintaining ACID consistency without corruption.)*

---

## 12. Web Technologies Engine (Engine 04 Architecture)

### Question 12
*"How is Engine 04 structured, and how do you prevent unauthorized users from approving milestones?"*

- **What the evaluator is testing**: Vaibhav Chavanpatil's Web Technologies and security implementation plan.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 10, 15, 17; `engine-04-web.md`.
- **Strong answer**:
  "Engine 04 is built on Next.js 16 App Router with React 19, TypeScript 5, and Tailwind CSS. It implements:
  1. *Multi-Role Responsive Dashboards*: Distinct views for Clients, Freelancers, Dispute Reviewers, and Admins.
  2. *RBAC Middleware*: Enforces Role-Based Access Control on every API route handler before domain logic executes. For milestone approvals (`POST /api/contracts`), the middleware validates the session token, verifies that the user role is `CLIENT`, and confirms that the authenticated user is the designated client on that contract.
  Unauthorized or cross-role requests are rejected with HTTP 401 Unauthorized or HTTP 403 Forbidden."
- **Possible follow-up**:
  *"How does the UI reflect milestone progress in real-time without manual reload?"*
  *(Answer: Per FR-10, through optimistic client state transitions and 5-second short-interval polling on active contract views, avoiding the server complexity of persistent WebSockets.)*

---

## 13. Escrow Mechanism & Atomic Fund Locking

### Question 13
*"Explain the exact lifecycle of escrow funds from contract initiation to release."*

- **What the evaluator is testing**: End-to-end understanding of the financial state flow across Engine 01 and Engine 03.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 17, 18; `functional-requirements.md` (FR-01, FR-05).
- **Strong answer**:
  "1. *Locking (FR-01)*: Upon contract signing, client deposits funds for Milestone 1. Inside an atomic transaction, the client's available balance is debited and the contract's `escrow_balance` is credited. State: `FUNDED`.
  2. *Execution*: Freelancer works and submits deliverable. State: `UNDER_REVIEW`.
  3. *Release (FR-05)*: Client approves deliverable. Inside an atomic transaction, `escrow_balance` is debited, the freelancer's balance is credited, and milestone transitions to `RELEASED`.
  4. *Dispute Path*: If disputed, funds remain locked in escrow until the Dispute Reviewer issues a binding ruling (full release, full refund, or split settlement)."
- **Possible follow-up**:
  *"What happens to funds if the project is cancelled before work begins?"*
  *(Answer: If the contract is cancelled in `FUNDED` state before work starts, an atomic refund transaction credits the client's balance and closes the contract.)*

---

## 14. Deterministic FSM State Transitions

### Question 14
*"Show me the state machine transition table for milestones. What transitions are strictly forbidden?"*

- **What the evaluator is testing**: FSM formalization rigor and edge-case handling.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 18; `functional-requirements.md` (FR-02).
- **Strong answer**:
  "The milestone FSM enforces:
  - `AWAITING_DEPOSIT` $\rightarrow$ `FUNDED` (Action: Deposit funds)
  - `FUNDED` $\rightarrow$ `IN_PROGRESS` (Action: Commence work)
  - `IN_PROGRESS` $\rightarrow$ `UNDER_REVIEW` (Action: Submit deliverable)
  - `UNDER_REVIEW` $\rightarrow$ `RELEASED` (Action: Approve milestone)
  - `UNDER_REVIEW` $\rightarrow$ `IN_PROGRESS` (Action: Request revision)
  - `UNDER_REVIEW` $\rightarrow$ `DISPUTED` (Action: Raise dispute)
  - `DISPUTED` $\rightarrow$ `RESOLVED` (Action: Reviewer ruling)
  Forbidden transitions include: `AWAITING_DEPOSIT` $\rightarrow$ `RELEASED`, `IN_PROGRESS` $\rightarrow$ `RELEASED`, and any transition out of `RELEASED`. Out-of-order calls are blocked by the validator with HTTP 422."
- **Possible follow-up**:
  *"Can a milestone transition directly from `AWAITING_DEPOSIT` to `DISPUTED`?"*
  *(Answer: No. A dispute can only be raised on funded or submitted work where deliverables or expectations conflict.)*

---

## 15. Cryptographic SHA-256 Deliverable Checksums

### Question 15
*"Why use SHA-256? What does the checksum actually prove?"*

- **What the evaluator is testing**: Cryptographic integrity principles and evidence handling.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 16, 18; `engine-02-dsa-se.md` (FR-03).
- **Strong answer**:
  "SHA-256 produces a deterministic 256-bit collision-resistant digest of the submitted file stream. It provides tamper evidence:
  1. When a freelancer submits work, the hash is computed immediately and stored in the database.
  2. When the client or reviewer inspects the deliverable, the file is re-hashed.
  3. If even a single byte has been altered, the digest changes completely (avalanche effect).
  This cryptographically proves to the dispute reviewer whether the file inspected is identical to the exact file submitted by the freelancer."
- **Possible follow-up**:
  *"What if the deliverable is a GitHub repository link rather than a ZIP archive?"*
  *(Answer: For repository deliverables, Engine 02 captures and stores the immutable Git commit SHA along with the repository URL as the verification hash.)*

---

## 16. In-Memory Evidence Tree Data Structure

### Question 16
*"Describe the exact class structure and algorithm for the EvidenceTree in Engine 02."*

- **What the evaluator is testing**: Darshan Kittur's DSA data structure design.
- **Evidence from project documents**: `engine-02-dsa-se.md`; `gate-1-hard-questions.md` Q3.
- **Strong answer**:
  "The `EvidenceTree` is an N-ary tree data structure where:
  - `EvidenceNode`: Contains `id`, `nodeType` (`ROOT`, `DELIVERABLE`, `REVISION_NOTE`, `COUNTER_EXHIBIT`), `payloadHash` (SHA-256), `authorId`, `timestamp`, and `children: EvidenceNode[]`.
  - Construction: Initialized with the Milestone contract terms as the root node. Submissions and counter-evidence attach hierarchically as children.
  - Traversal: Engine 02 executes a depth-first traversal to verify all child hashes and synthesize a chronological dispute timeline.
  - Complexity: $O(V+E)$ time complexity where $V$ is evidence artifacts and $E$ is relationships; $O(V)$ space complexity in memory."
- **Possible follow-up**:
  *"Why not use a binary search tree?"*
  *(Answer: Dispute artifacts have hierarchical 1-to-many relationships—one milestone has multiple submissions, each of which may have multiple revision notes and exhibits. An N-ary tree matches the natural domain structure.)*

---

## 17. ACID Transactions & Rollback Semantics

### Question 17
*"In Engine 03, what happens if the server crashes in the middle of a fund release?"*

- **What the evaluator is testing**: Purvi Sammatshetti's transaction management and database fault recovery.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 14, 18; `engine-03-dbms.md` (FR-05).
- **Strong answer**:
  "All fund releases execute inside an atomic transaction block (`prisma.$transaction`). In ACID transactions:
  - *Atomicity*: All operations—debiting contract escrow, crediting the developer, updating milestone status, and appending the audit log—succeed together or fail together.
  - If a server crash or database disconnection occurs mid-transaction, SQLite's write-ahead log (WAL) rolls back the uncommitted transaction upon restart.
  - Balances revert to their exact pre-transaction values; partial updates cannot exist in the database."
- **Possible follow-up**:
  *"What isolation level does SQLite use for transactions?"*
  *(Answer: SQLite uses `SERIALIZABLE` isolation in WAL mode for write transactions, ensuring complete isolation from concurrent operations.)*

---

## 18. Role-Based Access Control (RBAC) & Middleware

### Question 18
*"What roles exist in the system and what are their exact authorization boundaries?"*

- **What the evaluator is testing**: Vaibhav Chavanpatil's RBAC matrix design and security boundary enforcement.
- **Evidence from project documents**: `Mini_Project_Gate_0_details_FILLED.docx` Step 2; `security-model.md` Section 2; `engine-04-web.md`.
- **Strong answer**:
  "Four distinct roles are enforced via RBAC middleware:
  1. `CLIENT`: Can create projects, fund escrow, review deliverables, approve milestones, and raise disputes. Cannot submit deliverables or arbitrate disputes.
  2. `FREELANCER`: Can browse projects, submit proposals, upload deliverables, and contest disputes. Cannot fund escrow or approve milestones.
  3. `DISPUTE_REVIEWER`: Can view assigned dispute cases, inspect evidence trees, and issue binding rulings. Cannot create contracts or modify milestone deliverables.
  4. `ADMIN`: Can manage user accounts, monitor system health, and inspect audit logs. Cannot alter escrow balances directly without an audit event."
- **Possible follow-up**:
  *"Can a user be both a client and a freelancer on different projects?"*
  *(Answer: Yes, user roles are scoped at the session and contract level, but on any specific contract, their active role is strictly enforced by RBAC.)*

---

## 19. Heuristic Tag-Based AI Semantic Matching

### Question 19
*"Explain the mathematical formula and engine ownership for FR-11 (AI Semantic Matching)."*

- **What the evaluator is testing**: Darshan Kittur's algorithmic understanding and resolution of the dual-ownership ambiguity.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 11, 18; `gate-1-team-decisions.md` (Decision D-01).
- **Strong answer**:
  "Under pending team decision D-01:
  - **Primary Owner**: Engine 02 (Darshan Kittur) owns the matching algorithm and heuristic scoring equation.
  - **Supporting Dependency**: Engine 03 (Purvi Sammatshetti) provides indexed SQL queries to retrieve skill tags and developer stats.
  The matching equation computes:
  $$\text{Score} = w_1 \cdot \text{Jaccard}(\text{Tags}_{\text{req}}, \text{Tags}_{\text{dev}}) + w_2 \cdot \text{RateComp} + w_3 \cdot \text{GitHubVelocity}$$
  where Jaccard similarity measures skill overlap, rate compatibility checks budget fit, and GitHub velocity reflects commit frequency."
- **Possible follow-up**:
  *"Why isn't this an autonomous machine learning model?"*
  *(Answer: Heuristic matching provides deterministic, explainable scoring without training overhead or hallucination risks, fulfilling the academic objective within local constraints.)*

---

## 20. Evidence-Based Human Dispute Arbitration

### Question 20
*"Why does the team reject autonomous AI dispute arbitration in favor of human dispute reviewers?"*

- **What the evaluator is testing**: Ethical AI reasoning, scope compliance, and alignment with Gate 0 decisions.
- **Evidence from project documents**: `Mini_Project_Gate_0_details_FILLED.docx` Step 5 (Out-of-Scope #4); `gate-1-hard-questions.md` Q2 & Q7.
- **Strong answer**:
  "Autonomous AI dispute arbitration is strictly excluded under Gate 0 Step 5 for three reasons:
  1. *Nuance & Scope Interpretation*: Software deliverables involve creative and qualitative specifications that probabilistic models cannot reliably evaluate.
  2. *Hallucination & Liability*: Automated rulings that disburse funds create legal liability and lack academic auditability.
  3. *Human Accountability*: Our system uses AI only where appropriate (proposal matching); for dispute resolution, human reviewers make final binding rulings supported by immutable evidence trees and cryptographic checksums."
- **Possible follow-up**:
  *"What tools does the Dispute Reviewer have to make an informed ruling?"*
  *(Answer: The Reviewer Console renders the complete EvidenceTree, displaying contract terms, deliverable checksums, revision feedback, and counter-evidence in a single verifiable view.)*

---

## 21. Defensive Security Architecture & Threat Vectors

### Question 21
*"How does your requirements baseline address the OWASP Top 10 vulnerabilities?"*

- **What the evaluator is testing**: Security-by-design principles across all four engines.
- **Evidence from project documents**: `docs/security/security-model.md`; `non-functional-requirements.md` (NFR-02, NFR-04).
- **Strong answer**:
  "Our baseline embeds defensive controls across all tiers:
  1. *Injection (A03)*: 100% of API inputs are validated at the boundary using strict Zod schemas; database queries use Prisma parameterized queries, preventing SQL injection.
  2. *Broken Access Control (A01)*: RBAC middleware validates every private route handler; sessions are verified before any domain logic executes (NFR-02).
  3. *Cryptographic Failures (A02)*: Deliverable integrity is protected via SHA-256 checksums; passwords/tokens are securely hashed.
  4. *Security Logging & Monitoring (A09)*: Immutable append-only audit logs record all contract state changes and dispute rulings (FR-06, NFR-09)."
- **Possible follow-up**:
  *"Where are API secrets stored?"*
  *(Answer: In local environment files ignored by Git; zero hardcoded secrets are permitted in the codebase, enforced by automated `./scripts/security-check`.)*

---

## 22. Verification, Validation & Test Pyramid Strategy

### Question 22
*"How will the team verify that requirements are met during Stage S3 implementation?"*

- **What the evaluator is testing**: Understanding of Test-Driven Development (TDD) and verification planning for Gate 3 and 4.
- **Evidence from project documents**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 20, 21; `docs/development/testing-strategy.md`.
- **Strong answer**:
  "We employ a disciplined testing pyramid following TDD (Red-Green-Refactor):
  1. *Unit Tests (70%)*: Fast, isolated tests covering Engine 01 FSM transitions, Engine 02 SHA-256 and Jaccard math, and Engine 04 schema validation.
  2. *Integration Tests (20%)*: Multi-engine tests verifying atomic database transactions (`prisma.$transaction`), RBAC middleware rejection codes (401/403), and contract action protocols.
  3. *End-to-End Tests (10%)*: Full workflow execution from project posting to proposal matching, milestone deposit, deliverable hashing, and escrow release.
  Every test traces directly back to an FR acceptance criterion via the RTM."
- **Possible follow-up**:
  *"What automated checks run before code can be merged?"*
  *(Answer: Our automated verification script `./scripts/verify` runs environment bootstrapping, shell linting, trailing whitespace checks, secret scanning, and critical documentation checks.)*
