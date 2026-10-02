# Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow

> **Academic Context**: KLE Technological University (Dr. M. S. Sheshgiri College of Engineering and Technology, Belagavi)
> **Department**: Department of Computer Science and Engineering
> **Team**: Team 07 (Theme 01)
> **Repository**: [VAIBHAV7848/mini-project](https://github.com/VAIBHAV7848/mini-project)

---

## 1. Project Overview

Freelance software development and gig marketplaces frequently suffer from two symmetrical trust failure modes:
1. **Client Default**: Freelancers invest time and technical effort with no guarantee of timely payment or fair review.
2. **Deliverable Non-Performance**: Clients deposit funds upfront with no verifiable proof of code quality, adherence to requirements, or deliverable authenticity.

Traditional gig platforms rely on centralized, opaque dispute mechanisms that judge work subjectively without cryptographic verification.

This platform resolves this dilemma through a **Milestone-Based Escrow and Evidence-Based Dispute Resolution Workflow**:
- **Milestone-Based Escrow**: Contracts are partitioned into sequential, funded milestones. Client deposits are locked in a simulated double-entry ledger before work begins. Funds are released atomically per milestone only upon explicit client approval or upon expiration of an automated 7-calendar-day review window (`REVIEW_TIMEOUT`), preventing developer payment starvation.
- **Evidence-Based Dispute Resolution**: When deliverables are contested, both parties submit cryptographic evidence (SHA-256 deliverable checksums, technical specifications, and communication logs). An in-memory Merkle Evidence Tree links all artifacts, enabling independent human dispute reviewers to inspect tamper-evident proof and issue binding rulings (full release, refund, or split settlement).
- **Deterministic AI Semantic Matching**: Freelancer proposals are ranked against client project requirements using a multi-attribute heuristic algorithm evaluating skill tag overlap (Jaccard similarity, 50% weight), budget alignment (30% weight), and developer reputation scores (20% weight).

---

## 2. Key Features

- **Role-Based Access Control (RBAC)**: Dedicated server-enforced interfaces for Clients, Freelancers, Dispute Reviewers, and Administrators.
- **Project & Service Marketplace**: Clients post custom projects with skill tags; freelancers publish tiered service gigs (`Basic`, `Standard`, `Premium`).
- **Proposal Bidding & Heuristic Matching**: Objective proposal ranking powered by deterministic semantic multi-attribute scoring.
- **Milestone Sequencing & Contract Lifecycle**: Phased milestone execution enforcing strict sequential dependencies (milestone $K+1$ cannot start until prior milestones resolve).
- **Simulated ACID Escrow Ledger**: Double-entry accounting enforcing mathematical balance conservation: $\Delta\text{Escrow} + \Delta\text{User} = 0$.
- **Automated Watchdog Review Timeout**: Automated 7-calendar-day review window scheduler transitioning overdue reviews to `REVIEW_TIMEOUT` and triggering escrow release.
- **Cryptographic SHA-256 Deliverable Checksumming**: Streaming digest computation for all submitted deliverable artifacts.
- **Hierarchical Merkle Evidence Trees**: In-memory N-ary tree data structure enabling $O(V+E)$ traversal and immediate single-bit tampering detection.
- **Human Reviewer Arbitration**: Independent dispute resolution workflow supporting binding split rulings with duplicate ruling prevention.
- **Tamper-Resistant Chained Audit Logging**: Append-only audit trail where every state change and financial transfer is cryptographically linked: $\text{Hash}_n = \text{SHA256}(\text{Hash}_{n-1} + \text{Event Data})$.
- **Real-Time State Synchronization**: 5-second lightweight polling snapshot returning active contract and milestone states without full-page reloads.

---

## 3. Four Academic Engineering Engines

The architecture partitions system responsibilities across four independently ownable and testable engineering engines:

| Engine | Subject Area | Academic Responsibility | Student Lead |
| :--- | :--- | :--- | :--- |
| **Engine 01 (OS Engine)** | Operating Systems | Escrow FSM transitions, state scheduling, `KeyedMutex` critical sections, and review timeout watchdog mechanics | Vaishnavi Modekar |
| **Engine 02 (DSA & SE Engine)** | Data Structures & Software Engineering | Streaming SHA-256 checksums, Merkle EvidenceTree verification, and deterministic proposal matching | Darshan Kittur |
| **Engine 03 (DBMS Engine)** | Database Management Systems | Relational BCNF schema models, ACID ledger transfers, contract lifecycle orchestration, and chained audit logging | Purvi Sammatshetti |
| **Engine 04 (Web Technologies Engine)** | Web Technologies | Responsive multi-role dashboards, RESTful API route handlers, HMAC session integrity, and server-side RBAC | Vaibhav Chavanpatil |

---

## 4. System Architecture

The platform follows a modular monolithic architecture, enforcing loose coupling between presentation, domain engines, and persistence:

```text
User Interface (Next.js 16 App Router, React 19, Tailwind CSS 4)
      ↓
Web & API Layer (Server Route Handlers, Zod 4 Schemas, Session RBAC)
      ↓
Application & Domain Layer (Contract Action Dispatcher, Lifecycle Coordinators)
      ↓
Four Academic Engineering Engines
├── Engine 01 (OS Engine): Escrow FSM, Watchdog Scheduler, KeyedMutex
├── Engine 02 (DSA & SE Engine): SHA-256 Hasher, EvidenceTree, Semantic Matcher
├── Engine 03 (DBMS Engine): Ledger Coordinator, Contract Manager, Audit Logger
└── Engine 04 (Web Engine): RBAC Enforcer, Session Service, State Poller
      ↓
Persistence Layer (SQLite Database in WAL Journal Mode)
      ↓
Prisma 5.22 ORM (Serialized ACID Transactions, Foreign Key Constraints)
```

Detailed architectural specifications and diagrams:
- [System Architecture Specification](docs/architecture/architecture.md)
- [C4 Context Diagram](docs/architecture/c4-context.md)
- [C4 Container Diagram](docs/architecture/c4-container.md)
- [C4 Component Diagram](docs/architecture/c4-component.md)
- [Engine Boundaries & Module Contracts](docs/architecture/engine-boundaries.md)

---

## 5. Core Operational Workflow

```text
Client posts project / Freelancer lists service gig
        ↓
Freelancer submits proposal with bid amount
        ↓
Deterministic semantic proposal matching (Jaccard + Budget + DevScore)
        ↓
Client accepts proposal & establishes phased contract
        ↓
Client deposits funds into escrow (Contract Status: FUNDED)
        ↓
Freelancer begins milestone work (Sequential dependency enforced)
        ↓
Deliverable submitted with SHA-256 digest & 7-day review timer starts
        ↓
Client Review Window
        ├── Approve → Escrow atomically released → Next milestone auto-activates
        ├── 7-day Timeout → Watchdog transitions to REVIEW_TIMEOUT → Auto-release
        └── Dispute Raised → Milestone marked DISPUTED → Escrow frozen
                ↓
        Dispute Arbitration:
        ├── Counter-evidence uploaded with SHA-256 checksums
        ├── Independent reviewer inspects in-memory Merkle EvidenceTree
        └── Reviewer issues binding ruling (Release / Refund / Split Settlement)
        ↓
Append-only cryptographic SHA-256 chained audit log records every event
```

---

## 6. Technology Stack

| Layer / Component | Technology | Version | Engineering Justification |
| :--- | :--- | :---: | :--- |
| **Framework** | Next.js App Router | 16.3.8 | Modern React server components and Turbopack bundling |
| **UI Library** | React | 19.0.0 | Concurrent rendering, modern hooks, and component modularity |
| **Language** | TypeScript | 5.7.0 | Strict static type checking across API contracts and engines |
| **Styling** | Tailwind CSS | 4.0.0 | High-performance CSS compiler with zero-runtime utility styling |
| **Validation** | Zod | 4.6.5 | Defensive schema parsing on all incoming API request payloads |
| **Persistence** | Prisma ORM | 5.22.0 | Type-safe query building and automated relational migrations |
| **Database** | SQLite | 3 | Embedded relational storage configured in WAL mode |
| **Security & Hashes** | Node.js Crypto | Built-in | SHA-256 deliverable hashing and HMAC session signatures |
| **Test Runner** | Vitest | 3.2.7 | Fast TypeScript-native test runner with serialized DB support |
| **Icons** | Lucide React | 1.50.0 | Accessible vector iconography |

---

## 7. Security Architecture

- **Server-Side RBAC Enforcement**: Role permissions (`CLIENT`, `FREELANCER`, `REVIEWER`, `ADMIN`) are strictly enforced within server-side API route handlers via `RbacEnforcer`. Frontend tabs are visual routing conveniences; direct unauthorized requests return HTTP 401/403.
- **Session Token Integrity**: Session tokens utilize HMAC-SHA256 signatures verified with timing-safe comparisons (`SessionService`), preventing signature tampering and replay attacks.
- **Defensive Input Validation**: All API route inputs are validated against strict Zod 4 schemas prior to database operations. Malformed payloads return standardized HTTP 400 envelopes.
- **Cross-Tenant IDOR Mitigation**: Contract, milestone, and deliverable operations enforce tenant ownership checks against database foreign keys before executing mutations.
- **Cryptographic Evidence Checksums**: Deliverable code files and dispute evidence items are hashed using streaming SHA-256. Any modification to an uploaded artifact invalidates the Merkle root hash.
- **Append-Only Chained Audit Trail**: Every financial movement and FSM state transition creates an audit log entry cryptographically linked to the previous entry, providing verifiable historical immutability.

Detailed security documentation:
- [Security Policy](SECURITY.md)
- [Security Architecture Model](docs/security/security-model.md)

---

## 8. Testing & Verification

The platform enforces a test-driven verification pipeline where every requirement is validated with automated tests:

```text
================================================================================
VERIFICATION SUMMARY
================================================================================
  - Total Automated Tests:      75 / 75 PASSING (100% Pass Rate)
  - Total Test Suites:          14 Test Files
  - TypeScript Compiler:        0 Errors (npx tsc --noEmit: Clean)
  - Next.js Production Build:   Compiled Successfully via Turbopack
  - Verification Pipeline:      100% Passing (./scripts/verify)
================================================================================
```

### Test Suite Execution
```bash
# Execute the full automated test suite (75 tests across 14 suites)
npm test

# Verify static TypeScript type safety
npx tsc --noEmit

# Compile production build
npm run build

# Run repository verification pipeline (linting, whitespace, security scan)
./scripts/verify
```

---

## 9. Performance & Benchmarking

Empirical benchmarks executed against the production SQLite WAL database engine and Next.js route handlers are recorded in [Performance Results](docs/development/performance-results.md):

### NFR-01: API Latency under Concurrency (50 Concurrent Workers, 500 Requests)
| Route | Concurrency | Throughput | $P_{50}$ (ms) | $P_{95}$ (ms) | Target KPI | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `GET /api/projects` | 50 | 674.7 req/s | 48.96 | **74.07** | $\le 500.0\text{ ms}$ | **PASS** |
| `GET /api/gigs` | 50 | 7,455.3 req/s | 5.03 | **7.17** | $\le 500.0\text{ ms}$ | **PASS** |
| `GET /api/contracts` *(Auth)* | 50 | 5,247.0 req/s | 6.70 | **9.84** | $\le 500.0\text{ ms}$ | **PASS** |

### NFR-09: 100,000 Audit Log Retrieval Latency
| Query Pattern | Index Used | $P_{50}$ (ms) | $P_{95}$ (ms) | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Indexed Entity Lookup** | `@@index([entityName, entityId])` | 2.29 | **3.42** | **PASS** |
| **Timestamp Range Query** | `@@index([timestamp(sort: Desc)])` | 1.07 | **2.40** | **PASS** |
| **Paginated System Scan** | `@@index([timestamp(sort: Desc)])` | 0.59 | **0.78** | **PASS** |

### NFR-10: Real-Time State Synchronization
| Metric | Measured Value | Target Threshold | Status |
| :--- | :--- | :--- | :---: |
| **Snapshot Payload Size** | 1,343 bytes (1.31 KB) | $\le 5,120\text{ bytes}$ (5.0 KB) | **PASS** |
| **DB Snapshot Query ($P_{95}$)** | 1.70 ms | $\le 15.0\text{ ms}$ | **PASS** |
| **API Polling Route ($P_{95}$)** | 1.82 ms | $\le 100.0\text{ ms}$ | **PASS** |
| **Total 5s Polling Sync ($P_{95}$)** | 5,001.82 ms (5.002 s) | $\le 5,500.0\text{ ms}$ (5.5 s) | **PASS** |

---

## 10. Requirements Traceability

The repository maintains strict end-to-end traceability connecting specifications directly to source code and tests:

$$\text{Requirement} \to \text{Use Case} \to \text{Acceptance Criteria} \to \text{Engine} \to \text{Source Code} \to \text{Tests} \to \text{Status}$$

- [Requirements Specification](docs/requirements/requirements.md)
- [Requirements Traceability Matrix (RTM)](docs/development/implementation-traceability.md)
- [Implementation Audit Report](docs/development/implementation-audit.md)

---

## 11. Project Scope & Boundaries

### In-Scope Capabilities
- Role-based user authentication and session authorization
- Project posting, proposal bidding, and heuristic AI matching
- Phased milestone management with sequential dependency ordering
- Simulated double-entry escrow ledger transfers (deposit, release, refund, split)
- SHA-256 cryptographic deliverable verification
- In-memory Merkle EvidenceTree dispute representation
- Independent human reviewer dispute arbitration
- Append-only hash-chained audit logging

### Explicit Scope Boundaries
- **Real Payment Gateways**: Excluded. Currency is purely simulated within the SQLite ledger to eliminate external financial risk.
- **Autonomous AI Arbitration**: Excluded. AI is restricted to proposal ranking; dispute arbitration requires human reviewer evaluation.
- **Native Mobile Applications**: Excluded. Responsive web interface optimized across mobile and desktop viewports.
- **Legal Court Contracts**: Excluded. The system enforces programmatic protocol invariants, not formal court contracts.
- **Unlimited Video Hosting**: Excluded. Large media files are represented by cryptographic hash digests.
- **Corporate Taxation / Accounting Systems**: Excluded from academic scope.

---

## 12. Current Project Status

As recorded in [Project Status & Durable Memory](docs/development/project-status.md):

```text
Gate 0: COMPLETED
Gate 1: APPROVED
Stage S1 (Requirements Baseline): COMPLETE / FROZEN
Stage S2 (Shared Architecture): COMPLETE / APPROVED
Stage S3 (Implementation & Verification): COMPLETE
Gate 2: READY FOR EVALUATION
```

---

## 13. Local Setup & Execution

### Prerequisites
- Node.js (v20.x or v22.x LTS)
- npm (v10.x+)
- Git (v2.40+)

### Quickstart Instructions
```bash
# 1. Clone the repository
git clone https://github.com/VAIBHAV7848/mini-project.git
cd mini-project

# 2. Install dependencies
npm install

# 3. Initialize and seed SQLite database
npx prisma db push
npm run prisma:seed

# 4. Start local development server
npm run dev

# 5. Run the automated test suite
npm test
```

Open `http://localhost:3000` in your browser to access the dashboard.

---

## 14. Repository Structure

```text
mini-project/
├── src/
│   ├── app/                      # Next.js App Router pages and REST API handlers
│   │   ├── api/                  # API endpoints (projects, contracts, disputes, gigs, orders)
│   │   └── page.tsx              # Multi-role responsive workflow dashboard
│   ├── core/                     # Four academic engineering engines
│   │   ├── engine-01-os/         # Escrow FSM, Watchdog scheduler, KeyedMutex
│   │   ├── engine-02-dsa-se/     # SHA-256 Hasher, Merkle EvidenceTree, AI Matcher
│   │   ├── engine-03-dbms/       # Ledger coordinator, Contract manager, Audit logger
│   │   └── engine-04-web/        # RBAC enforcer, Session service, State poller
│   ├── lib/                      # Database client (Prisma), validation schemas (Zod), errors, logger
│   └── types/                    # Domain TypeScript interfaces and state types
├── tests/                        # Vitest automated test suites (75 tests, 14 files)
│   ├── engine-01-os/             # FSM, watchdog, and contract lifecycle tests
│   ├── engine-02-dsa-se/         # Hasher, Merkle tree, and adversarial DSA tests
│   ├── engine-03-dbms/           # Ledger, transaction concurrency, and dispute workflow tests
│   ├── engine-04-web/            # RBAC, adversarial API, and marketplace gigs tests
│   └── integration/              # Vertical slice, smoke, and end-to-end user journey tests
├── docs/                         # Authoritative project documentation
│   ├── architecture/             # Architecture specifications, C4 diagrams, ADRs
│   ├── requirements/             # Functional/non-functional requirements and viva materials
│   ├── api/                      # REST API contracts and OpenAPI specification
│   ├── database/                 # Schema designs, ER models, and indexing strategies
│   ├── security/                 # Security model and threat analysis
│   └── development/              # Traceability, audit reports, benchmarks, readiness
├── prisma/                       # Database schema and seed data
└── scripts/                      # Verification, linting, and benchmark tools
```

---

## 15. Documentation Index

- **Architecture**:
  - [System Architecture](docs/architecture/architecture.md)
  - [C4 Component Diagram](docs/architecture/c4-component.md)
  - [Engine Boundaries](docs/architecture/engine-boundaries.md)
  - [Technology Stack Baseline (ADR-001)](docs/decisions/ADR-001-technology-stack-baseline.md)
- **Requirements**:
  - [System Requirements Specification](docs/requirements/requirements.md)
  - [Functional Requirements](docs/requirements/functional-requirements.md)
  - [Non-Functional Requirements](docs/requirements/non-functional-requirements.md)
  - [Use Cases](docs/requirements/use-cases.md)
- **API & Database**:
  - [REST API Specification](docs/api/api-design.md)
  - [Database Schema Specification](docs/database/schema.md)
  - [Transaction Design](docs/database/transaction-design.md)
- **Security & Quality**:
  - [Security Model](docs/security/security-model.md)
  - [Security Policy](SECURITY.md)
  - [Testing Strategy](docs/development/testing-strategy.md)
- **Status & Readiness**:
  - [Project Status & Durable Memory](docs/development/project-status.md)
  - [Gate 2 Academic Readiness Assessment](docs/development/gate-2-readiness.md)
  - [Empirical Performance Results](docs/development/performance-results.md)
  - [Requirements Traceability Matrix](docs/development/implementation-traceability.md)
  - [Implementation Audit Report](docs/development/implementation-audit.md)
- **Guidelines & Source Materials**:
  - [Contribution Guidelines](CONTRIBUTING.md)
  - [Source Materials Directory](docs/source-material/)

---

## 16. Academic Context

This project demonstrates practical software engineering synthesis across five core academic subjects in Computer Science:
- **Operating Systems**: Finite State Machine synchronization, mutual exclusion via keyed critical sections, and asynchronous review timeout scheduling.
- **Data Structures & Algorithms**: Hierarchical N-ary Merkle trees for tamper-evident evidence indexing and multi-attribute heuristic similarity matching.
- **Software Engineering**: Modular monolithic decomposition, test-driven development, continuous verification gates, and bidirectional requirements traceability.
- **Database Management Systems**: Relational BCNF schema design, serialized ACID escrow transfers, balance conservation invariants, and append-only cryptographic audit logging.
- **Web Technologies**: Server-side role-based access control, cryptographic HMAC session token validation, Next.js 16 App Router architecture, and responsive multi-role dashboards.

---

## 17. Contributors

**Team 07 (Theme 01) — KLE Technological University**:
- **Vaibhav Chavanpatil** (Roll No: 04, SRN: 02FE24BCS013) — Lead Engineer & Owner, Engine 04 (Web Technologies)
- **Purvi Sammatshetti** (Roll No: 11, SRN: 02FE24BCS022) — Owner, Engine 03 (DBMS)
- **Darshan Kittur** (Roll No: 18, SRN: 02FE24BCS053) — Owner, Engine 02 (DSA & SE)
- **Vaishnavi Modekar** (Roll No: 21, SRN: 02FE24BCS060) — Owner, Engine 01 (Operating Systems)

---

## 18. License

This project is licensed under the [MIT License](LICENSE).
