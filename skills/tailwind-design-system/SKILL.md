---
name: tailwind-design-system
description: Guide for creating scalable design systems using Tailwind CSS tokens, theme extensions, custom color palettes, utility classes, and CVA / clsx helpers.
---

# Tailwind CSS Design System

Instructions for building design systems with Tailwind CSS:
- Define core tokens (colors, typography, spacing, border-radii) inside `tailwind.config.js`.
- Combine `clsx` and `tailwind-merge` (`cn()` helper) for dynamic class overrides.
- Use `cva` (Class Variance Authority) for component variants (buttons, badges, inputs).
- Avoid arbitrary values (`w-[347px]`) when standard utility tokens exist.
- Group responsive and pseudo-class utilities cleanly (`hover:`, `focus-visible:`, `dark:`).
