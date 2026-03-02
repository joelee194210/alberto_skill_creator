---
description: "{{DESCRIPTION}}"
---

# {{SKILL_DISPLAY_NAME}}

<objective>
{{DESCRIPTION}}

Integrate with external APIs or MCP servers to extend Claude Code's capabilities.
</objective>

<context>
- Skill: {{SKILL_NAME}}
- Type: API Integration
- Created: {{DATE}}
</context>

<api-config>
- Endpoint: [Define the API endpoint or MCP server]
- Authentication: [Describe auth method — API key, token, etc.]
- Rate limits: [Note any rate limiting considerations]
</api-config>

<process>
1. Validate prerequisites:
   - Check that required environment variables or credentials are available
   - Verify network connectivity if needed
2. Parse `$ARGUMENTS` for API parameters
3. Construct and execute the API call:
   - Use WebFetch for HTTP APIs
   - Use MCP tools for MCP server integrations
   - Use Bash with curl for complex requests
4. Parse and validate the response
5. Transform the response into a useful format
6. Present results to the user

If credentials are missing, guide the user through setup.
</process>

<error-handling>
- **401/403**: Credential issue — guide user to check auth config
- **404**: Resource not found — verify endpoint and parameters
- **429**: Rate limited — inform user and suggest retry timing
- **500+**: Server error — report and suggest retry
- **Network error**: Check connectivity, suggest alternatives
</error-handling>

<output-format>
- Raw response (if requested with --raw)
- Formatted summary (default)
- Structured data for downstream processing
</output-format>
