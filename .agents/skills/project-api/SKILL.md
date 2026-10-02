---
name: project-api
description: Activate when designing, modifying, or reviewing API endpoints, data transfer objects, request schemas, or communication protocols.
---

# Project API Skill

## Purpose
Establishes consistent, robust API contracts, versioning schemes, error formats, and payload structures.

## Core Rules
1. **Contract-First Consistency**: Define endpoint specifications, parameters, headers, and responses before implementation.
2. **Predictable Status Codes & Semantics**: Follow standard HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `422`, `429`, `500`).
3. **Structured Error Payloads**: Always return machine-readable errors containing an error code, human message, and optional validation details:
   ```json
   {
     "error": {
       "code": "INVALID_INPUT",
       "message": "Field 'email' is required.",
       "details": []
     }
   }
   ```
4. **Idempotency & Pagination**: Use cursor or page-based pagination for collections. Support idempotency keys on sensitive mutation actions.
5. **Rate Limiting & Throttling**: Protect public and resource-heavy endpoints with rate limits and quota enforcement.
