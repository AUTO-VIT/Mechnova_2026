---
name: pwa-service-worker
description: Progressive Web App standards including manifest configuration, Service Worker caching strategies, offline capability, and push notifications.
---

# Progressive Web Apps & Service Workers

Guidelines:
- Configure web app manifest (`manifest.json`) with icons, start URL, theme color, and display mode.
- Use Workbox for offline asset caching (Stale-While-Revalidate for static assets, Network-First for API requests).
- Implement background sync and offline fallback pages.
