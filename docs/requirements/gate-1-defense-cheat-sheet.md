# Gate 1 Defense Cheat Sheet: 21 Key Evaluator Questions & Answers

> **Purpose**: Quick-reference defense preparation for Team 07 during the KLE Technological University Gate 1 (Stage S1) Review.
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx`
> - `docs/source-material/Mini_Project_Gate_0_details_FILLED.docx`

---

### 1. Project Objective
- **Question**: *"What is the primary objective of this project?"*
- **Evidence-Based Answer**: To build a web-based platform that eliminates payment uncertainty, scope creep, and unresolvable conflicts in freelance contracting by integrating a deterministic milestone-based escrow state machine, cryptographic SHA-256 deliverable verification, and a structured evidence-based dispute resolution pipeline.
- *Source*: DOCX Step 4; PPTX Slide 1, 3.

### 2. Why Escrow?
- **Question**: *"Why is an escrow mechanism necessary rather than traditional direct invoicing?"*
- **Evidence-Based Answer**: Direct invoicing forces either the client or the developer to assume 100% financial risk (clients fear paying for incomplete work; freelancers fear working without payment). An escrow mechanism locks client funds upfront in neutral custody before work begins, releasing funds only upon verified milestone completion, establishing mutual trust.
- *Source*: PPTX Slide 2 & 3; DOCX Step 1.

### 3. Why Milestone-Based Workflow?
- **Question**: *"Why decompose projects into milestones instead of single lump-sum deliveries?"*
- **Evidence-Based Answer**: Lump-sum projects lead to unmonitored scope drift and high financial blast radius. Milestones partition delivery into verifiable phases (e.g. Design, Prototype, Final Code), allowing incremental fund release, early bottleneck identification, and granular dispute containment.
- *Source*: DOCX Step 1 & 3; PPTX Slide 18 (FR-02).

### 4. Why Evidence-Based Disputes?
- **Question**: *"Why do you emphasize 'evidence-based' dispute resolution?"*
- **Evidence-Based Answer**: Existing platforms arbitrate disputes subjectively through customer support staff reviewing unstructured chat logs. Our system ties dispute arbitration directly to an immutable evidence tree containing cryptographically hashed deliverable files, milestone specifications, and revision notes.
- *Source*: DOCX Step 1 & 4; PPTX Slide 3, 13.

### 5. Why Four Engines?
- **Question**: *"Why decompose the system into four engines rather than standard frontend/backend layers?"*
- **Evidence-Based Answer**: The university's hybrid SDLC framework requires decomposing complex systems into independently ownable, testable academic domains aligned with core computer science subjects (Operating Systems, DSA/SE, DBMS, Web Technologies), ensuring each student has clear individual ownership.
- *Source*: PPTX Slide 8, 9, 10.

### 6. Why OS Engine? (Vaishnavi Modekar)
- **Question**: *"How does the Escrow Scheduler demonstrate Operating Systems concepts?"*
- **Evidence-Based Answer**: It implements a Finite State Machine (FSM) modeling the OS process lifecycle (`AWAITING_DEPOSIT` → `FUNDED` → `IN_PROGRESS` → `UNDER_REVIEW` → `RELEASED`). It enforces atomic locking to eliminate race conditions (double-releases), manages review watchdog timers, and ensures deadlock-free state progression.
- *Source*: PPTX Slide 12; FR-01, FR-02, FR-12.

### 7. Why DSA/SE Engine? (Darshan Kittur)
- **Question**: *"What Data Structures and Software Engineering principles are demonstrated?"*
- **Evidence-Based Answer**: DSA is demonstrated via cryptographic SHA-256 hash digests and an in-memory N-ary `EvidenceTree` data structure with $O(V+E)$ traversal for dispute arbitration. Software Engineering is demonstrated via strict Requirements Traceability (RTM) and Verification & Validation (V&V) test pipelines.
- *Source*: PPTX Slide 13; FR-03, FR-04, FR-11.

### 8. Why DBMS Engine? (Purvi Sammatshetti)
- **Question**: *"What database concepts are demonstrated by the Transaction Ledger?"*
- **Evidence-Based Answer**: It implements relational schema normalization (BCNF) across Users, Projects, Contracts, and Milestones; enforces ACID transaction consistency (`prisma.$transaction`) during escrow debits/credits; and maintains an append-only, tamper-resistant `AUDIT_LOG`.
- *Source*: PPTX Slide 14; FR-05, FR-06.

### 9. Why Web Technologies Engine? (Vaibhav Chavanpatil)
- **Question**: *"What Web Technologies concepts are demonstrated by the Dashboard?"*
- **Evidence-Based Answer**: Client-server RESTful API design over Next.js 16 Server Route Handlers; modern component composition using React 19; responsive layouts across mobile, tablet, and desktop using Tailwind CSS; and Role-Based Access Control (RBAC) middleware.
- *Source*: PPTX Slide 15; FR-07, FR-08, FR-09, FR-10.

### 10. Why SHA-256?
- **Question**: *"Why use SHA-256 hashing for deliverables?"*
- **Evidence-Based Answer**: SHA-256 provides a deterministic, collision-resistant cryptographic digest. Hashing deliverable files at the exact moment of submission creates an immutable fingerprint stored in the database, proving whether a deliverable was altered or tampered with prior to review.
- *Source*: PPTX Slide 16, 18 (FR-03); NFR-03.

### 11. Why EvidenceTree?
- **Question**: *"Why structure dispute evidence as a tree rather than a flat list?"*
- **Evidence-Based Answer**: Disputes involve revisions, counter-arguments, and rebuttal files linked to specific milestone deliverables. A tree structure preserves the chronological and hierarchical relationship between the original deliverable (root) and subsequent dispute evidence nodes.
- *Source*: PPTX Slide 13, 18 (FR-04); UC-04.

### 12. Why ACID Transactions?
- **Question**: *"Why are ACID transactions critical in simulated escrow?"*
- **Evidence-Based Answer**: Releasing milestone funds requires deducting the contract escrow balance and simultaneously crediting the developer ledger balance. If a crash or network partition occurs midway, an ACID transaction guarantees atomic rollback, preventing money from being created, lost, or double-spent.
- *Source*: PPTX Slide 14, 18 (FR-05); NFR-08.

### 13. Why RBAC?
- **Question**: *"Why is Role-Based Access Control necessary?"*
- **Evidence-Based Answer**: The marketplace has distinct user personas with conflicting privileges (e.g. Freelancers must not release their own escrow; Clients must not arbitrate their own disputes). RBAC strictly restricts endpoint execution by role (`CLIENT`, `FREELANCER`, `REVIEWER`, `ADMIN`).
- *Source*: PPTX Slide 16, 18 (FR-08); NFR-02.

### 14. Why Human Dispute Arbitration?
- **Question**: *"Why not use automated AI to resolve disputes automatically?"*
- **Evidence-Based Answer**: Software deliverable disputes involve subjective quality nuances, edge-case scope interpretation, and academic accountability. Autonomous AI arbitration without human review is explicitly out-of-scope; human Dispute Reviewers make final binding decisions using the evidence hierarchy.
- *Source*: DOCX Step 5 (Out-of-Scope Item 4); PPTX Slide 3, 18.

### 15. Why Simulated Payments?
- **Question**: *"Why use simulated credits instead of integrating real Stripe or PayPal APIs?"*
- **Evidence-Based Answer**: Academic project scope focuses on software engineering, distributed state scheduling, and workflow governance. Real banking integrations introduce regulatory liabilities, API fees, and KYC overhead that divert focus from core computer science objectives.
- *Source*: DOCX Step 5 (Out-of-Scope Item 1); PPTX Slide 16.

### 16. Why Polling Instead of WebSockets?
- **Question**: *"Why use short-interval polling rather than WebSockets for dashboard state updates?"*
- **Evidence-Based Answer**: Milestone lifecycle state changes are discrete transactional events that occur minutes or days apart, not high-frequency real-time streams like gaming. Stateless REST endpoints with 5-second polling on active views eliminate stateful WebSocket connection overhead while keeping the architecture lightweight and maintainable.
- *Source*: PPTX Slide 16, 17; FR-10.

### 17. Why AI Semantic Matching?
- **Question**: *"What is the purpose of the AI Matcher in proposal evaluation?"*
- **Evidence-Based Answer**: Instead of naive keyword matching (`LIKE '%react%'`), the AI Matcher calculates multi-factor compatibility between project skill tags, client budgets, and developer GitHub statistics (commit frequency, stars, repo velocity) to provide objective proposal rankings.
- *Source*: PPTX Slide 16, 18 (FR-11); UC-05.

### 18. What is Out of Scope?
- **Question**: *"What boundaries did the team establish to prevent scope creep?"*
- **Evidence-Based Answer**: Six items are strictly excluded: (1) Real payment gateways, (2) Legal court contracts, (3) Native iOS/Android mobile apps, (4) Autonomous AI arbitration without human review, (5) Unlimited video storage, and (6) Corporate taxation/accounting systems.
- *Source*: DOCX Step 5 (Out-of-Scope Table); `project-scope.md`.

### 19. How are Requirements Verified?
- **Question**: *"How will the team verify that requirements are met during development?"*
- **Evidence-Based Answer**: Every functional requirement has an observable acceptance criterion and mapped test cases. In Stage S3, unit and integration tests (TDD) will verify FSM transitions, cryptographic checksum matching, ACID rollback, and RBAC rejection codes (HTTP 401/403).
- *Source*: PPTX Slide 18, 21; `functional-requirements.md`.

### 20. How is Traceability Maintained?
- **Question**: *"How does the team guarantee that code changes trace back to original stakeholder needs?"*
- **Evidence-Based Answer**: Via the Requirements Traceability Matrix (RTM), which establishes an explicit bidirectional link: S0 Stakeholder Need → Functional Requirement (FR) → Use Case (UC) → Acceptance Criterion → Owning Engine → Student Owner → Target NFR.
- *Source*: PPTX Slide 23; DOCX Step 4; `requirements.md`.

### 21. How will NFRs be Tested?
- **Question**: *"How will the non-functional requirements be validated objectively?"*
- **Evidence-Based Answer**: NFR-01 via automated latency benchmarking (50 concurrent requests); NFR-02 via automated negative security suites (asserting 401/403); NFR-03 via byte-level file tampering injection tests; NFR-05 via FSM model-checker tests; NFR-08 via parallel concurrent transfer stress tests; and NFR-09 via audit log entry count reconciliation.
- *Source*: PPTX Slide 19; `non-functional-requirements.md`.

### 22. What are the Pending Team Decisions?
- **Question**: *"Are there any unresolved architectural or requirements decisions?"*
- **Evidence-Based Answer**: Three items are formally tracked in `docs/requirements/gate-1-team-decisions.md`:
  1. **Decision D-01 (FR-11 Primary Engine Ownership)**: Proposed Engine 02 (Darshan Kittur) as Primary, Engine 03 (Purvi Sammatshetti) as Supporting Dependency (`STATUS: PENDING TEAM RATIFICATION`).
  2. **Decision D-02 (Client Review Timeout Duration)**: Proposed default of 7 calendar days before watchdog auto-release escalation (`STATUS: PENDING TEAM RATIFICATION`).
  3. **Decision D-03 (Production Cloud Hosting)**: External cloud deployment target selection is deferred until the post-academic phase (`STATUS: DEFERRED`).
- *Source*: `gate-1-team-decisions.md`; `GATE-1-PACKAGE.md` Section 12.

