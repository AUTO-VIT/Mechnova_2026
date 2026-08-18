---
name: owasp-top-10-web-security
description: Defense strategies against OWASP Top 10 vulnerabilities including Injection, Broken Access Control, Cryptographic Failures, and SSRF.
---

# OWASP Top 10 Web Security Standards

Checklist & Defense Strategies:
1. **Broken Access Control**: Enforce server-side authorization checks on every data request.
2. **Cryptographic Failures**: Encrypt sensitive data at rest and in transit (TLS 1.3).
3. **Injection**: Use parameterized queries and ORM abstractions to prevent SQL/NoSQL injection.
4. **Insecure Design**: Threat-model authentication and payment workflows before coding.
5. **Security Misconfiguration**: Disable default admin credentials and unneeded debug endpoints.
6. **Vulnerable & Outdated Components**: Audit npm dependencies routinely.
7. **Identification & Auth Failures**: Implement Multi-Factor Authentication (MFA) and strong password policies.
8. **Software & Data Integrity Failures**: Validate code signatures and CI/CD pipelines.
9. **Security Logging & Monitoring**: Log security events and failed login attempts.
10. **Server-Side Request Forgery (SSRF)**: Validate and restrict outgoing HTTP requests from backend services.
