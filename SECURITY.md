# Security Policy

## Reporting a Vulnerability

The engineering team takes the security of this project seriously. If you discover a security vulnerability, please do NOT disclose it publicly through GitHub issues or social channels.

### Reporting Process
1. Contact the project maintainers via secure email or direct communication channel.
2. Provide a detailed summary including:
   - Description of the vulnerability and attack vector.
   - Exact steps or minimal proof-of-concept (PoC) to reproduce.
   - Affected components, versions, or environments.
   - Potential impact on confidentiality, integrity, or availability.
3. You will receive an initial response within 48 hours.

---

## Security Baseline Requirements

### 1. Secrets Management
- No secrets, credentials, API keys, or private certificates may be committed to this repository.
- Use environment variables (`.env`) for local development, strictly ignored by `.gitignore`.
- Production credentials must be injected via secure secret managers (e.g. Vault, AWS Secrets Manager).

### 2. Authentication & Authorization
- Use industry-standard algorithms and verified libraries (e.g. Argon2id, bcrypt, signed JWTs with short expiry).
- Apply Role-Based Access Control (RBAC) with deny-by-default logic at the handler/service boundary.

### 3. Input Validation & Output Encoding
- Validate and sanitize all external inputs using schema validators (allowlist approach).
- Encode all dynamic output according to context (HTML, SQL, CLI) to prevent injection flaws.

### 4. Dependency & Supply Chain Security
- Automated dependency audits run in CI pipelines to block builds with known high/critical CVEs.
- Lockfiles (`package-lock.json`, `poetry.lock`, etc.) must be committed and strictly enforced.

### 5. Sensitive Data Handling & Logging
- Mask or omit PII, authentication tokens, passwords, and payment details from application logs.
- Never log full authorization headers or request bodies containing sensitive credentials.

### 6. File Uploads & Resource Limits
- Validate MIME types against file magic bytes, enforce maximum payload size, and store uploads in isolated object storage.
- Enforce rate limiting on authentication and resource-intensive endpoints.
