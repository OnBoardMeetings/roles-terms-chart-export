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
          <h3 class="text-xl font-semibold text-gray-900">Roles &amp; Terms — Visual Export</h3>
        </div>
        <div class="space-y-2 text-sm text-gray-600">
          <p><strong>Business Value:</strong> As OnBoard, we can let Admins produce and share board-ready Roles &amp; Terms visuals without leaving the platform, so governance data stays OnBoard-sourced — addressing a named retention commitment (Interra Credit Union) and strengthening governance-maturity positioning upmarket.</p>
          <p><strong>Customer Value:</strong> As an Organization Admin, I can export the Roles &amp; Terms view as a board-ready PDF or as Excel and either download it or save it straight into a resource folder, so I no longer rebuild the chart by hand before every board meeting.</p>
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
            <h4 class="font-semibold text-gray-900 mb-2">Usage &amp; Demand</h4>
            <ul class="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>~358 organizations/month actively use Roles &amp; Terms (26.7% of the 5,158 orgs with access).</li>
              <li>Interra Credit Union ($45.3K ARR, renewal 9/7/27) named the absence of a visual chart export as a top pain point — a CX-driven commitment risk this work mitigates.</li>
              <li>Benefit extends to the whole Roles &amp; Terms base, not just the driving account.</li>
              <li>Part of a planned series of visual-export improvements (Roles &amp; Terms first, then Assessments, then Skills Tracking).</li>
            </ul>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-2">User Research</h4>
            <ul class="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li><strong>Kelly "The Juggler" (Exec Admin, creation):</strong> recreates the chart by hand in an external tool before each board cycle — hours of effort and drift from source data.</li>
              <li><strong>Directors — Brian, Charlie, Cathy (consumption):</strong> receive a manually rebuilt approximation with version/quality variance instead of an OnBoard-sourced view.</li>
              <li>Long-tenured members (10+ years) extend the timeline and compound the manual effort — the sharpest fidelity concern.</li>
            </ul>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-2">Design Rationale — where the prototype adapts the brief</h4>
            <p class="text-sm text-gray-500 mb-3">The prototype is the source of truth; these are the deliberate departures from the lightweight brief.</p>
            <ul class="text-sm text-gray-600 list-disc pl-5 space-y-2">
              <li><strong>Unified Export modal over a separate Print/PDF button.</strong> The brief framed Excel as a separate, untouched export sitting beside a new visual action. We consolidated Excel and the visual PDF under one <em>Export</em> entry point — a cleaner, less cluttered toolbar. Excel behavior is preserved, just surfaced inside the modal.</li>
              <li><strong>Format &amp; destination are explicit user choices.</strong> The brief punted format (PDF vs. print) to engineering. The prototype makes format (Excel/PDF) and destination (Download / Save to Resources) deliberate, testable choices, because that experience is the risky, valuable part to validate.</li>
              <li><strong>Save to Resources — stay inside OnBoard.</strong> Beyond the brief's external-sharing framing, the prototype lets Admins save the export straight into a resource folder (mirroring the meeting-minutes Add-To-Resources flow). This targets the deeper goal: not doing governance work outside OnBoard.</li>
              <li><strong>Board-ready layout for the long-tenure concern.</strong> The PDF stacks the data table above a full-width, labeled timeline and fits the whole span to the page with a minimum bar width — so a 10+ year tenure renders complete <em>and</em> legible, avoiding "complete but unreadable."</li>
            </ul>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-2">Strategic Alignment</h4>
            <p class="text-sm text-gray-600"><strong>Objective:</strong> Move Upmarket — Bundled Governance Maturity (primary); Director Engagement (secondary). <strong>Lever:</strong> Retention — mitigates a named Interra CU commitment risk ahead of renewal, with benefit across the Roles &amp; Terms base.</p>
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
const storyContent = {
  'roles-terms-visual-export.export-active-view': {
    description:
      'As an Organization Admin, I can export the Roles & Terms view as Excel or PDF and either download it or save it into an OnBoard resource folder, so I can share board-ready governance data without leaving OnBoard.',
    acceptance: [
      'The Export action opens a modal with an "Export Type" dropdown (Excel or PDF) and a destination choice (Download or Save to Resources).',
      'Download delivers the file for the active view: Excel confirms with a toast; PDF opens the board-ready preview to print/save — both reflecting the filters/sort applied at that moment.',
      'Save to Resources opens an "Add To Resources" dialog (folder location, file name, notify members) mirroring the product\'s minutes flow, and confirms placement with a toast.',
    ],
  },
  'roles-terms-visual-export.legible-long-tenure': {
    description:
      'As an Organization Admin with long-tenured board members, I can export the chart so that a 10+ year tenure renders complete and readable on the page.',
    acceptance: [
      'The chart export fits the full date span to the page width with no horizontal scroll and no truncation or clipping of any tenure.',
      'Board members with 10+ years of service render their entire timeline; short or recent terms keep a minimum visible width rather than collapsing to hairlines.',
      'The table export omits editing controls (row ⋯ actions, add-by panel) and renders static column headers — content, not controls.',
    ],
  },
}

const featureCount = computed(() => annotatedFeatures.value.length)
const storyCount = computed(() =>
  annotatedFeatures.value.reduce((sum, f) => sum + f.stories.length, 0)
)
</script>
