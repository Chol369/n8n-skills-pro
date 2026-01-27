# n8n Workflow Architect

> **Strategic automation architecture advisor - decide what to build and how**

## Overview

This skill helps with strategic planning for automation projects: analyzing tech stacks, deciding between n8n vs Python vs hybrid approaches, designing AI agent architectures, and ensuring production readiness.

---

## When to Use This Skill

Use when:
- Planning a new automation project
- Evaluating if n8n is right for a use case
- Deciding between n8n, Python, or hybrid approaches
- Designing AI agent workflows
- Analyzing business tech stack compatibility
- Preparing for production deployment
- Optimizing workflow costs and performance

---

## Tool Selection Matrix

### Use n8n When

| Condition | Reason |
|-----------|--------|
| OAuth authentication required | n8n manages token lifecycle automatically |
| Non-technical maintainers | Visual workflows are self-documenting |
| Multi-day processes with waits | Built-in Wait node handles suspension |
| Standard SaaS integrations | 800+ pre-built nodes eliminate boilerplate |
| < 5,000 records per execution | Within memory limits |
| < 20 nodes of business logic | Maintains visual clarity |
| Rapid prototyping needed | Visual canvas validates flow in minutes |
| Webhook-driven automation | Native webhook handling with retry logic |

### Use Python When

| Condition | Reason |
|-----------|--------|
| > 5,000 records to process | Stream processing, memory management |
| > 20MB files | Chunked processing capabilities |
| Complex algorithms | Code is more maintainable than 50+ nodes |
| Cutting-edge AI libraries | Access to latest packages |
| Heavy data transformation | Pandas, NumPy optimization |
| Custom ML models | Full Python ecosystem access |
| Version control essential | Git-native with proper CI/CD |
| High-traffic (>2,500 concurrent) | Better scaling characteristics |

### Use Hybrid Approach When

Complex systems benefit from both:

```
n8n (Orchestration Layer)
├── Webhooks & triggers
├── OAuth authentication
├── User-facing integrations
├── Flow coordination & branching
├── Human-in-the-loop approvals
│
└── Calls Python Service (Processing Layer)
    ├── Heavy computation (>5k records)
    ├── Complex algorithms
    ├── AI/ML model inference
    ├── Data transformation pipelines
    └── Returns results to n8n
```

**Hybrid Economics**: When AI API costs spike, replace expensive n8n AI nodes with focused Python workers that return compact outputs. Keep n8n for orchestration where branching and retries benefit from visual interface.

---

## Quick Decision Tree

```
START: User wants to automate something
  │
  ├─► Does it involve OAuth? ────────────────────► Use n8n
  │
  ├─► Will non-developers maintain it? ──────────► Use n8n
  │
  ├─► Does it need to wait days/weeks? ──────────► Use n8n
  │
  ├─► Need rapid prototype validation? ──────────► Use n8n
  │
  ├─► Processing > 5,000 records? ───────────────► Use Python
  │
  ├─► Files > 20MB? ─────────────────────────────► Use Python
  │
  ├─► Cutting-edge AI/ML? ───────────────────────► Use Python
  │
  ├─► Complex algorithm (would need 20+ nodes)? ─► Use Python
  │
  ├─► Version control critical? ─────────────────► Use Python
  │
  └─► Mix of above? ─────────────────────────────► Use Hybrid
```

---

## Workflow Architecture Patterns

### Pattern 1: Simple Automation
```
Trigger → Transform → Action → Notify
```
**Use for**: Single-purpose automations, notifications, alerts
**Node count**: 3-6 nodes
**Example**: New form submission → Extract data → Create CRM record → Slack notification

### Pattern 2: Data Pipeline
```
Schedule → Fetch → Transform → Store → Report
```
**Use for**: ETL, data sync, reporting, daily digests
**Node count**: 5-10 nodes
**Example**: Daily → Fetch sales data → Aggregate → Update dashboard → Email summary

### Pattern 3: Orchestrator (Sub-workflow Pattern)
```
Trigger → Router → [Sub-workflow 1]
                 → [Sub-workflow 2]
                 → [Sub-workflow 3]
        → Aggregate → Output
```
**Use for**: Complex multi-step processes, modular systems
**Benefits**: 40-60% execution time reduction, isolated testing, memory efficiency

### Pattern 4: Human-in-the-Loop
```
Trigger → Process → Wait (Form/Slack) → Branch
                                       → Approved → Action
                                       → Rejected → Notify
```
**Use for**: Approval workflows, review processes, high-stakes decisions
**Key nodes**: Wait, Slack (send and wait), Form Trigger

### Pattern 5: Hybrid Integration
```
n8n: Webhook → Auth → Call Python API → Handle Response → Notify
Python API: Receive → Heavy Processing → Return Result
```
**Use for**: Complex computation with n8n orchestration

### Pattern 6: AI Agent Workflow
```
Chat Trigger → AI Agent ← Language Model
                       ← Tool 1 (HTTP Request)
                       ← Tool 2 (Code)
                       ← Tool 3 (Vector Store)
                       ← Memory (optional)
            → Output/Stream Response
```
**Use for**: Conversational AI, autonomous task execution, RAG systems

---

## AI Agent Architecture Guide

### Core Components

Every AI Agent workflow requires:

1. **Trigger**: Chat Trigger (webhook-based) or Manual Trigger
2. **AI Agent**: Orchestrator that manages conversation and tool use
3. **Language Model**: GPT-4, Claude, Gemini connected via `ai_languageModel`
4. **Tools**: Connected via `ai_tool` (HTTP Request, Code, Vector Store)
5. **Optional**: Memory (`ai_memory`), Output Parser (`ai_outputParser`)

### AI Agent Patterns

#### Single Agent with Tools
```
Chat Trigger → AI Agent ← OpenAI GPT-4
                       ← HTTP Request Tool
                       ← Code Tool
            → Response
```
**Use when**: Simple autonomous tasks, Q&A bots

#### ReAct Pattern (Reason + Act)
Encode in system prompt:
1. **THINK**: Analyze request, state reasoning
2. **ACT**: Execute one action
3. **OBSERVE**: Examine tool response
4. **REFLECT**: Evaluate progress

**Trade-off**: More reliable but slower/costlier due to reasoning tokens

#### Multi-Agent Hierarchy
```
Coordinator Agent ← Research Agent (sub-agent)
                  ← Data Analyst Agent (sub-agent)
                  ← Writer Agent (sub-agent)
```
**Use when**: Complex tasks requiring specialized expertise

#### RAG (Retrieval-Augmented Generation)
```
Document Loader → Text Splitter → Vector Store ← Embeddings
                                              ↓
Chat Trigger → AI Agent ← Language Model
                       ← Vector Store Tool ← Vector Store
            → Grounded Response
```
**Use when**: Knowledge bases, documentation search, enterprise Q&A

### AI Connection Types

| Type | From | To | Purpose |
|------|------|-----|---------|
| `ai_languageModel` | OpenAI, Claude, Gemini | AI Agent | Required brain |
| `ai_tool` | HTTP Tool, Code Tool | AI Agent | Agent capabilities |
| `ai_memory` | Window Buffer, Summary | AI Agent | Conversation history |
| `ai_outputParser` | Structured Parser | AI Agent | Formatted responses |
| `ai_embedding` | Embeddings node | Vector Store | Document encoding |
| `ai_vectorStore` | Pinecone, Qdrant | Vector Store Tool | Knowledge retrieval |

### Streaming vs Standard Response

**Standard Mode**: AI Agent processes fully, then returns complete response
- Use for: Backend processing, when response speed isn't critical
- AI Agent CAN have main output connections

**Streaming Mode**: Response streams back as it's generated
- Use for: User-facing chat interfaces
- AI Agent must NOT have main output connections
- Set `responseMode: "streaming"` on Chat Trigger

---

## Modular Design Principles

### The 5-10 Node Rule

Break workflows into modules with 5-10 nodes each:
- **Single Responsibility**: Each sub-workflow handles one task
- **Memory Efficiency**: n8n releases memory when sub-workflow completes
- **Testability**: Test modules in isolation
- **Reusability**: Share modules across multiple parent workflows

### Refactoring Monolithic Workflows

1. **Identify repetitive patterns** in your large workflow
2. **Extract to sub-workflow** using Execute Sub-workflow node
3. **Define clear inputs** using Sub-workflow Trigger
4. **Replace original nodes** with single Execute node

### Execute Sub-workflow Modes

| Mode | Behavior | Use When |
|------|----------|----------|
| Run once with all items | Passes all items in single execution | Batch processing |
| Run once for each item | Executes separately per item | Independent item processing |

### Error Handling in Sub-workflows

By default, sub-workflow errors stop the parent workflow. For resilient systems:
- Enable "Continue on Fail" in Execute Sub-workflow node
- Capture errors using Error Trigger in dedicated error workflow
- Log failed items to DLQ (Dead Letter Queue) for manual review

---

## Cost Optimization Strategies

### Token Management

```
Cost Hierarchy (Highest to Lowest):
1. GPT-4 / Claude Opus (most expensive)
2. GPT-4-turbo / Claude Sonnet
3. GPT-3.5-turbo / Claude Haiku (cheapest)
```

**Right-size your models**:
- Use smaller models for classification, extraction, simple Q&A
- Reserve powerful models for complex reasoning, code generation

### Centralized Routing Layer

Create a single LLM "switchboard" workflow:
```
Any Workflow → LLM Router → [Cheap Model for simple tasks]
                          → [Powerful Model for complex tasks]
                          → Log costs to tracking sheet
```

**Benefits**:
- Change models in ONE place, not 48 nodes
- Implement cost caps and alerts
- Track usage across all workflows

### Token Batch Limits

| Model Tier | Max Tokens per Batch |
|------------|---------------------|
| Nano (Haiku) | 10,000 tokens |
| Mini (GPT-3.5) | 64,000 tokens |
| Complex prompts | Cut limits in half |

### Preventing Runaway Costs

- **Set `maxIterations`** on AI Agent (default 10, max 50)
- **Add loop counters** to prevent infinite loops
- **Implement circuit breakers** for spending caps
- **Cache repeated AI calls** when inputs are similar
- **Filter data before AI processing** to minimize tokens

---

## Error Handling Patterns

### Centralized Error Workflow

Create one error workflow for your entire n8n instance:
```
Error Trigger → Extract Error Context → Route by Severity
                                       → Critical → PagerDuty + Slack
                                       → Warning → Slack only
                                       → Info → Log to database
```

**Set as error workflow** in each production workflow's settings.

### Retry Strategies

| Strategy | When to Use | Implementation |
|----------|-------------|----------------|
| Simple Retry | Transient failures | Enable "Retry on Fail" (3-5 tries, 5s wait) |
| Exponential Backoff | Rate limits, API overload | Increase wait time: 1s → 2s → 4s → 8s |
| Circuit Breaker | Persistent failures | After X failures, stop retrying, alert human |

### Dead Letter Queue (DLQ)

For non-retryable errors:
```
Main Workflow → [Error Branch] → HTTP Request to DLQ Webhook
                                              ↓
DLQ Workflow: Webhook → Log Error Context → Store in Airtable/DB → Alert Admin
```

**DLQ captures**:
- Original input data
- Error message and stack trace
- Timestamp and workflow context
- Enables manual recovery or replay

### Graceful Degradation

When services fail, do something simpler:
```
Primary Path: AI Summarization → [If fails] → Fallback: Extract first 500 chars
```

---

## Production Readiness Checklist

### Observability
- [ ] Error notification workflow exists and tested
- [ ] Execution logging enabled (save successful + failed)
- [ ] Health check endpoint for critical workflows
- [ ] Alerting by severity configured (Slack/PagerDuty)
- [ ] AI token usage tracking implemented

### Idempotency
- [ ] Duplicate webhook handling (check-before-create)
- [ ] Idempotency keys for payments/critical operations
- [ ] Safe re-run capability (no duplicate side effects)
- [ ] Unique identifiers for all created records

### Security
- [ ] Credentials stored in n8n Credentials (never hardcoded)
- [ ] Webhook signatures verified (payment providers, GitHub)
- [ ] Input validation on all external data
- [ ] TLS/SSL for all data in transit
- [ ] No secrets in workflow parameters or logs

### Operational Control
- [ ] Kill switch accessible to non-technical staff (deactivate workflow)
- [ ] Approval queues for high-stakes actions
- [ ] Audit trail for all actions (who, what, when)
- [ ] Configuration externalized (environment variables)
- [ ] Fallback language model configured for AI workflows

### Infrastructure (Self-hosted)
- [ ] PostgreSQL database (not SQLite)
- [ ] Queue mode with Redis for scaling
- [ ] Nightly backups configured
- [ ] Auto-scaling behind load balancer
- [ ] Separate staging and production environments

---

## Red Flags to Watch

| Red Flag | Risk | Recommendation |
|----------|------|----------------|
| "AI does everything" | Cost explosion, unpredictability | Scope AI to specific tasks, cache results |
| "Process millions of rows" | Memory crashes | Python with streaming, not n8n loops |
| "Workflow has 50 nodes" | Unmaintainable, slow UI | Split into sub-workflows |
| "Add error handling later" | Silent failures in production | Build error handling from day one |
| "Works on any input" | Fragile system | Define and validate expected inputs |
| "The intern maintains it" | Single point of failure | Document thoroughly, use visual clarity |
| "No version control" | Can't rollback, no audit trail | Export JSON to Git, use staging environment |
| "AI Agent loops forever" | Token costs explode | Set maxIterations limit (5-10) |

---

## Business Stack Analysis

### Common SaaS Categories

| Category | Examples | n8n Support | Auth Type |
|----------|----------|-------------|-----------|
| E-commerce | Shopify, WooCommerce, Magento | Native nodes | OAuth/API Key |
| CRM | HubSpot, Salesforce, Zoho CRM | Native nodes | OAuth |
| Marketing | Mailchimp, ActiveCampaign, SendGrid | Native nodes | API Key/OAuth |
| Productivity | Notion, Airtable, Google Sheets | Native nodes | OAuth |
| Communication | Slack, Discord, Teams | Native nodes | OAuth |
| Payments | Stripe, PayPal, Square | Native nodes | API Key |
| Support | Zendesk, Intercom, Freshdesk | Native nodes | API Key/OAuth |
| AI/ML | OpenAI, Anthropic, Google AI | Native nodes | API Key |
| Vector DBs | Pinecone, Qdrant, Supabase | Native nodes | API Key |
| Databases | PostgreSQL, MySQL, MongoDB | Native nodes | Connection string |

### Stack Analysis Template

```markdown
## Stack Analysis: [Business Type]

### Services Identified:
1. **[Service 1]** - [Category] - n8n Support: [Yes/Partial/No]
2. **[Service 2]** - [Category] - n8n Support: [Yes/Partial/No]

### Recommended Approach: [n8n / Python / Hybrid]

**Rationale:**
- [Key decision factor 1]
- [Key decision factor 2]

### Integration Complexity: [Low/Medium/High]
- Auth complexity: [Simple API keys / OAuth required]
- Data volume: [Estimate based on use case]
- Processing needs: [Simple transforms / Complex logic / AI required]

### Architecture Pattern: [Pattern name from above]

### Cost Considerations:
- AI API usage: [High/Medium/Low/None]
- Execution frequency: [Real-time / Hourly / Daily]
- Estimated monthly executions: [Number]

### Next Steps:
1. [Specific workflow pattern to use]
2. [Nodes to configure]
3. [Validation approach]
```

---

## Common Business Scenarios

### Scenario 1: E-commerce Automation
**Stack**: Shopify + Mailchimp + Slack + Google Sheets

**Verdict**: Pure n8n
- All services have native nodes
- OAuth handled automatically
- Standard webhook patterns

**Pattern**: Simple Automation + scheduled Data Pipeline

### Scenario 2: AI-Powered Lead Qualification
**Stack**: Typeform + HubSpot + OpenAI + Custom Scoring

**Verdict**: Hybrid (n8n + AI Agent)
- n8n: Typeform webhook, HubSpot sync, notifications
- AI Agent: Lead scoring with GPT-4, qualification logic
- Code Tool: Complex scoring algorithm

**Pattern**: AI Agent Workflow with Human-in-the-Loop approval

### Scenario 3: Data Pipeline / ETL
**Stack**: PostgreSQL + BigQuery + 50k+ daily records

**Verdict**: Python with n8n Trigger
- n8n: Schedule trigger, success/failure notifications
- Python: Batch processing, streaming, transformations
- Reason: Memory limits in n8n for large datasets

**Pattern**: Hybrid Integration

### Scenario 4: Multi-Step Approval Workflow
**Stack**: Slack + Notion + Email + 3-day wait periods

**Verdict**: Pure n8n
- Built-in Wait node for delays
- Native Slack/Notion integrations
- Human approval patterns built-in

**Pattern**: Human-in-the-Loop

### Scenario 5: Enterprise Knowledge Assistant
**Stack**: Confluence + Slack + OpenAI + Pinecone

**Verdict**: n8n AI Agent with RAG
- Document loading from Confluence
- Vector storage in Pinecone
- AI Agent with Vector Store Tool for retrieval
- Slack integration for user queries

**Pattern**: RAG + AI Agent Workflow

---

## MCP Tools for Architecture

Use these tools during planning:

| Planning Phase | MCP Tool | Purpose |
|----------------|----------|---------|
| Stack analysis | `search_nodes` | Verify node availability |
| Pattern selection | `search_templates` | Find similar workflows |
| Feasibility check | `get_node` | Understand capabilities |
| Template reference | `get_template` | Study existing patterns |
| AI workflow planning | `ai_agents_guide` | Architecture guidance |
| Validation | `validate_workflow` | Check before deployment |

---

## Skill Handoff Guide

After architectural decision, hand off to:

| Decision | Next Skill |
|----------|------------|
| Pattern identified | `02-workflow-patterns` |
| Specific nodes needed | `03-node-configuration` |
| AI Agent workflow | `04-mcp-tools-expert` + AI Agents guide |
| Code node required | `05-code-javascript` or `06-code-python` |
| Expressions needed | `07-expression-syntax` |
| Ready to validate | `08-validation-expert` |

---

## Summary

**This skill answers**: "Given my business stack and requirements, what's the smartest way to build this automation?"

**Key outputs**:
1. Stack compatibility analysis
2. n8n vs Python vs Hybrid recommendation
3. Architecture pattern selection
4. AI agent design (if applicable)
5. Cost optimization strategy
6. Production readiness guidance
7. Pattern and skill handoffs

**Philosophy**: Viability over possibility - build systems that survive production.

---

## Sources & Further Reading

- [n8n Best Practices 2026](https://michaelitoback.com/n8n-workflow-best-practices/)
- [AI Agent Architectures Guide](https://www.productcompass.pm/p/ai-agent-architectures)
- [n8n vs Python Comparison](https://zenvanriel.nl/ai-engineer-blog/n8n-vs-python-ai-automation/)
- [Production AI Agents Best Practices](https://blog.n8n.io/best-practices-for-deploying-ai-agents-in-production/)
- [Error Handling Patterns](https://wotai.co/blog/error-handling-patterns-production-workflows)
- [Cost Optimization Guide](https://www.clixlogix.com/cost-optimization-guide-for-n8n-ai-workflows/)
- [Sub-workflows Documentation](https://docs.n8n.io/flow-logic/subworkflows/)
- [n8n AI Agentic Workflows](https://blog.n8n.io/ai-agentic-workflows/)
