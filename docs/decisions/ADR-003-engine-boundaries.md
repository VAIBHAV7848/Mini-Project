# ADR-003: Strict Four-Engine Separation and Public Contract Governance

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Vaibhav Chavanpatil, Purvi Sammatshetti, Darshan Kittur, Vaishnavi Modekar)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
University evaluation guidelines mandate individual student ownership of distinct project components. In collaborative software development, there is a constant risk of boundary blurring where one student's module directly queries another module's database tables or duplicates business rules, resulting in ambiguous academic defense accountability.

Clear, enforceable engineering boundaries and explicit public contracts must be established for each of the four engines.

---

## 2. Decision Outcome
> **Chosen Option**: Enforce strict module encapsulation and public contract governance governed by an Acyclic Directed Graph (DAG).
> **Rationale**: Each engine exposes only a typed public interface (`IEscrowEngine`, `IEvidenceAndMatcherEngine`, `IDbmsLedgerEngine`, `IWebEngine`). Internal implementation files are private to the engine directory. Cross-engine access must occur exclusively via typed public methods.

---

## 3. Considered Options
1. **Strict Engine Interfaces via TypeScript Contracts (Chosen)**:
   - *Pros*: Isolates internal engine refactoring; clarifies Viva defense ownership; enables independent mock unit testing.
   - *Cons*: Requires maintaining explicit DTOs across engine boundaries.
2. **Direct Cross-Engine Class Invocation**:
   - *Pros*: Faster initial prototyping.
   - *Cons*: Violates encapsulation; leaks database models into web components; makes independent engine grading difficult.

---

## 4. Ownership Allocation (Ratified in Gate 1)
- **Engine 01 (OS)**: Vaishnavi Modekar — FR-01, FR-02, FR-12.
- **Engine 02 (DSA & SE)**: Darshan Kittur — FR-03, FR-04, FR-11 (Primary Algorithmic Owner).
- **Engine 03 (DBMS)**: Purvi Sammatshetti — FR-05, FR-06, FR-11 (Supporting Persistence Dependency).
- **Engine 04 (Web)**: Vaibhav Chavanpatil — FR-07, FR-08, FR-09, FR-10.

---

## 5. Consequences
- **Positive Consequences**:
  - Zero circular dependencies ($E_4 \to E_1 \to E_2 \to E_3$).
  - Every team member can write unit tests for their engine without running the other three engines.
- **Negative Consequences / Trade-offs**:
  - DTO mapping code required at boundary crossings.

---

## 6. Links & References
- Engine Boundaries: `docs/architecture/engine-boundaries.md`
- Dependency Map: `docs/architecture/dependency-map.md`
- Team Decisions: `docs/requirements/gate-1-team-decisions.md` (Decision D-01)
