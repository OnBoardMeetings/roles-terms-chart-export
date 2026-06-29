<template>
  <div class="bg-gray-100 rounded-2xl p-1 shadow-xl border border-gray-200">
    <!-- Chrome Header -->
    <div class="bg-gray-100 rounded-t-xl px-4 py-2.5 flex items-center justify-center">
      <div class="bg-white rounded px-4 py-1 text-xs text-gray-500 font-medium">
        Scenario Explorer
      </div>
    </div>

    <!-- Content -->
    <div class="h-[calc(100vh-16rem)] bg-white rounded-xl overflow-hidden flex flex-col">
      <div class="flex-1 overflow-y-auto scrollbar-thin p-4">
        <!-- Group scenarios by phase -->
        <template v-for="phase in phases" :key="phase.key">
          <div v-if="scenariosForPhase(phase.key).length > 0 && isPhaseActive(phase.key)" class="mb-6">
            <!-- Phase header -->
            <div class="flex items-center space-x-2 mb-3">
              <div class="h-px flex-1" :style="{ backgroundColor: phase.color + '40' }"></div>
              <span
                class="text-xs font-medium uppercase tracking-wide flex items-center gap-1.5"
                :style="{ color: phase.color }"
              >
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: phase.color }"></span>
                {{ phase.label }}
              </span>
              <div class="h-px flex-1" :style="{ backgroundColor: phase.color + '40' }"></div>
            </div>

            <!-- Scenario cards -->
            <div class="space-y-3">
              <div
                v-for="scenario in scenariosForPhase(phase.key)"
                :key="scenario.id"
                @click="$emit('load-scenario', scenario.id)"
                :class="[
                  'p-4 border rounded-lg cursor-pointer transition-all',
                  currentScenarioId === scenario.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                ]"
              >
                <div class="flex items-start justify-between mb-1">
                  <h3 class="font-semibold text-gray-900">{{ scenario.title }}</h3>
                  <PhaseBadge :scenario-id="scenario.id" />
                </div>
                <p class="text-sm text-gray-600">{{ scenario.description }}</p>
              </div>
            </div>
          </div>
        </template>

        <!-- Untagged scenarios (not in flags.config.js) -->
        <div v-if="untaggedScenarios.length > 0" class="mb-6">
          <div class="flex items-center space-x-2 mb-3">
            <div class="h-px flex-1 bg-gray-200"></div>
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Untagged</span>
            <div class="h-px flex-1 bg-gray-200"></div>
          </div>
          <div class="space-y-3">
            <div
              v-for="scenario in untaggedScenarios"
              :key="scenario.id"
              @click="$emit('load-scenario', scenario.id)"
              :class="[
                'p-4 border rounded-lg cursor-pointer transition-all',
                currentScenarioId === scenario.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              ]"
            >
              <h3 class="font-semibold text-gray-900 mb-1">{{ scenario.title }}</h3>
              <p class="text-sm text-gray-600">{{ scenario.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { scenarios } from '@/data/scenarios.js'
import { useFlags } from '@/composables/useFlags'
import PhaseBadge from '@/components/flags/PhaseBadge.vue'

const props = defineProps({
  currentScenarioId: String,
})

defineEmits(['load-scenario'])

const { phases, isPhaseActive, config } = useFlags()

// Group scenarios by their phase assignment from flags.config.js
const scenariosForPhase = (phaseKey) => {
  return scenarios.filter((s) => {
    const entry = config.value.scenarios[s.id]
    const assignedPhase = entry?.phase || null
    return assignedPhase === phaseKey
  })
}

// Scenarios not listed in flags.config.js
const untaggedScenarios = computed(() => {
  return scenarios.filter((s) => !config.value.scenarios[s.id])
})
</script>
