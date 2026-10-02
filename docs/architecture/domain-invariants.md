# Domain Invariants Specification

> **Classification**: Authoritative System Invariants Specification (Stage S2 — Shared Architecture)
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slides 12, 14, 16, 18)
> - `docs/requirements/functional-requirements.md` (FR-01, FR-02, FR-03, FR-05, FR-06, FR-08, FR-11)
> - `docs/requirements/non-functional-requirements.md` (NFR-02, NFR-03, NFR-08, NFR-09)

---

## 1. Overview & Invariant Enforcement Strategy

Domain invariants represent core business truths that must **never** be violated under any concurrent operation, network anomaly, or edge-case input. Invariants are enforced across three complementary layers:

1. **Pre-condition Validation**: Engine 01 (OS FSM) and Zod 4 schemas check inputs before mutation.
2. **Transactional Concurrency Locks**: Engine 03 (DBMS) executes mutations inside atomic SQLite transactions (`prisma.$transaction`) with serialized write guards.
3. **Database Constraints**: Unique indexes, foreign keys, and check constraints reject illegal mutations at the storage engine level.

---

## 2. Formal Invariants Catalog

### INV-01: No Double-Funding of Escrow (Double-Allocation Prevention)
- **Requirement**: FR-01, FR-05
- **Owning Engine**: Engine 01 (OS Engine) & Engine 03 (DBMS Engine)
- **Statement**: An escrow balance for a contract or milestone can only be funded once. Re-executing deposit operations on an already funded contract must be rejected.
- **Formal Predicate**:
  $$\forall c \in \text{Contracts}, \quad \text{Transition}(c, \text{DEPOSIT}) \implies \text{CurrentState}(c) = \text{AWAITING\_DEPOSIT} \land \text{escrowBalance}(c) = 0$$
- **Enforcement**:
  1. Engine 01 FSM guard checks: `c.status === 'AWAITING_DEPOSIT'`.
  2. Engine 03 runs conditional atomic update: `UPDATE Contract SET status = 'FUNDED', escrow_balance = total_amount WHERE id = :id AND status = 'AWAITING_DEPOSIT'`. If zero rows updated, throw `ConflictError("ESCROW_ALREADY_FUNDED")`.
- **Failure Behavior**: HTTP 409 Conflict with error code `ESCROW_ALREADY_ALLOCATED`. Client balance remains unchanged.

---

### INV-02: Strict Single-Release & Terminal Escrow Lifecycle
- **Requirement**: FR-01, FR-05
- **Owning Engine**: Engine 01 (OS Engine) & Engine 03 (DBMS Engine)
- **Statement**: Escrow funds for a given milestone or contract can be released exactly once. Once marked `RELEASED` or `REFUNDED`, the escrow balance is zero and the state is terminal.
- **Formal Predicate**:
  $$\forall m \in \text{Milestones}, \quad \text{Transition}(m, \text{RELEASE}) \implies \text{CurrentState}(m) = \text{APPROVED} \land \text{escrowBalance}(m) > 0$$
  $$\forall m \in \text{Milestones}, \quad \text{CurrentState}(m) \in \{\text{RELEASED}, \text{REFUNDED}\} \implies \text{escrowBalance}(m) = 0 \land \text{Terminal}(m) = \text{true}$$
- **Enforcement**:
  1. Engine 01 FSM validator rejects any outgoing transition from `RELEASED` or `REFUNDED`.
  2. Engine 03 executes balance debit and credit within a single serialized transaction.
- **Failure Behavior**: HTTP 400 Bad Request with error code `INVALID_STATE_TRANSITION`. No fund movement occurs.

---

### INV-03: Conservation of Financial Balances (ACID Ledger Invariant)
- **Requirement**: FR-05, NFR-08
- **Owning Engine**: Engine 03 (DBMS Engine)
- **Statement**: For every financial escrow transaction (deposit, release, refund), the net change across all involved balances (user balance, escrow balance) must sum to exactly zero.
- **Formal Predicate**:
  $$\sum \Delta\text{Balance}_{\text{User}} + \Delta\text{Balance}_{\text{Escrow}} = 0$$
  $$\forall u \in \text{Users}, \quad \text{Balance}(u) \ge 0.00$$
- **Enforcement**:
  1. Single `prisma.$transaction` encompassing debit, credit, transaction record insertion, and audit log write.
  2. Database constraint `CHECK (balance >= 0.00)` on `User.balance`.
- **Failure Behavior**: Immediate transaction rollback. If debit causes negative balance, throw `InsufficientFundsError`. No partial ledger update persists.

---

### INV-04: Non-Bypassable Sequential Milestone Lifecycle
- **Requirement**: FR-01, FR-02
- **Owning Engine**: Engine 01 (OS Engine)
- **Statement**: A milestone cannot skip intermediate states. It cannot be approved without a prior deliverable submission, and cannot be released without prior client approval or watchdog timeout expiration.
- **Formal Predicate**:
  $$\text{NextState}(m) \in \text{PermittedTransitions}(\text{CurrentState}(m))$$
  $$\text{PermittedTransitions}(\text{PENDING}) = \{\text{FUNDED}\}$$
  $$\text{PermittedTransitions}(\text{FUNDED}) = \{\text{IN\_PROGRESS}\}$$
  $$\text{PermittedTransitions}(\text{IN\_PROGRESS}) = \{\text{SUBMITTED}\}$$
  $$\text{PermittedTransitions}(\text{SUBMITTED}) = \{\text{UNDER\_REVIEW}, \text{DISPUTED}\}$$
  $$\text{PermittedTransitions}(\text{UNDER\_REVIEW}) = \{\text{APPROVED}, \text{DISPUTED}, \text{REVIEW\_TIMEOUT}\}$$
  $$\text{PermittedTransitions}(\text{APPROVED}) = \{\text{RELEASED}\}$$
- **Enforcement**:
  Centralized FSM transition validator function `validateEscrowTransition(currentState, targetState)`. Any attempt to transition outside the permitted matrix throws `InvalidTransitionException`.
- **Failure Behavior**: HTTP 400 Bad Request with code `FORBIDDEN_TRANSITION_PATH`.

---

### INV-05: Non-Bypassable Server-Side Role-Based Authorization
- **Requirement**: FR-08, NFR-02
- **Owning Engine**: Engine 04 (Web Technologies Engine)
- **Statement**: Every state-modifying action must be authorized based on the caller's server-validated session role and relationship to the resource. Presentation layer visibility is insufficient.
- **Formal Predicate**:
  $$\forall a \in \text{Actions}, \quad \text{Authorize}(u, a, r) \iff \text{Role}(u) \in \text{AllowedRoles}(a) \land \text{IsPartyTo}(u, r)$$
  - Only `CLIENT` party to contract can deposit or approve.
  - Only `FREELANCER` party to contract can submit deliverables.
  - Only `REVIEWER` assigned to dispute can render rulings.
  - Only `ADMIN` can inspect system-wide audit logs.
- **Enforcement**:
  Next.js Server Route Handler middleware inspects session token, fetches authoritative user role from database, and verifies identity against resource `client_id` or `freelancer_id`.
- **Failure Behavior**: HTTP 401 Unauthorized (unauthenticated) or HTTP 403 Forbidden (unauthorized role/non-party).

---

### INV-06: Cryptographic Immutability of Deliverable Evidence
- **Requirement**: FR-03, FR-04, NFR-03
- **Owning Engine**: Engine 02 (DSA & SE Engine)
- **Statement**: Once a deliverable is submitted, its SHA-256 checksum is calculated and stored. The checksum is immutable. Any deliverable downloaded must hash to the exact stored checksum.
- **Formal Predicate**:
  $$\forall d \in \text{Deliverables}, \quad \text{SHA256}(\text{FileBytes}(d)) = \text{StoredChecksum}(d)$$
  $$\text{Length}(\text{StoredChecksum}(d)) = 64 \land \text{Hex}(\text{StoredChecksum}(d)) = \text{true}$$
- **Enforcement**:
  1. Engine 02 executes `crypto.createHash('sha256').update(fileBuffer).digest('hex')` on upload.
  2. Database column has no public update mutation; deliverable rows are insert-only.
  3. `EvidenceTree` leaf verification computes file digest dynamically and asserts equality with stored leaf hash.
- **Failure Behavior**: Deliverable verification fails with `EvidenceTamperedException`; milestone cannot transition to `APPROVED`; audit log records `EVIDENCE_TAMPERING_DETECTED`.

---

### INV-07: Append-Only Immutability of Institutional Audit Trail
- **Requirement**: FR-06, NFR-09
- **Owning Engine**: Engine 03 (DBMS Engine)
- **Statement**: Audit log records are append-only. No SQL `UPDATE` or `DELETE` statements are ever executed against the `AUDIT_LOG` table. Every record contains a verifiable chained cryptographic hash.
- **Formal Predicate**:
  $$\forall \text{op} \in \{\text{UPDATE}, \text{DELETE}\}, \quad \text{Execute}(\text{op}, \text{AUDIT\_LOG}) = \text{REJECT}$$
  $$\forall l \in \text{AuditLogs}, \quad \text{Hash}(l) = \text{SHA256}(\text{actorId} \parallel \text{entityId} \parallel \text{action} \parallel \text{newState} \parallel \text{timestamp})$$
- **Enforcement**:
  1. Prisma data access layer exposes only `auditLog.create()` and `auditLog.findMany()`. No update or delete methods are generated or called.
  2. Database triggers or application-level guards block modifications.
- **Failure Behavior**: Application error logged and operation aborted if audit row creation fails.

---

### INV-08: Deterministic Heuristic Match Score Reproducibility
- **Requirement**: FR-11
- **Owning Engine**: Engine 02 (DSA & SE Engine)
- **Statement**: Given identical project skill tags, developer skill sets, hourly bid ratios, and DevScores, the AI Semantic Matching calculation must yield the exact same numerical match score $\in [0.00, 100.00]$.
- **Formal Predicate**:
  $$\text{MatchScore}(P, D) = f(\text{SkillOverlap}(P, D), \text{BudgetRatio}(P, D), \text{DevScore}(D))$$
  $$\forall t_1, t_2, \quad \text{Inputs}(t_1) = \text{Inputs}(t_2) \implies \text{MatchScore}(t_1) = \text{MatchScore}(t_2)$$
- **Enforcement**:
  Engine 02 implements a pure, deterministic mathematical formula combining Jaccard similarity index and normalized linear weights, with zero stochastic temperature or random fluctuations.
- **Failure Behavior**: Algorithmic unit tests verify $100\%$ reproducibility across 1,000 deterministic test cases.

---

### INV-09: Bounded Client Review Timeout Watchdog Invariant
- **Requirement**: FR-02, Decision D-02
- **Owning Engine**: Engine 01 (OS Engine)
- **Statement**: A milestone in `UNDER_REVIEW` state that has not been approved or disputed within 7 calendar days ($T_{\text{submit}} + 7\text{ days}$) must trigger the watchdog escalation timer, enabling auto-approval or dispute escalation.
- **Formal Predicate**:
  $$\forall m \in \text{Milestones}, \quad (\text{CurrentState}(m) = \text{UNDER\_REVIEW} \land \text{Now}() \ge \text{reviewDeadline}(m)) \implies \text{CanEscalateTimeout}(m) = \text{true}$$
- **Enforcement**:
  Engine 01 Watchdog service polls/checks milestone timestamps: `deadline = submittedAt + 7 * 86400 * 1000`. If current time exceeds deadline, state scheduler transitions milestone to `REVIEW_TIMEOUT` and triggers auto-release or dispute notification.
- **Failure Behavior**: Watchdog service logs timeout event, notifies Client and Freelancer, and prepares milestone for auto-release.
