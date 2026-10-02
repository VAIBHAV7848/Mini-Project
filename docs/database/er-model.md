# Entity-Relationship (ER) Model Specification

> **Classification**: Authoritative Database ER Model Specification (Stage S2 — Shared Architecture)
> **Engine Owner**: Engine 03 (DBMS Engine) — Purvi Sammatshetti
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slide 14, 16)
> - `docs/database/schema.md`
> - `docs/decisions/ADR-007-database-transactions.md`

---

## 1. Visual Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : "posts (as client)"
    USERS ||--o{ PROPOSALS : "submits (as freelancer)"
    USERS ||--o{ GIGS : "offers (as freelancer)"
    USERS ||--o{ CONTRACTS : "client_party"
    USERS ||--o{ CONTRACTS : "freelancer_party"
    USERS ||--o{ DISPUTES : "raises"
    USERS ||--o{ DISPUTES : "reviews (as arbiter)"
    USERS ||--o{ DISPUTE_EVIDENCE : "submits"
    USERS ||--o{ AUDIT_LOGS : "triggers (actor)"

    PROJECTS ||--o{ PROPOSALS : "receives"
    PROJECTS ||--o| CONTRACTS : "solidifies_into"

    GIGS ||--o{ ORDERS : "ordered_via"

    CONTRACTS ||--|{ MILESTONES : "decomposed_into"
    CONTRACTS ||--o{ ESCROW_TRANSACTIONS : "logs"

    MILESTONES ||--o| DELIVERABLES : "fulfills"
    MILESTONES ||--o| DISPUTES : "subject_of"
    MILESTONES ||--o{ ESCROW_TRANSACTIONS : "releases_for"

    DISPUTES ||--o{ DISPUTE_EVIDENCE : "substantiated_by"

    USERS {
        VARCHAR_36 id PK
        VARCHAR_255 email UK
        VARCHAR_255 password_hash
        VARCHAR_100 name
        VARCHAR_20 role
        DECIMAL_12_2 balance
        VARCHAR_100 github_profile
        INTEGER dev_score
        DATETIME created_at
        DATETIME updated_at
    }

    PROJECTS {
        VARCHAR_36 id PK
        VARCHAR_36 client_id FK
        VARCHAR_200 title
        TEXT description
        DECIMAL_12_2 budget
        TEXT skill_tags
        VARCHAR_20 status
        DATETIME created_at
        DATETIME updated_at
    }

    PROPOSALS {
        VARCHAR_36 id PK
        VARCHAR_36 project_id FK
        VARCHAR_36 freelancer_id FK
        DECIMAL_12_2 bid_amount
        TEXT cover_letter
        DECIMAL_5_2 ai_match_score
        VARCHAR_20 status
        DATETIME created_at
    }

    CONTRACTS {
        VARCHAR_36 id PK
        VARCHAR_36 project_id FK
        VARCHAR_36 client_id FK
        VARCHAR_36 freelancer_id FK
        DECIMAL_12_2 total_amount
        DECIMAL_12_2 escrow_balance
        VARCHAR_30 status
        DATETIME created_at
        DATETIME updated_at
    }

    MILESTONES {
        VARCHAR_36 id PK
        VARCHAR_36 contract_id FK
        VARCHAR_150 title
        TEXT description
        DECIMAL_12_2 amount
        INTEGER sequence_order
        VARCHAR_30 status
        DATETIME due_date
        DATETIME review_deadline
        DATETIME created_at
        DATETIME updated_at
    }

    DELIVERABLES {
        VARCHAR_36 id PK
        VARCHAR_36 milestone_id FK,UK
        VARCHAR_255 file_name
        VARCHAR_500 file_url
        VARCHAR_64 sha256_checksum
        TEXT submission_notes
        DATETIME submitted_at
    }

    DISPUTES {
        VARCHAR_36 id PK
        VARCHAR_36 milestone_id FK,UK
        VARCHAR_36 raised_by_id FK
        VARCHAR_36 reviewer_id FK
        TEXT reason
        VARCHAR_20 status
        VARCHAR_30 ruling
        TEXT ruling_notes
        DATETIME created_at
        DATETIME resolved_at
    }

    DISPUTE_EVIDENCE {
        VARCHAR_36 id PK
        VARCHAR_36 dispute_id FK
        VARCHAR_36 submitted_by_id FK
        VARCHAR_500 file_url
        VARCHAR_64 sha256_checksum
        VARCHAR_255 description
        DATETIME submitted_at
    }

    ESCROW_TRANSACTIONS {
        VARCHAR_36 id PK
        VARCHAR_36 contract_id FK
        VARCHAR_36 milestone_id FK
        VARCHAR_36 from_user_id FK
        VARCHAR_36 to_user_id FK
        DECIMAL_12_2 amount
        VARCHAR_20 type
        VARCHAR_20 status
        DATETIME created_at
    }

    AUDIT_LOGS {
        VARCHAR_36 id PK
        VARCHAR_36 actor_id
        VARCHAR_50 entity_name
        VARCHAR_36 entity_id
        VARCHAR_50 action
        TEXT previous_state
        TEXT new_state
        VARCHAR_64 verification_hash
        DATETIME timestamp
    }
```

---

## 2. Cardinality & Relationship Semantics

| Primary Entity | Foreign Entity | Cardinality | Business Rule / Referential Integrity Policy |
| :--- | :--- | :---: | :--- |
| `USERS` | `PROJECTS` | `1 : N` | A client can post multiple projects; a project has exactly one posting client. `ON DELETE RESTRICT`. |
| `PROJECTS` | `PROPOSALS` | `1 : N` | A project receives multiple freelancer proposals. `ON DELETE CASCADE`. |
| `USERS` | `PROPOSALS` | `1 : N` | A freelancer can submit proposals to multiple projects, but only 1 per project (`UNIQUE(project_id, freelancer_id)`). |
| `PROJECTS` | `CONTRACTS` | `1 : 1` | When a client accepts a proposal, exactly one binding contract is formed from that project. `ON DELETE RESTRICT`. |
| `CONTRACTS` | `MILESTONES` | `1 : N` | A contract is decomposed into 1 or more sequential milestones ($\ge 1$). `ON DELETE RESTRICT`. |
| `MILESTONES` | `DELIVERABLES`| `1 : 1` | A milestone has at most one active verified submission deliverable (`UNIQUE(milestone_id)`). `ON DELETE RESTRICT`. |
| `MILESTONES` | `DISPUTES` | `1 : 1` | A milestone can have at most one active dispute at any given time. `ON DELETE RESTRICT`. |
| `DISPUTES` | `DISPUTE_EVIDENCE`| `1 : N`| A dispute accumulates multiple evidence items from both claimant and respondent. `ON DELETE CASCADE`. |
| `CONTRACTS` | `ESCROW_TRANSACTIONS`| `1 : N`| A contract accumulates an append-only sequence of deposit, lock, release, and refund ledger entries. |
| `ANY` | `AUDIT_LOGS` | `1 : N` | State-modifying actions append immutable audit rows. Zero foreign key cascade deletions allowed. |
