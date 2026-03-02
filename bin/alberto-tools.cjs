#!/usr/bin/env node

/**
 * Alberto Skills Tools — CLI utility for skill management
 *
 * Zero-dependency Node.js CJS tool following GSD patterns.
 * Manages the full lifecycle of Claude Code skills: create, validate, backup, distribute.
 *
 * Usage: node alberto-tools.cjs <command> [args] [--raw]
 *
 * Commands:
 *   version                              Show version
 *   init                                 Initialize directory structure
 *   template list                        List available templates
 *   template show <name>                 Show template content
 *   skill create <name> [options]        Create skill from template
 *     --type <type>                      Template type (simple-command|multi-step|orchestrator|api-integration)
 *     --template <name>                  Template name (or domain: web-dev|devops|data-science|testing|documentation)
 *     --description <desc>               Skill description
 *   skill list                           List all registered skills
 *   skill view <name>                    View skill details
 *   skill rename <old> <new>             Rename a skill
 *   skill delete <name>                  Delete skill (with auto-backup)
 *   validate skill <name>                Validate skill structure and quality
 *   backup create [name]                 Create ZIP backup
 *   backup list                          List available backups
 *   backup restore <file>                Restore from backup
 *   publish <name>                       Package skill as .skill file
 *   install <file>                       Install .skill package
 *   registry show                        Show full registry
 *   registry stats                       Show registry statistics
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ─── Constants ───────────────────────────────────────────────────────────────

const ALBERTO_HOME = path.join(require('os').homedir(), '.claude', 'alberto-skills');
const WORKSPACE = path.join(ALBERTO_HOME, 'workspace');
const TEMPLATES_DIR = path.join(ALBERTO_HOME, 'templates');
const BACKUPS_DIR = path.join(ALBERTO_HOME, 'backups');
const EXPORTS_DIR = path.join(ALBERTO_HOME, 'exports');
const REGISTRY_PATH = path.join(ALBERTO_HOME, 'registry.json');
const VERSION_PATH = path.join(ALBERTO_HOME, 'VERSION');
const COMMANDS_DIR = path.join(require('os').homedir(), '.claude', 'commands', 'alberto_skills');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function output(result, raw, rawValue) {
  if (raw && rawValue !== undefined) {
    process.stdout.write(String(rawValue));
  } else {
    const json = JSON.stringify(result, null, 2);
    if (json.length > 50000) {
      const tmpPath = path.join(require('os').tmpdir(), `alberto-${Date.now()}.json`);
      fs.writeFileSync(tmpPath, json, 'utf-8');
      process.stdout.write('@file:' + tmpPath);
    } else {
      process.stdout.write(json);
    }
  }
}

function error(message) {
  output({ ok: false, error: message });
  process.exit(1);
}

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function safeReadJSON(filePath) {
  const content = safeReadFile(filePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Safe shell execution helper using execFileSync to prevent injection.
 * For commands needing shell features (pipes, cd &&), we use explicit shell invocation
 * with hardcoded commands — no user input is interpolated into shell strings.
 */
function safeExec(cmd, args, opts) {
  return execFileSync(cmd, args, { stdio: 'pipe', ...opts });
}

// ─── Registry Operations ─────────────────────────────────────────────────────

function loadRegistry() {
  const reg = safeReadJSON(REGISTRY_PATH);
  if (!reg) {
    error(`Registry not found at ${REGISTRY_PATH}. Run 'init' first.`);
  }
  return reg;
}

function saveRegistry(reg) {
  writeJSON(REGISTRY_PATH, reg);
}

function registryAddSkill(reg, name, meta) {
  reg.skills[name] = {
    name,
    description: meta.description || '',
    type: meta.type || 'custom',
    template: meta.template || 'none',
    created: dateStamp(),
    modified: dateStamp(),
    path: path.join(WORKSPACE, name),
    validated: false,
    score: null,
    tags: meta.tags || [],
  };
  reg.stats.total_created++;
  saveRegistry(reg);
}

function registryRemoveSkill(reg, name) {
  delete reg.skills[name];
  reg.stats.total_deleted++;
  saveRegistry(reg);
}

// ─── Template Operations ─────────────────────────────────────────────────────

function getTemplatePaths() {
  const templates = {};
  const byType = path.join(TEMPLATES_DIR, 'by-type');
  const byDomain = path.join(TEMPLATES_DIR, 'by-domain');

  if (fs.existsSync(byType)) {
    for (const f of fs.readdirSync(byType)) {
      if (f.endsWith('.md')) {
        const name = f.replace('.md', '');
        templates[name] = { path: path.join(byType, f), category: 'type' };
      }
    }
  }

  if (fs.existsSync(byDomain)) {
    for (const f of fs.readdirSync(byDomain)) {
      if (f.endsWith('.md')) {
        const name = f.replace('.md', '');
        templates[name] = { path: path.join(byDomain, f), category: 'domain' };
      }
    }
  }

  return templates;
}

function resolveTemplate(typeName, templateName) {
  const templates = getTemplatePaths();

  // Direct template name match
  if (templateName && templates[templateName]) {
    return templates[templateName];
  }

  // Type-based fallback
  if (typeName && templates[typeName]) {
    return templates[typeName];
  }

  // Map shorthand types
  const typeMap = {
    'command': 'simple-command',
    'simple': 'simple-command',
    'workflow': 'multi-step-workflow',
    'multi-step': 'multi-step-workflow',
    'orchestrator': 'orchestrator',
    'api': 'api-integration',
  };

  const mapped = typeMap[typeName];
  if (mapped && templates[mapped]) {
    return templates[mapped];
  }

  return null;
}

function fillTemplate(content, vars) {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(value || '');
  }
  return result;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateSkill(name) {
  const skillDir = path.join(WORKSPACE, name);
  const issues = [];
  let score = 100;

  // Check directory exists
  if (!fs.existsSync(skillDir)) {
    return { ok: false, name, score: 0, issues: [`Skill directory not found: ${skillDir}`] };
  }

  // Find .md files
  const files = fs.readdirSync(skillDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    issues.push('No .md files found in skill directory');
    score -= 40;
  }

  // Check each .md file
  for (const file of files) {
    const content = safeReadFile(path.join(skillDir, file));
    if (!content) continue;

    // Check frontmatter
    if (!content.startsWith('---')) {
      issues.push(`${file}: Missing YAML frontmatter`);
      score -= 15;
    } else {
      const fmEnd = content.indexOf('---', 3);
      if (fmEnd === -1) {
        issues.push(`${file}: Unclosed frontmatter`);
        score -= 15;
      } else {
        const fm = content.slice(3, fmEnd).trim();

        // Check required frontmatter fields
        if (!fm.includes('description:')) {
          issues.push(`${file}: Missing 'description' in frontmatter`);
          score -= 10;
        }

        // Check description quality
        const descMatch = fm.match(/description:\s*(.+)/);
        if (descMatch) {
          const desc = descMatch[1].trim().replace(/^["']|["']$/g, '');
          if (desc.length < 10) {
            issues.push(`${file}: Description too short (${desc.length} chars, min 10)`);
            score -= 5;
          }
          if (desc.length > 200) {
            issues.push(`${file}: Description too long (${desc.length} chars, max 200)`);
            score -= 3;
          }
        }
      }
    }

    // Check content quality
    const bodyStart = content.indexOf('---', 3);
    const body = bodyStart !== -1 ? content.slice(bodyStart + 3).trim() : content;

    if (body.length < 50) {
      issues.push(`${file}: Body content too short (${body.length} chars)`);
      score -= 10;
    }

    // Check for leftover placeholders
    const placeholders = body.match(/\{\{[^}]+\}\}/g);
    if (placeholders) {
      issues.push(`${file}: Unfilled placeholders: ${placeholders.join(', ')}`);
      score -= 5 * placeholders.length;
    }

    // Check for TODO markers
    const todos = body.match(/TODO/gi);
    if (todos) {
      issues.push(`${file}: Contains ${todos.length} TODO marker(s)`);
      score -= 3 * todos.length;
    }
  }

  // Check registry entry
  const reg = loadRegistry();
  if (!reg.skills[name]) {
    issues.push('Skill not registered in registry.json');
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));

  // Update registry with validation result
  if (reg.skills[name]) {
    reg.skills[name].validated = true;
    reg.skills[name].score = score;
    reg.skills[name].modified = dateStamp();
    saveRegistry(reg);
  }

  return {
    ok: issues.length === 0,
    name,
    score,
    grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F',
    issues,
    files: files.length,
  };
}

// ─── Backup/Restore ──────────────────────────────────────────────────────────

function createBackup(label) {
  ensureDir(BACKUPS_DIR);
  const ts = timestamp();
  const backupName = label ? `${generateSlug(label)}-${ts}` : `backup-${ts}`;
  const zipPath = path.join(BACKUPS_DIR, `${backupName}.zip`);

  try {
    safeExec('zip', ['-r', zipPath, 'workspace', 'registry.json', 'VERSION', '-x', '*/node_modules/*'], {
      cwd: ALBERTO_HOME,
    });
  } catch {
    // Fallback: tar if zip not available
    const tarPath = zipPath.replace('.zip', '.tar.gz');
    safeExec('tar', ['-czf', tarPath, 'workspace', 'registry.json', 'VERSION'], {
      cwd: ALBERTO_HOME,
    });
    const reg = loadRegistry();
    reg.stats.total_backups++;
    saveRegistry(reg);
    return { ok: true, path: tarPath, name: backupName, format: 'tar.gz' };
  }

  const reg = loadRegistry();
  reg.stats.total_backups++;
  saveRegistry(reg);

  return { ok: true, path: zipPath, name: backupName, format: 'zip' };
}

function listBackups() {
  ensureDir(BACKUPS_DIR);
  const files = fs.readdirSync(BACKUPS_DIR)
    .filter(f => f.endsWith('.zip') || f.endsWith('.tar.gz'))
    .map(f => {
      const stat = fs.statSync(path.join(BACKUPS_DIR, f));
      return {
        name: f,
        size: stat.size,
        sizeHuman: stat.size > 1024 * 1024
          ? `${(stat.size / (1024 * 1024)).toFixed(1)}MB`
          : `${(stat.size / 1024).toFixed(1)}KB`,
        created: stat.mtime.toISOString().slice(0, 19),
      };
    })
    .sort((a, b) => b.created.localeCompare(a.created));

  return { ok: true, backups: files, count: files.length };
}

function restoreBackup(fileName) {
  const filePath = path.join(BACKUPS_DIR, fileName);
  if (!fs.existsSync(filePath) && !fs.existsSync(fileName)) {
    error(`Backup not found: ${fileName}`);
  }
  const source = fs.existsSync(filePath) ? filePath : fileName;

  // Create pre-restore backup
  const preRestore = createBackup('pre-restore');

  if (source.endsWith('.zip')) {
    safeExec('unzip', ['-o', source], { cwd: ALBERTO_HOME });
  } else {
    safeExec('tar', ['-xzf', source], { cwd: ALBERTO_HOME });
  }

  return { ok: true, restored: source, preRestoreBackup: preRestore.path };
}

// ─── Publish/Install (.skill packages) ───────────────────────────────────────

function publishSkill(name) {
  const skillDir = path.join(WORKSPACE, name);
  if (!fs.existsSync(skillDir)) {
    error(`Skill not found: ${name}`);
  }

  ensureDir(EXPORTS_DIR);
  const reg = loadRegistry();
  const skillMeta = reg.skills[name];

  // Create manifest
  const manifest = {
    format: 'alberto-skill',
    version: '1.0',
    name,
    description: skillMeta ? skillMeta.description : '',
    type: skillMeta ? skillMeta.type : 'custom',
    created: dateStamp(),
    files: fs.readdirSync(skillDir),
  };

  // Write manifest to skill dir temporarily
  const manifestPath = path.join(skillDir, 'manifest.json');
  writeJSON(manifestPath, manifest);

  const exportPath = path.join(EXPORTS_DIR, `${name}.skill`);

  try {
    safeExec('tar', ['-czf', exportPath, `${name}/`], { cwd: WORKSPACE });
  } catch {
    try { fs.unlinkSync(manifestPath); } catch {}
    error('Failed to create .skill package');
  }

  // Cleanup manifest
  try { fs.unlinkSync(manifestPath); } catch {}

  return {
    ok: true,
    path: exportPath,
    name,
    manifest,
    sizeHuman: `${(fs.statSync(exportPath).size / 1024).toFixed(1)}KB`,
  };
}

function installSkill(filePath) {
  if (!fs.existsSync(filePath)) {
    error(`File not found: ${filePath}`);
  }

  // Extract to temp dir first
  const tmpDir = path.join(require('os').tmpdir(), `alberto-install-${Date.now()}`);
  ensureDir(tmpDir);

  try {
    safeExec('tar', ['-xzf', filePath, '-C', tmpDir]);
  } catch {
    error('Failed to extract .skill package');
  }

  // Find the skill directory inside
  const entries = fs.readdirSync(tmpDir);
  if (entries.length === 0) {
    error('Empty .skill package');
  }

  const skillName = entries[0];
  const sourceDir = path.join(tmpDir, skillName);
  const targetDir = path.join(WORKSPACE, skillName);

  // Check for conflicts
  if (fs.existsSync(targetDir)) {
    error(`Skill '${skillName}' already exists. Delete or rename it first.`);
  }

  // Read manifest if exists
  const manifestPath = path.join(sourceDir, 'manifest.json');
  const manifest = safeReadJSON(manifestPath);

  // Copy to workspace using cp
  safeExec('cp', ['-r', sourceDir, targetDir]);

  // Remove manifest from installed copy
  const installedManifest = path.join(targetDir, 'manifest.json');
  try { fs.unlinkSync(installedManifest); } catch {}

  // Register
  const reg = loadRegistry();
  registryAddSkill(reg, skillName, {
    description: manifest ? manifest.description : '',
    type: manifest ? manifest.type : 'custom',
    template: 'imported',
    tags: ['imported'],
  });

  // Cleanup temp
  safeExec('rm', ['-rf', tmpDir]);

  return { ok: true, name: skillName, manifest };
}

// ─── Skill CRUD ──────────────────────────────────────────────────────────────

function createSkill(name, opts) {
  const slug = generateSlug(name);
  const skillDir = path.join(WORKSPACE, slug);

  if (fs.existsSync(skillDir)) {
    error(`Skill '${slug}' already exists at ${skillDir}`);
  }

  const reg = loadRegistry();
  if (reg.skills[slug]) {
    error(`Skill '${slug}' already registered`);
  }

  // Resolve template
  const template = resolveTemplate(opts.type, opts.template);
  let content;

  if (template) {
    const raw = safeReadFile(template.path);
    if (raw) {
      content = fillTemplate(raw, {
        SKILL_NAME: slug,
        SKILL_DISPLAY_NAME: name,
        DESCRIPTION: opts.description || `Skill: ${name}`,
        DATE: dateStamp(),
        AUTHOR: 'alberto-skills',
      });
    }
  }

  // Fallback: minimal skill template
  if (!content) {
    content = `---
description: "${opts.description || `Skill: ${name}`}"
---

# ${name}

<objective>
${opts.description || 'Define the objective of this skill.'}
</objective>

<process>
1. Analyze the user's request
2. Execute the appropriate actions
3. Report results
</process>
`;
  }

  // Create skill directory and file
  ensureDir(skillDir);
  fs.writeFileSync(path.join(skillDir, `${slug}.md`), content, 'utf-8');

  // Register
  const resolvedTemplate = template ? path.basename(template.path, '.md') : 'none';
  registryAddSkill(reg, slug, {
    description: opts.description || '',
    type: opts.type || 'custom',
    template: opts.template || resolvedTemplate,
    tags: opts.tags ? opts.tags.split(',') : [],
  });

  return {
    ok: true,
    name: slug,
    path: skillDir,
    file: path.join(skillDir, `${slug}.md`),
    template: template ? path.basename(template.path) : 'default',
  };
}

function listSkills() {
  const reg = loadRegistry();
  const skills = Object.values(reg.skills).map(s => ({
    name: s.name,
    description: s.description,
    type: s.type,
    created: s.created,
    validated: s.validated,
    score: s.score,
  }));

  return {
    ok: true,
    skills,
    count: skills.length,
  };
}

function viewSkill(name) {
  const reg = loadRegistry();
  const skill = reg.skills[name];
  if (!skill) {
    error(`Skill '${name}' not found in registry`);
  }

  const skillDir = path.join(WORKSPACE, name);
  const exists = fs.existsSync(skillDir);
  let files = [];
  let content = null;

  if (exists) {
    files = fs.readdirSync(skillDir);
    // Read main file
    const mainFile = files.find(f => f === `${name}.md`) || files.find(f => f.endsWith('.md'));
    if (mainFile) {
      content = safeReadFile(path.join(skillDir, mainFile));
    }
  }

  return {
    ok: true,
    ...skill,
    exists,
    files,
    content,
  };
}

function renameSkill(oldName, newName) {
  const reg = loadRegistry();
  if (!reg.skills[oldName]) {
    error(`Skill '${oldName}' not found`);
  }

  const newSlug = generateSlug(newName);
  if (reg.skills[newSlug]) {
    error(`Skill '${newSlug}' already exists`);
  }

  const oldDir = path.join(WORKSPACE, oldName);
  const newDir = path.join(WORKSPACE, newSlug);

  if (fs.existsSync(oldDir)) {
    fs.renameSync(oldDir, newDir);

    // Rename main .md file if it matches old name
    const oldFile = path.join(newDir, `${oldName}.md`);
    const newFile = path.join(newDir, `${newSlug}.md`);
    if (fs.existsSync(oldFile)) {
      fs.renameSync(oldFile, newFile);
    }
  }

  // Update registry
  const meta = { ...reg.skills[oldName] };
  meta.name = newSlug;
  meta.modified = dateStamp();
  meta.path = newDir;
  delete reg.skills[oldName];
  reg.skills[newSlug] = meta;
  saveRegistry(reg);

  return { ok: true, oldName, newName: newSlug, path: newDir };
}

function deleteSkill(name) {
  const reg = loadRegistry();
  if (!reg.skills[name]) {
    error(`Skill '${name}' not found`);
  }

  const skillDir = path.join(WORKSPACE, name);

  // Auto-backup before delete
  let backupPath = null;
  if (fs.existsSync(skillDir)) {
    ensureDir(BACKUPS_DIR);
    const backupName = `deleted-${name}-${timestamp()}`;
    const zipPath = path.join(BACKUPS_DIR, `${backupName}.zip`);
    try {
      safeExec('zip', ['-r', zipPath, `${name}/`], { cwd: WORKSPACE });
      backupPath = zipPath;
    } catch {
      const tarPath = zipPath.replace('.zip', '.tar.gz');
      try {
        safeExec('tar', ['-czf', tarPath, `${name}/`], { cwd: WORKSPACE });
        backupPath = tarPath;
      } catch {}
    }

    // Remove directory using fs
    fs.rmSync(skillDir, { recursive: true, force: true });
  }

  // Remove from registry
  registryRemoveSkill(reg, name);

  return { ok: true, name, backup: backupPath };
}

// ─── Init ────────────────────────────────────────────────────────────────────

function initSystem() {
  const dirs = [
    ALBERTO_HOME,
    path.join(ALBERTO_HOME, 'bin'),
    path.join(TEMPLATES_DIR, 'by-type'),
    path.join(TEMPLATES_DIR, 'by-domain'),
    WORKSPACE,
    BACKUPS_DIR,
    EXPORTS_DIR,
    COMMANDS_DIR,
  ];

  const created = [];
  for (const d of dirs) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
      created.push(d);
    }
  }

  // Ensure registry exists
  if (!fs.existsSync(REGISTRY_PATH)) {
    writeJSON(REGISTRY_PATH, {
      version: '1.0.0',
      created: dateStamp(),
      skills: {},
      stats: { total_created: 0, total_deleted: 0, total_backups: 0 },
    });
    created.push(REGISTRY_PATH);
  }

  // Ensure VERSION exists
  if (!fs.existsSync(VERSION_PATH)) {
    fs.writeFileSync(VERSION_PATH, '1.0.0\n', 'utf-8');
    created.push(VERSION_PATH);
  }

  // Count templates
  const templates = getTemplatePaths();

  return {
    ok: true,
    home: ALBERTO_HOME,
    directoriesCreated: created.length,
    directories: created,
    templatesAvailable: Object.keys(templates).length,
    registrySkills: Object.keys(loadRegistry().skills).length,
  };
}

// ─── Version ─────────────────────────────────────────────────────────────────

function getVersion() {
  const ver = safeReadFile(VERSION_PATH);
  return {
    ok: true,
    version: ver ? ver.trim() : 'unknown',
    home: ALBERTO_HOME,
    node: process.version,
  };
}

// ─── Argument Parser ─────────────────────────────────────────────────────────

function parseArgs(args) {
  const opts = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        opts[key] = next;
        i++;
      } else {
        opts[key] = true;
      }
    } else {
      positional.push(args[i]);
    }
  }

  return { opts, positional };
}

// ─── Main Dispatch ───────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const rawIndex = args.indexOf('--raw');
  const raw = rawIndex !== -1;
  if (rawIndex !== -1) args.splice(rawIndex, 1);

  const command = args[0];

  if (!command) {
    error('Usage: alberto-tools <command> [args]\nCommands: version, init, template, skill, validate, backup, publish, install, registry');
  }

  switch (command) {
    case 'version': {
      output(getVersion(), raw, raw ? getVersion().version : undefined);
      break;
    }

    case 'init': {
      output(initSystem());
      break;
    }

    case 'template': {
      const sub = args[1];
      if (sub === 'list') {
        const templates = getTemplatePaths();
        const list = Object.entries(templates).map(([name, info]) => ({
          name,
          category: info.category,
          path: info.path,
        }));
        output({ ok: true, templates: list, count: list.length });
      } else if (sub === 'show') {
        const name = args[2];
        if (!name) error('Usage: template show <name>');
        const templates = getTemplatePaths();
        if (!templates[name]) error(`Template '${name}' not found`);
        const content = safeReadFile(templates[name].path);
        output({ ok: true, name, category: templates[name].category, content }, raw, content);
      } else {
        error('Usage: template <list|show> [name]');
      }
      break;
    }

    case 'skill': {
      const sub = args[1];
      if (sub === 'create') {
        const name = args[2];
        if (!name) error('Usage: skill create <name> [--type TYPE] [--template TPL] [--description DESC]');
        const { opts } = parseArgs(args.slice(3));
        output(createSkill(name, opts));
      } else if (sub === 'list') {
        output(listSkills());
      } else if (sub === 'view') {
        const name = args[2];
        if (!name) error('Usage: skill view <name>');
        output(viewSkill(name));
      } else if (sub === 'rename') {
        const oldName = args[2];
        const newName = args[3];
        if (!oldName || !newName) error('Usage: skill rename <old-name> <new-name>');
        output(renameSkill(oldName, newName));
      } else if (sub === 'delete') {
        const name = args[2];
        if (!name) error('Usage: skill delete <name>');
        output(deleteSkill(name));
      } else {
        error('Usage: skill <create|list|view|rename|delete> [args]');
      }
      break;
    }

    case 'validate': {
      const sub = args[1];
      if (sub === 'skill') {
        const name = args[2];
        if (!name) error('Usage: validate skill <name>');
        output(validateSkill(name));
      } else {
        error('Usage: validate skill <name>');
      }
      break;
    }

    case 'backup': {
      const sub = args[1];
      if (sub === 'create') {
        const label = args[2];
        output(createBackup(label));
      } else if (sub === 'list') {
        output(listBackups());
      } else if (sub === 'restore') {
        const file = args[2];
        if (!file) error('Usage: backup restore <filename>');
        output(restoreBackup(file));
      } else {
        error('Usage: backup <create|list|restore> [args]');
      }
      break;
    }

    case 'publish': {
      const name = args[1];
      if (!name) error('Usage: publish <skill-name>');
      output(publishSkill(name));
      break;
    }

    case 'install': {
      const file = args[1];
      if (!file) error('Usage: install <file.skill>');
      output(installSkill(file));
      break;
    }

    case 'registry': {
      const sub = args[1];
      if (sub === 'show') {
        output(loadRegistry());
      } else if (sub === 'stats') {
        const reg = loadRegistry();
        output({
          ok: true,
          total_skills: Object.keys(reg.skills).length,
          ...reg.stats,
          skills_by_type: Object.values(reg.skills).reduce((acc, s) => {
            acc[s.type] = (acc[s.type] || 0) + 1;
            return acc;
          }, {}),
        });
      } else {
        error('Usage: registry <show|stats>');
      }
      break;
    }

    default:
      error(`Unknown command: '${command}'. Run without arguments for help.`);
  }
}

main();
