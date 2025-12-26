# n8n Workflow Architect

> **Strategic automation architecture advisor - decide what to build and how**

## Overview

This skill helps with strategic planning for automation projects: analyzing tech stacks, deciding between n8n vs Python vs hybrid approaches, and ensuring production readiness.

---

## When to Use This Skill

Use when:
- Planning a new automation project
- Evaluating if n8n is right for a use case
- Deciding between n8n, Python, or hybrid
- Analyzing business tech stack compatibility
- Preparing for production deployment

---

## Tool Selection Matrix

### Use n8n When

| Condition | Reason |
|-----------|--------|
| OAuth authentication required | n8n manages token lifecycle automatically |
| Non-technical maintainers | Visual workflows are self-documenting |
| Multi-day processes with waits | Built-in Wait node handles suspension |
| Standard SaaS integrations | Pre-built nodes eliminate boilerplate |
| < 5,000 records per execution | Within memory limits |
| < 20 nodes of business logic | Maintains visual clarity |

### Use Python When

| Condition | Reason |
|-----------|--------|
| > 5,000 records to process | Stream processing, memory management |
| > 20MB files | Chunked processing capabilities |
| Complex algorithms | Code is more maintainable than 50+ nodes |
| Cutting-edge AI libraries | Access to latest packages |
| Heavy data transformation | Pandas, NumPy optimization |
| Custom ML models | Full Python ecosystem access |

### Use Hybrid Approach When

Complex systems benefit from both:

```
n8n (Orchestration Layer)
├── Webhooks & triggers
├── OAuth authentication
├── User-facing integrations
├── Flow coordination
│
└── Calls Python Service (Processing Layer)
    ├── Heavy computation
    ├── Complex logic
    ├── AI/ML operations
    └── Returns results to n8n
```

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
  ├─► Processing > 5,000 records? ───────────────► Use Python
  │
  ├─► Files > 20MB? ─────────────────────────────► Use Python
  │
  ├─► Cutting-edge AI/ML? ───────────────────────► Use Python
  │
  ├─► Complex algorithm (would need 20+ nodes)? ─► Use Python
  │
  └─► Mix of above? ─────────────────────────────► Use Hybrid
```

---

## Business Stack Analysis

### Common SaaS Categories

| Category | Examples | n8n Support | Auth Type |
|----------|----------|-------------|-----------|
| E-commerce | Shopify, WooCommerce, BigCommerce | Native nodes | OAuth |
| CRM | HubSpot, Salesforce, Zoho CRM | Native nodes | OAuth |
| Marketing | Klaviyo, Mailchimp, ActiveCampaign | Native nodes | API Key/OAuth |
| Productivity | Notion, Airtable, Google Sheets | Native nodes | OAuth |
| Communication | Slack, Discord, Teams | Native nodes | OAuth |
| Payments | Stripe, PayPal, Square | Native nodes | API Key |
| Support | Zendesk, Intercom, Freshdesk | Native nodes | API Key/OAuth |
| AI/ML | OpenAI, Anthropic, Hugging Face | Native nodes | API Key |

### Stack Analysis Template

When analyzing a user's stack:

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
- Processing needs: [Simple transforms / Complex logic]

### Next Steps:
1. [Specific workflow pattern to use]
2. [Nodes to configure]
3. [Validation approach]
```

---

## Common Business Scenarios

### Scenario 1: E-commerce Automation
**Stack**: Shopify + Klaviyo + Slack + Google Sheets

**Verdict**: Pure n8n
- All services have native nodes
- OAuth handled automatically
- Standard webhook patterns

### Scenario 2: AI-Powered Lead Qualification
**Stack**: Typeform + HubSpot + OpenAI + Custom Scoring

**Verdict**: Hybrid
- n8n: Typeform webhook, HubSpot sync, notifications
- Code Node: Complex scoring algorithm, AI prompts

### Scenario 3: Data Pipeline / ETL
**Stack**: PostgreSQL + BigQuery + 50k+ daily records

**Verdict**: Python with n8n Trigger
- n8n: Schedule trigger, success/failure notifications
- Python: Batch processing, streaming, transformations
- Reason: Memory limits in n8n for large datasets

### Scenario 4: Multi-Step Approval Workflow
**Stack**: Slack + Notion + Email + 3-day wait periods

**Verdict**: Pure n8n
- Built-in Wait node for delays
- Native Slack/Notion integrations
- Human approval patterns built-in

---

## Production Readiness Checklist

Before any automation goes live:

### Observability
- [ ] Error notification workflow exists
- [ ] Execution logging enabled
- [ ] Health check for critical paths
- [ ] Alerting by severity configured

### Idempotency
- [ ] Duplicate webhook handling
- [ ] Check-before-create patterns
- [ ] Idempotency keys for payments
- [ ] Safe re-run capability

### Cost Awareness
- [ ] AI API costs calculated
- [ ] Rate limits documented
- [ ] Caching strategy for repeated calls
- [ ] Model right-sizing (use smaller models when possible)

### Operational Control
- [ ] Kill switch accessible to non-technical staff
- [ ] Approval queues for high-stakes actions
- [ ] Audit trail for all actions
- [ ] Configuration externalized (not hardcoded)

### Security
- [ ] Credentials stored securely (n8n credentials, not in code)
- [ ] Webhook signatures verified (for payment providers)
- [ ] Input validation on all external data
- [ ] No secrets in workflow parameters

---

## Red Flags to Watch

| Red Flag | Risk | Recommendation |
|----------|------|----------------|
| "AI does everything" | Cost explosion, unpredictability | Scope AI to specific tasks, cache results |
| "Process millions of rows" | Memory crashes | Python with streaming, not n8n loops |
| "Workflow has 50 nodes" | Unmaintainable | Consolidate to code or split workflows |
| "Add error handling later" | Silent failures | Build error handling from day one |
| "Works on any input" | Fragile system | Define and validate expected inputs |
| "The intern maintains it" | Single point of failure | Document thoroughly, use n8n for clarity |

---

## Architecture Patterns

### Pattern 1: Simple Automation
```
Trigger → Transform → Action → Notify
```
**Use for**: Single-purpose automations, notifications

### Pattern 2: Data Pipeline
```
Schedule → Fetch → Transform → Store → Report
```
**Use for**: ETL, data sync, reporting

### Pattern 3: Orchestrator
```
Trigger → Router → [Sub-workflow 1]
                 → [Sub-workflow 2]
                 → [Sub-workflow 3]
        → Aggregate → Output
```
**Use for**: Complex multi-step processes

### Pattern 4: Human-in-the-Loop
```
Trigger → Process → Wait (Form) → Branch
                                 → Approved → Action
                                 → Rejected → Notify
```
**Use for**: Approval workflows, review processes

### Pattern 5: Hybrid Integration
```
n8n: Webhook → Auth → Call Python API → Handle Response → Notify
Python API: Receive → Heavy Processing → Return Result
```
**Use for**: Complex computation with n8n orchestration

---

## MCP Tools for Architecture

Use these tools during planning:

| Planning Phase | MCP Tool | Purpose |
|----------------|----------|---------|
| Stack analysis | `search_nodes` | Verify node availability |
| Pattern selection | `search_templates` | Find similar workflows |
| Feasibility check | `get_node` | Understand capabilities |
| Template reference | `get_template` | Study existing patterns |

---

## Skill Handoff Guide

After architectural decision, hand off to:

| Decision | Next Skill |
|----------|------------|
| Pattern identified | `02-workflow-patterns` |
| Specific nodes needed | `03-node-configuration` |
| Code node required | `05-code-javascript` or `06-code-python` |
| Expressions needed | `07-expression-syntax` |
| Ready to validate | `08-validation-expert` |

---

## Summary

**This skill answers**: "Given my business stack and requirements, what's the smartest way to build this automation?"

**Key outputs**:
1. Stack compatibility analysis
2. n8n vs Python vs Hybrid recommendation
3. Production readiness guidance
4. Pattern and skill handoffs

**Philosophy**: Viability over possibility - build systems that survive production.
