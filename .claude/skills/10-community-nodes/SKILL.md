# n8n Community Nodes & Extensions

> **Discover and use community-contributed nodes, packages, and extensions**

## Overview

This skill covers community-contributed n8n nodes, popular packages, AI tool integrations, and how to extend n8n's functionality beyond the built-in nodes.

---

## What Are Community Nodes?

Community nodes are npm packages that extend n8n's functionality. They provide integrations not included in the core n8n-nodes-base package.

**Types**:
- **Service integrations** - Connect to additional APIs/services
- **AI tools** - Extended AI/ML capabilities
- **Utility nodes** - Helper functions and transformations
- **Custom triggers** - New trigger types

---

## Installing Community Nodes

### Via n8n UI (Recommended)

1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter the npm package name
4. Click **Install**

### Via npm (Self-hosted)

```bash
# In your n8n directory
npm install n8n-nodes-package-name

# Restart n8n
```

### Via Docker

```dockerfile
FROM n8nio/n8n

# Install community nodes
RUN npm install n8n-nodes-package-name

# Or use environment variable
ENV N8N_COMMUNITY_PACKAGES="n8n-nodes-package1,n8n-nodes-package2"
```

---

## Popular Community Packages

### AI & Machine Learning

| Package | Description | Use Case |
|---------|-------------|----------|
| `n8n-nodes-huggingface` | Hugging Face models | Text generation, classification |
| `n8n-nodes-replicate` | Replicate AI | Image generation, ML models |
| `n8n-nodes-stability-ai` | Stability AI | Image generation |
| `n8n-nodes-elevenlabs` | ElevenLabs | Text-to-speech |

### Productivity & Collaboration

| Package | Description | Use Case |
|---------|-------------|----------|
| `n8n-nodes-linear` | Linear.app | Issue tracking |
| `n8n-nodes-todoist` | Todoist | Task management |
| `n8n-nodes-baserow` | Baserow | Open-source Airtable |

### E-commerce & Payments

| Package | Description | Use Case |
|---------|-------------|----------|
| `n8n-nodes-lemonsqueezy` | LemonSqueezy | Digital products |
| `n8n-nodes-gumroad` | Gumroad | Digital products |
| `n8n-nodes-paddle` | Paddle | Subscription billing |

### Communication

| Package | Description | Use Case |
|---------|-------------|----------|
| `n8n-nodes-telegram-extra` | Extended Telegram | Advanced bot features |
| `n8n-nodes-whatsapp-business` | WhatsApp Business | Business messaging |
| `n8n-nodes-twilio-extended` | Extended Twilio | Advanced SMS/voice |

### Developer Tools

| Package | Description | Use Case |
|---------|-------------|----------|
| `n8n-nodes-git` | Git operations | Repository management |
| `n8n-nodes-docker` | Docker | Container management |
| `n8n-nodes-kubernetes` | Kubernetes | K8s operations |

---

## AI Tools for Agent Workflows

n8n's AI agent workflows can use tools from various sources:

### Built-in AI Tools

These are included in `@n8n/n8n-nodes-langchain`:

| Tool | Purpose |
|------|---------|
| `toolHttpRequest` | Make HTTP requests |
| `toolCode` | Execute JavaScript/Python |
| `toolCalculator` | Mathematical operations |
| `toolWikipedia` | Wikipedia search |
| `toolWorkflow` | Call other workflows |
| `toolVectorStore` | Query vector databases |

### Creating Custom Tools

Use the **Tool Workflow** node to turn any workflow into an AI tool:

```javascript
// In the sub-workflow that becomes a tool
// Input is available as $json.query or $json.input

const result = await processQuery($json.query);

return [{
  json: {
    response: result
  }
}];
```

### Tool Configuration Pattern

```javascript
{
  "type": "@n8n/n8n-nodes-langchain.toolHttpRequest",
  "typeVersion": 1,
  "name": "API Tool",
  "parameters": {
    "name": "search_api",
    "description": "Search external API for information",
    "method": "GET",
    "url": "https://api.example.com/search",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        { "name": "q", "value": "={{ $json.query }}" }
      ]
    }
  }
}
```

---

## Vector Store Integrations

### Supported Vector Databases

| Vector Store | Package | Use Case |
|--------------|---------|----------|
| Pinecone | Built-in | Production RAG |
| Qdrant | Built-in | Self-hosted option |
| Supabase | Built-in | Postgres-based |
| Weaviate | Built-in | Open-source, self-hosted |
| Milvus | Built-in | High-performance |
| Chroma | Community | Local development |
| FAISS | Community | In-memory |

### Vector Store Configuration

```javascript
{
  "type": "@n8n/n8n-nodes-langchain.vectorStorePinecone",
  "parameters": {
    "pineconeIndex": "my-index",
    "pineconeNamespace": "documents"
  },
  "credentials": {
    "pineconeApi": {
      "id": "credential-id",
      "name": "Pinecone API"
    }
  }
}
```

---

## Creating Custom Nodes

### Basic Structure

```typescript
// nodes/MyNode/MyNode.node.ts
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
    description: 'My custom node',
    defaults: {
      name: 'My Node',
    },
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

### Package Structure

```
n8n-nodes-my-package/
├── package.json
├── nodes/
│   └── MyNode/
│       ├── MyNode.node.ts
│       └── myNode.svg
├── credentials/
│   └── MyCredential.credentials.ts
└── dist/
```

### package.json

```json
{
  "name": "n8n-nodes-my-package",
  "version": "1.0.0",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "nodes": [
      "dist/nodes/MyNode/MyNode.node.js"
    ],
    "credentials": [
      "dist/credentials/MyCredential.credentials.js"
    ]
  }
}
```

---

## Best Practices for Community Nodes

### Before Installing

1. **Check compatibility** - Ensure node supports your n8n version
2. **Review source code** - Check GitHub repo for quality
3. **Check maintenance** - Look for recent commits and releases
4. **Read reviews** - Check community forum for feedback
5. **Test in development** - Always test before production

### Security Considerations

- Only install from trusted sources
- Review permissions requested by the node
- Check for known vulnerabilities
- Keep packages updated
- Use self-hosted n8n for sensitive data

### Troubleshooting

**Node not appearing:**
1. Restart n8n after installation
2. Check npm install output for errors
3. Verify package name is correct

**Node errors:**
1. Check n8n version compatibility
2. Review node documentation
3. Check credentials configuration
4. Look for GitHub issues

---

## Finding Community Nodes

### Official Sources

- **n8n Community Forum**: https://community.n8n.io/
- **npm search**: `npm search n8n-nodes`
- **GitHub topics**: `n8n-node`, `n8n-community-node`

### Search on npm

```bash
# Search for n8n community nodes
npm search n8n-nodes

# Check package info
npm info n8n-nodes-package-name
```

### GitHub Search

Search for repositories with:
- Topic: `n8n-node`
- Keywords: "n8n-nodes-" in name
- Language: TypeScript

---

## Langchain Node Types

For AI workflows, these node types are available from `@n8n/n8n-nodes-langchain`:

### Agent Types

| Node | Purpose |
|------|---------|
| `agent` | Main AI agent with tools |
| `chainLlm` | Simple LLM chain |
| `chainRetrievalQa` | RAG question answering |
| `chainSummarization` | Document summarization |

### Language Models

| Node | Provider |
|------|----------|
| `lmChatOpenAi` | OpenAI GPT models |
| `lmChatAnthropic` | Claude models |
| `lmChatOllama` | Local Ollama models |
| `lmChatAzureOpenAi` | Azure OpenAI |
| `lmChatGoogleVertex` | Google Vertex AI |

### Memory Types

| Node | Storage |
|------|---------|
| `memoryBufferWindow` | In-memory, window |
| `memoryPostgresChat` | PostgreSQL |
| `memoryRedisChat` | Redis |
| `memoryXata` | Xata database |

### Document Loaders

| Node | Source |
|------|--------|
| `documentDefaultDataLoader` | n8n data |
| `documentGithubLoader` | GitHub repos |
| `documentBinaryInputLoader` | Binary files |
| `documentJsonInputLoader` | JSON data |

---

## Contributing to Community

### Publishing Your Node

1. Create your node following n8n patterns
2. Test thoroughly
3. Publish to npm
4. Add `n8n-node` topic to GitHub repo
5. Share on n8n community forum

### Documentation Standards

- Clear README with installation steps
- Usage examples
- Configuration options
- Troubleshooting guide
- Version compatibility notes

---

## Summary

**Key Points**:
1. Community nodes extend n8n beyond built-in integrations
2. Install via n8n UI, npm, or Docker
3. AI tools can be built-in, community, or custom workflows
4. Vector stores enable RAG applications
5. Custom nodes follow standard TypeScript patterns
6. Always verify security before installing

**Resources**:
- n8n Community Forum
- npm registry (search: n8n-nodes)
- GitHub (topic: n8n-node)
- n8n Documentation

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `02-workflow-patterns` | AI Agent workflow patterns |
| `03-node-configuration` | Configure community nodes |
| `04-mcp-tools-expert` | Discover available nodes |
| `06-code-python` | Custom Python logic |

