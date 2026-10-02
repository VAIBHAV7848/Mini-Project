# Engineering Constitution & Agent Guidelines (`AGENTS.md`)

## 1. Project Identity
- **Project Title**: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow
- **Academic Context**: KLE Technological University (Dr. M. S. Sheshgiri College of Engineering and Technology, Belagavi) — Department of Computer Science and Engineering
- **Team**: Team 07 (Theme 01)
  - Vaibhav Chavanpatil (Roll No: 4, SRN: 02FE24BCS013)
  - Purvi Sammatshetti (Roll No: 11, SRN: 02FE24BCS022)
  - Darshan Kittur (Roll No: 18, SRN: 02FE24BCS053)
  - Vaishnavi Modekar (Roll No: 21, SRN: 02FE24BCS060)
- **Root Directory**: `/home/nethunter/Collage/BIG_PROJECT`

---

## 2. Source-of-Truth Hierarchy
All AI agents and contributors must strictly adhere to the following 5-tier authority hierarchy:

```text
1. Official Team Project Documents (docs/source-material/)
   ↓
2. Explicit Decisions Approved by the Team
   ↓
3. Project Architecture / ADR Documentation (docs/decisions/, docs/architecture/)
   ↓
4. Implementation Details (src/, tests/)
   ↓
5. AI-Generated Suggestions
```

### Critical Non-Override Rule
> **AI suggestions must NOT silently override documented project requirements.**
> When a conflict or ambiguity is discovered between an AI recommendation and an official team document, the AI must document the conflict explicitly rather than silently choosing a preference.

---

## 3. Four-Engine Architecture & Ownership
The system is partitioned into four independently ownable and testable engineering engines:

1. **Engine 01 (OS Engine) — Escrow & State Scheduler**
   - *Owner*: Vaishnavi Modekar
   - *Scope*: FSM transitions (`AWAITING_DEPOSIT` → `FUNDED` → `IN_PROGRESS` → `UNDER_REVIEW` → `RELEASED`), atomic fund locking, review timeout mechanics, race condition prevention.
2. **Engine 02 (DSA & SE Engine) — Evidence & Quality Assurance Engine**
   - *Owner*: Darshan Kittur
   - *Scope*: Cryptographic SHA-256 deliverable checksums, tamper-evident evidence tree indexing, requirements traceability matrix (RTM), V&V pipelines.
3. **Engine 03 (DBMS Engine) — Transaction Ledger & Contract Manager**
   - *Owner*: Purvi Sammatshetti
   - *Scope*: Relational BCNF models, ACID payment transfers, append-only tamper-resistant audit logging.
4. **Engine 04 (Web Technologies Engine) — Role-Based Workflow Dashboard**
   - *Owner*: Vaibhav Chavanpatil
   - *Scope*: Multi-role responsive dashboard (Client, Freelancer, Dispute Reviewer, Admin), RBAC enforcement, dispute submission forms, real-time milestone visualization.

---

## 4. Technology Stack & Boundaries
Documented by Team 07:
- **Presentation**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Lucide Icons
- **Application**: Next.js Route Handlers, TypeScript 5, Zod 4 Validation
- **Domain Engine**: Escrow FSM validator (`escrow-engine.ts`), AI Matcher (`ai-matcher.ts`)
- **Security & Checksums**: Node.js Crypto (SHA-256 deliverable hashing), RBAC session validation
- **Persistence**: Prisma 5.22 ORM, SQLite relational database, ACID transactions

### Explicit Scope Boundaries
- **In-Scope**: User RBAC, project posting, proposals/bidding, milestone tracking, deliverable SHA-256 evidence submissions, simulated escrow lock/release/refund, human dispute arbitration.
- **Out-of-Scope**: Real banking/payment gateways (Stripe/PayPal - purely simulated currency), legal court contracts, native mobile apps, autonomous AI arbitration without human review, unlimited video hosting.

---

## 5. Development & Engineering Principles
- **Understand Before Implementing**: Read source documents in `docs/source-material/` first.
- **Small, Atomic Changes**: Make the smallest correct change that solves the issue.
- **Test-Driven Verification**: Every feature or fix must be verified with automated tests.
- **Security by Design**: Defense in depth, strict input validation, zero hardcoded secrets.
- **Living Documentation**: Keep derived docs in sync with official specifications.
- **Evidence-Based Completion**: Terminal proof of passing tests and zero lint errors is mandatory.

---

## 6. Development Workflow
```text
Official Team Documents
    ↓
Understand Requirement
    ↓
Check Architecture Impact
    ↓
Plan
    ↓
Implement (TDD)
    ↓
Test
    ↓
Review & Security
    ↓
Verify Against Original Requirement
```

---

## 7. AI Agent Operating Rules
1. **Inspect Before Modifying**: Read existing code and architecture before touching files.
2. **Follow the Source-of-Truth Hierarchy**: Team documents take precedence over AI defaults.
3. **Respect Engine Boundaries**: Preserve engine decomposition and student ownership boundaries.
4. **Preserve Scope Discipline**: Never introduce out-of-scope features (e.g. real payment gateways).
5. **Report Verification Evidence**: Show exact commands run, exit codes, and output diffs.
6. **Never Claim Success Without Evidence**: Passing tests and clean diffs are required.
7. **Document Important Decisions**: Record non-trivial trade-offs in ADRs or architecture notes.
8. **Preserve Backward Compatibility**: Do not break existing contracts or schemas without deprecation pathways.
