# Engine 04 Defense — Web Technologies Engine

> **Student Owner**: Vaibhav Chavanpatil (Roll No: 4, SRN: `02FE24BCS013`)
> **Owning Engine**: Engine 04 — Role-Based Workflow Dashboard
> **Academic Subject**: Web Technologies & Computer Networks (Core CSE 4th/5th Semester)
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1)

---

## 1. Academic Subject & Curricular Alignment
- **Foundational Subject**: Web Technologies & Computer Networks
- **Core Curricular Principles**:
  - Client-Server Architecture and HTTP protocol semantics.
  - Authentication, Session Management, and Role-Based Access Control (RBAC).
  - Component-based UI composition, reactive state rendering, and responsive design.
  - Web Security: Defensive input validation, Cross-Site Scripting (XSS) prevention, and CSRF protection.
  - RESTful API design and JSON contract serialization.

---

## 2. Problem Being Solved
1. **Privilege Escalation & Unauthorized Access**: Freelancers attempting to approve their own milestones, clients accessing other clients' contracts, or unauthenticated users tampering with dispute verdicts.
2. **Opaque Escrow State Visibility**: Users cannot tell whether funds are committed, work is being submitted, or review is pending, causing confusion and panic.
3. **Chaotic Dispute Presentation**: Without a structured role-based interface, evidence submission is scattered, and dispute arbiters lack a clear adjudication console.
4. **Malicious / Corrupt Payloads**: Malformed or unvalidated input payloads causing server crashes, injection attacks, or state corruption.

---

## 3. Functional Requirements Owned
- **FR-07: Multi-Role Workflow Dashboards**: Implements dedicated, responsive views tailored for Clients (deposit, milestone review, approval), Freelancers (proposals, submission, earnings), and Dispute Reviewers (evidence tree inspection, adjudication).
- **FR-08: Authentication & Role-Based Access Control**: Enforces server-side authentication session validation and route-level authorization middleware on 100% of protected routes (NFR-02).
- **FR-09: Dispute Escalation & Resolution Workflow**: Provides structured forms for dispute initiation, claim statements, counter-evidence submission, and verdict rendering.
- **FR-10: Real-Time FSM State Visualizer**: Renders an interactive, deterministic visual milestone timeline representing FSM states (`FUNDED`, `UNDER_REVIEW`, `DISPUTED`, `RELEASED`).

---

## 4. Core Concepts Demonstrated
1. **Server-Side RBAC Middleware**:
   - Verification of user role claims before route handler execution.
   - Rejection of unauthorized requests with explicit HTTP 401 (Unauthorized) or HTTP 403 (Forbidden) statuses.
2. **Schema-First Input Validation (Zod 4)**:
   - 100% of incoming POST/PUT/PATCH request bodies validated against strict runtime schemas before reaching domain logic (NFR-04).
3. **State-Driven UI Architecture (Next.js 16 & React 19)**:
   - Clear separation between Server Components (secure data fetching) and Client Components (interactive forms, visualizers).
4. **Responsive Web Design**:
   - Tailwind CSS utility layouts supporting viewports from 360px (mobile) to 1920px (desktop) without horizontal scrolling (NFR-06).

---

## 5. Why This Belongs to Web Technologies
Web Technologies governs how users interface securely with distributed application servers over HTTP:
- RBAC middleware, secure cookie handling, and header security are the bedrock of web application security.
- Designing modular, accessible, and responsive user interfaces that translate backend domain events into intuitive state visualizers is core web engineering.
- Ensuring that no unauthenticated network payload can compromise the server boundary demonstrates mastery of HTTP server mechanics.

---

## 6. Expected Gate 1 Evidence
- **RBAC Authorization Matrix**: Complete table mapping Roles (`CLIENT`, `FREELANCER`, `DISPUTE_REVIEWER`, `ADMIN`) against Endpoint Actions.
- **UI Architecture & Component Hierarchy**: Wireframe layouts and component boundary designs for all four role dashboards.
- **Zod 4 Schema Validation Contracts**: Specification of payload schemas for login, project creation, deliverable submission, and dispute escalation.
- **State Visualizer Stepper Model**: UI component specifications mapping FSM states to visual stepper indicators.

---

## 7. Likely Evaluator Questions & Exact Defenses

### Q1: "Why did you choose Next.js 16 App Router over a traditional separate React SPA + Express server?"
> **Defense**: "Next.js 16 App Router provides an integrated, type-safe full-stack architecture that is ideal for an engineering project:
> 1. Unified Type Contracts: TypeScript types are shared directly between Server Route Handlers and React UI components, eliminating contract drift.
> 2. Server-First Security: Authentication sessions and database transactions execute entirely on the server within Server Components and Route Handlers, ensuring database credentials and business logic are never exposed to client browsers.
> 3. Streamlined Build & Deployment: A single integrated runtime eliminates multi-port CORS configuration, proxy setup, and separate deployment headaches."

### Q2: "What prevents a malicious user from editing client-side JavaScript in their browser to bypass RBAC?"
> **Defense**: "Client-side UI checks (such as hiding buttons or conditional rendering) are purely for user experience, never for security. All security enforcement in FR-08 is executed **server-side** inside Next.js Route Handlers and Server Action middleware. When a request hits a protected endpoint, the server extracts the authenticated session token from an HTTP-only secure cookie, validates its signature, and asserts the role. Even if an attacker modifies client JS to send an unauthorized request, the server returns HTTP 403 Forbidden and aborts immediately."

### Q3: "How does the UI reflect real-time milestone state changes without WebSockets?"
> **Defense**: "In Stage S1, FR-10 specifies a lightweight client-side polling interval (5 seconds) paired with reactive state updates. For an escrow milestone workflow, state changes occur when explicit user actions happen (deposit, submission, approval, dispute), not thousands of times per second. A 5-second polling interval provides near-instant UI updates while avoiding the server memory overhead and connection state complexities of persistent WebSocket infrastructure."

### Q4: "How does Engine 04 communicate with Engines 01, 02, and 03?"
> **Defense**: "Engine 04 acts as the interface layer:
> 1. It receives user inputs via form submissions and validates them using Zod schemas.
> 2. It invokes Engine 01's FSM scheduler to validate and execute the requested state transition.
> 3. It invokes Engine 02's checksum generator when deliverables are uploaded, and queries Engine 02's Evidence Tree during dispute views.
> 4. It delegates all database reads and ACID transaction writes to Engine 03's persistence models."
