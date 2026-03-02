---
description: "Install a skill from a .skill package file"
---

# Install Skill

<objective>
Install a skill from a .skill package file into the Alberto Skills workspace.
</objective>

<process>

1. Get file path from `$ARGUMENTS`. If empty, check the exports directory:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs backup list
```
And list any .skill files in `~/.claude/alberto-skills/exports/`.

2. Verify the file exists and is a valid .skill package.

3. Install the skill:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs install "<filepath>"
```

4. Validate the installed skill:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs validate skill "<name>"
```

5. Report:
   - Installed skill name
   - Location in workspace
   - Validation score
   - Ready to use

</process>
