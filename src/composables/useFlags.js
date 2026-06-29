import { ref, computed, readonly, reactive } from 'vue'
import flagsConfig from '../../flags.config.js'

/**
 * Feature Flag Composable
 * =======================
 * Reactive feature flag system driven by flags.config.js.
 *
 * Supports in-memory overrides from the Phase Map overlay.
 * Overrides update the prototype in real-time but do not persist —
 * they reset on browser refresh. Use exportOverrides() to get a
 * copyable config ready to paste into Claude Code.
 */

// ── In-memory overrides (singleton, shared across all components) ──

const overrides = reactive({
  features: {},   // { featureId: phaseKey }
  stories: {},    // { 'featureId.storyId': phaseKey }
})

const hasOverrides = computed(() => {
  return Object.keys(overrides.features).length > 0
    || Object.keys(overrides.stories).length > 0
})

// ── Selected phase (cumulative visibility) ──

const initialSelected = (flagsConfig.activePhases || []).reduce((best, key) => {
  const order = flagsConfig.phases[key]?.order ?? -1
  return order > (flagsConfig.phases[best]?.order ?? -1) ? key : best
}, flagsConfig.activePhases?.[0] || Object.keys(flagsConfig.phases)[0])

const selectedPhaseKey = ref(initialSelected)

const activePhaseKeys = computed(() => {
  const selectedOrder = flagsConfig.phases[selectedPhaseKey.value]?.order ?? 0
  const keys = Object.entries(flagsConfig.phases)
    .filter(([, p]) => p.order <= selectedOrder)
    .map(([key]) => key)
  return new Set(keys)
})

// Sorted phase entries
const sortedPhases = Object.entries(flagsConfig.phases)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key, value]) => ({ key, ...value }))

export function useFlags() {
  const phases = sortedPhases

  const activePhases = computed(() => Array.from(activePhaseKeys.value))

  const selectPhase = (phaseKey) => {
    selectedPhaseKey.value = phaseKey
  }

  const selectedPhase = computed(() => selectedPhaseKey.value)

  const isPhaseActive = (phaseKey) => {
    return activePhaseKeys.value.has(phaseKey)
  }

  // ── Phase resolution (with override support) ──────────────

  /**
   * Check if a story has an explicit phase (detached from parent).
   * Stories with no `phase` property inherit from their feature.
   */
  const isStoryDetached = (featureId, storyId) => {
    return !!flagsConfig.features[featureId]?.stories?.[storyId]?.phase
      || !!overrides.stories[`${featureId}.${storyId}`]
  }

  const resolvePhaseKey = (path) => {
    const parts = path.split('.')
    const featureId = parts[0]
    const storyId = parts[1]

    const feature = flagsConfig.features[featureId]
    if (!feature) return null

    if (storyId) {
      // Story override takes priority
      if (overrides.stories[`${featureId}.${storyId}`]) {
        return overrides.stories[`${featureId}.${storyId}`]
      }
      // Explicit phase in config = detached, doesn't follow feature override
      if (feature.stories?.[storyId]?.phase) {
        return feature.stories[storyId].phase
      }
      // Inherits: use feature override if present, else feature config phase
      return overrides.features[featureId] || feature.phase
    }

    // Feature level
    return overrides.features[featureId] || feature.phase
  }

  const phaseOf = (path) => {
    const key = resolvePhaseKey(path)
    if (!key) return null
    return { key, ...flagsConfig.phases[key] }
  }

  // ── Visibility checks ─────────────────────────────────────

  const isActive = (path) => {
    const key = resolvePhaseKey(path)
    if (!key) return false
    return activePhaseKeys.value.has(key)
  }

  // ── Bulk queries ──────────────────────────────────────────

  const annotatedFeatures = computed(() => {
    return Object.entries(flagsConfig.features).map(([id, feature]) => {
      const phase = phaseOf(id)
      const stories = Object.entries(feature.stories || {}).map(([storyId, story]) => {
        const storyPhase = phaseOf(`${id}.${storyId}`)
        return {
          id: storyId,
          fullId: `${id}.${storyId}`,
          ...story,
          phase: storyPhase,
          active: storyPhase ? activePhaseKeys.value.has(storyPhase.key) : false,
        }
      })
      return {
        id,
        ...feature,
        phase,
        active: phase ? activePhaseKeys.value.has(phase.key) : false,
        stories,
      }
    })
  })

  // ── Override management (Phase Map overlay) ───────────────

  /**
   * Get the effective phase for a feature (with overrides applied).
   */
  const getEffectiveFeaturePhase = (featureId) => {
    return overrides.features[featureId] || flagsConfig.features[featureId]?.phase || null
  }

  /**
   * Get the effective phase for a story (with overrides applied).
   * Inheriting stories follow feature overrides. Detached stories don't.
   */
  const getEffectiveStoryPhase = (featureId, storyId) => {
    // Story override takes priority
    if (overrides.stories[`${featureId}.${storyId}`]) {
      return overrides.stories[`${featureId}.${storyId}`]
    }
    // Detached: has explicit phase in config
    if (flagsConfig.features[featureId]?.stories?.[storyId]?.phase) {
      return flagsConfig.features[featureId].stories[storyId].phase
    }
    // Inheriting: follows feature (including feature override)
    return overrides.features[featureId]
      || flagsConfig.features[featureId]?.phase
      || null
  }

  /**
   * Move a feature to a different phase (in-memory only).
   */
  const overrideFeaturePhase = (featureId, newPhase) => {
    // Capture current state before changing anything
    const previousFeaturePhase = getEffectiveFeaturePhase(featureId)
    const storyPhases = {}
    for (const storyId of Object.keys(flagsConfig.features[featureId]?.stories || {})) {
      storyPhases[storyId] = getEffectiveStoryPhase(featureId, storyId)
    }

    // Move the feature
    if (flagsConfig.features[featureId]?.phase === newPhase) {
      delete overrides.features[featureId]
    } else {
      overrides.features[featureId] = newPhase
    }

    // Stories that were at the feature's previous phase travel with it.
    for (const [storyId, wasAt] of Object.entries(storyPhases)) {
      if (wasAt === previousFeaturePhase) {
        const key = `${featureId}.${storyId}`
        const configPhase = flagsConfig.features[featureId]?.stories?.[storyId]?.phase
        if (!configPhase || configPhase === newPhase) {
          // Inheriting story, or config happens to match new phase — just delete override
          delete overrides.stories[key]
        } else {
          // Config has an explicit phase that differs — override to new phase so it travels
          overrides.stories[key] = newPhase
        }
      }
    }
  }

  /**
   * Move a story to a different phase (in-memory only).
   */
  const overrideStoryPhase = (featureId, storyId, newPhase) => {
    const key = `${featureId}.${storyId}`
    // Compare against current effective phase (includes overrides), not just config
    const currentEffective = getEffectiveStoryPhase(featureId, storyId)
    if (currentEffective === newPhase) return
    overrides.stories[key] = newPhase
  }

  /**
   * Clear all in-memory overrides.
   */
  const clearOverrides = () => {
    Object.keys(overrides.features).forEach(k => delete overrides.features[k])
    Object.keys(overrides.stories).forEach(k => delete overrides.stories[k])
  }

  /**
   * Collapse all stories back to their feature's current phase.
   * Clears all story overrides and effectively makes every story
   * that had a config-level explicit phase now override to its feature's phase.
   */
  const collapseAllStories = () => {
    // Clear existing story overrides
    Object.keys(overrides.stories).forEach(k => delete overrides.stories[k])

    // For stories with explicit phases in the config, override them
    // to their feature's effective phase so they collapse
    for (const [featureId, feature] of Object.entries(flagsConfig.features)) {
      const featurePhase = overrides.features[featureId] || feature.phase
      for (const [storyId, story] of Object.entries(feature.stories || {})) {
        if (story.phase && story.phase !== featurePhase) {
          overrides.stories[`${featureId}.${storyId}`] = featurePhase
        }
      }
    }
  }

  /**
   * Export overrides as the full updated features block — ready to paste into Claude Code.
   */
  const exportOverrides = () => {
    if (!hasOverrides.value) return null

    // Build the merged config with overrides applied
    const mergedFeatures = {}
    for (const [featureId, feature] of Object.entries(flagsConfig.features)) {
      const featurePhase = overrides.features[featureId] || feature.phase
      const mergedStories = {}
      for (const [storyId, story] of Object.entries(feature.stories || {})) {
        const storyOverride = overrides.stories[`${featureId}.${storyId}`]
        const explicitPhase = storyOverride || story.phase || null
        mergedStories[storyId] = { phase: explicitPhase }
      }
      mergedFeatures[featureId] = { label: feature.label, phase: featurePhase, stories: mergedStories }
    }

    // Generate the config block
    const lines = ['In flags.config.js, replace the features block with:\n']

    lines.push('  features: {')
    for (const [featureId, f] of Object.entries(mergedFeatures)) {
      lines.push(`    '${featureId}': {`)
      lines.push(`      label: '${f.label}',`)
      lines.push(`      phase: '${f.phase}',`)
      lines.push('      stories: {')
      for (const [storyId, s] of Object.entries(f.stories)) {
        if (s.phase) {
          lines.push(`        '${storyId}': { phase: '${s.phase}' },`)
        } else {
          lines.push(`        '${storyId}': {},`)
        }
      }
      lines.push('      },')
      lines.push('    },')
    }
    lines.push('  },')

    return lines.join('\n')
  }

  // ── Raw config access ─────────────────────────────────────

  const config = readonly(ref(flagsConfig))

  return {
    // Phase management
    phases,
    activePhases,
    selectedPhase,
    selectPhase,
    isPhaseActive,

    // Resolution
    phaseOf,
    resolvePhaseKey,

    // Visibility
    isActive,

    // Bulk
    annotatedFeatures,

    // Overrides (Phase Map)
    isStoryDetached,
    overrides: readonly(overrides),
    hasOverrides,
    getEffectiveFeaturePhase,
    getEffectiveStoryPhase,
    overrideFeaturePhase,
    overrideStoryPhase,
    clearOverrides,
    collapseAllStories,
    exportOverrides,

    // Raw
    config,
  }
}
