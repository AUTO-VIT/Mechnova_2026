---
name: framer-motion-master
description: Techniques for fluid React animations, page transitions, layout animations, gesture controls, and spring physics using Framer Motion.
---

# Framer Motion Masterclass

Guidelines for animation design:
- Use `motion.div` for declarative animations with `initial`, `animate`, and `exit` props.
- Wrap dynamic lists in `<AnimatePresence>` for smooth enter/exit transitions.
- Use `layoutId` for magic move layout transitions between components.
- Leverage spring transitions (`type: 'spring', stiffness: 300, damping: 25`) for organic feel.
