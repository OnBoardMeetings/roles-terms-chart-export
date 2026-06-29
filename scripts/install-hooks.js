#!/usr/bin/env node

/**
 * Installs git hooks for automatic changelog compilation.
 * Run automatically via `npm install` (postinstall).
 */

import { writeFileSync, mkdirSync, chmodSync, existsSync } from 'fs'
import { join } from 'path'

const ROOT = new URL('..', import.meta.url).pathname
const HOOKS_DIR = join(ROOT, '.git', 'hooks')

if (!existsSync(join(ROOT, '.git'))) {
  console.log('Not a git repo — skipping hook install.')
  process.exit(0)
}

mkdirSync(HOOKS_DIR, { recursive: true })

const hook = `#!/bin/sh
# Auto-compile changelog from fragments + flags.config.js diff
node scripts/compile-changelog.js 2>/dev/null
git add src/data/changelog.js 2>/dev/null
`

const hookPath = join(HOOKS_DIR, 'pre-commit')
writeFileSync(hookPath, hook)
chmodSync(hookPath, '755')

console.log('Installed pre-commit hook for automatic changelog compilation.')
