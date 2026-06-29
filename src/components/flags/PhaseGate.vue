<template>
  <slot v-if="visible" />
</template>

<script setup>
import { computed } from 'vue'
import { useFlags } from '@/composables/useFlags'

const props = defineProps({
  /** Dotted path: 'feature-id' or 'feature-id.story-id' */
  path: { type: String, default: null },
  /** Direct phase key check */
  phase: { type: String, default: null },
})

const { isActive, isPhaseActive } = useFlags()

const visible = computed(() => {
  if (props.path) return isActive(props.path)
  if (props.phase) return isPhaseActive(props.phase)
  return true
})
</script>
