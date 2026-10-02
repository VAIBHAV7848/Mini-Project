---
name: project-database
description: Activate when defining database schemas, authoring migrations, optimizing queries, designing indexes, or managing data integrity.
---

# Project Database Skill

## Purpose
Ensures durable, performant, and safe data persistence patterns and migration integrity.

## Core Rules
1. **Reversible & Tested Migrations**: Every migration must be tested forwards and backwards (down migrations when applicable).
2. **Explicit Indexes & Constraints**: Primary keys, foreign keys, uniqueness constraints, and search indexes must be intentional and documented.
3. **Transaction Safety**: Atomic state changes must execute inside explicit database transactions to prevent partial updates.
4. **Zero Downtime Migration Patterns**: Avoid locking large tables during migrations; use expand-and-contract patterns for non-breaking schema evolution.
5. **No Blind Full Table Scans**: Verify explain plans for query hotspots and frequent query patterns.

## Reference
Check `docs/database/schema.md` for current schema definitions, entity relationships, and conventions.
