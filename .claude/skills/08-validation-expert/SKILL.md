# n8n Validation Expert

> **Interpret validation errors and guide fixing them**

## Overview

This skill covers interpreting and fixing n8n validation errors, understanding validation profiles, handling false positives, and the iterative validation loop process.

---

## Validation Philosophy

**Validate early, validate often**

Validation is typically iterative:
- Expect validation feedback loops
- Usually 2-3 validate → fix cycles
- Average: 23s thinking about errors, 58s fixing them

**Key insight**: Validation is an iterative process, not one-shot!

---

## Error Severity Levels

### 1. Errors (Must Fix)
**Blocks workflow execution** - Must be resolved before activation

**Types**:
- `missing_required` - Required field not provided
- `invalid_value` - Value doesn't match allowed options
- `type_mismatch` - Wrong data type (string instead of number)
- `invalid_reference` - Referenced node doesn't exist
- `invalid_expression` - Expression syntax error

**Example**:
```json
{
  "type": "missing_required",
  "property": "channel",
  "message": "Channel name is required",
  "fix": "Provide a channel name (lowercase, no spaces, 1-80 characters)"
}
```

### 2. Warnings (Should Fix)
**Doesn't block execution** - Workflow can be activated but may have issues

**Types**:
- `best_practice` - Recommended but not required
- `deprecated` - Using old API/feature
- `performance` - Potential performance issue

### 3. Suggestions (Optional)
**Nice to have** - Improvements that could enhance workflow

---

## The Validation Loop

### Pattern from Telemetry

```
1. Configure node
   ↓
2. validate_node (23 seconds thinking about errors)
   ↓
3. Read error messages carefully
   ↓
4. Fix errors
   ↓
5. validate_node again (58 seconds fixing)
   ↓
6. Repeat until valid (usually 2-3 iterations)
```

### Example
```javascript
// Iteration 1
let config = {
  resource: "channel",
  operation: "create"
};

const result1 = validate_node({
  nodeType: "nodes-base.slack",
  config,
  mode: "full"
});
// → Error: Missing "name"

// Iteration 2
config.name = "general";

const result2 = validate_node({...});
// → Error: Missing "text"

// Iteration 3
config.text = "Hello!";

const result3 = validate_node({...});
// → Valid! ✅
```

**This is normal!** Don't be discouraged by multiple iterations.

---

## Validation Profiles

Choose the right profile for your stage:

| Profile | When to Use | What It Validates |
|---------|-------------|-------------------|
| **minimal** | Quick checks during editing | Required fields, basic structure |
| **runtime** | Pre-deployment (RECOMMENDED) | Required fields, types, allowed values |
| **ai-friendly** | AI-generated configs | Same as runtime, fewer false positives |
| **strict** | Production, critical workflows | Everything + best practices + security |

```javascript
// Recommended for most use cases
validate_node({
  nodeType: "nodes-base.slack",
  config: {...},
  mode: "full",
  profile: "runtime"
})
```

---

## Common Error Types

### 1. missing_required

**What it means**: A required field is not provided

**How to fix**:
1. Use `get_node` to see required fields
2. Add the missing field to your configuration
3. Provide an appropriate value

```javascript
// Error
{
  "type": "missing_required",
  "property": "channel",
  "message": "Channel name is required"
}

// Fix
config.channel = "#general";
```

### 2. invalid_value

**What it means**: Value doesn't match allowed options

**How to fix**:
1. Check error message for allowed values
2. Use `get_node` to see options
3. Update to a valid value

```javascript
// Error
{
  "type": "invalid_value",
  "property": "operation",
  "message": "Operation must be one of: post, update, delete",
  "current": "send"
}

// Fix
config.operation = "post";  // Use valid operation
```

### 3. type_mismatch

**What it means**: Wrong data type for field

```javascript
// Error
{
  "type": "type_mismatch",
  "property": "limit",
  "message": "Expected number, got string",
  "current": "100"
}

// Fix
config.limit = 100;  // Number, not string
```

### 4. invalid_expression

**What it means**: Expression syntax error

```javascript
// Error
{
  "type": "invalid_expression",
  "property": "text",
  "message": "Invalid expression: $json.name",
  "current": "$json.name"
}

// Fix - add {{ }} wrapper
config.text = "={{$json.name}}";
```

### 5. invalid_reference

**What it means**: Referenced node doesn't exist

```javascript
// Error
{
  "type": "invalid_reference",
  "property": "expression",
  "message": "Node 'HTTP Requets' does not exist",  // Typo!
  "current": "={{$node['HTTP Requets'].json.data}}"
}

// Fix - correct typo
config.expression = "={{$node['HTTP Request'].json.data}}";
```

---

## MCP Validation Tools

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
    validateNodes: true,
    validateConnections: true,
    validateExpressions: true,
    profile: "runtime"
  }
})
```

### n8n_autofix_workflow - Auto-fix Common Issues

```javascript
// Preview fixes first
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: false  // Preview mode
})

// Then apply
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: true
})
```

---

## Auto-Sanitization System

### What It Does
**Automatically fixes common operator structure issues** on ANY workflow update

**Runs when**:
- `n8n_create_workflow`
- `n8n_update_partial_workflow`
- Any workflow save operation

### What It Fixes

#### Binary Operators (Two Values)
**Operators**: equals, notEquals, contains, notContains, greaterThan, lessThan, startsWith, endsWith

**Fix**: Removes `singleValue` property

```javascript
// Before (wrong)
{
  "operation": "equals",
  "singleValue": true  // ❌ Wrong!
}

// After (automatic fix)
{
  "operation": "equals"
  // singleValue removed ✅
}
```

#### Unary Operators (One Value)
**Operators**: isEmpty, isNotEmpty, true, false

**Fix**: Adds `singleValue: true`

```javascript
// Before (missing)
{
  "operation": "isEmpty"
  // Missing singleValue ❌
}

// After (automatic fix)
{
  "operation": "isEmpty",
  "singleValue": true  // ✅ Added
}
```

### What It CANNOT Fix

| Issue | Solution |
|-------|----------|
| Broken connections | Use `cleanStaleConnections` operation |
| Branch count mismatches | Add missing connections manually |
| Paradoxical corrupt states | May require database intervention |

---

## False Positives

### What Are They?
Validation warnings that are technically "wrong" but acceptable in your use case

### Common False Positives

| Warning | When Acceptable |
|---------|-----------------|
| "Missing error handling" | Simple/test workflows |
| "No retry logic" | Idempotent operations |
| "Missing rate limiting" | Internal APIs, low-volume |
| "Unbounded query" | Small known datasets |

### Reducing False Positives

```javascript
// Use ai-friendly profile for fewer false positives
validate_node({
  nodeType: "nodes-base.slack",
  config: {...},
  mode: "full",
  profile: "ai-friendly"  // Fewer false positives
})
```

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
      "property": "errorHandling",
      "message": "Slack API can have rate limits"
    }
  ],
  "suggestions": [
    {
      "type": "optimization",
      "message": "Consider using batch operations"
    }
  ]
}
```

### How to Read It

```javascript
// 1. Check valid field first
if (result.valid) {
  // ✅ Configuration is valid
} else {
  // ❌ Has errors - must fix
}

// 2. Fix errors first
result.errors.forEach(error => {
  console.log(`Error in ${error.property}: ${error.message}`);
  console.log(`Fix: ${error.fix}`);
});

// 3. Review warnings
result.warnings.forEach(warning => {
  console.log(`Warning: ${warning.message}`);
  // Decide if you need to address this
});
```

---

## Common Workflow Errors

### 1. Broken Connections
```json
{
  "error": "Connection from 'Transform' to 'NonExistent' - target node not found"
}
```

**Fix**: Remove stale connection or create missing node

```javascript
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [{
    type: "cleanStaleConnections"
  }]
})
```

### 2. Circular Dependencies
```json
{
  "error": "Circular dependency detected: Node A → Node B → Node A"
}
```

**Fix**: Restructure workflow to remove loop

### 3. Multiple Start Nodes
```json
{
  "warning": "Multiple trigger nodes found - only one will execute"
}
```

**Fix**: Remove extra triggers or split into separate workflows

### 4. Disconnected Nodes
```json
{
  "warning": "Node 'Transform' is not connected to workflow flow"
}
```

**Fix**: Connect node or remove if unused

---

## Recovery Strategies

### Strategy 1: Start Fresh
**When**: Configuration is severely broken

1. Note required fields from `get_node`
2. Create minimal valid configuration
3. Add features incrementally
4. Validate after each addition

### Strategy 2: Binary Search
**When**: Workflow validates but executes incorrectly

1. Remove half the nodes
2. Validate and test
3. If works: problem is in removed nodes
4. If fails: problem is in remaining nodes
5. Repeat until problem isolated

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

### Strategy 4: Use Auto-fix
**When**: Operator structure errors

```javascript
// Preview first
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: false
})

// Review, then apply
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: true
})
```

---

## Best Practices

### Do
- Validate after every significant change
- Read error messages completely
- Fix errors iteratively (one at a time)
- Use `runtime` profile for pre-deployment
- Check `valid` field before assuming success
- Trust auto-sanitization for operator issues
- Use `get_node` when unclear about requirements

### Don't
- Skip validation before activation
- Try to fix all errors at once
- Ignore error messages
- Use `strict` profile during development (too noisy)
- Assume validation passed (always check result)
- Manually fix auto-sanitization issues
- Deploy with unresolved errors

---

## Pre-Deployment Checklist

Before activating any workflow:

- [ ] All nodes validated individually
- [ ] Workflow-level validation passed
- [ ] No broken connections
- [ ] Expressions reference existing nodes
- [ ] Error handling configured (for production)
- [ ] Tested with sample data
- [ ] Edge cases handled (empty data, errors)

---

## Summary

**Key Points**:
1. **Validation is iterative** (avg 2-3 cycles)
2. **Errors must be fixed**, warnings are optional
3. **Auto-sanitization** fixes operator structures automatically
4. **Use runtime profile** for balanced validation
5. **False positives exist** - learn to recognize them
6. **Read error messages** - they contain fix guidance

**Validation Process**:
1. Validate → Read errors → Fix → Validate again
2. Repeat until valid (usually 2-3 iterations)
3. Review warnings and decide if acceptable
4. Deploy with confidence

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `04-mcp-tools-expert` | Use validation tools correctly |
| `07-expression-syntax` | Fix expression errors |
| `03-node-configuration` | Understand required fields |

