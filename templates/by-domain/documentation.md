---
description: "{{DESCRIPTION}}"
---

# {{SKILL_DISPLAY_NAME}}

<objective>
{{DESCRIPTION}}

Documentation skill for JSDoc, README generation, API docs, and changelogs.
</objective>

<context>
- Skill: {{SKILL_NAME}}
- Domain: Documentation
- Created: {{DATE}}
</context>

<doc-detection>
Detect documentation context:
1. Check existing docs (README, docs/, wiki/)
2. Check doc tools (JSDoc, TypeDoc, Sphinx, MkDocs)
3. Check inline doc style (JSDoc, docstrings, XML comments)
4. Check changelog format (CHANGELOG.md, conventional commits)
5. Check API doc format (OpenAPI/Swagger, GraphQL schema)
</doc-detection>

<process>
1. Detect existing documentation patterns and tools
2. Parse `$ARGUMENTS` for the specific documentation task
3. Execute based on task type:
   - **Generate**: Create docs from code analysis
   - **Update**: Refresh existing docs to match current code
   - **Audit**: Check docs completeness and accuracy
   - **Format**: Standardize doc formatting
4. Validate generated documentation
5. Present summary of changes

Always match the project's existing documentation style.
</process>

<doc-types>
- **README**: Project overview, setup, usage, contributing
- **API docs**: Endpoints, parameters, responses, examples
- **JSDoc/Docstrings**: Function signatures, params, returns, examples
- **Changelog**: Version history, breaking changes, migrations
- **Architecture**: System design, data flow, decisions
</doc-types>

<quality-checks>
- All public APIs documented
- Examples are runnable and correct
- Links are valid and not broken
- Code samples match current API
- No outdated information
</quality-checks>
