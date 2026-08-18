---
name: responsive-design
description: Mobile-first responsive layout strategies, flexbox, CSS grid breakpoints, touch targets, and viewport adaptability.
---

# Responsive Design & Mobile-First Architecture

Layout guidelines:
- Design mobile-first using min-width breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).
- Ensure touch targets are at least 44x44px for mobile devices.
- Prevent horizontal scroll overflow with `overflow-x-hidden` and fluid container padding.
- Adapt multi-column grids to single column on mobile screens (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
- Use fluid typography and scalable units.
