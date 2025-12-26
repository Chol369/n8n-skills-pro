# n8n Node Configuration

> **Operation-aware node configuration with property dependencies**

## Overview

This skill covers operation-aware node configuration, property dependencies, and progressive discovery patterns for configuring n8n nodes correctly.

---

## Configuration Philosophy

**Progressive disclosure**: Start minimal, add complexity as needed

Configuration best practices:
- `get_node` with `detail=standard` is the most used discovery pattern
- 56 seconds average between configuration edits
- 91.7% success rate with essentials-based configuration

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

// With real-world examples
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

### Example: Configuring HTTP Request

**Step 1**: Identify what you need
```javascript
// Goal: POST JSON to API
```

**Step 2**: Get standard info
```javascript
const info = get_node({
  nodeType: "nodes-base.httpRequest",
  detail: "standard"
});

// Returns: method, url, sendBody, body, authentication required/optional
```

**Step 3**: Minimal config
```javascript
{
  "method": "POST",
  "url": "https://api.example.com/create",
  "authentication": "none"
}
```

**Step 4**: Validate
```javascript
validate_node({
  nodeType: "nodes-base.httpRequest",
  config: config,
  mode: "full"
});
// → Error: "sendBody required for POST"
```

**Step 5**: Add required field
```javascript
{
  "method": "POST",
  "url": "https://api.example.com/create",
  "authentication": "none",
  "sendBody": true
}
```

**Step 6**: Validate again → Error: "body required when sendBody=true"

**Step 7**: Complete configuration
```javascript
{
  "method": "POST",
  "url": "https://api.example.com/create",
  "authentication": "none",
  "sendBody": true,
  "contentType": "json",
  "specifyBody": "json",
  "jsonBody": {
    "name": "={{$json.name}}",
    "email": "={{$json.email}}"
  }
}
```

**Step 8**: Final validation → Valid!

---

## Node Type Format

**CRITICAL**: Use correct format for node types

| Context | Format | Example |
|---------|--------|---------|
| MCP Tools (search_nodes, get_node) | `nodes-base.X` | `nodes-base.slack` |
| Workflow JSON | `n8n-nodes-base.X` | `n8n-nodes-base.slack` |
| AI/Langchain nodes | `@n8n/n8n-nodes-langchain.X` | `@n8n/n8n-nodes-langchain.agent` |

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

## Common Node Patterns

### Pattern 1: Resource/Operation Nodes

**Examples**: Slack, Google Sheets, Airtable, HubSpot

**Structure**:
```javascript
{
  "resource": "<entity>",      // What type of thing
  "operation": "<action>",     // What to do with it
  // ... operation-specific fields
}
```

**Configuration steps**:
1. Choose resource
2. Choose operation
3. Use get_node to see operation-specific requirements
4. Configure required fields

### Pattern 2: HTTP-Based Nodes

**Examples**: HTTP Request, Webhook

**Structure**:
```javascript
{
  "method": "<HTTP_METHOD>",
  "url": "<endpoint>",
  "authentication": "<type>",
  // ... method-specific fields
}
```

**Dependencies**:
- POST/PUT/PATCH → sendBody available
- sendBody=true → body required
- authentication != "none" → credentials required

### Pattern 3: Database Nodes

**Examples**: Postgres, MySQL, MongoDB

**Structure**:
```javascript
{
  "operation": "<query|insert|update|delete>",
  // ... operation-specific fields
}
```

**Dependencies**:
- operation="executeQuery" → query required
- operation="insert" → table + values required
- operation="update" → table + values + where required

### Pattern 4: Conditional Logic Nodes

**Examples**: IF, Switch, Merge

**Structure**:
```javascript
{
  "conditions": {
    "<type>": [
      {
        "operation": "<operator>",
        "value1": "...",
        "value2": "..."  // Only for binary operators
      }
    ]
  }
}
```

**Dependencies**:
- Binary operators (equals, contains, etc.) → value1 + value2
- Unary operators (isEmpty, isNotEmpty) → value1 only

---

## AI Node Connection Types

AI/Langchain nodes use special connection types:

| Connection Type | Purpose | Example Nodes |
|-----------------|---------|---------------|
| `ai_languageModel` | LLM provider | OpenAI, Anthropic, Ollama |
| `ai_tool` | Tools for agent | HTTP Request Tool, Calculator |
| `ai_memory` | Conversation memory | Buffer Memory, PostgreSQL Memory |
| `ai_outputParser` | Structure output | JSON Parser, Structured Output |
| `ai_textSplitter` | Chunk documents | Text Splitter, Recursive Splitter |
| `ai_document` | Document loaders | PDF, Text, JSON loaders |
| `ai_embedding` | Embedding models | OpenAI Embeddings |
| `ai_vectorStore` | Vector databases | Pinecone, Qdrant, Supabase |

**Connection format in workflow JSON**:
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
    }
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

### Authentication Types by Node

| Node | Auth Type | Credential Type |
|------|-----------|-----------------|
| Slack | OAuth2 | slackApi or slackOAuth2Api |
| Google Sheets | OAuth2 | googleSheetsOAuth2Api |
| HTTP Request | Various | httpBasicAuth, httpHeaderAuth, etc. |
| OpenAI | API Key | openAiApi |

**Note**: Credential IDs are managed by n8n. When creating workflows via API, reference credential names.

---

## Operation-Specific Examples

### Slack Node Examples

#### Post Message
```javascript
{
  "resource": "message",
  "operation": "post",
  "channel": "#general",      // Required
  "text": "Hello!",           // Required
  "attachments": [],          // Optional
  "blocks": []                // Optional
}
```

#### Update Message
```javascript
{
  "resource": "message",
  "operation": "update",
  "messageId": "1234567890",  // Required (different from post!)
  "text": "Updated!",         // Required
  "channel": "#general"       // Optional (can be inferred)
}
```

### HTTP Request Node Examples

#### GET Request
```javascript
{
  "method": "GET",
  "url": "https://api.example.com/users",
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "httpHeaderAuth",
  "sendQuery": true,
  "queryParameters": {
    "parameters": [
      { "name": "limit", "value": "100" }
    ]
  }
}
```

#### POST with JSON
```javascript
{
  "method": "POST",
  "url": "https://api.example.com/users",
  "authentication": "none",
  "sendBody": true,
  "contentType": "json",
  "specifyBody": "json",
  "jsonBody": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### IF Node Examples

#### String Comparison (Binary)
```javascript
{
  "conditions": {
    "string": [
      {
        "value1": "={{$json.status}}",
        "operation": "equals",
        "value2": "active"
      }
    ]
  }
}
```

#### Empty Check (Unary)
```javascript
{
  "conditions": {
    "string": [
      {
        "value1": "={{$json.email}}",
        "operation": "isEmpty"
      }
    ]
  }
}
```

---

## Configuration Anti-Patterns

### ❌ Don't: Over-configure Upfront

**Bad**:
```javascript
// Adding every possible field
{
  "method": "GET",
  "url": "...",
  "sendQuery": false,
  "sendHeaders": false,
  "sendBody": false,
  "timeout": 10000,
  // ... 20 more optional fields
}
```

**Good**:
```javascript
// Start minimal
{
  "method": "GET",
  "url": "...",
  "authentication": "none"
}
```

### ❌ Don't: Skip Validation

**Bad**:
```javascript
const config = {...};
n8n_update_partial_workflow({...});  // Deploy without validation
```

**Good**:
```javascript
const config = {...};
const result = validate_node({nodeType, config});
if (result.valid) {
  n8n_update_partial_workflow({...});
}
```

### ❌ Don't: Ignore Operation Context

**Bad**: Same config for all operations

**Good**: Check requirements when changing operation

---

## Best Practices

### Do
1. **Start with get_node (standard)** - 91.7% success rate
2. **Validate iteratively** - Configure → Validate → Fix → Repeat
3. **Use search_properties when stuck** - Find specific fields
4. **Respect operation context** - Different operations = different requirements
5. **Use correct node type format** - `nodes-base.X` for tools, `n8n-nodes-base.X` for JSON

### Don't
1. **Jump to full detail immediately** - Try standard first
2. **Configure blindly** - Always validate before deploying
3. **Copy configs without understanding** - Different operations need different fields
4. **Forget the n8n- prefix** - Workflow JSON needs `n8n-nodes-base.X`

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `04-mcp-tools-expert` | How to use discovery tools |
| `07-expression-syntax` | Configure expression fields |
| `08-validation-expert` | Interpret validation errors |
| `05-code-javascript` | Write Code node logic |

