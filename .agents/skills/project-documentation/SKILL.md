---
name: project-documentation
description: Activate when writing or updating architecture documentation, ADRs, README files, requirements, or API specifications.
---

# Project Documentation Skill

## Purpose
Maintains living, accurate, and structured project documentation that serves as the durable memory of the system.

## Core Rules
1. **Docs as Code**: Documentation evolves alongside implementation in the same PR.
2. **ADR Protocol**: Record irreversible or cross-cutting decisions in `docs/decisions/` using `ADR-000-template.md`.
3. **No Stale Information**: When code changes modify behaviors, endpoints, or configurations, update corresponding docs in `docs/` immediately.
4. **Clarity & Brevity**: Prefer structured lists, diagrams (Mermaid), and tables over verbose prose.
5. **Project Status Tracking**: Update `docs/development/project-status.md` when completing milestones or altering work phases.
