# Functional Requirements Specification (FRS)

> **Derived Documentation**
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slide 18)
> - `docs/source-material/Mini_Project_Gate_0_details_FILLED.docx` (Step 4 & 5)

---

## 1. Overview
This Functional Requirements Specification establishes the system behaviors, owning engines, and observable acceptance criteria formulated by Team 07.

---

## 2. Requirements Matrix

| FR-ID | Requirement Title | Detailed Functional Behavior | Owning Engine & Student | Observable Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | **Escrow Fund Locking** | The system shall atomically lock client funds in an escrow vault upon contract initiation before developer work commences. | **Engine 01 (OS)**<br>Vaishnavi | Balance moves from available to locked escrow state; zero double-spending allowed. |
| **FR-02** | **Milestone State Tracking** | The system shall enforce deterministic, sequential milestone transitions: `AWAITING_DEPOSIT` → `FUNDED` → `IN_PROGRESS` → `UNDER_REVIEW` → `RELEASED`. | **Engine 01 (OS)**<br>Vaishnavi | Invalid status jumps (e.g. `FUNDED` directly to `RELEASED`) are rejected by the FSM validator. |
| **FR-03** | **Cryptographic Checksums** | The system shall compute a SHA-256 cryptographic hash of all submitted deliverable files and URLs upon milestone submission. | **Engine 02 (DSA/SE)**<br>Darshan | Checksum is stored in the database and verified upon client/reviewer evaluation. |
| **FR-04** | **Evidence Trees** | The system shall index project artifacts, revision notes, and deliverable submissions into an in-memory hierarchical, tamper-evident N-ary evidence tree (`EvidenceTree`) with $O(V+E)$ traversal complexity. | **Engine 02 (DSA/SE)**<br>Darshan | Dispute arbitration interface renders the complete hierarchical evidence tree for the contested milestone with node verification hashes. |
| **FR-05** | **ACID Payment Processing** | The system shall process milestone fund releases and refunds via atomic, ACID-compliant database transactions. | **Engine 03 (DBMS)**<br>Purvi | Escrow balance deduction and recipient credit happen atomically; partial updates rollback completely. |
| **FR-06** | **Tamper-Resistant Audit Log** | The system shall append an immutable audit record for every contract, milestone, and escrow state alteration. | **Engine 03 (DBMS)**<br>Purvi | Audit entry logs `actor_id`, `action`, `timestamp`, `previous_state`, `new_state`, and cryptographic verification hash. |
| **FR-07** | **Role-Based Dashboards** | The system shall render tailored interfaces for Clients, Freelancers, Dispute Reviewers, and Administrators. | **Engine 04 (Web)**<br>Vaibhav | Authenticated users only see tools, actions, and data views permitted for their active role. |
| **FR-08** | **Authentication & RBAC** | The system shall authenticate user credentials and enforce Role-Based Access Control on every API endpoint. | **Engine 04 (Web)**<br>Vaibhav | Unauthorized requests return HTTP 401 (Unauthorized) or HTTP 403 (Forbidden). |
| **FR-09** | **Dispute Workflow** | The system shall provide structured dispute escalation forms allowing clients and freelancers to submit counter-evidence for review. | **Engine 04 (Web)**<br>Vaibhav | Milestone status transitions to `DISPUTED`; notifications alert assigned Dispute Reviewers. |
| **FR-10** | **FSM Progress UI** | The system shall visually display milestone progress and escrow lock status across the web dashboard using reactive state updates and short-interval polling (5-second cycle on active contracts). | **Engine 04 (Web)**<br>Vaibhav | Dashboard renders dynamic step-indicators reflecting backend FSM state changes without manual full-page reload. |
| **FR-11** | **AI Semantic Matching** | The system shall calculate multi-factor compatibility scores between project skill tags, budgets, and developer profiles using a weighted matching algorithm. | **Engine 02 (DSA/SE)**<br>Darshan *(Primary)*<br>*(E3 DBMS supporting)* | Proposals display an objective match percentage (`aiMatchScore`) based on skill overlap and GitHub metrics. |
| **FR-12** | **Contract Lifecycle Orchestration** | The system shall coordinate the entire lifecycle from proposal acceptance to milestone completion and gig closure. | **Engine 01 (OS)**<br>Vaishnavi | Contract transitions cleanly through states with all dependent milestones verified and accounted for. |

---

## 3. Contract Action Protocol Specification
The primary contract transitions execute via `POST /api/contracts` with strict payload validations:
1. `SUBMIT_MILESTONE`: Developer uploads deliverable file or URL → SHA-256 hash computed → Milestone marked `SUBMITTED` → Contract marked `UNDER_REVIEW`.
2. `APPROVE_MILESTONE`: Client inspects deliverable and hash proof → marks Milestone `APPROVED` → triggers escrow release validation.
3. `RELEASE_ESCROW`: FSM verifies compliance → atomically releases funds to developer ledger → contract status set to `RELEASED`.
