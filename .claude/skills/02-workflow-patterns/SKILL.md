# n8n Workflow Patterns

> **Proven architectural patterns for building production-ready n8n workflows**

## Overview

This skill covers the 5 core workflow patterns that handle 90%+ of automation use cases, plus common building blocks and best practices.

---

## The 5 Core Patterns

### 1. Webhook Processing (Most Common)

**Pattern**: Receive HTTP → Process → Respond/Notify

```
Webhook → Validate → Transform → Action → Response
```

**Use when**:
- Receiving data from external systems
- Building integrations (Slack commands, form submissions, payment webhooks)
- Need instant response to events

**Example**:
```json
{
  "nodes": [
    {"type": "n8n-nodes-base.webhook", "name": "Webhook"},
    {"type": "n8n-nodes-base.if", "name": "Validate"},
    {"type": "n8n-nodes-base.set", "name": "Transform"},
    {"type": "n8n-nodes-base.slack", "name": "Notify"}
  ]
}
```

**Key considerations**:
- Webhook data is under `$json.body` (not `$json` directly)
- Use `responseMode: "onReceived"` for quick acknowledgment
- Validate input before processing

---

### 2. HTTP API Integration

**Pattern**: Trigger → Fetch API → Transform → Store/Act

```
Trigger → HTTP Request → Transform → Database/Service → Error Handler
```

**Use when**:
- Fetching data from REST APIs
- Synchronizing with third-party services
- Building data pipelines

**Example flow**:
```
Schedule (daily) → GET /api/orders → Filter new → POST to CRM → Log result
```

**Key considerations**:
- Handle pagination for large datasets
- Implement retry logic for transient failures
- Use authentication credentials properly

---

### 3. Database Operations

**Pattern**: Schedule → Query → Transform → Write → Verify

```
Schedule → Read Source → Transform → Write Target → Confirm
```

**Use when**:
- ETL workflows
- Database synchronization
- Data migrations
- Backup operations

**Example**:
```
Schedule (15min) → Postgres (new records) → Transform → MySQL (insert) → Update sync timestamp
```

**Key considerations**:
- Use transactions where possible
- Implement idempotency (check before insert)
- Handle connection failures gracefully

---

### 4. AI Agent Workflow

**Pattern**: Trigger → AI Agent (Model + Tools + Memory) → Output

```
Webhook → AI Agent ─┬─ Language Model
                    ├─ Tool 1 (HTTP)
                    ├─ Tool 2 (Database)
                    └─ Memory (Buffer)
         → Response
```

**Use when**:
- Building conversational AI
- Need AI with tool access
- Multi-step reasoning tasks

**AI Node connections** (8 types):
| Connection Type | Purpose |
|-----------------|---------|
| `ai_languageModel` | LLM (OpenAI, Anthropic, etc.) |
| `ai_tool` | Tools the agent can use |
| `ai_memory` | Conversation memory |
| `ai_outputParser` | Structure output |
| `ai_textSplitter` | Chunk large documents |
| `ai_document` | Document loaders |
| `ai_embedding` | Embedding models |
| `ai_vectorStore` | Vector databases |

**Key considerations**:
- Manage token costs (use appropriate model size)
- Implement conversation memory for context
- Define clear tool descriptions

---

### 5. Scheduled Tasks

**Pattern**: Schedule → Fetch → Process → Deliver → Log

```
Schedule Trigger → Gather Data → Process → Deliver → Log Success/Failure
```

**Use when**:
- Recurring reports or summaries
- Periodic data fetching
- Maintenance tasks
- Cleanup jobs

**Cron examples**:
| Schedule | Cron Expression |
|----------|-----------------|
| Every hour | `0 * * * *` |
| Daily at 9 AM | `0 9 * * *` |
| Weekly Monday 8 AM | `0 8 * * 1` |
| First of month | `0 0 1 * *` |

**Key considerations**:
- Set appropriate timezone
- Handle failures with error workflows
- Log execution results

---

## Common Workflow Components

### Triggers

| Trigger | Use Case |
|---------|----------|
| Webhook | HTTP endpoint (instant) |
| Schedule | Cron-based timing (periodic) |
| Manual | Click to execute (testing) |
| Service triggers | Slack, Email, etc. (event-based) |

### Data Sources

| Node Type | Use Case |
|-----------|----------|
| HTTP Request | REST APIs |
| Database nodes | Postgres, MySQL, MongoDB |
| Service nodes | Slack, Google Sheets, etc. |
| Code | Custom JavaScript/Python |

### Transformation

| Node | Use Case |
|------|----------|
| Set | Map/transform fields |
| Code | Complex logic |
| IF/Switch | Conditional routing |
| Merge | Combine data streams |
| Split In Batches | Process in chunks |

### Outputs

| Node Type | Use Case |
|-----------|----------|
| HTTP Request | Call APIs |
| Database | Write data |
| Email/Slack | Notifications |
| Webhook Response | Return to caller |

### Error Handling

| Node | Use Case |
|------|----------|
| Error Trigger | Catch workflow errors |
| IF | Check error conditions |
| Stop and Error | Explicit failure |

---

## Data Flow Patterns

### Linear Flow
```
Trigger → Transform → Action → End
```
**Use for**: Simple workflows with single path

### Branching Flow
```
Trigger → IF ─┬─ True Path → Action A
              └─ False Path → Action B
```
**Use for**: Conditional processing

### Parallel Processing
```
Trigger ─┬─ Branch 1 ─┐
         └─ Branch 2 ─┴─ Merge → Output
```
**Use for**: Independent operations that can run simultaneously

### Loop Pattern
```
Trigger → Split In Batches → Process → [Loop until done]
```
**Use for**: Processing large datasets in chunks

### Error Handler Pattern
```
Main Workflow ─┬─ Success Path
               └─ Error Trigger → Error Workflow → Alert
```
**Use for**: Production workflows needing error notification

---

## Workflow Creation Checklist

### Planning Phase
- [ ] Identify pattern (webhook, API, database, AI, scheduled)
- [ ] List required nodes (`search_nodes`)
- [ ] Understand data flow (input → transform → output)
- [ ] Plan error handling strategy

### Implementation Phase
- [ ] Create workflow with appropriate trigger
- [ ] Add data source nodes
- [ ] Configure authentication/credentials
- [ ] Add transformation nodes
- [ ] Add output/action nodes
- [ ] Configure error handling

### Validation Phase
- [ ] Validate each node (`validate_node`)
- [ ] Validate complete workflow (`validate_workflow`)
- [ ] Test with sample data
- [ ] Handle edge cases (empty data, errors)

### Deployment Phase
- [ ] Review workflow settings
- [ ] Activate workflow (via UI or API using `activateWorkflow` operation)
- [ ] Monitor first executions
- [ ] Document workflow purpose

---

## Common Gotchas

### 1. Webhook Data Location
```javascript
// WRONG - empty for webhooks
{{ $json.email }}

// CORRECT - webhook data under .body
{{ $json.body.email }}
```

### 2. Node Execution Order
Check workflow settings → Execution Order:
- v0: Top-to-bottom (legacy)
- v1: Connection-based (recommended)

### 3. Multiple Input Items
Use "Execute Once" mode or access first item:
```javascript
{{ $json[0].field }}
```

### 4. Expression Not Working
Ensure expressions are wrapped:
```javascript
// WRONG
$json.field

// CORRECT
{{ $json.field }}
```

---

## Quick Start Templates

### Simple Webhook → Slack
```
1. Webhook (POST /form-submit)
2. Set (map form fields)
3. Slack (post to #notifications)
```

### Scheduled Report
```
1. Schedule (daily 9 AM)
2. HTTP Request (fetch analytics)
3. Code (aggregate data)
4. Email (send report)
5. Error Trigger → Slack (notify on failure)
```

### Database Sync
```
1. Schedule (every 15 minutes)
2. Postgres (query new records)
3. IF (check if records exist)
4. MySQL (insert records)
5. Postgres (update sync timestamp)
```

### AI Assistant
```
1. Webhook (receive message)
2. AI Agent
   ├── OpenAI Chat Model
   ├── HTTP Request Tool
   └── Window Buffer Memory
3. Webhook Response (return reply)
```

---

## Best Practices

### Do
- Start with simplest pattern that solves your problem
- Plan structure before building
- Use error handling on all workflows
- Test with sample data before activation
- Use descriptive node names
- Document complex workflows

### Don't
- Build in one shot (iterate, avg 56s between edits)
- Skip validation before activation
- Ignore error scenarios
- Use complex patterns when simple ones work
- Hardcode credentials in parameters
- Deploy without testing

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `03-node-configuration` | Configure specific nodes |
| `04-mcp-tools-expert` | Find nodes and templates |
| `05-code-javascript` | Write Code node logic |
| `07-expression-syntax` | Write expressions correctly |
| `08-validation-expert` | Validate and fix errors |
