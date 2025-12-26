# n8n Expression Syntax Expert

> **Master n8n expressions and debug common issues**

## Overview

n8n expressions use `{{ }}` syntax to access dynamic data. This skill covers core patterns, common mistakes, and debugging techniques.

---

## Expression Basics

### Syntax

```javascript
{{ expression }}
```

Expressions are JavaScript that runs in n8n's context with special variables.

### Core Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `$json` | Current item's data | `{{ $json.email }}` |
| `$node` | Reference other nodes | `{{ $node["HTTP Request"].json.data }}` |
| `$input` | Input data accessor | `{{ $input.first().json.name }}` |
| `$now` | Current timestamp | `{{ $now.toISO() }}` |
| `$today` | Today's date | `{{ $today.toISODate() }}` |
| `$env` | Environment variables | `{{ $env.API_KEY }}` |
| `$vars` | Workflow variables | `{{ $vars.baseUrl }}` |
| `$execution` | Execution info | `{{ $execution.id }}` |
| `$workflow` | Workflow info | `{{ $workflow.name }}` |
| `$itemIndex` | Current item index | `{{ $itemIndex }}` |

---

## Common Mistakes & Fixes

### Mistake 1: Webhook Data Location

**Wrong:**
```javascript
{{ $json.email }}  // Empty for webhooks!
```

**Correct:**
```javascript
{{ $json.body.email }}  // Webhook data is under .body
```

Webhook structure:
```json
{
  "headers": { ... },
  "params": { ... },
  "query": { ... },
  "body": {           // Your data is HERE
    "email": "user@example.com"
  }
}
```

### Mistake 2: Missing $

**Wrong:**
```javascript
{{ json.field }}  // Missing $
```

**Correct:**
```javascript
{{ $json.field }}
```

### Mistake 3: Missing Braces

**Wrong:**
```javascript
$json.field  // Not wrapped in {{ }}
```

**Correct:**
```javascript
{{ $json.field }}
```

### Mistake 4: Wrong Node Reference

**Wrong:**
```javascript
{{ $node["http request"].json }}  // Case sensitive!
```

**Correct:**
```javascript
{{ $node["HTTP Request"].json }}  // Exact node name
```

### Mistake 5: Array Access

**Wrong:**
```javascript
{{ $json.items.0.name }}  // Dot notation for index
```

**Correct:**
```javascript
{{ $json.items[0].name }}  // Bracket notation
```

---

## Accessing Data Patterns

### Current Item

```javascript
// Direct field access
{{ $json.name }}
{{ $json.user.email }}
{{ $json.items[0].id }}

// With default value
{{ $json.name || 'Unknown' }}
{{ $json.count ?? 0 }}
```

### Previous Node

```javascript
// By node name
{{ $node["HTTP Request"].json.data }}
{{ $node["Set Values"].json.processedName }}

// First item from node
{{ $node["Get Data"].first().json.id }}
```

### All Items

```javascript
// Get all items from input
{{ $input.all() }}

// Get specific item
{{ $input.item(2).json.name }}

// Get first/last
{{ $input.first().json }}
{{ $input.last().json }}
```

---

## Conditional Expressions

### Ternary Operator

```javascript
{{ $json.status === 'active' ? 'Yes' : 'No' }}
{{ $json.score > 80 ? 'Pass' : 'Fail' }}
{{ $json.type === 'premium' ? $json.price * 0.9 : $json.price }}
```

### Null Handling

```javascript
// Default if undefined/null
{{ $json.name || 'Anonymous' }}

// Nullish coalescing (undefined/null only)
{{ $json.count ?? 0 }}

// Optional chaining
{{ $json.user?.profile?.avatar }}
```

### Multiple Conditions

```javascript
{{
  $json.score >= 90 ? 'A' :
  $json.score >= 80 ? 'B' :
  $json.score >= 70 ? 'C' : 'F'
}}
```

---

## DateTime Expressions

n8n uses Luxon for date/time operations.

### Current Time

```javascript
{{ $now }}                           // DateTime object
{{ $now.toISO() }}                   // 2025-12-27T10:30:00.000Z
{{ $now.toFormat('yyyy-MM-dd') }}    // 2025-12-27
{{ $now.toFormat('HH:mm:ss') }}      // 10:30:00
```

### Today's Date

```javascript
{{ $today }}                         // DateTime (start of day)
{{ $today.toISODate() }}             // 2025-12-27
{{ $today.plus({days: 7}).toISODate() }}  // Next week
```

### Parse & Format

```javascript
// Parse ISO string
{{ DateTime.fromISO($json.date).toFormat('MMM dd, yyyy') }}

// Parse custom format
{{ DateTime.fromFormat($json.date, 'dd/MM/yyyy').toISO() }}

// Relative time
{{ DateTime.fromISO($json.created).toRelative() }}  // "2 days ago"
```

### Date Math

```javascript
// Add/subtract
{{ $now.plus({days: 30}).toISO() }}
{{ $now.minus({hours: 2}).toISO() }}
{{ $now.startOf('month').toISO() }}
{{ $now.endOf('week').toISO() }}

// Difference
{{ $now.diff(DateTime.fromISO($json.start), 'days').days }}
```

---

## String Operations

```javascript
// Case conversion
{{ $json.name.toLowerCase() }}
{{ $json.name.toUpperCase() }}

// Trim whitespace
{{ $json.input.trim() }}

// Replace
{{ $json.text.replace('old', 'new') }}
{{ $json.text.replaceAll(' ', '_') }}

// Split & join
{{ $json.tags.split(',').join(', ') }}

// Substring
{{ $json.description.substring(0, 100) }}

// Template
{{ `Hello, ${$json.name}!` }}
```

---

## Array Operations

```javascript
// Length
{{ $json.items.length }}

// Map
{{ $json.items.map(i => i.name).join(', ') }}

// Filter
{{ $json.items.filter(i => i.active) }}

// Find
{{ $json.items.find(i => i.id === '123') }}

// Includes
{{ $json.tags.includes('important') }}

// First/Last
{{ $json.items[0] }}
{{ $json.items[$json.items.length - 1] }}
```

---

## Object Operations

```javascript
// Keys
{{ Object.keys($json.data) }}

// Values
{{ Object.values($json.data) }}

// Entries
{{ Object.entries($json.data) }}

// Spread/merge
{{ {...$json.base, ...$json.override} }}

// Check property
{{ 'email' in $json }}
{{ $json.hasOwnProperty('email') }}
```

---

## Environment & Variables

```javascript
// Environment variables
{{ $env.API_KEY }}
{{ $env.BASE_URL }}

// Workflow variables
{{ $vars.webhookUrl }}
{{ $vars.defaultTimeout }}

// Execution info
{{ $execution.id }}
{{ $execution.mode }}  // 'manual' or 'trigger'
{{ $execution.resumeUrl }}  // For Wait nodes
```

---

## Debugging Expressions

### Check if Field Exists

```javascript
{{ $json.field !== undefined ? $json.field : 'NOT FOUND' }}
```

### Log Structure

In Code node:
```javascript
console.log(JSON.stringify($json, null, 2));
return $input.all();
```

### Common Debug Patterns

```javascript
// See what's available
{{ Object.keys($json) }}

// Check type
{{ typeof $json.field }}

// Check if array
{{ Array.isArray($json.items) }}

// Stringify for inspection
{{ JSON.stringify($json) }}
```

---

## Best Practices

1. **Always use optional chaining** for nested access: `$json.user?.email`
2. **Provide defaults** for optional fields: `$json.name || 'Unknown'`
3. **Use exact node names** - they're case-sensitive
4. **Remember webhook structure** - data is in `$json.body`
5. **Test expressions** in the expression editor before saving

---

*For complex logic, consider using a Code node instead of expressions.*
