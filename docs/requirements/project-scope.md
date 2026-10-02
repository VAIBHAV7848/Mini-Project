# Project Scope, Assumptions, Constraints & Risk Register

> **Derived Documentation**
> **Source Documents**:
> - `docs/source-material/Mini_Project_Gate_0_details_FILLED.docx` (Steps 5, 6, and 7)
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx`

---

## 1. Scope Definition

### 1.1 In-Scope Capabilities
1. **User Registration & Role Management**: Multi-tier authentication supporting Clients, Freelancers, Administrators, and Dispute Reviewers [F1].
2. **Project Specification Posting**: Project creation with budget parameters, skill tags, and phased milestone definitions [F2].
3. **Proposal Submission & Bidding**: Freelancer bids, proposal submission, and client selection [F3, F4].
4. **Milestone Management & Tracking**: Phased milestone creation, funding lock, and real-time status tracking [F5].
5. **Deliverable & Evidence Management**: File upload module with cryptographic SHA-256 hash generation and evidence tree organization [F6].
6. **Simulated Escrow Payment Engine**: State-controlled fund deposit, atomic escrow lock, verified release, and refund workflows [F7].
7. **Dispute Resolution Pipeline**: Multi-party conflict escalation, counter-evidence submission, and binding human reviewer rulings [F8].

### 1.2 Out-of-Scope (Boundaries Against Scope Creep)
1. **Real Banking & Payment Gateway Integration**: Stripe, PayPal, and UPI are strictly excluded; purely simulated currency credits are used to demonstrate complete escrow mechanics without financial liabilities.
2. **Legal Jurisdiction & Formal Contract Enforcement**: External court litigation and formal binding legal contracts are excluded; digital workflow simulated agreements are used.
3. **Native Mobile Applications**: iOS and Android native apps are excluded; platform is delivered as a responsive web application.
4. **Autonomous AI Arbitration Without Human Review**: Fully automated AI rulings are excluded; disputes are arbitrated by human dispute reviewers using submitted evidence.
5. **Unlimited Video File Storage**: Video hosting is excluded; file storage is optimized for source code archives, PDF documents, and image proofs.
6. **Third-Party Corporate Taxation & Accounting**: Corporate tax compliance is excluded; project-level milestone balance ledger is implemented.

---

## 2. Planning Assumptions & Constraints

### Assumptions
1. Users access the application via standard modern web browsers (Chrome, Firefox, Safari, Edge) with internet connectivity.
2. Clients and freelancers engage in good-faith collaboration and provide genuine digital deliverables.
3. Simulated currency credits are sufficient to demonstrate complete escrow mechanics and dispute workflows.
4. Dispute reviewers and administrators act impartially based solely on uploaded evidence records.
5. The deployment environment supports Node.js execution, relational database operations, and local file storage.

### Constraints
1. **Semester Timeline**: Full development, verification, and gate reviews must conclude within 15 weeks.
2. **Team Resource**: 4-member undergraduate student team dividing responsibilities across 4 foundational engines.
3. **Zero Budget**: Utilizes free, open-source frameworks (Next.js, React, Node.js, Prisma ORM, SQLite/MySQL).
4. **Demonstration Environment**: Runs on standard departmental hardware and local development instances.

---

## 3. Initial Project Risk Register & Ownership

| Risk ID | Description | Category | Likelihood | Impact | Mitigation Strategy | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R1** | Ambiguity in milestone acceptance criteria leading to false disputes | Operational | Medium | High | Enforce structured input fields for deliverables during project setup. | **Vaibhav Chavanpatil** |
| **R2** | Simulated escrow state machine deadlock during dispute review | Technical | Low | High | Implement strict finite state transitions with atomic transaction rollback and reviewer override capabilities. | **Darshan Kittur** |
| **R3** | Evidence file upload tampering or loss during dispute submission | Technical | Medium | Medium | Generate cryptographic SHA-256 checksums on upload and store files in isolated directory structure. | **Purvi Sammatshetti** |
| **R4** | Unauthorized access to milestone funds or admin dispute controls | Security | Low | High | Enforce strict Role-Based Access Control (RBAC) and session validation on all API endpoints. | **Vaishnavi Modekar** |
| **R5** | Team member illness or academic schedule conflicts during key phases | Resource | Medium | Medium | Maintain modular component breakdown with Git branch discipline and pair programming redundancy. | **Vaibhav Chavanpatil** |
| **R6** | Database migration inconsistency breaking milestone relationships | Technical | Medium | Medium | Utilize Prisma ORM migrations with automated schema validation and automated seed scripts. | **Darshan Kittur** |
| **R7** | Scope creep extending into real payment gateway integration | Scope | Medium | Medium | Firmly maintain established Out-of-Scope boundaries; focus solely on simulated workflow governance. | **Purvi Sammatshetti** |
| **R8** | Frontend responsive UI defects on mobile or tablet viewports | Usability | Low | Medium | Conduct multi-device cross-browser testing using Tailwind CSS responsive breakpoints. | **Vaishnavi Modekar** |
