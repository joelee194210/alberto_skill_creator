---
description: "{{DESCRIPTION}}"
---

# {{SKILL_DISPLAY_NAME}}

<objective>
{{DESCRIPTION}}

Execute a multi-step workflow with clear stages, context preservation, and artifact generation.
</objective>

<context>
- Skill: {{SKILL_NAME}}
- Type: Multi-Step Workflow
- Created: {{DATE}}
</context>

<workflow>

## Stage 1: Discovery
- Gather context about the current state
- Read relevant files and configurations
- Identify constraints and requirements

## Stage 2: Analysis
- Process gathered information
- Identify patterns, issues, or opportunities
- Formulate approach based on findings

## Stage 3: Execution
- Implement the planned changes
- Create or modify artifacts as needed
- Track progress through each step

## Stage 4: Verification
- Validate all changes are correct
- Run relevant checks or tests
- Ensure no regressions were introduced

## Stage 5: Report
- Summarize what was done
- List all artifacts created/modified
- Highlight any follow-up actions needed

</workflow>

<process>
1. Begin with Stage 1 — read `$ARGUMENTS` and gather context
2. Progress through each stage sequentially
3. If any stage fails, report the issue and ask the user how to proceed
4. After Stage 5, present a complete summary

Use TaskCreate to track progress across stages for complex executions.
</process>

<error-handling>
- If a stage fails, do not proceed to the next stage
- Create a backup before destructive operations
- Always report partial progress if interrupted
</error-handling>
