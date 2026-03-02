---
description: "{{DESCRIPTION}}"
---

# {{SKILL_DISPLAY_NAME}}

<objective>
{{DESCRIPTION}}

Web development skill with framework detection, component scaffolding, and style management.
</objective>

<context>
- Skill: {{SKILL_NAME}}
- Domain: Web Development
- Created: {{DATE}}
</context>

<framework-detection>
Before executing, detect the project's tech stack:
1. Check package.json for framework (React, Vue, Svelte, Next.js, Astro, etc.)
2. Check for TypeScript (tsconfig.json)
3. Check CSS approach (Tailwind, CSS Modules, styled-components, etc.)
4. Check build tool (Vite, Webpack, Turbopack, etc.)
5. Check testing framework (Vitest, Jest, Playwright, etc.)
</framework-detection>

<process>
1. Detect project framework and conventions using Glob and Read
2. Parse `$ARGUMENTS` for the specific web dev task
3. Follow the project's existing patterns:
   - Match file naming conventions
   - Use the same import style
   - Follow component structure patterns
   - Apply existing CSS methodology
4. Implement the requested changes
5. Verify with build/lint if available

Adapt all code generation to match the detected framework and conventions.
</process>

<conventions>
- Always detect before generating — never assume a framework
- Use the project's preferred package manager (npm/yarn/pnpm/bun)
- Follow existing directory structure for new files
- Match TypeScript strictness level of existing code
</conventions>
