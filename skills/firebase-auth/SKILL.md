---
name: firebase-auth
description: Firebase Authentication integration including Email/Password, OAuth providers, Custom Claims, Auth Listeners, and Token Management.
---

# Firebase Authentication Skill

Guidelines for Firebase Auth:
- Initialize auth listener via `onAuthStateChanged(auth, callback)` inside a React Context provider.
- Store custom user claims (e.g. `admin`, `teamId`) for server-enforced role checking.
- Handle auth state persistence safely across browser reloads.
- Provide clear error messaging for common auth codes (`auth/wrong-password`, `auth/user-not-found`).
