#!/usr/bin/env node

/**
 * Changelog entry creator.
 *
 * Interactive:  npm run changelog:add
 * Inline:      npm run changelog:add -- "test message"
 *              npm run changelog:add -- --type changed "moved search to phase 1"
 */

import { writeFileSync } from 'fs'
import { join } from 'path'
import { createInterface } from 'readline'

const ROOT = new URL('..', import.meta.url).pathname
const CHANGELOG_DIR = join(ROOT, 'changelog')

const args = process.argv.slice(2)

function writeEntry(type, text) {
  const today = new Date().toISOString().split('T')[0]
  const slug = text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)

  const fileName = `${today}_${slug}.md`
  const filePath = join(CHANGELOG_DIR, fileName)

  const content = `---\ntype: ${type}\n---\n${text}\n`
  writeFileSync(filePath, content)

  console.log(`  Created: changelog/${fileName}`)
}

// ── Inline mode ─────────────────────────────────────────────

if (args.length > 0) {
  let type = 'added'
  let textParts = []

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type' && args[i + 1]) {
      type = args[++i]
    } else {
      textParts.push(args[i])
    }
  }

  const text = textParts.join(' ').trim()
  if (!text) {
    console.error('  No description provided.')
    process.exit(1)
  }

  writeEntry(type, text)
  process.exit(0)
}

// ── Interactive mode ────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(resolve => rl.question(q, resolve))

async function interactive() {
  console.log('\n  Add a changelog entry\n')

  console.log('  Type:')
  console.log('    1) added    — new feature or story')
  console.log('    2) changed  — modified existing behavior')
  console.log('    3) fixed    — bug fix')
  console.log('    4) removed  — removed something\n')

  const typeNum = await ask('  Pick a type [1-4, default 1]: ')
  const types = { '1': 'added', '2': 'changed', '3': 'fixed', '4': 'removed', '': 'added' }
  const type = types[typeNum.trim()] || 'added'

  const text = await ask('  What changed? ')

  if (!text.trim()) {
    console.log('  Skipped — no description provided.\n')
    rl.close()
    return
  }

  writeEntry(type, text.trim())
  console.log()
  rl.close()
}

interactive()
