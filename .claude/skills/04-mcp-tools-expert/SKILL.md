# n8n MCP Tools Expert

> **Master the n8n-mcp server tools AND build MCP servers/clients with n8n nodes**

## Overview

This skill covers two interconnected domains:
1. **n8n-mcp MCP Server** - External tools for AI assistants to build n8n workflows (20+ tools)
2. **n8n MCP Nodes** - Native n8n nodes for creating MCP servers and consuming MCP tools

---

## Part 1: n8n-mcp MCP Server Tools

### Tool Categories (20+ Tools)

#### System & Documentation
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `tools_documentation` | Get docs for any MCP tool | START HERE - understand available capabilities |
| `n8n_health_check` | Check n8n instance health | Before operations, troubleshooting |

#### Node Discovery
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `search_nodes` | Full-text search across 1,084 nodes | "Find slack nodes", explore options |
| `get_node` | Unified node info with multiple modes | Get schema, docs, properties, versions |

**get_node Modes:**
```javascript
// Info mode (default) - Get node schema
get_node({ nodeType: "nodes-base.httpRequest", detail: "standard" })

// Docs mode - Human-readable markdown
get_node({ nodeType: "nodes-base.slack", mode: "docs" })

// Search properties - Find specific fields
get_node({ nodeType: "nodes-base.httpRequest", mode: "search_properties", propertyQuery: "auth" })

// Version info
get_node({ nodeType: "nodes-base.httpRequest", mode: "versions" })
```

**Detail Levels:**
| Level | Tokens | Use Case |
|-------|--------|----------|
| `minimal` | ~200 | Basic metadata only |
| `standard` | ~1-2K | Essential properties (recommended) |
| `full` | ~3-8K | Complete information |

#### Validation
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `validate_node` | Single node validation | Before building workflow |
| `validate_workflow` | Complete workflow validation | Before deployment |
| `n8n_validate_workflow` | Validate workflow by ID | Existing workflows |
| `n8n_autofix_workflow` | Auto-fix common issues | Quick fixes |

**Validation Profiles:**
| Profile | Strictness | Use Case |
|---------|------------|----------|
| `minimal` | Lowest | Quick check, required fields only |
| `runtime` | Medium | Pre-execution validation |
| `ai-friendly` | Medium-High | AI-generated workflows |
| `strict` | Highest | Production deployment |

#### Templates (2,709+ Available)
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `search_templates` | Multi-mode template search | Find workflow examples |
| `get_template` | Get complete workflow JSON | Import/adapt templates |
| `n8n_deploy_template` | Deploy template to n8n instance | Quick deployment |

**search_templates Modes:**
```javascript
// Keyword search (default)
search_templates({ query: "slack notification" })

// By nodes used
search_templates({ searchMode: "by_nodes", nodeTypes: ["n8n-nodes-base.slack"] })

// By task type
search_templates({ searchMode: "by_task", task: "webhook_processing" })

// By metadata
search_templates({
  searchMode: "by_metadata",
  complexity: "simple",
  requiredService: "openai"
})
```

**Available Tasks:**
- `ai_automation`, `data_sync`, `webhook_processing`
- `email_automation`, `slack_integration`, `api_integration`
- `data_transformation`, `file_processing`, `scheduling`, `database_operations`

#### Workflow Management (Requires API Config)
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `n8n_create_workflow` | Create new workflow | Building from scratch |
| `n8n_get_workflow` | Get workflow by ID | Inspect existing |
| `n8n_update_partial_workflow` | Incremental diff updates | Add/remove nodes (efficient) |
| `n8n_update_full_workflow` | Complete replacement | Major changes |
| `n8n_list_workflows` | List all workflows | Overview |
| `n8n_delete_workflow` | Delete workflow | Cleanup |
| `n8n_workflow_versions` | Version history/rollback | Recovery |

**n8n_update_partial_workflow Operations:**
```javascript
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [
    { type: "addNode", node: {...} },
    { type: "removeNode", nodeId: "node-1" },
    { type: "updateNode", nodeId: "node-1", changes: {...} },
    { type: "addConnection", source: "node-1", target: "node-2", sourcePort: "main", targetPort: "main" },
    { type: "removeConnection", source: "node-1", target: "node-2", sourcePort: "main", targetPort: "main" },
    { type: "cleanStaleConnections" },
    { type: "activateWorkflow" },
    { type: "deactivateWorkflow" }
  ]
})
```

**IF Node Multi-Output Routing:**
```javascript
// Route to TRUE branch
{ type: "addConnection", source: "If Node", target: "Success", sourcePort: "main", targetPort: "main", branch: "true" }

// Route to FALSE branch
{ type: "addConnection", source: "If Node", target: "Failure", sourcePort: "main", targetPort: "main", branch: "false" }
```

#### Execution Management
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `n8n_test_workflow` | Trigger workflow execution | Test webhook/chat/form triggers |
| `n8n_executions` | Execution history management | Debug/monitor |

---

## Part 2: Building MCP Servers with n8n

### n8n MCP Nodes Overview

| Node | Type | Purpose |
|------|------|---------|
| `MCP Server Trigger` | Trigger | Expose n8n tools as MCP endpoint |
| `MCP Client Tool` | AI Tool | Connect AI agent to external MCP server |
| `MCP Client` | Action | Standalone MCP client (non-AI context) |
| `Call n8n Sub-Workflow Tool` | AI Tool | Expose workflows as callable tools |

### MCP Server Trigger Node

**Purpose:** Turn n8n into an MCP server that AI clients can connect to.

**Configuration:**
```json
{
  "type": "@n8n/n8n-nodes-langchain.mcpTrigger",
  "typeVersion": 2,
  "parameters": {
    "path": "my-mcp-server",
    "authentication": "bearerAuth"
  }
}
```

**Authentication Options:**
| Method | Value | Description |
|--------|-------|-------------|
| None | `none` | No authentication (testing only) |
| Bearer Auth | `bearerAuth` | `Authorization: Bearer {token}` header |
| Header Auth | `headerAuth` | Custom header name/value |

**URL Types:**
| URL | Purpose |
|-----|---------|
| Test URL | Development/debugging - data visible in workflow |
| Production URL | Live usage - workflow must be active |

**Architecture Pattern:**
```
MCP Server Trigger
    |
    +-- Google Calendar Tool (Get Events)
    +-- Google Calendar Tool (Create Event)
    +-- Call n8n Sub-Workflow Tool (Custom Logic)
    +-- HTTP Request Tool (External API)
```

### MCP Client Tool Node (For AI Agents)

**Purpose:** Connect your n8n AI Agent to external MCP servers.

**Transport Types (CRITICAL):**
| Transport | Value | Status | Use Case |
|-----------|-------|--------|----------|
| **HTTP Streamable** | `httpStreamable` | **Recommended** | All new integrations |
| Server Sent Events | `sse` | **Deprecated** | Legacy compatibility only |

**Why HTTP Streamable is Preferred:**
- Single endpoint architecture (vs dual-endpoint SSE)
- Better connection reliability
- Secure header authentication (SSE required query string tokens)
- Standard HTTP middleware compatibility
- Future support for resumable operations

**Configuration (v1.2+):**
```json
{
  "type": "@n8n/n8n-nodes-langchain.mcpClientTool",
  "typeVersion": 1.2,
  "parameters": {
    "endpointUrl": "https://mcp-server.example.com/mcp",
    "serverTransport": "httpStreamable",
    "authentication": "bearerAuth",
    "include": "all",
    "options": {
      "timeout": 60000
    }
  }
}
```

**Authentication Options (v1.2+):**
| Method | Value | Description |
|--------|-------|-------------|
| None | `none` | No authentication |
| Bearer Auth | `bearerAuth` | Bearer token |
| Header Auth | `headerAuth` | Single custom header |
| MCP OAuth2 | `mcpOAuth2Api` | OAuth2 flow |
| Multiple Headers | `multipleHeadersAuth` | Multiple custom headers |

**Tool Filtering:**
```javascript
// Include all tools
{ include: "all" }

// Include only selected tools
{ include: "selected", includeTools: ["tool1", "tool2"] }

// Include all except specific tools
{ include: "except", excludeTools: ["tool3"] }
```

### MCP Client Node (Standalone)

**Purpose:** Call MCP server tools directly in workflows (without AI Agent context).

**Configuration:**
```json
{
  "type": "@n8n/n8n-nodes-langchain.mcpClient",
  "typeVersion": 1,
  "parameters": {
    "endpointUrl": "https://mcp-server.example.com/mcp",
    "serverTransport": "httpStreamable",
    "authentication": "bearerAuth",
    "tool": { "mode": "list", "value": "get_weather" },
    "inputMode": "manual",
    "parameters": {
      "mappingMode": "defineBelow",
      "value": { "city": "London" }
    }
  }
}
```

**Input Modes:**
| Mode | Use Case |
|------|----------|
| `manual` | Map parameters individually via UI |
| `json` | Provide parameters as JSON object |

### Call n8n Sub-Workflow Tool

**Purpose:** Expose any n8n workflow as a callable tool for AI Agents or MCP Server.

**Configuration:**
```json
{
  "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
  "typeVersion": 2.2,
  "parameters": {
    "name": "get_customer_data",
    "description": "Retrieves customer information by ID or email",
    "source": "database",
    "workflowId": { "__rl": true, "mode": "list", "value": "workflow-id" },
    "workflowInputs": {
      "mappingMode": "defineBelow",
      "value": {
        "customer_id": "={{ $fromAI(\"customer_id\", \"The customer ID to lookup\", \"string\") }}"
      }
    }
  }
}
```

**$fromAI() Function:**
```javascript
// Syntax: $fromAI(paramName, description, type)
$fromAI("customer_id", "The customer ID to lookup", "string")
$fromAI("date_range", "Date range in YYYY-MM-DD format", "string")
$fromAI("include_details", "Whether to include full details", "boolean")
```

---

## Part 3: Building MCP Servers - Complete Patterns

### Pattern 1: API MCP Server

**Use Case:** Expose any API as MCP tools for AI agents.

```
MCP Server Trigger (/api-mcp)
    |
    +-- HTTP Request Tool (Search Employees)
    |       - toolDescription: "Search employees by name or department"
    |       - url: https://api.example.com/employees/search
    |
    +-- HTTP Request Tool (Get Employee)
    |       - toolDescription: "Get employee details by ID"
    |       - url: https://api.example.com/employees/{{ $fromAI("id") }}
    |
    +-- HTTP Request Tool (Update Employee)
            - toolDescription: "Update employee information"
            - method: PATCH
            - url: https://api.example.com/employees/{{ $fromAI("id") }}
```

### Pattern 2: Filesystem MCP Server (Self-Hosted Only)

**Use Case:** Allow AI to manage files on server.

```
MCP Server Trigger (/fs-mcp)
    |
    +-- Execute Command Tool (List Directories)
    |       - command: ls -la {{ $fromAI("path") }}
    |
    +-- Execute Command Tool (Search Files)
    |       - command: find {{ $fromAI("path") }} -name "{{ $fromAI("pattern") }}"
    |
    +-- Call n8n Sub-Workflow Tool (Read File)
    |       - Sub-workflow with Read Binary File node
    |
    +-- Call n8n Sub-Workflow Tool (Write File)
            - Sub-workflow with Write Binary File node
```

**Security Note:** Never allow raw command execution - parameterize inputs only.

### Pattern 3: RAG + Search MCP Server

**Use Case:** AI agent with knowledge base and web search.

```
MCP Server Trigger (/rag-mcp)
    |
    +-- Call n8n Sub-Workflow Tool (Query Knowledge Base)
    |       - Vector store similarity search
    |       - Return relevant documents
    |
    +-- Call n8n Sub-Workflow Tool (Web Search)
    |       - External search API integration
    |       - Return current information
    |
    +-- Call n8n Sub-Workflow Tool (Add to Knowledge Base)
            - Embed and store new documents
```

### Pattern 4: n8n Workflows MCP Server

**Use Case:** Allow AI to discover and execute existing n8n workflows.

```
MCP Server Trigger (/workflows-mcp)
    |
    +-- Call n8n Sub-Workflow Tool (List Available Workflows)
    |       - Query Redis/database for registered workflows
    |       - Return workflow names and descriptions
    |
    +-- Call n8n Sub-Workflow Tool (Execute Workflow)
    |       - Trigger sub-workflow by ID
    |       - Pass parameters dynamically
    |
    +-- Call n8n Sub-Workflow Tool (Register Workflow)
            - Add workflow to available list
```

---

## Part 4: Node Type Formats

### CRITICAL: Correct Format by Context

**For MCP Tools (search_nodes, get_node):**
```
nodes-base.slack          ✓ Correct
n8n-nodes-base.slack      ✗ Wrong
```

**For Workflow JSON:**
```json
{
  "type": "n8n-nodes-base.slack",     // Full prefix required
  "typeVersion": 2
}
```

**For AI/LangChain Nodes:**
```json
{
  "type": "@n8n/n8n-nodes-langchain.agent",  // @n8n prefix
  "typeVersion": 1.7
}
```

### Node Type Patterns
| Package | MCP Tool Format | Workflow JSON Format |
|---------|-----------------|---------------------|
| Core nodes | `nodes-base.httpRequest` | `n8n-nodes-base.httpRequest` |
| AI nodes | `nodes-langchain.agent` | `@n8n/n8n-nodes-langchain.agent` |
| Community | `n8n-nodes-mcp.Mcp` | `n8n-nodes-mcp.Mcp` |

---

## Part 5: Common Tool Sequences

### Build New Workflow
```
1. tools_documentation()              // Understand capabilities
2. search_templates({ query: "..." }) // Find similar workflows
3. search_nodes({ query: "..." })     // Find needed nodes
4. get_node({ nodeType, includeExamples: true })  // Get configurations
5. validate_node({ config, mode: "minimal" })     // Quick validation
6. n8n_create_workflow({ ... })       // Create workflow
7. validate_workflow({ ... })         // Full validation
8. n8n_autofix_workflow({ id })       // Fix if needed
```

### Debug Existing Workflow
```
1. n8n_get_workflow({ id, mode: "full" })  // Get workflow details
2. n8n_validate_workflow({ id })           // Check for issues
3. n8n_executions({ action: "list", workflowId: id })  // View history
4. n8n_autofix_workflow({ id })            // Apply fixes
```

### Deploy from Template
```
1. search_templates({ searchMode: "by_task", task: "webhook_processing" })
2. get_template({ templateId, mode: "full" })
3. n8n_deploy_template({ templateId, autoFix: true })
4. n8n_validate_workflow({ id })
```

---

## Part 6: Environment Configuration

### n8n-mcp Server Setup

**For Claude Desktop (npx):**
```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

**For Docker:**
```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm", "--init",
        "-e", "MCP_MODE=stdio",
        "-e", "N8N_API_URL=http://host.docker.internal:5678",
        "-e", "N8N_API_KEY=your-api-key",
        "ghcr.io/czlonkowski/n8n-mcp:latest"
      ]
    }
  }
}
```

### n8n Instance Requirements

**For Community Nodes as AI Tools:**
```bash
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

**For MCP Server Trigger (Queue Mode):**
- Single webhook replica: Works normally
- Multiple replicas: Route all `/mcp*` to dedicated replica

---

## Part 7: Error Handling

### Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Node type not found` | Wrong format | Use `nodes-base.X` not `n8n-nodes-base.X` |
| `Workflow validation failed` | Invalid config | Run `n8n_autofix_workflow` |
| `Cannot connect to n8n` | API issue | Run `n8n_health_check` |
| `Expected string, received object` | Wrong addConnection syntax | Use four separate string parameters |
| `Source node not found` | Combined string format | Don't use `"node-1:main:0"` format |
| `SSE connection dropped` | Deprecated transport | Switch to HTTP Streamable |

### Validation Error Patterns

**Missing Required Field:**
```json
{
  "valid": false,
  "errors": [{ "path": "parameters.url", "message": "Required field missing" }]
}
```
**Fix:** Add the required parameter.

**Invalid Expression:**
```json
{
  "valid": false,
  "errors": [{ "path": "parameters.value", "message": "Invalid expression syntax" }]
}
```
**Fix:** Check `{{ }}` syntax, use `n8n_autofix_workflow`.

---

## Part 8: Best Practices

### MCP Server Design
1. **Authenticate production servers** - Always use Bearer or Header auth
2. **Parameterize inputs** - Never allow raw command injection
3. **Clear tool descriptions** - Help AI understand when/how to use each tool
4. **Audit logging** - Log all operations for sensitive data access
5. **Use HTTP Streamable** - SSE is deprecated (as of MCP spec 2025-03-26)

### MCP Client Usage
1. **Prefer HTTP Streamable** over SSE for all new integrations
2. **Set appropriate timeouts** - Default 60000ms, increase for slow operations
3. **Filter tools** - Only expose needed tools to reduce token usage
4. **Handle connection drops** - HTTP Streamable has better reliability

### n8n-mcp Tool Usage
1. **Start with tools_documentation()** - Understand available capabilities
2. **Use includeExamples** - Get real-world configurations
3. **Validate incrementally** - `minimal` during dev, `strict` for production
4. **Batch operations** - Use single `n8n_update_partial_workflow` with multiple ops
5. **Check n8n_health_check** - Verify connectivity before operations

---

## Quick Reference

### Transport Comparison (MCP Spec 2025-03-26)

| Feature | HTTP Streamable | SSE (Deprecated) |
|---------|----------------|------------------|
| Endpoints | Single `/mcp` | Dual (POST + SSE) |
| Auth Headers | Secure in headers | Often in query string |
| Connection | Stateless or stateful | Always stateful |
| Reliability | Better | Connection drops |
| Future Support | Full | Legacy only |

### MCP Node Quick Reference

| Node | Type Format | Key Parameter |
|------|-------------|---------------|
| MCP Server Trigger | `@n8n/n8n-nodes-langchain.mcpTrigger` | `path`, `authentication` |
| MCP Client Tool | `@n8n/n8n-nodes-langchain.mcpClientTool` | `endpointUrl`, `serverTransport` |
| MCP Client | `@n8n/n8n-nodes-langchain.mcpClient` | `endpointUrl`, `tool` |
| Sub-Workflow Tool | `@n8n/n8n-nodes-langchain.toolWorkflow` | `workflowId`, `workflowInputs` |

---

## Sources & Further Reading

- [MCP Server Trigger Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/)
- [MCP Client Tool Documentation](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolmcp/)
- [n8n MCP Integration Guide](https://docs.n8n.io/advanced-ai/accessing-n8n-mcp-server/)
- [n8n-mcp GitHub Repository](https://github.com/czlonkowski/n8n-mcp)
- [MCP Specification - Transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- [Why MCP Deprecated SSE](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)
- [MCP HTTP Streamable Security](https://auth0.com/blog/mcp-streamable-http/)
- [Build FileSystem MCP Server Template](https://n8n.io/workflows/3630)
- [Build Custom API MCP Server Template](https://n8n.io/workflows/3638)
- [Build MCP Server with Google Calendar](https://n8n.io/workflows/3569)

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `01-workflow-architect` | Strategic planning before building |
| `02-workflow-patterns` | Choose appropriate workflow pattern |
| `03-node-configuration` | Configure specific nodes |
| `05-code-javascript` | Code node logic for tools |
| `08-validation-expert` | Deep-dive on validation errors |
