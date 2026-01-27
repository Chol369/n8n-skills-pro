# JavaScript Code Node Mastery

> **Write production-ready JavaScript code in n8n Code nodes with confidence**

## Overview

This skill covers JavaScript patterns for n8n Code nodes, including data access methods, built-in helpers, Luxon DateTime, async patterns, binary data handling, error prevention, and 25+ production-ready recipes.

---

## Part 1: Code Node Fundamentals

### Quick Start Template

```javascript
// Production-ready template for Code nodes
const items = $input.all();

// Validate input
if (!items || items.length === 0) {
  return [];
}

// Process data
const processed = items.map(item => ({
  json: {
    ...item.json,
    processed: true,
    timestamp: DateTime.now().toISO()
  }
}));

return processed;
```

### Essential Rules

| Rule | Description |
|------|-------------|
| **Return Format** | MUST return `[{json: {...}}]` array of objects |
| **Webhook Data** | Access via `$json.body` (not `$json` directly) |
| **Mode Selection** | Use "Run Once for All Items" for 95% of cases |
| **Error Handling** | Always use try-catch for external calls |
| **Null Safety** | Use optional chaining `?.` and fallbacks `||` |

### Execution Modes

#### Run Once for All Items (Default - Recommended)

**When to use**: Aggregation, filtering, sorting, batch processing, statistics

```javascript
// Access all items at once
const allItems = $input.all();
const total = allItems.reduce((sum, item) => sum + (item.json.amount || 0), 0);

return [{
  json: {
    total,
    count: allItems.length,
    average: allItems.length > 0 ? total / allItems.length : 0
  }
}];
```

#### Run Once for Each Item

**When to use**: Per-item transformations, item-specific API calls, independent operations

```javascript
// Current item only
const item = $input.item;

return [{
  json: {
    ...item.json,
    processedAt: DateTime.now().toISO()
  }
}];
```

**Decision Guide**:
- Need to compare/aggregate multiple items? → **All Items** mode
- Each item completely independent? → **Each Item** mode
- Not sure? → **All Items** mode (you can always loop inside)

---

## Part 2: Data Access Patterns

### Pattern 1: $input.all() - Most Common

```javascript
// Get all items as array
const allItems = $input.all();

// Filter and transform
const processed = allItems
  .filter(item => item.json.status === 'active')
  .map(item => ({
    json: {
      id: item.json.id,
      name: item.json.name,
      active: true
    }
  }));

return processed;
```

### Pattern 2: $input.first() - Single Item

```javascript
// Get first item only
const firstItem = $input.first();
const data = firstItem.json;

return [{
  json: {
    result: data.value * 2,
    source: 'first_item'
  }
}];
```

### Pattern 3: $input.item - Each Item Mode

```javascript
// Current item in "Run Once for Each Item" mode
const currentItem = $input.item;

return [{
  json: {
    ...currentItem.json,
    processed: true
  }
}];
```

### Pattern 4: $node - Cross-Node Reference

```javascript
// Reference specific node output by name
const webhookData = $node["Webhook"].json;
const httpData = $node["HTTP Request"].json;

// Or using $() function
const previousData = $("Previous Node").item.json;

return [{
  json: {
    combined: { webhook: webhookData, api: httpData }
  }
}];
```

### Pattern 5: $items() - Batch Access

```javascript
// Access items from specific node
const allItemsFromNode = $items("HTTP Request");

return allItemsFromNode.map(item => ({
  json: { processed: item.json }
}));
```

---

## Part 3: Built-in Variables Reference

### Core Variables

| Variable | Description | Usage |
|----------|-------------|-------|
| `$json` | Current item's JSON data | `$json.fieldName` |
| `$input` | Input data accessor | `$input.all()`, `$input.first()`, `$input.item` |
| `$node` | Node reference object | `$node["NodeName"].json` |
| `$execution` | Current execution context | `$execution.id`, `$execution.mode` |
| `$workflow` | Workflow metadata | `$workflow.id`, `$workflow.name` |
| `$env` | Environment variables | `$env.MY_VAR` |
| `$now` | Current timestamp (Luxon) | `$now.toISO()` |
| `$today` | Today at midnight (Luxon) | `$today.toFormat('yyyy-MM-dd')` |
| `$binary` | Binary data accessor | `$binary.data`, `$binary.attachment` |
| `$itemIndex` | Current item index | `$itemIndex` (in each item mode) |
| `$runIndex` | Current run index | `$runIndex` |

### $helpers Object

```javascript
// HTTP Request Helper
const response = await $helpers.httpRequest({
  method: 'GET',
  url: 'https://api.example.com/data',
  headers: {
    'Authorization': 'Bearer ' + $env.API_TOKEN,
    'Content-Type': 'application/json'
  },
  returnFullResponse: false,  // true returns {body, headers, statusCode}
  json: true                  // Auto-parse JSON response
});

// Available options
const options = {
  method: 'POST',
  url: 'https://api.example.com/upload',
  body: { data: 'payload' },
  headers: {},
  json: true,                         // Parse response as JSON
  returnFullResponse: true,           // Return full response object
  encoding: 'arrayBuffer',            // For binary data
  disableFollowRedirect: false,       // Don't follow redirects
  skipSslCertificateValidation: false // Skip SSL validation
};
```

### $jmespath() - JSON Query

```javascript
const data = $input.first().json;

// Filter array with condition
const adults = $jmespath(data, 'users[?age >= `18`]');

// Extract specific fields
const names = $jmespath(data, 'users[*].name');

// Complex queries
const summary = $jmespath(data, '{total: length(items), names: items[*].name}');

return [{json: {adults, names, summary}}];
```

**JMESPath Syntax Tips**:
- Use backticks for numbers: `[?age >= \`18\`]`
- Remove quotes from keys when adapting from online tools
- Use `@` for current element: `[?@ != null]`

---

## Part 4: DateTime with Luxon

### Basic Operations

```javascript
// Current time
const now = DateTime.now();

// Formatting
const formatted = now.toFormat('yyyy-MM-dd');         // 2025-01-27
const iso = now.toISO();                               // 2025-01-27T14:30:00.000Z
const readable = now.toFormat('MMMM dd, yyyy HH:mm'); // January 27, 2025 14:30

// Date arithmetic
const tomorrow = now.plus({days: 1});
const lastWeek = now.minus({weeks: 1});
const nextMonth = now.plus({months: 1});

// Start/end of periods
const startOfDay = now.startOf('day');
const endOfMonth = now.endOf('month');
```

### Parsing Dates

```javascript
// From ISO string
const date1 = DateTime.fromISO('2025-01-27T14:30:00Z');

// From custom format
const date2 = DateTime.fromFormat('01/27/2025', 'MM/dd/yyyy');

// From Unix timestamp (seconds)
const date3 = DateTime.fromSeconds(1706360400);

// From Unix timestamp (milliseconds)
const date4 = DateTime.fromMillis(1706360400000);

// From JavaScript Date
const date5 = DateTime.fromJSDate(new Date());
```

### Date Calculations

```javascript
const items = $input.all();

return items.map(item => {
  const createdAt = DateTime.fromISO(item.json.created_at);
  const now = DateTime.now();

  // Calculate difference
  const daysSinceCreated = now.diff(createdAt, 'days').days;
  const hoursSinceCreated = now.diff(createdAt, 'hours').hours;

  // Compare dates
  const isOlderThan30Days = daysSinceCreated > 30;
  const isThisWeek = createdAt.hasSame(now, 'week');

  return {
    json: {
      ...item.json,
      daysSinceCreated: Math.floor(daysSinceCreated),
      isOlderThan30Days,
      isThisWeek
    }
  };
});
```

### Common Date Formats

| Format | Pattern | Example |
|--------|---------|---------|
| ISO 8601 | `toISO()` | 2025-01-27T14:30:00.000Z |
| Date only | `yyyy-MM-dd` | 2025-01-27 |
| US format | `MM/dd/yyyy` | 01/27/2025 |
| EU format | `dd/MM/yyyy` | 27/01/2025 |
| Readable | `MMMM dd, yyyy` | January 27, 2025 |
| With time | `yyyy-MM-dd HH:mm:ss` | 2025-01-27 14:30:00 |
| Unix seconds | `toSeconds()` | 1706360400 |
| Unix millis | `toMillis()` | 1706360400000 |

---

## Part 5: Production Recipes (25+)

### Date & Time Recipes

#### 1. Format Dates to YYYY-MM-DD

```javascript
const items = $input.all();

return items.map(item => ({
  json: {
    ...item.json,
    formattedDate: DateTime.fromISO(item.json.date).toFormat('yyyy-MM-dd')
  }
}));
```

#### 2. Current Timestamp in Multiple Formats

```javascript
const now = DateTime.now();

return [{
  json: {
    iso: now.toISO(),
    readable: now.toFormat('MMMM dd, yyyy HH:mm'),
    unixSeconds: now.toSeconds(),
    unixMillis: now.toMillis()
  }
}];
```

#### 3. Calculate Days Between Dates

```javascript
const items = $input.all();

return items.map(item => {
  const start = DateTime.fromISO(item.json.startDate);
  const end = DateTime.fromISO(item.json.endDate);
  const days = end.diff(start, 'days').days;

  return {
    json: { ...item.json, daysBetween: Math.abs(Math.floor(days)) }
  };
});
```

#### 4. Add/Subtract Days

```javascript
const items = $input.all();

return items.map(item => {
  const date = DateTime.fromISO(item.json.date);

  return {
    json: {
      original: item.json.date,
      plus7Days: date.plus({days: 7}).toFormat('yyyy-MM-dd'),
      minus30Days: date.minus({days: 30}).toFormat('yyyy-MM-dd')
    }
  };
});
```

#### 5. Convert Unix Timestamps

```javascript
const items = $input.all();

return items.map(item => {
  const timestamp = item.json.timestamp;
  // Auto-detect seconds vs milliseconds
  const date = String(timestamp).length === 10
    ? DateTime.fromSeconds(timestamp)
    : DateTime.fromMillis(timestamp);

  return {
    json: { ...item.json, dateISO: date.toISO() }
  };
});
```

### String Manipulation Recipes

#### 6. Extract Email Domains

```javascript
const items = $input.all();

return items.map(item => ({
  json: {
    ...item.json,
    domain: item.json.email?.split('@')[1] || 'unknown'
  }
}));
```

#### 7. Clean and Normalize Text

```javascript
const items = $input.all();

return items.map(item => {
  const text = item.json.text || '';
  const cleaned = text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

  return { json: { ...item.json, cleanedText: cleaned } };
});
```

#### 8. Convert to Title Case

```javascript
const items = $input.all();

return items.map(item => {
  const titleCase = (item.json.name || '')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return { json: { ...item.json, titleName: titleCase } };
});
```

#### 9. Generate URL Slugs

```javascript
const items = $input.all();

return items.map(item => {
  const slug = (item.json.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return { json: { ...item.json, slug } };
});
```

#### 10. Extract Numbers from Text

```javascript
const items = $input.all();

return items.map(item => {
  const text = item.json.text || '';
  const numbers = text.match(/[\d.]+/g) || [];

  return {
    json: {
      ...item.json,
      extractedNumbers: numbers.map(Number)
    }
  };
});
```

### Array Operation Recipes

#### 11. Filter Items by Condition

```javascript
const items = $input.all();

// Single condition
const active = items.filter(item => item.json.status === 'active');

// Multiple conditions
const qualified = items.filter(item =>
  item.json.status === 'active' &&
  item.json.score >= 80
);

return qualified.map(item => ({ json: item.json }));
```

#### 12. Remove Duplicates

```javascript
const items = $input.all();

// By single field
const seen = new Set();
const unique = items.filter(item => {
  const key = item.json.email;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

return unique.map(item => ({ json: item.json }));
```

#### 13. Sort Arrays

```javascript
const items = $input.all();

// Sort by number (descending)
const byScore = [...items].sort((a, b) =>
  (b.json.score || 0) - (a.json.score || 0)
);

// Sort alphabetically
const byName = [...items].sort((a, b) =>
  (a.json.name || '').localeCompare(b.json.name || '')
);

// Sort by date
const byDate = [...items].sort((a, b) =>
  new Date(b.json.createdAt) - new Date(a.json.createdAt)
);

return byScore.map(item => ({ json: item.json }));
```

#### 14. Find Specific Items

```javascript
const items = $input.all();

// Find first matching item
const found = items.find(item => item.json.id === 'target-id');

// Check if any item matches
const hasMatch = items.some(item => item.json.status === 'error');

// Find index
const index = items.findIndex(item => item.json.priority === 'high');

return [{
  json: {
    foundItem: found?.json || null,
    hasErrorItems: hasMatch,
    highPriorityIndex: index
  }
}];
```

#### 15. Sum and Aggregate Values

```javascript
const items = $input.all();

const total = items.reduce((sum, item) =>
  sum + (item.json.amount || 0), 0);

const count = items.length;
const average = count > 0 ? total / count : 0;
const max = Math.max(...items.map(item => item.json.amount || 0));
const min = Math.min(...items.map(item => item.json.amount || 0));

return [{
  json: { total, count, average, max, min }
}];
```

#### 16. Group by Category

```javascript
const items = $input.all();

const grouped = items.reduce((acc, item) => {
  const category = item.json.category || 'uncategorized';
  if (!acc[category]) acc[category] = [];
  acc[category].push(item.json);
  return acc;
}, {});

return [{
  json: { grouped, categories: Object.keys(grouped) }
}];
```

#### 17. Flatten Nested Arrays

```javascript
const items = $input.all();

// Flatten one level
const flattened = items.flatMap(item =>
  (item.json.items || []).map(subItem => ({
    json: { parentId: item.json.id, ...subItem }
  }))
);

return flattened;
```

### JSON Transformation Recipes

#### 18. Merge Multiple Items

```javascript
const items = $input.all();

const merged = items.reduce((acc, item) => ({
  ...acc,
  ...item.json
}), {});

return [{ json: merged }];
```

#### 19. Rename Object Keys

```javascript
const items = $input.all();

const keyMap = {
  'old_name': 'newName',
  'old_email': 'newEmail',
  'old_id': 'newId'
};

return items.map(item => {
  const renamed = {};
  for (const [oldKey, value] of Object.entries(item.json)) {
    const newKey = keyMap[oldKey] || oldKey;
    renamed[newKey] = value;
  }
  return { json: renamed };
});
```

#### 20. Pick Specific Fields

```javascript
const items = $input.all();
const fieldsToKeep = ['id', 'name', 'email', 'status'];

return items.map(item => {
  const picked = {};
  for (const field of fieldsToKeep) {
    if (item.json[field] !== undefined) {
      picked[field] = item.json[field];
    }
  }
  return { json: picked };
});
```

#### 21. Handle Null/Undefined Safely

```javascript
const items = $input.all();

return items.map(item => ({
  json: {
    // Optional chaining + fallback
    name: item.json?.user?.name ?? 'Unknown',
    email: item.json?.user?.email || 'no-email@example.com',

    // Nullish coalescing for zero values
    count: item.json?.count ?? 0,

    // Check before access
    hasAddress: Boolean(item.json?.address?.street)
  }
}));
```

#### 22. Parse JSON Strings Safely

```javascript
const items = $input.all();

return items.map(item => {
  let parsed = null;
  try {
    parsed = JSON.parse(item.json.jsonString);
  } catch (error) {
    parsed = { error: 'Invalid JSON', original: item.json.jsonString };
  }

  return { json: { ...item.json, parsed } };
});
```

### API Response Recipes

#### 23. Extract Nested Data

```javascript
const items = $input.all();

return items.map(item => {
  // Handle various API wrapper structures
  const data = item.json.data
    || item.json.result
    || item.json.response
    || item.json;

  // Extract nested array
  const records = data.records || data.items || data.results || [];

  return {
    json: {
      recordCount: records.length,
      records
    }
  };
});
```

#### 24. Transform Response Structure

```javascript
const items = $input.all();

return items.flatMap(item => {
  const apiResponse = item.json;

  // Transform array of API objects to n8n items
  return (apiResponse.users || []).map(user => ({
    json: {
      userId: user.id,
      fullName: `${user.first_name} ${user.last_name}`,
      email: user.email,
      active: user.status === 'active'
    }
  }));
});
```

#### 25. Batch Processing with Chunks

```javascript
const items = $input.all();
const BATCH_SIZE = 10;

// Split into batches
const batches = [];
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  batches.push(items.slice(i, i + BATCH_SIZE));
}

// Return batch info
return batches.map((batch, index) => ({
  json: {
    batchIndex: index,
    batchSize: batch.length,
    items: batch.map(item => item.json)
  }
}));
```

---

## Part 6: Async Patterns & API Calls

### Basic HTTP Request

```javascript
try {
  const response = await $helpers.httpRequest({
    method: 'GET',
    url: 'https://api.example.com/data',
    headers: {
      'Authorization': `Bearer ${$env.API_TOKEN}`
    },
    json: true
  });

  return [{ json: { success: true, data: response } }];
} catch (error) {
  return [{
    json: {
      success: false,
      error: error.message,
      statusCode: error.response?.status
    }
  }];
}
```

### POST with Body

```javascript
const items = $input.all();

const results = [];
for (const item of items) {
  try {
    const response = await $helpers.httpRequest({
      method: 'POST',
      url: 'https://api.example.com/create',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: item.json.name,
        email: item.json.email
      },
      json: true
    });

    results.push({
      json: { success: true, id: item.json.id, response }
    });
  } catch (error) {
    results.push({
      json: { success: false, id: item.json.id, error: error.message }
    });
  }
}

return results;
```

### Rate-Limited Sequential Calls

```javascript
const items = $input.all();
const results = [];

for (const item of items) {
  const response = await $helpers.httpRequest({
    method: 'GET',
    url: `https://api.example.com/users/${item.json.id}`,
    json: true
  });

  results.push({ json: { ...item.json, apiData: response } });

  // Rate limit: wait 100ms between requests
  await new Promise(resolve => setTimeout(resolve, 100));
}

return results;
```

---

## Part 7: Binary Data Handling

### Create Binary Output

```javascript
const items = $input.all();

// Create CSV content
const headers = Object.keys(items[0]?.json || {});
const csvContent = [
  headers.join(','),
  ...items.map(item =>
    headers.map(h => JSON.stringify(item.json[h] || '')).join(',')
  )
].join('\n');

// Convert to binary
const binaryData = Buffer.from(csvContent);

return [{
  json: {
    fileName: 'export.csv',
    rowCount: items.length
  },
  binary: {
    data: {
      data: binaryData.toString('base64'),
      mimeType: 'text/csv',
      fileName: 'export.csv'
    }
  }
}];
```

### Access Binary from Previous Node

```javascript
const item = $input.first();

// Access binary data
if (item.binary?.data) {
  const binaryData = item.binary.data;
  const content = Buffer.from(binaryData.data, 'base64').toString('utf-8');

  return [{
    json: {
      fileName: binaryData.fileName,
      mimeType: binaryData.mimeType,
      contentLength: content.length,
      preview: content.substring(0, 100)
    }
  }];
}

return [{ json: { error: 'No binary data found' } }];
```

### Download File to Binary

```javascript
const response = await $helpers.httpRequest({
  method: 'GET',
  url: 'https://example.com/document.pdf',
  encoding: 'arrayBuffer'
});

const buffer = Buffer.from(response);

return [{
  json: { downloaded: true },
  binary: {
    file: {
      data: buffer.toString('base64'),
      mimeType: 'application/pdf',
      fileName: 'document.pdf'
    }
  }
}];
```

---

## Part 8: Error Handling & Debugging

### Comprehensive Error Handling

```javascript
const items = $input.all();

// Validate input
if (!items || items.length === 0) {
  return [{ json: { error: 'No input items', code: 'EMPTY_INPUT' } }];
}

const results = [];

for (const item of items) {
  try {
    // Validate required fields
    if (!item.json?.id) {
      throw new Error('Missing required field: id');
    }

    // Process
    const processed = {
      id: item.json.id,
      name: item.json.name || 'Unknown',
      value: (item.json.amount || 0) * 1.1
    };

    results.push({ json: { success: true, ...processed } });

  } catch (error) {
    // Log error for debugging
    console.error(`Error processing item ${item.json?.id}:`, error.message);

    results.push({
      json: {
        success: false,
        id: item.json?.id,
        error: error.message,
        errorType: error.name
      }
    });
  }
}

return results;
```

### Debug Logging

```javascript
const items = $input.all();

// Debug: Log input structure
console.log('Input items count:', items.length);
console.log('First item structure:', JSON.stringify(items[0]?.json, null, 2));

// Process with logging
const results = items.map((item, index) => {
  console.log(`Processing item ${index}:`, item.json?.id);

  const result = {
    json: {
      ...item.json,
      processed: true
    }
  };

  console.log(`Result for item ${index}:`, result.json);
  return result;
});

console.log('Total processed:', results.length);
return results;
```

**Debug Output Location**: Check browser Developer Console (F12) or server logs for `console.log()` output.

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot read property 'json' of undefined` | Empty input or wrong accessor | Check `$input.all().length > 0` first |
| `Unexpected token` | Invalid JSON or syntax error | Validate JSON, check for trailing commas |
| `$helpers is undefined` | Wrong n8n version or context | Use `this.helpers` in older versions |
| `Must return array` | Wrong return format | Ensure `return [{json: {...}}]` |
| `Webhook data undefined` | Direct access instead of `.body` | Use `$json.body.fieldName` |

---

## Part 9: When to Use Code Node

### Use Code Node When

- Complex multi-step transformations
- Custom calculations or business logic
- Aggregating data across items
- Recursive operations
- Complex conditional logic
- API response parsing with nested structures
- Generating binary files (CSV, JSON exports)
- Batch processing with custom chunking

### Use Other Nodes Instead

| Task | Better Alternative |
|------|-------------------|
| Simple field mapping | **Set** node |
| Basic filtering | **Filter** node |
| Simple conditionals | **IF** or **Switch** node |
| HTTP requests only | **HTTP Request** node |
| Date formatting | **Date & Time** node |
| Text splitting | **Split Out** node |
| Aggregating to single item | **Aggregate** node |
| JSON to items | **Split Out** node |

---

## Part 10: Best Practices Summary

### Do

- **Validate input first**: Check `items.length > 0` before processing
- **Use optional chaining**: `item.json?.nested?.field`
- **Provide fallbacks**: `value || 'default'` or `value ?? defaultValue`
- **Use try-catch**: Wrap API calls and parsing operations
- **Log for debugging**: `console.log()` during development
- **Filter early, process late**: Reduce dataset before expensive operations
- **Return proper format**: Always `[{json: {...}}]`
- **Use Luxon for dates**: Built-in, no imports needed
- **Keep functions focused**: One Code node, one purpose

### Don't

- **Access $json directly for webhooks**: Use `$json.body`
- **Forget return statement**: Code must return data
- **Use n8n expression syntax in code**: No `{{ }}` - use template literals
- **Modify input items directly**: Create new objects instead
- **Skip null checks**: Undefined values cause crashes
- **Use async without await**: API calls need proper handling
- **Ignore errors**: Always handle potential failures

---

## Quick Reference Checklist

Before deploying Code nodes:

- [ ] **Return format correct**: `[{json: {...}}]` array structure
- [ ] **Input validated**: Check for empty/null input
- [ ] **Error handling**: try-catch for external calls
- [ ] **Null safety**: Optional chaining used
- [ ] **Webhook data**: Accessed via `.body` if applicable
- [ ] **Mode selected**: "All Items" for most cases
- [ ] **Debug removed**: Console.log statements cleaned up
- [ ] **No hardcoded secrets**: Use `$env` for credentials

---

## Sources & Further Reading

- [Using the Code node - n8n Docs](https://docs.n8n.io/code/code-node/)
- [Code in n8n Documentation](https://docs.n8n.io/code/)
- [n8n Code Node: 25 JavaScript Recipes](https://logicworkflow.com/blog/n8n-code-node-javascript/)
- [Code Node for Beginners - n8n Community](https://community.n8n.io/t/code-node-for-beginners/22031)
- [Supercharge Your N8N Workflows - Code Node Guide](https://www.aifire.co/p/supercharge-your-n8n-workflows-the-complete-code-node-guide)
- [Mastering the n8n Code Node - Medium](https://medium.com/@krishnaagarwal.in/mastering-the-n8n-code-node-a-deep-dive-into-input-all-vs-json-dfc66be6bd52)
- [HTTP Request Helpers - n8n Docs](https://docs.n8n.io/integrations/creating-nodes/build/reference/http-helpers/)

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `06-code-python` | Python code patterns |
| `07-expression-syntax` | Expression vs code differences |
| `03-node-configuration` | Code node settings |
| `08-validation-expert` | Debug code errors |
