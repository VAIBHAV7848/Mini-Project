# Relational Database Logical Schema Specification

> **Classification**: Authoritative Database Management Systems Specification (Stage S2 — Shared Architecture)
> **Engine Owner**: Purvi Sammatshetti (Roll No: 11, SRN: `02FE24BCS022`)
> **Target RDBMS**: SQLite 3 (WAL Mode) via Prisma ORM 5.22
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slide 14, 16, 17)
> - `docs/requirements/functional-requirements.md` (FR-05, FR-06, FR-11)
> - `docs/decisions/ADR-007-database-transactions.md`

---

## 1. Database Architecture & Design Standards

1. **Relational Model**: Fully normalized relational schema adhering to **Boyce-Codd Normal Form (BCNF)** to eliminate data redundancy, update anomalies, insertion anomalies, and deletion anomalies.
2. **ACID Compliance**: All escrow modifications, state transitions, and balance transfers execute inside atomic SQLite transactions (`prisma.$transaction`).
3. **Immutability Standards**: Financial transactions (`EscrowTransaction`) and audit trails (`AuditLog`) are append-only. Zero SQL `UPDATE` or `DELETE` statements are permitted on these tables.
4. **Primary Key Strategy**: Universally Unique Identifiers (UUIDv4 strings, 36 characters) to enable distributed-safe ID generation before insert and prevent enumeration attacks.
5. **Foreign Key Integrity**: Foreign key constraints enforced at database startup (`PRAGMA foreign_keys = ON;`). Explicit `ON DELETE RESTRICT` used on financial and contract records to prevent orphan data or accidental deletion.

---

## 2. Table Specifications & Column Dictionaries

### 2.1 Table: `users`
Represents all system participants across all roles.

| Column Name | SQL Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | UUID | **Primary Key** | Unique user identifier. |
| `email` | `VARCHAR(255)` | No | — | **Unique Index** | RFC 5322 user email address. |
| `password_hash` | `VARCHAR(255)` | No | — | — | Bcrypt hashed password (10 salt rounds). |
| `name` | `VARCHAR(100)` | No | — | — | Human-readable user display name. |
| `role` | `VARCHAR(20)` | No | — | Check: `CLIENT \| FREELANCER \| REVIEWER \| ADMIN` | Platform RBAC role. |
| `balance` | `DECIMAL(12,2)` | No | `0.00` | Check: `balance >= 0.00` | Current simulated wallet balance. |
| `github_profile` | `VARCHAR(100)` | Yes | `NULL` | — | GitHub username for DevScore metrics. |
| `dev_score` | `INTEGER` | No | `50` | Check: `dev_score BETWEEN 0 AND 100` | Calculated developer reputation score. |
| `created_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Account creation timestamp. |
| `updated_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Last account update timestamp. |

---

### 2.2 Table: `projects`
Work requests posted by Clients.

| Column Name | SQL Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | UUID | **Primary Key** | Unique project identifier. |
| `client_id` | `VARCHAR(36)` | No | — | **FK** $\to$ `users(id)` | User who posted the project. |
| `title` | `VARCHAR(200)` | No | — | — | Project title. |
| `description` | `TEXT` | No | — | — | Detailed technical requirements. |
| `budget` | `DECIMAL(12,2)` | No | — | Check: `budget > 0.00` | Total target project budget. |
| `skill_tags` | `TEXT` | No | — | JSON Array format | Stored JSON array of lowercase skill strings. |
| `status` | `VARCHAR(20)` | No | `'OPEN'` | Check: `OPEN \| IN_PROGRESS \| COMPLETED \| CANCELLED` | Lifecycle state. |
| `created_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Timestamp posted. |
| `updated_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Last update. |

---

### 2.3 Table: `proposals`
Bids submitted by Freelancers for Projects.

| Column Name | SQL Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | UUID | **Primary Key** | Unique proposal identifier. |
| `project_id` | `VARCHAR(36)` | No | — | **FK** $\to$ `projects(id)` | Target project. |
| `freelancer_id`| `VARCHAR(36)` | No | — | **FK** $\to$ `users(id)` | Proposing developer. |
| `bid_amount` | `DECIMAL(12,2)` | No | — | Check: `bid_amount > 0.00`| Total proposed fee. |
| `cover_letter` | `TEXT` | No | — | — | Developer proposal narrative. |
| `ai_match_score`| `DECIMAL(5,2)` | No | `0.00` | Check: `ai_match_score BETWEEN 0.00 AND 100.00` | Calculated heuristic match score (FR-11). |
| `status` | `VARCHAR(20)` | No | `'PENDING'` | Check: `PENDING \| ACCEPTED \| REJECTED` | Proposal decision status. |
| `created_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Submission timestamp. |

*Unique Constraint*: `UNIQUE(project_id, freelancer_id)` — prevents duplicate bids by the same developer.

---

### 2.4 Table: `contracts`
Formal binding agreements governing escrow funds.

| Column Name | SQL Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | UUID | **Primary Key** | Unique contract identifier. |
| `project_id` | `VARCHAR(36)` | No | — | **FK** $\to$ `projects(id)` | Associated project specification. |
| `client_id` | `VARCHAR(36)` | No | — | **FK** $\to$ `users(id)` | Payer / Client. |
| `freelancer_id`| `VARCHAR(36)` | No | — | **FK** $\to$ `users(id)` | Payee / Freelancer. |
| `total_amount` | `DECIMAL(12,2)` | No | — | Check: `total_amount > 0.00`| Total contract value. |
| `escrow_balance`| `DECIMAL(12,2)`| No | `0.00` | Check: `escrow_balance >= 0.00` | Currently locked escrow funds. |
| `status` | `VARCHAR(30)` | No | `'AWAITING_DEPOSIT'` | Check: Escrow FSM Status | Authoritative FSM status. |
| `created_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Contract formation timestamp. |
| `updated_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Last transition timestamp. |

*Constraint*: `CHECK (client_id <> freelancer_id)` — prevents self-dealing.

---

### 2.5 Table: `milestones`
Sequential delivery checkpoints within a Contract.

| Column Name | SQL Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | UUID | **Primary Key** | Unique milestone identifier. |
| `contract_id` | `VARCHAR(36)` | No | — | **FK** $\to$ `contracts(id)` | Parent contract. |
| `title` | `VARCHAR(150)` | No | — | — | Milestone title. |
| `description` | `TEXT` | No | — | — | Deliverable requirements. |
| `amount` | `DECIMAL(12,2)` | No | — | Check: `amount > 0.00` | Portioned payout amount. |
| `sequence_order`| `INTEGER` | No | — | Check: `sequence_order >= 1` | 1-based execution order. |
| `status` | `VARCHAR(30)` | No | `'PENDING'` | Check: Milestone FSM Status | Sub-state of milestone. |
| `due_date` | `DATETIME` | No | — | — | Agreed completion deadline. |
| `review_deadline`| `DATETIME` | Yes | `NULL` | — | Watchdog timeout ($T_{\text{submit}} + 7\text{ days}$). |
| `created_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Record creation timestamp. |
| `updated_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Last transition timestamp. |

*Unique Constraint*: `UNIQUE(contract_id, sequence_order)` — guarantees strict sequential ordering without numbering collisions.

---

### 2.6 Table: `deliverables`
Cryptographically verified submission artifacts.

| Column Name | SQL Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | UUID | **Primary Key** | Unique deliverable identifier. |
| `milestone_id` | `VARCHAR(36)` | No | — | **FK** $\to$ `milestones(id)`, **Unique** | Target milestone (1-to-1). |
| `file_name` | `VARCHAR(255)` | No | — | — | Original upload filename. |
| `file_url` | `VARCHAR(500)` | No | — | — | Storage path URI. |
| `sha256_checksum`| `VARCHAR(64)` | No | — | Check: `LENGTH(sha256_checksum) = 64` | Cryptographic SHA-256 digest. |
| `submission_notes`| `TEXT` | Yes | `NULL` | — | Notes from developer. |
| `submitted_at` | `DATETIME` | No | `CURRENT_TIMESTAMP` | — | Upload timestamp. |

---

### 2.7 Table: `disputes` & `dispute_evidence`
Arbitration cases and attached evidence trees.

#### Table: `disputes`
| Column Name | SQL Type | Nullable | Constraints | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | **Primary Key** | Unique dispute identifier. |
| `milestone_id` | `VARCHAR(36)` | No | **FK** $\to$ `milestones(id)`, **Unique** | Disputed milestone. |
| `raised_by_id` | `VARCHAR(36)` | No | **FK** $\to$ `users(id)` | Claimant (Client or Dev). |
| `reviewer_id` | `VARCHAR(36)` | Yes | **FK** $\to$ `users(id)` | Assigned Arbiter (role `REVIEWER`). |
| `reason` | `TEXT` | No | — | Dispute rationale. |
| `status` | `VARCHAR(20)` | No | Check: `OPEN \| UNDER_REVIEW \| RESOLVED \| REJECTED` | Arbitration state. |
| `ruling` | `VARCHAR(30)` | Yes | Check: `RELEASE_TO_FREELANCER \| REFUND_TO_CLIENT` | Arbiter verdict. |
| `ruling_notes` | `TEXT` | Yes | — | Written legal/technical justification. |
| `created_at` | `DATETIME` | No | — | Claim filed timestamp. |
| `resolved_at` | `DATETIME` | Yes | — | Final ruling timestamp. |

#### Table: `dispute_evidence`
| Column Name | SQL Type | Nullable | Constraints | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | **Primary Key** | Unique evidence identifier. |
| `dispute_id` | `VARCHAR(36)` | No | **FK** $\to$ `disputes(id)` | Parent dispute. |
| `submitted_by_id`| `VARCHAR(36)`| No | **FK** $\to$ `users(id)` | Submitting party. |
| `file_url` | `VARCHAR(500)` | No | — | Storage path. |
| `sha256_checksum`| `VARCHAR(64)` | No | Check: 64 hex chars | Cryptographic digest. |
| `description` | `VARCHAR(255)` | No | — | Evidence description. |
| `submitted_at` | `DATETIME` | No | — | Submission timestamp. |

---

### 2.8 Table: `escrow_transactions` (Double-Entry Financial Ledger)
Append-only log of all financial transfers.

| Column Name | SQL Type | Nullable | Constraints | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | **Primary Key** | Unique ledger entry ID. |
| `contract_id` | `VARCHAR(36)` | No | **FK** $\to$ `contracts(id)` | Related contract. |
| `milestone_id` | `VARCHAR(36)` | Yes | **FK** $\to$ `milestones(id)` | Related milestone (if applicable). |
| `from_user_id` | `VARCHAR(36)` | Yes | **FK** $\to$ `users(id)` | Source account (`NULL` = escrow pool). |
| `to_user_id` | `VARCHAR(36)` | Yes | **FK** $\to$ `users(id)` | Destination account (`NULL` = escrow pool). |
| `amount` | `DECIMAL(12,2)` | No | Check: `amount > 0.00` | Portioned transfer amount. |
| `type` | `VARCHAR(20)` | No | Check: `DEPOSIT \| LOCK \| RELEASE \| REFUND` | Transaction nature. |
| `status` | `VARCHAR(20)` | No | Check: `PENDING \| COMPLETED \| FAILED` | Ledger status. |
| `created_at` | `DATETIME` | No | — | Execution timestamp. |

---

### 2.9 Table: `audit_logs` (Append-Only Institutional Audit Trail)
Tamper-resistant log with cryptographic verification hashes.

| Column Name | SQL Type | Nullable | Constraints | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | No | **Primary Key** | Unique audit record ID. |
| `actor_id` | `VARCHAR(36)` | No | — | User UUID or `'SYSTEM'`. |
| `entity_name` | `VARCHAR(50)` | No | — | Affected entity (`Contract`, `Milestone`, etc.). |
| `entity_id` | `VARCHAR(36)` | No | — | UUID of affected entity. |
| `action` | `VARCHAR(50)` | No | — | Executed action verb. |
| `previous_state`| `TEXT` | Yes | — | State before transition (JSON string). |
| `new_state` | `TEXT` | No | — | State after transition (JSON string). |
| `verification_hash`| `VARCHAR(64)` | No | Check: 64 hex chars | SHA-256 of `(actorId + entityId + action + newState + timestamp)`. |
| `timestamp` | `DATETIME` | No | — | Exact UTC action timestamp. |

---

## 3. BCNF Normalization Proof

A relational schema is in **Boyce-Codd Normal Form (BCNF)** if and only if for every non-trivial functional dependency $X \to Y$, $X$ is a superkey.

1. **1NF Satisfied**: All attributes contain atomic values (single scalar types); repeating groups eliminated.
2. **2NF Satisfied**: No non-prime attribute is functionally dependent on a proper subset of any candidate key (all tables use single-attribute surrogate UUID primary keys).
3. **3NF Satisfied**: No transitive functional dependencies exist ($X \to Y$ and $Y \to Z$ where $Z$ is non-prime).
4. **BCNF Satisfied**:
   - In `proposals`, candidate keys are `id` and `(project_id, freelancer_id)`. Both candidate keys determine all other attributes.
   - In `milestones`, candidate keys are `id` and `(contract_id, sequence_order)`. Both candidate keys determine all other attributes.
   - In `deliverables`, `id` and `milestone_id` are candidate keys.
   - Every determinant across all tables is a candidate key $\implies$ **Schema is strictly in BCNF**.
