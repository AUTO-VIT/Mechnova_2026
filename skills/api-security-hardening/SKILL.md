---
name: api-security-hardening
description: Hardening REST and GraphQL API endpoints with rate limiting, request validation, CORS configuration, and JWT verification.
---

# API Security Hardening

Guidelines:
- Enforce strict CORS policies allowing requests only from trusted domain origins.
- Rate-limit API endpoints to mitigate Brute-Force and Denial of Service (DoS) attacks.
- Validate request payload schemas on the server using Zod or Joi schemas.
- Verify JWT signatures and token expiration timestamps on every protected endpoint.
