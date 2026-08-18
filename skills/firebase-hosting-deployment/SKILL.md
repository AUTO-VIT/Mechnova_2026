---
name: firebase-hosting-deployment
description: Deploying Single Page Applications (SPA) to Firebase Hosting with custom domains, SSL certificates, rewrites, and GitHub Actions CI/CD.
---

# Firebase Hosting & Deployment

Guidelines:
- Configure `firebase.json` with SPA rewrite rules (`"destination": "/index.html"`).
- Enable cache control headers for static assets (`Cache-Control: max-age=31536000`).
- Deploy via CLI: `firebase deploy --only hosting` or GitHub Actions workflow.
