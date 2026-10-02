# ADR-008: Server-Side Role-Based Access Control (RBAC) and Session Integrity

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Vaibhav Chavanpatil — Engine 04 Lead)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
The platform serves four distinct personas: Clients, Freelancers, Dispute Reviewers, and System Administrators. A critical security risk in modern web applications is relying on frontend UI element hiding for authorization. If authorization is not strictly enforced server-side, malicious users can bypass client guards and directly invoke administrative or dispute ruling API endpoints.

---

## 2. Decision Outcome
> **Chosen Option**: Non-bypassable server-side RBAC middleware and API route guards coupled with HTTP-only signed session tokens and bcrypt password hashing.
> **Rationale**: All API endpoints authenticate the caller's server session and evaluate the formal `Role × Resource × Action` matrix. Presentation layer hiding is treated strictly as a UX feature, never as a security boundary.

---

## 3. Considered Options
1. **Server-Side RBAC Middleware with HTTP-Only Cookies (Chosen)**:
   - *Pros*: Non-bypassable; protects tokens from JavaScript XSS attacks; returns standard HTTP 401/403 errors; enforces relationship authorization (user must be party to contract).
   - *Cons*: Every server route must invoke the session guard.
2. **Client-Side Token Storage (LocalStorage)**:
   - *Pros*: Easy to implement in single-page apps.
   - *Cons*: Highly vulnerable to XSS token exfiltration; fails institutional security standards.
3. **Frontend-Only Route Hiding**:
   - *Pros*: Minimal backend code.
   - *Cons*: Catastrophic vulnerability; any user can POST to `/api/contracts` or `/api/disputes/{id}/ruling`.

---

## 4. Key Rules Enforced
- **Password Security**: Bcrypt with 10 salt rounds ($2^{10}$ iterations).
- **Session Tokens**: Cryptographically signed tokens stored in `session_token` HTTP-only, `SameSite=Strict`, `Secure` cookie.
- **Resource Ownership**: Clients can only approve/fund their own contracts; Freelancers can only submit deliverables for assigned contracts; Reviewers can only rule on assigned disputes.
- **Unauthorized Handling**: Unauthenticated $\to$ HTTP 401; Unauthorized Role $\to$ HTTP 403.

---

## 5. Consequences
- **Positive Consequences**:
  - Full defense against privilege escalation and horizontal authorization bypass attacks.
  - Satisfies NFR-02 and Slide 18 security requirements.
- **Negative Consequences / Trade-offs**:
  - Slight latency overhead to validate session and load user role on protected requests.

---

## 6. Links & References
- Security Threat Model: `docs/security/threat-model.md`
- Security Baseline: `docs/security/security-model.md`
