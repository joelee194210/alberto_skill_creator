---
description: "Restore skills from a backup file"
---

# Restore from Backup

<objective>
Restore the Alberto Skills workspace from a previously created backup. Creates a safety backup before restoring.
</objective>

<process>

1. If `$ARGUMENTS` is empty, list available backups:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs backup list
```
Ask the user which backup to restore.

2. Confirm with the user: "This will restore from '<backup>'. A pre-restore backup will be created first."

3. Execute restore:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs backup restore "<filename>"
```

4. Verify the restore by listing skills:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill list
```

5. Report:
   - Restored from: backup name
   - Pre-restore backup location (safety net)
   - Current skill count after restore

</process>
