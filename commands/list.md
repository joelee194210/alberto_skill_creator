---
description: "List all registered skills with their status"
---

# List Skills

<objective>
Display all registered skills in a clear table format with key metadata.
</objective>

<process>

1. Fetch the skill list:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill list
```

2. Present as a formatted table:

| Name | Description | Type | Created | Score |
|------|-------------|------|---------|-------|

3. Include summary statistics:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs registry stats
```

4. If no skills exist, suggest creating one with `/alberto_skills:new`

</process>
