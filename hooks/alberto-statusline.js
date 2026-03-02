#!/usr/bin/env node
// ============================================================================
//  Alberto Skills — Statusline Fragment
//  Created by Jose Lee <joelee194210@gmail.com>
//
//  For Beto... The Dude abides.
// ============================================================================
// Reads update cache and outputs indicator if update is available

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const cacheFile = path.join(os.homedir(), '.claude', 'cache', 'alberto-update-check.json');

let output = '';

if (fs.existsSync(cacheFile)) {
  try {
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    if (cache.update_available) {
      // Yellow indicator: update available
      output = '\x1b[33m⬆ alberto-skills update\x1b[0m';
    }
  } catch (e) {
    // Silent fail — don't break statusline
  }
}

if (output) {
  process.stdout.write(output);
}
