#!/usr/bin/env node
// ============================================================================
//  Alberto Skills — Background Update Check (SessionStart hook)
//  Created by Jose Lee <joelee1942@gmail.com>
//
//  For Beto... The Dude abides.
// ============================================================================
// Non-blocking: spawns a detached child process to check npm registry
// Note: The inner process uses execFileSync (not execSync) for safety.
// The command and arguments are hardcoded strings, not user input.

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const homeDir = os.homedir();
const cwd = process.cwd();
const cacheDir = path.join(homeDir, '.claude', 'cache');
const cacheFile = path.join(cacheDir, 'alberto-update-check.json');

// VERSION file locations (check project first, then global)
const projectVersionFile = path.join(cwd, '.claude', 'alberto-skills', 'VERSION');
const globalVersionFile = path.join(homeDir, '.claude', 'alberto-skills', 'VERSION');

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Spawn background process — non-blocking
const child = spawn(process.execPath, ['-e', `
  const fs = require('fs');
  const { execFileSync } = require('child_process');

  const cacheFile = ${JSON.stringify(cacheFile)};
  const projectVersionFile = ${JSON.stringify(projectVersionFile)};
  const globalVersionFile = ${JSON.stringify(globalVersionFile)};

  // Read installed version (project-local first, then global)
  let installed = '0.0.0';
  try {
    if (fs.existsSync(projectVersionFile)) {
      installed = fs.readFileSync(projectVersionFile, 'utf8').trim();
    } else if (fs.existsSync(globalVersionFile)) {
      installed = fs.readFileSync(globalVersionFile, 'utf8').trim();
    }
  } catch (e) {}

  // Query npm registry using execFileSync (safe — hardcoded args, no shell)
  let latest = null;
  try {
    latest = execFileSync('npm', ['view', 'alberto-skills-cc', 'version'], {
      encoding: 'utf8',
      timeout: 10000,
      windowsHide: true
    }).trim();
  } catch (e) {}

  const result = {
    update_available: latest && installed !== latest,
    installed,
    latest: latest || 'unknown',
    checked: Math.floor(Date.now() / 1000)
  };

  fs.writeFileSync(cacheFile, JSON.stringify(result));
`], {
  stdio: 'ignore',
  windowsHide: true,
  detached: true,
});

child.unref();
