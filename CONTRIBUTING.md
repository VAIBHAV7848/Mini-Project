# Contributing to BIG_PROJECT

Thank you for contributing to BIG_PROJECT! We hold high standards for code quality, architectural consistency, testing, and security.

---

## 1. Code of Conduct & Principles
- **Small, Atomic Changes**: Every pull request should address a single cohesive concern.
- **Test Before Submitting**: All code changes must be accompanied by relevant unit or integration tests.
- **Zero Secret Commits**: Never commit credentials, private tokens, or `.env` files.
- **No Direct Commits to `main`**: All work happens in isolated feature branches or Git worktrees.

---

## 2. Branching & Git Workflow
1. Create a branch from `main`:
   ```bash
   git checkout -b feature/<descriptive-name>
   # or for bugs:
   git checkout -b fix/<descriptive-name>
   ```
2. For parallel or extensive work, use Git worktrees:
   ```bash
   git worktree add ../BIG_PROJECT-<branch> -b feature/<branch>
   ```
3. Use Conventional Commits:
   - Format: `<type>: <description>` (e.g., `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `perf:`, `security:`)
   - Examples:
     - `feat: implement milestone state validation`
     - `fix: prevent duplicate escrow allocation`
     - `test: add escrow timeout coverage`
     - `docs: update API contract`
     - `refactor: isolate dispute resolution service`
   - Describe WHAT changed, not HOW the change was produced.
   - Never reference AI, agents, or automated generation in commit messages or footers.
   - Always commit using the repository's configured real developer identity.

---

## 3. Pre-PR Verification
Before opening a pull request, ensure all local checks pass:
```bash
./scripts/lint
./scripts/security-check
./scripts/verify
```

---

## 4. Pull Request Submission
- Fill out the pull request template completely.
- Provide terminal verification output demonstrating passing tests.
- Ensure all CI workflow checks pass cleanly.
