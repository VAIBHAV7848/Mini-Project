# Database Architecture & Schema Specification

> **Classification**: Database Management Systems Engine Specification (Engine 03)
> **Engine Owner**: Purvi Sammatshetti (Roll No: 11, SRN: `02FE24BCS022`)
> **Database Engine**: SQLite with Prisma 5.22 ORM
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slides 14, 16, 17)
> - `docs/decisions/ADR-001-technology-stack-baseline.md`

---

## 1. Persistence Strategy & ACID Principles
The database layer manages all relational data entities in BCNF-normalized tables, executes atomic transactions for financial escrow ledger state transitions, and maintains an append-only audit trail for dispute transparency.

- **ORM**: Prisma 5.22
- **Relational Storage**: SQLite (local embedded engine with zero-configuration overhead)
- **Transactions**: Atomic `prisma.$transaction()` blocks for all escrow balance modifications
- **Integrity**: Foreign key cascading rules, unique constraints, and parameterized queries

---

## 2. Core Entity Relationship Model (ERD)

```mermaid
erDiagram
    USER ||--o{ PROJECT : creates
    USER ||--o{ PROPOSAL : submits
    USER ||--o{ GIG : offers
    USER ||--o{ CONTRACT : participates_in
    USER ||--o{ AUDIT_LOG : triggers

    PROJECT ||--o{ PROPOSAL : receives
    PROJECT ||--o| CONTRACT : spawns

    GIG ||--o{ ORDER : receives

    CONTRACT ||--o{ MILESTONE : contains
    CONTRACT ||--o{ ESCROW_TRANSACTION : logs

    MILESTONE ||--o{ DELIVERABLE : has
    MILESTONE ||--o| DISPUTE : may_raise

    DISPUTE ||--o{ DISPUTE_EVIDENCE : contains

    USER {
        string id PK
        string email UK
        string name
        string role "CLIENT | FREELANCER | REVIEWER | ADMIN"
        float balance
        string github_profile
        int dev_score
        datetime created_at
    }

    PROJECT {
        string id PK
        string client_id FK
        string title
        string description
        float budget
        string status "OPEN | IN_PROGRESS | COMPLETED | CANCELLED"
        datetime created_at
    }

    PROPOSAL {
        string id PK
        string project_id FK
        string freelancer_id FK
        float bid_amount
        string cover_letter
        float ai_match_score
        string status "PENDING | ACCEPTED | REJECTED"
        datetime created_at
    }

    CONTRACT {
        string id PK
        string project_id FK
        string client_id FK
        string freelancer_id FK
        float total_amount
        float escrow_balance
        string status "AWAITING_DEPOSIT | FUNDED | IN_PROGRESS | UNDER_REVIEW | RELEASED | DISPUTED"
        datetime created_at
        datetime updated_at
    }

    MILESTONE {
        string id PK
        string contract_id FK
        string title
        string description
        float amount
        int sequence_order
        string status "PENDING | FUNDED | IN_PROGRESS | SUBMITTED | APPROVED | RELEASED | DISPUTED"
        datetime due_date
    }

    DELIVERABLE {
        string id PK
        string milestone_id FK
        string file_name
        string file_url
        string sha256_checksum
        string submission_notes
        datetime submitted_at
    }

    DISPUTE {
        string id PK
        string milestone_id FK
        string raised_by_id FK
        string reviewer_id FK
        string reason
        string status "OPEN | UNDER_REVIEW | RESOLVED | REJECTED"
        string resolution_ruling
        datetime created_at
        datetime resolved_at
    }

    DISPUTE_EVIDENCE {
        string id PK
        string dispute_id FK
        string submitted_by_id FK
        string file_url
        string sha256_checksum
        string description
        datetime submitted_at
    }

    ESCROW_TRANSACTION {
        string id PK
        string contract_id FK
        string milestone_id FK
        string from_user_id FK
        string to_user_id FK
        float amount
        string type "DEPOSIT | LOCK | RELEASE | REFUND"
        string status "PENDING | COMPLETED | FAILED"
        datetime created_at
    }

    AUDIT_LOG {
        string id PK
        string actor_id FK
        string entity_name
        string entity_id
        string action
        string previous_state
        string new_state
        string verification_hash
        datetime timestamp
    }
```

---

## 3. Database Migration & Schema Hygiene
1. **Schema Definition**: Expressed in `prisma/schema.prisma`.
2. **Deterministic Seed Scripts**: Provide baseline mock data for Clients, Freelancers, Reviewers, and sample Projects for local evaluation (`prisma/seed.ts`).
3. **Audit Trail Immutability**: The `AUDIT_LOG` table is append-only; update and delete operations on audit records are forbidden.
