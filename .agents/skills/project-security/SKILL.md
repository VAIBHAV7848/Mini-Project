---
name: project-security
description: Activate when modifying authentication, authorization, cryptography, secrets management, input handling, or reviewing security posture.
---

# Project Security Skill

## Purpose
Guarantees defensive security practices, zero secret leakage, safe data handling, and compliance with the project security model.

## Core Rules
1. **Zero Hardcoded Secrets**: Secrets, keys, and tokens must NEVER be committed to Git. Enforce `.gitignore` and environment isolation.
2. **Defensive Input Handling**: Validate all inputs at the boundary using schemas (strict allowlists). Reject malformed data early.
3. **Safe Output & Serialization**: Properly encode and sanitize all outputs to mitigate XSS, injection, or parameter tampering.
4. **Least Privilege & RBAC**: Deny by default. Verify authentication and authorization tokens on every protected endpoint.
5. **Secure Cryptography**: Use industry-standard algorithms (e.g., Argon2id/bcrypt for passwords, AES-GCM or ChaCha20-Poly1305 for symmetric encryption, SHA-256/SHA-512 for digests).
6. **Safe Dependency Supply Chain**: Regularly audit dependencies for known CVEs.

## Security Review Check
Consult `SECURITY.md` and `docs/security/security-model.md` before making sensitive design or code modifications.
