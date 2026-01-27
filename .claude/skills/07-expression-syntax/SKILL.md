# n8n Expression Syntax Master Guide

> **Complete reference for n8n expressions: variables, patterns, debugging, and JMESPath**

## Quick Reference

| Need | Syntax | Example |
|------|--------|---------|
| Current item data | `$json` | `{{ $json.email }}` |
| Reference another node | `$("NodeName")` | `{{ $("HTTP Request").first().json.data }}` |
| All input items | `$input.all()` | `{{ $input.all().length }}` |
| First/Last item | `$input.first()` / `$input.last()` | `{{ $input.first().json.id }}` |
| Current timestamp | `$now` | `{{ $now.toISO() }}` |
| Environment variable | `$env` | `{{ $env.API_KEY }}` |
| Workflow variable | `$vars` | `{{ $vars.baseUrl }}` |
| Execution ID | `$execution.id` | `{{ $execution.id }}` |
| Item index | `$itemIndex` | `{{ $itemIndex }}` |
| Query JSON | `$jmespath()` | `{{ $jmespath($json.data, "[*].name") }}` |

---

## Part 1: Expression Fundamentals

### Basic Syntax

All n8n expressions use double curly braces:

```javascript
{{ expression }}
```

Expressions are JavaScript code that runs in n8n's context with special variables.

### Where Expressions Work

- **Most node parameters** - String fields support expressions
- **Expression toggle** - Click the `=` icon to enable expression mode
- **Expression editor** - Click the formula icon for full editor

### Syntax Rules

```javascript
// CORRECT - Double braces
{{ $json.email }}

// WRONG - Single braces
{ $json.email }

// WRONG - No braces (treated as literal text)
$json.email

// WRONG - Missing $ prefix
{{ json.email }}
```

---

## Part 2: Complete Built-in Variables

### Current Item Data

| Variable | Description | Example |
|----------|-------------|---------|
| `$json` | Current item's JSON data | `{{ $json.name }}` |
| `$binary` | Current item's binary data | `{{ $binary.file.fileName }}` |
| `$itemIndex` | Zero-based index of current item | `{{ $itemIndex }}` |

### Input Access Methods

| Method | Description | Example |
|--------|-------------|---------|
| `$input.all()` | Array of ALL input items | `{{ $input.all().length }}` |
| `$input.first()` | First input item | `{{ $input.first().json.id }}` |
| `$input.last()` | Last input item | `{{ $input.last().json.status }}` |
| `$input.item` | Current linked item | `{{ $input.item.json.data }}` |

### Node References

| Syntax | Description | Example |
|--------|-------------|---------|
| `$("NodeName")` | **Modern syntax** (recommended) | `{{ $("HTTP Request").first().json }}` |
| `$node["NodeName"]` | Legacy syntax | `{{ $node["HTTP Request"].json }}` |

**CRITICAL**: Use `$("NodeName")` for new workflows. It uses item linking and handles varying item counts correctly.

### DateTime Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `$now` | Current DateTime | `{{ $now.toISO() }}` |
| `$today` | Today at midnight | `{{ $today.toISODate() }}` |
| `DateTime` | Luxon DateTime class | `{{ DateTime.fromISO($json.date) }}` |

### Workflow Context

| Variable | Description | Example |
|----------|-------------|---------|
| `$workflow.id` | Workflow ID | `{{ $workflow.id }}` |
| `$workflow.name` | Workflow name | `{{ $workflow.name }}` |
| `$workflow.active` | Is workflow active | `{{ $workflow.active }}` |
| `$execution.id` | Current execution ID | `{{ $execution.id }}` |
| `$execution.mode` | `'manual'` or `'trigger'` | `{{ $execution.mode }}` |
| `$execution.resumeUrl` | Resume URL for Wait node | `{{ $execution.resumeUrl }}` |
| `$runIndex` | How many times node has run | `{{ $runIndex }}` |

### Environment & Custom Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `$env.VAR_NAME` | Environment variable | `{{ $env.API_KEY }}` |
| `$vars.varName` | Workflow variable (Pro) | `{{ $vars.webhookUrl }}` |

---

## Part 3: Data Access Patterns

### Pattern 1: Current Item Access

```javascript
// Simple field
{{ $json.email }}

// Nested object
{{ $json.user.profile.avatar }}

// Array element
{{ $json.items[0].name }}

// Fields with spaces/special chars
{{ $json["Order ID"] }}
{{ $json['field-name'] }}
```

### Pattern 2: Safe Navigation (Optional Chaining)

```javascript
// Prevents errors when intermediate properties are undefined
{{ $json.user?.profile?.email }}
{{ $json.data?.items?.[0]?.name }}
```

### Pattern 3: Default Values

```javascript
// OR operator (falsy check: undefined, null, '', 0, false)
{{ $json.name || 'Unknown' }}

// Nullish coalescing (only undefined/null)
{{ $json.count ?? 0 }}
{{ $json.enabled ?? true }}

// Combined with optional chaining
{{ $json.user?.name ?? 'Anonymous' }}
```

### Pattern 4: Reference Other Nodes

```javascript
// Modern syntax (RECOMMENDED)
{{ $("HTTP Request").first().json.data }}
{{ $("Set Values").first().json.processedName }}
{{ $("Get Config").first().json.apiKey }}

// With item linking (current context)
{{ $("Previous Node").item.json.field }}

// Legacy syntax (avoid for new workflows)
{{ $node["HTTP Request"].json.data }}
```

### Pattern 5: All Items Access

```javascript
// Count items
{{ $input.all().length }}

// Get specific item by index
{{ $input.all()[2].json.name }}

// Map to extract field
{{ $input.all().map(item => item.json.email) }}

// Get all from specific node
{{ $("Get Data").all().map(item => item.json.id) }}
```

### Pattern 6: Webhook Data Access

**CRITICAL**: Webhook data is NOT at root level!

```javascript
// WRONG - Will be empty
{{ $json.email }}

// CORRECT - Data is under .body
{{ $json.body.email }}
{{ $json.body.user.name }}

// Headers access
{{ $json.headers.authorization }}
{{ $json.headers["content-type"] }}

// Query parameters
{{ $json.query.page }}
{{ $json.query.filter }}

// Route parameters (if using path params)
{{ $json.params.userId }}
```

**Webhook Structure:**
```json
{
  "headers": { "content-type": "application/json", ... },
  "params": { "userId": "123" },
  "query": { "page": "1", "limit": "10" },
  "body": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

## Part 4: Common Mistakes & Fixes

### Mistake 1: Webhook Data Location

```javascript
// WRONG
{{ $json.email }}

// CORRECT - Webhook data is under .body
{{ $json.body.email }}
```

### Mistake 2: Missing $ Prefix

```javascript
// WRONG
{{ json.field }}
{{ input.first() }}

// CORRECT
{{ $json.field }}
{{ $input.first() }}
```

### Mistake 3: Missing Braces

```javascript
// WRONG - Treated as literal text
$json.email

// CORRECT
{{ $json.email }}
```

### Mistake 4: Wrong Node Name

```javascript
// WRONG - Case sensitive!
{{ $("http request").first().json }}
{{ $("HTTP request").first().json }}

// CORRECT - Exact match required
{{ $("HTTP Request").first().json }}
```

### Mistake 5: Array Index with Dot Notation

```javascript
// WRONG
{{ $json.items.0.name }}

// CORRECT
{{ $json.items[0].name }}
```

### Mistake 6: Using Expression Syntax in Code Node

```javascript
// WRONG - In Code node
const email = '={{ $json.email }}';

// CORRECT - In Code node (no braces needed)
const email = $json.email;
const email = $input.item.json.email;
```

### Mistake 7: Legacy $node Syntax with Multiple Items

```javascript
// PROBLEMATIC - $node uses index matching
// If previous node has fewer items, this fails
{{ $node["Get Data"].json.id }}

// SAFER - Use modern syntax with .first() or .all()
{{ $("Get Data").first().json.id }}
{{ $("Get Data").all().map(i => i.json.id) }}
```

### Mistake 8: Accessing Unexecuted Node

```javascript
// ERROR: "Referenced node is unexecuted"
// Node must have run in the same execution path

// FIX: Ensure the referenced node is connected
// and has been executed before the current node
```

### Mistake 9: Using .item with Merge Node

```javascript
// FAILS for items from second input of Merge node
{{ $("Previous Node").item.json.data }}

// SAFER - Use .first() or .all()
{{ $("Previous Node").first().json.data }}
```

---

## Part 5: Conditional Expressions

### Ternary Operator

```javascript
// Basic condition
{{ $json.status === 'active' ? 'Yes' : 'No' }}

// Numeric comparison
{{ $json.score > 80 ? 'Pass' : 'Fail' }}

// With calculation
{{ $json.type === 'premium' ? $json.price * 0.9 : $json.price }}

// Multiple conditions (nested ternary)
{{
  $json.score >= 90 ? 'A' :
  $json.score >= 80 ? 'B' :
  $json.score >= 70 ? 'C' : 'F'
}}
```

### Null/Undefined Handling

```javascript
// Default for falsy values (undefined, null, '', 0, false)
{{ $json.name || 'Unknown' }}

// Default only for undefined/null
{{ $json.count ?? 0 }}
{{ $json.enabled ?? true }}

// Optional chaining + default
{{ $json.user?.profile?.bio ?? 'No bio' }}
```

### Boolean Expressions

```javascript
// Type checking
{{ typeof $json.field === 'string' }}
{{ typeof $json.count === 'number' }}
{{ Array.isArray($json.items) }}

// Existence check
{{ $json.email !== undefined }}
{{ 'email' in $json }}

// Compound conditions
{{ $json.age >= 18 && $json.country === 'US' }}
{{ $json.status === 'active' || $json.role === 'admin' }}
```

---

## Part 6: DateTime with Luxon

n8n uses [Luxon](https://moment.github.io/luxon/) for date/time operations.

### Current Time

```javascript
// DateTime object
{{ $now }}

// ISO format
{{ $now.toISO() }}  // 2025-12-27T10:30:00.000Z

// Custom format
{{ $now.toFormat('yyyy-MM-dd') }}         // 2025-12-27
{{ $now.toFormat('HH:mm:ss') }}           // 10:30:00
{{ $now.toFormat('MMMM dd, yyyy') }}      // December 27, 2025
{{ $now.toFormat('EEE, MMM d') }}         // Fri, Dec 27
```

### Today's Date

```javascript
// Start of today
{{ $today }}
{{ $today.toISODate() }}  // 2025-12-27

// Future dates
{{ $today.plus({days: 7}).toISODate() }}   // Next week
{{ $today.plus({months: 1}).toISODate() }} // Next month
```

### Parse Dates

```javascript
// From ISO string
{{ DateTime.fromISO($json.date).toFormat('MMM dd, yyyy') }}

// From custom format
{{ DateTime.fromFormat($json.date, 'dd/MM/yyyy').toISO() }}
{{ DateTime.fromFormat($json.date, 'MM-dd-yyyy').toISODate() }}

// From timestamp (milliseconds)
{{ DateTime.fromMillis($json.timestamp).toISO() }}

// From timestamp (seconds)
{{ DateTime.fromSeconds($json.unixTime).toISO() }}
```

### Date Arithmetic

```javascript
// Add time
{{ $now.plus({days: 30}).toISO() }}
{{ $now.plus({hours: 2, minutes: 30}).toISO() }}
{{ $now.plus({weeks: 1}).toISODate() }}

// Subtract time
{{ $now.minus({days: 7}).toISO() }}
{{ $now.minus({months: 3}).toISODate() }}

// Start/End of periods
{{ $now.startOf('month').toISODate() }}   // First of month
{{ $now.endOf('month').toISODate() }}     // Last of month
{{ $now.startOf('week').toISODate() }}    // Monday
{{ $now.endOf('day').toISO() }}           // 23:59:59
```

### Date Comparison

```javascript
// Difference in days
{{ $now.diff(DateTime.fromISO($json.startDate), 'days').days }}

// Difference in hours
{{ DateTime.fromISO($json.end).diff(DateTime.fromISO($json.start), 'hours').hours }}

// Relative time
{{ DateTime.fromISO($json.created).toRelative() }}  // "2 days ago"

// Compare dates
{{ DateTime.fromISO($json.dueDate) < $now ? 'Overdue' : 'On time' }}
```

### Format Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `yyyy` | 4-digit year | 2025 |
| `MM` | 2-digit month | 12 |
| `MMM` | Short month | Dec |
| `MMMM` | Full month | December |
| `dd` | 2-digit day | 27 |
| `d` | Day | 27 |
| `EEE` | Short weekday | Fri |
| `EEEE` | Full weekday | Friday |
| `HH` | 24-hour | 14 |
| `hh` | 12-hour | 02 |
| `mm` | Minutes | 30 |
| `ss` | Seconds | 00 |
| `a` | AM/PM | PM |

---

## Part 7: JMESPath Expressions

JMESPath is a query language for JSON. n8n provides `$jmespath()` for powerful data extraction.

### Basic Syntax

```javascript
// JavaScript
{{ $jmespath(object, 'query') }}

// Python
{{ _jmespath(object, 'query') }}
```

**Note**: n8n uses `(object, query)` order, not `(query, object)` like JMESPath spec.

### Extract Array Elements

```javascript
// All items from array
{{ $jmespath($json.users, '[*].name') }}
// ["Alice", "Bob", "Charlie"]

// First N items
{{ $jmespath($json.items, '[:3].title') }}

// Last item
{{ $jmespath($json.items, '[-1].name') }}
```

### Filter Arrays

```javascript
// Filter by condition
{{ $jmespath($json.users, "[?age > `18`].name") }}

// Filter by string match
{{ $jmespath($json.products, "[?category == 'electronics'].name") }}

// Filter with contains
{{ $jmespath($json.posts, "[?contains(title, 'n8n')]") }}

// Multiple conditions
{{ $jmespath($json.items, "[?status == 'active' && price < `100`]") }}
```

### Select Specific Fields

```javascript
// Project specific fields
{{ $jmespath($json.users, '[*].{name: name, email: email}') }}

// Rename fields
{{ $jmespath($json.data, '[*].{userName: name, userEmail: email}') }}
```

### Nested Data Access

```javascript
// Access nested arrays
{{ $jmespath($json, 'orders[*].items[*].productId') }}

// Flatten nested structure
{{ $jmespath($json, 'departments[*].employees[*].name') | flatten }}
```

### Common JMESPath Patterns

```javascript
// Get first match
{{ $jmespath($json.items, "[?id == '123']")[0] }}

// Count matching items
{{ $jmespath($json.users, "[?active == `true`]").length }}

// Extract unique values (with JS)
{{ [...new Set($jmespath($json.orders, '[*].category'))] }}

// Sort and get top N
{{ $jmespath($json.scores, 'sort_by(@, &value)[-3:]') }}
```

---

## Part 8: String Operations

### Basic String Methods

```javascript
// Case conversion
{{ $json.name.toLowerCase() }}
{{ $json.name.toUpperCase() }}
{{ $json.name.charAt(0).toUpperCase() + $json.name.slice(1) }} // Capitalize

// Trim whitespace
{{ $json.input.trim() }}
{{ $json.input.trimStart() }}
{{ $json.input.trimEnd() }}

// Replace
{{ $json.text.replace('old', 'new') }}
{{ $json.text.replaceAll(' ', '_') }}
{{ $json.text.replace(/\d+/g, '***') }}  // Regex

// Split & Join
{{ $json.tags.split(',').join(', ') }}
{{ $json.csv.split('\n').length }}

// Substring
{{ $json.description.substring(0, 100) }}
{{ $json.code.slice(-4) }}  // Last 4 chars
```

### String Templates

```javascript
// Template literals
{{ `Hello, ${$json.name}!` }}
{{ `Order #${$json.orderId} - Total: $${$json.total}` }}
{{ `${$json.firstName} ${$json.lastName}` }}

// URL building
{{ `https://api.example.com/users/${$json.userId}/orders` }}
```

### String Checks

```javascript
// Contains
{{ $json.email.includes('@gmail.com') }}

// Starts/Ends with
{{ $json.phone.startsWith('+1') }}
{{ $json.file.endsWith('.pdf') }}

// Length
{{ $json.password.length >= 8 }}

// Regex test
{{ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test($json.email) }}
```

---

## Part 9: Array Operations

### Basic Array Methods

```javascript
// Length
{{ $json.items.length }}

// Access elements
{{ $json.items[0] }}
{{ $json.items[$json.items.length - 1] }}  // Last
{{ $json.items.at(-1) }}  // Last (modern)

// Check contents
{{ $json.tags.includes('important') }}
{{ $json.ids.indexOf('abc123') }}
```

### Transform Arrays

```javascript
// Map - extract/transform
{{ $json.users.map(u => u.email) }}
{{ $json.prices.map(p => p * 1.1) }}
{{ $json.items.map(i => i.name.toUpperCase()) }}

// Filter
{{ $json.orders.filter(o => o.status === 'pending') }}
{{ $json.users.filter(u => u.age >= 18) }}

// Find single item
{{ $json.users.find(u => u.id === '123') }}
{{ $json.items.findIndex(i => i.name === 'target') }}
```

### Aggregate Arrays

```javascript
// Reduce - sum
{{ $json.prices.reduce((sum, p) => sum + p, 0) }}

// Reduce - build object
{{ $json.items.reduce((obj, i) => ({...obj, [i.id]: i.name}), {}) }}

// Join to string
{{ $json.names.join(', ') }}
{{ $json.tags.join(' | ') }}

// Flatten
{{ $json.nested.flat() }}
{{ $json.deepNested.flat(2) }}
```

### Advanced Array Operations

```javascript
// Sort
{{ $json.items.sort((a, b) => a.price - b.price) }}
{{ $json.names.sort() }}

// Unique values
{{ [...new Set($json.categories)] }}

// Slice
{{ $json.items.slice(0, 5) }}  // First 5
{{ $json.items.slice(-3) }}    // Last 3

// Every/Some
{{ $json.items.every(i => i.valid) }}
{{ $json.items.some(i => i.priority === 'high') }}
```

---

## Part 10: Object Operations

### Access Object Data

```javascript
// Get keys
{{ Object.keys($json.data) }}

// Get values
{{ Object.values($json.data) }}

// Get entries (key-value pairs)
{{ Object.entries($json.data) }}

// Check property exists
{{ 'email' in $json }}
{{ $json.hasOwnProperty('email') }}
{{ Object.hasOwn($json, 'email') }}
```

### Transform Objects

```javascript
// Spread/merge
{{ {...$json.defaults, ...$json.custom} }}

// Pick specific keys
{{ Object.fromEntries(Object.entries($json).filter(([k]) => ['id', 'name'].includes(k))) }}

// Omit keys
{{ Object.fromEntries(Object.entries($json).filter(([k]) => k !== 'password')) }}
```

### JSON Operations

```javascript
// Stringify
{{ JSON.stringify($json.data) }}
{{ JSON.stringify($json.data, null, 2) }}  // Pretty print

// Parse (for string input)
{{ JSON.parse($json.jsonString) }}

// Clone
{{ JSON.parse(JSON.stringify($json.data)) }}
```

---

## Part 11: Advanced Patterns

### IIFE for Complex Logic

For multi-statement expressions, use Immediately Invoked Function Expressions:

```javascript
{{
  (() => {
    const items = $json.data;
    const filtered = items.filter(i => i.active);
    const total = filtered.reduce((sum, i) => sum + i.value, 0);
    return { count: filtered.length, total };
  })()
}}
```

### Aggregating Across All Items

```javascript
// Sum all values
{{ $input.all().reduce((sum, item) => sum + item.json.amount, 0) }}

// Collect all emails
{{ $input.all().map(item => item.json.email).join(', ') }}

// Find max value
{{ Math.max(...$input.all().map(item => item.json.score)) }}
```

### Dynamic Property Access

```javascript
// Variable as key
{{ $json[$json.fieldName] }}

// Computed property
{{ $json[`field_${$json.index}`] }}

// From environment
{{ $json[$env.FIELD_NAME] }}
```

### Chained Operations

```javascript
// Clean and validate email
{{ $json.email?.trim().toLowerCase() }}

// Process list
{{ $json.items
    .filter(i => i.active)
    .map(i => i.name)
    .sort()
    .join(', ')
}}
```

---

## Part 12: Expression Debugging

### Inspect Data Structure

```javascript
// See all available keys
{{ Object.keys($json) }}

// Check data type
{{ typeof $json.field }}
{{ Array.isArray($json.items) }}
{{ $json.field === null ? 'null' : typeof $json.field }}

// Stringify for full inspection
{{ JSON.stringify($json, null, 2) }}

// Check if field exists
{{ $json.field !== undefined ? 'EXISTS' : 'MISSING' }}
{{ 'fieldName' in $json ? 'has field' : 'no field' }}
```

### Debug in Code Node

```javascript
// Add console.log statements
console.log('Input data:', JSON.stringify($json, null, 2));
console.log('Item count:', $input.all().length);
console.log('Keys:', Object.keys($json));

return $input.all();
```

### Common Debug Expressions

```javascript
// Show webhook structure
{{ Object.keys($json) }}  // Should show: headers, params, query, body

// Verify node reference works
{{ $("Previous Node").first()?.json ? 'OK' : 'FAILED' }}

// Check item count
{{ `Received ${$input.all().length} items` }}

// Type inspection
{{ `${$json.field} is ${typeof $json.field}` }}
```

### Error Prevention Patterns

```javascript
// Safe access with fallback
{{ $json.nested?.deeply?.buried?.value ?? 'default' }}

// Check before operation
{{ Array.isArray($json.items) ? $json.items.length : 0 }}

// Conditional processing
{{ $json.data ? JSON.stringify($json.data) : 'No data' }}
```

---

## Part 13: Best Practices

### 1. Always Use Optional Chaining

```javascript
// SAFE
{{ $json.user?.profile?.email }}

// RISKY - Can throw error
{{ $json.user.profile.email }}
```

### 2. Provide Default Values

```javascript
// For optional fields
{{ $json.nickname ?? $json.name ?? 'Anonymous' }}

// For counts
{{ $json.items?.length ?? 0 }}
```

### 3. Use Modern $() Syntax

```javascript
// RECOMMENDED
{{ $("HTTP Request").first().json.data }}

// LEGACY (avoid)
{{ $node["HTTP Request"].json.data }}
```

### 4. Remember Webhook Structure

```javascript
// User data is ALWAYS under .body
{{ $json.body.email }}
{{ $json.body.payload.items }}
```

### 5. Test Incrementally

Build complex expressions step by step:
1. Start with `{{ $json }}` to see structure
2. Add one level: `{{ $json.data }}`
3. Continue: `{{ $json.data.users }}`
4. Complete: `{{ $json.data.users[0].email }}`

### 6. Use Code Node for Complex Logic

If your expression needs:
- Multiple statements
- Loops with side effects
- Error handling with try/catch
- External API calls

Use a Code node instead.

### 7. Handle Both Empty and Missing

```javascript
// Check for missing OR empty
{{ $json.items?.length > 0 ? $json.items[0].name : 'No items' }}

// Handle empty strings
{{ $json.name?.trim() || 'No name provided' }}
```

### 8. Node Names Are Case-Sensitive

```javascript
// Must match EXACTLY
{{ $("HTTP Request").first().json }}  // Correct
{{ $("http request").first().json }}  // WRONG
{{ $("Http Request").first().json }}  // WRONG
```

---

## Quick Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| Empty result from webhook | Accessing root instead of body | Use `$json.body.field` |
| "Cannot read properties of undefined" | Missing intermediate property | Use optional chaining `?.` |
| "Referenced node is unexecuted" | Node hasn't run yet | Ensure node is in execution path |
| Expression shows literal text | Missing {{ }} braces | Wrap in `{{ }}` |
| Wrong data from $node | Item count mismatch | Use `$("Node").first()` instead |
| "Can't determine which item" | Item linking broken | Use `.first()` or `.all()` |

---

## Resources

- [n8n Expressions Docs](https://docs.n8n.io/code/expressions/)
- [Built-in Variables Reference](https://docs.n8n.io/code/builtin/overview/)
- [JMESPath Tutorial](https://jmespath.org/tutorial.html)
- [Luxon Documentation](https://moment.github.io/luxon/)
- [n8n Community Forum](https://community.n8n.io/)

---

*Last Updated: January 2026*
