---
description: "Test a skill with a sample prompt"
---

# Test Skill

<objective>
Test a skill by reading its content and executing it against a sample prompt using a subagent.
</objective>

<process>

1. Get skill name from `$ARGUMENTS`. If empty, list skills and ask which to test.

2. Fetch skill content:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs skill view "<name>"
```

3. Ask the user for a test prompt if not provided:
   "What prompt should I test this skill with?"

4. Launch a test agent using the Agent tool:
   - subagent_type: "general-purpose"
   - prompt: Include the skill's content as instructions, then apply it to the test prompt
   - This simulates how the skill would work when invoked as a real command

5. Report test results:
   - Did the skill execute successfully?
   - Was the output format correct?
   - Any errors or issues encountered?
   - Suggestions for improvement

6. Optionally validate after testing:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs validate skill "<name>"
```

</process>
