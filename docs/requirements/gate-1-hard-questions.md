# Gate 1 Hard Questions & Evidence-Based Defenses — Team 07

> **Project Title**: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow
> **Target Audience**: Strict University Evaluators, Project Guides, External Gate 1 Reviewers
> **Repository Root**: `/home/nethunter/Collage/BIG_PROJECT`
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1)
> **Standard**: Every answer is strictly grounded in the official project documents (`Team07_Escrow_Mini_Project_KLE_Theme.pptx` and `Mini_Project_Gate_0_details_FILLED.docx`).

---

### Q01: Why is this an escrow system?
- **Academic Context**: Evaluating whether the escrow concept is essential or merely a marketing buzzword.
- **Evidence-Based Answer**:
  In a standard freelance contract, payment is asymmetrical: if the client pays upfront, the client assumes 100% of the risk of non-delivery; if the freelancer works before payment, the freelancer assumes 100% of the risk of non-payment. Gate 0 Step 1 and Step 3 identify this exact payment uncertainty as the primary cause of freelance transaction failure.
  An **escrow system** acts as an impartial, automated stakeholder. The client commits funds into a milestone-locked state (`FUNDED`) before work starts, proving their ability and willingness to pay. The freelancer completes work knowing funds are reserved. The funds are released only when verifiable milestone criteria are satisfied or an arbiter decides a dispute.
- **Authoritative Citation**: `Mini_Project_Gate_0_details_FILLED.docx` Step 1 & Step 3; `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 2 & 4.
- **Relevant FR / Engine**: FR-01, FR-02 (Engine 01 · OS).

---

### Q02: Why are payments simulated?
- **Academic Context**: Probing why real payment APIs (Stripe, Razorpay, PayPal) are not integrated.
- **Evidence-Based Answer**:
  Gate 0 Step 5 formally designates external payment gateways as **Out-of-Scope**. There are three academic and engineering reasons:
  1. *Regulatory & Financial Risk*: Operating real currency transactions involves compliance with financial regulations (RBI, KYC/AML), which is inappropriate for an undergraduate course evaluation.
  2. *Testing & Flakiness*: External sandboxes introduce external network latency, token expirations, and API rate limits that interfere with automated deterministic testing.
  3. *Academic Rigor*: A simulated ledger allows Engine 03 (DBMS) to implement and test true double-entry bookkeeping, ACID transaction rollbacks, and mathematical balance invariants ($\Delta \text{Client} + \Delta \text{Escrow} + \Delta \text{Freelancer} = 0$) under total local test control.
- **Authoritative Citation**: `Mini_Project_Gate_0_details_FILLED.docx` Step 5; `docs/requirements/project-scope.md` Section 1.2.
- **Relevant FR / Engine**: FR-05, NFR-08 (Engine 03 · DBMS).

---

### Q03: Why is AI arbitration excluded?
- **Academic Context**: Inquiring why an LLM or autonomous AI model does not automatically resolve disputes.
- **Evidence-Based Answer**:
  Autonomous AI dispute arbitration is strictly excluded under Gate 0 Step 5.
  1. *Hallucination & Non-Determinism*: Large Language Models are stochastic and hallucinate facts. Entrusting financial custody and contractual verdicts to an unexplainable model introduces catastrophic failure modes.
  2. *Legal & Ethical Precedent*: In contract law and arbitration jurisprudence, binding financial settlements require accountable, explainable human judgment.
  3. *Role of AI in this Project*: Per Slide 11 and Slide 18 (FR-11), AI is strictly scoped to **pre-contract semantic proposal matching** (matching freelancer skills with project tags), never for dispute adjudication.
- **Authoritative Citation**: `Mini_Project_Gate_0_details_FILLED.docx` Step 5; `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 11 & Slide 18.
- **Relevant FR / Engine**: FR-09, FR-11, Scope boundary 4.

---

### Q04: Why is human arbitration used?
- **Academic Context**: Understanding the human dispute reviewer role and system accountability.
- **Evidence-Based Answer**:
  Dispute resolution involves interpreting nuanced human agreements, creative deliverables (e.g. code quality, design adherence), and subjective client revision claims.
  Our system empowers an authenticated, impartial **Dispute Reviewer** (`DISPUTE_REVIEWER` role, FR-08) by providing them with an immutable, chronological **Evidence Tree** (FR-04) and cryptographic deliverable fingerprints (FR-03). The human reviewer evaluates facts with complete transparency, and the system executes their binding verdict (Release to Freelancer or Refund to Client) atomically through Engine 03.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 8, 16, 22; `Mini_Project_Gate_0_details_FILLED.docx` Step 2 & Step 4.
- **Relevant FR / Engine**: FR-04 (Engine 02 · DSA/SE), FR-09 (Engine 04 · Web).

---

### Q05: Why is SHA-256 required?
- **Academic Context**: Challenging the necessity of cryptographic hashing for file uploads.
- **Evidence-Based Answer**:
  In a dispute, the most common claim is deliverable tampering: a client claims *"the freelancer uploaded an empty ZIP file"*, or a freelancer claims *"the client modified my source code and claimed it was broken"*.
  Generating a SHA-256 cryptographic digest at the exact instant of upload (FR-03) provides two mathematical guarantees:
  1. *Integrity*: Any change of even a single bit in the file payload changes the 64-character hash digest completely (avalanche effect).
  2. *Non-Repudiation*: The hash binds the freelancer to the exact deliverable file submitted at timestamp $T$. During arbitration, the reviewer verifies that the file on disk matches the registered hash, guaranteeing zero post-submission tampering.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 16 & Slide 18 (FR-03); `docs/requirements/functional-requirements.md`.
- **Relevant FR / Engine**: FR-03, NFR-03 (Engine 02 · DSA/SE).

---

### Q06: Why is an Evidence Tree required?
- **Academic Context**: Asking why a flat database table or list of files is insufficient for disputes.
- **Evidence-Based Answer**:
  A dispute is not a flat list of independent files; it is a causal, hierarchical timeline of events.
  An in-memory **Evidence Tree** (FR-04) models the dispute as an N-ary tree:
  - Root: Dispute Case
  - Branch 1: Contract & Milestone Terms
  - Branch 2: Submissions & Deliverables (with SHA-256 leaf nodes)
  - Branch 3: Revision Requests & Client Feedback
  - Branch 4: Dispute Claims & Counter-Statements
  This allows topological sorting and chronological depth-first traversal ($O(V+E)$), presenting the arbiter with the exact causal chain of who submitted what, when it was rejected, and why the dispute was triggered.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 11, Slide 18 (FR-04); `docs/requirements/functional-requirements.md`.
- **Relevant FR / Engine**: FR-04 (Engine 02 · DSA/SE).

---

### Q07: Why is this an OS problem?
- **Academic Context**: Testing Vaishnavi's curricular justification for Engine 01.
- **Evidence-Based Answer**:
  Operating Systems is fundamentally about managing concurrent processes, state automata, shared resource synchronization, and timer interrupts.
  In this project, Engine 01 addresses three classical OS problems:
  1. *State Automaton*: Milestone lifecycles mirror process state transitions (`READY`, `RUNNING`, `BLOCKED`, `TERMINATED`). The FSM strictly prevents illegal transitions (e.g. skipping review).
  2. *Mutual Exclusion / Critical Section*: Escrow balances are shared resources. State transitions mutating balances require mutual exclusion to prevent race conditions and double-spending.
  3. *Watchdog Timers & Preemption*: When clients abandon reviews, the 7-day watchdog timer acts as a timer interrupt that preempts the idle state and transitions the milestone to `REVIEW_TIMEOUT`, preventing resource starvation.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 10 & 12; `docs/requirements/team-project-overview.md`.
- **Relevant FR / Engine**: FR-01, FR-02, FR-12 (Engine 01 · OS).

---

### Q08: Why is this a DBMS problem?
- **Academic Context**: Testing Purvi's curricular justification for Engine 03.
- **Evidence-Based Answer**:
  At its core, an escrow service is a financial transaction ledger. This directly engages Database Management Systems principles:
  1. *ACID Transactions*: Funds locking, release, and refund operations must execute with total atomicity—if a database write fails halfway, the entire transaction rolls back cleanly.
  2. *Relational Normalization (BCNF)*: The data schema (Users, Projects, Contracts, Milestones, Deliverables, Disputes, Transactions) is normalized to BCNF to eliminate insert, update, and delete anomalies.
  3. *Append-Only Audit Logging*: Historical financial events cannot be edited or deleted. An append-only audit table with sequential IDs provides an immutable audit trail.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 10 & 13; `docs/requirements/team-project-overview.md`.
- **Relevant FR / Engine**: FR-05, FR-06, NFR-08, NFR-09 (Engine 03 · DBMS).

---

### Q09: Why is this a DSA problem?
- **Academic Context**: Testing Darshan's curricular justification for Engine 02.
- **Evidence-Based Answer**:
  Data Structures & Algorithms is applied across two key areas:
  1. *Tree Modeling & Traversal*: Modeling the dispute evidence hierarchy as an in-memory N-ary tree and executing $O(V+E)$ Depth-First/Breadth-First searches to generate audit timelines and verify cryptographic leaf nodes.
  2. *Information Retrieval & Heuristic Algorithms*: FR-11 requires tokenizing project requirements and freelancer skill sets, computing Jaccard set similarity, and applying a multi-attribute weighted scoring formula to rank candidate proposals.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 10 & 11; `docs/requirements/team-project-overview.md`.
- **Relevant FR / Engine**: FR-03, FR-04, FR-11 (Engine 02 · DSA/SE).

---

### Q10: Why is this a Web Technologies problem?
- **Academic Context**: Testing Vaibhav's curricular justification for Engine 04.
- **Evidence-Based Answer**:
  Web Technologies and Computer Networks govern the distributed communication and secure user interaction of the system:
  1. *Role-Based Access Control (RBAC)*: Enforcing server-side middleware authorization on 100% of protected HTTP routes to prevent privilege escalation.
  2. *Defensive Web Architecture*: Validating 100% of incoming payloads using Zod schemas to eliminate injection and malformed payload attacks.
  3. *Multi-Role UI Composition*: Building responsive dashboards tailored for Clients, Freelancers, and Reviewers using Next.js App Router and React 19 component trees.
  4. *State Visualization*: Translating backend FSM states into real-time interactive UI timelines.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 10 & 14; `docs/requirements/team-project-overview.md`.
- **Relevant FR / Engine**: FR-07, FR-08, FR-09, FR-10 (Engine 04 · Web).

---

### Q11: Why is FR-11 owned by Engine 02?
- **Academic Context**: Inquiring why Semantic Proposal Matching belongs to DSA/SE rather than DBMS or Web.
- **Evidence-Based Answer**:
  Slide 11 of the authoritative presentation clusters AI semantic matching under **Cluster B: Evidence & Verification (DSA & SE Engine — Darshan Kittur)**.
  Matching is fundamentally an algorithmic problem: it requires parsing natural language skill tags, computing set intersection/union (Jaccard coefficient), normalizing numeric attributes (hourly rates, ratings), and evaluating a weighted heuristic scoring equation. These algorithms directly demonstrate Data Structures & Algorithms competencies.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 11; `docs/requirements/gate-1-team-decisions.md` (Decision D-01).
- **Relevant FR / Engine**: FR-11 (Engine 02 Primary).

---

### Q12: Why is Engine 03 only a supporting dependency for FR-11?
- **Academic Context**: Clarifying the boundary between Engine 02's algorithm and Engine 03's database role in proposal matching.
- **Evidence-Based Answer**:
  Slide 17 indicates that `/api/proposals` touches both E3 and E2. However, university evaluation guidelines require that every functional requirement has one primary student owner.
  Engine 03's role is strictly **persistence**: storing proposal records, structuring tag tables, and indexing attributes so candidate records can be fetched efficiently. Engine 03 does not own the similarity scoring or ranking logic; that is executed by Engine 02 in memory. Therefore, Engine 03 is properly classified as a supporting persistence dependency.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 11 & Slide 17; `docs/requirements/gate-1-team-decisions.md` (Decision D-01).
- **Relevant FR / Engine**: FR-11 (Engine 03 Supporting).

---

### Q13: Why is the review timeout 7 days?
- **Academic Context**: Evaluating whether the 7-day timeout is arbitrary or reasoned.
- **Evidence-Based Answer**:
  In Gate 0 Step 3, stakeholder feedback showed that undefined review windows cause freelancer payment starvation.
  In freelance marketplace industry benchmarks, Upwork uses a 14-day auto-approval window, while Fiverr uses 3 days. A 7-calendar-day window balances client inspection time for complex technical deliverables against freelancer payment predictability.
  This value is currently documented as a formal proposal in `docs/requirements/gate-1-team-decisions.md` (Decision D-02) pending team ratification during Gate 1.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 12; `docs/requirements/gate-1-team-decisions.md`.
- **Relevant FR / Engine**: FR-02 (Engine 01 · OS).

---

### Q14: How will p95 latency be measured?
- **Academic Context**: Challenging whether NFR-01 (≤ 500 ms p95 latency) is actually measurable and testable.
- **Evidence-Based Answer**:
  NFR-01 defines explicit workload benchmark conditions:
  - Workload: 50 concurrent simulated client/freelancer requests.
  - Dataset: 100 projects and 500 milestones seeded in SQLite.
  - Measurement Tool: Automated benchmark script (using tools such as Autocannon or k6) measuring response times across all endpoints.
  - Success Metric: 95% of all requests must complete and return HTTP 200 within 500 milliseconds.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 19; `docs/requirements/non-functional-requirements.md` Section 1.
- **Relevant FR / Engine**: NFR-01, All Engines.

---

### Q15: How is every requirement traced?
- **Academic Context**: Checking Software Engineering rigor and RTM completeness.
- **Evidence-Based Answer**:
  We maintain a Bidirectional Requirements Traceability Matrix (RTM) documented in `docs/requirements/requirements.md` Section 3 and Slide 23.
  - Forward Traceability: Every Gate 0 Need (N-01 to N-05) traces to at least one FR (FR-01 to FR-12), an Owning Engine, a Use Case (UC-01 to UC-05), and an NFR target.
  - Backward Traceability: Every FR traces back to an originating stakeholder need, proving zero orphan requirements or scope creep.
- **Authoritative Citation**: `Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 23; `docs/requirements/requirements.md`.
- **Relevant FR / Engine**: Software Engineering QA (Engine 02 · Darshan).

---

### Q16: How will each requirement be demonstrated?
- **Academic Context**: Asking how evaluators will verify the system in subsequent gates (Gate 2, 3, 4).
- **Evidence-Based Answer**:
  Each FR has binary observable acceptance criteria formulated in `docs/requirements/functional-requirements.md`:
  - FR-01/FR-05: Demonstrated via atomic balance query showing deduction from client, addition to milestone escrow, and zero balance discrepancy.
  - FR-02: Demonstrated by attempting an illegal transition (e.g. `AWAITING_DEPOSIT` $\rightarrow$ `RELEASED`) and showing an explicit FSM rejection error.
  - FR-03: Demonstrated by uploading a deliverable, altering one byte in the file, and showing 100% hash mismatch detection.
  - FR-04: Demonstrated by generating a dispute case and rendering the full hierarchical evidence tree.
  - FR-08: Demonstrated by sending an unauthenticated request to a protected endpoint and asserting HTTP 401/403.
- **Authoritative Citation**: `docs/requirements/functional-requirements.md` Section 2.
- **Relevant FR / Engine**: All Engines.

---

### Q17: What happens when requirements conflict?
- **Academic Context**: Probing how the team handles contradictions between speed, security, and integrity.
- **Evidence-Based Answer**:
  We enforce the **5-Tier Source-of-Truth Hierarchy** established in `AGENTS.md`:
  1. Official Team Source Material (`Team07_...pptx` and `Mini_Project_Gate_0...docx`).
  2. Team-Approved Decisions & Ratifications.
  3. Architecture Specifications & ADRs.
  4. Implementation Details.
  5. AI Recommendations.
  If an engineering tradeoff arises—for example, between API latency (NFR-01) and transaction integrity (NFR-08)—data integrity and ACID atomicity strictly supersede performance. Financial balances must never be compromised for speed.
- **Authoritative Citation**: `AGENTS.md` Section 1.1; `docs/requirements/project-scope.md`.
- **Relevant FR / Engine**: Architecture Governance.

---

### Q18: What is explicitly out of scope?
- **Academic Context**: Ensuring the team has not made promises they cannot deliver.
- **Evidence-Based Answer**:
  Gate 0 Step 5 explicitly declares 6 boundaries Out-of-Scope:
  1. *Real Payment Gateways / Banking APIs*: No Stripe, PayPal, or credit card handling; strictly simulated currency ledgers.
  2. *Legal Court Adjudication*: Decisions are binding only within the simulated platform, not enforceable in judicial courts.
  3. *Native Mobile Applications*: No iOS or Android native binaries; responsive web application only.
  4. *Autonomous AI Arbitration*: AI does not decide disputes; human dispute reviewers adjudicate with evidence trees.
  5. *Unlimited Video / Large Media Hosting*: Deliverables are limited to 50 MB; external media streaming is excluded.
  6. *Corporate Accounting & Statutory Tax Compliance*: No GST/VAT calculations or automated corporate tax invoicing.
- **Authoritative Citation**: `Mini_Project_Gate_0_details_FILLED.docx` Step 5; `docs/requirements/project-scope.md` Section 1.2.
- **Relevant FR / Engine**: Project Scope Governance.

---

### Q19: What is the production deployment and cloud hosting strategy?
- **Academic Context**: Evaluating deployment feasibility, infrastructure overhead, and production readiness.
- **Evidence-Based Answer**:
  Per **Decision D-03 (Production Cloud Hosting: Status DEFERRED)**, the project baseline prioritizes reproducible local execution on standard Ubuntu workstations using embedded SQLite and Next.js for all Gate 1 through Gate 4 academic evaluations.
  External cloud deployment target selection (e.g., Vercel, AWS, or Docker containers) is intentionally deferred until the post-academic phase to ensure zero distraction from core computer science and software engineering objectives.
- **Authoritative Citation**: `docs/requirements/gate-1-team-decisions.md` (Decision D-03); `docs/requirements/project-scope.md` Section 2.
- **Relevant FR / Engine**: Architecture & Infrastructure Governance.

