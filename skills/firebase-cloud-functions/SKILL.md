---
name: firebase-cloud-functions
description: Building serverless Firebase Cloud Functions (v2) for background processing, Firestore triggers, HTTPS callables, and secure API integration.
---

# Firebase Cloud Functions Skill

Guidelines:
- Use HTTPS Callable functions (`onCall`) for client-triggered privileged tasks.
- Use Firestore triggers (`onDocumentCreated`, `onDocumentUpdated`) for background aggregation and notifications.
- Validate request authentication contexts (`request.auth.uid`) inside every function.
- Keep function cold starts low by minimizing heavy global imports.
