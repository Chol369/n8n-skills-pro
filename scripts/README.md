# n8n Skills Pro - Scripts

Automation scripts for maintaining and validating the n8n skills repository.

## Setup

```bash
cd scripts
npm install
```

## Available Scripts

### validate-skills.ts

Validates all skill files for consistency and accuracy.

```bash
npx ts-node validate-skills.ts
```

**Checks performed:**
- Required sections present (Overview, dividers)
- Title format (`# n8n ...`)
- Description blockquote format
- Node type format consistency (search vs workflow formats)
- Invalid AI connection types (e.g., `ai_retriever`)
- JavaScript code syntax hints
- Broken internal links

**Exit codes:**
- `0` - All validations passed
- `1` - One or more errors found

### sync-n8n-nodes.ts

Syncs and caches n8n node information for offline validation.

```bash
npx ts-node sync-n8n-nodes.ts
```

**Features:**
- Creates/updates `.cache/n8n-nodes.json` with node metadata
- Exports `.cache/node-list.md` with formatted node reference
- Includes core nodes and AI/Langchain nodes
- Documents AI connection types

### build-skill-pack.ts

Builds distributable skill packs for different platforms.

```bash
# Basic build
npx ts-node build-skill-pack.ts

# With zip archive
npx ts-node build-skill-pack.ts --zip

# Custom output directory
npx ts-node build-skill-pack.ts --output ./my-pack

# Skip validation
npx ts-node build-skill-pack.ts --no-validate
```

**Generated files:**
- `skill-pack/n8n-skills-complete.md` - Single file with all skills
- `skill-pack/n8n-skills-quick-reference.md` - Quick reference for Claude Desktop
- `skill-pack/individual/` - Individual skill files
- `skill-pack/manifest.json` - Build manifest with checksums

**Usage by platform:**
| Platform | File to Use |
|----------|-------------|
| Claude Code CLI | Copy `individual/` to `.claude/skills/` |
| Claude.ai | Upload `n8n-skills-complete.md` to project |
| Claude Desktop | Use `n8n-skills-quick-reference.md` |

## GitHub Actions Integration

These scripts are used in CI/CD workflows:

- `.github/workflows/validate.yml` - Runs `validate-skills.ts` on PRs
- `.github/workflows/sync.yml` - Periodically syncs node information

## Adding New Validations

To add new validation rules, edit `validate-skills.ts`:

```typescript
// In validateSkill function
if (content.includes('bad_pattern')) {
  result.errors.push('Description of the error');
  result.valid = false;
}
```

## Node Type Format Reference

| Context | Format | Example |
|---------|--------|---------|
| MCP Tools (search_nodes, get_node) | `nodes-base.X` | `nodes-base.slack` |
| Workflow JSON | `n8n-nodes-base.X` | `n8n-nodes-base.slack` |
| AI/Langchain (MCP) | `nodes-langchain.X` | `nodes-langchain.agent` |
| AI/Langchain (JSON) | `@n8n/n8n-nodes-langchain.X` | `@n8n/n8n-nodes-langchain.agent` |
