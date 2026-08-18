---
name: typescript-frontend
description: Advanced TypeScript patterns for frontend web applications including strict type safety, union types, generics, and utility types.
---

# TypeScript for Frontend

Guidelines:
- Enable strict mode (`"strict": true` in `tsconfig.json`).
- Avoid using `any`; use `unknown` or explicit generics (`<T>`) for generic handlers.
- Use discriminated union types for complex UI states (e.g. `type State = { status: 'loading' } | { status: 'success', data: Data }`).
- Derive types from data schemas using `z.infer<typeof schema>` or TypeScript type guards.
