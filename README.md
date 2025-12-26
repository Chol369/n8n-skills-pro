# n8n-skills-pro

**The most comprehensive, actively maintained n8n skills for AI assistants.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n](https://img.shields.io/badge/n8n-v2.0+-orange)](https://n8n.io)
[![Claude Code](https://img.shields.io/badge/Claude-Code-blue)](https://claude.ai/claude-code)
[![Updates](https://img.shields.io/badge/Updates-Weekly-green)](https://github.com/Chol369/n8n-skills-pro/releases)

---

## Why n8n-skills-pro?

Existing n8n skills projects have great content but suffer from:
- **Infrequent updates** - n8n releases almost daily, skills fall behind
- **Outdated information** - "Python has no external libraries" is no longer true
- **Scattered knowledge** - Best practices spread across multiple repos
- **Missing community fixes** - Workarounds discovered but not documented

**n8n-skills-pro solves this** by consolidating the best skills, adding community fixes, and maintaining weekly updates synced with n8n releases.

---

## Features

### 10 Specialized Skills

| # | Skill | Purpose |
|---|-------|---------|
| 01 | **workflow-architect** | Strategic planning, n8n vs Python decisions |
| 02 | **workflow-patterns** | 5+ proven architectural patterns |
| 03 | **node-configuration** | 545+ nodes, operation-aware setup |
| 04 | **mcp-tools-expert** | Master n8n-mcp MCP server tools |
| 05 | **code-javascript** | JS patterns, $helpers, DateTime |
| 06 | **code-python** | Python WITH external libraries |
| 07 | **expression-syntax** | Expression debugging mastery |
| 08 | **validation-expert** | Error interpretation & fixes |
| 09 | **v2-migrations** | n8n v2.0+ breaking changes |
| 10 | **community-nodes** | Popular community packages |

### Community Fixes

Real-world solutions not found in official docs:

- **Python External Libraries** - Use pandas, numpy, requests in Code nodes
- **Execute Sub-Workflow Fix** - v2.0 "out of date" error solution
- **Wait Node Patterns** - Human-in-the-loop workflows
- **Self-hosted Tips** - AWS, Docker-specific guides

### Automated Updates

- Weekly sync with n8n npm releases
- Automated changelog generation
- Breaking change detection
- New node documentation

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Chol369/n8n-skills-pro.git

# Copy skills to Claude Code
cp -r n8n-skills-pro/.claude ~/.claude/
```

### Verify Installation

Ask Claude Code:
```
"What n8n workflow pattern should I use for a Stripe webhook?"
```

If Claude responds with detailed webhook processing patterns, the skills are loaded.

---

## Directory Structure

```
n8n-skills-pro/
├── .claude/
│   └── skills/
│       ├── 01-workflow-architect/
│       ├── 02-workflow-patterns/
│       ├── 03-node-configuration/
│       ├── 04-mcp-tools-expert/
│       ├── 05-code-javascript/
│       ├── 06-code-python/
│       ├── 07-expression-syntax/
│       ├── 08-validation-expert/
│       ├── 09-v2-migrations/
│       └── 10-community-nodes/
├── templates/           # Production-ready workflow JSONs
├── changelog/           # n8n version tracking
├── community-fixes/     # Workarounds & solutions
├── scripts/            # Automation scripts
└── docs/               # Additional documentation
```

---

## Unique Content

### Python External Libraries

Unlike other skills that say "Python has no external libraries", we document the **working solution**:

```yaml
# Enable in docker-compose.yml
n8n-runner:
  image: n8nio/runners:latest
  environment:
    - N8N_RUNNERS_EXTERNAL_ALLOW=*
```

Now use pandas, numpy, requests:

```python
import pandas as pd
import requests

data = requests.get('https://api.example.com/data').json()
df = pd.DataFrame(data)
df['processed'] = df['value'] * 2

return [{'json': row} for row in df.to_dict('records')]
```

See [community-fixes/python-external-libs](./community-fixes/python-external-libs/) for complete setup.

---

## Comparison with Other Projects

| Feature | czlonkowski | haunchen | promptadvisers | **n8n-skills-pro** |
|---------|-------------|----------|----------------|-------------------|
| Skills Count | 7 | 1 | 8 | **10** |
| Update Frequency | Sporadic | Sporadic | Sporadic | **Weekly** |
| Python External Libs | No | No | No | **Yes** |
| Community Fixes | No | No | No | **Yes** |
| v2.0 Migration Guide | Partial | No | No | **Complete** |
| Automated Updates | No | No | No | **Yes** |
| Self-hosted Guides | Limited | Limited | Limited | **Comprehensive** |

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- **Report a fix** - Share workarounds you've discovered
- **Add templates** - Production workflow examples
- **Update docs** - Keep skills current with n8n releases
- **Improve skills** - Enhance existing skill content

---

## Acknowledgments

This project consolidates and builds upon:

- [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) - Original skill structure
- [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) - MCP server architecture
- [haunchen/n8n-skills](https://github.com/haunchen/n8n-skills) - Node documentation approach
- [promptadvisers/n8n-powerhouse](https://github.com/promptadvisers/n8n-powerhouse) - Production patterns
- [splinesreticulating/n8n-v2-workflow-skill](https://github.com/splinesreticulating/n8n-v2-workflow-skill) - v2.0 migration guides

---

## License

MIT License - See [LICENSE](./LICENSE)

---

## Author

**Atak Chol** ([@Chol369](https://github.com/Chol369))

Building AI + n8n automation solutions for businesses.

---

## Star History

If this project helps you, please star it!

---

*Maintained with weekly updates synced to n8n releases*
