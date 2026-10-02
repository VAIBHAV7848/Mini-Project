# Gate 1 Pending Team Decisions Register

> **Authority**: Team 07 (Theme 01) — KLE Technological University
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1)
> **Academic Rule**: AI recommendations must NOT be silently converted into team-approved decisions. These items require formal ratification by student engine owners and the project guide during the Gate 1 evaluation session.

---

## Decision D-01 — FR-11 Primary Engine Ownership

### Decision
Primary Single-Student Engine Ownership Assignment for FR-11 (Heuristic Tag-Based Semantic Proposal Matcher).

### Background
Slide 11 of `Team07_Escrow_Mini_Project_KLE_Theme.pptx` clusters AI matching under `Cluster B: Evidence & Verification (DSA & SE Engine — Darshan Kittur)`. However, Slide 17 lists `/api/proposals` as owned by `E3 · DBMS / E2 · DSA/SE`. Dual ownership violates the university Gate 1 rule requiring one primary student owner per functional requirement.

### Proposal
Assign **Engine 02 (DSA & SE Engine) — Darshan Kittur** as the **Primary Owner** for FR-11, with **Engine 03 (DBMS Engine) — Purvi Sammatshetti** designated as the **Supporting Dependency**.

### Reason
The core computational challenge of FR-11 is algorithmic: tokenization, Jaccard set similarity scoring, and weighted multi-attribute ranking, which belong to Data Structures & Algorithms. Engine 03 provides the persistence dependency (schema storage and indexed queries) to support the algorithm.

### Impact
- Clarifies academic grading accountability: Darshan Kittur defends the matching heuristic and algorithmic performance; Purvi Sammatshetti defends schema indexing and data retrieval.
- Prevents split ownership in the Requirements Traceability Matrix (RTM).

### Status: PENDING TEAM RATIFICATION

---

## Decision D-02 — Client Review Timeout Duration

### Decision
Standard Default Time Window for Client Deliverable Inspection Prior to Watchdog Auto-Release Escalation (FR-02).

### Background
Slide 12 of `Team07_Escrow_Mini_Project_KLE_Theme.pptx` states that Engine 01 (OS Engine — Vaishnavi Modekar) enforces *"timeouts for delayed client reviews"* to eliminate the pain point where freelancers are left waiting indefinitely for client approvals (Gate 0 Step 3). However, the source documents do not specify the exact number of calendar days.

### Proposal
Establish a default review timeout duration of **7 calendar days** from the timestamp of milestone deliverable submission (`SUBMIT_MILESTONE`).

### Reason
Seven calendar days strikes an optimal balance between giving clients sufficient time to inspect complex technical deliverables and protecting freelancers from indefinite payment starvation. It aligns closely with industry marketplace benchmarks (e.g. Upwork 14 days, Fiverr 3 days).

### Impact
- Defines the concrete threshold parameter for Engine 01's timer interrupt watchdog.
- Formally updates UC-02 and FR-02 state transition logic from `UNDER_REVIEW` to `REVIEW_TIMEOUT` upon $T \ge 7\text{ days}$.

### Status: PENDING TEAM RATIFICATION

---

## Decision D-03 — Production Cloud Hosting

### Decision
Selection of External Production Cloud Hosting Provider.

### Background
The project requirements define local deployment on Ubuntu departmental hardware using embedded SQLite and Next.js. Inquiries arose regarding external cloud hosting options (Vercel, AWS, or Docker containers).

### Proposal
Maintain local embedded execution on standard Ubuntu workstations for all Gate 1 through Gate 4 academic evaluations. Defer external production cloud deployment target selection until the post-academic phase.

### Reason
External cloud deployment is not required for academic Gate 1 requirements evaluation or local laboratory demonstration.

### Impact
- Zero blocking impact on Stage S1 requirements baseline or Stage S2 architecture.

### Status: DEFERRED (Decision postponed until post-academic phase)

