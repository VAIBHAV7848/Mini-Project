# Gate 1 Team Member Defense Rehearsal Guide

> **Institution**: KLE Technological University (Dr. M. S. Sheshgiri College of Engineering & Technology, Belagavi)
> **Department**: Department of Computer Science and Engineering
> **Course / Framework**: Engine-Based Mini-Project Framework with Hybrid SDLC (Theme 01)
> **Project Title**: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow
> **Team**: Team 07
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1 Defense)
> **Governance Note**: Gate 1 evaluates the requirements engineering baseline. Code, UI prototypes, and database implementations are out-of-scope for Gate 1. Gate 1 approval has not yet been granted; Stage S2 remains blocked.

---

## 1. Vaishnavi Modekar — Engine 01 (OS Engine)

- **Student Name**: Vaishnavi Modekar
- **Roll No**: 21 | **SRN**: `02FE24BCS060`
- **Owning Engine**: **Engine 01 — Escrow & State Scheduler**
- **Foundational Course Area**: Operating Systems (Core CSE 4th/5th Semester)

### Opening Explanation
> *"Good morning evaluators. I am Vaishnavi Modekar, owning Engine 01, the Escrow and State Scheduler. My engine models the core lifecycle of freelance contracts as an Operating Systems process scheduler. In traditional freelance arrangements, milestones suffer from state ambiguity, race conditions during concurrent payments, and deadlock when clients delay deliverable reviews indefinitely. Engine 01 solves these issues by enforcing a deterministic Finite State Machine, atomic fund locking to guarantee mutual exclusion, and a timer interrupt watchdog to prevent process starvation."*

### Owned Functional Requirements
1. **FR-01 (Escrow Fund Locking)**: System atomically locks client funds upon contract initiation before work begins; zero double-allocation permitted.
2. **FR-02 (Milestone State Tracking)**: System enforces sequential FSM transitions (`AWAITING_DEPOSIT` $\rightarrow$ `FUNDED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `RELEASED`); invalid state jumps are rejected.
3. **FR-12 (Contract Lifecycle Orchestration)**: System coordinates the multi-phase contract lifecycle from proposal acceptance to milestone completion and final gig closure.

### Core Academic Concepts Mapped to Operating Systems
- **Finite State Machine (FSM)**: Deterministic process state transitions with explicit entry preconditions, guards, and terminal states.
- **Mutual Exclusion & Critical Sections**: Protecting escrow balance mutation from race conditions or double-spending anomalies.
- **Timer Interrupt Watchdog**: Implementing automated review timeouts (Decision D-02: 7 calendar days) to break deadlock when a client fails to review submitted work.
- **Deadlock Avoidance**: Enforcing sequential milestone dependency order so funds cannot be locked out of sequence.

### Expected Evaluator Questions & Ideal Concise Answers

#### Q1: "How does your engine enforce that a milestone cannot jump directly from FUNDED to RELEASED?"
- **Ideal Concise Answer**:
  "Engine 01 implements a deterministic FSM state transition validator. Every action evaluates the current milestone state against an explicit transition matrix. To reach `RELEASED`, the milestone must first transition through `IN_PROGRESS` and `UNDER_REVIEW`, requiring verified deliverable submission. If an API request attempts an illegal jump from `FUNDED` directly to `RELEASED`, the validator blocks the transition and raises an `INVALID_STATE_TRANSITION` error with HTTP 422."

#### Q2: "What OS concept handles client approval delays?"
- **Ideal Concise Answer**:
  "The **Timer Interrupt Watchdog**. Under Gate 0 stakeholder analysis, freelancers identified indefinite client approval delays as a primary cause of payment starvation. Under Decision D-02 (currently pending team ratification), when a deliverable enters `UNDER_REVIEW`, Engine 01 starts a 7-calendar-day timer. If the client neither approves nor requests revisions before the timer expires, the watchdog triggers a timeout escalation, transitioning the milestone to auto-approval or administrative arbitration to prevent process starvation."

#### Q3: "What happens if two concurrent requests attempt to lock the same milestone balance?"
- **Ideal Concise Answer**:
  "Engine 01 treats balance allocation as a critical section requiring mutual exclusion. Combined with Engine 03's serialized database transactions, the FSM checks the milestone's current state atomically. The first request successfully locks the funds and transitions the state to `FUNDED`. The second request detects that the milestone is no longer in `AWAITING_DEPOSIT` and is rejected, preventing race conditions and double-allocation anomalies."

### Difficult Follow-Ups & Defensive Counter-Strategies

- **Evaluator Challenge**: *"Is this really an Operating System, or are you just calling standard JavaScript if-else statements?"*
  - **Defensive Counter-Strategy**: Concede that it runs on a Node.js runtime, but emphasize the theoretical mapping: *"The underlying runtime is JavaScript, but the algorithmic design strictly implements OS process synchronization principles: deterministic state scheduling, critical section protection, and timer-driven watchdog interrupts to prevent starvation. In Stage S3, I will prove this with automated model-checking test suites that attempt illegal state transitions and race conditions."*

---

## 2. Darshan Kittur — Engine 02 (DSA & SE Engine)

- **Student Name**: Darshan Kittur
- **Roll No**: 18 | **SRN**: `02FE24BCS053`
- **Owning Engine**: **Engine 02 — Evidence & Quality Assurance Engine**
- **Foundational Course Area**: Data Structures & Algorithms (DSA) and Software Engineering (SE)

### Opening Explanation
> *"Good morning evaluators. I am Darshan Kittur, owning Engine 02, the Evidence and Quality Assurance Engine. My engine provides the cryptographic proof and algorithmic foundations for the platform. In freelance disputes, disagreements usually devolve into subjective arguments because platforms lack tamper-evident proof of deliverables. Engine 02 solves this by generating SHA-256 cryptographic checksums for every artifact, indexing dispute documentation into an in-memory hierarchical EvidenceTree for $O(V+E)$ traversal, providing an objective AI heuristic proposal matcher, and enforcing the Requirements Traceability Matrix."*

### Owned Functional Requirements
1. **FR-03 (Cryptographic Checksums)**: Computes 256-bit SHA-256 digests for all submitted deliverable files and URLs upon milestone submission.
2. **FR-04 (Evidence Trees)**: Indexes project artifacts, feedback, and counter-evidence into an in-memory hierarchical N-ary tree (`EvidenceTree`) for dispute inspection.
3. **FR-11 (AI Semantic Matching — Primary Owner per D-01)**: Calculates multi-factor compatibility scores between project skill tags, budgets, and developer profile metrics using a weighted heuristic algorithm.

### Core Academic Concepts Mapped to DSA & Software Engineering
- **Cryptographic Hashing**: SHA-256 collision resistance, avalanche effect, and tamper detection.
- **Tree Data Structures**: In-memory N-ary hierarchical tree representation (`EvidenceTree`) with depth-first traversal and $O(V+E)$ complexity.
- **Algorithm Design & Heuristics**: Jaccard set similarity scoring and weighted multi-attribute ranking for proposal matching.
- **Software Engineering Rigor**: Requirements Traceability Matrix (RTM), Verification & Validation (V&V) pipelines, and Test-Driven Development (TDD).

### Expected Evaluator Questions & Ideal Concise Answers

#### Q1: "Why do you need an EvidenceTree class if all records are stored in database tables?"
- **Ideal Concise Answer**:
  "Relational tables store records as flat, disconnected rows. In contrast, dispute arbitration requires analyzing a causal, hierarchical timeline: a milestone is contested, linked to specific deliverable submissions, which are linked to revision feedback, which in turn spawn counter-evidence exhibits. Engine 02 reconstructs these relationships in memory as an N-ary `EvidenceTree`. The milestone acts as the root node, and evidence acts as child nodes with SHA-256 hashes. Depth-first traversal allows the dispute reviewer to verify the entire cryptographic chain of custody in $O(V+E)$ time."

#### Q2: "How does your proposal matching algorithm work (FR-11)?"
- **Ideal Concise Answer**:
  "Under pending team decision D-01, I own the matching algorithm while Purvi provides the database query dependency. The algorithm computes a weighted multi-attribute compatibility score between 0 and 100%:
  $$\text{Score} = w_1 \cdot \text{Jaccard}(\text{Tags}_{\text{req}}, \text{Tags}_{\text{dev}}) + w_2 \cdot \text{RateComp} + w_3 \cdot \text{GitHubVelocity}$$
  Jaccard similarity measures skill tag overlap, rate compatibility checks budget fit, and GitHub velocity reflects commit frequency. This provides objective, explainable rankings without black-box ML risks."

#### Q3: "What happens if a developer alters one byte of a submitted file?"
- **Ideal Concise Answer**:
  "Because of the avalanche effect inherent in SHA-256, changing a single byte alters approximately 50% of the output hash bits. When the file is re-hashed upon client or reviewer inspection, the computed digest will not match the immutable hash stored in the database at submission time. The system flags this as a 100% hash mismatch under NFR-03, providing irrefutable proof of file tampering."

### Difficult Follow-Ups & Defensive Counter-Strategies

- **Evaluator Challenge**: *"Slide 17 listed FR-11 as split between E2 and E3. Who is actually responsible if the matching score produces bad rankings?"*
  - **Defensive Counter-Strategy**: Address the decision directly: *"That was an ambiguity identified during our adversarial review. We formally registered Decision D-01 in `gate-1-team-decisions.md`: I am the primary owner responsible for algorithm design, heuristic weighting, and scoring accuracy. Purvi owns the supporting persistence dependency for tag storage. If the score is mathematically incorrect, that is 100% my responsibility."*

---

## 3. Purvi Sammatshetti — Engine 03 (DBMS Engine)

- **Student Name**: Purvi Sammatshetti
- **Roll No**: 11 | **SRN**: `02FE24BCS022`
- **Owning Engine**: **Engine 03 — Transaction Ledger & Contract Manager**
- **Foundational Course Area**: Database Management Systems (DBMS)

### Opening Explanation
> *"Good morning evaluators. I am Purvi Sammatshetti, owning Engine 03, the Transaction Ledger and Contract Manager. My engine guarantees the financial data integrity and relational persistence of the system. Freelance platforms handle escrow deposits, milestone releases, and dispute refunds. A failure in database consistency could cause double-spending or lost records. Engine 03 solves this by structuring the schema in Boyce-Codd Normal Form, executing all fund transfers inside strict ACID transactions, and maintaining an append-only, tamper-resistant audit log."*

### Owned Functional Requirements
1. **FR-05 (ACID Payment Processing)**: Processes milestone fund releases, deposits, and refunds via atomic, ACID-compliant database transactions.
2. **FR-06 (Tamper-Resistant Audit Log)**: Appends an immutable audit record for every contract, milestone, and escrow state alteration.
3. **FR-11 (Supporting Persistence Dependency per D-01)**: Provides relational storage, foreign key constraints, and indexed queries for skill tags and developer profiles to support Engine 02's matching algorithm.

### Core Academic Concepts Mapped to Database Management Systems
- **Relational Schema Normalization**: BCNF normalization across Users, Projects, Gigs, Contracts, Milestones, and Payments to prevent insertion, update, and deletion anomalies.
- **ACID Transaction Compliance**: Atomicity, Consistency, Isolation (Serializable write transactions), and Durability using SQLite WAL mode.
- **Tamper-Resistant Audit Logging**: Append-only ledger recording previous states, new states, timestamps, actor IDs, and verification hashes.
- **Index Optimization**: B-Tree indexes on foreign keys, lookup tags, and milestone status fields for low-latency queries (NFR-01).

### Expected Evaluator Questions & Ideal Concise Answers

#### Q1: "Why did you choose SQLite instead of an enterprise DBMS like PostgreSQL or MySQL?"
- **Ideal Concise Answer**:
  "In accordance with KLE academic evaluation criteria, project demonstrations must be fully reproducible on local laboratory Ubuntu workstations without external database server configuration or networking prerequisites. SQLite is an embedded relational engine that provides 100% ACID compliance with WAL mode. It allows me to fully demonstrate BCNF schema design, foreign keys, transaction rollbacks, and B-Tree indexing in a zero-dependency architecture."

#### Q2: "How do you guarantee that money cannot be released twice if two release requests hit the server simultaneously?"
- **Ideal Concise Answer**:
  "Through two independent layers of defense:
  1. Engine 01's FSM checks that the milestone is in `UNDER_REVIEW`; once transitioned to `RELEASED`, subsequent calls are rejected.
  2. In Engine 03, the entire release operation runs inside an atomic `prisma.$transaction` block. Under SQLite WAL mode, write transactions are serialized. The first transaction debits escrow, credits the developer, and marks the status as `RELEASED`. The second transaction reads the committed status, violates the precondition check, and rolls back with zero balance change."

#### Q3: "What fields are stored in the tamper-resistant audit log?"
- **Ideal Concise Answer**:
  "Every audit entry stores: `id` (UUID), `contractId`, `milestoneId`, `actorId`, `action` (e.g. `RELEASE_ESCROW`), `previousState`, `newState`, `amount`, `timestamp` (UTC ISO-8601), and a `verificationHash` linking the audit event to the state alteration. The table is append-only; update and delete operations are strictly prohibited."

### Difficult Follow-Ups & Defensive Counter-Strategies

- **Evaluator Challenge**: *"SQLite has a single-writer lock. What happens if 50 users try to release funds at the exact same moment?"*
  - **Defensive Counter-Strategy**: Demonstrate deep understanding of SQLite concurrency: *"In SQLite WAL mode, readers do not block writers, and writers do not block readers. Only write transactions are serialized. Because our transaction blocks execute in single-digit milliseconds, queued writes complete rapidly under SQLite's busy-timeout handler. For our academic benchmark of 50 concurrent requests (NFR-01), SQLite handles serialized writes with p95 latency well under our 500 ms threshold."*

---

## 4. Vaibhav Chavanpatil — Engine 04 (Web Technologies Engine)

- **Student Name**: Vaibhav Chavanpatil
- **Roll No**: 4 | **SRN**: `02FE24BCS013`
- **Owning Engine**: **Engine 04 — Role-Based Workflow Dashboard**
- **Foundational Course Area**: Web Technologies & Computer Networks (Core CSE 4th/5th Semester)

### Opening Explanation
> *"Good morning evaluators. I am Vaibhav Chavanpatil, owning Engine 04, the Role-Based Workflow Dashboard. My engine is the presentation and access-control gateway of the system. Freelance workflows involve multiple parties with conflicting interests: clients, freelancers, and dispute reviewers. Engine 04 enforces Role-Based Access Control on every route, provides tailored dashboards for each persona, implements dispute submission workflows, and renders real-time milestone progress without page reloads."*

### Owned Functional Requirements
1. **FR-07 (Role-Based Dashboards)**: Renders personalized, responsive interfaces for Clients, Freelancers, Dispute Reviewers, and Administrators.
2. **FR-08 (Authentication & RBAC)**: Authenticates user credentials and enforces Role-Based Access Control middleware on 100% of protected endpoints.
3. **FR-09 (Dispute Workflow)**: Provides structured dispute escalation forms enabling clients and freelancers to submit counter-evidence exhibits.
4. **FR-10 (FSM Progress UI)**: Visually displays milestone progress and escrow lock status across the web dashboard using reactive state updates and 5-second short-interval polling.

### Core Academic Concepts Mapped to Web Technologies
- **Modern Web Framework Architecture**: Next.js 16 App Router, React 19 Server/Client Component isolation, and Tailwind CSS responsive grid.
- **RESTful API Consumption & Contract Protocol**: `POST /api/contracts` action dispatching (`SUBMIT_MILESTONE`, `APPROVE_MILESTONE`, `RELEASE_ESCROW`).
- **Defensive Boundary Validation**: Zod 4 runtime schema validation preventing malformed payloads, injection, and parameter tampering.
- **State Management & Polling**: Optimistic client UI transitions supplemented by short-interval HTTP polling (FR-10) for real-time synchronization.

### Expected Evaluator Questions & Ideal Concise Answers

#### Q1: "Why did you choose short-interval polling instead of WebSockets for real-time updates in FR-10?"
- **Ideal Concise Answer**:
  "Milestone state transitions are discrete, human-driven transactional events that occur hours or days apart, unlike high-frequency streaming applications like chat or gaming. Establishing stateful WebSocket server infrastructure introduces significant memory overhead, connection state management, and reconnection complexity. Stateless REST endpoints with 5-second client polling on active contract views eliminate connection state overhead while satisfying NFR-06 responsiveness and keeping the architecture clean and maintainable."

#### Q2: "How does your RBAC middleware prevent a freelancer from approving their own milestone?"
- **Ideal Concise Answer**:
  "Every private Next.js Server Route Handler runs through our RBAC middleware before reaching domain logic. When a request hits `POST /api/contracts` with action `APPROVE_MILESTONE`, the middleware:
  1. Validates the session token to authenticate the user.
  2. Asserts that the user's role is `CLIENT`.
  3. Verifies that the user's ID matches the designated `client_id` on that specific contract record.
  If a freelancer or unauthorized user submits this request, the middleware immediately halts execution and returns HTTP 403 Forbidden."

#### Q3: "What is the boundary between Server Components and Client Components in your Next.js architecture?"
- **Ideal Concise Answer**:
  "We strictly follow the Next.js App Router boundary model:
  - *Server Components*: Handle data fetching, reading database contracts, and rendering initial static layouts securely on the server without exposing secrets or client bundle bloat.
  - *Client Components* (`'use client'`): Handle interactive presentation: milestone form submissions, dispute file upload stream processing, and dynamic progress bar rendering."

### Difficult Follow-Ups & Defensive Counter-Strategies

- **Evaluator Challenge**: *"Isn't polling inefficient compared to WebSockets? Won't 5-second polling overwhelm your server?"*
  - **Defensive Counter-Strategy**: Ground the answer in concrete workload math: *"Polling is only active on open contract detail pages, not across the entire application. In our academic testing workload of 50 concurrent users, lightweight HTTP GET requests returning 304 Not Modified or small JSON payloads require negligible CPU and memory, well within SQLite's sub-millisecond read capabilities."*

---

## 5. Team Coordination & Cross-Engine Handshake Scenarios

### Scenario A: A deliverable is submitted (FR-02, FR-03, FR-10)
- **Vaibhav (E4)**: Freelancer uploads file via dashboard form; validates payload schema using Zod 4.
- **Darshan (E2)**: File stream passed to Engine 02; computes SHA-256 digest (`crypto.createHash('sha256')`).
- **Vaishnavi (E1)**: FSM validator checks that milestone is `IN_PROGRESS`; transitions milestone to `UNDER_REVIEW`. Starts 7-day review watchdog (D-02).
- **Purvi (E3)**: Persists deliverable record with computed checksum; writes immutable audit record.
- **Vaibhav (E4)**: Dashboard updates milestone progress visualizer displaying `UNDER_REVIEW` to client.

### Scenario B: A dispute is raised (FR-04, FR-06, FR-09)
- **Vaibhav (E4)**: Contesting party submits dispute form with counter-evidence files.
- **Darshan (E2)**: Hashes evidence files; creates new `EvidenceNode` and attaches it to the milestone's `EvidenceTree`.
- **Vaishnavi (E1)**: FSM transitions milestone to `DISPUTED`; halts automated escrow release timers.
- **Purvi (E3)**: Persists dispute record; locks escrow balance; appends audit entry.
- **Darshan (E2)**: Dispute Reviewer opens console; Engine 02 traverses `EvidenceTree` ($O(V+E)$) to display verified hierarchical evidence timeline.
