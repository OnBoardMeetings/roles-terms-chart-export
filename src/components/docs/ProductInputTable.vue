<template>
  <section class="product-input">
    <!-- Breadcrumb / title block -->
    <div class="flex items-start justify-between gap-6 mb-6">
      <div>
        <p class="text-xs font-medium tracking-wide text-gray-500 uppercase mb-2">
          Product → Design Prototype
        </p>
        <h3 class="text-3xl font-semibold text-gray-900 mb-2">Product Input Brief</h3>
        <p class="text-sm text-gray-600">
          One row per problem-capability cluster. Designers will use this as the brief for
          prototyping — be specific, be opinionated.
        </p>
      </div>

      <!-- Action cluster: read-only export only. No add/edit/delete. -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          @click="copyAsMarkdown"
          class="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {{ copied ? 'Copied' : 'Copy as Markdown' }}
        </button>
        <button
          type="button"
          @click="downloadMarkdown"
          class="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download .md
        </button>
      </div>
    </div>

    <!--
      Initiative Overview — answers "what is this prototype trying
      to solve, what do we believe will happen if we solve it, what
      are we taking as given, and what's in our way?" Sourced from
      `productInputOverview` in src/data/productInput.js. Sits above
      the context strip so the per-cluster rows below read as facets
      of one umbrella thesis.
    -->
    <div class="bg-white border border-gray-200 rounded-md p-5 mb-4">
      <div class="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-2">
        Initiative
      </div>
      <h4 class="text-xl font-semibold text-gray-900 mb-5">
        {{ productInputOverview.title }}
      </h4>

      <!-- Problem + Hypothesis row -->
      <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-5">
        <div>
          <dt class="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-1">
            Problem
          </dt>
          <dd class="text-sm text-gray-700 leading-relaxed">
            {{ productInputOverview.problem }}
          </dd>
        </div>
        <div>
          <dt class="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-1">
            Hypothesis
          </dt>
          <dd class="text-sm text-gray-700 leading-relaxed">
            {{ productInputOverview.hypothesis }}
          </dd>
        </div>
      </dl>

      <!--
        Assumptions + Constraints row. Items are grouped by `kind`
        and rendered under sub-headers so the reader can scan by
        category (Timeline, Dependency, Refactor, Technical, Scope,
        Other) without each item carrying a redundant chip. Items
        without a `kind` fall into the "Other" bucket. Empty
        sub-groups are skipped so we never render an empty header.
      -->
      <dl
        v-if="(productInputOverview.assumptions?.length || productInputOverview.constraints?.length)"
        class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-5 border-t border-gray-100"
      >
        <div v-if="productInputOverview.assumptions?.length">
          <dt class="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-3">
            Assumptions
          </dt>
          <dd class="space-y-3">
            <div
              v-for="group in groupedAssumptions"
              :key="group.kind"
            >
              <p class="text-[10px] font-semibold tracking-wide uppercase text-gray-400 mb-1">
                {{ kindLabel(group.kind) }}
              </p>
              <ul class="space-y-1">
                <li
                  v-for="(item, idx) in group.items"
                  :key="`a-${group.kind}-${idx}`"
                  class="flex gap-2 leading-relaxed items-baseline text-sm text-gray-700"
                >
                  <span class="text-gray-400 flex-shrink-0 leading-tight">•</span>
                  <span>{{ item.text }}</span>
                </li>
              </ul>
            </div>
          </dd>
        </div>
        <div v-if="productInputOverview.constraints?.length">
          <dt class="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-3">
            Constraints
          </dt>
          <dd class="space-y-3">
            <div
              v-for="group in groupedConstraints"
              :key="group.kind"
            >
              <p class="text-[10px] font-semibold tracking-wide uppercase text-gray-400 mb-1">
                {{ kindLabel(group.kind) }}
              </p>
              <ul class="space-y-1">
                <li
                  v-for="(item, idx) in group.items"
                  :key="`c-${group.kind}-${idx}`"
                  class="flex gap-2 leading-relaxed items-baseline text-sm text-gray-700"
                >
                  <span class="text-gray-400 flex-shrink-0 leading-tight">•</span>
                  <span>{{ item.text }}</span>
                </li>
              </ul>
            </div>
          </dd>
        </div>
      </dl>
    </div>

    <!--
      Initiative Context — verticals and size apply to the whole
      initiative (one value per prototype, sourced from
      `productInputContext`). The rows below are problem-capability
      clusters within this scope, each varying by persona.
    -->
    <div class="bg-white border border-gray-200 rounded-md p-4 mb-4 flex flex-wrap items-start gap-x-8 gap-y-3">
      <div class="flex-1 min-w-[200px]">
        <div class="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-1">Verticals / Industries</div>
        <!--
          When industries === ['All'], render the umbrella label with
          a dotted underline + hover tooltip listing every named
          vertical it covers. Specific verticals just render as a
          comma-separated list since each is self-explanatory.
        -->
        <div
          v-if="industriesIsAll"
          class="group relative inline-block"
        >
          <span class="text-sm text-gray-800 underline decoration-dotted decoration-gray-400 underline-offset-4 cursor-help">
            All
          </span>
          <div
            class="hidden group-hover:block absolute z-20 mt-2 left-0 w-64 p-3 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-md"
          >
            <p class="font-semibold mb-1.5 text-gray-500 uppercase tracking-wide text-[10px]">
              Covers all verticals
            </p>
            <ul class="space-y-1">
              <li
                v-for="vertical in ALL_INDUSTRIES_EXPANDED"
                :key="vertical"
                class="text-gray-700"
              >
                {{ vertical }}
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="text-sm text-gray-800">
          {{ productInputContext.industries.join(', ') }}
        </div>
      </div>
      <div class="flex-shrink-0">
        <div class="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-1">Size</div>
        <div class="flex flex-wrap items-start content-start gap-x-1 gap-y-1">
          <span
            v-for="tag in productInputContext.size"
            :key="tag"
            :class="chipClasses(tag, { outline: true })"
          >{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="productInput.length === 0"
      class="p-12 bg-white border border-dashed border-gray-300 rounded-md text-center text-sm text-gray-500"
    >
      <p class="font-medium text-gray-700 mb-1">No product input rows yet.</p>
      <p>
        Add rows by editing
        <code class="bg-gray-100 px-1 py-0.5 rounded text-gray-700">src/data/productInput.js</code>.
      </p>
    </div>

    <!--
      Table — wrapped in `overflow-x-auto` so the row layout never
      collapses chips into vertical stacks at narrow widths. The
      inner grid carries a min-width that keeps every column above
      its natural content width; below that the user scrolls
      horizontally instead of seeing squished cells.
    -->
    <div v-else class="border border-gray-200 rounded-md overflow-x-auto bg-white">
      <div class="min-w-[840px]">
      <!-- Column header row -->
      <div class="grid grid-cols-12 text-xs font-semibold tracking-wide uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
        <div class="col-span-2 px-4 py-2">Persona</div>
        <div class="col-span-4 px-4 py-2">Problem / Gap</div>
        <div class="col-span-4 px-4 py-2">Capabilities Needed</div>
        <div class="col-span-2 px-4 py-2">Org / Product Impact</div>
      </div>

      <!-- Data rows -->
      <div
        v-for="(row, idx) in productInput"
        :key="row.id"
        :class="[
          'grid grid-cols-12 text-sm text-gray-800',
          idx < productInput.length - 1 ? 'border-b border-gray-200' : '',
        ]"
      >
        <div class="col-span-2 px-4 py-4 align-top flex flex-wrap items-start content-start gap-x-1 gap-y-1">
          <span
            v-for="tag in row.persona"
            :key="tag"
            :class="chipClasses(tag)"
          >{{ tag }}</span>
        </div>
        <div class="col-span-4 px-4 py-4 align-top whitespace-pre-line leading-relaxed">
          {{ row.problem }}
        </div>
        <div class="col-span-4 px-4 py-4 align-top">
          <ul class="space-y-1.5">
            <li
              v-for="(cap, capIdx) in row.capabilities"
              :key="capIdx"
              class="flex gap-2 leading-relaxed items-baseline"
            >
              <!--
                Priority chip on the left edge of each bullet so the row
                reads as "[P0] do this thing." Capabilities without a
                priority fall back to a plain bullet so we don't pretend
                everything is urgent.
              -->
              <span
                v-if="capPriority(cap)"
                :class="[chipClasses(capPriority(cap)), 'flex-shrink-0']"
              >{{ capPriority(cap) }}</span>
              <span v-else class="text-gray-400 flex-shrink-0 leading-tight">•</span>
              <span>{{ capText(cap) }}</span>
            </li>
          </ul>
        </div>
        <div class="col-span-2 px-4 py-4 align-top flex flex-wrap items-start content-start gap-x-1 gap-y-1">
          <span
            v-for="tag in row.impact"
            :key="tag"
            :class="chipClasses(tag, { outline: true })"
          >{{ tag }}</span>
        </div>
      </div>
      </div>
    </div>

    <!-- Footer: row count -->
    <div class="flex items-end justify-end mt-4 text-xs text-gray-500">
      <p>
        {{ productInput.length }} {{ productInput.length === 1 ? 'row' : 'rows' }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  productInput,
  productInputContext,
  productInputOverview,
  INDUSTRIES,
  CONSTRAINT_KINDS,
  CHIP_COLORS,
} from '@/data/productInput.js'

// Pretty-print a CONSTRAINT_KIND for sub-header display ("TIMELINE"
// → "Timeline"). Source-side stays UPPERCASE for parity with the
// other closed sets; rendering uses Title Case so the sub-headers
// don't shout.
function kindLabel(kind) {
  if (!kind) return 'Other'
  const lower = kind.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/**
 * Group an array of `{ kind, text }` items by their `kind`,
 * preserving the order declared in CONSTRAINT_KINDS. Items missing
 * a `kind` land in the OTHER bucket. Returns a list of
 * `{ kind, items }` groups with empty buckets stripped so the
 * template never renders an empty sub-header.
 */
function groupByKind(items) {
  if (!items?.length) return []
  const buckets = new Map()
  for (const k of CONSTRAINT_KINDS) buckets.set(k, [])
  for (const item of items) {
    const kind = CONSTRAINT_KINDS.includes(item.kind) ? item.kind : 'OTHER'
    buckets.get(kind).push(item)
  }
  const groups = []
  for (const k of CONSTRAINT_KINDS) {
    const bucket = buckets.get(k)
    if (bucket.length) groups.push({ kind: k, items: bucket })
  }
  return groups
}

// All industries except the umbrella 'All' value — used in the
// hover tooltip when productInputContext.industries === ['All'] so
// the reader can see exactly which verticals that umbrella covers.
const ALL_INDUSTRIES_EXPANDED = INDUSTRIES.filter((i) => i !== 'All')

// True when the prototype targets every vertical (`['All']`) or any
// array that explicitly includes the 'All' sentinel — in either case
// we render the umbrella label + hover tooltip rather than a list.
const industriesIsAll = computed(() =>
  (productInputContext.industries || []).includes('All'),
)

// Pre-grouped views of assumptions / constraints — items bucketed
// by `kind` with empty buckets stripped, in CONSTRAINT_KINDS order.
const groupedAssumptions = computed(() =>
  groupByKind(productInputOverview.assumptions || []),
)
const groupedConstraints = computed(() =>
  groupByKind(productInputOverview.constraints || []),
)

const copied = ref(false)

const BASE_CHIP =
  'inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full whitespace-nowrap'

/**
 * Build the Tailwind class string for a chip. The CHIP_COLORS map in
 * `productInput.js` carries the per-value palette so the colours stay
 * declarative — no per-component switch statements when new closed-set
 * values are added. `outline` mode renders the chip as a pill on white
 * with a coloured border + matching text (used for SIZES).
 */
function chipClasses(tag, { outline = false } = {}) {
  const palette = CHIP_COLORS[tag] || {}
  if (outline) {
    return [
      BASE_CHIP,
      'bg-white border',
      palette.border || 'border-gray-300',
      palette.text || 'text-gray-700',
    ]
  }
  return [
    BASE_CHIP,
    palette.fill || 'bg-gray-100',
    palette.text || 'text-gray-700',
  ]
}

/**
 * Capability rows accept either a plain string (legacy / shorthand
 * for an un-prioritised bullet) or a `{ text, priority }` object.
 * These helpers normalise both shapes for the template and the
 * markdown export.
 */
const capText = (cap) => (typeof cap === 'string' ? cap : cap.text)
const capPriority = (cap) => (typeof cap === 'string' ? null : cap.priority || null)

/**
 * Render the rows as a Markdown table — one block per row, since the
 * cells contain bullets and long paragraphs that don't fit a single
 * pipe-table line cleanly. Format matches what a designer would
 * paste into a brief doc: H3 per row, then field/value pairs.
 */
function buildMarkdown() {
  const lines = ['# Product Input Brief', '']

  // Initiative Overview — umbrella thesis up top.
  lines.push(`## ${productInputOverview.title}`)
  lines.push('')
  lines.push('### Problem')
  lines.push(productInputOverview.problem)
  lines.push('')
  lines.push('### Hypothesis')
  lines.push(productInputOverview.hypothesis)
  lines.push('')

  const writeGroups = (heading, items) => {
    if (!items?.length) return
    lines.push(heading)
    const groups = groupByKind(items)
    for (const group of groups) {
      lines.push(`#### ${kindLabel(group.kind)}`)
      for (const item of group.items) lines.push(`- ${item.text}`)
      lines.push('')
    }
  }
  writeGroups('### Assumptions', productInputOverview.assumptions)
  writeGroups('### Constraints', productInputOverview.constraints)

  lines.push('---')
  lines.push('')

  // Initiative Context — audience scope.
  const industries = (productInputContext.industries || []).includes('All')
    ? 'All'
    : (productInputContext.industries || []).join(', ')
  lines.push(`**Verticals / Industries:** ${industries}`)
  lines.push(`**Size:** ${productInputContext.size.join(', ')}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  if (!productInput.length) {
    lines.push('_No problem-capability clusters yet._')
    return lines.join('\n')
  }

  productInput.forEach((row, idx) => {
    lines.push(`## Cluster ${idx + 1} — ${row.persona.join(' & ')}`)
    lines.push('')
    lines.push(`**Persona:** ${row.persona.join(', ')}`)
    lines.push(`**Org / Product Impact:** ${row.impact.join(', ')}`)
    lines.push('')
    lines.push('### Problem / Gap')
    lines.push(row.problem)
    lines.push('')
    lines.push('### Capabilities Needed')
    for (const cap of row.capabilities) {
      const priority = capPriority(cap)
      const prefix = priority ? `**[${priority}]** ` : ''
      lines.push(`- ${prefix}${capText(cap)}`)
    }
    lines.push('')
    lines.push('---')
    lines.push('')
  })
  return lines.join('\n')
}

async function copyAsMarkdown() {
  try {
    await navigator.clipboard.writeText(buildMarkdown())
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('[ProductInputTable] Failed to copy:', err)
  }
}

function downloadMarkdown() {
  const blob = new Blob([buildMarkdown()], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'product-input.md'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
