---
description: "Create or manage backups of all skills"
---

# Backup Management

<objective>
Create, list, or manage backups of the entire Alberto Skills workspace.
</objective>

<process>

Parse `$ARGUMENTS` to determine the action:

## If "list" or empty:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs backup list
```
Display backups in a table with name, size, and date.

## If "create" or a label:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs backup create "<label>"
```
Report the backup path and size.

## If a specific backup filename:
Show details about that backup and offer to restore it.

Present results clearly with:
- Backup file location
- Size
- Number of skills backed up
- How to restore: `/alberto_skills:restore <filename>`

</process>
