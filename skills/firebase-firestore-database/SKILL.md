---
name: firebase-firestore-database
description: Firestore database modeling, collection/document architecture, 1-write-per-second bottleneck avoidance, subcollections, and queries.
---

# Firebase Firestore Database Architecture

Guidelines for Firestore:
- **Avoid 1 Write/Sec Bottleneck**: Write high-frequency data to unique per-user/per-team documents (`/quizSubmissions/{teamId}`) rather than single shared documents.
- Use `onSnapshot()` for real-time document and query subscriptions.
- Perform multi-document updates atomically using `writeBatch(db)` or `runTransaction(db, callback)`.
- Index complex composite queries in `firestore.indexes.json`.
- Keep document payloads small and flat.
