<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-8">
        <div class="flex items-center justify-between h-12 sm:h-14">
          <!-- Title -->
          <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <h1 class="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              Roles &amp; Terms
            </h1>
            <span class="text-xs text-gray-400 hidden lg:inline">Visual Export</span>
          </div>

          <!-- Controls -->
          <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <!-- Phase Picker (from flags.config.js) -->
            <PhasePicker />

            <div class="hidden sm:block w-px h-5 bg-gray-200 self-center"></div>

            <!-- Phase Map Button -->
            <div class="hidden sm:flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
              <button
                @click="showPhaseMap = !showPhaseMap"
                :class="[
                  'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-150',
                  showPhaseMap
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Phase Map
              </button>
            </div>

            <!-- Changelog Button -->
            <div class="hidden sm:flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
              <button
                @click="showChangelog = true"
                class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-150 text-gray-600 hover:text-gray-900"
              >
                Changelog
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
      <div class="flex gap-6">
        <!-- Demo Viewport -->
        <div ref="viewportContainer" class="flex-1 transition-all duration-300 ease-in-out relative">
          <div
            ref="browserFrame"
            :class="[
              'bg-gray-100 shadow-xl border border-gray-200 flex flex-col',
              isFullscreen ? 'rounded-none h-screen' : 'rounded-2xl p-1'
            ]"
            :style="!isFullscreen && frameWidth > 0 ? { width: frameWidth + 'px', height: frameHeight + 'px' } : {}"
          >
            <!-- Viewport Header (browser frame).
                 NOTE: rounded-t-xl is hijacked by Vuetify (24px !important) so we
                 use the arbitrary-value form to land on the 12px we actually want
                 (concentric with the outer rounded-2xl + 4px padding). -->
            <div
              :class="[
                'px-4 py-2.5 flex items-center space-x-2 flex-shrink-0',
                isFullscreen ? 'bg-gray-100' : 'bg-gray-100 rounded-t-[12px]'
              ]"
            >
              <div class="flex space-x-1.5">
                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                <button
                  @click="takeScreenshot"
                  class="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer"
                  title="Take Screenshot"
                ></button>
                <button
                  @click="toggleFullscreen"
                  class="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer"
                  :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
                ></button>
              </div>
              <div class="flex-1 flex justify-center">
                <div class="bg-white rounded px-4 py-1 text-xs text-gray-500 font-mono whitespace-nowrap flex items-center gap-3">
                  <span>app.onboardmeetings.com</span>
                  <span class="text-gray-300">|</span>
                  <span class="text-[10px] text-gray-400">{{ frameWidth }}&times;{{ frameHeight }}</span>
                </div>
              </div>
              <div class="w-12"></div>
            </div>

            <!-- Prototype viewport.
                 #ob-app-core scopes OB design-system + product-views styling here.
                 Everything outside this wrapper stays on the template's Tailwind meta-chrome.

                 AppShell is the OnBoard product shell — sidebar nav + main view area.
                 MainView dispatches on `currentView` to render real product views
                 (from @onboardmeetings/product-views) or skeleton placeholders for
                 views not yet ported. -->
            <!-- rounded-b-xl is hijacked by Vuetify (24px !important); arbitrary
                 value `rounded-b-[12px]` bypasses the class-name collision so the
                 inner curves stay concentric with the outer rounded-2xl frame. -->
            <div id="ob-app-core" :class="[isFullscreen ? 'flex-1' : 'flex-1 min-h-0', 'rounded-b-[12px] overflow-hidden']" :style="{ borderRadius: isFullscreen ? '0' : '' }">
              <!-- Fullscreen route (meta.layout === 'fullscreen'): render the
                   view component directly, bypassing AppShell. Mirrors real
                   product where pre-shell views like OrganizationSelector
                   own the whole viewport. -->
              <RouterView v-if="isFullscreenRoute" class="h-full" />
              <AppShell
                v-else
                :current-scenario="activeScenario"
                :initial-chat-mode="chatMode"
                :empty-chat="demoMode"
                :phase1-mode="phase1Mode"
                :force-dropdown="forceDropdown"
                :force-expanded="forceExpanded"
                :force-sidebar="forceSidebar"
                :force-chat-width="forceChatWidth"
                :force-input-text="forceInputText"
                @load-scenario="loadScenario"
                @chat-mode-change="chatMode = $event"
                @split-available-change="handleSplitAvailableChange"
                @reset-conversation="currentScenario = null"
              />
            </div>
          </div>

          <!-- Right resize handle (centered, 1/3 of frame height) -->
          <div
            v-if="!isFullscreen"
            class="absolute w-6 cursor-col-resize z-10 group"
            :style="{ left: (frameWidth + 4) + 'px', top: (frameHeight / 3) + 'px', height: (frameHeight / 3) + 'px' }"
            @mousedown.prevent="startFrameResize('x', $event)"
          >
            <div class="absolute inset-y-0 left-2 w-1 rounded-full bg-transparent group-hover:bg-gray-300 transition-colors"></div>
          </div>

          <!-- Bottom resize handle (centered, 1/3 of frame width) -->
          <div
            v-if="!isFullscreen"
            class="absolute h-6 cursor-row-resize z-10 group"
            :style="{ top: (frameHeight + 12) + 'px', left: (frameWidth / 3) + 'px', width: (frameWidth / 3) + 'px' }"
            @mousedown.prevent="startFrameResize('y', $event)"
          >
            <div class="absolute inset-x-0 top-2 h-1 rounded-full bg-transparent group-hover:bg-gray-300 transition-colors"></div>
          </div>

          <!-- Corner resize handle -->
          <div
            v-if="!isFullscreen"
            class="absolute w-6 h-6 cursor-nwse-resize z-20"
            :style="{ left: (frameWidth + 4) + 'px', top: (frameHeight + 12) + 'px' }"
            @mousedown.prevent="startFrameResize('xy', $event)"
          >
            <svg class="w-3 h-3 text-gray-300 mt-2 ml-2" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="5" cy="5" r="1"/>
              <circle cx="5" cy="2" r="1"/>
              <circle cx="2" cy="5" r="1"/>
            </svg>
          </div>
        </div>

        <!-- Pattern Explorer Sidebar (hidden by default, toggle via ?explorer=true) -->
        <div
          v-if="showExplorer"
          class="flex-shrink-0 w-80"
        >
          <PatternExplorer
            @load-scenario="loadScenario"
            :current-scenario-id="currentScenario?.id"
          />
        </div>
      </div>
    </div>

    <!-- UX Documentation Section -->
    <div class="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
      <UXDocumentation />
    </div>

    <!-- Phase Map Overlay -->
    <PhaseMapOverlay :visible="showPhaseMap" @close="showPhaseMap = false" />

    <!-- Changelog Modal -->
    <ChangelogModal v-if="showChangelog" @close="showChangelog = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as htmlToImage from 'html-to-image'
import AppShell from './components/layout/AppShell.vue'
import PatternExplorer from './components/layout/PatternExplorer.vue'
import UXDocumentation from './components/docs/UXDocumentation.vue'
import ChangelogModal from './components/ChangelogModal.vue'
import PhasePicker from './components/flags/PhasePicker.vue'
import PhaseMapOverlay from './components/flags/PhaseMapOverlay.vue'
import { useFlags } from './composables/useFlags'
import { getScenario, getAllScenarios } from './data/scenarios.js'

// Flags
const { isScenarioActive } = useFlags()
const router = useRouter()
const route = useRoute()

// Fullscreen routes render their component inside #ob-app-core without the
// AppShell chrome (sidebar + chat). See src/router.js — routes tag themselves
// with `meta.layout: 'fullscreen'` to opt in.
const isFullscreenRoute = computed(() => route.meta?.layout === 'fullscreen')

// Early URL param processing
const earlyParams = new URLSearchParams(window.location.search)
if (earlyParams.has('fab')) {
  const corner = earlyParams.get('fab') || 'bottom-right'
  localStorage.setItem('cta-snap-position', corner)
}

// UI State
const forceDropdown = ref(false)
const forceExpanded = ref(false)
const forceSidebar = ref(null)
const forceChatWidth = ref(null)
const forceInputText = ref('')
const showExplorer = ref(false)
const chatMode = ref('hidden')
const demoMode = ref(false)
const phase1Mode = ref(false)
const showChangelog = ref(false)
const showPhaseMap = ref(false)
const viewportContainer = ref(null)
const browserFrame = ref(null)
const isFullscreen = ref(false)
const splitAvailable = ref(true)

// Frame resize
// desiredWidth/Height = what the user dragged to (or initial).
// frameWidth/Height = clamped to container. Always <= container.
const desiredWidth = ref(0)
const desiredHeight = ref(0)
const containerWidth = ref(0)
const containerHeight = ref(0)

const frameWidth = computed(() => {
  if (desiredWidth.value === 0) return 0
  return Math.min(desiredWidth.value, containerWidth.value - 16)
})
const frameHeight = computed(() => {
  if (desiredHeight.value === 0) return 0
  return desiredHeight.value
})

let frameResizeAxis = null
let frameResizeStartX = 0
let frameResizeStartY = 0
let frameResizeStartW = 0
let frameResizeStartH = 0
let containerObserver = null

const updateContainerSize = () => {
  if (viewportContainer.value) {
    const rect = viewportContainer.value.getBoundingClientRect()
    containerWidth.value = Math.floor(rect.width)
    containerHeight.value = Math.floor(rect.height)
  }
}

const startFrameResize = (axis, e) => {
  frameResizeAxis = axis
  frameResizeStartX = e.clientX
  frameResizeStartY = e.clientY
  frameResizeStartW = desiredWidth.value
  frameResizeStartH = desiredHeight.value
  document.addEventListener('mousemove', handleFrameResize)
  document.addEventListener('mouseup', stopFrameResize)
  document.body.style.cursor = axis === 'x' ? 'col-resize' : axis === 'y' ? 'row-resize' : 'nwse-resize'
  document.body.style.userSelect = 'none'
}

const handleFrameResize = (e) => {
  if (frameResizeAxis === 'x' || frameResizeAxis === 'xy') {
    desiredWidth.value = Math.max(320, frameResizeStartW + (e.clientX - frameResizeStartX))
  }
  if (frameResizeAxis === 'y' || frameResizeAxis === 'xy') {
    desiredHeight.value = Math.max(300, frameResizeStartH + (e.clientY - frameResizeStartY))
  }
}

const stopFrameResize = () => {
  frameResizeAxis = null
  document.removeEventListener('mousemove', handleFrameResize)
  document.removeEventListener('mouseup', stopFrameResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Fullscreen
const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    try {
      await viewportContainer.value?.requestFullscreen()
      isFullscreen.value = true
    } catch (err) {
      console.error('Error entering fullscreen:', err)
    }
  } else {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// Screenshot
const takeScreenshot = async () => {
  if (!browserFrame.value) return

  const scrollables = []
  browserFrame.value.querySelectorAll('*').forEach((el) => {
    if (el.scrollTop > 0 || el.scrollLeft > 0) {
      const wrapper = el.firstElementChild
      if (wrapper) {
        scrollables.push({
          el,
          wrapper,
          scrollTop: el.scrollTop,
          scrollLeft: el.scrollLeft,
          originalTransform: wrapper.style.transform,
          originalOverflow: el.style.overflow,
        })
      }
    }
  })

  scrollables.forEach(({ el, wrapper, scrollTop, scrollLeft }) => {
    el.style.overflow = 'hidden'
    wrapper.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`
    el.scrollTop = 0
    el.scrollLeft = 0
  })

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  try {
    const dataUrl = await htmlToImage.toPng(browserFrame.value, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#f3f4f6',
      skipFonts: true,
    })
    const link = document.createElement('a')
    link.download = `prototype-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  } catch (err) {
    console.error('Error taking screenshot:', err)
  } finally {
    scrollables.forEach(({ el, wrapper, scrollTop, scrollLeft, originalTransform, originalOverflow }) => {
      wrapper.style.transform = originalTransform
      el.style.overflow = originalOverflow
      el.scrollTop = scrollTop
      el.scrollLeft = scrollLeft
    })
  }
}

// Chat modes
const allChatModes = [
  { id: 'hidden', label: 'Hidden' },
  { id: 'split', label: 'Split' },
  { id: 'fullscreen', label: 'Full' },
]

const chatModes = computed(() => {
  if (splitAvailable.value) return allChatModes
  return allChatModes.filter((m) => m.id !== 'split')
})

const handleSplitAvailableChange = (available) => {
  splitAvailable.value = available
}

// Scenario state
const currentScenario = ref(null)

// Active scenario — respects phase filtering
const activeScenario = computed(() => {
  if (!currentScenario.value) return null
  if (!isScenarioActive(currentScenario.value.id)) return null
  return currentScenario.value
})

const loadScenario = (scenarioId) => {
  const scenario = getScenario(scenarioId)
  if (scenario) {
    currentScenario.value = scenario
    demoMode.value = false
  }
}

onMounted(() => {
  // Initialize frame size and watch container for browser resize
  nextTick(() => {
    updateContainerSize()
    desiredWidth.value = containerWidth.value - 16
    desiredHeight.value = Math.max(500, Math.floor(window.innerHeight - 250))

    containerObserver = new ResizeObserver(() => updateContainerSize())
    if (viewportContainer.value) {
      containerObserver.observe(viewportContainer.value)
    }
  })

  const params = new URLSearchParams(window.location.search)

  const paramScenario = params.get('scenario')
  if (paramScenario) {
    loadScenario(paramScenario)
  } else {
    const scenarios = getAllScenarios()
    if (scenarios.length > 0) loadScenario(scenarios[0].id)
  }

  if (params.has('mode')) chatMode.value = params.get('mode')
  if (params.get('empty') === 'true') demoMode.value = true
  if (params.get('explorer') === 'true') showExplorer.value = true
  if (params.get('dropdown') === 'true') forceDropdown.value = true
  if (params.get('expanded') === 'true') forceExpanded.value = true
  if (params.has('sidebar')) forceSidebar.value = params.get('sidebar')
  if (params.has('chatwidth')) forceChatWidth.value = parseInt(params.get('chatwidth'), 10)
  // `?view=meetings` deep-link: route after vue-router is initialised.
  if (params.has('view')) {
    router.push({ name: params.get('view') }).catch(() => {})
  }
  if (params.has('inputtext')) forceInputText.value = decodeURIComponent(params.get('inputtext'))

  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (containerObserver) containerObserver.disconnect()
})
</script>
