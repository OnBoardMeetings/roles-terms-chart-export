#!/usr/bin/env node

/**
 * Changelog Compiler
 * ==================
 * Reads changelog fragments from changelog/ directory and auto-diffs
 * flags.config.js against the last git tag to produce src/data/changelog.js.
 *
 * Usage:
 *   node scripts/compile-changelog.js
 *   node scripts/compile-changelog.js --clean   # also removes compiled fragments
 *
 * Fragment format (changelog/YYYY-MM-DD_slug.md):
 *   ---
 *   type: added | changed | fixed | removed
 *   ---
 *   Human-readable description of the change
 *
 * Output: src/data/changelog.js (array of changelog entries)
 */

import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { execSync } from 'child_process'

const ROOT = new URL('..', import.meta.url).pathname
const CHANGELOG_DIR = join(ROOT, 'changelog')
const OUTPUT = join(ROOT, 'src', 'data', 'changelog.js')
const FLAGS_CONFIG = join(ROOT, 'flags.config.js')
const shouldClean = process.argv.includes('--clean')

// ── Parse fragments ─────────────────────────────────────────

function parseFragment(filePath) {
  const raw = readFileSync(filePath, 'utf-8').trim()
  const fileName = basename(filePath)

  // Extract date from filename: YYYY-MM-DD_slug.md
  const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : null

  // Parse frontmatter
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) {
    console.warn(`Skipping ${fileName}: no frontmatter found`)
    return null
  }

  const frontmatter = fmMatch[1]
  const body = fmMatch[2].trim()

  // Parse type from frontmatter
  const typeMatch = frontmatter.match(/type:\s*(\w+)/)
  const type = typeMatch ? typeMatch[1] : 'changed'

  return { date, type, text: body, file: fileName }
}

function readFragments() {
  if (!existsSync(CHANGELOG_DIR)) return []

  const files = readdirSync(CHANGELOG_DIR)
    .filter(f => f.endsWith('.md'))
    .sort() // chronological by filename

  return files
    .map(f => parseFragment(join(CHANGELOG_DIR, f)))
    .filter(Boolean)
}

// ── Auto-diff flags.config.js ───────────────────────────────

function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0 2>/dev/null', { cwd: ROOT })
      .toString().trim()
  } catch {
    return null
  }
}

function diffFlagsConfig() {
  const tag = getLastTag()
  if (!tag) return []

  let oldConfig, newConfig
  try {
    const oldRaw = execSync(`git show ${tag}:flags.config.js 2>/dev/null`, { cwd: ROOT })
      .toString()
    oldConfig = parseFlagsFromSource(oldRaw)
    newConfig = parseFlagsFromSource(readFileSync(FLAGS_CONFIG, 'utf-8'))
  } catch {
    return []
  }

  const changes = []

  // Detect new phases
  for (const key of Object.keys(newConfig.phases || {})) {
    if (!oldConfig.phases?.[key]) {
      changes.push({ type: 'added', text: `Phase "${newConfig.phases[key].label}" added`, auto: true })
    }
  }

  // Detect removed phases
  for (const key of Object.keys(oldConfig.phases || {})) {
    if (!newConfig.phases?.[key]) {
      changes.push({ type: 'removed', text: `Phase "${oldConfig.phases[key].label}" removed`, auto: true })
    }
  }

  // Detect new features
  for (const key of Object.keys(newConfig.features || {})) {
    if (!oldConfig.features?.[key]) {
      changes.push({ type: 'added', text: `Feature "${newConfig.features[key].label}" added`, auto: true })
    }
  }

  // Detect phase reassignments on features
  for (const key of Object.keys(newConfig.features || {})) {
    const oldF = oldConfig.features?.[key]
    const newF = newConfig.features[key]
    if (oldF && oldF.phase !== newF.phase) {
      changes.push({
        type: 'changed',
        text: `"${newF.label}" moved from ${oldF.phase} to ${newF.phase}`,
        auto: true,
      })
    }

    // Detect story phase changes
    for (const storyKey of Object.keys(newF.stories || {})) {
      const oldPhase = oldF?.stories?.[storyKey]?.phase
      const newPhase = newF.stories[storyKey].phase
      if (oldPhase && oldPhase !== newPhase) {
        changes.push({
          type: 'changed',
          text: `Story "${storyKey}" moved from ${oldPhase} to ${newPhase}`,
          auto: true,
        })
      } else if (!oldF?.stories?.[storyKey]) {
        changes.push({
          type: 'added',
          text: `Story "${storyKey}" added to "${newF.label}"`,
          auto: true,
        })
      }
    }
  }

  return changes
}

/**
 * Extract the config object from the flags.config.js source.
 * Uses a simple regex approach to avoid eval/import issues with ES modules.
 */
function parseFlagsFromSource(source) {
  try {
    // Strip `export default` and trailing semicolons, then parse as a JS object
    const cleaned = source
      .replace(/export\s+default\s+/, '')
      .replace(/;\s*$/, '')
    // Use Function constructor to evaluate the object literal
    return new Function(`return (${cleaned})`)()
  } catch {
    return {}
  }
}

// ── Compile ─────────────────────────────────────────────────

function compile() {
  const fragments = readFragments()
  const autoDiffs = diffFlagsConfig()

  // Group by date
  const entriesByDate = new Map()

  for (const frag of fragments) {
    const key = frag.date || 'undated'
    if (!entriesByDate.has(key)) {
      entriesByDate.set(key, { date: frag.date, changes: [] })
    }
    entriesByDate.get(key).changes.push({ type: frag.type, text: frag.text })
  }

  // Add auto-diffs under today's date
  if (autoDiffs.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    if (!entriesByDate.has(today)) {
      entriesByDate.set(today, { date: today, changes: [] })
    }
    for (const diff of autoDiffs) {
      // Don't add auto-diffs that duplicate fragment text
      const existing = entriesByDate.get(today).changes
      if (!existing.some(c => c.text === diff.text)) {
        entriesByDate.get(today).changes.push(diff)
      }
    }
  }

  // Sort entries newest first
  const entries = Array.from(entriesByDate.values())
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  // Generate output
  const output = `/**
 * Auto-generated changelog — do not edit manually.
 * Run: node scripts/compile-changelog.js
 * Source: changelog/ fragments + flags.config.js auto-diff
 */
export const changelog = ${JSON.stringify(entries, null, 2)}
`

  writeFileSync(OUTPUT, output)

  const totalChanges = entries.reduce((sum, e) => sum + e.changes.length, 0)
  console.log(`Compiled ${fragments.length} fragments + ${autoDiffs.length} auto-diffs → ${entries.length} entries (${totalChanges} changes)`)
  console.log(`Output: ${OUTPUT}`)

  // Clean fragments if requested
  if (shouldClean) {
    let cleaned = 0
    for (const frag of fragments) {
      const filePath = join(CHANGELOG_DIR, frag.file)
      unlinkSync(filePath)
      cleaned++
    }
    console.log(`Cleaned ${cleaned} fragment files`)
  }
}

compile()
