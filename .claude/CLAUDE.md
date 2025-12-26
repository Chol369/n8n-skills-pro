# n8n-skills-pro Configuration

This file configures the n8n skills for Claude Code.

## Available Skills

### 01-workflow-architect
Strategic planning and tool selection for n8n automation projects.
- Decide between n8n, Python, or hybrid approaches
- Analyze business stack compatibility
- Production readiness assessment

**Triggers:** "should I use n8n or python", "plan workflow", "architecture", "design automation"

### 02-workflow-patterns
Proven architectural patterns for n8n workflows.
- Webhook processing
- HTTP API integration
- Database operations
- AI agent workflows
- Scheduled tasks

**Triggers:** "webhook pattern", "workflow pattern", "how to structure", "best practice"

### 03-node-configuration
Complete n8n node documentation and configuration guidance.
- 545+ nodes covered
- Operation-aware configuration
- Property dependencies
- Credential setup

**Triggers:** "configure node", "node settings", "how to use [node name]", "node parameters"

### 04-mcp-tools-expert
Master the n8n-mcp MCP server tools for workflow building.
- Tool selection guidance
- Parameter usage
- Validation profiles
- Template discovery

**Triggers:** "mcp tool", "search nodes", "validate workflow", "find template"

### 05-code-javascript
JavaScript Code node patterns and best practices.
- Data access ($json, $input, $node)
- Built-in helpers ($helpers.httpRequest)
- DateTime handling (Luxon)
- Return format requirements

**Triggers:** "javascript code", "code node js", "$json", "$helpers", "luxon"

### 06-code-python
Python Code node patterns INCLUDING external libraries.
- Standard library usage
- External libraries (pandas, numpy, requests)
- Task runner configuration
- Common patterns

**Triggers:** "python code", "code node python", "pandas", "numpy", "requests in n8n"

### 07-expression-syntax
n8n expression debugging and mastery.
- Core variables ($json, $node, $now, $env)
- Common mistakes
- Webhook data access ($json.body)
- Cross-node references

**Triggers:** "expression", "{{ }}", "$json", "expression not working", "access data"

### 08-validation-expert
Interpret and fix n8n validation errors.
- Error catalog
- Validation profiles
- False positive detection
- Pre-deployment checklist

**Triggers:** "validation error", "workflow error", "fix error", "not valid"

### 09-v2-migrations
n8n v2.0+ breaking changes and migration guides.
- Execute Sub-Workflow fixes
- Wait node patterns
- Expression changes
- Node versioning

**Triggers:** "v2.0", "migration", "breaking change", "out of date", "execute sub-workflow"

### 10-community-nodes
Community packages and custom node guidance.
- Popular packages
- AI tools integration
- Custom node development

**Triggers:** "community node", "custom node", "package", "install node"

## Skill Priority

When multiple skills match, use this priority:
1. **mcp-tools-expert** - When using MCP tools
2. **validation-expert** - When errors occur
3. **expression-syntax** - For expression issues
4. **code-javascript/python** - For Code node work
5. **workflow-patterns** - For architecture decisions
6. **node-configuration** - For specific node setup

## Community Fixes

See `community-fixes/` directory for workarounds:
- Python external libraries setup
- Execute Sub-Workflow v2.0 fix
- Self-hosted deployment tips

## Updates

This skill set is updated weekly to sync with n8n releases.
Check `changelog/` for version-specific changes.
