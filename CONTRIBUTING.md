# Contributing to n8n-skills-pro

Thank you for your interest in contributing! This project thrives on community input.

---

## Ways to Contribute

### 1. Report a Community Fix

Found a workaround for an n8n issue? Share it!

**How to submit:**
1. Open an issue with `[FIX]` prefix
2. Use the Community Fix template
3. Include:
   - Problem description
   - Your workaround (step-by-step)
   - n8n version tested
   - Self-hosted or Cloud
   - Screenshots/code if applicable

**Example:**
```markdown
Title: [FIX] Execute Sub-Workflow "out of date" error in v2.0

Problem: Imported workflows show "out of date" on Execute Sub-Workflow nodes

Workaround:
1. Delete the Execute Sub-Workflow node
2. Add a new one from the node panel
3. Reconfigure the target workflow

n8n Version: 2.0.3
Environment: Self-hosted Docker
```

---

### 2. Add a Workflow Template

Share production-ready workflow examples.

**Requirements:**
- Tested and working
- Includes README with:
  - Use case description
  - Required credentials
  - Customization points
  - Example input/output
- No hardcoded secrets
- Valid JSON format

**How to submit:**
1. Fork the repository
2. Add workflow to `templates/<category>/`
3. Include README.md in the same folder
4. Submit PR

**Template categories:**
- `webhook-processing/` - HTTP triggers
- `ai-agents/` - AI/LLM workflows
- `data-sync/` - ETL, sync operations
- `scheduled-tasks/` - Cron-based automation

---

### 3. Update Skill Content

Keep skills current with n8n releases.

**How to submit:**
1. Fork the repository
2. Edit files in `.claude/skills/<skill-name>/`
3. Add changelog entry
4. Test with Claude Code
5. Submit PR with test results

**Skill file structure:**
```
.claude/skills/06-code-python/
├── SKILL.md              # Main skill file (loaded first)
├── data-access-patterns.md
├── external-libraries.md
└── README.md             # Skill overview
```

**Guidelines:**
- Keep examples tested and working
- Reference specific n8n versions
- Include common error solutions
- Use clear, concise language

---

### 4. Report Bugs

Found incorrect information? Let us know!

**How to report:**
1. Open an issue with `[BUG]` prefix
2. Include:
   - Skill affected
   - Incorrect information
   - Correct information (if known)
   - n8n version

---

### 5. Request Features

Have ideas for new skills or content?

**How to request:**
1. Open an issue with `[FEATURE]` prefix
2. Describe:
   - What you need
   - Use case
   - Expected benefit

---

## Development Setup

### Prerequisites

- Node.js 18+
- Git
- Claude Code (for testing)

### Local Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/n8n-skills-pro.git
cd n8n-skills-pro

# Install dependencies
npm install

# Run validation
npm run validate
```

### Testing Skills

1. Copy skills to Claude Code:
   ```bash
   cp -r .claude ~/.claude/
   ```

2. Restart Claude Code

3. Test with prompts:
   ```
   "What's the correct way to access webhook data in n8n expressions?"
   "How do I use pandas in an n8n Python Code node?"
   ```

---

## Code Style

### Markdown Files

- Use clear headings (##, ###)
- Include code examples with language tags
- Use tables for comparisons
- Keep lines under 100 characters
- Add blank lines between sections

### JSON Files

- Use 2-space indentation
- Include comments explaining complex parts
- Validate before committing

### Skill Files

- Start with SKILL.md as main entry
- Use descriptive file names
- Include "When to use" and "Examples" sections
- Reference n8n versions for compatibility

---

## Pull Request Process

### Before Submitting

1. **Test your changes** with Claude Code
2. **Validate JSON files** are properly formatted
3. **Update CHANGELOG.md** with your changes
4. **Check for typos** and formatting issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Community fix
- [ ] New template
- [ ] Skill update
- [ ] Documentation improvement
- [ ] Bug fix

## Testing
How did you test these changes?

## n8n Version
Which n8n version(s) were tested?

## Checklist
- [ ] Tested with Claude Code
- [ ] Updated CHANGELOG.md
- [ ] No hardcoded secrets
- [ ] Valid JSON/Markdown format
```

### Review Process

1. Maintainer reviews within 48 hours
2. Feedback provided if changes needed
3. Once approved, merged to main
4. Included in next release

---

## Commit Messages

Use conventional commit format:

```
type(scope): description

Examples:
feat(python): add scikit-learn examples
fix(expressions): correct webhook body access
docs(readme): update installation steps
chore(deps): update n8n version references
```

**Types:**
- `feat` - New feature/content
- `fix` - Bug fix or correction
- `docs` - Documentation only
- `chore` - Maintenance tasks

---

## Recognition

Contributors are recognized in:
- README.md acknowledgments
- Release notes
- Community fix credits

---

## Code of Conduct

- Be respectful and constructive
- Help others learn
- Give credit where due
- Focus on improving the project

---

## Questions?

- Open a Discussion on GitHub
- Tag maintainer in issues if urgent

---

Thank you for contributing to n8n-skills-pro!
