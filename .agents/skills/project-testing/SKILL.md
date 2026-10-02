---
name: project-testing
description: Activate when writing, updating, or reviewing tests, test harnesses, CI test pipelines, or evaluating coverage.
---

# Project Testing Skill

## Purpose
Enforces testing standards, test-driven methodologies, and verification rigor across the codebase.

## Core Rules
1. **Test-First Implementation**: Write or update failing tests prior to implementing non-trivial features or bug fixes.
2. **Deterministic & Isolated**: Tests must not rely on external networks, unseeded random values, or race conditions.
3. **Pyramid Discipline**:
   - Heavy fast unit tests covering core domain logic and edge cases.
   - Targeted integration tests verifying component, database, or API boundaries.
   - Minimal high-value end-to-end tests for critical user workflows.
4. **Failure Message Clarity**: Assertions must clearly describe expected vs. actual outcomes.
5. **No Regressions**: Bug fixes must always include an accompanying regression test replicating the failure.

## Verification Gate
Before submitting any pull request or declaring a task complete, run the complete test suite and inspect exit codes and error logs.
