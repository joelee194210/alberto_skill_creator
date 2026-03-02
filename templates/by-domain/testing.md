---
description: "{{DESCRIPTION}}"
---

# {{SKILL_DISPLAY_NAME}}

<objective>
{{DESCRIPTION}}

Testing skill for test creation, coverage analysis, and assertion patterns.
</objective>

<context>
- Skill: {{SKILL_NAME}}
- Domain: Testing
- Created: {{DATE}}
</context>

<framework-detection>
Detect testing context:
1. Check test framework (Jest, Vitest, Mocha, pytest, RSpec)
2. Check test runner and config
3. Check assertion style (expect, assert, should)
4. Check mocking approach (vi.mock, jest.mock, sinon)
5. Check E2E tools (Playwright, Cypress, Selenium)
6. Check coverage tool (c8, istanbul, coverage.py)
</framework-detection>

<process>
1. Detect testing framework and conventions
2. Parse `$ARGUMENTS` for the specific testing task
3. Execute based on task type:
   - **Generate tests**: Analyze source, create comprehensive test cases
   - **Fix tests**: Read failures, diagnose, propose fixes
   - **Coverage**: Run coverage, identify gaps, suggest tests
   - **Refactor tests**: Improve structure, reduce duplication
4. Run tests to verify (if test runner available)
5. Report results with pass/fail summary

Match the project's existing test style and patterns.
</process>

<test-patterns>
- Unit: Test individual functions/methods in isolation
- Integration: Test module interactions
- E2E: Test complete user workflows
- Snapshot: Compare output against stored references
- Property-based: Generate random inputs to find edge cases
</test-patterns>

<conventions>
- Follow existing test file naming (*.test.ts, *.spec.ts, test_*.py)
- Match existing describe/it/test block structure
- Use the project's preferred assertion style
- Follow AAA pattern: Arrange, Act, Assert
</conventions>
