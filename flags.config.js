/**
 * Feature Flag Configuration
 * ===========================
 * This is the PRIMARY file designers edit to control what's visible in the prototype.
 *
 * Schema: phases, features (with stories), and the active phase set.
 * Stories without an explicit `phase` inherit from their parent feature.
 * Stories with an explicit `phase` are "detached" — they stay put when the feature moves.
 * Phase selection is cumulative — selecting Phase 2 shows Phase 1 + Phase 2.
 * Selecting Future shows everything.
 *
 * The UI phase picker, documentation badges, and Phase Map overlay all
 * derive from this single file.
 */

export default {
  // ─── Phase Definitions ──────────────────────────────────────
  phases: {
    phase1:  { label: 'Phase 1',  color: '#3B82F6', order: 0 },
    phase2:  { label: 'Phase 2',  color: '#8B5CF6', order: 1 },
    future:  { label: 'Future',   color: '#6B7280', order: 2 },
  },

  // ─── Feature Assignments ───────────────────────────────────
  // Add features here. Each feature has a label, a phase, and a stories
  // map. Stories without an explicit `phase` inherit the parent's phase.
  //
  //   'my-feature': {
  //     label: 'My Feature',
  //     phase: 'phase1',
  //     stories: {
  //       'core-behavior': {},                      // inherits phase1
  //       'enhanced-behavior': { phase: 'phase2' }, // ships later
  //     },
  //   },
  features: {},

  // ─── Active Phases ─────────────────────────────────────────
  activePhases: ['phase1'],
}
