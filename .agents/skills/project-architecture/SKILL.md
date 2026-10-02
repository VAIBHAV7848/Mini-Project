---
name: project-architecture
description: Activate when designing, refactoring, or reviewing system architecture, component boundaries, and module structures.
---

# Project Architecture Skill

## Purpose
Guides architectural decisions, modularity, layering, and boundary enforcement within the project.

## Core Rules
1. **Separation of Concerns**: Keep domain logic, application orchestration, presentation, and data persistence isolated.
2. **Explicit Contracts**: Components interact solely through defined interfaces or API boundaries.
3. **No Hidden State**: Avoid global mutable state, singleton side-effects, or hidden dependencies.
4. **ADR-First for Major Decisions**: Before altering architectural patterns, record an ADR in `docs/decisions/` using `ADR-000-template.md`.
5. **Traceability**: Link architectural changes to requirement documents in `docs/requirements/`.

## Workflow
1. Check `docs/architecture/architecture.md` for existing system design and established constraints.
2. Verify impact on existing modules before modifying or introducing boundaries.
3. Keep changes incremental; avoid speculative microservices or unnecessary indirection.
