---
name: dark-mode-theming
description: Architecting seamless dark/light theme switching, CSS custom properties, system preference syncing, and color contrast.
---

# Dark Mode & Dynamic Theming

Guidelines:
- Store theme tokens in CSS custom properties (`--bg-primary`, `--text-primary`).
- Sync theme preference with `prefers-color-scheme` media query.
- Use `color-scheme: dark light;` to adapt native form controls and scrollbars.
- Prevent layout flash on page load by reading stored theme preference synchronously in `<head>`.
