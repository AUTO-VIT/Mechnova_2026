---
name: frontend-security-xss-csrf
description: Preventing Cross-Site Scripting (XSS), CSRF, DOM injection, unsafe innerHTML usage, and client-side data leakage.
---

# Front-End Security (XSS & CSRF Mitigation)

Guidelines:
- Never use `dangerouslySetInnerHTML` without DOMPurify sanitization.
- Store sensitive auth tokens in HttpOnly, SameSite cookies instead of localStorage when possible.
- Implement strict Content Security Policy (CSP) headers.
- Escape user-generated inputs in DOM text nodes.
