---
name: design-system
description: Guidelines and constraints for adhering to a project's binding design system, visual style, CSS tokens, and components.
---

# Design System

This project has a binding design system for visual style — every visual follows it. Don't invent colors, type, spacing, or components not grounded in it.

- The system's guide may describe example products/brands unrelated to this project — never treat its content as fact about this project's subject.
- Before building: explore `/projects/<design-system-id>/`, read its README/base.md, and copy out the fonts, colors, and any relevant components/mocks you need into this project.
- CSS tokens: look up exact `--*` names in the system's `.css` files before using `var(--*)` — never guess a token name.
- If the system has existing mocks of similar products, fork them as your starting point.
