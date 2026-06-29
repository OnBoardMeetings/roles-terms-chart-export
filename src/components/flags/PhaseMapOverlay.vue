<template>
  <transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="visible" class="fixed inset-0 z-[90] flex flex-col">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

      <!-- Panel -->
      <div class="relative z-10 m-6 mt-16 flex-1 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-5rem)]">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 class="text-base font-semibold text-gray-900">Phase Map</h2>
            <p class="text-xs text-gray-400 mt-0.5">Drag features between phases. Click a feature to expand and move individual stories.</p>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="hasOverrides" class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">
              {{ overrideCount }} session {{ overrideCount === 1 ? 'change' : 'changes' }}
            </span>
            <button
              v-if="hasOverrides"
              @click="handleCopy"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ copied ? 'Copied' : 'Copy for Claude' }}
            </button>
            <button
              @click="collapseStories"
              class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors"
            >
              Collapse Stories
            </button>
            <button
              v-if="hasOverrides"
              @click="clearOverrides"
              class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              @click="$emit('close')"
              class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <!-- Phase columns -->
        <!-- Rejection notice -->
        <transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="rejectDrop" class="mx-6 mt-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
            A story can't be placed before its feature
          </div>
        </transition>

        <div class="flex-1 overflow-x-auto overflow-y-auto p-6">
          <div class="flex gap-4 min-h-full" :style="{ minWidth: (phases.length * 220) + 'px' }">
            <div
              v-for="phase in phases"
              :key="phase.key"
              class="flex-1 min-w-[200px] flex flex-col rounded-xl border-2 transition-colors duration-150"
              :class="dropTarget === phase.key ? 'border-primary-400 bg-primary-50/50' : 'border-gray-200 bg-gray-50/50'"
              @dragover.prevent="dropTarget = phase.key"
              @dragleave="dropTarget = null"
              @drop.prevent="handleDrop(phase.key)"
            >
              <!-- Phase column header -->
              <div
                class="px-4 py-3 flex items-center gap-2 rounded-t-lg flex-shrink-0"
                :style="{ backgroundColor: phase.color + '15' }"
              >
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: phase.color }"></span>
                <span class="text-sm font-semibold" :style="{ color: phase.color }">{{ phase.label }}</span>
              </div>

              <!-- Items -->
              <div class="flex-1 p-2 space-y-1.5 min-h-[80px]">
                <template v-for="item in itemsInPhase(phase.key)" :key="item.id">

                  <!-- Feature card -->
                  <div
                    v-if="item.type === 'feature'"
                    class="rounded-lg border bg-white transition-all"
                    :class="[
                      item.modified ? 'ring-1 ring-amber-300' : '',
                      expandedFeatures.has(item.featureId) ? 'border-gray-300 shadow-sm' : 'border-gray-100',
                    ]"
                  >
                    <!-- Feature header (draggable) -->
                    <div
                      v-if="item.type === 'feature'"
                      draggable="true"
                      @dragstart="handleDragStart(item, $event)"
                      @dragend="handleDragEnd"
                      class="flex items-center gap-2 px-3 py-2 text-xs cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-t-lg transition-colors"
                      @click.prevent="item.storyCount > 0 && toggleExpand(item.featureId)"
                    >
                      <span class="w-4 h-4 rounded bg-gray-200 text-[9px] font-bold text-gray-500 flex items-center justify-center flex-shrink-0">F</span>
                      <span class="font-medium text-gray-700 truncate flex-1">{{ item.label }}</span>
                      <!-- Expand chevron (only if has stories) -->
                      <template v-if="item.storyCount > 0">
                        <span class="text-[10px] text-gray-300">{{ item.storyCount }}</span>
                        <svg
                          class="w-3 h-3 text-gray-300 flex-shrink-0 transition-transform duration-150"
                          :class="expandedFeatures.has(item.featureId) ? 'rotate-90' : ''"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </template>
                      <span v-if="item.modified" class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    </div>

                    <!-- Expanded: individual stories (each draggable) -->
                    <div
                      v-if="item.type === 'feature' && expandedFeatures.has(item.featureId)"
                      class="px-2 pb-2 space-y-1 border-t border-gray-100"
                    >
                      <div
                        v-for="story in storiesForFeature(item.featureId)"
                        :key="story.id"
                        draggable="true"
                        @dragstart.stop="handleDragStart(story, $event)"
                        @dragend="handleDragEnd"
                        :class="[
                          'flex items-center gap-1.5 text-[11px] px-2 py-1.5 rounded transition-colors',
                          story.diverged
                            ? 'opacity-40 cursor-default'
                            : 'cursor-grab active:cursor-grabbing hover:bg-gray-50',
                          story.modified ? 'ring-1 ring-amber-300' : '',
                        ]"
                        :draggable="!story.diverged"
                      >
                        <span class="w-3.5 h-3.5 rounded text-[8px] font-bold flex items-center justify-center flex-shrink-0" :class="story.diverged ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-400'">S</span>
                        <span :class="story.diverged ? 'text-gray-400' : 'text-gray-600'" class="truncate">{{ story.label }}</span>
                        <!-- Phase badge for diverged stories -->
                        <span
                          v-if="story.diverged"
                          class="ml-auto text-[9px] px-1 py-0.5 rounded font-medium whitespace-nowrap"
                          :style="{ backgroundColor: phaseColor(story.effectivePhase) + '1A', color: phaseColor(story.effectivePhase) }"
                        >{{ phaseName(story.effectivePhase) }}</span>
                        <span v-if="story.modified" class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                      </div>
                    </div>
                  </div>

                  <!-- Diverged story (full representation in destination phase) -->
                  <div
                    v-if="item.type === 'diverged-story'"
                    draggable="true"
                    @dragstart="handleDragStart({ ...item, type: 'story' }, $event)"
                    @dragend="handleDragEnd"
                    class="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all text-xs"
                    :class="item.modified ? 'ring-1 ring-amber-300' : ''"
                  >
                    <span class="w-4 h-4 rounded bg-gray-100 text-[9px] font-bold text-gray-400 flex items-center justify-center flex-shrink-0">S</span>
                    <span class="text-gray-600 truncate">{{ item.label }}</span>
                    <span class="ml-auto text-[9px] text-gray-300 whitespace-nowrap">{{ item.parentLabel }}</span>
                    <span v-if="item.modified" class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                  </div>

                </template>

                <!-- Empty drop zone -->
                <div
                  v-if="itemsInPhase(phase.key).length === 0"
                  class="text-[11px] text-gray-300 text-center py-6"
                >
                  Drop items here
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFlags } from '@/composables/useFlags'

defineProps({
  visible: { type: Boolean, default: false },
})

defineEmits(['close'])

const {
  phases,
  config,
  hasOverrides,
  overrides,
  getEffectiveFeaturePhase,
  getEffectiveStoryPhase,
  overrideFeaturePhase,
  overrideStoryPhase,
  clearOverrides,
  collapseAllStories,
  exportOverrides,
} = useFlags()

const dropTarget = ref(null)
const dragItem = ref(null)
const copied = ref(false)
const expandedFeatures = ref(new Set())
const rejectDrop = ref(false)

const overrideCount = computed(() => {
  return Object.keys(overrides.features).length
    + Object.keys(overrides.stories).length
})

const phaseColor = (phaseKey) => config.value.phases[phaseKey]?.color || '#9CA3AF'
const phaseName = (phaseKey) => config.value.phases[phaseKey]?.label || phaseKey

const toggleExpand = (featureId) => {
  const next = new Set(expandedFeatures.value)
  if (next.has(featureId)) {
    next.delete(featureId)
  } else {
    next.add(featureId)
  }
  expandedFeatures.value = next
}

/**
 * Build items for a phase column.
 * Features appear at their effective phase.
 * Diverged stories appear as standalone items in their destination phase.
 */
const itemsInPhase = (phaseKey) => {
  const items = []

  for (const [featureId, feature] of Object.entries(config.value.features || {})) {
    const effectiveFeaturePhase = getEffectiveFeaturePhase(featureId)

    // Feature card in its own phase
    if (effectiveFeaturePhase === phaseKey) {
      const storyCount = Object.keys(feature.stories || {}).length
      items.push({
        id: `feature:${featureId}`,
        type: 'feature',
        featureId,
        label: feature.label,
        storyCount,
        modified: !!overrides.features[featureId],
      })
    }

    // Diverged stories — stories whose effective phase differs from their feature's phase
    for (const [storyId] of Object.entries(feature.stories || {})) {
      const effectiveStoryPhase = getEffectiveStoryPhase(featureId, storyId)
      if (effectiveStoryPhase !== effectiveFeaturePhase && effectiveStoryPhase === phaseKey) {
        items.push({
          id: `diverged-story:${featureId}.${storyId}`,
          type: 'diverged-story',
          featureId,
          storyId,
          label: storyId.replace(/-/g, ' '),
          parentLabel: feature.label,
          modified: !!overrides.stories[`${featureId}.${storyId}`],
        })
      }
    }
  }

  return items
}

/**
 * Get all stories for a feature with their effective phases.
 */
const storiesForFeature = (featureId) => {
  const feature = config.value.features[featureId]
  if (!feature?.stories) return []

  const featurePhase = getEffectiveFeaturePhase(featureId)

  return Object.entries(feature.stories).map(([storyId, story]) => {
    const effectivePhase = getEffectiveStoryPhase(featureId, storyId)
    const diverged = effectivePhase !== featurePhase
    return {
      id: `story:${featureId}.${storyId}`,
      type: 'story',
      featureId,
      storyId,
      label: storyId.replace(/-/g, ' '),
      effectivePhase,
      diverged,
      modified: !!overrides.stories[`${featureId}.${storyId}`],
    }
  })
}

const handleDragStart = (item, event) => {
  dragItem.value = item
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragEnd = () => {
  dragItem.value = null
  dropTarget.value = null
}

const phaseOrder = (phaseKey) => config.value.phases[phaseKey]?.order ?? 0

const handleDrop = (targetPhase) => {
  const item = dragItem.value
  if (!item) return

  if (item.type === 'feature') {
    overrideFeaturePhase(item.featureId, targetPhase)
  } else if (item.type === 'story') {
    // Prevent dropping a story into an earlier phase than its feature
    const featurePhase = getEffectiveFeaturePhase(item.featureId)
    if (phaseOrder(targetPhase) < phaseOrder(featurePhase)) {
      rejectDrop.value = true
      setTimeout(() => { rejectDrop.value = false }, 600)
      dragItem.value = null
      dropTarget.value = null
      return
    }
    overrideStoryPhase(item.featureId, item.storyId, targetPhase)
  }

  dragItem.value = null
  dropTarget.value = null
}

const collapseStories = () => {
  collapseAllStories()
}

const handleCopy = async () => {
  const text = exportOverrides()
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>
