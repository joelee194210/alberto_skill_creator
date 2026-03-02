---
description: "Create a new skill from a template with interactive setup"
---

# Create New Skill

<objective>
Create a new Claude Code skill interactively, selecting the best template and customizing it for the user's needs.
</objective>

<process>

## Step 1: Gather Information

If `$ARGUMENTS` is empty, use AskUserQuestion to ask:

1. **Skill name**: What should the skill be called?
2. **Template type**: Which template to use?
   - Options: simple-command, multi-step-workflow, orchestrator, api-integration
   - Or domain: web-dev, devops, data-science, testing, documentation
3. **Description**: Brief description of what the skill does

If `$ARGUMENTS` contains a name, use it directly and ask only for missing info.

## Step 2: Check Available Templates

```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs template list
```

## Step 3: Create the Skill

```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill create "<name>" --type "<type>" --template "<template>" --description "<description>"
```

## Step 4: Customize

Read the generated skill file and offer to customize:
- Adjust the objective and process sections
- Add specific instructions relevant to the user's use case
- Remove placeholder sections that don't apply

## Step 5: Validate

```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs validate skill "<name>"
```

## Step 6: Report

Present:
- Skill location and file path
- How to use it: `/alberto_skills:test <name>` to test
- Validation score
- Next steps (customize, test, publish)

</process>
