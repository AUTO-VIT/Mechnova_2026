---
name: micro-interactions
description: Standards for micro-animations, active feedback states, hover transforms, spring physics, and fluid transition design.
---

# Micro-Interactions & Animation Polish

Guidelines for UI micro-interactions:
- Provide immediate visual feedback on user actions (button clicks, form submits, copy actions).
- Use subtle scale transforms on click (`active:scale-[0.98]`).
- Use CSS cubic-bezier transitions (`transition-all duration-200 cubic-bezier(0.16, 1, 0.3, 1)`).
- Add glowing focus rings and subtle hover translations (`hover:-translate-y-0.5`).
- Ensure animations respect `prefers-reduced-motion` settings.
