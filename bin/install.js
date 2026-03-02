#!/usr/bin/env node
// ============================================================================
//  Alberto Skills — Interactive Installer for Claude Code
//  Created by Jose Lee <joelee1942@gmail.com>
//
//  For Beto... The Dude abides.
// ============================================================================
// Usage: npx alberto-skills-cc --global
//        npx alberto-skills-cc --uninstall --global

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

// ─── Constants ───────────────────────────────────────────────────────────────

const VERSION = fs.readFileSync(path.join(__dirname, '..', 'VERSION'), 'utf8').trim();
const PKG_ROOT = path.resolve(__dirname, '..');
const HOME = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');

// ─── Language detection ──────────────────────────────────────────────────────

function detectLang() {
  const env = (process.env.LC_ALL || process.env.LANG || process.env.LANGUAGE || '').toLowerCase();
  return env.startsWith('es') ? 'es' : 'en';
}

let LANG = detectLang();

function msg(en, es) {
  return LANG === 'es' ? es : en;
}

// ─── Args parsing ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function hasFlag(...flags) {
  return args.some(a => flags.includes(a));
}

function getFlagValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

// Override language if --lang provided
const langOverride = getFlagValue('--lang');
if (langOverride && ['en', 'es'].includes(langOverride.toLowerCase())) {
  LANG = langOverride.toLowerCase();
}

const wantGlobal = hasFlag('--global', '-g');
const wantLocal = hasFlag('--local', '-l');
const wantUninstall = hasFlag('--uninstall', '-u');
const wantHelp = hasFlag('--help', '-h');

// ─── Banner ──────────────────────────────────────────────────────────────────

function printBanner() {
  const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    red: '\x1b[31m',
  };

  console.log(`
${c.cyan}${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}
${c.cyan}${c.bold}  Alberto Skills${c.reset} ${c.dim}v${VERSION}${c.reset}
${c.cyan}${c.bold}  ${msg('Skill Management for Claude Code', 'Gestión de Skills para Claude Code')}${c.reset}
${c.cyan}${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}
`);
}

// ─── Help ────────────────────────────────────────────────────────────────────

function printHelp() {
  printBanner();
  console.log(msg(
    `Usage: npx alberto-skills-cc [options]

Options:
  --global, -g      Install to ~/.claude/ (global)
  --local, -l       Install to ./.claude/ (project-local)
  --uninstall, -u   Remove installed files
  --lang en|es      Force language (auto-detected from $LANG)
  --help, -h        Show this help

Examples:
  npx alberto-skills-cc --global          Install globally
  npx alberto-skills-cc --local           Install in current project
  npx alberto-skills-cc -u -g             Uninstall from global
  npx alberto-skills-cc --global --lang es  Install in Spanish`,
    `Uso: npx alberto-skills-cc [opciones]

Opciones:
  --global, -g      Instalar en ~/.claude/ (global)
  --local, -l       Instalar en ./.claude/ (proyecto local)
  --uninstall, -u   Desinstalar archivos
  --lang en|es      Forzar idioma (auto-detectado de $LANG)
  --help, -h        Mostrar esta ayuda

Ejemplos:
  npx alberto-skills-cc --global            Instalar globalmente
  npx alberto-skills-cc --local             Instalar en proyecto local
  npx alberto-skills-cc -u -g               Desinstalar de global
  npx alberto-skills-cc --global --lang es  Instalar en español`
  ));
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function removeDirRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeDirRecursive(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dir);
}

function collectFiles(dir, base) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

// ─── Settings.json merge ─────────────────────────────────────────────────────

function mergeSettings(targetClaudeDir, action) {
  const settingsPath = path.join(targetClaudeDir, 'settings.json');
  let settings = {};

  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      console.log(msg(
        `  ⚠ Could not parse settings.json, creating new one`,
        `  ⚠ No se pudo parsear settings.json, creando uno nuevo`
      ));
      settings = {};
    }
  }

  // Permission string
  const albertoSkillsDir = path.join(targetClaudeDir, 'alberto-skills');
  const toolsPath = path.join(albertoSkillsDir, 'bin', 'alberto-tools.cjs');
  const permission = `Bash(node ${toolsPath}:*)`;

  // Hook command
  const hookPath = path.join(albertoSkillsDir, 'hooks', 'alberto-check-update.js');
  const hookCommand = `node "${hookPath}"`;

  if (action === 'install') {
    // Merge permission
    if (!settings.permissions) settings.permissions = {};
    if (!settings.permissions.allow) settings.permissions.allow = [];
    if (!settings.permissions.allow.includes(permission)) {
      settings.permissions.allow.push(permission);
    }

    // Merge SessionStart hook
    if (!settings.hooks) settings.hooks = {};
    if (!settings.hooks.SessionStart) settings.hooks.SessionStart = [];

    const hasHook = settings.hooks.SessionStart.some(group =>
      group.hooks && group.hooks.some(h => h.command && h.command.includes('alberto-check-update'))
    );

    if (!hasHook) {
      // Append to first group if exists, else create new group
      if (settings.hooks.SessionStart.length > 0 && settings.hooks.SessionStart[0].hooks) {
        settings.hooks.SessionStart[0].hooks.push({
          type: 'command',
          command: hookCommand,
        });
      } else {
        settings.hooks.SessionStart.push({
          hooks: [{
            type: 'command',
            command: hookCommand,
          }],
        });
      }
    }

  } else if (action === 'uninstall') {
    // Remove permission
    if (settings.permissions && settings.permissions.allow) {
      settings.permissions.allow = settings.permissions.allow.filter(p =>
        !p.includes('alberto-tools.cjs') && !p.includes('alberto-skills')
      );
    }

    // Remove hook
    if (settings.hooks && settings.hooks.SessionStart) {
      for (const group of settings.hooks.SessionStart) {
        if (group.hooks) {
          group.hooks = group.hooks.filter(h =>
            !h.command || !h.command.includes('alberto-check-update')
          );
        }
      }
      // Remove empty groups
      settings.hooks.SessionStart = settings.hooks.SessionStart.filter(g =>
        g.hooks && g.hooks.length > 0
      );
      if (settings.hooks.SessionStart.length === 0) {
        delete settings.hooks.SessionStart;
      }
      if (Object.keys(settings.hooks).length === 0) {
        delete settings.hooks;
      }
    }
  }

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

// ─── Manifest generation ─────────────────────────────────────────────────────

function generateManifest(targetClaudeDir) {
  const manifestPath = path.join(targetClaudeDir, 'alberto-skills-manifest.json');
  const manifest = {
    version: VERSION,
    timestamp: new Date().toISOString(),
    files: {},
  };

  // Collect files from alberto-skills/
  const skillsDir = path.join(targetClaudeDir, 'alberto-skills');
  if (fs.existsSync(skillsDir)) {
    const files = collectFiles(skillsDir, 'alberto-skills');
    for (const { fullPath, relPath } of files) {
      // Skip user data directories
      if (relPath.startsWith('alberto-skills/backups/') ||
          relPath.startsWith('alberto-skills/exports/') ||
          relPath.startsWith('alberto-skills/workspace/')) continue;
      manifest.files[relPath] = sha256(fullPath);
    }
  }

  // Collect files from commands/alberto_skills/
  const commandsDir = path.join(targetClaudeDir, 'commands', 'alberto_skills');
  if (fs.existsSync(commandsDir)) {
    const files = collectFiles(commandsDir, 'commands/alberto_skills');
    for (const { fullPath, relPath } of files) {
      manifest.files[relPath] = sha256(fullPath);
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

// ─── Install flow ────────────────────────────────────────────────────────────

function install(targetClaudeDir) {
  const c = { green: '\x1b[32m', dim: '\x1b[2m', reset: '\x1b[0m', bold: '\x1b[1m', yellow: '\x1b[33m' };

  console.log(msg(
    `${c.bold}Installing Alberto Skills v${VERSION}...${c.reset}\n`,
    `${c.bold}Instalando Alberto Skills v${VERSION}...${c.reset}\n`
  ));

  const targetSkillsDir = path.join(targetClaudeDir, 'alberto-skills');
  const targetCommandsDir = path.join(targetClaudeDir, 'commands', 'alberto_skills');

  // 1. Copy core directories: bin/, templates/, hooks/
  const coreDirs = ['bin', 'templates', 'hooks'];
  for (const dir of coreDirs) {
    const src = path.join(PKG_ROOT, dir);
    const dest = path.join(targetSkillsDir, dir);
    if (fs.existsSync(src)) {
      copyDirRecursive(src, dest);
      console.log(`  ${c.green}✓${c.reset} ${dir}/`);
    }
  }

  // 2. Ensure user-data directories exist
  const dataDirs = ['workspace', 'backups', 'exports'];
  for (const dir of dataDirs) {
    const dest = path.join(targetSkillsDir, dir);
    fs.mkdirSync(dest, { recursive: true });
  }
  console.log(`  ${c.green}✓${c.reset} ${msg('workspace directories', 'directorios de trabajo')}`);

  // 3. Copy registry.json (only if not already present — preserve user data)
  const registrySrc = path.join(PKG_ROOT, 'registry.json');
  const registryDest = path.join(targetSkillsDir, 'registry.json');
  if (!fs.existsSync(registryDest)) {
    fs.copyFileSync(registrySrc, registryDest);
    console.log(`  ${c.green}✓${c.reset} registry.json ${c.dim}(${msg('new', 'nuevo')})${c.reset}`);
  } else {
    console.log(`  ${c.green}✓${c.reset} registry.json ${c.dim}(${msg('preserved', 'preservado')})${c.reset}`);
  }

  // 4. Copy VERSION
  fs.copyFileSync(path.join(PKG_ROOT, 'VERSION'), path.join(targetSkillsDir, 'VERSION'));
  console.log(`  ${c.green}✓${c.reset} VERSION`);

  // 5. Copy commands/alberto_skills/*.md
  const commandsSrc = path.join(PKG_ROOT, 'commands');
  if (fs.existsSync(commandsSrc)) {
    // The commands directory in the package contains the .md files directly
    // (published from ~/.claude/commands/alberto_skills/)
    copyDirRecursive(commandsSrc, targetCommandsDir);
    const cmdCount = fs.readdirSync(targetCommandsDir).filter(f => f.endsWith('.md')).length;
    console.log(`  ${c.green}✓${c.reset} ${msg(`${cmdCount} slash commands`, `${cmdCount} comandos slash`)}`);
  }

  // 6. Make alberto-tools.cjs executable
  const toolsPath = path.join(targetSkillsDir, 'bin', 'alberto-tools.cjs');
  if (fs.existsSync(toolsPath)) {
    try { fs.chmodSync(toolsPath, 0o755); } catch (e) {}
  }

  // 7. Merge settings.json
  console.log('');
  console.log(msg(
    `  ${c.green}✓${c.reset} Configuring settings.json...`,
    `  ${c.green}✓${c.reset} Configurando settings.json...`
  ));
  mergeSettings(targetClaudeDir, 'install');

  // 8. Generate manifest
  const manifest = generateManifest(targetClaudeDir);
  const fileCount = Object.keys(manifest.files).length;
  console.log(msg(
    `  ${c.green}✓${c.reset} Manifest generated (${fileCount} files tracked)`,
    `  ${c.green}✓${c.reset} Manifiesto generado (${fileCount} archivos rastreados)`
  ));

  // 9. Success summary
  console.log(`
${c.green}${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}
${c.green}${c.bold}  ${msg('Installation complete!', '¡Instalación completa!')}${c.reset}
${c.green}${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}

${c.bold}${msg('Available commands', 'Comandos disponibles')}:${c.reset}
  ${c.yellow}/alberto_skills:help${c.reset}      ${msg('Command reference', 'Referencia de comandos')}
  ${c.yellow}/alberto_skills:new${c.reset}       ${msg('Create a new skill', 'Crear una nueva skill')}
  ${c.yellow}/alberto_skills:list${c.reset}      ${msg('List all skills', 'Listar todas las skills')}
  ${c.yellow}/alberto_skills:view${c.reset}      ${msg('View skill details', 'Ver detalles de una skill')}
  ${c.yellow}/alberto_skills:validate${c.reset}  ${msg('Validate a skill', 'Validar una skill')}
  ${c.yellow}/alberto_skills:publish${c.reset}   ${msg('Package as .skill', 'Empaquetar como .skill')}
  ${c.yellow}/alberto_skills:install${c.reset}   ${msg('Install a .skill', 'Instalar un .skill')}
  ${c.yellow}/alberto_skills:test${c.reset}      ${msg('Test a skill', 'Probar una skill')}
  ${c.yellow}/alberto_skills:rename${c.reset}    ${msg('Rename a skill', 'Renombrar una skill')}
  ${c.yellow}/alberto_skills:delete${c.reset}    ${msg('Delete a skill', 'Eliminar una skill')}
  ${c.yellow}/alberto_skills:backup${c.reset}    ${msg('Manage backups', 'Gestionar respaldos')}
  ${c.yellow}/alberto_skills:restore${c.reset}   ${msg('Restore from backup', 'Restaurar desde respaldo')}

${c.dim}${msg('Open a new Claude Code session to start using Alberto Skills.', 'Abre una nueva sesión de Claude Code para empezar a usar Alberto Skills.')}${c.reset}
`);
}

// ─── Uninstall flow ──────────────────────────────────────────────────────────

function uninstall(targetClaudeDir) {
  const c = { red: '\x1b[31m', green: '\x1b[32m', dim: '\x1b[2m', reset: '\x1b[0m', bold: '\x1b[1m', yellow: '\x1b[33m' };

  console.log(msg(
    `${c.bold}Uninstalling Alberto Skills...${c.reset}\n`,
    `${c.bold}Desinstalando Alberto Skills...${c.reset}\n`
  ));

  const targetSkillsDir = path.join(targetClaudeDir, 'alberto-skills');
  const targetCommandsDir = path.join(targetClaudeDir, 'commands', 'alberto_skills');
  const manifestPath = path.join(targetClaudeDir, 'alberto-skills-manifest.json');
  const cachePath = path.join(targetClaudeDir, 'cache', 'alberto-update-check.json');

  // 1. Remove alberto-skills/ directory
  if (fs.existsSync(targetSkillsDir)) {
    // Warn if user has skills in workspace
    const workspaceDir = path.join(targetSkillsDir, 'workspace');
    if (fs.existsSync(workspaceDir)) {
      const skills = fs.readdirSync(workspaceDir).filter(f => {
        try { return fs.statSync(path.join(workspaceDir, f)).isDirectory(); } catch { return false; }
      });
      if (skills.length > 0) {
        console.log(msg(
          `  ${c.yellow}⚠${c.reset} Found ${skills.length} skill(s) in workspace — these will be removed`,
          `  ${c.yellow}⚠${c.reset} Se encontraron ${skills.length} skill(s) en workspace — serán eliminadas`
        ));
      }
    }

    removeDirRecursive(targetSkillsDir);
    console.log(`  ${c.green}✓${c.reset} ${msg('Removed alberto-skills/', 'Eliminado alberto-skills/')}`);
  } else {
    console.log(`  ${c.dim}–${c.reset} ${msg('alberto-skills/ not found', 'alberto-skills/ no encontrado')}`);
  }

  // 2. Remove commands/alberto_skills/
  if (fs.existsSync(targetCommandsDir)) {
    removeDirRecursive(targetCommandsDir);
    console.log(`  ${c.green}✓${c.reset} ${msg('Removed commands/alberto_skills/', 'Eliminado commands/alberto_skills/')}`);
  } else {
    console.log(`  ${c.dim}–${c.reset} ${msg('commands/alberto_skills/ not found', 'commands/alberto_skills/ no encontrado')}`);
  }

  // 3. Clean up settings.json
  console.log(msg(
    `  ${c.green}✓${c.reset} Cleaning settings.json...`,
    `  ${c.green}✓${c.reset} Limpiando settings.json...`
  ));
  mergeSettings(targetClaudeDir, 'uninstall');

  // 4. Remove manifest
  if (fs.existsSync(manifestPath)) {
    fs.unlinkSync(manifestPath);
    console.log(`  ${c.green}✓${c.reset} ${msg('Removed manifest', 'Eliminado manifiesto')}`);
  }

  // 5. Remove cache file
  if (fs.existsSync(cachePath)) {
    fs.unlinkSync(cachePath);
    console.log(`  ${c.green}✓${c.reset} ${msg('Removed cache', 'Eliminado caché')}`);
  }

  console.log(msg(
    `\n${c.green}${c.bold}Alberto Skills has been uninstalled.${c.reset}`,
    `\n${c.green}${c.bold}Alberto Skills ha sido desinstalado.${c.reset}`
  ));
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  if (wantHelp) {
    printHelp();
    process.exit(0);
  }

  printBanner();

  // Determine target directory
  if (!wantGlobal && !wantLocal) {
    console.log(msg(
      'Error: Please specify --global (-g) or --local (-l)\n',
      'Error: Especifica --global (-g) o --local (-l)\n'
    ));
    console.log(msg(
      'Run with --help for usage information.',
      'Ejecuta con --help para ver información de uso.'
    ));
    process.exit(1);
  }

  let targetClaudeDir;
  if (wantGlobal) {
    targetClaudeDir = CLAUDE_DIR;
    console.log(msg(
      `Target: ${targetClaudeDir} (global)\n`,
      `Destino: ${targetClaudeDir} (global)\n`
    ));
  } else {
    targetClaudeDir = path.join(process.cwd(), '.claude');
    console.log(msg(
      `Target: ${targetClaudeDir} (local)\n`,
      `Destino: ${targetClaudeDir} (local)\n`
    ));
  }

  // Ensure target .claude directory exists
  fs.mkdirSync(targetClaudeDir, { recursive: true });

  if (wantUninstall) {
    uninstall(targetClaudeDir);
  } else {
    install(targetClaudeDir);
  }
}

main();
