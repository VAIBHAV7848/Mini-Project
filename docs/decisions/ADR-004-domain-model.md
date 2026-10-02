# ADR-004: Domain Model Separation across Four Representation Layers

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Vaibhav Chavanpatil, Purvi Sammatshetti, Darshan Kittur, Vaishnavi Modekar)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
In full-stack TypeScript frameworks like Next.js with Prisma ORM, developers frequently expose raw ORM models directly to API endpoints and client React components. This anti-pattern introduces severe security vulnerabilities (e.g. leaking `password_hash`, internal concurrency locks, or raw audit fields) and tight coupling where database schema refactors immediately break frontend components.

---

## 2. Decision Outcome
> **Chosen Option**: Enforce explicit four-tier model separation: Domain Entities, Database Models, API DTOs, and UI ViewModels.
> **Rationale**: Domain logic remains pure and independent of database schemas; API payloads are explicitly controlled and scrubbed; UI components receive pre-formatted, localized view models.

---

## 3. Considered Options
1. **Four-Layer Separation (Chosen)**:
   - *Pros*: Complete security sanitization; independent evolution of database schema and public API; testable pure domain logic.
   - *Cons*: Requires mapping functions between layers.
2. **Exposing Prisma Models Directly**:
   - *Pros*: Less boilerplate code initially.
   - *Cons*: Security hazard (unfiltered fields sent to client); breaking changes cascade across the entire system on every Prisma migration.

---

## 4. Consequences
- **Positive Consequences**:
  - Sensitive fields (`password_hash`, internal mutex tokens) can never be accidentally serialized to the browser.
  - Domain invariants (e.g. balance non-negativity, FSM legality) are enforced by pure domain classes rather than database triggers alone.
- **Negative Consequences / Trade-offs**:
  - Developers must maintain mapper functions (`toDTO()`, `toViewModel()`).

---

## 5. Implementation & Migration Plan
1. Core domain entities defined in `src/core/*/domain/`.
2. Database models defined in Prisma schema.
3. API DTOs validated via Zod schemas in `lib/validation/`.
4. UI ViewModels consumed inside Next.js components.

---

## 6. Links & References
- Domain Model: `docs/architecture/domain-model.md`
- Invariants: `docs/architecture/domain-invariants.md`
