---
name: design-components
description: Specifications for building streaming single-file Design Components (Name.dc.html) with inline styles, Component logic classes, and props metadata.
---

# Design Components

Every design is a single streaming `Name.dc.html` file that opens directly in a browser and can be imported by other DCs.

## Authoring a DC
Three pieces assembled into the full file:
1. **Template** — markup between `<x-dc>` and `</x-dc>`. No `<x-dc>` tags, no document wrapper, no `<script>` blocks.
2. **Logic class** — `class Component extends DCLogic { ... }`. Plain JS, no TypeScript/import/export. Provides `renderVals()` returning flat values/handlers for the template.
3. **Props metadata** (optional) — `data-props` JSON: `$preview` sets preview size; per-prop entries (`editor`, `default`, `tsType`, etc.) make props tweakable/embeddable.

## Templates
- Holes are dotted lookups only (`{{ user.name }}`) — never expressions.
- Control flow: `<sc-for list as>` / `<sc-if value>` with `hint-*` placeholder attrs.
- Child DCs: `<dc-import name="Card" hint-size="100%,120px">`.
- External React/JS: `<x-import component="X" from="./X.jsx" hint-size="...">`.
- Styling is **inline only** — no stylesheets/classes. Pseudo-states via `style-hover`, etc. `<helmet><style>` only for `@font-face`, `@keyframes`, resets.
- Animations: build via `React.createElement` in `renderVals()`, not inline `animation:`.

## Logic (`c_dc_js`)
```js
class Component extends DCLogic {
  state = { n: 0 };
  renderVals() {
    return { n: this.state.n, inc: () => this.setState(s => ({ n: s.n + 1 })) };
  }
}
```

## Rules
- One DC by default; only split into child DCs for real reuse (≥4 repeats) with props/state.
- No document scaffolding, no class-based CSS, no JS inside template holes, no UI layout via bare `React.createElement`.
- This is the only accepted output format for frontend work in this project — no raw `.html`/`.jsx` pages.
