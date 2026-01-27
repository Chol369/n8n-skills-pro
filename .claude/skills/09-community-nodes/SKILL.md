# n8n Community Nodes & Extensions

> **Discover, evaluate, and safely use community-contributed nodes and extensions**

## Overview

Community nodes extend n8n beyond its 500+ built-in integrations. As of January 2026, the ecosystem includes **5,834+ community nodes** with an average growth of 13.6 new nodes daily.

**Critical**: Following the January 2026 supply chain attack, security evaluation is mandatory before installing any community node.

---

## 1. Security First (CRITICAL)

### The January 2026 Supply Chain Attack

A coordinated attack targeted the n8n ecosystem with malicious npm packages disguised as legitimate integrations (Google Ads, Stripe, Salesforce connectors). The packages harvested OAuth tokens and API credentials.

**Attack vectors used:**
- Typosquatting popular package names
- Impersonating verified integrations
- Exfiltrating credentials via outbound HTTP requests

### What Community Nodes Can Access

Community nodes run with **full n8n privileges**:

| Access Level | Risk |
|-------------|------|
| Environment variables | Can read all `$env` values |
| File system | Full read/write to n8n's filesystem |
| Network | Arbitrary outbound HTTP requests |
| Credentials | **Decrypted API keys and OAuth tokens at runtime** |
| System | Full Node.js runtime access |

**There is NO sandboxing** between node code and the n8n runtime.

### Security Checklist Before Installing

```
[ ] Check package author history
[ ] Review download count (low = higher risk)
[ ] Examine GitHub repo for source code
[ ] Check last update date (stale = potential risk)
[ ] Read package.json for dependencies
[ ] Search for security advisories
[ ] Prefer verified nodes when available
[ ] Test in isolated environment first
```

### Red Flags to Avoid

| Red Flag | Why It's Dangerous |
|----------|-------------------|
| Empty or minimal description | May be hiding malicious intent |
| Random author name | Pseudonymous accounts used in attacks |
| Very low downloads (<100) | Unvetted package |
| No GitHub repository | Can't audit source code |
| Excessive dependencies | Larger attack surface |
| Recent creation + popular name | Typosquatting attempt |

### Environment Variable Protection

```bash
# Disable community nodes entirely (most secure)
N8N_COMMUNITY_PACKAGES_ENABLED=false

# If you must use community nodes, audit installed packages
docker exec n8n npm list --depth=0
```

---

## 2. Verified vs Unverified Nodes

### Verified Nodes (n8n Cloud)

Verified nodes have passed n8n's security review and are available on n8n Cloud.

**Verification requirements:**
- MIT license
- No external dependencies
- Design compliance
- Security audit passed

**Currently verified partners (as of January 2026):**

| Category | Verified Nodes |
|----------|---------------|
| AI/Voice | ElevenLabs |
| Search | Brave Search API, SerpApi, Tavily |
| PDF | PDF.co, pdforge, CraftMyPDF |
| Data | Bright Data, Qdrant, Chat Data |
| Video | Beyond Presence |
| Security | SOCRadar |
| Translation | Straker |
| Task Management | Vikunja |
| CRM | SignifyCRM, KlickTipp |
| Development | YepCode, Cronlytic |
| Other | ClickSend, Easy Redmine, Fireflies, gotoHuman, Ledgers, Parsera, ScrapeGraphAI, Scrapeless, Browserflow, Mallabe |

### Unverified Nodes (Self-Hosted Only)

Available only on self-hosted instances. **Use at your own risk.**

---

## 3. Top Community Nodes by Downloads

Data from [NCNodes](https://ncnodes.com) as of January 2026:

### Most Popular Overall

| Package | Downloads | Description |
|---------|-----------|-------------|
| `n8n-nodes-globals` | 455,052 | Global constants across workflows |
| `@mendable/n8n-nodes-firecrawl` | 160,744 | Web scraping and crawling |
| `n8n-nodes-deepseek` | 59,452 | DeepSeek AI integration |
| `n8n-nodes-rd-station-crm` | 54,108 | RD Station CRM API |
| `@devlikeapro/n8n-nodes-waha` | 45,402 | WhatsApp HTTP API |

### By Category

#### Communication & Messaging

| Package | Downloads | Use Case |
|---------|-----------|----------|
| `@devlikeapro/n8n-nodes-waha` | 45,402 | WhatsApp automation |
| `n8n-nodes-evolution-api` | 30,000+ | WhatsApp channel hub |
| `n8n-nodes-chat-data` | 13,901 | Chatbot management |
| `n8n-nodes-quepasa` | 8,850 | Quepasa platform |
| `n8n-nodes-chatwoot` | 5,000+ | ChatWoot integration |

#### AI & Language Models

| Package | Downloads | Use Case |
|---------|-----------|----------|
| `n8n-nodes-deepseek` | 59,452 | DeepSeek AI |
| `@elevenlabs/n8n-nodes-elevenlabs` | 10,000+ | Voice synthesis |
| `@watzon/n8n-nodes-perplexity` | 5,000+ | Perplexity AI |
| `n8n-nodes-mcp` | 3,000+ | Model Context Protocol |

#### Web Scraping & Data

| Package | Downloads | Use Case |
|---------|-----------|----------|
| `@mendable/n8n-nodes-firecrawl` | 160,744 | Web crawling |
| `@apify/n8n-nodes-apify` | 15,000+ | Web automation |
| `n8n-nodes-puppeteer` | 10,000+ | Browser automation |
| `n8n-nodes-serpapi` | 8,000+ | Search results |
| `n8n-nodes-supadata` | 5,000+ | YouTube data |

#### Utilities

| Package | Downloads | Use Case |
|---------|-----------|----------|
| `n8n-nodes-globals` | 455,052 | Global constants |
| `n8n-nodes-tesseractjs` | 8,000+ | OCR text extraction |
| `n8n-nodes-logger` | 6,000+ | Centralized logging |
| `n8n-nodes-datastore` | 4,000+ | In-memory storage |

---

## 4. Installation Methods

### Method 1: n8n UI (Recommended for Cloud/Self-Hosted)

```
Settings → Community Nodes → Install a community node
Enter: package-name (e.g., n8n-nodes-globals)
Click: Install
```

**Note**: Only verified nodes appear on n8n Cloud.

### Method 2: npm (Self-Hosted Only)

```bash
# Install to n8n's node_modules
cd ~/.n8n
npm install n8n-nodes-package-name

# Restart n8n
pm2 restart n8n
# or
docker-compose restart n8n
```

### Method 3: Docker (Persistent Installation)

```dockerfile
FROM n8nio/n8n:latest

# Install community nodes
RUN cd /usr/local/lib/node_modules/n8n && \
    npm install n8n-nodes-globals \
    n8n-nodes-tesseractjs \
    n8n-nodes-deepseek
```

Or via environment variable:

```yaml
# docker-compose.yml
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_COMMUNITY_PACKAGES=n8n-nodes-globals,n8n-nodes-tesseractjs
```

### Method 4: Environment Variable Auto-Install

```bash
# Comma-separated list of packages to install on startup
N8N_COMMUNITY_PACKAGES="n8n-nodes-globals,n8n-nodes-deepseek"
```

---

## 5. MCP Integration (Model Context Protocol)

MCP enables AI agents to interact with external tools and data sources.

### Built-in MCP Nodes

n8n includes native MCP support:

| Node | Purpose |
|------|---------|
| `MCP Server Trigger` | Expose workflows as MCP tools |
| `MCP Client Tool` | Call external MCP servers from n8n |

### MCP Server Trigger Configuration

Expose a workflow as an MCP tool:

```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.mcpTrigger",
      "typeVersion": 1,
      "name": "MCP Server Trigger",
      "parameters": {
        "toolName": "search_database",
        "toolDescription": "Search the product database by query"
      }
    }
  ]
}
```

### MCP Client Tool Configuration

Call external MCP servers:

```json
{
  "type": "@n8n/n8n-nodes-langchain.toolMcp",
  "typeVersion": 1,
  "parameters": {
    "sseEndpoint": "https://mcp-server.example.com/sse",
    "authentication": "bearerAuth"
  },
  "credentials": {
    "httpBearerAuth": {
      "id": "credential-id"
    }
  }
}
```

### Community MCP Node

For advanced MCP usage:

```bash
# Install community MCP node
npm install n8n-nodes-mcp

# Required environment variable for AI Agent tool usage
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

Package: [nerding-io/n8n-nodes-mcp](https://github.com/nerding-io/n8n-nodes-mcp)

---

## 6. AI & LangChain Nodes

### Built-in AI Nodes (`@n8n/n8n-nodes-langchain`)

#### Agent Types

| Node | Purpose |
|------|---------|
| `agent` | Main AI agent with tool calling |
| `chainLlm` | Simple LLM chain |
| `chainRetrievalQa` | RAG question answering |
| `chainSummarization` | Document summarization |

#### Language Models

| Node | Provider |
|------|----------|
| `lmChatOpenAi` | OpenAI GPT-4, GPT-4o |
| `lmChatAnthropic` | Claude 3.5, Claude 4 |
| `lmChatOllama` | Local Ollama models |
| `lmChatAzureOpenAi` | Azure OpenAI |
| `lmChatGoogleVertex` | Google Vertex AI |
| `lmChatGroq` | Groq (fast inference) |
| `lmChatDeepSeek` | DeepSeek models |

#### Built-in AI Tools

| Tool | Purpose |
|------|---------|
| `toolHttpRequest` | Make HTTP requests |
| `toolCode` | Execute JavaScript/Python |
| `toolCalculator` | Mathematical operations |
| `toolWikipedia` | Wikipedia search |
| `toolWorkflow` | Call other n8n workflows |
| `toolVectorStore` | Query vector databases |
| `toolMcp` | Call MCP servers |

#### Memory Types

| Node | Storage |
|------|---------|
| `memoryBufferWindow` | In-memory (window) |
| `memoryPostgresChat` | PostgreSQL |
| `memoryRedisChat` | Redis |
| `memoryXata` | Xata database |
| `memorySqlite` | SQLite |

### Custom AI Tool Pattern

Turn any workflow into an AI tool using the Tool Workflow node:

```javascript
// Sub-workflow that becomes an AI tool
// Receives: $json.query from the AI agent

const searchResults = await fetch(`https://api.example.com/search?q=${$json.query}`);
const data = await searchResults.json();

return [{
  json: {
    response: data.results.map(r => r.title).join('\n')
  }
}];
```

---

## 7. Vector Store Integrations

For RAG (Retrieval-Augmented Generation) applications:

### Built-in Vector Stores

| Vector Store | Use Case | Self-Hosted |
|--------------|----------|-------------|
| Pinecone | Production RAG | No |
| Qdrant | High performance | Yes |
| Supabase | Postgres-based | Yes |
| Weaviate | Open-source | Yes |
| Milvus | Large scale | Yes |
| PGVector | PostgreSQL extension | Yes |
| Chroma | Local development | Yes |

### Vector Store Configuration

```json
{
  "type": "@n8n/n8n-nodes-langchain.vectorStorePinecone",
  "typeVersion": 1,
  "parameters": {
    "pineconeIndex": "my-index",
    "pineconeNamespace": "documents",
    "topK": 5
  },
  "credentials": {
    "pineconeApi": {
      "id": "credential-id",
      "name": "Pinecone API"
    }
  }
}
```

### Embedding Models

| Node | Provider |
|------|----------|
| `embeddingsOpenAi` | OpenAI ada-002, text-embedding-3 |
| `embeddingsCohere` | Cohere |
| `embeddingsOllama` | Local Ollama |
| `embeddingsHuggingFaceInference` | Hugging Face |

---

## 8. Building Custom Nodes

### Quick Start

```bash
# Scaffold a new node package
npm create @n8n/node

# Or clone the starter template
git clone https://github.com/n8n-io/n8n-nodes-starter.git
cd n8n-nodes-starter
npm install
```

### Package Structure

```
n8n-nodes-my-package/
├── package.json           # Node registration
├── nodes/
│   └── MyNode/
│       ├── MyNode.node.ts  # Node implementation
│       └── myNode.svg      # Node icon
├── credentials/
│   └── MyCredential.credentials.ts
└── dist/                   # Compiled output
```

### package.json Requirements

```json
{
  "name": "n8n-nodes-my-package",
  "version": "1.0.0",
  "description": "My custom n8n node",
  "license": "MIT",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "nodes": [
      "dist/nodes/MyNode/MyNode.node.js"
    ],
    "credentials": [
      "dist/credentials/MyCredential.credentials.js"
    ]
  },
  "devDependencies": {
    "@n8n/n8n-nodes-langchain": "^1.0.0",
    "n8n-workflow": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Node Implementation (Declarative Style - Recommended)

```typescript
import {
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class MyApiNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'My API',
    name: 'myApi',
    icon: 'file:myApi.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Interact with My API',
    defaults: {
      name: 'My API',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'myApiCredentials',
        required: true,
      },
    ],
    requestDefaults: {
      baseURL: 'https://api.example.com/v1',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'User', value: 'user' },
          { name: 'Item', value: 'item' },
        ],
        default: 'user',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['user'] },
        },
        options: [
          { name: 'Get', value: 'get', action: 'Get a user' },
          { name: 'List', value: 'list', action: 'List users' },
        ],
        default: 'get',
      },
    ],
  };
}
```

### Node Implementation (Programmatic Style)

```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class MyNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'My Node',
    name: 'myNode',
    group: ['transform'],
    version: 1,
    description: 'Process data with custom logic',
    defaults: { name: 'My Node' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Field',
        name: 'field',
        type: 'string',
        default: '',
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const field = this.getNodeParameter('field', 0) as string;

    const results = items.map(item => ({
      json: {
        ...item.json,
        processed: true,
        field,
      },
    }));

    return [results];
  }
}
```

### Development Commands

```bash
npm run dev       # Start n8n with hot reload
npm run build     # Compile TypeScript
npm run lint      # Validate code quality
npm run lint:fix  # Auto-fix issues
npm run release   # Manage version releases
```

### Publishing to npm

```bash
# 1. Build production code
npm run build

# 2. Test locally
npm run dev

# 3. Publish to npm
npm publish

# 4. (Optional) Submit for verification via n8n Creator Portal
```

---

## 9. Discovery Resources

### Official Sources

| Source | URL | Use Case |
|--------|-----|----------|
| npm Registry | `npm search n8n-nodes` | Browse all packages |
| NCNodes Directory | [ncnodes.com](https://ncnodes.com) | Curated list with stats |
| awesome-n8n | [GitHub](https://github.com/restyler/awesome-n8n) | Community-curated list |
| n8n Community Forum | [community.n8n.io](https://community.n8n.io) | Discussions & support |
| GitHub Topics | `n8n-node`, `n8n-community-node` | Source code repos |

### npm Search Commands

```bash
# Search for community nodes
npm search n8n-nodes

# Check package info
npm info n8n-nodes-package-name

# View package security
npm audit n8n-nodes-package-name
```

### GitHub Search

```
topic:n8n-node language:TypeScript
"n8n-nodes-" in:name
```

---

## 10. Troubleshooting

### Node Not Appearing

1. **Restart n8n** after installation
2. **Check npm output** for errors
3. **Verify package name** is correct
4. **Check n8n version** compatibility
5. **Review logs**: `docker-compose logs n8n`

### Node Errors

| Error | Solution |
|-------|----------|
| "Node type not found" | Package not installed or wrong name |
| "Credential not found" | Add credentials in n8n Settings |
| "Version mismatch" | Update n8n or the package |
| "Permission denied" | Check file permissions in Docker |

### Dependency Conflicts

```bash
# Clear n8n cache
rm -rf ~/.n8n/node_modules/.cache

# Reinstall community nodes
npm install n8n-nodes-package-name --force
```

### Security Incident Response

If you suspect a malicious node:

1. **Immediately disable** the node in workflows
2. **Rotate all credentials** used by workflows with that node
3. **Check outbound connections** in network logs
4. **Uninstall the package**: `npm uninstall n8n-nodes-package-name`
5. **Report to n8n**: community@n8n.io

---

## 11. Best Practices Summary

### Do

- Prefer built-in nodes over community alternatives
- Use verified nodes on n8n Cloud when available
- Audit source code before installing
- Test in isolated environment first
- Keep community nodes updated
- Monitor n8n security advisories
- Use isolated service accounts with limited privileges

### Don't

- Install nodes with low download counts without auditing
- Use community nodes for sensitive credential handling
- Skip security review for "popular" packages
- Ignore deprecation or security warnings
- Run unverified nodes in production without testing

### Environment Hardening

```bash
# Disable community nodes if not needed
N8N_COMMUNITY_PACKAGES_ENABLED=false

# Restrict outbound network access
# (via firewall rules or Docker network policies)

# Use read-only filesystem for n8n container
# (where possible)

# Regular security audits
npm audit
```

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `02-workflow-patterns` | AI Agent workflow architectures |
| `03-node-configuration` | Configure any node properly |
| `04-mcp-tools-expert` | Use n8n-mcp tools for discovery |
| `05-code-javascript` | Custom JavaScript logic |
| `06-code-python` | Custom Python logic |

---

## References

- [n8n Community Nodes Docs](https://docs.n8n.io/integrations/community-nodes/)
- [NCNodes Directory](https://ncnodes.com)
- [awesome-n8n](https://github.com/restyler/awesome-n8n)
- [n8n-nodes-starter](https://github.com/n8n-io/n8n-nodes-starter)
- [n8n Community Forum](https://community.n8n.io)
- [Supply Chain Attack Report (January 2026)](https://www.endorlabs.com/learn/n8mare-on-auth-street-supply-chain-attack-targets-n8n-ecosystem)
