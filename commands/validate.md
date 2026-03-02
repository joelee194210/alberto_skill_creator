---
description: "Validate skill structure, frontmatter, and quality"
---

# Validate Skill

<objective>
Run a comprehensive validation on a skill, checking structure, frontmatter, content quality, and providing a score from 0-100.
</objective>

<process>

1. Get skill name from `$ARGUMENTS`. If empty, list skills and ask which to validate.
   If `$ARGUMENTS` is "all", validate all registered skills.

2. Run validation:
```bash
node /Users/slacker/.claude/alberto-skills/bin/alberto-tools.cjs validate skill "<name>"
```

3. Present results:

   **Score: XX/100 (Grade: X)**

   Issues found:
   - Issue 1
   - Issue 2
   ...

4. For each issue, provide a specific fix suggestion:
   - "Missing frontmatter" → Add `---` block with description
   - "Unfilled placeholders" → Replace `{{X}}` with actual values
   - "Description too short" → Expand to at least 10 characters
   - "TODO markers" → Complete or remove TODO items

5. Offer to auto-fix simple issues (missing frontmatter, etc.)

6. If score >= 90: "Skill is ready for publishing!"
   If score < 60: "Skill needs significant improvements before use."

</process>
