# n8n Validation Expert

> **Complete guide to interpreting errors, validating workflows, and ensuring production readiness**

## Overview

This skill covers workflow validation, error interpretation, and production readiness. It includes a complete error catalog, validation profiles (minimal, runtime, ai-friendly, strict), auto-fix tools, error handling patterns, and pre-deployment checklists. Use this when encountering validation errors or preparing workflows for production.

---

## Quick Reference

| Need | Tool/Action |
|------|-------------|
| Validate single node | `validate_node()` with profile |
| Validate full workflow | `n8n_validate_workflow()` |
| Auto-fix common issues | `n8n_autofix_workflow()` |
| Clean broken connections | `cleanStaleConnections` operation |
| Error handling setup | Error Trigger workflow |

---

## Part 1: Validation Philosophy

### The Iterative Process

**Validation is NOT one-shot** - expect multiple cycles:

```
Configure → Validate → Read Errors → Fix → Validate Again
        ↑                                    ↓
        └────────── Repeat (2-3 times) ──────┘
```

**Telemetry Insights:**
- Average: 23 seconds thinking about errors
- Average: 58 seconds fixing them
- Typical: 2-3 validation cycles per node

### Validate Early, Validate Often

1. **During Development**: Use `minimal` profile for quick checks
2. **Before Testing**: Use `runtime` profile
3. **Before Deployment**: Use `strict` profile
4. **After Template Deploy**: Always validate imported workflows

---

## Part 2: Error Severity Levels

### Level 1: Errors (Must Fix)

**Blocks workflow execution** - Cannot activate workflow until resolved

| Error Type | Description | Example |
|------------|-------------|---------|
| `missing_required` | Required field not provided | Missing channel name |
| `invalid_value` | Value not in allowed options | Wrong operation type |
| `type_mismatch` | Wrong data type | String instead of number |
| `invalid_reference` | Referenced node doesn't exist | Typo in node name |
| `invalid_expression` | Expression syntax error | Missing `{{ }}` wrapper |
| `invalid_connection` | Connection to non-existent node | Deleted node still referenced |

### Level 2: Warnings (Should Fix)

**Doesn't block execution** - Workflow can activate but may have issues

| Warning Type | Description |
|--------------|-------------|
| `best_practice` | Recommended but not required |
| `deprecated` | Using old API/feature |
| `performance` | Potential performance issue |
| `security` | Potential security concern |
| `missing_error_handling` | No error workflow configured |

### Level 3: Suggestions (Optional)

**Nice to have** - Improvements that could enhance workflow

- Optimization opportunities
- Alternative approaches
- Documentation recommendations

---

## Part 3: Complete Error Catalog

### Authentication Errors

#### 401 - Unauthorized
```json
{
  "status": 401,
  "message": "Request failed with status code 401"
}
```

**Causes:**
- Invalid or expired API key
- Wrong credentials
- Missing authentication header
- OAuth token expired

**Fixes:**
1. Verify API key in credentials
2. Check if key was regenerated
3. Refresh OAuth connection
4. Verify account has required permissions

#### 403 - Forbidden
```json
{
  "status": 403,
  "message": "Forbidden - perhaps check your credentials"
}
```

**Causes:**
- Valid credentials but insufficient permissions
- IP not whitelisted
- Account suspended
- Resource access denied

**Fixes:**
1. Check API permissions/scopes
2. Verify IP whitelist settings
3. Review account status
4. Confirm resource access rights

### Request Errors

#### 400 - Bad Request
```json
{
  "status": 400,
  "message": "Bad request - please check your parameters"
}
```

**Causes:**
- Invalid parameter name or value
- Malformed JSON body
- Missing required parameters
- Array not formatted correctly

**Fixes:**
1. Review API documentation
2. Validate JSON structure
3. Check parameter names/values
4. Use Array Format option for Query Parameters

#### 404 - Not Found
```json
{
  "status": 404,
  "message": "The resource you are requesting could not be found"
}
```

**Causes:**
- Wrong endpoint URL
- Resource deleted
- ID doesn't exist
- API version mismatch

**Fixes:**
1. Verify endpoint URL
2. Check if resource exists
3. Confirm ID is correct
4. Review API version

#### 429 - Rate Limited
```json
{
  "status": 429,
  "message": "The service is receiving too many requests from you"
}
```

**Causes:**
- Too many requests in time window
- Account rate limit exceeded
- Concurrent request limit hit

**Fixes:**
1. Enable "Retry On Fail" with delays
2. Implement batching
3. Add delays between items
4. Upgrade API plan if needed

### Configuration Errors

#### Missing Required Field
```json
{
  "type": "missing_required",
  "property": "channel",
  "message": "Channel name is required",
  "fix": "Provide a channel name"
}
```

**Fix Pattern:**
```javascript
// 1. Use get_node to see required fields
// 2. Add the missing field
config.channel = "#general";
// 3. Re-validate
```

#### Invalid Value
```json
{
  "type": "invalid_value",
  "property": "operation",
  "message": "Operation must be one of: post, update, delete",
  "current": "send"
}
```

**Fix Pattern:**
```javascript
// Check allowed values in error message or get_node
config.operation = "post";  // Use valid value
```

#### Type Mismatch
```json
{
  "type": "type_mismatch",
  "property": "limit",
  "message": "Expected number, got string",
  "current": "100"
}
```

**Fix Pattern:**
```javascript
config.limit = 100;  // Number, not "100" string
```

### Expression Errors

#### Invalid Expression Syntax
```json
{
  "type": "invalid_expression",
  "property": "text",
  "message": "Invalid expression: $json.name",
  "current": "$json.name"
}
```

**Fix:** Add `={{ }}` wrapper:
```javascript
config.text = "={{ $json.name }}";
```

#### Invalid Reference
```json
{
  "type": "invalid_reference",
  "message": "Node 'HTTP Requets' does not exist"
}
```

**Fix:** Correct typo in node name:
```javascript
// Wrong: $node['HTTP Requets']
// Correct: $node['HTTP Request']
```

#### Cannot Read Properties of Undefined
```json
{
  "message": "Cannot read properties of undefined (reading 'name')"
}
```

**Causes:**
- Accessing property on undefined object
- Previous node didn't run
- Expression references non-existent field
- Optional chaining not used

**Fixes:**
```javascript
// Use optional chaining
{{ $json.user?.profile?.name }}

// Provide default
{{ $json.name ?? 'default' }}

// Check node executed
{{ $("Previous Node").first()?.json?.field }}
```

### Connection Errors

#### Database Connection Failed
```json
{
  "message": "Cannot connect to database"
}
```

**Causes:**
- Wrong connection string
- Database server down
- Network/firewall issue
- Credentials incorrect

**Fixes:**
1. Verify connection string
2. Check database server status
3. Test with database client (pgAdmin, etc.)
4. Verify network access

#### Webhook Not Reachable
```json
{
  "message": "Webhook URL not accessible"
}
```

**Causes:**
- n8n not publicly accessible
- Wrong webhook URL configured
- Firewall blocking requests
- SSL certificate issues

**Fixes:**
1. Use tunneling (ngrok) for local development
2. Verify public URL configuration
3. Check firewall rules
4. Verify SSL certificate

---

## Part 4: Validation Profiles

| Profile | When to Use | What It Validates |
|---------|-------------|-------------------|
| **minimal** | Quick checks during editing | Required fields, basic structure |
| **runtime** | Pre-deployment (RECOMMENDED) | Required fields, types, allowed values |
| **ai-friendly** | AI-generated configs | Same as runtime, fewer false positives |
| **strict** | Production, critical workflows | Everything + best practices + security |

### Usage

```javascript
// Single node validation
validate_node({
  nodeType: "nodes-base.slack",
  config: { resource: "message", operation: "post" },
  mode: "full",
  profile: "runtime"  // RECOMMENDED
})

// Full workflow validation
n8n_validate_workflow({
  id: "workflow-id",
  options: {
    validateNodes: true,
    validateConnections: true,
    validateExpressions: true,
    profile: "runtime"
  }
})
```

### Profile Selection Guide

```
Development → minimal (fast feedback)
     ↓
Testing → runtime (balanced)
     ↓
Production → strict (comprehensive)

AI-generated workflows → ai-friendly (reduces false positives)
```

---

## Part 5: MCP Validation Tools

### validate_node - Single Node Validation

```javascript
validate_node({
  nodeType: "nodes-base.slack",
  config: {
    resource: "message",
    operation: "post",
    channel: "#general",
    text: "Hello!"
  },
  mode: "full",        // full or minimal
  profile: "runtime"   // minimal, runtime, ai-friendly, strict
})
```

### n8n_validate_workflow - Workflow Validation

```javascript
n8n_validate_workflow({
  id: "workflow-id",
  options: {
    validateNodes: true,       // Validate node configurations
    validateConnections: true, // Check connection integrity
    validateExpressions: true, // Validate expression syntax
    profile: "runtime"
  }
})
```

### n8n_autofix_workflow - Auto-fix Issues

```javascript
// Preview fixes first (ALWAYS do this)
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: false,  // Preview mode
  confidenceThreshold: "medium"
})

// Then apply if fixes look correct
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: true
})
```

### Available Fix Types

| Fix Type | What It Fixes |
|----------|---------------|
| `expression-format` | Missing `=` prefix in expressions |
| `typeversion-correction` | Incorrect node typeVersion |
| `typeversion-upgrade` | Upgrade to latest typeVersion |
| `error-output-config` | Error output configuration |
| `node-type-correction` | Node type mismatches |
| `webhook-missing-path` | Missing webhook paths |
| `version-migration` | v2.0+ migration issues |

### Targeted Fix Application

```javascript
// Only apply specific fix types
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: true,
  fixTypes: ["expression-format", "typeversion-upgrade"],
  confidenceThreshold: "high"  // Only high-confidence fixes
})
```

---

## Part 6: Auto-Sanitization System

### What It Does

**Automatically fixes operator structure issues** on ANY workflow update.

**Runs when:**
- `n8n_create_workflow`
- `n8n_update_partial_workflow`
- Any workflow save operation

### Binary Operators (Two Values)

**Operators**: equals, notEquals, contains, notContains, greaterThan, lessThan, startsWith, endsWith

**Fix**: Removes erroneous `singleValue` property

```javascript
// Before (wrong)
{
  "operation": "equals",
  "singleValue": true  // ❌ Wrong for binary operator
}

// After (auto-fixed)
{
  "operation": "equals"
  // singleValue removed ✅
}
```

### Unary Operators (One Value)

**Operators**: isEmpty, isNotEmpty, true, false

**Fix**: Adds required `singleValue: true`

```javascript
// Before (missing)
{
  "operation": "isEmpty"
  // Missing singleValue ❌
}

// After (auto-fixed)
{
  "operation": "isEmpty",
  "singleValue": true  // ✅ Added
}
```

### What Auto-Sanitization CANNOT Fix

| Issue | Solution |
|-------|----------|
| Broken connections | Use `cleanStaleConnections` operation |
| Branch count mismatches | Add missing connections manually |
| Paradoxical corrupt states | May require database intervention |
| Expression logic errors | Manual review required |
| Wrong node type entirely | Replace node manually |

---

## Part 7: Common Node-Specific Errors

### HTTP Request Node

| Error | Cause | Fix |
|-------|-------|-----|
| "JSON parameter need to be valid JSON" | Malformed JSON body | Validate JSON structure |
| "Bad request - check parameters" | Invalid query params | Review API docs, check array format |
| 401/403 errors | Auth issues | Verify credentials and permissions |
| SSL certificate errors | Self-signed cert | Enable "Ignore SSL Issues" option |

### Code Node

| Error | Cause | Fix |
|-------|-------|-----|
| "Code doesn't return items properly" | Wrong return format | Return `[{json: {...}}]` |
| "A 'json' property isn't an object" | json property is primitive | Wrap in object |
| "Cannot find module" | External module not allowed | Check NODE_FUNCTION_ALLOW_EXTERNAL |
| "'import' may only appear at top level" | ES module syntax in CJS context | Use require() instead |

### AI Agent Node

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot read properties (reading 'message')" | Missing message field in input | Verify chat input schema |
| "Cannot read properties (reading 'content')" | Tool output format mismatch | Check tool return format |
| Model timeout | Request too complex | Reduce input size or simplify |

### Database Nodes

| Error | Cause | Fix |
|-------|-------|-----|
| "Connection refused" | Server not accessible | Check host/port, firewall |
| "Authentication failed" | Wrong credentials | Verify username/password |
| "Unknown column" | Column doesn't exist | Check table schema |
| "Duplicate entry" | Unique constraint violation | Handle duplicates in logic |

---

## Part 8: Expression Validation

### Common Expression Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Expression shows literal text | Missing `{{ }}` | Wrap in `{{ }}` |
| Empty result from webhook | Accessing root instead of body | Use `$json.body.field` |
| "Referenced node is unexecuted" | Node hasn't run | Ensure node is in execution path |
| "Cannot read properties of undefined" | Missing property | Use optional chaining `?.` |
| Wrong data from $node | Item count mismatch | Use `$("Node").first()` |

### Expression Validation Checklist

```
[ ] Expression wrapped in {{ }}
[ ] All variables have $ prefix ($json, $input, etc.)
[ ] Node names match exactly (case-sensitive)
[ ] Webhook data accessed via $json.body
[ ] Optional chaining used for nested access
[ ] Default values provided for optional fields
[ ] Referenced nodes exist and will execute
```

### Debug Expressions

```javascript
// Check what keys exist
{{ Object.keys($json) }}

// Verify node reference
{{ $("Previous Node").first()?.json ? 'OK' : 'FAILED' }}

// Check type
{{ typeof $json.field }}

// Full structure
{{ JSON.stringify($json, null, 2) }}
```

---

## Part 9: Workflow-Level Validation

### Structural Issues

#### Broken Connections
```json
{
  "error": "Connection from 'Transform' to 'NonExistent' - target node not found"
}
```

**Fix:**
```javascript
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [{
    type: "cleanStaleConnections"
  }]
})
```

#### Circular Dependencies
```json
{
  "error": "Circular dependency detected: Node A → Node B → Node A"
}
```

**Fix:** Restructure workflow to break the loop. Use Wait node if polling needed.

#### Multiple Trigger Nodes
```json
{
  "warning": "Multiple trigger nodes found - only one will execute"
}
```

**Fix:** Remove extra triggers or split into separate workflows.

#### Disconnected Nodes
```json
{
  "warning": "Node 'Transform' is not connected to workflow flow"
}
```

**Fix:** Connect node to workflow or remove if unused.

### Import/Export Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Missing nodes after import | Community nodes not installed | Install required nodes |
| Credential errors | Credentials don't exist | Re-create credentials |
| Version mismatch | Workflow from newer n8n | Update n8n or use autofix |
| Invalid JSON | Corrupted export | Use JSON validator |

---

## Part 10: Error Handling Patterns

### Pattern 1: Error Workflow (Centralized Handler)

Create a dedicated error workflow for all failures:

```
┌─────────────────────────────────────────────────┐
│ Error Workflow: [System] Centralized Handler    │
├─────────────────────────────────────────────────┤
│ Error Trigger → Switch (by workflow name)       │
│       ↓              ↓                          │
│   Critical      Non-Critical                    │
│       ↓              ↓                          │
│ Slack @channel   Log to Sheet                   │
└─────────────────────────────────────────────────┘
```

**Error Data Available:**
- `execution.id` - Execution ID
- `execution.url` - Link to execution
- `execution.retryOf` - If retry of failed execution
- `workflow.name` - Failed workflow name
- `node.name` - Failed node name
- `error.message` - Error details

### Pattern 2: Retry On Fail (Automatic Retries)

For transient failures (API timeouts, rate limits):

```javascript
// Node settings
{
  "retryOnFail": true,
  "maxTries": 3,           // 3-5 for APIs
  "waitBetweenTries": 5000 // 5-10 seconds
}
```

### Pattern 3: Continue On Error (Batch Processing)

For processing items where some may fail:

```
Set node "On Error" to "Continue (using Error Output)"

         ↓
     ┌───┴───┐
  Success    Error
     ↓         ↓
  Process   Log/Queue
            for review
```

### Pattern 4: Fallback LLM

For AI workflows with provider redundancy:

```
AI Agent (GPT-4)
     ↓
  [Enable Fallback Model]
     ↓
Claude (backup)
```

### Pattern 5: Polling for Async Tasks

For long-running operations:

```
Start Task → Loop (Wait → Check Status)
                    ↓
              Is Complete?
              ↓         ↓
            Yes        No
              ↓         ↓
          Continue   Wait & Retry
```

---

## Part 11: v2.0+ Validation Changes

### Breaking Changes to Watch

| Change | Impact | Migration |
|--------|--------|-----------|
| Start node removed | Old workflows break | Replace with Manual Trigger |
| Pyodide Python removed | Python Code nodes fail | Use Task Runners |
| MySQL/MariaDB removed | DB connections fail | Migrate to PostgreSQL |
| Task runners default ON | Code isolation | Update env settings if needed |
| Sub-workflow behavior | Parent receives different data | Test sub-workflow outputs |
| Config file permissions | 0600 required | Update file permissions |

### Using the Migration Tool

1. Go to **Settings → Migration Report** (v1.121.0+)
2. Review issues by severity:
   - **Critical**: Will break workflows - fix first
   - **Medium**: May cause issues
   - **Low**: Recommendations
3. Fix workflow-level issues first
4. Then address instance-level issues
5. Test thoroughly before upgrading

### Execute Sub-Workflow Changes

**Before v2.0:**
- Could call workflows with only "Manual Trigger"
- Parent received results before child completed

**After v2.0:**
- Workflows need active trigger for sub-workflow calls
- Parent correctly waits for child completion
- Fix: Add appropriate trigger to sub-workflows

---

## Part 12: Recovery Strategies

### Strategy 1: Start Fresh

**When**: Configuration is severely broken

1. Note required fields from `get_node`
2. Create minimal valid configuration
3. Add features incrementally
4. Validate after each addition

### Strategy 2: Binary Search Debug

**When**: Workflow validates but executes incorrectly

1. Remove half the nodes
2. Validate and test
3. If works → problem in removed nodes
4. If fails → problem in remaining nodes
5. Repeat until isolated

### Strategy 3: Clean Stale Connections

**When**: "Node not found" errors

```javascript
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [{
    type: "cleanStaleConnections"
  }]
})
```

### Strategy 4: Auto-fix with Preview

**When**: Multiple validation errors

```javascript
// Always preview first!
const preview = n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: false
});

// Review suggested fixes
console.log(preview.suggestedFixes);

// Apply if appropriate
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: true
});
```

### Strategy 5: Template Redeploy

**When**: Template workflow corrupted

```javascript
// Redeploy fresh from template
n8n_deploy_template({
  templateId: 123,
  autoFix: true,
  autoUpgradeVersions: true
});
```

---

## Part 13: Pre-Deployment Checklist

### Node Validation

- [ ] All nodes validated with `runtime` profile
- [ ] No missing required fields
- [ ] All values within allowed options
- [ ] Credentials configured and tested

### Expression Validation

- [ ] All expressions wrapped in `{{ }}`
- [ ] Node references match exact names
- [ ] Webhook data accessed via `$json.body`
- [ ] Optional chaining for nested access
- [ ] Default values for optional fields

### Workflow Structure

- [ ] No broken connections
- [ ] No circular dependencies
- [ ] Single trigger node (or intentional multi-trigger)
- [ ] All nodes connected to flow

### Error Handling

- [ ] Error workflow configured
- [ ] Critical nodes have retry logic
- [ ] Batch processing handles individual failures
- [ ] Fallbacks for external dependencies

### Testing

- [ ] Tested with sample data
- [ ] Edge cases handled (empty, null, errors)
- [ ] Rate limits considered
- [ ] Large data volumes tested

### Documentation

- [ ] Node descriptions added
- [ ] Workflow purpose documented
- [ ] Credential requirements noted

---

## Part 14: Best Practices

### Do

- **Validate after every significant change**
- **Read error messages completely** - they contain fix guidance
- **Fix errors iteratively** - one at a time
- **Use `runtime` profile** for pre-deployment
- **Check `valid` field** before assuming success
- **Trust auto-sanitization** for operator issues
- **Use `get_node`** when unclear about requirements
- **Preview auto-fixes** before applying

### Don't

- **Skip validation** before activation
- **Try to fix all errors at once** - leads to new errors
- **Ignore error messages** - they're specific for a reason
- **Use `strict` during development** - too noisy
- **Assume validation passed** - always check result
- **Apply auto-fixes blindly** - preview first
- **Deploy with unresolved errors**

---

## Validation Result Structure

```javascript
{
  "valid": false,
  "errors": [
    {
      "type": "missing_required",
      "property": "channel",
      "message": "Channel name is required",
      "fix": "Provide a channel name"
    }
  ],
  "warnings": [
    {
      "type": "best_practice",
      "message": "Consider adding error handling"
    }
  ],
  "suggestions": [
    {
      "type": "optimization",
      "message": "Consider batch operations for better performance"
    }
  ]
}
```

### Reading Results

```javascript
// 1. Check valid field first
if (result.valid) {
  // ✅ Configuration is valid - proceed
} else {
  // ❌ Has errors - must fix before proceeding
}

// 2. Process errors (MUST fix)
result.errors.forEach(error => {
  console.log(`Error: ${error.property} - ${error.message}`);
  console.log(`Fix: ${error.fix}`);
});

// 3. Review warnings (SHOULD fix)
result.warnings.forEach(warning => {
  console.log(`Warning: ${warning.message}`);
});

// 4. Consider suggestions (OPTIONAL)
result.suggestions.forEach(suggestion => {
  console.log(`Suggestion: ${suggestion.message}`);
});
```

---

## Resources

- [n8n Error Handling Docs](https://docs.n8n.io/flow-logic/error-handling/)
- [Expression Common Issues](https://docs.n8n.io/code/cookbook/expressions/common-issues/)
- [HTTP Request Common Issues](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/common-issues/)
- [v2.0 Migration Tool](https://docs.n8n.io/migration-tool-v2/)
- [n8n Community Forum](https://community.n8n.io/)

---

*Last Updated: January 2026*
