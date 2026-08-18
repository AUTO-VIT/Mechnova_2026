---
name: nextjs-app-router
description: Patterns for Next.js App Router including Server Components, Client Components, Server Actions, Dynamic Routes, and Layouts.
---

# Next.js App Router Patterns

Guidelines for Next.js development:
- Default to React Server Components (RSC) for data fetching and layout rendering.
- Mark interactive components explicitly with `'use client'`.
- Use Server Actions for secure form mutations and database updates.
- Leverage nested `layout.js`, `loading.js`, `error.js`, and `not-found.js` conventions.
- Implement incremental static regeneration (ISR) and proper cache tags.
