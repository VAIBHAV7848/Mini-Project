# Requirements Specification Master Index

> **Classification**: Authoritative Requirements Baseline
> **Source Documents**:
> - [Team07_Escrow_Mini_Project_KLE_Theme.pptx](file:///home/nethunter/Collage/BIG_PROJECT/docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx)
> - [Mini_Project_Gate_0_details_FILLED.docx](file:///home/nethunter/Collage/BIG_PROJECT/docs/source-material/Mini_Project_Gate_0_details_FILLED.docx)

---

## 1. Executive Summary
- **Project Title**: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow
- **Team**: Team 07 (Theme 01) — KLE Technological University
- **Problem Solved**: Freelance marketplace vulnerabilities stemming from unclear requirements, delayed deliverables, payment uncertainty, and subjective unresolvable disputes.
- **Solution Strategy**: An integrated four-engine architecture combining simulated escrow fund locking, cryptographic SHA-256 evidence trees, ACID database ledgering, and multi-role responsive dashboards.

---

## 2. Requirements Documentation Structure

| Document | Purpose | Key Content |
| :--- | :--- | :--- |
| **[team-project-overview.md](file:///home/nethunter/Collage/BIG_PROJECT/docs/requirements/team-project-overview.md)** | Academic overview & subject mapping | Team roster, 4-engine breakdown, course concepts, gate review progression |
| **[functional-requirements.md](file:///home/nethunter/Collage/BIG_PROJECT/docs/requirements/functional-requirements.md)** | Behavioral system specifications | FR-01 through FR-12 with owning engines and observable acceptance criteria |
| **[non-functional-requirements.md](file:///home/nethunter/Collage/BIG_PROJECT/docs/requirements/non-functional-requirements.md)** | Quality attributes & measurable KPIs | NFR-01 through NFR-10 with verifiable benchmarks (p95 latency, zero double-allocation) |
| **[use-cases.md](file:///home/nethunter/Collage/BIG_PROJECT/docs/requirements/use-cases.md)** | Use cases and scenario flows | UC-01 through UC-05 with main, alternate, and exception flows |
| **[project-scope.md](file:///home/nethunter/Collage/BIG_PROJECT/docs/requirements/project-scope.md)** | Boundaries & operational context | In-scope capabilities, out-of-scope constraints, assumptions, and risk register (R1–R8) |

---

## 3. High-Level Requirements Traceability Matrix (RTM)

| S0 Stakeholder Need | Functional Requirement | Use Case Reference | Owning Engine & Owner | Target Quality Attribute |
| :--- | :--- | :--- | :--- | :--- |
| **Payment Uncertainty** | FR-01 (Escrow Fund Locking)<br>FR-05 (ACID Payment Processing) | UC-01 (Contract Initiation)<br>UC-03 (Milestone Release) | Engine 01 (OS · Vaishnavi)<br>Engine 03 (DBMS · Purvi) | NFR-05 (FSM Reliability)<br>NFR-08 (ACID Consistency) |
| **Delayed Deliverables** | FR-02 (Milestone State Tracking)<br>FR-10 (FSM Progress UI) | UC-02 (Deliverable Submission)<br>UC-03 (Milestone Release) | Engine 01 (OS · Vaishnavi)<br>Engine 04 (Web · Vaibhav) | NFR-01 (Latency ≤ 500ms)<br>NFR-06 (Responsiveness) |
| **Lack of Evidence** | FR-03 (Cryptographic Checksums)<br>FR-04 (Evidence Trees) | UC-02 (Deliverable Submission)<br>UC-04 (Dispute Escalation) | Engine 02 (DSA/SE · Darshan) | NFR-03 (Data Integrity - 100% detection)<br>NFR-09 (Auditability) |
| **Subjective Disputes** | FR-09 (Dispute Workflow)<br>FR-06 (Tamper-Resistant Audit Log) | UC-04 (Dispute Escalation) | Engine 04 (Web · Vaibhav)<br>Engine 03 (DBMS · Purvi) | NFR-09 (100% state transitions recorded) |
| **Unrestricted Access** | FR-08 (Authentication & RBAC)<br>FR-07 (Role-Based Dashboards) | UC-01, UC-04 (RBAC Validation) | Engine 04 (Web · Vaibhav) | NFR-02 (Security - 100% routes protected) |
| **Skills / Rate Mismatch** | FR-11 (AI Semantic Matching) | UC-05 (AI Semantic Matching) | Engine 02 (SE · Darshan)<br>Engine 03 (DBMS · Purvi) | NFR-01 (Latency ≤ 500ms) |
