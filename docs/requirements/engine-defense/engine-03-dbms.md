# Engine 03 Defense — DBMS Engine

> **Student Owner**: Purvi Sammatshetti (Roll No: 11, SRN: `02FE24BCS022`)
> **Owning Engine**: Engine 03 — Transaction Ledger & Contracts
> **Academic Subject**: Database Management Systems (DBMS)
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1)

---

## 1. Academic Subject & Curricular Alignment
- **Foundational Subject**: Database Management Systems (DBMS)
- **Core Curricular Principles**:
  - Relational Data Modeling and Boyce-Codd Normal Form (BCNF) normalization.
  - ACID Transaction properties (Atomicity, Consistency, Isolation, Durability).
  - Integrity Constraints, Primary/Foreign Key relations, and domain invariants.
  - Append-only audit trail design and tamper resistance.
  - B-Tree index optimization for high-efficiency querying.

---

## 2. Problem Being Solved
1. **Financial Inconsistency & Lost Balances**: If a system crashes halfway through transferring funds from a client's deposit to milestone escrow, funds could disappear or duplicate without transaction rollbacks.
2. **Data Redundancy & Update Anomalies**: Duplicating milestone states, contract terms, or user profiles across tables creates state corruption when updates are made.
3. **Audit Repudiation**: Without an append-only ledger, malicious administrators or compromised services could alter historical transaction records to cover up embezzlement or errors.
4. **Concurrency Collisions**: Multiple requests accessing balances without isolation can cause race conditions and negative balances.

---

## 3. Functional Requirements Owned
- **FR-05: ACID-Compliant Payment Ledger Processing**: Executes simulated fund locks, releases, and refunds within atomic transactions that guarantee zero balance discrepancies (NFR-08).
- **FR-06: Append-Only Tamper-Resistant Audit Log**: Logs every state mutation, fund transfer, deliverable submission, and dispute verdict into an immutable audit table with monotonically increasing sequence IDs.
- **Supporting Dependency for FR-11**: Provides indexed query capabilities and optimized schema structure for proposal tags and skill criteria.

---

## 4. Core Concepts Demonstrated
1. **Relational Schema Normalization (BCNF)**:
   - Decomposing entities: `User`, `Project`, `Milestone`, `Contract`, `Proposal`, `EscrowTransaction`, `Deliverable`, `DisputeCase`, `AuditLog`.
   - Elimination of partial and transitive functional dependencies.
2. **ACID Transaction Boundaries**:
   - Atomicity: Milestone funding decrements Client Balance and increments Milestone Escrow in a single all-or-nothing unit of work.
   - Consistency: Checked invariants ensure $\text{Balance} \ge 0$ at all times.
   - Isolation: Serialized transaction isolation prevents dirty reads and concurrent balance overwrites.
   - Durability: Write-Ahead Logging (WAL) ensures committed transactions persist on disk across crashes.
3. **Double-Entry Accounting Principle**:
   - Total system currency remains constant:
     $$\Delta \text{ClientAvailable} + \Delta \text{EscrowLocked} + \Delta \text{FreelancerEarned} = 0$$

---

## 5. Why This Belongs to DBMS
Database Management Systems is the definitive academic subject governing persistent state, relational integrity, and transaction management:
- An escrow system is essentially a transactional ledger.
- Ensuring that money is never created or destroyed during a transfer requires formal ACID guarantees.
- Structuring data into BCNF tables with strict foreign-key cascade rules and check constraints is the foundation of relational database theory.

---

## 6. Expected Gate 1 Evidence
- **Entity-Relationship (ER) Conceptual Model**: Complete mapping of entities, cardinalities ($1:1$, $1:N$, $N:M$), and relationship attributes.
- **BCNF Normalization Proof**: Functional dependency analysis proving zero anomalies across relation schemas.
- **Transaction Rollback Sequence Diagram**: Modeling failure points and rollback executions during an escrow release.
- **Ledger Invariant Formulas**: Mathematical verification rules for balance consistency.

---

## 7. Likely Evaluator Questions & Exact Defenses

### Q1: "Why did you choose SQLite instead of an enterprise DBMS like PostgreSQL or Oracle?"
> **Defense**: "Our choice of SQLite is grounded in both academic and engineering requirements:
> 1. Full ACID Compliance: SQLite is a complete relational database engine that supports full ACID transactions, foreign-key constraints, and Write-Ahead Logging (WAL).
> 2. Zero-Configuration Reproducibility: For academic evaluation across diverse departmental lab machines, SQLite requires no external database server process, eliminating networking failures and connection pool limits.
> 3. Embedded In-Process Speed: Reading and writing to an embedded SQLite file provides sub-millisecond query execution, easily satisfying our NFR-01 latency requirement ($\le 500$ ms)."

### Q2: "How do you guarantee that a client cannot spend funds that are already locked in escrow?"
> **Defense**: "Under FR-05 and NFR-08, when a milestone is funded, the transaction performs an atomic check-and-update:
> `UPDATE Users SET available_balance = available_balance - :amount WHERE id = :client_id AND available_balance >= :amount;`
> If the affected row count is 0, the balance was insufficient; the transaction aborts and rolls back immediately. The funds are simultaneously moved to `EscrowTransactions` with status `LOCKED`. The client's available balance is permanently deducted, making double-spending mathematically impossible."

### Q3: "What makes your audit log 'tamper-resistant' if it resides in the same SQLite database?"
> **Defense**: "In Stage S1 requirements, FR-06 specifies that the `AuditLog` table is strictly append-only:
> 1. The database layer exposes only `INSERT` capabilities for audit entries; no `UPDATE` or `DELETE` procedures exist.
> 2. Each audit row records a monotonically increasing auto-increment ID, immutable timestamp, acting user ID, action type, previous state, and new state.
> 3. Any manual database tampering that deletes a row introduces an obvious gap in the sequential ID series, which is immediately flagged during system verification."

### Q4: "What is your role in FR-11 (Semantic Proposal Matcher) if Darshan (Engine 02) is the primary owner?"
> **Defense**: "Engine 03 owns the data persistence and query optimization layer. For FR-11, I design the database schema for project tags and freelancer skill vectors, creating B-Tree indexes on tag attributes so that candidate proposals can be filtered efficiently from thousands of records without full-table scans. Once candidate records are fetched, Darshan's matching algorithm in Engine 02 executes the similarity scoring and ranking in memory."
