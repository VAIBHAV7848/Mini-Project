# API Design Standards & Specification

> **Classification**: Application & Transport Protocol Specification
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slide 16 & 17)
> - `docs/decisions/ADR-001-technology-stack-baseline.md`

---

## 1. Protocol Architecture & Conventions
- **Protocol**: RESTful HTTP API over Next.js Server Route Handlers
- **Base Route**: `/api`
- **Payload Format**: `application/json; charset=utf-8`
- **Validation**: Strict boundary validation on all request bodies via Zod 4 schemas
- **Error Format**: Standardized error envelope with machine-readable error codes

---

## 2. Team 07 RESTful Route Inventory

As documented in Slide 17 of the authoritative presentation:

| Endpoint | Method | Owning Engine & Owner | Description & Contract Behavior |
| :--- | :--- | :--- | :--- |
| `/api/projects` | `GET`, `POST` | E3 (DBMS - Purvi) / E4 (Web - Vaibhav) | List open projects with budget and skill tags; create new project specification. |
| `/api/proposals` | `POST` | E3 (DBMS - Purvi) / E2 (DSA/SE - Darshan) | Submit developer proposal; triggers AI Matcher (`aiMatchScore` calculation). |
| `/api/contracts` | `GET`, `POST` | E1 (OS - Vaishnavi) / E3 (DBMS - Purvi) | Fetch active contracts; execute Core Contract Action Protocol (`SUBMIT_MILESTONE`, `APPROVE_MILESTONE`, `RELEASE_ESCROW`). |
| `/api/gigs` | `GET`, `POST` | E4 (Web - Vaibhav) / E3 (DBMS - Purvi) | Query marketplace services by category; create tiered service packages (Basic, Standard, Premium). |
| `/api/gigs/[id]` | `GET` | E4 (Web - Vaibhav) | Fetch single gig details with seller profile, verification badges, and completed reviews. |
| `/api/orders` | `GET`, `POST` | E1 (OS - Vaishnavi) / E3 (DBMS - Purvi) | Place and track gig orders with deliverable URLs, delivery due dates, and status. |
| `/api/developers` | `GET` | E4 (Web - Vaibhav) / E3 (DBMS - Purvi) | List developers with parsed skills, hourly rates, availability, and DevScores. |
| `/api/analyze-github` | `POST` | E2 (SE - Darshan) / E4 (Web - Vaibhav) | Verify developer GitHub profile; calculate DevScore, repository metrics, top languages. |

---

## 3. Core Contract Action Protocol (`POST /api/contracts`)

State-modifying contract operations are routed through `POST /api/contracts` with action discriminators governed by Engine 01 (OS FSM) and Engine 03 (DBMS):

### 3.1 Action: `SUBMIT_MILESTONE`
- **Caller**: Freelancer
- **Trigger**: Developer completes milestone work.
- **Payload**:
  ```json
  {
    "action": "SUBMIT_MILESTONE",
    "contractId": "c-12345",
    "milestoneId": "m-001",
    "deliverableUrl": "https://storage.local/deliverables/m-001.zip",
    "notes": "Completed initial frontend component structure."
  }
  ```
- **Engine Processing**:
  - Engine 02 computes `crypto.createHash('sha256')` over deliverable content/URL.
  - Milestone status transitions to `SUBMITTED`.
  - Contract status transitions to `UNDER_REVIEW`.
  - Checksum saved to database deliverable table.

### 3.2 Action: `APPROVE_MILESTONE`
- **Caller**: Client
- **Trigger**: Client verifies deliverable and checksum match.
- **Payload**:
  ```json
  {
    "action": "APPROVE_MILESTONE",
    "contractId": "c-12345",
    "milestoneId": "m-001"
  }
  ```
- **Engine Processing**:
  - Milestone status transitions to `APPROVED`.
  - Triggers escrow release readiness validation.

### 3.3 Action: `RELEASE_ESCROW`
- **Caller**: Escrow FSM / Authorized Client
- **Trigger**: Approved milestone triggers fund transfer.
- **Payload**:
  ```json
  {
    "action": "RELEASE_ESCROW",
    "contractId": "c-12345",
    "milestoneId": "m-001"
  }
  ```
- **Engine Processing**:
  - Engine 01 checks FSM compliance (`validateEscrowTransition(current, 'RELEASED')`).
  - Engine 03 executes atomic balance transfer in SQLite (`prisma.$transaction`).
  - Contract status transitions to `RELEASED`.
  - Append-only audit record created in `AUDIT_LOG`.

---

## 4. Standard Response Envelope
All route responses must follow consistent JSON envelopes:

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-02T20:20:00Z",
    "requestId": "req-98f7e21a"
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot release escrow for milestone in SUBMITTED state without approval.",
    "details": []
  },
  "meta": {
    "timestamp": "2026-10-02T20:20:00Z",
    "requestId": "req-98f7e21a"
  }
}
```
