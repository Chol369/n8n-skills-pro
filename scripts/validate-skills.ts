#!/usr/bin/env npx ts-node
/**
 * Skill Validation Script
 *
 * Validates all n8n skills for consistency and accuracy.
 * Run with: npx ts-node scripts/validate-skills.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  skill: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface SkillMetadata {
  title: string;
  description: string;
  hasMCPTools: boolean;
  hasCodeExamples: boolean;
  hasRelatedSkills: boolean;
}

const SKILLS_DIR = path.join(__dirname, '..', '.claude', 'skills');

// Required sections for each skill
const REQUIRED_SECTIONS = [
  '## Overview',
  '---',
];

// Node type format patterns
const NODE_TYPE_PATTERNS = {
  searchFormat: /nodes-base\.\w+|nodes-langchain\.\w+/g,
  workflowFormat: /n8n-nodes-base\.\w+|@n8n\/n8n-nodes-langchain\.\w+/g,
};

// Known valid node types (subset for validation)
const VALID_NODE_PREFIXES = [
  'nodes-base.',
  'nodes-langchain.',
  'n8n-nodes-base.',
  '@n8n/n8n-nodes-langchain.',
];

function readSkillFile(skillPath: string): string {
  return fs.readFileSync(path.join(skillPath, 'SKILL.md'), 'utf-8');
}

function extractMetadata(content: string): SkillMetadata {
  const titleMatch = content.match(/^# (.+)$/m);
  const descMatch = content.match(/^> \*\*(.+)\*\*$/m);

  return {
    title: titleMatch ? titleMatch[1] : 'Unknown',
    description: descMatch ? descMatch[1] : 'No description',
    hasMCPTools: content.includes('search_nodes') ||
                 content.includes('get_node') ||
                 content.includes('validate_'),
    hasCodeExamples: content.includes('```'),
    hasRelatedSkills: content.includes('## Related Skills'),
  };
}

function validateSkill(skillDir: string): ValidationResult {
  const skillPath = path.join(SKILLS_DIR, skillDir);
  const result: ValidationResult = {
    skill: skillDir,
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check SKILL.md exists
  const skillFile = path.join(skillPath, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    result.errors.push('SKILL.md not found');
    result.valid = false;
    return result;
  }

  const content = readSkillFile(skillPath);
  const metadata = extractMetadata(content);

  // Validate required sections
  for (const section of REQUIRED_SECTIONS) {
    if (!content.includes(section)) {
      result.errors.push(`Missing required section: ${section}`);
      result.valid = false;
    }
  }

  // Validate title format
  if (!content.startsWith('# n8n ')) {
    result.warnings.push('Title should start with "# n8n "');
  }

  // Check for description blockquote
  if (!content.includes('> **')) {
    result.warnings.push('Missing description blockquote (> **...**)');
  }

  // Validate node type formats in code blocks
  // Check for incorrect usage: n8n-nodes-base.X used as nodeType argument in MCP tools
  // This regex catches: nodeType: "n8n-nodes-base.X" or nodeType: 'n8n-nodes-base.X'
  const incorrectNodeTypePattern = /nodeType:\s*["']n8n-nodes-base\./g;
  if (incorrectNodeTypePattern.test(content)) {
    result.errors.push('MCP tools (search_nodes, get_node) should use "nodes-base.X" format, not "n8n-nodes-base.X"');
    result.valid = false;
  }

  // Check for common mistakes
  if (content.includes('ai_retriever')) {
    result.errors.push('ai_retriever is not a valid connection type. Use ai_textSplitter instead.');
    result.valid = false;
  }

  // Validate code examples have proper syntax
  const jsBlocks = content.match(/```javascript[\s\S]*?```/g) || [];
  for (const block of jsBlocks) {
    if (block.includes('return [') && !block.includes("'json'") && !block.includes('"json"')) {
      result.warnings.push('JavaScript return may be missing json wrapper');
    }
  }

  // Check for broken links
  const internalLinks = content.match(/\[.*?\]\((?!http).*?\)/g) || [];
  for (const link of internalLinks) {
    const pathMatch = link.match(/\]\(([^)]+)\)/);
    if (pathMatch && pathMatch[1].startsWith('/')) {
      result.warnings.push(`Absolute path in link: ${link}`);
    }
  }

  // Validation summary
  if (!metadata.hasCodeExamples) {
    result.warnings.push('No code examples found');
  }

  return result;
}

function validateAllSkills(): void {
  console.log('='.repeat(60));
  console.log('n8n Skills Validation Report');
  console.log('='.repeat(60));
  console.log();

  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`Skills directory not found: ${SKILLS_DIR}`);
    process.exit(1);
  }

  const skills = fs.readdirSync(SKILLS_DIR)
    .filter(d => fs.statSync(path.join(SKILLS_DIR, d)).isDirectory())
    .sort();

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const skill of skills) {
    const result = validateSkill(skill);

    const status = result.valid ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`[${status}] ${skill}`);

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        console.log(`  \x1b[31m  ERROR: ${error}\x1b[0m`);
        totalErrors++;
      }
    }

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.log(`  \x1b[33m  WARN: ${warning}\x1b[0m`);
        totalWarnings++;
      }
    }
  }

  console.log();
  console.log('='.repeat(60));
  console.log(`Summary: ${skills.length} skills validated`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Warnings: ${totalWarnings}`);
  console.log('='.repeat(60));

  if (totalErrors > 0) {
    process.exit(1);
  }
}

// Run validation
validateAllSkills();
