---
description: "Package a skill as a distributable .skill file"
---

# Publish Skill

<objective>
Package a skill as a portable .skill file that can be shared and installed on other machines.
</objective>

<process>

1. Get skill name from `$ARGUMENTS`. If empty, list skills and ask which to publish.

2. Validate before publishing:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs validate skill "<name>"
```
If score < 60, warn the user and suggest fixing issues first.

3. Package the skill:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs publish "<name>"
```

4. Report:
   - Export path: `~/.claude/alberto-skills/exports/<name>.skill`
   - Package size
   - Included files
   - How to install on another machine:
     ```
     node ~/.claude/alberto-skills/bin/alberto-tools.cjs install path/to/<name>.skill
     ```

</process>
