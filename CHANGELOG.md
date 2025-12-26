# Changelog

All notable changes to n8n-skills-pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- Initial project structure with 10 skill directories
- Python external libraries workaround documentation
- Complete docker-compose setup for external task runners
- Expression syntax skill with common mistakes
- MCP tools expert skill
- v2.0 migration guide
- MIT License
- Contributing guidelines

### Skills Status
- [x] 01-workflow-architect - Structure created
- [x] 02-workflow-patterns - Structure created
- [x] 03-node-configuration - Structure created
- [x] 04-mcp-tools-expert - **SKILL.md complete**
- [x] 05-code-javascript - Structure created
- [x] 06-code-python - **SKILL.md complete**
- [x] 07-expression-syntax - **SKILL.md complete**
- [x] 08-validation-expert - Structure created
- [x] 09-v2-migrations - **SKILL.md complete**
- [x] 10-community-nodes - Structure created

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

### [0.2.0] - Target: Week 2
- Complete all 10 SKILL.md files
- Add workflow templates (5-10)
- GitHub Actions for weekly sync

### [0.3.0] - Target: Week 4
- Automated n8n version tracking
- Node documentation sync from npm
- Community contribution workflow

### [1.0.0] - Target: Month 2
- All skills fully documented
- 20+ workflow templates
- Active community contributions
- Stable weekly update cycle

---

## n8n Version Compatibility

| n8n Version | Skills Version | Status |
|-------------|----------------|--------|
| 2.0.x | 0.1.0+ | Supported |
| 1.82.x | 0.1.0+ | Supported |
| 1.70+ | 0.1.0+ | Supported |
| < 1.70 | - | Not tested |

---

*This project syncs weekly with n8n releases. Check back for updates!*
