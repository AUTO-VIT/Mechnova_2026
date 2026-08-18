---
name: firebase-security-rules
description: Writing robust Firestore Security Rules for secret data protection, role-based authorization, and schema validation.
---

# Firebase Security Rules Skill

Security Rules guidelines:
- Protect secret fields/documents until admin toggle flags are set (e.g. `themesRevealed == true`).
- Restrict write permissions exclusively to authenticated users (`request.auth != null`) and matching resource IDs (`request.auth.uid == userId`).
- Enforce Admin authorization by checking `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"`.
- Validate incoming document data types and length limits (`request.resource.data.title is string`).
