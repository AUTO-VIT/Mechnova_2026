---
name: canvas-webgl-threejs
description: Guidelines for interactive 2D Canvas rendering, WebGL graphics, and 3D scenes using Three.js / React Three Fiber.
---

# Canvas, WebGL & Three.js Graphics

Guidelines:
- Use HTML5 Canvas context (`requestAnimationFrame`) for high-performance 2D particle/grid effects.
- Use React Three Fiber (`@react-three/fiber`) for declarative 3D mesh and lighting components.
- Optimize render loops by disposing geometries and textures when components unmount.
- Provide a fallback static graphic for low-power or mobile devices.
