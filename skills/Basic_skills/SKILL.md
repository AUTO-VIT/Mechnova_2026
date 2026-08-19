---
name: Basic_skills
description: General behavioral guidelines and rules for workspace tasks, planning, user queries, simplicity, scope management, goal verification, and essential skill activation.
---
# Basic Skills

This skill defines the core behavioral guidelines for all operations in the workspace.

## Rules

### Rule 1: Planning and Approval
- **Always plan before modifying any files.**
- Use Claude model / planning capabilities to build a structured plan artifact.
- Create a plan as an **artifact** explaining the proposed changes, task complexity, and execution strategy.
- **Get explicit approval from the user** on the plan (using the artifact feedback flow with RequestFeedback set to true) before starting any modification or coding work.

### Rule 2: No Assumptions
- **Make no assumptions.**
- If any requirement, design decision, or detail is ambiguous, ask the user your queries directly to clarify before proceeding.

### Rule 3: Simplicity Over Over-engineering
- **Keep the project simple.**
- Avoid unwanted future-proofing, complex abstractions, or adding unrequested features/libraries.

### Rule 4: Minimize Scope and Contained Edits
- **Do not make changes to adjacent files.**
- Keep edits localized to only the files directly required for the task. Do not touch or refactor unrelated files unless explicitly instructed.

### Rule 5: Goal Definition and Verification
- **Define clear goals** at the very beginning of the task.
- **Verify all goals are fully met** and tested before declaring the work complete.

### Rule 6: Essential Skill & Subagent Execution
- Once the plan artifact is approved, run the Skill Finder (`python C:\Users\teash\.gemini\config\skills\Essential_Skill\scripts\find_skills.py`), activate all matched domain skills from the start, choose the appropriate Gemini model tier based on task complexity, and always execute work using Gemini subagents.
