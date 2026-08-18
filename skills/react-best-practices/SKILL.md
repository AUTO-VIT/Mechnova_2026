---
name: react-best-practices
description: Best practices for React 18+ development including component architecture, custom hooks, React.memo, useCallback, useMemo, and clean JSX structures.
---

# React Best Practices

Guidelines for writing production-grade React components:
- Keep components small, modular, and single-responsibility.
- Use custom hooks to decouple business logic from UI rendering.
- Maintain immutable state mutations; avoid mutating state objects directly.
- Optimize re-renders with `useCallback` and `useMemo` for heavy computations.
- Utilize React Suspense and `lazy()` for dynamic component code-splitting.
- Enforce clean JSX without complex inline nested ternary operators.
