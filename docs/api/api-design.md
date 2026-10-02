# API Architecture & Endpoint Specification

> **Classification**: Authoritative Application Transport Protocol Specification (Stage S2 — Shared Architecture)
> **Engine Ownership**: Next.js Server Route Handlers (Engine 04 & Engine 03)
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slide 16, 17)
> - `docs/requirements/functional-requirements.md` (FR-01 through FR-12)
> - `docs/decisions/ADR-006-api-contract.md`
> - Companion Contract: `docs/api/openapi.yaml`

---

## 1. Protocol Architecture & Conventions

1. **Protocol Standards**: RESTful HTTP API over Next.js Server Route Handlers running on Node.js 22 LTS.
2. **Base URI**: `/api`
3. **Content Negotiation**:
   - Request payloads: `Content-Type: application/json; charset=utf-8` (or `multipart/form-data` for deliverable file uploads).
   - Response payloads: `application/json; charset=utf-8`.
4. **Authentication & Session Tokens**:
   - Authentication via HTTP-only secure cookie containing an encrypted JWT/session token or `Authorization: Bearer <token>` header.
5. **Strict Boundary Validation**:
   - 100% of request bodies, query strings, and path parameters validated via Zod 4 schemas prior to domain execution. Extraneous or unvalidated fields are rejected immediately.
6. **Idempotency Headers**:
   - State-modifying actions support `Idempotency-Key: <UUID>`. Replaying requests with identical idempotency keys returns cached responses without re-executing transactions.

---

## 2. Standard JSON Response Envelopes

Every API route returns a predictable, consistent envelope:

### 2.1 Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-02T22:30:00Z",
    "requestId": "req-98f7e21a"
  }
}
```

### 2.2 Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot release escrow for milestone in SUBMITTED state without approval.",
    "details": [
      {
        "field": "action",
        "issue": "Action RELEASE_ESCROW is forbidden from state SUBMITTED."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-02T22:30:00Z",
    "requestId": "req-98f7e21a"
  }
}
```

---

## 3. Comprehensive RESTful Route Inventory

As documented in Slide 17 of the authoritative team presentation, expanded for all platform capabilities:

| Endpoint | Method | Allowed Roles | Owning Engine | Description & Contract Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | E4 (Web) | Authenticates email & password, sets secure HTTP-only session cookie. |
| `/api/auth/register` | `POST` | Public | E4 (Web) | Registers new user account with role `CLIENT` or `FREELANCER`. |
| `/api/auth/session` | `GET` | Authenticated | E4 (Web) | Returns current authenticated user context and role. |
| `/api/projects` | `GET` | All Roles | E3 / E4 | List open projects with budget and skill tags; supports pagination. |
| `/api/projects` | `POST` | `CLIENT` | E3 / E4 | Creates a new project specification with budget and skill tags. |
| `/api/projects/{id}` | `GET` | All Roles | E3 / E4 | Fetches detailed project specification and public metadata. |
| `/api/proposals` | `POST` | `FREELANCER` | E3 / E2 | Submits proposal bid; triggers Engine 02 AI Matcher (`aiMatchScore`). |
| `/api/proposals` | `GET` | `CLIENT` / `DEV` | E3 / E4 | Lists proposals for a project (Client sees all; Freelancer sees own). |
| `/api/contracts` | `GET` | Authenticated | E1 / E3 | Lists active contracts for current client or freelancer. |
| `/api/contracts` | `POST` | `CLIENT` / `DEV` / `REV` | E1 / E3 | **Core Contract Action Protocol** (`DEPOSIT`, `SUBMIT`, `APPROVE`, `RELEASE`, `DISPUTE`). |
| `/api/contracts/{id}` | `GET` | Party / Admin | E1 / E3 | Fetches contract aggregate with milestones and current escrow status. |
| `/api/contracts/{id}/milestones`| `GET` | Party / Admin | E1 / E4 | **5-Second Polling Hot Path**: Fetches current status of all milestones. |
| `/api/gigs` | `GET` | All Roles | E4 / E3 | Queries marketplace gig services by category with pagination. |
| `/api/gigs` | `POST` | `FREELANCER` | E4 / E3 | Creates tiered service package (Basic, Standard, Premium). |
| `/api/gigs/{id}` | `GET` | All Roles | E4 / E3 | Fetches single gig details with seller profile and completed reviews. |
| `/api/orders` | `GET`, `POST`| `CLIENT` / `DEV` | E1 / E3 | Places and tracks gig orders with deliverable URLs and delivery dates. |
| `/api/developers` | `GET` | All Roles | E4 / E3 | Lists developers with parsed skills, hourly rates, and DevScores. |
| `/api/analyze-github`| `POST` | `FREELANCER` | E2 / E4 | Verifies developer GitHub profile; computes DevScore metrics. |
| `/api/disputes` | `POST` | `CLIENT` / `DEV` | E1 / E4 | Files formal dispute on milestone deliverable or non-responsiveness. |
| `/api/disputes/{id}` | `GET` | Party / Rev | E2 / E4 | Fetches dispute details with in-memory N-ary `EvidenceTree`. |
| `/api/disputes/{id}/ruling` | `POST` | `REVIEWER` | E1 / E3 | Submits binding arbitration ruling (`RELEASE_TO_FREELANCER` or `REFUND_TO_CLIENT`). |
| `/api/audit-logs` | `GET` | `ADMIN` | E3 (DBMS) | Fetches institutional audit trail with chained cryptographic verification hashes. |

---

## 4. Core Contract Action Protocol (`POST /api/contracts`)

State-modifying operations are routed through `POST /api/contracts` using discriminators governed by Engine 01 (OS FSM) and Engine 03 (DBMS):

### 4.1 Action: `DEPOSIT`
- **Actor**: `CLIENT`
- **Precondition**: Contract in `AWAITING_DEPOSIT`; client balance $\ge$ amount.
- **Request Body**:
  ```json
  {
    "action": "DEPOSIT",
    "contractId": "c-44e21a-uuid",
    "amount": 1000.00
  }
  ```
- **Execution Flow**: Engine 01 validates FSM $\to$ Engine 03 executes atomic debit/credit $\to$ Contract status becomes `FUNDED`.

### 4.2 Action: `SUBMIT_DELIVERABLE`
- **Actor**: `FREELANCER`
- **Precondition**: Milestone in `IN_PROGRESS`.
- **Request Body**:
  ```json
  {
    "action": "SUBMIT_DELIVERABLE",
    "contractId": "c-44e21a-uuid",
    "milestoneId": "m-01-uuid",
    "deliverableUrl": "https://storage.local/deliverables/m-01-final.zip",
    "submissionNotes": "Frontend UI complete with 100% test coverage."
  }
  ```
- **Execution Flow**: Engine 02 computes SHA-256 $\to$ Engine 03 saves deliverable row $\to$ Milestone status becomes `SUBMITTED`, contract becomes `UNDER_REVIEW`.

### 4.3 Action: `APPROVE_MILESTONE`
- **Actor**: `CLIENT`
- **Precondition**: Milestone in `UNDER_REVIEW`; deliverable checksum matches.
- **Request Body**:
  ```json
  {
    "action": "APPROVE_MILESTONE",
    "contractId": "c-44e21a-uuid",
    "milestoneId": "m-01-uuid"
  }
  ```
- **Execution Flow**: Milestone marked `APPROVED`. Prepares milestone for escrow release.

### 4.4 Action: `RELEASE_ESCROW`
- **Actor**: `CLIENT` or `SYSTEM`
- **Precondition**: Milestone in `APPROVED`; contract escrow balance $> 0$.
- **Request Body**:
  ```json
  {
    "action": "RELEASE_ESCROW",
    "contractId": "c-44e21a-uuid",
    "milestoneId": "m-01-uuid"
  }
  ```
- **Execution Flow**: Engine 01 validates FSM $\to$ Engine 03 debits escrow, credits freelancer wallet balance $\to$ Milestone status becomes `RELEASED`.

### 4.5 Action: `RAISE_DISPUTE`
- **Actor**: `CLIENT` or `FREELANCER`
- **Precondition**: Milestone in `IN_PROGRESS`, `SUBMITTED`, or `UNDER_REVIEW`.
- **Request Body**:
  ```json
  {
    "action": "RAISE_DISPUTE",
    "contractId": "c-44e21a-uuid",
    "milestoneId": "m-01-uuid",
    "reason": "Deliverable code does not compile and fails functional tests."
  }
  ```
- **Execution Flow**: Milestone & contract freeze in `DISPUTED` $\to$ Dispute record initialized $\to$ Reviewer assigned.

---

## 5. Standard HTTP Status Codes

| Code | Status | Meaning in Platform |
| :--- | :--- | :--- |
| `200` | OK | Read query or idempotent action succeeded. |
| `201` | Created | Resource successfully created (Project, Proposal, Contract, Dispute). |
| `400` | Bad Request | Zod schema validation error or invalid FSM state transition. |
| `401` | Unauthorized | Unauthenticated caller; valid session token required. |
| `403` | Forbidden | Authenticated, but user lacks required role or is not party to contract. |
| `404` | Not Found | Target entity (Project, Contract, Milestone, Deliverable) does not exist. |
| `409` | Conflict | Concurrency collision (mutex locked) or duplicate allocation attempt. |
| `422` | Unprocessable | Syntactically valid payload violates domain invariants (e.g. negative bid). |
| `500` | Internal Error | Unhandled server exception; sanitized error envelope returned. |
