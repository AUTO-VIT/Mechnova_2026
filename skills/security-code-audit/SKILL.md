---
name: security-code-audit
description: Auditing web applications for security vulnerabilities, hardcoded secret keys, unauthenticated routes, and permissive security rules.
---

# Security Code Audit Skill

Audit checklist:
- Search for hardcoded secret API keys, private keys, or credentials in source code.
- Verify protected routes require valid user authentication and role verification.
- Audit database access rules for unauthenticated read/write vulnerabilities.
- Ensure dependency security with `npm audit`.
