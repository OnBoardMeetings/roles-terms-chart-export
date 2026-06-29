<template>
  <div class="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
    <button
      v-for="phase in phases"
      :key="phase.key"
      @click="selectPhase(phase.key)"
      :class="[
        'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-150 flex items-center gap-1.5',
        selectedPhase === phase.key
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      ]"
    >
      <span
        class="w-2 h-2 rounded-full flex-shrink-0"
        :style="{ backgroundColor: phase.color }"
      ></span>
      {{ phase.label }}
    </button>
  </div>
</template>

<script setup>
import { useFlags } from '@/composables/useFlags'

const { phases, selectedPhase, selectPhase } = useFlags()
</script>
