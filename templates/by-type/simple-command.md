---
description: "{{DESCRIPTION}}"
---

# {{SKILL_DISPLAY_NAME}}

<objective>
{{DESCRIPTION}}

Execute a single, focused command that delivers immediate value.
</objective>

<context>
- Skill: {{SKILL_NAME}}
- Type: Simple Command
- Created: {{DATE}}
</context>

<process>
1. Parse and validate the user's input: `$ARGUMENTS`
2. Execute the core action
3. Format and present results clearly

If the input is unclear, use AskUserQuestion to clarify before proceeding.
</process>

<output-format>
Present results in a clean, structured format:
- Use headers for sections
- Use code blocks for technical output
- Summarize key findings at the top
</output-format>
