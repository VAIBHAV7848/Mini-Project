# ADR-001: Technology Stack Baseline

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Vaibhav Chavanpatil, Purvi Sammatshetti, Darshan Kittur, Vaishnavi Modekar)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
The project "Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow" requires a full-stack, modular, and testable technology stack that aligns with the curriculum's four foundational course areas:
1. Operating Systems (Escrow & State Scheduler FSM)
2. Data Structures & Algorithms and Software Engineering (Cryptographic deliverable checksums, evidence trees, RTM)
3. Database Management Systems (Relational BCNF schema, ACID milestone transactions, audit logging)
4. Web Technologies (Multi-role responsive dashboard, RBAC, REST APIs)

The chosen stack must be 100% open-source, runnable on local Linux development machines with zero budget, and support rigorous verification.

---

## 2. Decision Outcome
As established in the authoritative team source materials (`Team07_Escrow_Mini_Project_KLE_Theme.pptx` Slide 16 and `Mini_Project_Gate_0_details_FILLED.docx` Step 6), the baseline technology stack is:

- **Presentation Layer**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Lucide Icons
- **Application & API Layer**: Next.js Server Route Handlers, TypeScript 5, Zod 4 Schema Validation
- **Domain Engines**: Escrow FSM state validator (`escrow-engine.ts`), AI Matcher (`ai-matcher.ts`)
- **Security & Integrity**: Node.js Crypto (`crypto.createHash('sha256')`), Role-Based Access Control (RBAC) middleware
- **Persistence Layer**: Prisma 5.22 ORM, SQLite relational database, ACID transactions
- **Inter-Engine Communications**: Asynchronous RESTful JSON APIs, parameterized queries, structured envelopes

---

## 3. Considered Options
1. **Next.js 16 + React 19 + TypeScript + Prisma + SQLite (Chosen)**:
   - *Pros*: Unified full-stack TypeScript environment, type-safe API route handlers, declarative Prisma schema with zero-downtime migrations, lightweight local SQLite engine with full ACID compliance, seamless component-driven UI for multi-role dashboards.
   - *Cons*: Bleeding-edge Next.js 16 / React 19 conventions require strict adherence to Server vs. Client component boundaries.
2. **Python (FastAPI / Django) + React SPA + PostgreSQL**:
   - *Pros*: Strong standard libraries, mature ecosystem.
   - *Cons*: Splits stack into dual-language maintenance (Python backend + JS frontend), requires running separate PostgreSQL daemon, heavier resource footprint.
3. **MERN Stack (MongoDB, Express, React, Node.js)**:
   - *Pros*: Widely familiar.
   - *Cons*: Document database lacks native relational ACID transaction integrity and BCNF normalization required for DBMS Engine academic objectives.

---

## 4. Consequences
- **Positive**:
  - Direct alignment with Team 07's official presentation and Gate 0 documentation.
  - End-to-end type safety between database models, API envelopes, and frontend state.
  - SQLite eliminates external database server setup overhead for local academic evaluation.
  - Prisma ORM abstraction allows future migration to PostgreSQL if required without changing business logic.
- **Negative / Constraints**:
  - SQLite concurrency is limited for heavy write loads (fully acceptable for academic demonstration and bounded prototype scope).

---

## 5. Implementation Plan
- **Phase 1 (Current)**: Formalize requirements baseline and engine decomposition for Gate 1 review.
- **Phase 2 (Post-Gate 1)**: Finalize shared architecture specifications (`docs/architecture/architecture.md`, `docs/database/schema.md`, `docs/api/api-design.md`).
- **Phase 3 (Post-Gate 2)**: Scaffold Next.js 16 / Prisma project files and execute TDD verification.

---

## 6. Links & References
- Official Source Documents:
  - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slide 16)
  - `docs/source-material/Mini_Project_Gate_0_details_FILLED.docx` (Step 6)
- Requirements Traceability:
  - `docs/requirements/functional-requirements.md`
  - `docs/requirements/team-project-overview.md`
