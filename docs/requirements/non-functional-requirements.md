# Non-Functional Requirements Specification (NFRS)

> **Derived Documentation**
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slide 19)
> - `docs/source-material/Mini_Project_Gate_0_details_FILLED.docx` (Step 4)

---

## 1. Quality Attributes & Measurement Standards
This document specifies the system constraints, measurable KPI targets, and verification methodologies defined by Team 07.

---

## 2. NFR Matrix

| NFR-ID | Category | Quality Attribute Target | Measurable KPI Target | Verification Methodology |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-01** | **Performance** | Low-latency response times for core REST API routes under standard operational load. | **p95 latency ≤ 500 ms** across all API endpoints (Workload condition: 50 concurrent requests on local benchmark dataset of 100 projects and 500 milestones — *PROPOSED TEST BENCHMARK — TEAM VALIDATION REQUIRED*) | Automated latency benchmarking suite |
| **NFR-02** | **Security** | Least-privilege Role-Based Access Control on all private endpoints. | **100% of protected routes** enforce role authorization | Negative automated security test suite (assert 401/403) |
| **NFR-03** | **Data Integrity** | Cryptographic integrity verification for all submitted deliverable artifacts. | **100% detection rate** for file tampering or hash mismatch | File tampering injection tests |
| **NFR-04** | **Input Validation** | Defensive boundary validation preventing SQL injection, XSS, and malformed payloads. | **100% of incoming payloads** validated via Zod schemas | Automated fuzz testing against SQLi and XSS payloads |
| **NFR-05** | **FSM Reliability** | Deterministic, race-condition-free escrow state transitions. | **0 invalid or out-of-order state transitions** permitted | Automated FSM model-checker and boundary tests |
| **NFR-06** | **Responsiveness** | Cross-device UI responsiveness across mobile, tablet, and desktop viewports. | Layout renders without overflow across viewports (360px–1920px) | Viewport responsive audit with Tailwind CSS breakpoints |
| **NFR-07** | **Maintainability** | Clean decoupling and modularity across the four foundational course engines. | 4 independently testable and ownable engine modules | Static architectural lint and import boundary checks |
| **NFR-08** | **Consistency** | ACID transaction compliance across simulated escrow ledger transfers. | **0 double-allocation or balance discrepancy anomalies** | Concurrent stress test suite simulating parallel transfers |
| **NFR-09** | **Auditability** | Complete historical traceability for all contract modifications and dispute rulings. | **100% of state transitions** captured in append-only audit log | Audit log reconciliation tests |
| **NFR-10** | **Fault Tolerance** | Graceful error handling and structured error response envelopes. | **Zero unhandled server crashes**; standardized JSON error envelopes | Chaos testing with unexpected null and edge inputs |
