---
description: "{{DESCRIPTION}}"
---

# {{SKILL_DISPLAY_NAME}}

<objective>
{{DESCRIPTION}}

Orchestrate complex tasks by coordinating multiple subagents via the Agent tool.
</objective>

<context>
- Skill: {{SKILL_NAME}}
- Type: Orchestrator
- Created: {{DATE}}
</context>

<orchestration-strategy>

## Phase 1: Planning
- Analyze the task and break it into independent subtasks
- Identify dependencies between subtasks
- Determine which can run in parallel

## Phase 2: Delegation
- Launch subagents for independent tasks using the Agent tool
- Use `run_in_background: true` for parallel execution where possible
- Provide each agent with clear, self-contained instructions

## Phase 3: Coordination
- Collect results from all subagents
- Resolve any conflicts or inconsistencies
- Handle failures gracefully — retry or escalate

## Phase 4: Synthesis
- Combine results into a coherent output
- Validate the combined result
- Present unified findings to the user

</orchestration-strategy>

<process>
1. Parse `$ARGUMENTS` and determine the scope of work
2. Create a task list using TaskCreate for tracking
3. Launch subagents for parallelizable work:
   - Use `subagent_type: "general-purpose"` for research tasks
   - Use `subagent_type: "Explore"` for codebase exploration
4. Collect and synthesize results
5. Report combined findings with clear attribution

IMPORTANT: Maximize parallel execution. Launch independent agents simultaneously.
</process>

<agent-templates>
Research agent prompt: "Investigate [topic]. Return: findings, sources, confidence level."
Explore agent prompt: "Find all [pattern] in the codebase. Return: file paths, line numbers, context."
</agent-templates>
