# Database Indexing Strategy Specification

> **Classification**: Authoritative DBMS Indexing Specification (Stage S2 — Shared Architecture)
> **Engine Owner**: Engine 03 (DBMS Engine) — Purvi Sammatshetti
> **RDBMS**: SQLite 3 B-Tree Storage Engine
> **Source Documents**:
> - `docs/requirements/non-functional-requirements.md` (NFR-01, NFR-08)
> - `docs/database/schema.md`
> - `docs/decisions/ADR-007-database-transactions.md`

---

## 1. Indexing Principles & Rationale

In embedded SQLite, query performance directly determines API response latency. To guarantee compliance with **NFR-01** (95% of standard read queries completing in $\le 500\text{ ms}$ under benchmark workloads), Engine 03 establishes a targeted B-Tree indexing strategy.

### Design Principles:
1. **Index Every Foreign Key**: SQLite does **not** automatically index foreign key columns. Without explicit indexes, joining child tables (e.g. fetching milestones for a contract) results in expensive full-table scans ($O(N)$).
2. **Compound Indexes for Filtering & Sorting**: Queries that filter by status and sort by timestamp or score utilize composite indexes to satisfy both predicates in a single B-Tree lookup ($O(\log N)$).
3. **Covering Indexes for Polling Hot Paths**: The 5-second polling route (`/api/contracts/{id}/milestones`) reads exclusively from indexed columns, eliminating table row lookups.
4. **Selective Indexing to Bound Write Overhead**: Because SQLite WAL mode logs index modifications, extraneous indexes on high-write tables (`audit_logs`) are avoided.

---

## 2. Comprehensive Index Inventory

| Table | Index Name | Indexed Columns | Index Type | Target Query Pattern / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `idx_users_email` | `email` | **Unique B-Tree** | Authentication lookup (`POST /api/auth/login`). |
| `users` | `idx_users_role` | `role` | Secondary B-Tree | Filtering developer listings (`GET /api/developers`). |
| `projects` | `idx_projects_client` | `client_id` | Foreign Key | Client dashboard loading my projects. |
| `projects` | `idx_projects_status_created` | `status`, `created_at DESC` | Composite B-Tree | Marketplace project browsing (`GET /api/projects?status=OPEN`). |
| `proposals` | `idx_proposals_project_freelancer` | `project_id`, `freelancer_id`| **Unique Composite**| Enforces 1 bid per dev; duplicate prevention. |
| `proposals` | `idx_proposals_project_score` | `project_id`, `ai_match_score DESC` | Composite B-Tree | Ranked proposal inspection for Client. |
| `contracts` | `idx_contracts_client` | `client_id` | Foreign Key | Client contract dashboard lookups. |
| `contracts` | `idx_contracts_freelancer`| `freelancer_id` | Foreign Key | Freelancer active contract lookups. |
| `contracts` | `idx_contracts_status` | `status` | Secondary B-Tree | Filtering contracts by active escrow state. |
| `milestones` | `idx_milestones_contract_seq` | `contract_id`, `sequence_order` | **Unique Composite**| Fetching milestones in strict sequential order. |
| `milestones` | `idx_milestones_watchdog` | `status`, `review_deadline` | Composite Partial | Watchdog scheduler polling (`status = 'UNDER_REVIEW'`). |
| `deliverables`| `idx_deliverables_milestone` | `milestone_id` | **Unique Foreign Key**| Fetching deliverable checksum for milestone. |
| `disputes` | `idx_disputes_milestone` | `milestone_id` | **Unique Foreign Key**| Linking dispute to disputed milestone. |
| `disputes` | `idx_disputes_status` | `status` | Secondary B-Tree | Reviewer arbitration console active queues. |
| `dispute_evidence` | `idx_evidence_dispute` | `dispute_id` | Foreign Key | Loading evidence list for `EvidenceTree` generation. |
| `escrow_transactions` | `idx_escrow_tx_contract` | `contract_id`, `created_at` | Composite B-Tree | Contract financial ledger audit trail. |
| `audit_logs` | `idx_audit_logs_entity` | `entity_name`, `entity_id` | Composite B-Tree | Entity-specific historical compliance view. |
| `audit_logs` | `idx_audit_logs_timestamp`| `timestamp DESC` | Secondary B-Tree | System-wide auditor dashboard stream. |

---

## 3. Critical Query Optimization Proofs

### 3.1 Review Timeout Watchdog Polling Query
- **Query**:
  ```sql
  SELECT id, contract_id, review_deadline
  FROM milestones
  WHERE status = 'UNDER_REVIEW'
    AND review_deadline <= CURRENT_TIMESTAMP;
  ```
- **Index Used**: `idx_milestones_watchdog (status, review_deadline)`
- **Execution Cost**: B-Tree range scan over the subset of rows where `status = 'UNDER_REVIEW'`. Execution time is $O(\log N + K)$ where $K$ is the number of overdue milestones (typically $\le 5$). Zero table scan occurs.

### 3.2 Proposal Ranking Query (FR-11 Presentation)
- **Query**:
  ```sql
  SELECT id, freelancer_id, bid_amount, ai_match_score, status
  FROM proposals
  WHERE project_id = :projectId
  ORDER BY ai_match_score DESC;
  ```
- **Index Used**: `idx_proposals_project_score (project_id, ai_match_score DESC)`
- **Execution Cost**: Direct index seek to `project_id`, followed by sequential index traversal in pre-sorted score order. Eliminates in-memory sort buffer ($O(1)$ sort overhead).
