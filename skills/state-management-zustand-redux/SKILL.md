---
name: state-management-zustand-redux
description: State management architectures for complex web applications using Zustand, Redux Toolkit, React Context, and TanStack Query.
---

# Front-End State Management

Architecture rules for managing application state:
- Separate UI component state (modal open/closed) from domain state (user, cart, team).
- Use Zustand or React Context for simple, lightweight global state.
- Use TanStack Query (React Query) for server state caching, invalidation, and background updates.
- Keep state mutations predictable and immutable.
- Avoid prop drilling deeper than 2 levels.
