---
name: web-performance-optimization
description: Strategies for optimizing Web Vitals (LCP, INP, CLS), code-splitting, asset compression, lazy loading, and critical rendering path.
---

# Web Performance Optimization

Performance guidelines:
- Optimize Core Web Vitals: LCP (<2.5s), INP (<200ms), CLS (<0.1).
- Implement image optimization (WebP/AVIF formats, explicit `width`/`height` to avoid layout shifts).
- Use dynamic imports and route-level code-splitting to minimize bundle size.
- Preconnect to key origins and preload critical fonts.
- Defer non-critical third-party scripts.
