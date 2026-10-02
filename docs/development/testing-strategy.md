# Testing Strategy & Policy

> **Verification First: Quality, Reliability, and Regression Prevention**

## 1. Testing Philosophy
Testing is not a downstream QA stage; it is an active engineering activity performed during feature design and implementation. Code changes submitted without accompanying tests will not be accepted.

---

## 2. Test Hierarchy (The Testing Pyramid)

```text
       ▲
      / \        End-to-End Tests (Critical User Journeys)
     /   \       -----------------------------------------
    /     \      API & Contract Integration Tests
   /       \     -----------------------------------------
  /         \    Module & Component Integration Tests
 /           \   -----------------------------------------
/_____________\  Unit Tests (Domain Models, Pure Functions, Reducers)
```

### 2.1 Unit Tests
- **Scope**: Individual pure functions, domain models, validation schemas, algorithms.
- **Speed**: Sub-millisecond execution per test.
- **Coverage Target**: 80%+ on domain logic and utility modules.
- **Isolation**: Mock external I/O, database, and network boundaries.

### 2.2 Integration Tests
- **Scope**: Interaction between application services, persistence adapters, and middleware.
- **Environment**: Testcontainers / ephemeral local databases.
- **Verification**: Transaction rollback, schema constraints, serialization fidelity.

### 2.3 API & Contract Tests
- **Scope**: Endpoint input handling, authentication middleware, status code semantics, response payload formatting.
- **Standards**: Assert error envelopes and validation schemas.

### 2.4 End-to-End (E2E) Tests
- **Scope**: Full system execution across primary user flows.
- **Discipline**: Keep minimal, resilient against flakiness, focused on high-value business flows.

### 2.5 Regression Tests
- **Mandate**: Every bug fix MUST include a reproduction test that failed prior to the patch and passes after the patch.

### 2.6 Security & Dependency Scans
- **Automated**: Static analysis for hardcoded secrets, known CVEs in packages, and OWASP top risks.

---

## 3. Test-Driven Development (TDD) Workflow
1. **Red**: Write a minimal failing test defining expected behavior.
2. **Green**: Implement the simplest production code required to satisfy the assertion.
3. **Refactor**: Clean up the design, eliminate duplication, verify all tests remain green.

---

## 4. Test Execution & Reporting
All tests must execute via standard repository commands:
- Unit & integration: `npm test` or `pytest` (to be finalized per technology stack)
- Script wrapper: `./scripts/test`
