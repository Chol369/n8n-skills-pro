# Changelog

All notable changes to n8n-skills-pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Changed
- Removed 09-v2-migrations skill (n8n v2 is now stable, migrations no longer needed)
- Renamed 10-community-nodes to 09-community-nodes

---

## [0.2.0] - 2026-01-27

### Added
- All 9 skills fully documented and upgraded
- Comprehensive security guidance in community-nodes skill (January 2026 supply chain attack awareness)
- MCP integration documentation
- AI & LangChain nodes reference
- Vector store integrations for RAG applications
- Custom node development guide

### Skills Status - All Complete
- [x] 01-workflow-architect - **SKILL.md complete**
- [x] 02-workflow-patterns - **SKILL.md complete**
- [x] 03-node-configuration - **SKILL.md complete**
- [x] 04-mcp-tools-expert - **SKILL.md complete**
- [x] 05-code-javascript - **SKILL.md complete**
- [x] 06-code-python - **SKILL.md complete**
- [x] 07-expression-syntax - **SKILL.md complete**
- [x] 08-validation-expert - **SKILL.md complete**
- [x] 09-community-nodes - **SKILL.md complete**

### Removed
- 09-v2-migrations skill (n8n v2 is stable, no longer needed)

---

## [0.1.0] - 2025-12-27

### Added
- Project initialization
- Base directory structure
- Community fixes: Python external libraries workaround
- Core documentation (README, CONTRIBUTING, LICENSE)
- Initial skill files for key areas

### Community Fixes
- **Python External Libraries** - Enable pandas, numpy, requests via external task runners
  - docker-compose-example.yml
  - n8n-task-runners.json
  - Setup guide

---

## Planned

### [0.3.0] - Target: Week 4
- Add workflow templates (5-10)
- GitHub Actions for weekly sync
- Automated n8n version tracking

### [1.0.0] - Target: Month 2
- 20+ workflow templates
- Active community contributions
- Stable weekly update cycle
- Node documentation sync from npm

---

## n8n Version Compatibility

| n8n Version | Skills Version | Status |
|-------------|----------------|--------|
| 2.1.x | 0.2.0+ | Supported |
| 2.0.x | 0.1.0+ | Supported |
| 1.82.x | 0.1.0+ | Supported |
| 1.70+ | 0.1.0+ | Supported |
| < 1.70 | - | Not tested |

---

*This project syncs weekly with n8n releases. Check back for updates!*
