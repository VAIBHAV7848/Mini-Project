# ADR-006: Standardized RESTful JSON API Contract and Zod Schema Validation

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Vaibhav Chavanpatil & Purvi Sammatshetti)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
The platform interfaces between client web dashboards and core domain engines via HTTP endpoints. Inconsistent route naming, unstructured request bodies, heterogeneous error formats, and lack of runtime payload validation lead to silent bugs, security vulnerabilities (mass assignment, SQL injection), and integration friction between frontend and backend developers.

---

## 2. Decision Outcome
> **Chosen Option**: Standardized RESTful API with Zod 4 runtime schema validation and uniform JSON response envelopes.
> **Rationale**: Zod 4 provides compile-time TypeScript type inference alongside runtime input validation and sanitization. The Core Contract Action Protocol (`POST /api/contracts`) provides a unified, auditable command interface for state transitions.

---

## 3. Considered Options
1. **RESTful JSON with Zod 4 Boundary Validation (Chosen)**:
   - *Pros*: Strict payload allowlisting; automatic type inference; standardized `{ success, data, meta }` and `{ success, error, meta }` envelopes; OpenAPI 3.1 compatible.
   - *Cons*: Must define Zod schemas for every endpoint.
2. **GraphQL API**:
   - *Pros*: Flexible client queries.
   - *Cons*: Heavier runtime; complex authorization at field level; unnecessary complexity for standard academic evaluation.
3. **Unvalidated JSON Route Handlers**:
   - *Pros*: Minimal initial setup.
   - *Cons*: Fails security standards; highly vulnerable to invalid inputs and malformed payloads.

---

## 4. Key Rules Enforced
- **Boundary Validation**: 100% of request bodies parsed via `schema.safeParse()`; unvalidated fields stripped or rejected with HTTP 400.
- **Idempotency**: State-changing endpoints support `Idempotency-Key` header to prevent double submissions.
- **Contract Actions**: Core lifecycle mutations route through `POST /api/contracts` with action discriminators (`DEPOSIT`, `SUBMIT_DELIVERABLE`, `APPROVE_MILESTONE`, `RELEASE_ESCROW`, `RAISE_DISPUTE`).

---

## 5. Consequences
- **Positive Consequences**:
  - Consistent developer experience across all four student engines.
  - Machine-readable OpenAPI 3.1 specification maintained in `docs/api/openapi.yaml`.
- **Negative Consequences / Trade-offs**:
  - Slight boilerplate overhead when creating new routes.

---

## 6. Links & References
- API Design: `docs/api/api-design.md`
- OpenAPI Contract: `docs/api/openapi.yaml`
