---
name: forms-validation-zod
description: Form handling best practices using React Hook Form, Zod schema validation, accessible error messages, and async submission handling.
---

# Form Architecture & Zod Validation

Guidelines:
- Integrate `react-hook-form` with `@hookform/resolvers/zod` for zero-re-render form performance.
- Define type-safe input schemas using `z.object({...})`.
- Display accessible inline validation error messages with proper ARIA alert associations (`aria-invalid`, `aria-errormessage`).
- Disable submit buttons during pending async form submissions with loading spinners.
