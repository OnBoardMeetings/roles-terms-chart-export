<template>
  <div class="ux-documentation">
    <!-- Main Header with Tabs -->
    <div class="border-b border-gray-200 pb-6 mb-8">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">UX Documentation</h2>
      <p class="text-gray-600 max-w-3xl mb-6">
        Interactive documentation of UX patterns, behaviors, and acceptance criteria for this prototype.
      </p>

      <!-- Section Toggle -->
      <div class="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeSection = tab.id"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md transition-all duration-150',
            activeSection === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- OVERVIEW TAB                                  -->
    <!-- ============================================ -->
    <div v-show="activeSection === 'overview'" class="overview-section">
      <!-- Product Input — design-handoff brief. Rows live in
           src/data/productInput.js and are added by source edit
           (prototypes have no persistence). -->
      <ProductInputTable />
    </div>

    <!-- ============================================ -->
    <!-- FEATURES & STORIES TAB                        -->
    <!-- ============================================ -->
    <div v-show="activeSection === 'features'" class="features-section">
      <!-- Epic Header -->
      <div class="mb-10 p-6 bg-gradient-to-r from-primary-50 to-white rounded-xl border border-primary-100">
        <div class="flex items-center space-x-2 mb-3">
          <h3 class="text-xl font-semibold text-gray-900">Shape Canvas Prototype</h3>
        </div>
        <div class="space-y-2 text-sm text-gray-600">
          <p><strong>Business Value:</strong> As a design team, we can demonstrate progressive feature delivery through simple visual shapes, so that stakeholders understand how phased rollout works.</p>
          <p><strong>Customer Value:</strong> As a viewer, I can see shapes appear and gain interactivity across phases, so that I understand what each phase delivers.</p>
        </div>
        <div class="mt-4 flex items-center space-x-4 text-xs text-gray-500">
          <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded">In Progress</span>
          <span>{{ featureCount }} Features</span>
          <span>{{ storyCount }} Stories</span>
        </div>
      </div>

      <!-- Features driven by flags.config.js -->
      <template v-for="feature in annotatedFeatures" :key="feature.id">
        <FeatureEpic
          :title="feature.label"
          :description="`Phase: ${feature.phase?.label || 'Unassigned'}`"
        >
          <template v-for="story in feature.stories" :key="story.id">
            <div :class="isStoryActiveInSelectedPhase(story) ? '' : 'opacity-40'" class="transition-opacity duration-200">
            <FeatureStory
              :id="story.fullId"
              :title="story.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())"
              status="pending"
              :tags="[story.phase?.label || 'unassigned']"
            >
              <template #description>
                {{ storyContent[story.fullId]?.description || 'As a user, I can [action] so that [benefit].' }}
              </template>
              <template #acceptance>
                <li
                  v-for="(ac, idx) in (storyContent[story.fullId]?.acceptance || ['Acceptance criterion 1', 'Acceptance criterion 2'])"
                  :key="idx"
                >
                  {{ ac }}
                </li>
              </template>
            </FeatureStory>
            </div>
          </template>
        </FeatureEpic>
      </template>

      <!-- Empty state if no features defined -->
      <div v-if="annotatedFeatures.length === 0" class="text-center py-16 text-gray-400">
        <p class="text-lg mb-2">No features defined yet</p>
        <p class="text-sm">Add features and stories to <code class="bg-gray-100 px-1 rounded">flags.config.js</code> to see them here.</p>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- SUPPORTING RESEARCH TAB                       -->
    <!-- ============================================ -->
    <div v-show="activeSection === 'research'" class="research-section">
      <div class="prose max-w-none">
        <div class="p-6 bg-white rounded-xl border border-gray-200 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Supporting Research</h3>
          <p class="text-sm text-gray-600">
            Capture competitive analysis, user research findings, stakeholder feedback, and design rationale that inform this prototype.
          </p>
        </div>

        <div class="space-y-4">
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-2">Competitive Analysis</h4>
            <p class="text-sm text-gray-500">[Add screenshots, links, and notes about how competitors handle this problem space.]</p>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-2">User Research</h4>
            <p class="text-sm text-gray-500">[Add interview findings, survey data, usability test results, or persona insights.]</p>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-2">Design Rationale</h4>
            <p class="text-sm text-gray-500">[Document key design decisions and the reasoning behind them. Why this approach over alternatives?]</p>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-2">Stakeholder Feedback</h4>
            <p class="text-sm text-gray-500">[Capture feedback from reviews, demos, and alignment sessions.]</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FeatureEpic from './FeatureEpic.vue'
import FeatureStory from './FeatureStory.vue'
import ProductInputTable from './ProductInputTable.vue'
import PhaseBadge from '@/components/flags/PhaseBadge.vue'
import { useFlags } from '@/composables/useFlags'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features & Stories' },
  { id: 'research', label: 'Supporting Research' },
]

const activeSection = ref('overview')

const { phases, selectedPhase, annotatedFeatures, config, isPhaseActive } = useFlags()

const isStoryActiveInSelectedPhase = (story) => {
  if (!story.phase?.key) return false
  return isPhaseActive(story.phase.key)
}

// Phase map helpers
const featuresInPhase = (phaseKey) => {
  return Object.entries(config.value.features || {})
    .filter(([, f]) => f.phase === phaseKey)
    .map(([id, f]) => ({ id, ...f }))
}

const phaseColor = (phaseKey) => {
  return config.value.phases[phaseKey]?.color || '#9CA3AF'
}

const phaseName = (phaseKey) => {
  return config.value.phases[phaseKey]?.label || phaseKey
}

// Story content — acceptance criteria following progressive refinement framework.
// Add entries keyed as 'feature-id.story-id' matching flags.config.js. Each entry
// has a user story description and a list of testable acceptance criteria with
// exact values (sizes, colors, timings).
const storyContent = {}

const featureCount = computed(() => annotatedFeatures.value.length)
const storyCount = computed(() =>
  annotatedFeatures.value.reduce((sum, f) => sum + f.stories.length, 0)
)
</script>
