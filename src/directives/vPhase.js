import { useFlags } from '@/composables/useFlags'
import { watchEffect } from 'vue'

/**
 * v-phase directive
 * =================
 * Show/hide elements based on active phases.
 *
 * Usage:
 *   <div v-phase="'phase1'">Only visible when phase1 is active</div>
 *   <div v-phase="'example-feature.story-1'">Tied to a feature/story path</div>
 */
export const vPhase = {
  mounted(el, binding) {
    const { isActive, isPhaseActive } = useFlags()
    const originalDisplay = el.style.display

    const update = () => {
      const value = binding.value
      // Check if it's a phase key directly, or a feature.story path
      const visible = isPhaseActive(value) || isActive(value)
      el.style.display = visible ? originalDisplay : 'none'
    }

    // Store cleanup for unmount
    el.__phaseCleanup = watchEffect(update)
  },

  updated(el, binding) {
    // Re-evaluate when binding value changes
    if (el.__phaseCleanup) {
      el.__phaseCleanup()
    }
    const { isActive, isPhaseActive } = useFlags()
    const originalDisplay = el.__originalDisplay || ''

    el.__phaseCleanup = watchEffect(() => {
      const value = binding.value
      const visible = isPhaseActive(value) || isActive(value)
      el.style.display = visible ? originalDisplay : 'none'
    })
  },

  unmounted(el) {
    if (el.__phaseCleanup) {
      el.__phaseCleanup()
    }
  },
}
