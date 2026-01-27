# n8n Workflow Patterns

> **Proven architectural patterns for building production-ready n8n workflows**

## Overview

This skill covers the 7 core workflow patterns that handle 95%+ of automation use cases, plus advanced patterns for scaling, error handling, and data orchestration.

---

## The 7 Core Patterns

### 1. Webhook Processing (Most Common)

**Pattern**: Receive HTTP -> Validate -> Process -> Respond/Notify

```
Webhook -> Validate -> Transform -> Action -> Response
```

**Use when**:
- Receiving data from external systems
- Building integrations (Slack commands, form submissions, payment webhooks)
- Need instant response to events

**Production Implementation**:
```json
{
  "nodes": [
    {"type": "n8n-nodes-base.webhook", "name": "Webhook", "responseMode": "responseNode"},
    {"type": "n8n-nodes-base.if", "name": "Validate Signature"},
    {"type": "n8n-nodes-base.set", "name": "Transform Data"},
    {"type": "n8n-nodes-base.httpRequest", "name": "Process"},
    {"type": "n8n-nodes-base.respondToWebhook", "name": "Return Response"}
  ]
}
```

**Response Mode Options**:
| Mode | Use Case |
|------|----------|
| `responseNode` | Full control via Respond to Webhook node |
| `onReceived` | Quick 200 acknowledgment (for async processing) |
| `lastNode` | Return data from final node |

**Key Considerations**:
- Webhook data is under `$json.body` (not `$json` directly)
- Use `responseMode: "onReceived"` for quick acknowledgment when processing takes time
- Validate signatures for security (Stripe, GitHub, etc.)
- Set appropriate timeout for long-running operations
- Return meaningful HTTP status codes

---

### 2. HTTP API Integration

**Pattern**: Trigger -> Fetch API -> Transform -> Store/Act

```
Trigger -> HTTP Request -> Transform -> Database/Service -> Error Handler
```

**Use when**:
- Fetching data from REST APIs
- Synchronizing with third-party services
- Building data pipelines

**Pagination Pattern**:
```
Schedule -> Loop Over Items -> HTTP Request (page N) -> Aggregate -> Process
         ^                                              |
         |_______________ hasMore = true _______________|
```

**HTTP Request Best Practices**:
| Setting | Recommendation |
|---------|----------------|
| Retry On Fail | Enable for transient errors |
| Max Retries | 3-5 for external APIs |
| Timeout | 30-60 seconds |
| Response Format | JSON (auto-parsed) |

**Key Considerations**:
- Handle pagination for large datasets
- Implement retry logic with exponential backoff
- Use authentication credentials properly (never hardcode)
- Handle rate limiting with Wait nodes

---

### 3. Database Operations (ETL)

**Pattern**: Schedule -> Query -> Transform -> Write -> Verify

```
Schedule -> Read Source -> Transform -> Write Target -> Confirm
```

**Use when**:
- ETL workflows
- Database synchronization
- Data migrations
- Backup operations

**Incremental Sync Pattern**:
```
Schedule -> Get Last Sync Time -> Query New Records -> Transform -> Upsert -> Update Sync Time
```

**Key Considerations**:
- Use transactions where possible
- Implement idempotency (check before insert)
- Handle connection failures gracefully
- Track sync timestamps for incremental processing
- Use batch sizes appropriate for your data volume (10-50 items)

---

### 4. AI Agent Workflow

**Pattern**: Trigger -> AI Agent (Model + Tools + Memory) -> Output

```
Webhook -> AI Agent -+- Language Model
                     +- Tool 1 (HTTP Request)
                     +- Tool 2 (Database)
                     +- Memory (Buffer/Vector)
         -> Response
```

**Use when**:
- Building conversational AI
- Need AI with tool access
- Multi-step reasoning tasks
- RAG (Retrieval Augmented Generation)

**AI Connection Types** (8 types):
| Connection Type | Purpose | Example Nodes |
|-----------------|---------|---------------|
| `ai_languageModel` | LLM provider | OpenAI, Anthropic, Groq |
| `ai_tool` | Tools the agent can use | HTTP Request, Database, Custom |
| `ai_memory` | Conversation memory | Buffer Window, Postgres, Redis |
| `ai_outputParser` | Structure output | Structured Output Parser |
| `ai_textSplitter` | Chunk documents | Recursive Text Splitter |
| `ai_document` | Document loaders | PDF, HTML, JSON |
| `ai_embedding` | Embedding models | OpenAI Embeddings, Cohere |
| `ai_vectorStore` | Vector databases | Pinecone, Qdrant, Supabase |

**Agent Architecture Patterns**:
| Pattern | Use Case | Complexity |
|---------|----------|------------|
| Single Agent | Simple Q&A, basic tasks | Low |
| ReAct Agent | Multi-step reasoning with tools | Medium |
| Multi-Agent | Specialized agents for domains | High |
| RAG Agent | Knowledge retrieval + generation | Medium |

**Key Considerations**:
- Manage token costs (use appropriate model size)
- Implement conversation memory for context
- Define clear tool descriptions
- Use streaming for better UX in chat applications
- Consider `usePlannerAgent: true` for complex multi-step tasks

---

### 5. Scheduled Tasks

**Pattern**: Schedule -> Fetch -> Process -> Deliver -> Log

```
Schedule Trigger -> Gather Data -> Process -> Deliver -> Log Success/Failure
```

**Use when**:
- Recurring reports or summaries
- Periodic data fetching
- Maintenance tasks
- Cleanup jobs

**Cron Expressions**:
| Schedule | Cron Expression |
|----------|-----------------|
| Every hour | `0 * * * *` |
| Daily at 9 AM | `0 9 * * *` |
| Weekly Monday 8 AM | `0 8 * * 1` |
| First of month | `0 0 1 * *` |
| Every 15 minutes | `*/15 * * * *` |
| Weekdays only 6 PM | `0 18 * * 1-5` |

**Key Considerations**:
- Set appropriate timezone in workflow settings
- Handle failures with error workflows
- Log execution results for auditing
- Consider execution overlap for long-running tasks
- Use `$now` and `$today` for date calculations

---

### 6. Sub-Workflow Pattern (Modular Design)

**Pattern**: Parent Workflow -> Execute Sub-Workflow -> Process Results

```
Main Workflow -> Execute Sub-Workflow -> Aggregate Results -> Continue
                      |
                 Sub-Workflow: Input -> Process -> Output
```

**Use when**:
- Reusing common logic across workflows
- Breaking complex workflows into manageable pieces
- Parallel processing of different tasks
- Human approval workflows

**n8n 2.0+ Enhancement**:
Sub-workflows can now return data to parent workflows after send-and-wait or approval steps. This enables:
- Human-in-the-loop approvals
- Pause and resume patterns
- Multi-step verification flows

**Data Passing**:
| Direction | Method |
|-----------|--------|
| Parent -> Child | Execute Workflow node parameters |
| Child -> Parent | Return data from last node (Output Node) |
| Binary Data | Pass via workflow execution context |

**Key Considerations**:
- Keep sub-workflows focused (single responsibility)
- Use "When Executed by Another Workflow" trigger
- Test sub-workflows independently
- Handle errors in sub-workflows appropriately
- Use `waitForSubWorkflow: true` when you need results

---

### 7. Event-Driven Architecture

**Pattern**: Event Source -> Queue -> Worker -> Process -> Acknowledge

```
Webhook (fast ack) -> Queue (RabbitMQ/SQS) -> Worker Workflow -> Process -> Update Status
```

**Use when**:
- Handling bursty traffic (payments, checkouts, Git pushes)
- Need guaranteed delivery
- Decoupling producers and consumers
- High-throughput scenarios

**Queue Integration Options**:
| Queue | Use Case | n8n Node |
|-------|----------|----------|
| RabbitMQ | Enterprise messaging | RabbitMQ / RabbitMQ Trigger |
| AWS SQS | Cloud-native queueing | AWS SQS |
| Redis Streams | Lightweight, fast | Redis |
| Google Pub/Sub | GCP integration | Google Cloud Pub/Sub |

**Key Considerations**:
- Use queue mode for production scaling
- Implement dead letter queues for failed messages
- Handle message acknowledgment properly
- Consider message ordering requirements
- Use idempotency keys to prevent duplicate processing

---

## Data Flow Patterns

### Linear Flow
```
Trigger -> Transform -> Action -> End
```
**Use for**: Simple workflows with single path

### Branching Flow (IF/Switch)
```
Trigger -> IF -+- True Path -> Action A
               +- False Path -> Action B
```
**Use for**: Conditional processing based on data

### Parallel Processing
```
Trigger -+- Branch 1 -+
         +- Branch 2 -+- Merge -> Output
         +- Branch 3 -+
```
**Use for**: Independent operations that can run simultaneously

### Loop Pattern (Split In Batches)
```
Trigger -> Loop Over Items -> Process -> [Loop back until done] -> Continue
```
**Use for**: Processing large datasets in manageable chunks

**Performance Guidelines**:
| Array Size | Recommended Approach |
|------------|---------------------|
| < 100 items | Direct processing (no batching needed) |
| 100-1000 items | Split In Batches (batch size 10-50) |
| > 1000 items | Sub-workflows with queue pattern |
| > 10000 items | External processing or dedicated ETL |

**Loop Context Variables**:
```javascript
// Check if loop has more items
{{ $("Loop Over Items").context["noItemsLeft"] }}

// Get current iteration index
{{ $("Loop Over Items").context["currentRunIndex"] }}
```

### Fan-Out / Fan-In
```
Trigger -> Split -> [Multiple parallel processes] -> Aggregate -> Continue
```
**Use for**: Processing items in parallel, then collecting results

---

## Merge Patterns

### Merge Node Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| Append | Combine outputs sequentially | Collecting data from multiple sources |
| Combine by Position | Match items by index | Parallel arrays of related data |
| Combine by Matching Fields | Join on key field | Database-style joins |
| SQL Query | Custom SQL on inputs | Complex data transformations |
| All Combinations | Cartesian product | Generating permutations |

**Merge vs Aggregate**:
| Node | Purpose |
|------|---------|
| Merge | Combine streams from different branches |
| Aggregate | Combine multiple items into single item (same branch) |

**Multi-Branch Merge Pattern** (3+ branches):
```
Branch 1 -+
Branch 2 -+- Merge (mode: Append, inputs: 3) -> Process
Branch 3 -+
```

---

## Error Handling Patterns

### 1. Error Workflow Pattern
```
Main Workflow (on error) -> Error Workflow -> Log + Alert -> Remediation
```

**Setup**:
1. Create dedicated error workflow with Error Trigger
2. Set error workflow in main workflow settings
3. Access error data via `$json.execution`, `$json.workflow`, `$json.error`

### 2. Retry On Fail Pattern
```
Node Settings:
- Retry On Fail: true
- Max Tries: 3-5
- Wait Between Tries: 1000-5000ms
```

**Recommended Retry Settings by Node Type**:
| Node Type | Retries | Wait (ms) | Backoff |
|-----------|---------|-----------|---------|
| HTTP Request | 3-5 | 2000 | Exponential |
| Database | 2-3 | 1000 | Linear |
| Email/Slack | 2 | 5000 | Linear |
| AI/LLM | 3 | 3000 | Exponential |

### 3. Dead Letter Queue (DLQ) Pattern
```
Main Workflow -> On Error -> HTTP Request to DLQ Webhook -> Store Failed Item
                                    |
DLQ Workflow -> Review -> Retry or Archive
```

**DLQ Implementation**:
1. Create DLQ workflow with Webhook trigger
2. In main workflow's error branch, POST failed item data to DLQ webhook
3. Store failed items in database/sheet for review
4. Implement manual retry or scheduled reprocessing

### 4. Circuit Breaker Pattern
```
Check Health -> IF (healthy) -> Process -> Update Success Count
                    |
               (unhealthy) -> Skip/Fallback -> Alert
```

**Implementation**:
- Track failure counts in external store (Redis, database)
- Check threshold before processing
- Auto-reset after cool-down period

### 5. Graceful Degradation Pattern
```
Try Primary -> On Error -> Try Fallback -> On Error -> Return Cached/Default
```

---

## Production Checklist

### Planning Phase
- [ ] Identify core pattern (webhook, API, database, AI, scheduled, sub-workflow, event-driven)
- [ ] Map data flow (input -> transform -> output)
- [ ] Plan error handling strategy (retries, DLQ, alerts)
- [ ] Consider scaling requirements (batching, queue mode)

### Implementation Phase
- [ ] Create workflow with appropriate trigger
- [ ] Use descriptive node names (action_target format)
- [ ] Keep workflows modular (5-10 nodes per workflow)
- [ ] Configure authentication via credentials (never hardcode)
- [ ] Add error handling (retry on fail, error workflow)
- [ ] Implement logging for critical operations

### Validation Phase
- [ ] Validate each node configuration
- [ ] Validate complete workflow structure
- [ ] Test with sample data (happy path)
- [ ] Test edge cases (empty data, errors, timeouts)
- [ ] Test with production-like volumes

### Deployment Phase
- [ ] Review workflow settings (timeout, retry, execution order)
- [ ] Set appropriate timezone
- [ ] Configure error workflow
- [ ] Activate workflow
- [ ] Monitor first executions
- [ ] Document workflow purpose and dependencies

---

## Common Gotchas

### 1. Webhook Data Location
```javascript
// WRONG - empty for webhooks
{{ $json.email }}

// CORRECT - webhook data under .body
{{ $json.body.email }}

// For query parameters
{{ $json.query.param }}

// For headers
{{ $json.headers["x-custom-header"] }}
```

### 2. Node Execution Order
Check workflow settings -> Execution Order:
- **v0**: Top-to-bottom (legacy, avoid)
- **v1**: Connection-based (recommended, default for new workflows)

### 3. Multiple Input Items
```javascript
// Access first item explicitly
{{ $json[0].field }}

// Or use "Execute Once" mode in node settings

// For aggregate operations, use Aggregate node first
```

### 4. Expression Syntax
```javascript
// WRONG - missing braces
$json.field

// CORRECT - expressions need double braces
{{ $json.field }}

// CORRECT - in Code node (no braces needed)
const value = $json.field;
```

### 5. Binary Data Handling
```javascript
// Access binary data from previous node
{{ $binary.data }}

// Specify binary property name
{{ $binary.attachment.fileName }}
```

### 6. Merge Node Timing
The Merge node waits for ALL inputs before executing. If one branch never completes, the merge will hang. Use timeouts or ensure all branches always produce output.

---

## Quick Start Templates

### Webhook -> Slack Notification
```
1. Webhook (POST /notify)
2. Set (extract message fields)
3. Slack (post to #channel)
4. Respond to Webhook (200 OK)
```

### Scheduled Report with Error Handling
```
1. Schedule Trigger (daily 9 AM)
2. HTTP Request (fetch analytics)
3. Code (aggregate data)
4. Email (send report)
---
Error Workflow:
1. Error Trigger
2. Slack (notify #alerts)
```

### Database Sync (Incremental)
```
1. Schedule (every 15 minutes)
2. Postgres (get last_sync_time from state table)
3. Postgres (query records WHERE updated_at > last_sync)
4. IF (records exist)
5. MySQL (upsert records)
6. Postgres (update last_sync_time)
```

### AI Chat Assistant with Memory
```
1. Webhook (receive message)
2. AI Agent
   +-- OpenAI Chat Model
   +-- HTTP Request Tool
   +-- Window Buffer Memory
3. Respond to Webhook (return reply)
```

### Event-Driven Order Processing
```
Producer Workflow:
1. Webhook (receive order)
2. Validate (check required fields)
3. RabbitMQ (publish to orders queue)
4. Respond to Webhook (202 Accepted)

Consumer Workflow:
1. RabbitMQ Trigger (orders queue)
2. Process Order (inventory, payment)
3. Update Database
4. Send Confirmation Email
```

---

## Best Practices Summary

### Do
- Start with the simplest pattern that solves your problem
- Plan structure before building (use 01-workflow-architect skill)
- Keep workflows modular (5-10 nodes max)
- Use error handling on ALL production workflows
- Test with realistic data volumes
- Use descriptive node names
- Document complex logic with Sticky Notes
- Use sub-workflows for reusable logic

### Don't
- Build monolithic workflows (break into sub-workflows)
- Skip validation before activation
- Ignore error scenarios
- Hardcode credentials in parameters
- Deploy without testing edge cases
- Use complex patterns when simple ones work
- Process large datasets without batching
- Forget to set timeouts on HTTP requests

---

## Sources & Further Reading

- [n8n Error Handling Docs](https://docs.n8n.io/flow-logic/error-handling/)
- [Sub-workflows Documentation](https://docs.n8n.io/flow-logic/subworkflows/)
- [Loop Over Items (Split in Batches)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/)
- [Merge Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.merge/)
- [n8n Queue Mode](https://docs.n8n.io/hosting/scaling/queue-mode/)
- [Seven N8N Workflow Best Practices for 2026](https://michaelitoback.com/n8n-workflow-best-practices/)
- [5 n8n Error Handling Techniques](https://www.aifire.co/p/5-n8n-error-handling-techniques-for-a-resilient-automation-workflow)
- [RabbitMQ Integration](https://n8n.io/integrations/rabbitmq/)
- [Merge vs Aggregate Nodes](https://www.vibepanda.io/resources/guide/n8n-merge-vs-aggregate-node)

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `01-workflow-architect` | Strategic planning, tool selection |
| `03-node-configuration` | Configure specific nodes |
| `04-mcp-tools-expert` | Find nodes and templates |
| `05-code-javascript` | Write Code node logic |
| `07-expression-syntax` | Write expressions correctly |
| `08-validation-expert` | Validate and fix errors |
| `09-community-nodes` | Community packages, AI tools, custom nodes |
