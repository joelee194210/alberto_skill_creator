---
description: "{{DESCRIPTION}}"
---

# {{SKILL_DISPLAY_NAME}}

<objective>
{{DESCRIPTION}}

DevOps skill for Docker, CI/CD, cloud CLI, and deployment workflows.
</objective>

<context>
- Skill: {{SKILL_NAME}}
- Domain: DevOps
- Created: {{DATE}}
</context>

<environment-detection>
Detect the infrastructure context:
1. Check for Docker (Dockerfile, docker-compose.yml)
2. Check CI/CD (GitHub Actions, GitLab CI, Jenkins)
3. Check cloud provider (AWS CLI, gcloud, az)
4. Check IaC (Terraform, Pulumi, CloudFormation)
5. Check container orchestration (Kubernetes, ECS)
</environment-detection>

<process>
1. Detect infrastructure context using Glob and Read
2. Parse `$ARGUMENTS` for the specific DevOps task
3. Execute with appropriate safety measures:
   - Preview changes before applying (dry-run when available)
   - Validate configurations before deploying
   - Use non-destructive operations by default
4. Report results with clear status indicators

IMPORTANT: Always prefer dry-run/preview modes first. Ask for confirmation before destructive operations.
</process>

<safety>
- Never run destructive commands without user confirmation
- Always validate YAML/JSON configs before applying
- Use --dry-run flags when available
- Back up configurations before modifying
- Check for sensitive data in configs (secrets, keys)
</safety>

<common-tasks>
- Docker: build, compose up/down, image management
- CI/CD: pipeline config, workflow debugging
- Cloud: resource provisioning, status checks
- K8s: deployment, scaling, troubleshooting
</common-tasks>
