---
description: "Rename an existing skill"
---

# Rename Skill

<objective>
Safely rename a skill, updating all references in the registry and filesystem.
</objective>

<process>

1. Parse `$ARGUMENTS` for old name and new name.
   - Expected format: `old-name new-name`
   - If incomplete, list skills and ask for both names

2. Show current skill details:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill view "<old-name>"
```

3. Confirm the rename with the user.

4. Execute rename:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill rename "<old-name>" "<new-name>"
```

5. Report the result: old path, new path, updated registry entry.

</process>
