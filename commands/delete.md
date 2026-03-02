---
description: "Delete a skill with automatic backup"
---

# Delete Skill

<objective>
Safely delete a skill. Always creates an automatic backup before removal so it can be restored later.
</objective>

<process>

1. Get skill name from `$ARGUMENTS`. If empty, list skills and ask which to delete.

2. Show skill details before deletion:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill view "<name>"
```

3. Confirm with the user: "Are you sure you want to delete '<name>'? A backup will be created automatically."

4. Execute deletion (includes auto-backup):
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill delete "<name>"
```

5. Report:
   - Skill deleted
   - Backup location (can be restored with `/alberto_skills:restore`)
   - Updated skill count

</process>
