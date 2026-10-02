# ADR-002: Modular Monolithic Architecture with Four Academic Engines

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Vaibhav Chavanpatil, Purvi Sammatshetti, Darshan Kittur, Vaishnavi Modekar)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
The project requires an architectural style that cleanly decomposes the system into four ownable academic subject areas (Operating Systems, DSA & Software Engineering, DBMS, Web Technologies) while maintaining local deployability on standard Ubuntu lab hardware and strict ACID transactional guarantees for escrow financial transfers.

A dilemma exists between deploying independent microservices (e.g. Docker containers communicating via HTTP/gRPC) versus a modular monolithic architecture running within a unified Next.js/Node.js runtime.

---

## 2. Decision Outcome
> **Chosen Option**: Modular Monolithic Architecture with Four Explicit In-Process Academic Engines.
> **Rationale**: A modular monolith provides rigid module boundaries and individual student ownership without distributed systems overhead (network latency, distributed transaction coordinators, network failures, complex container orchestration).

---

## 3. Considered Options
1. **Modular Monolith (Chosen)**:
   - *Pros*: Zero network latency between engines; single unified process; atomic SQLite transactions (`prisma.$transaction`) across engine boundaries; simple single-command local execution (`npm run dev`).
   - *Cons*: Requires strict static code boundaries to prevent circular dependencies or layer leakage.
2. **Microservices (4 Independent Services)**:
   - *Pros*: Physical separation of codebases; independent runtime processes.
   - *Cons*: Requires distributed 2-Phase Commit (2PC) or Saga orchestrator for escrow transfers; high memory footprint on lab machines; excessive complexity for academic evaluation.
3. **Traditional Layered Monolith (No Engine Boundaries)**:
   - *Pros*: Familiar standard web architecture.
   - *Cons*: Fails academic requirements because code is organized by technical layers (controllers, models, views) rather than the four required academic subject engines.

---

## 4. Consequences
- **Positive Consequences**:
  - Direct individual accountability: each student owns a specific directory in `src/core/` matching their assigned subject.
  - Full ACID transaction atomicity preserved within SQLite WAL mode.
  - Fast, reliable automated verification via `./scripts/verify`.
- **Negative Consequences / Trade-offs**:
  - Architectural linting rules are needed to ensure Engine 04 does not import Engine 03 database models directly.

---

## 5. Implementation & Migration Plan
1. Structure code into `src/core/engine-01-os`, `src/core/engine-02-dsa-se`, `src/core/engine-03-dbms`, and `src/core/engine-04-web`.
2. Define explicit TypeScript interfaces and DTOs in `src/types/` for all inter-engine communication.
3. Enforce acyclic dependency topology verified in `docs/architecture/dependency-map.md`.

---

## 6. Links & References
- System Architecture: `docs/architecture/architecture.md`
- Dependency Map: `docs/architecture/dependency-map.md`
- Engine Defense: `docs/requirements/engine-defense/`
