# n8n Node Configuration

> **Operation-aware node configuration with property dependencies and production-ready patterns**

## Overview

This skill covers operation-aware node configuration, property dependencies, credential management, and progressive discovery patterns for configuring n8n nodes correctly.

---

## Configuration Philosophy

**Progressive disclosure**: Start minimal, add complexity as needed

Configuration best practices:
- `get_node` with `detail=standard` is the most used discovery pattern (91.7% success rate)
- 56 seconds average between configuration edits
- Always validate before deploying

**Key insight**: Most configurations need only standard details, not full schema!

---

## Core Concepts

### 1. Operation-Aware Configuration

**Not all fields are always required** - it depends on operation!

**Example**: Slack node
```javascript
// For operation='post'
{
  "resource": "message",
  "operation": "post",
  "channel": "#general",  // Required for post
  "text": "Hello!"        // Required for post
}

// For operation='update'
{
  "resource": "message",
  "operation": "update",
  "messageId": "123",     // Required for update (different!)
  "text": "Updated!"      // Required for update
  // channel NOT required for update
}
```

**Key**: Resource + operation determine which fields are required!

### 2. Property Dependencies

**Fields appear/disappear based on other field values**

**Example**: HTTP Request node
```javascript
// When method='GET'
{
  "method": "GET",
  "url": "https://api.example.com"
  // sendBody not shown (GET doesn't have body)
}

// When method='POST'
{
  "method": "POST",
  "url": "https://api.example.com",
  "sendBody": true,       // Now visible!
  "contentType": "json",  // Body content type
  "specifyBody": "json",  // Use JSON input
  "jsonBody": {...}       // The actual JSON body
}
```

**Mechanism**: displayOptions control field visibility

### 3. Progressive Discovery

**Use the right tool for the right job**:

| Tool | When to Use | Success Rate |
|------|-------------|--------------|
| `get_node` (standard) | Starting configuration | 91.7% |
| `get_node` (mode=search_properties) | Find specific properties | For complex nodes |
| `get_node` (full) | Complete documentation | When standard isn't enough |

---

## MCP Tools for Node Configuration

### get_node - Primary Discovery Tool

```javascript
// Standard detail (recommended starting point)
get_node({
  nodeType: "nodes-base.slack",
  detail: "standard"
})

// Search for specific properties
get_node({
  nodeType: "nodes-base.httpRequest",
  mode: "search_properties",
  propertyQuery: "authentication"
})

// Full documentation
get_node({
  nodeType: "nodes-base.slack",
  detail: "full"
})

// With real-world examples from templates
get_node({
  nodeType: "nodes-base.slack",
  detail: "standard",
  includeExamples: true
})
```

### validate_node - Configuration Validation

```javascript
validate_node({
  nodeType: "nodes-base.slack",
  config: {
    resource: "message",
    operation: "post",
    channel: "#general",
    text: "Hello!"
  },
  mode: "full"
})
```

---

## Node Type Format

**CRITICAL**: Use correct format for node types

| Context | Format | Example |
|---------|--------|---------|
| MCP Tools (search_nodes, get_node) | `nodes-base.X` | `nodes-base.slack` |
| Workflow JSON | `n8n-nodes-base.X` | `n8n-nodes-base.slack` |
| AI/Langchain nodes (MCP) | `nodes-langchain.X` | `nodes-langchain.agent` |
| AI/Langchain nodes (JSON) | `@n8n/n8n-nodes-langchain.X` | `@n8n/n8n-nodes-langchain.agent` |

```javascript
// When searching for nodes
search_nodes({ query: "slack" })
// Returns: nodes-base.slack

// When building workflow JSON
{
  "type": "n8n-nodes-base.slack",  // Note the "n8n-" prefix!
  "typeVersion": 2.2,
  ...
}
```

---

## HTTP Request Node (Deep Dive)

The HTTP Request node is the most commonly used node. Here's comprehensive configuration guidance.

### Basic Configuration

```javascript
{
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.3,  // Use latest version
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/users",
    "authentication": "none"
  }
}
```

### Authentication Options

| Auth Type | Configuration | Use Case |
|-----------|---------------|----------|
| None | `"authentication": "none"` | Public APIs |
| Predefined Credential | `"authentication": "predefinedCredentialType"` | Named service (Slack, Stripe) |
| Generic Credential | `"authentication": "genericCredentialType"` | Custom auth methods |

**Generic Authentication Types**:
```javascript
// Header Auth (API Key)
{
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth"
}

// Basic Auth
{
  "authentication": "genericCredentialType",
  "genericAuthType": "httpBasicAuth"
}

// Bearer Token
{
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth"  // Name: Authorization, Value: Bearer <token>
}

// OAuth2
{
  "authentication": "genericCredentialType",
  "genericAuthType": "oAuth2Api"
}
```

### Body Configuration

| Content Type | Value | Use Case |
|--------------|-------|----------|
| JSON | `"contentType": "json"` | REST APIs (most common) |
| Form URL Encoded | `"contentType": "form-urlencoded"` | HTML forms, OAuth |
| Multipart Form Data | `"contentType": "multipart-form-data"` | File uploads |
| Raw | `"contentType": "raw"` | Custom formats |
| Binary | `"contentType": "binaryData"` | File transfer |

**POST with JSON Body**:
```javascript
{
  "method": "POST",
  "url": "https://api.example.com/users",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "sendBody": true,
  "contentType": "json",
  "specifyBody": "json",
  "jsonBody": {
    "name": "={{ $json.name }}",
    "email": "={{ $json.email }}"
  }
}
```

**POST with Form Data** (file upload):
```javascript
{
  "method": "POST",
  "url": "https://api.example.com/upload",
  "sendBody": true,
  "contentType": "multipart-form-data",
  "bodyParameters": {
    "parameters": [
      {
        "parameterType": "formBinaryData",
        "name": "file",
        "inputDataFieldName": "data"
      }
    ]
  }
}
```

### Headers Configuration

```javascript
{
  "method": "GET",
  "url": "https://api.example.com",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      { "name": "X-Custom-Header", "value": "custom-value" },
      { "name": "Accept", "value": "application/json" }
    ]
  }
}
```

### Query Parameters

```javascript
{
  "method": "GET",
  "url": "https://api.example.com/search",
  "sendQuery": true,
  "queryParameters": {
    "parameters": [
      { "name": "q", "value": "={{ $json.searchTerm }}" },
      { "name": "limit", "value": "100" }
    ]
  }
}
```

### Response Options

```javascript
{
  "options": {
    "response": {
      "response": {
        "fullResponse": true,        // Include headers and status
        "neverError": true,          // Don't fail on non-2xx
        "responseFormat": "json"     // Parse as JSON
      }
    },
    "timeout": 30000,               // 30 second timeout
    "batching": {
      "batch": {
        "batchSize": 10,
        "batchInterval": 1000       // Rate limiting
      }
    }
  }
}
```

---

## AI Agent Node (Deep Dive)

The AI Agent node orchestrates LLM-powered workflows with tools, memory, and structured output.

### Basic Configuration

```javascript
{
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 3.1,  // Use latest version
  "parameters": {
    "promptType": "define",
    "text": "Your prompt here",
    "options": {
      "systemMessage": "You are a helpful assistant."
    }
  }
}
```

### Prompt Source Options

| promptType | Description | Configuration |
|------------|-------------|---------------|
| `auto` | From connected Chat Trigger | `"text": "={{ $json.chatInput }}"` |
| `define` | Manual prompt | `"text": "Your custom prompt"` |

### System Message Configuration

```javascript
{
  "options": {
    "systemMessage": "You are an expert assistant. Today's date is {{ $now }}.",
    "maxIterations": 10,           // Max reasoning loops
    "returnIntermediateSteps": true // Show agent's thinking
  }
}
```

### AI Connection Types

Connect sub-nodes to the AI Agent using these connection types:

| Connection Type | Purpose | Required | Example Nodes |
|-----------------|---------|----------|---------------|
| `ai_languageModel` | LLM provider | **Yes** | OpenAI, Anthropic, Groq, Ollama |
| `ai_tool` | Tools agent can use | No | HTTP Request Tool, Calculator |
| `ai_memory` | Conversation context | No | Buffer Memory, Postgres Memory |
| `ai_outputParser` | Structure output | No | Structured Output Parser |

**Connection JSON**:
```javascript
{
  "connections": {
    "OpenAI Chat Model": {
      "ai_languageModel": [[{
        "node": "AI Agent",
        "type": "ai_languageModel",
        "index": 0
      }]]
    },
    "HTTP Request Tool": {
      "ai_tool": [[{
        "node": "AI Agent",
        "type": "ai_tool",
        "index": 0
      }]]
    },
    "Window Buffer Memory": {
      "ai_memory": [[{
        "node": "AI Agent",
        "type": "ai_memory",
        "index": 0
      }]]
    }
  }
}
```

### Memory Configuration Best Practices

| Memory Type | Use Case | Production Ready |
|-------------|----------|------------------|
| Simple Memory | Development/testing | No (resets on restart) |
| Buffer Window Memory | Short conversations | Yes (with session ID) |
| Postgres Chat Memory | Long-term persistence | Yes |
| Redis Chat Memory | High-performance | Yes |

**Session ID Pattern** (critical for production):
```javascript
// In memory node configuration
{
  "sessionIdType": "customKey",
  "sessionKey": "={{ $json.userId }}-{{ $json.conversationId }}"
}
```

### Structured Output

Enable `hasOutputParser: true` and connect an Output Parser node:
```javascript
{
  "hasOutputParser": true
}
```

---

## Edit Fields (Set) Node

The Set node transforms and maps data between nodes.

### Manual Mapping Mode

```javascript
{
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "parameters": {
    "mode": "manual",
    "fields": {
      "values": [
        {
          "name": "fullName",
          "stringValue": "={{ $json.firstName }} {{ $json.lastName }}"
        },
        {
          "name": "isActive",
          "booleanValue": true
        },
        {
          "name": "count",
          "numberValue": "={{ $json.items.length }}"
        }
      ]
    }
  }
}
```

### JSON Output Mode

```javascript
{
  "mode": "raw",
  "jsonOutput": "{\n  \"user\": {\n    \"name\": \"{{ $json.name }}\",\n    \"email\": \"{{ $json.email }}\"\n  }\n}"
}
```

### Options

| Option | Purpose |
|--------|---------|
| Include Other Input Fields | Keep fields not explicitly set |
| Dot Notation | Enable/disable nested object creation |
| Ignore Type Conversion Errors | Continue on type errors |

### Common Mistakes

```javascript
// WRONG: Using Fixed mode with expression syntax
{
  "name": "email",
  "stringValue": "$json.email"  // Outputs literal "$json.email"
}

// CORRECT: Use expression mode
{
  "name": "email",
  "stringValue": "={{ $json.email }}"  // Evaluates to actual email
}
```

---

## Code Node Configuration

### JavaScript Mode

```javascript
{
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "parameters": {
    "mode": "runOnceForAllItems",  // or "runOnceForEachItem"
    "language": "javaScript",
    "jsCode": "// Your code here\nreturn items;"
  }
}
```

**Run Modes**:
| Mode | Use Case |
|------|----------|
| `runOnceForAllItems` | Aggregate operations, batch processing |
| `runOnceForEachItem` | Per-item transformations |

### Python Mode (n8n v2+)

```javascript
{
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "parameters": {
    "mode": "runOnceForAllItems",
    "language": "python",
    "pythonCode": "# Your code here\nreturn _items"
  }
}
```

**Note**: Python uses `_items` (with underscore) instead of `items`.

### Binary Data Handling

```javascript
// Reading binary data (JavaScript)
const buffer = await this.helpers.getBinaryDataBuffer(0, 'data');

// Creating binary data (JavaScript)
const binary = await this.helpers.prepareBinaryData(
  Buffer.from(content, 'utf8'),
  'output.txt',
  'text/plain'
);
return [{ json: {}, binary: { data: binary } }];
```

---

## IF Node Configuration

### String Conditions

```javascript
{
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "condition-1",
          "leftValue": "={{ $json.status }}",
          "rightValue": "active",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    }
  }
}
```

### Available Operators

| Type | Operations |
|------|------------|
| String | equals, notEquals, contains, notContains, startsWith, endsWith, isEmpty, isNotEmpty, regex |
| Number | equals, notEquals, gt, gte, lt, lte |
| Boolean | true, false |
| Array | contains, notContains, lengthEquals, lengthNotEquals, lengthGt, lengthLt, isEmpty, isNotEmpty |
| Object | exists, notExists |
| DateTime | after, before, equals |

### Multiple Conditions

```javascript
{
  "conditions": {
    "combinator": "and",  // or "or"
    "conditions": [
      {
        "leftValue": "={{ $json.status }}",
        "rightValue": "active",
        "operator": { "type": "string", "operation": "equals" }
      },
      {
        "leftValue": "={{ $json.role }}",
        "rightValue": "admin",
        "operator": { "type": "string", "operation": "equals" }
      }
    ]
  }
}
```

---

## Database Node Patterns

### Postgres Node

```javascript
// Execute Query
{
  "operation": "executeQuery",
  "query": "SELECT * FROM users WHERE created_at > $1",
  "additionalFields": {
    "queryParams": "={{ [$json.since] }}"
  }
}

// Insert
{
  "operation": "insert",
  "table": "users",
  "columns": "name,email",
  "additionalFields": {}
}

// Update
{
  "operation": "update",
  "table": "users",
  "columns": "name,email",
  "where": "id = $1",
  "whereParams": "={{ [$json.id] }}"
}
```

### MySQL Node

```javascript
{
  "operation": "executeQuery",
  "query": "SELECT * FROM orders WHERE status = ?",
  "queryOptions": {
    "queryParams": "={{ [$json.status] }}"
  }
}
```

---

## Credential Configuration

### Credential Reference Pattern

```javascript
{
  "type": "n8n-nodes-base.slack",
  "credentials": {
    "slackApi": {
      "id": "credential-id",  // n8n assigns this
      "name": "My Slack Account"
    }
  }
}
```

### Common Credential Types

| Node | Auth Type | Credential Type |
|------|-----------|-----------------|
| Slack | OAuth2 | slackApi or slackOAuth2Api |
| Google Sheets | OAuth2 | googleSheetsOAuth2Api |
| HTTP Request | Header | httpHeaderAuth |
| HTTP Request | Basic | httpBasicAuth |
| HTTP Request | OAuth2 | oAuth2Api |
| OpenAI | API Key | openAiApi |
| Anthropic | API Key | anthropicApi |
| Postgres | Connection | postgres |

### Security Best Practices

1. **Never hardcode credentials** - Always use credential references
2. **Use environment variables** - For deployment configuration
3. **Minimum permissions** - Request only what's needed
4. **Rotate credentials** - Especially after sharing workflows
5. **Use n8n's encryption** - Credentials are encrypted at rest

```javascript
// BAD - Hardcoded API key
{
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "headerParameters": {
    "parameters": [{ "name": "Authorization", "value": "Bearer sk-xxx" }]
  }
}

// GOOD - Reference credential
{
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth"
  // Credential configured separately in n8n
}
```

---

## Configuration Patterns

### Pattern 1: Resource/Operation Nodes

**Examples**: Slack, Google Sheets, Airtable, HubSpot

```javascript
{
  "resource": "<entity>",      // What type of thing
  "operation": "<action>",     // What to do with it
  // ... operation-specific fields
}
```

### Pattern 2: Trigger Nodes

**Examples**: Webhook, Schedule, Service Triggers

```javascript
// Webhook Trigger
{
  "type": "n8n-nodes-base.webhook",
  "webhookId": "auto-generated",
  "parameters": {
    "httpMethod": "POST",
    "path": "my-webhook",
    "responseMode": "responseNode",  // or "onReceived", "lastNode"
    "options": {}
  }
}

// Schedule Trigger
{
  "type": "n8n-nodes-base.scheduleTrigger",
  "parameters": {
    "rule": {
      "interval": [{ "field": "hours", "hoursInterval": 1 }]
    }
  }
}
```

### Pattern 3: Flow Control Nodes

**Examples**: IF, Switch, Merge, Loop

```javascript
// Switch Node
{
  "type": "n8n-nodes-base.switch",
  "parameters": {
    "dataType": "string",
    "value1": "={{ $json.status }}",
    "rules": {
      "rules": [
        { "value2": "pending", "output": 0 },
        { "value2": "active", "output": 1 },
        { "value2": "completed", "output": 2 }
      ]
    },
    "fallbackOutput": 3
  }
}
```

---

## Configuration Workflow

### Standard Process

```
1. Identify node type and operation
   ↓
2. Use get_node with detail=standard
   ↓
3. Configure required fields
   ↓
4. Validate configuration
   ↓
5. If dependencies unclear → search_properties mode
   ↓
6. Add optional fields as needed
   ↓
7. Validate again
   ↓
8. Deploy
```

### Quick Validation Checklist

- [ ] Correct node type format (`n8n-nodes-base.X` for JSON)
- [ ] Latest typeVersion specified
- [ ] All required fields for operation configured
- [ ] Credentials referenced (not hardcoded)
- [ ] Expressions use `={{ }}` syntax
- [ ] Dependencies satisfied (e.g., sendBody=true before body config)

---

## Troubleshooting Common Issues

### HTTP Request Issues

| Problem | Solution |
|---------|----------|
| "Authorization header required" | Check credential configuration, verify header casing |
| Empty response | Enable "Full Response" option |
| Timeout | Increase timeout in options |
| Rate limited | Add batching configuration |

### AI Agent Issues

| Problem | Solution |
|---------|----------|
| Memory not persisting | Use Postgres/Redis memory, not Simple Memory |
| Agent loops forever | Reduce maxIterations, improve prompt |
| Tools not being used | Check tool descriptions, verify connections |
| Session mixing | Use unique sessionKey per conversation |

### Expression Issues

| Problem | Solution |
|---------|----------|
| Literal string output | Switch from Fixed to Expression mode |
| Undefined error | Use optional chaining: `$json.user?.email` |
| Wrong node data | Use `$('NodeName').item.json.field` |

---

## Anti-Patterns

### Don't: Over-configure Upfront

```javascript
// BAD - Adding every possible field
{
  "method": "GET",
  "url": "...",
  "sendQuery": false,
  "sendHeaders": false,
  "sendBody": false,
  "timeout": 10000,
  // ... 20 more optional fields set to defaults
}

// GOOD - Start minimal
{
  "method": "GET",
  "url": "...",
  "authentication": "none"
}
```

### Don't: Skip Validation

```javascript
// BAD - Deploy without validation
const config = {...};
n8n_update_partial_workflow({...});

// GOOD - Validate first
const config = {...};
const result = validate_node({nodeType, config});
if (result.valid) {
  n8n_update_partial_workflow({...});
}
```

### Don't: Copy Configs Blindly

Different operations need different fields. Always verify requirements when changing operation.

---

## Sources & Further Reading

- [HTTP Request Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [HTTP Request Credentials](https://docs.n8n.io/integrations/builtin/credentials/httprequest/)
- [AI Agent (Tools Agent) Documentation](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent/)
- [Edit Fields (Set) Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/)
- [Code Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)
- [Binary Data Handling](https://docs.n8n.io/data/binary-data/)
- [n8n Expressions](https://docs.n8n.io/code/expressions/)
- [Credentials Library](https://docs.n8n.io/credentials/)
- [n8n AI Agent Memory Guide 2026](https://pub.towardsai.net/n8n-ai-agent-node-memory-complete-setup-guide-for-2026-a8c0a074df6f)
- [Mastering n8n HTTP Request Node](https://automategeniushub.com/mastering-the-n8n-http-request-node/)

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `04-mcp-tools-expert` | How to use discovery tools |
| `05-code-javascript` | Write Code node logic |
| `06-code-python` | Write Python Code node logic |
| `07-expression-syntax` | Configure expression fields |
| `08-validation-expert` | Interpret validation errors |
