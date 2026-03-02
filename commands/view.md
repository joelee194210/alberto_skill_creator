---
description: "View detailed information about a skill"
---

# View Skill Details

<objective>
Display complete information about a registered skill, including its content, metadata, and validation status.
</objective>

<process>

1. Get the skill name from `$ARGUMENTS`. If empty, list all skills first:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill list
```
Then ask the user which skill to view.

2. Fetch skill details:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill view "<name>"
```

3. Present the information clearly:
   - **Name** and description
   - **Type** and template used
   - **Created/Modified** dates
   - **Validation** status and score
   - **Files** in the skill directory
   - **Content** of the main skill file (formatted)

</process>
