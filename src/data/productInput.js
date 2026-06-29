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
  title: '[Initiative title]',
  problem:
    '[Parent problem statement — describe the umbrella gap that every cluster below shares. Who feels it, where, and what does it cost them?]',
  hypothesis:
    '[What you believe will happen once the clusters ship together. Tie to a growth lever (acquisition, retention, upsell) where possible.]',
  assumptions: [
    { kind: 'TECHNICAL', text: '[Technical assumption — platform / architecture / performance limit you\'re relying on.]' },
    { kind: 'DEPENDENCY', text: '[Dependency assumption — third-party service or other team\'s deliverable you\'re counting on.]' },
    { kind: 'OTHER', text: '[Behavioural / business assumption — something about users or context you\'re taking as given.]' },
  ],
  constraints: [
    { kind: 'TIMELINE', text: '[Timeline constraint — date, deadline, or sequencing pressure.]' },
    { kind: 'REFACTOR', text: '[Refactor in flight that affects this work — coordinate with whoever owns it.]' },
    { kind: 'SCOPE', text: '[Scope boundary — what\'s explicitly in or out of this push.]' },
    { kind: 'DEPENDENCY', text: '[Dependency constraint — service or team this work is gated on.]' },
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
  size: ['SMB', 'UPMARKET'],
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
    id: 'placeholder-cluster-1',
    persona: ['CONSUMPTION'],
    problem:
      '[Persona-specific framing of the parent problem — what does this audience hit, in their own words? Be specific.]',
    capabilities: [
      { priority: 'P0', text: '[P0 capability — must-have for the prototype to be meaningful.]' },
      { priority: 'P0', text: '[Another P0 capability.]' },
      { priority: 'P1', text: '[P1 capability — important but not table-stakes.]' },
      { priority: 'P2', text: '[P2 capability — nice-to-have / stretch.]' },
    ],
    impact: ['RETENTION'],
  },
  {
    id: 'placeholder-cluster-2',
    persona: ['CREATION'],
    problem:
      '[Persona-specific framing of the parent problem for the creation-side audience.]',
    capabilities: [
      { priority: 'P0', text: '[P0 capability.]' },
      { priority: 'P0', text: '[P0 capability.]' },
      { priority: 'P1', text: '[P1 capability.]' },
      { priority: 'P2', text: '[P2 capability.]' },
    ],
    impact: ['NEW ACQUISITION', 'UPSELL'],
  },
]
