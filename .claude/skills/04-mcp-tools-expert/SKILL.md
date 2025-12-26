# n8n MCP Tools Expert

> **Master the n8n-mcp server tools for efficient workflow building**

## Overview

The n8n-mcp MCP server provides 15+ tools for searching nodes, validating workflows, and managing n8n instances. This skill teaches correct tool selection and usage.

---

## Tool Categories

### 1. Node Discovery

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `search_nodes` | Find nodes by keyword | "Find slack nodes" |
| `get_node` | Get node details | Need full schema |
| `search_templates` | Find workflow templates | Need examples |
| `get_template` | Get template details | Import a template |

### 2. Workflow Management

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `n8n_create_workflow` | Create new workflow | Building from scratch |
| `n8n_get_workflow` | Get workflow by ID | Inspect existing |
| `n8n_update_partial_workflow` | Incremental updates | Add/remove nodes |
| `n8n_update_full_workflow` | Complete replacement | Major changes |
| `n8n_list_workflows` | List all workflows | Overview |
| `n8n_delete_workflow` | Delete workflow | Cleanup |

### 3. Validation

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `validate_workflow` | Full validation | Before deploy |
| `validate_node` | Single node check | Node configuration |
| `n8n_validate_workflow` | Validate by ID | Existing workflow |
| `n8n_autofix_workflow` | Auto-fix issues | Quick fixes |

### 4. Execution

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `n8n_test_workflow` | Trigger workflow | Test webhook/chat |
| `n8n_executions` | Execution history | Debug/monitor |
| `n8n_health_check` | Check n8n status | Connectivity |

---

## Node Type Formats

### CRITICAL: Use Correct Format

**For search_nodes:**
```
nodes-base.slack          ✓ Correct
n8n-nodes-base.slack      ✗ Wrong
```

**For get_node:**
```
nodes-base.slack          ✓ Correct
n8n-nodes-base.slack      ✗ Wrong
```

**For workflow JSON (typeVersion):**
```json
{
  "type": "n8n-nodes-base.slack",   // Full prefix in workflow
  "typeVersion": 2
}
```

### Node Type Patterns

| Package | Search Format | Workflow Format |
|---------|---------------|-----------------|
| Core nodes | `nodes-base.httpRequest` | `n8n-nodes-base.httpRequest` |
| AI nodes | `nodes-langchain.agent` | `@n8n/n8n-nodes-langchain.agent` |

---

## Search Nodes

### Basic Search

```
Tool: search_nodes
Query: "slack"
```

Returns matching nodes with:
- Node type
- Display name
- Description
- Operations available

### Search then Get Examples

```
1. search_nodes with query: "http request"
2. get_node with nodeType + includeExamples: true
```

First search, then use `get_node` with `includeExamples: true` for real configurations.

### Search Modes

| Mode | Purpose |
|------|---------|
| `OR` (default) | Any word matches |
| `AND` | All words must match |
| `FUZZY` | Typo-tolerant |

---

## Get Node Details

### Standard Detail

```
Tool: get_node
nodeType: "nodes-base.slack"
detail: "standard"
```

Returns:
- Essential properties (10-20)
- Operations
- Required fields

### Full Detail

```
Tool: get_node
nodeType: "nodes-base.slack"
detail: "full"
```

Returns complete schema with all properties.

### With Examples

```
Tool: get_node
nodeType: "nodes-base.httpRequest"
includeExamples: true
```

Returns node info + real template configurations.

---

## Validation Profiles

### Profile Comparison

| Profile | Strictness | Use Case |
|---------|------------|----------|
| `minimal` | Lowest | Quick check, required fields only |
| `runtime` | Medium | Pre-execution validation |
| `ai-friendly` | Medium-High | AI-generated workflows |
| `strict` | Highest | Production deployment |

### When to Use Each

**minimal:** Initial drafts, exploring options
```
validate_node with profile: "minimal"
```

**runtime:** Before testing workflow
```
validate_workflow with profile: "runtime"
```

**ai-friendly:** After AI generates workflow
```
validate_workflow with profile: "ai-friendly"
```

**strict:** Production deployment
```
validate_workflow with profile: "strict"
```

---

## Workflow Validation

### Validate JSON

```
Tool: validate_workflow
workflow: { ... workflow JSON ... }
options: {
  profile: "ai-friendly",
  validateConnections: true,
  validateExpressions: true,
  validateNodes: true
}
```

### Validate by ID

```
Tool: n8n_validate_workflow
id: "workflow-id-here"
```

### Auto-fix Issues

```
Tool: n8n_autofix_workflow
id: "workflow-id-here"
applyFixes: true
fixTypes: ["expression-format", "typeversion-correction"]
```

---

## Creating Workflows

### Basic Creation

```
Tool: n8n_create_workflow
name: "My Workflow"
nodes: [
  {
    "id": "trigger",
    "name": "Webhook",
    "type": "n8n-nodes-base.webhook",
    "typeVersion": 2,
    "position": [250, 300],
    "parameters": {
      "path": "my-webhook",
      "httpMethod": "POST"
    }
  }
]
connections: {}
```

### With Connections

```
Tool: n8n_create_workflow
nodes: [
  { "id": "node1", ... },
  { "id": "node2", ... }
]
connections: {
  "node1": {
    "main": [[{ "node": "node2", "type": "main", "index": 0 }]]
  }
}
```

---

## Template Search

### By Keyword

```
Tool: search_templates
searchMode: "keyword"
query: "slack notification"
limit: 10
```

### By Nodes Used

```
Tool: search_templates
searchMode: "by_nodes"
nodeTypes: ["n8n-nodes-base.slack", "n8n-nodes-base.webhook"]
```

### By Task Type

```
Tool: search_templates
searchMode: "by_task"
task: "webhook_processing"
```

Available tasks:
- `ai_automation`
- `data_sync`
- `webhook_processing`
- `email_automation`
- `slack_integration`
- `api_integration`

---

## Common Tool Sequences

### Build New Workflow

1. `search_nodes` - Find nodes needed
2. `get_node` (with examples) - Get configurations
3. `search_templates` - Find similar workflows
4. `n8n_create_workflow` - Create workflow
5. `validate_workflow` - Check for issues
6. `n8n_autofix_workflow` - Fix if needed

### Debug Existing Workflow

1. `n8n_get_workflow` - Get workflow details
2. `n8n_validate_workflow` - Check for issues
3. `n8n_executions` - View execution history
4. `n8n_autofix_workflow` - Apply fixes

### Explore Node Options

1. `search_nodes` - Find candidates
2. `get_node` (standard) - Compare options
3. `get_node` (with examples) - See real usage

---

## Best Practices

1. **Start with search_nodes** before get_node
2. **Use includeExamples** for real configurations
3. **Validate incrementally** during development
4. **Use ai-friendly profile** for AI-generated workflows
5. **Check n8n_health_check** if operations fail

---

## Error Handling

### Node Not Found

```
Error: Node type not found
```
Fix: Check node type format (nodes-base.X not n8n-nodes-base.X)

### Validation Failed

```
Error: Workflow validation failed
```
Fix: Run n8n_autofix_workflow or check specific errors

### Connection Refused

```
Error: Cannot connect to n8n
```
Fix: Run n8n_health_check, verify API credentials

---

*For workflow patterns and architecture decisions, see 02-workflow-patterns skill.*
