# Python External Libraries Workaround

> **Enable pandas, numpy, requests, and ANY Python library in n8n Code nodes**

## The Problem

By default, n8n's Python Code node only supports the standard library. The official documentation and most resources state:

> "Python in n8n has NO external libraries (no requests, pandas, numpy)"

**This is no longer true!** With n8n's external Task Runners, you can enable ALL Python libraries.

---

## The Solution: External Task Runners

n8n introduced **external task runners** that run Code nodes in isolated containers. By configuring these runners correctly, you can enable:

- `pandas` - Data manipulation
- `numpy` - Numerical computing
- `requests` - HTTP requests
- `scikit-learn` - Machine learning
- **Any pip-installable library**

---

## Setup Guide

### Prerequisites

- n8n self-hosted (Docker)
- Docker Compose
- Basic terminal knowledge

### Step 1: Update docker-compose.yml

Add the external task runner configuration to your n8n service:

```yaml
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    environment:
      # ... your existing environment variables ...

      # === TASK RUNNER SETTINGS (Python Support) ===
      - N8N_RUNNERS_MODE=external
      - N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0
      - N8N_RUNNERS_AUTH_TOKEN=your-secure-random-token-here
    depends_on:
      - postgres  # if using postgres

  # === EXTERNAL TASK RUNNER ===
  n8n-runner:
    image: n8nio/runners:latest
    restart: always
    volumes:
      - ./n8n-task-runners.json:/etc/n8n-task-runners.json:ro
    environment:
      - N8N_RUNNERS_TASK_BROKER_URI=http://n8n:5679
      - N8N_RUNNERS_AUTH_TOKEN=your-secure-random-token-here  # Must match n8n service
    depends_on:
      - n8n
    deploy:
      resources:
        limits:
          memory: 300M

volumes:
  n8n_data:
```

### Step 2: Create n8n-task-runners.json

Create this file in the same directory as your `docker-compose.yml`:

```json
{
  "task-runners": [
    {
      "runner-type": "javascript",
      "workdir": "/home/runner",
      "command": "/usr/local/bin/node",
      "args": [
        "--disallow-code-generation-from-strings",
        "--disable-proto=delete",
        "/opt/runners/task-runner-javascript/dist/start.js"
      ],
      "health-check-server-port": "5681",
      "allowed-env": [
        "PATH",
        "GENERIC_TIMEZONE",
        "NODE_OPTIONS",
        "N8N_RUNNERS_AUTO_SHUTDOWN_TIMEOUT",
        "N8N_RUNNERS_TASK_TIMEOUT",
        "N8N_RUNNERS_MAX_CONCURRENCY",
        "HOME"
      ],
      "env-overrides": {
        "NODE_FUNCTION_ALLOW_BUILTIN": "*",
        "NODE_FUNCTION_ALLOW_EXTERNAL": "*",
        "N8N_RUNNERS_HEALTH_CHECK_SERVER_HOST": "0.0.0.0"
      }
    },
    {
      "runner-type": "python",
      "workdir": "/home/runner",
      "command": "/opt/runners/task-runner-python/.venv/bin/python",
      "args": ["-m", "src.main"],
      "health-check-server-port": "5682",
      "allowed-env": [
        "PATH",
        "N8N_RUNNERS_LAUNCHER_LOG_LEVEL",
        "N8N_RUNNERS_AUTO_SHUTDOWN_TIMEOUT",
        "N8N_RUNNERS_TASK_TIMEOUT",
        "N8N_RUNNERS_MAX_CONCURRENCY"
      ],
      "env-overrides": {
        "PYTHONPATH": "/opt/runners/task-runner-python",
        "N8N_RUNNERS_STDLIB_ALLOW": "*",
        "N8N_RUNNERS_EXTERNAL_ALLOW": "*"
      }
    }
  ]
}
```

### Step 3: Generate Auth Token

Generate a secure random token:

```bash
openssl rand -hex 32
```

Use this token in both:
- `N8N_RUNNERS_AUTH_TOKEN` in the n8n service
- `N8N_RUNNERS_AUTH_TOKEN` in the n8n-runner service

### Step 4: Restart Services

```bash
docker-compose down
docker-compose up -d
```

### Step 5: Verify Setup

Check that the runner is connected:

```bash
docker-compose logs n8n-runner
```

You should see successful connection messages.

---

## Key Configuration Explained

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `N8N_RUNNERS_MODE=external` | Enables external task runners |
| `N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0` | Allows runner connections |
| `N8N_RUNNERS_AUTH_TOKEN` | Secures runner communication |
| `N8N_RUNNERS_TASK_BROKER_URI` | Runner connects to n8n broker |

### Task Runner Config

| Setting | Purpose |
|---------|---------|
| `N8N_RUNNERS_STDLIB_ALLOW: "*"` | Allows ALL Python standard library |
| `N8N_RUNNERS_EXTERNAL_ALLOW: "*"` | **Allows ALL external pip packages** |
| `NODE_FUNCTION_ALLOW_EXTERNAL: "*"` | Allows external npm packages for JS |

---

## Using External Libraries in Code Nodes

### Python Example with pandas

```python
import pandas as pd
import json

# Get input data
input_data = _input.all()

# Convert to DataFrame
df = pd.DataFrame([item['json'] for item in input_data])

# Perform operations
df['processed'] = df['value'] * 2
df['category'] = df['value'].apply(lambda x: 'high' if x > 50 else 'low')

# Return as n8n format
return [{'json': row} for row in df.to_dict('records')]
```

### Python Example with requests

```python
import requests

# Make external API call
response = requests.get('https://api.example.com/data',
    headers={'Authorization': 'Bearer token123'}
)

data = response.json()

return [{'json': {'result': data, 'status': response.status_code}}]
```

### Python Example with numpy

```python
import numpy as np

input_data = _input.all()
values = [item['json']['value'] for item in input_data]

# Numpy operations
arr = np.array(values)
stats = {
    'mean': float(np.mean(arr)),
    'std': float(np.std(arr)),
    'min': float(np.min(arr)),
    'max': float(np.max(arr)),
    'median': float(np.median(arr))
}

return [{'json': stats}]
```

---

## Pre-installed Libraries

> **IMPORTANT:** The `n8nio/runners:latest` image does **NOT** include external libraries by default.

**What's actually installed:**
- Python 3.13.x
- `pip` (package manager only)
- Python standard library (json, datetime, re, hashlib, base64, urllib, etc.)

**What's NOT installed:**
- pandas
- numpy
- requests
- python-dateutil
- pytz
- Any other external libraries

### Available Standard Library Modules

These modules are available without any additional installation:

| Category | Modules |
|----------|---------|
| Data | `json`, `csv`, `pickle`, `sqlite3`, `xml` |
| Text | `re`, `string`, `textwrap`, `difflib` |
| DateTime | `datetime`, `calendar`, `time`, `zoneinfo` |
| Math | `math`, `statistics`, `random`, `decimal`, `fractions` |
| Crypto | `hashlib`, `hmac`, `secrets` |
| Encoding | `base64`, `binascii`, `codecs` |
| Network | `urllib`, `http`, `socket`, `ssl`, `email` |
| Files | `os`, `pathlib`, `shutil`, `glob`, `tempfile`, `gzip`, `zipfile` |
| System | `sys`, `subprocess`, `threading`, `multiprocessing`, `asyncio` |
| Utils | `collections`, `itertools`, `functools`, `copy`, `typing` |

### Installing External Libraries

There are two methods to install external libraries:

#### Method 1: Live Installation (Quick Testing)

Install directly into a running container (changes are lost on container restart):

```bash
# SSH into your server
ssh -i <your-key> ubuntu@<your-ip>

# Install package to the venv site-packages (MUST run as root)
docker exec -u root <runner-container-name> pip install \
    --target=/opt/runners/task-runner-python/.venv/lib/python3.13/site-packages/ \
    numpy pandas requests

# Verify installation
docker exec <runner-container-name> \
    /opt/runners/task-runner-python/.venv/bin/python \
    -c "import numpy; print(f'NumPy {numpy.__version__} installed!')"
```

**Example with actual container name:**
```bash
docker exec -u root n8n_compose-n8n-runner-1 pip install \
    --target=/opt/runners/task-runner-python/.venv/lib/python3.13/site-packages/ \
    numpy
```

#### Method 2: Custom Dockerfile (Persistent)

For permanent installation, create a custom Dockerfile:

```dockerfile
FROM n8nio/runners:latest

# Install packages to the venv site-packages
RUN pip install \
    --target=/opt/runners/task-runner-python/.venv/lib/python3.13/site-packages/ \
    pandas \
    numpy \
    requests \
    python-dateutil \
    pytz

# Optional: Add more libraries as needed
RUN pip install \
    --target=/opt/runners/task-runner-python/.venv/lib/python3.13/site-packages/ \
    scikit-learn \
    beautifulsoup4 \
    lxml \
    openpyxl
```

Then update your docker-compose.yml to build from your custom Dockerfile:

```yaml
n8n-runner:
  build: ./custom-runner
  # ... rest of config
```

---

## Troubleshooting

### Runner Not Connecting

1. Check auth tokens match in both services
2. Verify network connectivity between containers
3. Check logs: `docker-compose logs n8n-runner`

### Library Not Found ("No module named 'X'")

**Root Cause:** Library was installed in the wrong location.

**Solution:** Install to the task runner's venv site-packages:

```bash
# WRONG - Installs to system Python (won't work)
docker exec n8n-runner pip install numpy

# CORRECT - Install to venv site-packages
docker exec -u root n8n-runner pip install \
    --target=/opt/runners/task-runner-python/.venv/lib/python3.13/site-packages/ \
    numpy
```

**Verify installation location:**
```bash
docker exec n8n-runner \
    /opt/runners/task-runner-python/.venv/bin/python \
    -c "import numpy; print(numpy.__file__)"

# Should output:
# /opt/runners/task-runner-python/.venv/lib/python3.13/site-packages/numpy/__init__.py
```

### Permission Denied During Install

Run docker exec as root:
```bash
# Add -u root flag
docker exec -u root <container-name> pip install ...
```

### Library Lost After Container Restart

Use Method 2 (Custom Dockerfile) for persistent installations, or re-run the install command after each restart.

### Memory Issues

Increase runner memory limit:

```yaml
n8n-runner:
  deploy:
    resources:
      limits:
        memory: 512M  # Increase as needed
```

### Python Path Issues

The task runner uses a virtual environment at `/opt/runners/task-runner-python/.venv/`. Verify the Python path includes the venv:

```bash
docker exec n8n-runner \
    /opt/runners/task-runner-python/.venv/bin/python \
    -c "import sys; print('\n'.join(sys.path))"
```

Should include:
```
/opt/runners/task-runner-python/.venv/lib/python3.13/site-packages
```

---

## Security Considerations

Enabling `N8N_RUNNERS_EXTERNAL_ALLOW: "*"` allows ANY Python code execution. Consider:

1. **Restrict to specific libraries** if possible:
   ```json
   "N8N_RUNNERS_EXTERNAL_ALLOW": "pandas,numpy,requests"
   ```

2. **Network isolation** - Run runners in isolated network

3. **Resource limits** - Set memory/CPU limits on runner container

4. **Access control** - Limit who can create/edit workflows

---

## Tested Configurations

| n8n Version | Runner Image | Python Version | Status |
|-------------|--------------|----------------|--------|
| 2.1.4 | n8nio/runners:latest | 3.13.11 | Verified Dec 2025 |
| 2.0+ | n8nio/runners:latest | 3.13.x | Working |
| 1.82.3 | n8nio/runners:latest | 3.x | Working |

**Verified:** The base `n8nio/runners:latest` image includes only Python stdlib + pip. External libraries require custom Dockerfile.

---

## Credits

- **Workaround discovered by:** Atak Chol ([@Chol369](https://github.com/Chol369))
- **Tested on:** AWS EC2, self-hosted n8n with PostgreSQL

---

*Last Updated: December 2025*
