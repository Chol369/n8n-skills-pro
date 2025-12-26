# n8n v2.0+ Migration Expert

> **Handle breaking changes and migration issues in n8n 2.0+**

## Overview

n8n 2.0 introduced significant breaking changes. This skill covers common issues and their solutions.

---

## Major Breaking Changes

### 1. Execute Sub-Workflow Node

The node was renamed and restructured.

**Old (pre-2.0):**
- Node: `n8n-nodes-base.executeWorkflow`

**New (2.0+):**
- Node: `n8n-nodes-base.executeWorkflow` (same type, different version)
- Now called "Execute Sub-Workflow" in UI

### 2. Node Versioning System

Nodes now have explicit versions with different behaviors.

**Example:**
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2    // Specific version matters!
}
```

### 3. Expression Syntax Changes

Some expression patterns changed in v2.0.

### 4. Wait Node Behavior

Wait nodes now work differently for human-in-the-loop patterns.

---

## Execute Sub-Workflow "Out of Date" Error

### The Problem

After importing a workflow, Execute Sub-Workflow nodes show:
```
This node is out of date
```

The node appears broken and won't execute.

### The Solution

**You cannot fix this by editing the node.** You must:

1. **Delete** the existing Execute Sub-Workflow node
2. **Add a new one** from the node panel
3. **Reconfigure** the target workflow

### Step-by-Step Fix

1. Note the current configuration:
   - Target workflow ID/name
   - Input mode (define below or use workflow input)
   - Any field mappings

2. Delete the broken node

3. Add new "Execute Sub-Workflow" from:
   - Node panel → Core Nodes → Execute Sub-Workflow

4. Configure:
   ```
   Source: Database (select workflow)
   Workflow: [Select target workflow]
   Mode: [Configure as needed]
   ```

5. Reconnect to previous/next nodes

### Prevention

When creating workflows for export:
- Use latest node versions
- Test import on fresh n8n instance
- Document sub-workflow dependencies

---

## Wait Node Patterns (v2.0)

### The Problem

Pre-2.0 patterns for human-in-the-loop don't work:
- Using respondToWebhook
- Using Set nodes with resume URLs
- Execution doesn't pause

### Correct v2.0 Pattern

Use Wait node with Form resume:

```json
{
  "type": "n8n-nodes-base.wait",
  "typeVersion": 1.1,
  "parameters": {
    "resume": "form",
    "formTitle": "Approval Required",
    "formDescription": "Please review and approve",
    "formFields": {
      "values": [
        {
          "fieldLabel": "Decision",
          "fieldType": "dropdown",
          "fieldOptions": {
            "values": [
              {"option": "Approve"},
              {"option": "Reject"}
            ]
          },
          "requiredField": true
        },
        {
          "fieldLabel": "Comments",
          "fieldType": "text",
          "requiredField": false
        }
      ]
    }
  }
}
```

### Accessing Form Data

In the node AFTER the Wait node:
```javascript
// The form data is in $json directly
const decision = $json['Decision'];
const comments = $json['Comments'];
```

### Resume URL Pattern

If you need to send the resume URL:
```javascript
// In a Code node BEFORE the Wait node
const resumeUrl = $execution.resumeUrl;
// Send this URL via email/Slack/etc.
```

---

## Node Version Compatibility

### Checking Current Versions

Use get_node to see latest version:
```
Tool: get_node
nodeType: "nodes-base.httpRequest"
mode: "versions"
```

### Common Node Versions (v2.0+)

| Node | v2.0 Version | Notes |
|------|--------------|-------|
| HTTP Request | 4.2 | Major changes from v3 |
| Webhook | 2 | Path handling updated |
| Code | 2 | Python support added |
| Set | 3.4 | New field assignment |
| IF | 2.2 | Expression handling |
| Switch | 3.2 | Case sensitivity |
| Execute Sub-Workflow | 1.2 | Complete restructure |
| Wait | 1.1 | Form support added |

### Upgrading Node Versions

Use n8n_autofix_workflow:
```
Tool: n8n_autofix_workflow
id: "workflow-id"
fixTypes: ["typeversion-upgrade"]
applyFixes: true
```

---

## Expression Changes in v2.0

### Date Handling

**Old:**
```javascript
{{ new Date().toISOString() }}
```

**New (recommended):**
```javascript
{{ $now.toISO() }}
{{ DateTime.now().toISO() }}
```

### Node References

**Still works but be careful with:**
```javascript
// Make sure node names are exact
{{ $node["HTTP Request"].json.data }}

// Use $input for previous node
{{ $input.first().json.data }}
```

### Webhook Body Access

**Always use:**
```javascript
{{ $json.body.fieldName }}
```

Not:
```javascript
{{ $json.fieldName }}  // Won't work for webhooks
```

---

## Common Migration Errors

### Error: "Workflow has no trigger"

**v2.0 Change:** Workflows must have a valid trigger to activate.

**Fix:** Add a trigger node:
- Schedule Trigger
- Webhook
- Service-specific trigger (e.g., Slack trigger)

`Manual Trigger` does NOT count for API activation.

### Error: "Node type not found"

**Cause:** Node was renamed or deprecated in v2.0.

**Common renames:**
| Old | New |
|-----|-----|
| `Function` | `Code` |
| `Function Item` | `Code` (item mode) |
| `Merge` | `Merge` (but different versions) |

### Error: "Invalid expression"

**v2.0 Change:** Stricter expression parsing.

**Fixes:**
- Check for unclosed braces `{{ }}`
- Verify variable names ($json not json)
- Use optional chaining for nested: `$json.user?.email`

---

## Migration Checklist

### Before Importing v1.x Workflow to v2.0

- [ ] Check for Execute Sub-Workflow nodes (will need recreation)
- [ ] Check for Wait nodes (may need reconfiguration)
- [ ] Verify node versions are available in v2.0
- [ ] Review expressions for deprecated syntax
- [ ] Ensure workflow has valid trigger

### After Import

- [ ] Run validation: `n8n_validate_workflow`
- [ ] Fix "out of date" nodes manually
- [ ] Test all execution paths
- [ ] Verify Wait/approval flows work
- [ ] Check expression outputs

### Using Auto-fix

```
Tool: n8n_autofix_workflow
id: "workflow-id"
fixTypes: [
  "expression-format",
  "typeversion-correction",
  "typeversion-upgrade",
  "version-migration"
]
applyFixes: true
```

---

## Version-Specific Notes

### v2.0.0 - v2.0.3

- Initial v2.0 release
- Execute Sub-Workflow restructured
- Wait node form support added

### v2.1.x

- Additional node updates
- Expression improvements
- Bug fixes for v2.0 issues

### Latest (check changelog)

See `changelog/` directory for version-specific changes.

---

## Self-Hosted Considerations

### Docker Image Tags

```yaml
# Specific version (recommended)
image: n8nio/n8n:1.82.3

# Latest v2.x
image: n8nio/n8n:latest

# Avoid mixing versions across instances
```

### Database Migrations

v2.0 includes database schema changes:
- Backup before upgrading
- Allow extra time for first startup
- Check logs for migration status

---

*For general workflow patterns, see 02-workflow-patterns skill.*
