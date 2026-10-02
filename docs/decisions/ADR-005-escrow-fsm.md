# ADR-005: Authoritative Escrow Finite State Machine (FSM)

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Vaishnavi Modekar — Engine 01 Lead)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
The escrow lifecycle governs critical financial custody transitions: depositing funds, beginning work, submitting deliverables, client review, dispute arbitration, and releasing or refunding funds. Allowing decentralized or ad-hoc status updates in route handlers or client UI components leads to invalid state jumps (e.g. releasing funds before deliverable approval) and race conditions (e.g. concurrent release and dispute).

---

## 2. Decision Outcome
> **Chosen Option**: A single authoritative Finite State Machine implementation in Engine 01 (`core/engine-01-os/escrow-fsm.ts`) governing all escrow and milestone transitions.
> **Rationale**: Centralizing transition rules into a mathematical FSM guarantees that no component can execute an illegal state jump. All mutations pass through `validateTransition()` and are protected by `KeyedMutex` critical sections.

---

## 3. Considered Options
1. **Authoritative Engine 01 FSM with Guarded Transitions (Chosen)**:
   - *Pros*: Strict formal state space; single point of validation; explicit error codes; built-in review watchdog timer ($T \ge 7\text{ days}$).
   - *Cons*: Every state-changing route must route through Engine 01.
2. **Distributed Ad-Hoc Validation in Route Handlers**:
   - *Pros*: Developers write quick `if/else` checks in API handlers.
   - *Cons*: Inconsistent rules; easy to miss edge cases; state machine logic leaks across the entire codebase.

---

## 4. Key Rules Enforced
- **Finite States**: `AWAITING_DEPOSIT`, `FUNDED`, `IN_PROGRESS`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `RELEASED`, `REFUNDED`, `DISPUTED`.
- **Terminal States**: `RELEASED` and `REFUNDED` are absorbing; zero outgoing transitions permitted.
- **Review Timeout**: Default 7 calendar days before watchdog triggers auto-approval (ratified in Decision D-02).
- **Concurrency Guard**: `KeyedMutex` locks operations per `milestoneId` to eliminate TOCTOU race conditions.

---

## 5. Consequences
- **Positive Consequences**:
  - Complete elimination of illegal state jumps.
  - Transparent academic demonstration of OS process scheduling principles.
- **Negative Consequences / Trade-offs**:
  - State additions require updating the transition matrix and test suites.

---

## 6. Links & References
- FSM Specification: `docs/architecture/escrow-fsm.md`
- OS Concurrency: `docs/architecture/os-concurrency.md`
- Team Decisions: `docs/requirements/gate-1-team-decisions.md` (Decision D-02)
