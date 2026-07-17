/**
 * Product Input — One row per problem-capability cluster.
 *
 * Surfaces in the Overview tab of UX Documentation as a read-only
 * table. Designers consume this as the brief for prototyping —
 * "what's broken, what should the product do, who is it for."
 *
 * Prototype has no persistence: rows are added by editing this file.
 * When a stakeholder describes a new problem-capability cluster,
 * append a new entry here and commit.
 */

/**
 * Closed set: vertical / industry. Mirrors OnBoard's customer
 * vertical taxonomy. `'All'` covers prototypes that aren't tied
 * to a specific vertical.
 */
export const INDUSTRIES = [
  'All',
  'Associations',
  'Higher Education',
  'Financial Services',
  'Nonprofits',
  'Government',
  'Technology & Software',
  'Healthcare',
]

/** Closed set: business size each row applies to. */
export const SIZES = ['SMB', 'UPMARKET']

/** Closed set: persona archetype each row applies to. */
export const PERSONAS = ['CREATION', 'CONSUMPTION']

/** Closed set: which org/product lever the work moves. */
export const IMPACTS = ['NEW ACQUISITION', 'RETENTION', 'UPSELL']

/**
 * Closed set: capability priority. P0 = must-have for the prototype
 * to be meaningful; P1 = important but not table-stakes; P2 = nice-to-
 * have / stretch. A capability without a priority renders as
 * un-tagged.
 */
export const PRIORITIES = ['P0', 'P1', 'P2']

/**
 * Closed set: kind tag for an assumption or constraint. Used by the
 * Initiative card to colour-code items so a reader can scan for
 * "where's the timeline?" or "what services are we depending on?"
 * at a glance.
 *
 *   TIMELINE   — dates, deadlines, sequencing
 *   DEPENDENCY — third-party services, other teams' deliverables
 *   REFACTOR   — product or code in flight that affects this work
 *   TECHNICAL  — platform, architecture, performance limits
 *   SCOPE      — what's explicitly in or out
 *   OTHER      — catch-all
 */
export const CONSTRAINT_KINDS = [
  'TIMELINE',
  'DEPENDENCY',
  'REFACTOR',
  'TECHNICAL',
  'SCOPE',
  'OTHER',
]

/**
 * Tailwind class lookup per chip value. Each entry pairs a soft fill
 * (`bg-{color}-100`) with a darker text/accent (`text-{color}-700`)
 * so the chips read at a glance without competing with the
 * surrounding chrome. Used by ProductInputTable.
 *
 * SIZES are intentionally rendered as outline chips (no background)
 * so the cluster reads as "context tag" rather than "lever pulled."
 */
export const CHIP_COLORS = {
  // Sizes — outline only. The component renders these without a
  // bg fill, so we only declare the text token here.
  'SMB':              { fill: '',                text: 'text-slate-600',  border: 'border-slate-300' },
  'UPMARKET':         { fill: '',                text: 'text-slate-600',  border: 'border-slate-300' },

  // Personas — paired purple/sky to read as a complementary pair.
  'CREATION':         { fill: 'bg-purple-100',   text: 'text-purple-700', border: 'border-purple-200' },
  'CONSUMPTION':      { fill: 'bg-sky-100',      text: 'text-sky-700',    border: 'border-sky-200' },

  // Impact levers — one color per growth lever so they read distinct
  // when a row carries multiple at once.
  'NEW ACQUISITION':  { fill: 'bg-violet-100',   text: 'text-violet-700', border: 'border-violet-200' },
  'RETENTION':        { fill: 'bg-emerald-100',  text: 'text-emerald-700',border: 'border-emerald-200' },
  'UPSELL':           { fill: 'bg-amber-100',    text: 'text-amber-800',  border: 'border-amber-200' },

  // Capability priority — heat scale. P0 reads as urgent (rose),
  // P1 as warm (orange), P2 as cool/quiet (slate).
  'P0':               { fill: 'bg-rose-100',     text: 'text-rose-700',   border: 'border-rose-200' },
  'P1':               { fill: 'bg-orange-100',   text: 'text-orange-700', border: 'border-orange-200' },
  'P2':               { fill: 'bg-slate-100',    text: 'text-slate-600',  border: 'border-slate-200' },

  // Assumption / constraint kinds — distinct hues so a reader can
  // scan the Initiative card by category at a glance.
  'TIMELINE':         { fill: 'bg-fuchsia-100',  text: 'text-fuchsia-700',border: 'border-fuchsia-200' },
  'DEPENDENCY':       { fill: 'bg-cyan-100',     text: 'text-cyan-700',   border: 'border-cyan-200' },
  'REFACTOR':         { fill: 'bg-indigo-100',   text: 'text-indigo-700', border: 'border-indigo-200' },
  'TECHNICAL':        { fill: 'bg-teal-100',     text: 'text-teal-700',   border: 'border-teal-200' },
  'SCOPE':            { fill: 'bg-yellow-100',   text: 'text-yellow-800', border: 'border-yellow-200' },
  'OTHER':            { fill: 'bg-stone-100',    text: 'text-stone-700',  border: 'border-stone-200' },
}

/**
 * @typedef {Object} CapabilityItem
 * @property {string} text         Bullet text — what the product needs to do.
 * @property {('P0'|'P1'|'P2')} [priority]  Optional priority chip; omit for un-tagged.
 */

/**
 * @typedef {Object} ConstraintItem
 * @property {('TIMELINE'|'DEPENDENCY'|'REFACTOR'|'TECHNICAL'|'SCOPE'|'OTHER')} [kind]  Optional category chip.
 * @property {string} text  The body of the assumption or constraint.
 */

/**
 * Initiative-level overview — answers "what is this prototype trying
 * to solve, what do we believe will happen if we solve it, what are
 * we taking as given, and what's in our way?" The umbrella thesis
 * that ties the per-persona clusters together.
 *
 * Assumptions are things we're presuming will hold true. Constraints
 * are things explicitly limiting the work — deadlines, dependencies,
 * adjacent refactors, scope decisions.
 *
 * @typedef {Object} ProductInputOverview
 * @property {string} title       Short name for the initiative.
 * @property {string} problem     Parent problem statement — the gap all clusters share.
 * @property {string} hypothesis  What we believe solving the clusters together unlocks.
 * @property {ConstraintItem[]} assumptions  Things we're taking as given.
 * @property {ConstraintItem[]} constraints  Things limiting the work.
 */

/**
 * Initiative-level context — set once per prototype. Verticals and
 * size apply to the whole initiative; rows in `productInput` are
 * problem-capability clusters within that scope, varying by persona.
 *
 * `industries` is an array so a prototype can target multiple
 * specific verticals (e.g. `['Healthcare', 'Government']`). Use
 * `['All']` as a sentinel for prototypes that aren't tied to any
 * one vertical — when present it overrides any others.
 *
 * @typedef {Object} ProductInputContext
 * @property {Array<'All'|'Associations'|'Higher Education'|'Financial Services'|'Nonprofits'|'Government'|'Technology & Software'|'Healthcare'>} industries  Subset of INDUSTRIES (or `['All']`).
 * @property {Array<'SMB'|'UPMARKET'>} size  Subset of SIZES.
 */

/**
 * @typedef {Object} ProductInputRow
 * @property {string} id          Stable kebab-case identifier (anchor hash, table key).
 * @property {Array<'CREATION'|'CONSUMPTION'>} persona  Subset of PERSONAS — who feels this problem.
 * @property {string} problem     Persona-specific framing of the gap. Be specific, be opinionated.
 * @property {CapabilityItem[]} capabilities  Bulleted capabilities, each optionally tagged with a priority.
 * @property {Array<'NEW ACQUISITION'|'RETENTION'|'UPSELL'>} impact  Subset of IMPACTS.
 */

/**
 * Initiative-level overview for this prototype. Answers "what are
 * we solving and why" — the umbrella narrative the per-cluster rows
 * below are facets of.
 *
 * @type {ProductInputOverview}
 */
export const productInputOverview = {
  title: 'Roles & Terms Chart View — Visual Export',
  problem:
    'Organization Admins (Kelly "The Juggler") can view a rich Roles & Terms chart of every board member\'s terms and tenure overlaps, but the only export is a raw Excel file — there is no way to produce or share a board-ready visual from OnBoard. Admins rebuild the chart by hand in an external tool before each board meeting (Interra Credit Union reports hours per cycle). ~358 organizations/month actively use Roles & Terms, and long-tenured members (10+ years) make the manual effort worse.',
  hypothesis:
    'If Admins can export the Roles & Terms view as a board-ready visual — and either download it or save it straight into an OnBoard resource folder — they will stop recreating the chart externally, cutting hours per meeting cycle and keeping governance data OnBoard-sourced. This addresses a named retention risk (Interra CU) and strengthens governance-maturity positioning upmarket.',
  assumptions: [
    { kind: 'TECHNICAL', text: 'The in-product chart and table can be rendered to a faithful print/PDF layout — all names, roles, term dates, and overlaps — including 10+ year spans without truncation.' },
    { kind: 'DEPENDENCY', text: 'The in-OnBoard save path reuses the existing Resources folder system (the Add To Resources flow used by meeting minutes).' },
    { kind: 'OTHER', text: 'Admins produce board materials; directors (Brian, Charlie, Cathy) are consumption personas who receive the output at meetings.' },
  ],
  constraints: [
    { kind: 'SCOPE', text: 'No redesign of the in-product Roles & Terms chart/table — only the export experience and the export-output layout.' },
    { kind: 'SCOPE', text: 'Admin-only. No export for Member, Contributor, or Reader roles.' },
    { kind: 'SCOPE', text: 'Adaptation from brief: the brief framed Excel as a separate, unchanged export; the prototype folds Excel and the new visual PDF into one unified Export modal. Excel behavior is preserved, just surfaced within the modal.' },
    { kind: 'DEPENDENCY', text: 'How the file is actually generated (PDF renderer vs. browser print) is an engineering implementation detail — the prototype defines the experience, not the renderer.' },
    { kind: 'TIMELINE', text: 'CX-driven commitment tied to Interra Credit Union renewal (9/7/27).' },
  ],
}

/**
 * Initiative-level context for this prototype. One value per
 * prototype — the rows below are problem-capability clusters
 * within this audience.
 *
 * @type {ProductInputContext}
 */
export const productInputContext = {
  industries: ['All'],
  size: ['UPMARKET'],
}

/**
 * Problem-capability clusters for this initiative. Replace these
 * placeholders with real clusters as stakeholders describe them.
 * The template ships with one row per persona archetype so designers
 * can preview the layout on first run; delete or rewrite them when
 * starting a real prototype.
 *
 * @type {ProductInputRow[]}
 */
export const productInput = [
  {
    id: 'admin-produce-export',
    persona: ['CREATION'],
    problem:
      'Kelly can see the full Roles & Terms chart in OnBoard but cannot produce a board-ready visual from it — the only export is raw Excel. So before every board meeting she rebuilds the chart by hand in an external tool, a workflow that costs hours per cycle and drifts from the source data.',
    capabilities: [
      { priority: 'P0', text: 'From one Export action on the Roles & Terms view, choose the format — visual PDF or Excel — for whichever view is active (chart or table).' },
      { priority: 'P0', text: 'Choose the destination: download to device, or save directly into an OnBoard resource folder without leaving OnBoard.' },
      { priority: 'P0', text: 'The board-ready PDF renders the full roster and timeline with 10+ year tenures complete and legible — no truncation, no hairline bars.' },
      { priority: 'P1', text: 'Clear confirmation after the action — a toast on download, and on save into a named resource folder.' },
      { priority: 'P2', text: 'Name the file when saving to Resources so it lands with a meaningful title.' },
    ],
    impact: ['RETENTION'],
  },
  {
    id: 'director-consume-output',
    persona: ['CONSUMPTION'],
    problem:
      'Directors (Brian "The Expert", Charlie "The Facilitator", Cathy "The Leader") receive the Roles & Terms picture at board meetings. Today it is a manually recreated approximation that can carry version and quality variance rather than an accurate, OnBoard-sourced view.',
    capabilities: [
      { priority: 'P0', text: 'Receive an accurate, OnBoard-sourced visual of board composition, roles, terms, and overlaps — not a hand-rebuilt approximation.' },
      { priority: 'P1', text: 'Long-serving members\' complete tenure timelines render fully so succession and term continuity are readable at a glance.' },
    ],
    impact: ['RETENTION'],
  },
]
