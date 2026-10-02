# Gate 1 Timed Presentation & Delivery Sequence

> **Institution**: KLE Technological University (Dr. M. S. Sheshgiri College of Engineering & Technology, Belagavi)
> **Department**: Department of Computer Science and Engineering
> **Course / Framework**: Engine-Based Mini-Project Framework with Hybrid SDLC (Theme 01)
> **Project Title**: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow
> **Team**: Team 07 (Vaibhav Chavanpatil, Vaishnavi Modekar, Darshan Kittur, Purvi Sammatshetti)
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1 Defense)
> **Timing Governance**: The official project source documents do not prescribe a fixed presentation duration. Total presentation duration must be decided by the student team based on the specific time slot allocated by the evaluation committee (e.g., 10-minute express slot, 15-minute standard slot, or 20-minute extended defense). This guide provides proportional timing allocations suitable for any allocated window.

---

## 1. Presentation Timing Models

| Section | Topic | Primary Speaker | 10-Min Express | 15-Min Standard | 20-Min Extended |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sec 1** | Project Identity & Academic Context | **Vaibhav** | 0.5 min | 1.0 min | 1.5 min |
| **Sec 2** | Problem Statement & Objectives | **Vaishnavi** | 1.0 min | 1.5 min | 2.0 min |
| **Sec 3** | In-Scope & Out-of-Scope Boundaries | **Purvi** | 0.5 min | 1.0 min | 1.5 min |
| **Sec 4** | Use Cases & Contract Action Protocol | **Darshan** | 1.0 min | 1.5 min | 2.0 min |
| **Sec 5** | Engine 01 (OS): Escrow & State Scheduler | **Vaishnavi** | 1.5 min | 2.0 min | 2.5 min |
| **Sec 6** | Engine 02 (DSA/SE): Evidence & QA Engine | **Darshan** | 1.5 min | 2.0 min | 2.5 min |
| **Sec 7** | Engine 03 (DBMS): Transaction Ledger | **Purvi** | 1.5 min | 2.0 min | 2.5 min |
| **Sec 8** | Engine 04 (Web): Workflow Dashboard | **Vaibhav** | 1.0 min | 1.5 min | 2.0 min |
| **Sec 9** | Non-Functional Requirements & KPIs | **Purvi** | 0.5 min | 1.0 min | 1.5 min |
| **Sec 10** | RTM & Verification Strategy | **Darshan** | 0.5 min | 1.0 min | 1.5 min |
| **Sec 11** | Pending Team Decisions (D-01 to D-03) | **Vaishnavi** | 0.5 min | 0.5 min | 0.5 min |
| **Sec 12** | Conclusion & Q&A Transition | **Vaibhav** | 0.5 min | 0.5 min | 0.5 min |
| **Total** | **Structured Presentation Delivery** | **All 4 Members** | **10.5 min** | **16.0 min** | **20.5 min** |

---

## 2. Detailed Presentation Sequence & Transitions

### Section 1: Project Identity & Academic Context
- **Speaker**: **Vaibhav Chavanpatil** (Roll No: 4)
- **Approximate Speaking Time**: 1.0 min (Standard) / 0.5 min (Express)
- **Key Points**:
  - Welcome evaluators; introduce Team 07 under Theme 01 of the Engine-Based Mini-Project Framework with Hybrid SDLC.
  - Project title: *Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow*.
  - Introduce the 4-student team and announce individual engine ownership: Vaishnavi (OS), Darshan (DSA/SE), Purvi (DBMS), and Vaibhav (Web Technologies).
  - Clarify academic standing: Gate 0 is completed; Stage S1 requirements baseline is frozen and ready for evaluation; Stage S2 implementation remains blocked until approval.
- **Evidence / Document**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 1–2; `team-project-overview.md`.
- **Transition to Next Speaker**:
  > *"To explain the core stakeholder problems and our measurable project objectives, I will now hand over to Vaishnavi Modekar."*

---

### Section 2: Problem Statement & Measurable Objectives
- **Speaker**: **Vaishnavi Modekar** (Roll No: 21)
- **Approximate Speaking Time**: 1.5 min (Standard) / 1.0 min (Express)
- **Key Points**:
  - Problem Statement: Digital freelance markets suffer from payment starvation, deliverable scope creep, and arbitrary dispute outcomes.
  - AS-IS Workflow Flaws: Gate 0 Step 3 analysis identified lack of milestone enforcement, absence of cryptographic deliverable proofs, and opaque customer-support dispute resolutions.
  - Five Measurable Objectives: (1) Reduce approval delays via 7-day watchdog timer, (2) 100% SHA-256 deliverable fingerprinting, (3) Zero double-allocation financial anomalies, (4) Objective proposal match scoring, and (5) 100% audit log coverage.
- **Evidence / Document**: `Mini_Project_Gate_0_details_FILLED.docx` Steps 1, 3, 4; `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 3.
- **Transition to Next Speaker**:
  > *"To detail how we established clear boundaries around these objectives to prevent scope creep, Purvi Sammatshetti will present our scope matrix."*

---

### Section 3: In-Scope Deliverables & Out-of-Scope Boundaries
- **Speaker**: **Purvi Sammatshetti** (Roll No: 11)
- **Approximate Speaking Time**: 1.0 min (Standard) / 0.5 min (Express)
- **Key Points**:
  - In-Scope Core: User RBAC, project postings, milestone state tracking, deliverable SHA-256 evidence submissions, simulated escrow locking/release, and human dispute arbitration.
  - Six Explicit Out-of-Scope Boundaries (Gate 0 Step 5): (1) Real banking gateways / credit cards (simulated currency used), (2) Legal court contracts, (3) Native mobile applications, (4) Autonomous AI arbitration (human reviewers mandatory), (5) Unlimited video/streaming hosting, and (6) Corporate taxation systems.
- **Evidence / Document**: `Mini_Project_Gate_0_details_FILLED.docx` Step 5; `project-scope.md` Section 1.
- **Transition to Next Speaker**:
  > *"To explain how these requirements translate into concrete user interactions and contract actions, Darshan Kittur will cover our Use Cases."*

---

### Section 4: Use Cases & Contract Action Protocol
- **Speaker**: **Darshan Kittur** (Roll No: 18)
- **Approximate Speaking Time**: 1.5 min (Standard) / 1.0 min (Express)
- **Key Points**:
  - Actor Catalog: Clients, Freelancers, Dispute Reviewers, and System Engines.
  - Core Use Cases: UC-01 (Contract Initiation & Escrow Lock), UC-02 (Deliverable Submission & SHA-256 Hashing), UC-03 (Milestone Verification & Release), UC-04 (Dispute Escalation & Evidence Tree Arbitration), UC-05 (AI Proposal Matching).
  - Contract Action Protocol (`POST /api/contracts`): `SUBMIT_MILESTONE` $\rightarrow$ `APPROVE_MILESTONE` $\rightarrow$ `RELEASE_ESCROW`.
- **Evidence / Document**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 17; `docs/requirements/use-cases.md`.
- **Transition to Next Speaker**:
  > *"Now, we will present our individual engine decompositions. Vaishnavi Modekar will begin with Engine 01, the Operating Systems Engine."*

---

### Section 5: Engine 01 (OS Engine) — Escrow & State Scheduler
- **Speaker**: **Vaishnavi Modekar** (Roll No: 21)
- **Approximate Speaking Time**: 2.0 min (Standard) / 1.5 min (Express)
- **Key Points**:
  - Mapped Subject: Operating Systems (Core CSE 4th/5th Semester).
  - Owned Requirements: FR-01 (Fund Locking), FR-02 (Milestone State Tracking), FR-12 (Contract Lifecycle Orchestration).
  - Academic Mapping:
    - *Deterministic FSM*: Strict lifecycle transitions (`AWAITING_DEPOSIT` $\rightarrow$ `FUNDED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `RELEASED`); illegal state jumps blocked with HTTP 422.
    - *Mutual Exclusion*: Atomic fund locking prevents concurrent double-allocation of balances.
    - *Timer Interrupt Watchdog*: Review timeout watchdog triggers after 7 calendar days (D-02) to prevent freelancer starvation.
- **Evidence / Document**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 9, 12, 18; `engine-01-os.md`.
- **Transition to Next Speaker**:
  > *"Next, Darshan Kittur will present Engine 02, covering Data Structures, Algorithms, and Software Engineering QA."*

---

### Section 6: Engine 02 (DSA & SE Engine) — Evidence & Quality Assurance
- **Speaker**: **Darshan Kittur** (Roll No: 18)
- **Approximate Speaking Time**: 2.0 min (Standard) / 1.5 min (Express)
- **Key Points**:
  - Mapped Subject: Data Structures & Algorithms (DSA) and Software Engineering (SE).
  - Owned Requirements: FR-03 (SHA-256 Checksums), FR-04 (Evidence Trees), FR-11 (AI Semantic Matching — Primary Owner per D-01).
  - Academic Mapping:
    - *Cryptographic Checksums*: 256-bit SHA-256 digest computed on upload stream; 100% tamper detection (NFR-03).
    - *In-Memory EvidenceTree*: Hierarchical N-ary tree data structure representing milestone deliverables and dispute exhibits; depth-first traversal with $O(V+E)$ complexity.
    - *Heuristic Matching Math*: Weighted Jaccard skill tag set overlap combined with rate fit and developer commit velocity.
- **Evidence / Document**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 10, 11, 13; `engine-02-dsa-se.md`.
- **Transition to Next Speaker**:
  > *"Next, Purvi Sammatshetti will present Engine 03, covering Database Management Systems."*

---

### Section 7: Engine 03 (DBMS Engine) — Transaction Ledger & Contract Manager
- **Speaker**: **Purvi Sammatshetti** (Roll No: 11)
- **Approximate Speaking Time**: 2.0 min (Standard) / 1.5 min (Express)
- **Key Points**:
  - Mapped Subject: Database Management Systems (DBMS).
  - Owned Requirements: FR-05 (ACID Payment Processing), FR-06 (Tamper-Resistant Audit Log), FR-11 (Supporting Persistence Dependency per D-01).
  - Academic Mapping:
    - *Relational Normalization*: Boyce-Codd Normal Form (BCNF) across 6 core entities to prevent update and deletion anomalies.
    - *ACID Transactions*: SQLite WAL mode with `prisma.$transaction`; atomic balance debits and credits; automatic rollback on failure.
    - *Append-Only Audit Log*: Immutable historical ledger capturing actor ID, action, timestamp, previous state, new state, and verification hash.
- **Evidence / Document**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 10, 14, 16; `engine-03-dbms.md`.
- **Transition to Next Speaker**:
  > *"Next, Vaibhav Chavanpatil will present Engine 04, covering Web Technologies and User Workflows."*

---

### Section 8: Engine 04 (Web Technologies Engine) — Role-Based Dashboard
- **Speaker**: **Vaibhav Chavanpatil** (Roll No: 4)
- **Approximate Speaking Time**: 1.5 min (Standard) / 1.0 min (Express)
- **Key Points**:
  - Mapped Subject: Web Technologies & Computer Networks.
  - Owned Requirements: FR-07 (Role-Based Dashboards), FR-08 (Authentication & RBAC), FR-09 (Dispute Workflow), FR-10 (FSM Progress UI).
  - Academic Mapping:
    - *Next.js 16 App Router & React 19*: Clean Server/Client Component boundary; responsive Tailwind CSS grid.
    - *RBAC Middleware*: Enforces least-privilege role validation on 100% of protected route handlers (HTTP 401/403).
    - *Optimistic UI & Short-Interval Polling*: 5-second polling cycle on active contracts updates milestone progress bars without WebSocket server overhead.
- **Evidence / Document**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 10, 15, 17; `engine-04-web.md`.
- **Transition to Next Speaker**:
  > *"To explain how we measure quality across all four engines, Purvi Sammatshetti will present our Non-Functional Requirements."*

---

### Section 9: Non-Functional Requirements & Measurable KPIs
- **Speaker**: **Purvi Sammatshetti** (Roll No: 11)
- **Approximate Speaking Time**: 1.0 min (Standard) / 0.5 min (Express)
- **Key Points**:
  - NFR Matrix Highlights:
    - *NFR-01 (Performance)*: p95 latency $\le 500\text{ ms}$ under 50 concurrent requests.
    - *NFR-02 (Security)*: 100% of private routes guarded by RBAC middleware.
    - *NFR-03 (Data Integrity)*: 100% detection of deliverable byte tampering.
    - *NFR-05 (FSM Reliability)*: Zero invalid or out-of-order state transitions.
    - *NFR-08 (Consistency)*: Zero double-allocation financial anomalies under parallel stress tests.
    - *NFR-09 (Auditability)*: 100% of contract state modifications captured in audit log.
- **Evidence / Document**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 19; `non-functional-requirements.md`.
- **Transition to Next Speaker**:
  > *"To demonstrate our end-to-end traceability and testing strategy, Darshan Kittur will present our RTM."*

---

### Section 10: Requirements Traceability Matrix & Verification Strategy
- **Speaker**: **Darshan Kittur** (Roll No: 18)
- **Approximate Speaking Time**: 1.0 min (Standard) / 0.5 min (Express)
- **Key Points**:
  - Full Bidirectional Traceability: Gate 0 Need $\rightarrow$ FR $\rightarrow$ Use Case $\rightarrow$ Owning Engine $\rightarrow$ Student Owner $\rightarrow$ Target NFR.
  - Zero orphan requirements; zero scope creep.
  - Test-Driven Development (TDD) Strategy for Stage S3: 70% unit tests, 20% integration tests, 10% end-to-end tests.
  - Pre-commit verification: Automated `./scripts/verify` checking bootstrap, shell linting, trailing whitespace, and secret hygiene.
- **Evidence / Document**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slides 20, 21, 23; `requirements.md`.
- **Transition to Next Speaker**:
  > *"To summarize our pending team decisions awaiting faculty ratification today, Vaishnavi Modekar will present our decisions register."*

---

### Section 11: Pending Team Decisions Register (D-01 to D-03)
- **Speaker**: **Vaishnavi Modekar** (Roll No: 21)
- **Approximate Speaking Time**: 0.5 min
- **Key Points**:
  - Academic Integrity: Demonstrating disciplined requirements management by tracking pending items openly rather than making silent assumptions:
    - **Decision D-01 (FR-11 Ownership)**: Proposed Engine 02 (Darshan Kittur) as Primary Owner, Engine 03 (Purvi Sammatshetti) as Supporting Dependency (`STATUS: PENDING TEAM RATIFICATION`).
    - **Decision D-02 (Review Timeout)**: Proposed default window of 7 calendar days before watchdog auto-release escalation (`STATUS: PENDING TEAM RATIFICATION`).
    - **Decision D-03 (Production Cloud Hosting)**: External cloud deployment deferred to post-academic phase; local Ubuntu laboratory execution maintained for Gates 1–4 (`STATUS: DEFERRED`).
- **Evidence / Document**: `docs/requirements/gate-1-team-decisions.md`.
- **Transition to Next Speaker**:
  > *"To conclude our presentation and open the floor for evaluator questions, I hand back to Vaibhav Chavanpatil."*

---

### Section 12: Conclusion & Q&A Transition
- **Speaker**: **Vaibhav Chavanpatil** (Roll No: 4)
- **Approximate Speaking Time**: 0.5 min
- **Key Points**:
  - Summary: Team 07 has established a bounded, verified, and traceable requirements engineering baseline aligned with the department's Engine-Based Hybrid SDLC.
  - Reiterate Gate Status: Stage S1 requirements baseline is structurally frozen. No application code or database scaffolding has been implemented.
  - Respect Academic Progression: Stage S2 (Shared Architecture) remains strictly blocked until formal Gate 1 evaluation and approval.
  - Invite evaluator questions:
    > *"Thank you respected evaluators. We are now fully prepared and welcome your technical questions across all four engines."*
- **Evidence / Document**: `GATE-1-PACKAGE.md` Section 14; `gate-1-final-checklist.md`.
