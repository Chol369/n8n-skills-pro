# n8n Python Code Node Expert

> **Write powerful Python code in n8n - INCLUDING external libraries**

## Overview

This skill teaches how to write effective Python code in n8n Code nodes, including the setup for external libraries like pandas, numpy, and requests.

---

## Data Access Patterns

### Input Data

```python
# Get all input items
items = _input.all()

# Get first item's JSON
first_item = _input.first()

# Access specific fields
for item in items:
    name = item['json']['name']
    email = item['json']['email']
```

### Built-in Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `_input` | Input data accessor | `_input.all()` |
| `_json` | First item's JSON (shortcut) | `_json['field']` |
| `_node` | Access specific node's output | `_node["HTTP Request"]["json"]` |
| `_env` | Environment variables | `_env['API_KEY']` |

### CRITICAL: Webhook Data Access

**Webhook data is nested under `["body"]`:**

```python
# WRONG - Won't work
data = _json["name"]

# CORRECT - Webhook data is under body
data = _json["body"]["name"]

# Example: Processing webhook payload
webhook_body = _json["body"]
username = webhook_body.get("username")
email = webhook_body.get("email")
items = webhook_body.get("items", [])
```

### Accessing Other Nodes

```python
# Get output from a specific node by name
http_result = _node["HTTP Request"]["json"]
webhook_data = _node["Webhook"]["json"]["body"]
```

---

## Return Format

**CRITICAL:** Always return a list of dictionaries with 'json' key:

```python
# Correct - list of dicts with 'json' key
return [
    {'json': {'name': 'Alice', 'processed': True}},
    {'json': {'name': 'Bob', 'processed': True}}
]

# Wrong - missing 'json' wrapper
return [{'name': 'Alice'}]  # This will fail!
```

### Processing Multiple Items

```python
items = _input.all()
results = []

for item in items:
    processed = {
        'original': item['json']['value'],
        'doubled': item['json']['value'] * 2
    }
    results.append({'json': processed})

return results
```

### Returning Binary Data

```python
import base64

# For files like PDFs, images, etc.
return [{
    "json": {"filename": "report.pdf"},
    "binary": {
        "data": base64.b64encode(pdf_content).decode()
    }
}]
```

---

## External Libraries (Requires Setup!)

> **Note:** By default, external libraries (pandas, numpy, requests) are **NOT available** in the Python Code node. However, with external task runner configuration, they CAN be enabled.

### Default Behavior (No External Libraries)

Without task runner setup, only standard library modules are available:
- `json`, `datetime`, `re`, `math`, `hashlib`, `base64`, `urllib`, `collections`, `random`

### Enabling External Libraries

Requires external task runner configuration. See `community-fixes/python-external-libs/` for complete setup.

Key settings:
```json
{
  "env-overrides": {
    "N8N_RUNNERS_STDLIB_ALLOW": "*",
    "N8N_RUNNERS_EXTERNAL_ALLOW": "*"
  }
}
```

### Using pandas

```python
import pandas as pd

# Convert input to DataFrame
items = _input.all()
df = pd.DataFrame([item['json'] for item in items])

# Data manipulation
df['total'] = df['quantity'] * df['price']
df['category'] = df['total'].apply(lambda x: 'high' if x > 100 else 'low')

# Filter
high_value = df[df['category'] == 'high']

# Return as n8n format
return [{'json': row} for row in high_value.to_dict('records')]
```

### Using numpy

```python
import numpy as np

items = _input.all()
values = [item['json']['value'] for item in items]

arr = np.array(values)
stats = {
    'mean': float(np.mean(arr)),
    'std': float(np.std(arr)),
    'min': float(np.min(arr)),
    'max': float(np.max(arr)),
    'median': float(np.median(arr)),
    'sum': float(np.sum(arr))
}

return [{'json': stats}]
```

### Using requests

```python
import requests

# GET request
response = requests.get(
    'https://api.example.com/data',
    headers={'Authorization': f'Bearer {_env["API_TOKEN"]}'},
    params={'limit': 100}
)

if response.status_code == 200:
    data = response.json()
    return [{'json': item} for item in data['results']]
else:
    return [{'json': {'error': response.text, 'status': response.status_code}}]
```

### POST with JSON

```python
import requests
import json

payload = {
    'name': _json['name'],
    'email': _json['email'],
    'timestamp': str(_json['created_at'])
}

response = requests.post(
    'https://api.example.com/users',
    json=payload,
    headers={'Content-Type': 'application/json'}
)

return [{'json': {'response': response.json(), 'status': response.status_code}}]
```

---

## Standard Library (Always Available)

These work without external runner setup:

| Module | Use Case |
|--------|----------|
| `json` | JSON parsing/serialization |
| `datetime` | Date/time operations |
| `re` | Regular expressions |
| `math` | Mathematical functions |
| `hashlib` | Hashing (MD5, SHA) |
| `base64` | Encoding/decoding |
| `urllib` | URL operations |
| `collections` | Advanced data structures |

### DateTime Example

```python
from datetime import datetime, timedelta
import json

now = datetime.now()
items = _input.all()

results = []
for item in items:
    created = datetime.fromisoformat(item['json']['created_at'].replace('Z', '+00:00'))
    age_days = (now - created).days

    results.append({'json': {
        **item['json'],
        'age_days': age_days,
        'is_recent': age_days < 7
    }})

return results
```

### Regex Example

```python
import re

items = _input.all()
email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

results = []
for item in items:
    email = item['json'].get('email', '')
    is_valid = bool(re.match(email_pattern, email))

    results.append({'json': {
        'email': email,
        'is_valid': is_valid
    }})

return results
```

---

## Common Errors

### Error: Module not found

**Cause:** External libraries not enabled
**Fix:** Configure external task runner with `N8N_RUNNERS_EXTERNAL_ALLOW=*`

### Error: Return value not iterable

**Cause:** Not returning list of dicts
**Fix:** Always return `[{'json': {...}}]` format

### Error: 'NoneType' object

**Cause:** Accessing missing key
**Fix:** Use `.get()` with default: `item['json'].get('field', '')`

---

## Best Practices

1. **Always use try/except** for external API calls
2. **Validate input data** before processing
3. **Return early** on errors with descriptive messages
4. **Use type hints** for complex functions
5. **Keep it simple** - use JavaScript for simple transforms

---

## When to Use Python vs JavaScript

| Use Python | Use JavaScript |
|------------|----------------|
| Data analysis (pandas) | Simple transforms |
| ML/statistics (numpy, sklearn) | String manipulation |
| Complex HTTP (requests) | $helpers.httpRequest |
| Scientific computing | DateTime with Luxon |
| Large data processing | Quick operations |

---

*See community-fixes/python-external-libs/ for complete external library setup guide.*
