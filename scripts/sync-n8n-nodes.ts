#!/usr/bin/env npx ts-node
/**
 * n8n Node Sync Script
 *
 * Fetches and caches n8n node information for offline validation.
 * Uses n8n-mcp tools when available, falls back to local cache.
 *
 * Run with: npx ts-node scripts/sync-n8n-nodes.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface NodeInfo {
  nodeType: string;
  displayName: string;
  description: string;
  category: string;
  package: string;
  isAITool: boolean;
  isTrigger: boolean;
  lastUpdated: string;
}

interface NodeCache {
  version: string;
  lastSync: string;
  nodes: Record<string, NodeInfo>;
}

const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'n8n-nodes.json');

// Core nodes that must exist (for validation)
const CORE_NODES = [
  // Base nodes
  'nodes-base.httpRequest',
  'nodes-base.webhook',
  'nodes-base.code',
  'nodes-base.set',
  'nodes-base.if',
  'nodes-base.switch',
  'nodes-base.merge',
  'nodes-base.splitInBatches',
  'nodes-base.wait',
  'nodes-base.executeWorkflow',
  // Popular integrations
  'nodes-base.slack',
  'nodes-base.googleSheets',
  'nodes-base.airtable',
  'nodes-base.notion',
  'nodes-base.hubspot',
  'nodes-base.shopify',
  'nodes-base.stripe',
  'nodes-base.mailchimp',
  'nodes-base.sendGrid',
  'nodes-base.openAi',
  // AI/Langchain nodes
  'nodes-langchain.agent',
  'nodes-langchain.lmChatOpenAi',
  'nodes-langchain.lmChatAnthropic',
  'nodes-langchain.lmChatOllama',
  'nodes-langchain.toolHttpRequest',
  'nodes-langchain.toolCode',
  'nodes-langchain.memoryBufferWindow',
  'nodes-langchain.vectorStorePinecone',
];

// AI connection types (for validation)
const AI_CONNECTION_TYPES = [
  'ai_languageModel',
  'ai_tool',
  'ai_memory',
  'ai_outputParser',
  'ai_textSplitter',
  'ai_document',
  'ai_embedding',
  'ai_vectorStore',
];

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function loadCache(): NodeCache | null {
  if (!fs.existsSync(CACHE_FILE)) {
    return null;
  }
  try {
    const data = fs.readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveCache(cache: NodeCache): void {
  ensureCacheDir();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function createDefaultCache(): NodeCache {
  const cache: NodeCache = {
    version: '1.0.0',
    lastSync: new Date().toISOString(),
    nodes: {},
  };

  // Add core nodes with basic info
  for (const nodeType of CORE_NODES) {
    const parts = nodeType.split('.');
    const name = parts[parts.length - 1];
    const displayName = name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();

    cache.nodes[nodeType] = {
      nodeType,
      displayName,
      description: `${displayName} node`,
      category: nodeType.includes('langchain') ? 'ai' : 'core',
      package: nodeType.startsWith('nodes-langchain')
        ? '@n8n/n8n-nodes-langchain'
        : 'n8n-nodes-base',
      isAITool: nodeType.includes('langchain'),
      isTrigger: ['webhook', 'trigger'].some(t =>
        nodeType.toLowerCase().includes(t)
      ),
      lastUpdated: new Date().toISOString(),
    };
  }

  return cache;
}

function displayStats(cache: NodeCache): void {
  const nodeCount = Object.keys(cache.nodes).length;
  const aiNodes = Object.values(cache.nodes).filter(n => n.isAITool).length;
  const triggers = Object.values(cache.nodes).filter(n => n.isTrigger).length;

  console.log('='.repeat(50));
  console.log('n8n Node Cache Statistics');
  console.log('='.repeat(50));
  console.log(`Total nodes: ${nodeCount}`);
  console.log(`AI/Langchain nodes: ${aiNodes}`);
  console.log(`Trigger nodes: ${triggers}`);
  console.log(`Last sync: ${cache.lastSync}`);
  console.log('='.repeat(50));
}

function exportNodeList(cache: NodeCache): void {
  const outputFile = path.join(CACHE_DIR, 'node-list.md');

  let content = '# n8n Node Reference\n\n';
  content += `> Last updated: ${cache.lastSync}\n\n`;

  // Group by package
  const byPackage: Record<string, NodeInfo[]> = {};
  for (const node of Object.values(cache.nodes)) {
    if (!byPackage[node.package]) {
      byPackage[node.package] = [];
    }
    byPackage[node.package].push(node);
  }

  for (const [pkg, nodes] of Object.entries(byPackage)) {
    content += `## ${pkg}\n\n`;
    content += '| Node Type | Display Name | Category |\n';
    content += '|-----------|--------------|----------|\n';

    for (const node of nodes.sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    )) {
      content += `| \`${node.nodeType}\` | ${node.displayName} | ${node.category} |\n`;
    }
    content += '\n';
  }

  // Add AI connection types
  content += '## AI Connection Types\n\n';
  content += '| Connection Type | Purpose |\n';
  content += '|-----------------|--------|\n';
  const connectionDescriptions: Record<string, string> = {
    ai_languageModel: 'Connect LLM providers',
    ai_tool: 'Provide tools to agents',
    ai_memory: 'Store conversation history',
    ai_outputParser: 'Parse structured output',
    ai_textSplitter: 'Chunk documents',
    ai_document: 'Load documents',
    ai_embedding: 'Generate embeddings',
    ai_vectorStore: 'Store/retrieve vectors',
  };
  for (const connType of AI_CONNECTION_TYPES) {
    content += `| \`${connType}\` | ${connectionDescriptions[connType] || 'AI connection'} |\n`;
  }

  fs.writeFileSync(outputFile, content);
  console.log(`Node list exported to: ${outputFile}`);
}

async function main(): Promise<void> {
  console.log('n8n Node Sync');
  console.log('-'.repeat(50));

  // Load or create cache
  let cache = loadCache();

  if (!cache) {
    console.log('Creating new node cache...');
    cache = createDefaultCache();
    saveCache(cache);
    console.log('Cache created with core nodes.');
  } else {
    console.log('Loaded existing cache.');
  }

  // Display stats
  displayStats(cache);

  // Export node list
  exportNodeList(cache);

  console.log('\nTo sync with live n8n-mcp data, use Claude with:');
  console.log('  mcp__n8n-mcp__search_nodes({ query: "keyword" })');
  console.log('  mcp__n8n-mcp__get_node({ nodeType: "nodes-base.X" })');
}

main().catch(console.error);
