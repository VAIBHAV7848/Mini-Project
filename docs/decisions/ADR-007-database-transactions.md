# ADR-007: SQLite WAL-Mode and Serialized ACID Transaction Boundaries

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Purvi Sammatshetti — Engine 03 Lead)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
Financial escrow platforms require absolute transaction integrity: balance debits and credits must be conserved ($\sum \Delta\text{balance} = 0$), partial updates must never persist upon process failure, and audit records must be atomically bound to state changes. Furthermore, the embedded SQLite database must be configured to support concurrent dashboard reads without locking out active escrow write operations.

---

## 2. Decision Outcome
> **Chosen Option**: SQLite 3 in Write-Ahead Logging (WAL) mode managed via Prisma ORM 5.22, with all financial mutations executed within atomic `prisma.$transaction()` blocks.
> **Rationale**: WAL mode allows concurrent readers to operate without blocking writers. Atomic transaction blocks ensure that wallet debits, escrow credits, milestone updates, ledger inserts, and audit log entries commit or roll back as an indivisible unit.

---

## 3. Considered Options
1. **SQLite WAL Mode with Prisma Transactions (Chosen)**:
   - *Pros*: Zero external daemon setup; full ACID guarantees; concurrent read access; BCNF relational integrity; automatic rollback on error.
   - *Cons*: Single-writer serialization limits extreme write concurrency (mitigated via `busy_timeout = 5000`).
2. **MongoDB / NoSQL Document Store**:
   - *Pros*: Fast schema iterations.
   - *Cons*: Lacks native multi-document relational constraints and violates DBMS Engine academic curriculum requirements for BCNF normalization.
3. **Standalone PostgreSQL Server**:
   - *Pros*: Advanced multi-writer concurrency.
   - *Cons*: Heavy background daemon requiring user setup and credentials, increasing friction for evaluators running `./scripts/verify` on clean lab machines.

---

## 4. Key Rules Enforced
- **WAL Journaling**: `PRAGMA journal_mode = WAL;` enabled on SQLite database.
- **Foreign Key Enforcement**: `PRAGMA foreign_keys = ON;` strictly enforced.
- **7-Step Atomic Flow**: Deposit, Release, and Refund operations execute read, guard, debit, credit, state update, ledger logging, and audit hashing within a single transaction.
- **Immutability Triggers**: SQLite triggers block `UPDATE` and `DELETE` on `audit_logs`.

---

## 5. Consequences
- **Positive Consequences**:
  - Mathematically impossible to produce balance drift or orphan records.
  - Zero-configuration local execution for KLE evaluation.
- **Negative Consequences / Trade-offs**:
  - Requires handling `SQLITE_BUSY` errors gracefully with retry logic.

---

## 6. Links & References
- Database Schema: `docs/database/schema.md`
- Transaction Design: `docs/database/transaction-design.md`
- Audit Log Design: `docs/database/audit-log-design.md`
