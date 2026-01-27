# Python Code Node Mastery

> **Write powerful Python code in n8n - INCLUDING external libraries with Task Runners**

## Overview

This skill covers Python patterns for n8n Code nodes, including data access, return formats, standard library usage, external library setup (pandas, numpy, requests), Task Runner configuration, and v2.0+ migration guidance.

---

## Part 1: Python vs JavaScript - Key Differences

### Syntax Comparison

| Feature | JavaScript | Python |
|---------|------------|--------|
| Variables prefix | `$` (dollar sign) | `_` (underscore) |
| Property access | `$json.field` or `$json["field"]` | `_json["field"]` (bracket only) |
| Input all items | `$input.all()` | `_input.all()` |
| First item | `$input.first()` | `_input.first()` |
| Current item | `$input.item` | `_input.item` or `_item` |
| Node reference | `$node["Name"]` | `_node["Name"]` |
| Environment vars | `$env.VAR` | `_env["VAR"]` |

### Critical Syntax Rules

```python
# PYTHON REQUIRES BRACKET NOTATION - NO DOT ACCESS

# WRONG - Will fail in native Python
data = _json.name  # Dot notation not supported

# CORRECT - Use bracket notation
data = _json["name"]

# CORRECT - Nested access
email = _json["body"]["user"]["email"]
```

### v2.0+ Breaking Change

**Native Python** (v2.0+) does NOT support dot access like the legacy Pyodide version:

```python
# Legacy Pyodide (v1.x) - DON'T USE IN v2.0+
item.json.myField  # Worked in Pyodide

# Native Python (v2.0+) - REQUIRED
item["json"]["myField"]  # Bracket notation only
```

---

## Part 2: Data Access Patterns

### Pattern 1: _input.all() - All Items

```python
# Get all items as list
items = _input.all()

# Process each item
results = []
for item in items:
    name = item["json"]["name"]
    email = item["json"]["email"]

    results.append({
        "json": {
            "name": name.upper(),
            "email": email.lower(),
            "processed": True
        }
    })

return results
```

### Pattern 2: _input.first() - First Item

```python
# Get first item only
first = _input.first()
data = first["json"]

return [{
    "json": {
        "result": data["value"] * 2,
        "source": "first_item"
    }
}]
```

### Pattern 3: _json - Shortcut to First Item

```python
# Direct access to first item's JSON (shortcut)
name = _json["name"]
email = _json["email"]

return [{"json": {"name": name, "email": email}}]
```

### Pattern 4: _node - Cross-Node Reference

```python
# Access output from specific nodes by name
http_result = _node["HTTP Request"]["json"]
webhook_data = _node["Webhook"]["json"]["body"]

return [{
    "json": {
        "api_data": http_result,
        "webhook_payload": webhook_data
    }
}]
```

### Pattern 5: _items - All Items Shortcut

```python
# Alternative way to access all items (Run Once for All Items mode)
for item in _items:
    print(item["json"])
```

### CRITICAL: Webhook Data Access

**Webhook data is nested under `["body"]`:**

```python
# WRONG - Returns None or KeyError
data = _json["name"]
email = _json["email"]

# CORRECT - Webhook data under body
data = _json["body"]["name"]
email = _json["body"]["email"]

# SAFE - With .get() fallback
webhook_body = _json.get("body", {})
username = webhook_body.get("username", "unknown")
email = webhook_body.get("email", "")
items = webhook_body.get("items", [])
```

---

## Part 3: Built-in Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `_input` | Input data accessor | `_input.all()`, `_input.first()` |
| `_json` | First item's JSON (shortcut) | `_json["field"]` |
| `_items` | All items (Run Once for All Items) | `for item in _items` |
| `_item` | Current item (Run Once for Each Item) | `_item["json"]["field"]` |
| `_node` | Access specific node's output | `_node["HTTP Request"]["json"]` |
| `_env` | Environment variables | `_env["API_KEY"]` |

### Environment Variables

```python
# Access environment variables
api_key = _env["API_KEY"]
base_url = _env.get("BASE_URL", "https://api.default.com")

# Use in API calls
headers = {
    "Authorization": f"Bearer {api_key}"
}
```

---

## Part 4: Return Format Requirements

### CRITICAL Rule

**Always return a list of dictionaries with `"json"` key:**

```python
# CORRECT - List of dicts with 'json' key
return [
    {"json": {"name": "Alice", "processed": True}},
    {"json": {"name": "Bob", "processed": True}}
]

# CORRECT - Single result
return [{"json": {"result": "success", "count": 42}}]

# CORRECT - Empty result
return []

# WRONG - Missing 'json' wrapper
return [{"name": "Alice"}]  # Will fail!

# WRONG - Not a list
return {"json": {"name": "Alice"}}  # Will fail!
```

### Processing Multiple Items

```python
items = _input.all()
results = []

for item in items:
    processed = {
        "original": item["json"]["value"],
        "doubled": item["json"]["value"] * 2,
        "category": "high" if item["json"]["value"] > 100 else "low"
    }
    results.append({"json": processed})

return results
```

### Returning Binary Data

```python
import base64

# For files like PDFs, images, CSVs
pdf_content = b"..."  # Binary content

return [{
    "json": {"filename": "report.pdf", "size": len(pdf_content)},
    "binary": {
        "data": {
            "data": base64.b64encode(pdf_content).decode(),
            "mimeType": "application/pdf",
            "fileName": "report.pdf"
        }
    }
}]
```

---

## Part 5: Standard Library (Always Available)

These modules work **without** Task Runner setup:

| Category | Modules |
|----------|---------|
| **Data** | `json`, `csv`, `pickle`, `sqlite3`, `xml` |
| **Text** | `re`, `string`, `textwrap`, `difflib` |
| **DateTime** | `datetime`, `calendar`, `time`, `zoneinfo` |
| **Math** | `math`, `statistics`, `random`, `decimal`, `fractions` |
| **Crypto** | `hashlib`, `hmac`, `secrets` |
| **Encoding** | `base64`, `binascii`, `codecs` |
| **Network** | `urllib`, `http`, `socket`, `ssl`, `email` |
| **Files** | `os`, `pathlib`, `shutil`, `glob`, `tempfile`, `gzip`, `zipfile` |
| **System** | `sys`, `subprocess`, `threading`, `multiprocessing`, `asyncio` |
| **Utils** | `collections`, `itertools`, `functools`, `copy`, `typing` |

### DateTime Example

```python
from datetime import datetime, timedelta
import json

now = datetime.now()
items = _input.all()

results = []
for item in items:
    # Parse ISO date
    created_str = item["json"]["created_at"]
    created = datetime.fromisoformat(created_str.replace("Z", "+00:00"))

    # Calculate age
    age_days = (now - created).days

    results.append({"json": {
        **item["json"],
        "age_days": age_days,
        "is_recent": age_days < 7,
        "processed_at": now.isoformat()
    }})

return results
```

### Regex Example

```python
import re

items = _input.all()
email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
phone_pattern = r"\+?[\d\s\-\(\)]{10,}"

results = []
for item in items:
    email = item["json"].get("email", "")
    phone = item["json"].get("phone", "")

    results.append({"json": {
        "email": email,
        "email_valid": bool(re.match(email_pattern, email)),
        "phone": phone,
        "phone_valid": bool(re.search(phone_pattern, phone))
    }})

return results
```

### JSON Operations

```python
import json

# Parse JSON string
data = _json["json_string"]
parsed = json.loads(data)

# Create JSON string
output = {"key": "value", "numbers": [1, 2, 3]}
json_string = json.dumps(output, indent=2)

return [{"json": {"parsed": parsed, "serialized": json_string}}]
```

### Hashing Example

```python
import hashlib

items = _input.all()

results = []
for item in items:
    data = item["json"]["data"]

    # Create hashes
    md5_hash = hashlib.md5(data.encode()).hexdigest()
    sha256_hash = hashlib.sha256(data.encode()).hexdigest()

    results.append({"json": {
        "original": data,
        "md5": md5_hash,
        "sha256": sha256_hash
    }})

return results
```

---

## Part 6: External Libraries (Requires Task Runner)

### What Requires Setup

These libraries need Task Runner configuration:

- **Data Analysis**: `pandas`, `numpy`, `scipy`
- **HTTP**: `requests`, `httpx`, `aiohttp`
- **Machine Learning**: `scikit-learn`, `tensorflow`, `pytorch`
- **Web Scraping**: `beautifulsoup4`, `lxml`, `selenium`
- **Excel/Spreadsheets**: `openpyxl`, `xlrd`, `xlsxwriter`
- **Any pip-installable package**

### Using pandas (With Task Runner)

```python
import pandas as pd

# Convert input to DataFrame
items = _input.all()
df = pd.DataFrame([item["json"] for item in items])

# Data manipulation
df["total"] = df["quantity"] * df["price"]
df["category"] = df["total"].apply(lambda x: "high" if x > 100 else "low")

# Filter
high_value = df[df["category"] == "high"]

# Aggregations
summary = {
    "total_revenue": float(df["total"].sum()),
    "avg_order": float(df["total"].mean()),
    "order_count": len(df)
}

# Return as n8n format
records = [{"json": row} for row in high_value.to_dict("records")]
records.append({"json": {"summary": summary}})

return records
```

### Using numpy (With Task Runner)

```python
import numpy as np

items = _input.all()
values = [item["json"]["value"] for item in items]

arr = np.array(values)

stats = {
    "mean": float(np.mean(arr)),
    "std": float(np.std(arr)),
    "min": float(np.min(arr)),
    "max": float(np.max(arr)),
    "median": float(np.median(arr)),
    "sum": float(np.sum(arr)),
    "percentile_25": float(np.percentile(arr, 25)),
    "percentile_75": float(np.percentile(arr, 75))
}

return [{"json": stats}]
```

### Using requests (With Task Runner)

```python
import requests

# GET request
response = requests.get(
    "https://api.example.com/data",
    headers={"Authorization": f"Bearer {_env['API_TOKEN']}"},
    params={"limit": 100},
    timeout=30
)

if response.status_code == 200:
    data = response.json()
    return [{"json": item} for item in data.get("results", [])]
else:
    return [{"json": {
        "error": response.text,
        "status": response.status_code
    }}]
```

### POST with JSON (With Task Runner)

```python
import requests

payload = {
    "name": _json["body"]["name"],
    "email": _json["body"]["email"],
    "timestamp": datetime.now().isoformat()
}

response = requests.post(
    "https://api.example.com/users",
    json=payload,
    headers={
        "Authorization": f"Bearer {_env['API_TOKEN']}",
        "Content-Type": "application/json"
    },
    timeout=30
)

return [{"json": {
    "response": response.json(),
    "status": response.status_code,
    "success": response.status_code < 400
}}]
```

---

## Part 7: Task Runner Setup (v2.0+)

### Why Task Runners?

n8n v2.0+ removed bundled Python (Pyodide). External Task Runners:
- Run in isolated containers for security
- Enable full Python library access
- Separate code execution from n8n core

### Quick Setup Overview

**Step 1: docker-compose.yml**

```yaml
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      # Task Runner Settings
      - N8N_RUNNERS_MODE=external
      - N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0
      - N8N_RUNNERS_AUTH_TOKEN=${RUNNERS_AUTH_TOKEN}
    depends_on:
      - n8n-runner

  n8n-runner:
    image: n8nio/runners:latest
    volumes:
      - ./n8n-task-runners.json:/etc/n8n-task-runners.json:ro
    environment:
      - N8N_RUNNERS_TASK_BROKER_URI=http://n8n:5679
      - N8N_RUNNERS_AUTH_TOKEN=${RUNNERS_AUTH_TOKEN}
    depends_on:
      - n8n
```

**Step 2: n8n-task-runners.json**

```json
{
  "task-runners": [
    {
      "runner-type": "python",
      "workdir": "/home/runner",
      "command": "/opt/runners/task-runner-python/.venv/bin/python",
      "args": ["-m", "src.main"],
      "health-check-server-port": "5682",
      "env-overrides": {
        "PYTHONPATH": "/opt/runners/task-runner-python",
        "N8N_RUNNERS_STDLIB_ALLOW": "*",
        "N8N_RUNNERS_EXTERNAL_ALLOW": "*"
      }
    }
  ]
}
```

**Step 3: Generate Auth Token**

```bash
openssl rand -hex 32
```

Use the same token in both `N8N_RUNNERS_AUTH_TOKEN` settings.

### Installing External Libraries

**Method 1: Live Installation (Lost on Restart)**

```bash
# Install to venv site-packages (MUST run as root)
docker exec -u root n8n-runner pip install \
    --target=/opt/runners/task-runner-python/.venv/lib/python3.13/site-packages/ \
    pandas numpy requests

# Verify installation
docker exec n8n-runner \
    /opt/runners/task-runner-python/.venv/bin/python \
    -c "import pandas; print(f'pandas {pandas.__version__}')"
```

**Method 2: Custom Dockerfile (Persistent)**

```dockerfile
FROM n8nio/runners:latest

# Install packages to venv site-packages
RUN pip install \
    --target=/opt/runners/task-runner-python/.venv/lib/python3.13/site-packages/ \
    pandas \
    numpy \
    requests \
    scikit-learn \
    beautifulsoup4 \
    openpyxl
```

Update docker-compose.yml:

```yaml
n8n-runner:
  build: ./custom-runner
  # ... rest of config
```

### Environment Variables Reference

| Variable | Purpose |
|----------|---------|
| `N8N_RUNNERS_MODE=external` | Enable external task runners |
| `N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0` | Allow runner connections |
| `N8N_RUNNERS_AUTH_TOKEN` | Secure runner communication |
| `N8N_RUNNERS_TASK_BROKER_URI` | Runner connects to n8n broker |
| `N8N_RUNNERS_STDLIB_ALLOW` | Allowed Python stdlib modules |
| `N8N_RUNNERS_EXTERNAL_ALLOW` | Allowed external pip packages |

---

## Part 8: Common Errors & Fixes

### Error: "No module named 'X'"

**Cause 1**: Library installed in wrong location

```bash
# WRONG - System Python (won't work)
docker exec n8n-runner pip install numpy

# CORRECT - venv site-packages
docker exec -u root n8n-runner pip install \
    --target=/opt/runners/task-runner-python/.venv/lib/python3.13/site-packages/ \
    numpy
```

**Cause 2**: External libraries not allowed

```json
// Add to n8n-task-runners.json
"N8N_RUNNERS_EXTERNAL_ALLOW": "*"
```

### Error: "Task request timed out"

**Cause**: Broker listening only to localhost

```yaml
# FIX: Set broker to listen on all interfaces
N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0
```

### Error: "Permission denied during install"

```bash
# Add -u root flag
docker exec -u root n8n-runner pip install ...
```

### Error: "Return value not iterable"

**Cause**: Not returning list of dicts

```python
# WRONG
return {"json": {"result": "ok"}}

# CORRECT
return [{"json": {"result": "ok"}}]
```

### Error: "'NoneType' object is not subscriptable"

**Cause**: Accessing missing key

```python
# WRONG
value = item["json"]["missing_field"]

# CORRECT - Use .get() with default
value = item["json"].get("missing_field", "default")
```

### Error: "Library lost after container restart"

**Cause**: Live installation is not persistent

**Fix**: Use custom Dockerfile (Method 2 above)

### Error: "Python runner unavailable"

**Cause**: Runner container not running or not connected

```bash
# Check runner status
docker-compose logs n8n-runner

# Verify auth tokens match in both services
```

---

## Part 9: Best Practices

### Do

- **Validate input data** before processing
- **Use try/except** for external API calls
- **Use .get()** with defaults for safe dictionary access
- **Return early** on errors with descriptive messages
- **Keep code focused** - one task per Code node
- **Use standard library** when external libs aren't needed
- **Log errors** with `print()` for debugging

### Don't

- **Don't use dot notation** - Python requires bracket access
- **Don't forget return statement** - always return list
- **Don't hardcode credentials** - use `_env["VAR"]`
- **Don't skip webhook body** - data is under `["body"]`
- **Don't install to system Python** - use venv path

### Error Handling Pattern

```python
import traceback

try:
    items = _input.all()

    if not items:
        return [{"json": {"error": "No input items", "success": False}}]

    results = []
    for item in items:
        try:
            # Process individual item
            value = item["json"].get("value", 0)
            result = {"original": value, "processed": value * 2}
            results.append({"json": {**result, "success": True}})
        except Exception as e:
            results.append({"json": {
                "error": str(e),
                "item_id": item["json"].get("id"),
                "success": False
            }})

    return results

except Exception as e:
    return [{"json": {
        "error": str(e),
        "traceback": traceback.format_exc(),
        "success": False
    }}]
```

---

## Part 10: When to Use Python vs JavaScript

### Use Python When

| Scenario | Why |
|----------|-----|
| Data analysis | pandas is faster than JS alternatives |
| Machine learning | scikit-learn, tensorflow, pytorch |
| Heavy data processing | 10k+ items, complex transformations |
| Statistics | numpy, scipy for numerical computing |
| Scientific computing | Specialized Python libraries |
| Web scraping | BeautifulSoup, lxml support |

### Use JavaScript When

| Scenario | Why |
|----------|-----|
| Simple transforms | Faster startup, no runner overhead |
| String manipulation | JS string methods are excellent |
| DateTime operations | Luxon built-in, powerful API |
| Quick operations | Instant execution, no network latency |
| Small datasets | < 1000 items |
| $helpers.httpRequest | Built-in, handles auth well |

### Performance Comparison

| Factor | JavaScript | Python (Task Runner) |
|--------|------------|---------------------|
| Startup | Instant | ~10-50ms overhead |
| Simple ops | Fastest | Slower startup |
| Large data | Slows down | Optimized (pandas) |
| External libs | Limited | Full pip access |
| Memory | Shared | Isolated container |

---

## Quick Reference Checklist

Before deploying Python Code nodes:

- [ ] **Bracket notation used**: No dot access (`["field"]` not `.field`)
- [ ] **Return format correct**: `[{"json": {...}}]` list structure
- [ ] **Webhook data accessed**: Via `["body"]` key
- [ ] **Input validated**: Check for empty/missing data
- [ ] **Error handling**: try/except for external calls
- [ ] **Safe access**: `.get()` with defaults for optional fields
- [ ] **Task Runner setup**: If using external libraries
- [ ] **No hardcoded secrets**: Use `_env["VAR"]`

---

## Sources & Further Reading

- [Using the Code node - n8n Docs](https://docs.n8n.io/code/code-node/)
- [Enable modules in Code node - n8n Docs](https://docs.n8n.io/hosting/configuration/configuration-examples/modules-in-code-node/)
- [n8n v2.0 Breaking Changes](https://docs.n8n.io/2-0-breaking-changes/)
- [n8n Task Runners Deep Dive - Medium](https://medium.com/@abhishekaryan2/n8n-task-runners-the-blast-radius-protocol-1b8388364597)
- [Solving n8n v2 Python Task Runner - Blog](https://nfirdausblog.wordpress.com/2025/12/31/solving-the-n8n-v2-python-task-runner-nightmare-a-step-by-step-survival-guide/)
- [n8n Code Node External Libraries - DEV](https://dev.to/codebangkok/n8n-code-node-import-external-library-python-javascript-4lp7)

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `05-code-javascript` | JavaScript patterns and helpers |
| `07-expression-syntax` | Expression vs code differences |
| `03-node-configuration` | Code node settings |
| `08-validation-expert` | Debug code errors |

---

*See `community-fixes/python-external-libs/` for complete Task Runner setup files.*
