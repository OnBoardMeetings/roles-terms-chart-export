<template>
  <span
    v-if="phase"
    class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
    :style="{
      backgroundColor: phase.color + '1A',
      color: phase.color,
    }"
  >
    <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: phase.color }"></span>
    {{ phase.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useFlags } from '@/composables/useFlags'

const props = defineProps({
  /** Dotted path: 'feature-id' or 'feature-id.story-id' */
  path: { type: String, default: null },
})

const { phaseOf } = useFlags()

const phase = computed(() => {
  if (props.path) return phaseOf(props.path)
  return null
})
</script>
