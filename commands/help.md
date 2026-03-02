---
description: "Show Alberto Skills command reference and usage guide"
---

# Alberto Skills — Help

<objective>
Display the complete command reference for Alberto Skills.
</objective>

<process>

Present the following reference:

## Available Commands

| Command | Description |
|---------|-------------|
| `/alberto_skills:new [name]` | Create a new skill from a template |
| `/alberto_skills:view [name]` | View detailed skill information |
| `/alberto_skills:list` | List all registered skills |
| `/alberto_skills:rename [old new]` | Rename a skill |
| `/alberto_skills:delete [name]` | Delete a skill (with auto-backup) |
| `/alberto_skills:backup [action]` | Create/list/manage backups |
| `/alberto_skills:restore [file]` | Restore from a backup |
| `/alberto_skills:test [name]` | Test a skill with a sample prompt |
| `/alberto_skills:validate [name]` | Validate skill structure (score 0-100) |
| `/alberto_skills:publish [name]` | Package as distributable .skill file |
| `/alberto_skills:install [file]` | Install a .skill package |
| `/alberto_skills:help` | This help page |

## Quick Start

1. **Create**: `/alberto_skills:new my-awesome-skill`
2. **Customize**: Edit the generated file in `~/.claude/alberto-skills/workspace/my-awesome-skill/`
3. **Validate**: `/alberto_skills:validate my-awesome-skill`
4. **Test**: `/alberto_skills:test my-awesome-skill`
5. **Share**: `/alberto_skills:publish my-awesome-skill`

## Template Types

**By type:** simple-command, multi-step-workflow, orchestrator, api-integration
**By domain:** web-dev, devops, data-science, testing, documentation

## Directory Structure

```
~/.claude/alberto-skills/
├── bin/alberto-tools.cjs    # Core tool
├── templates/               # Skill templates
├── workspace/               # Your skills
├── backups/                 # Automatic backups
└── exports/                 # Published .skill files
```

## System Info
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs version
```

</process>
