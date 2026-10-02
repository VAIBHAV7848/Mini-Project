---
name: project-git
description: Activate when creating branches, crafting commits, opening pull requests, managing Git worktrees, or handling merge workflows.
---

# Project Git Skill

## Purpose
Enforces Git discipline, atomic commits, branch hygiene, and clean reviewable collaboration workflows.

## Core Rules
1. **Branch Isolation**: Never commit unreviewed code directly to `main`. Create descriptive branches (`feature/<name>`, `fix/<name>`, `docs/<name>`, `refactor/<name>`).
2. **Worktrees for Parallel Work**: For non-trivial parallel tasks, use Git worktrees rather than switching back and forth on a dirty working tree.
3. **Atomic & Descriptive Commits**: Group related changes logically. Use conventional commit formatting (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
4. **Never Commit Secrets or Junk**: Keep Git index pristine. Always review `git status` and `git diff` before committing.
5. **No Destructive Operations**: Never force push to shared branches without explicit authorization.
6. **PR Evidence**: PRs must provide summary, rationale, tests passed, and verification output.
