# Use Case Specifications & System Scenarios

> **Classification**: Stage S1 Requirements Engineering Deliverable (Gate 1 Evidence)
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slides 3, 17, 21, 22)
> - `docs/source-material/Mini_Project_Gate_0_details_FILLED.docx` (Step 3 & 4)

---

## 1. Overview & Actor Catalog
- **Primary Actors**:
  - `Client`: Creates project specifications, deposits funds into escrow, reviews deliverable submissions, approves milestones.
  - `Freelancer`: Searches projects/gigs, submits proposals, uploads milestone deliverables, contests unfair rejections.
  - `Dispute Reviewer`: Inspects evidence trees, reviews SHA-256 checksum integrity, issues binding dispute rulings.
- **Secondary / System Actors**:
  - `Escrow State Scheduler (Engine 01)`: Enforces FSM transitions and review timeouts.
  - `Evidence QA Engine (Engine 02)`: Computes SHA-256 checksums and indexes evidence trees.
  - `Transaction Ledger (Engine 03)`: Executes ACID balance debits/credits and records immutable audit logs.
  - `Administrator / Auditor`: Maintains system health and monitors audit logs.

---

## 2. Detailed Use Cases

### UC-01: Contract Initiation & Escrow Fund Locking
- **Primary Actor**: Client
- **Owning Engine**: Engine 01 (OS) & Engine 03 (DBMS)
- **Traceability**: FR-01, FR-12 | NFR-05, NFR-08
- **Preconditions**:
  1. Client and Freelancer are authenticated.
  2. Client has accepted the Freelancer's proposal for an open project with agreed phased milestones.
  3. Client wallet/account possesses sufficient balance for milestone funding.
- **Main (Normal) Flow**:
  1. Client clicks "Initiate Contract & Lock Escrow".
  2. System prompts Client to confirm escrow deposit for Milestone 1.
  3. System initiates atomic database transaction (`prisma.$transaction`).
  4. Client available balance is debited by milestone amount; contract `escrow_balance` is credited.
  5. Engine 01 sets Milestone status to `FUNDED` and Contract status to `FUNDED`.
  6. Engine 03 appends an immutable transaction record to `ESCROW_TRANSACTION` and `AUDIT_LOG`.
  7. Client and Freelancer dashboards update in real-time displaying funded status.
- **Alternate Flow (Insufficient Balance)**:
  - At Step 3, if Client balance < milestone amount, system prompts Client to add simulated funds. Milestone remains `AWAITING_DEPOSIT`.
- **Exception Flow (Transaction Failure / Concurrency Race)**:
  - If a concurrent transfer attempt or database constraint error occurs, the entire transaction is rolled back. Zero funds are deducted. An error envelope with code `TRANSACTION_ROLLBACK` is returned.
- **Postconditions**: Milestone funds are securely locked in escrow; Freelancer is authorized to commence work.

---

### UC-02: Milestone Deliverable Submission & Cryptographic Hashing
- **Primary Actor**: Freelancer
- **Owning Engine**: Engine 02 (DSA & SE) & Engine 04 (Web)
- **Traceability**: FR-02, FR-03, FR-10 | NFR-03, NFR-04
- **Preconditions**:
  1. Contract and Milestone status are `FUNDED` or `IN_PROGRESS`.
- **Main (Normal) Flow**:
  1. Freelancer navigates to active Contract dashboard.
  2. Freelancer uploads deliverable archive (ZIP/PDF/code) and inputs completion notes.
  3. System validates file size and payload schema via Zod 4.
  4. Engine 02 processes file stream and generates SHA-256 cryptographic digest (`crypto.createHash('sha256')`).
  5. Deliverable record is stored in `DELIVERABLE` with the computed `sha256_checksum`.
  6. Engine 01 FSM transitions Milestone to `SUBMITTED` and Contract to `UNDER_REVIEW`.
  7. Notification sent to Client indicating deliverable is ready for inspection.
- **Alternate Flow (Deliverable URL Submission)**:
  - Freelancer submits public code repository URL. Engine 02 digests commit hash and submission metadata as verification proof.
- **Exception Flow (Payload Rejection / Invalid State)**:
  - If Milestone is not in `FUNDED`/`IN_PROGRESS` (e.g. already `RELEASED`), submission is rejected with HTTP 422 `INVALID_STATE_TRANSITION`.
- **Postconditions**: Deliverable is cryptographically fingerprinted; Client review window commences.

---

### UC-03: Milestone Verification & Escrow Fund Release
- **Primary Actor**: Client
- **Owning Engine**: Engine 01 (OS), Engine 02 (DSA/SE), Engine 03 (DBMS)
- **Traceability**: FR-02, FR-03, FR-05 | NFR-01, NFR-03, NFR-08
- **Preconditions**:
  1. Milestone is in `SUBMITTED` state with valid SHA-256 deliverable record.
- **Main (Normal) Flow**:
  1. Client inspects submitted deliverable files and verifies checksum fidelity.
  2. Client selects "Approve & Release Funds".
  3. Engine 01 FSM validates transition legality (`SUBMITTED` → `APPROVED` → `RELEASED`).
  4. Engine 03 initiates atomic transaction:
     - Debits contract `escrow_balance` by milestone amount.
     - Credits Freelancer account balance.
     - Updates Milestone status to `RELEASED`.
     - Checks if subsequent milestones exist: if yes, next milestone activates; if all milestones completed, Contract marked `RELEASED`.
  5. Engine 03 writes audit event to `AUDIT_LOG`.
  6. Dashboards update with release confirmation.
- **Alternate Flow (Revision Request)**:
  - Client rejects deliverable notes and requests revision. Milestone transitions back to `IN_PROGRESS` with feedback notes. Funds remain locked in escrow.
- **Exception Flow (Double Release Prevention)**:
  - If a duplicate `RELEASE_ESCROW` request is transmitted, Engine 01 FSM halts the transition with `ALREADY_RELEASED` error. Zero duplicate disbursements occur.
- **Postconditions**: Funds are transferred to Freelancer; milestone completed cleanly.

---

### UC-04: Dispute Escalation & Evidence-Based Arbitration
- **Primary Actor**: Client / Freelancer / Dispute Reviewer
- **Owning Engine**: Engine 02 (DSA/SE), Engine 04 (Web), Engine 03 (DBMS)
- **Traceability**: FR-04, FR-06, FR-07, FR-09 | NFR-02, NFR-09
- **Preconditions**:
  1. Milestone is in `SUBMITTED` or `IN_PROGRESS` state.
  2. Disagreement regarding quality or deliverable scope occurs.
- **Main (Normal) Flow**:
  1. Contesting party clicks "Raise Dispute", specifies grievance category, and uploads supporting evidence files.
  2. Engine 02 hashes uploaded evidence files with SHA-256 and appends them to the milestone's `DISPUTE_EVIDENCE` tree.
  3. Engine 01 transitions Milestone and Contract state to `DISPUTED`.
  4. Escrow funds remain strictly frozen; automated releases or refunds are disabled.
  5. Dispute is assigned to an authorized Dispute Reviewer.
  6. Dispute Reviewer opens Reviewer Console, inspects contract terms, original deliverable checksums, communication logs, and counter-evidence hierarchy.
  7. Dispute Reviewer issues binding ruling:
     - *Option A (Ruling for Freelancer)*: System releases escrow funds to Freelancer.
     - *Option B (Ruling for Client)*: System refunds escrow funds to Client.
     - *Option C (Split Settlement)*: System apportions funds proportionally.
  8. Ruling, rationale, and reviewer ID are immutably committed to `AUDIT_LOG` and `DISPUTE`.
  9. Milestone transitions to `RESOLVED`; contract status updates accordingly.
- **Exception Flow (Unauthorized Adjudication Attempt)**:
  - If non-reviewer user attempts ruling API call, RBAC middleware rejects request with HTTP 403 `FORBIDDEN`.
- **Postconditions**: Dispute resolved objectively based on cryptographic evidence record; funds disbursed per binding ruling.

---

### UC-05: AI Semantic Matching & Developer Scoring
- **Primary Actor**: Client & Freelancer
- **Owning Engine**: Engine 02 (SE) & Engine 04 (Web)
- **Traceability**: FR-11 | NFR-01
- **Preconditions**:
  1. Project specification contains defined skill tags and budget.
  2. Freelancer profile contains parsed skill tags, rate, and GitHub statistics.
- **Main (Normal) Flow**:
  1. Freelancer views project listing and clicks "Submit Proposal".
  2. Application routes proposal data to AI Matcher (`ai-matcher.ts`).
  3. Matcher computes multi-factor score:
     - Skill tag overlap percentage (exact and related framework taxonomy).
     - Developer GitHub credibility index (commit frequency, stars, repo velocity).
     - Hourly rate vs. project budget compatibility.
  4. Match percentage (`aiMatchScore`, 0–100%) is recorded with proposal.
  5. Client proposal review dashboard displays proposals sorted by objective match compatibility.
- **Postconditions**: Client receives transparent, objective compatibility rankings without subjective bias.
