<template>
  <!-- White gradient overlay when input is expanded but chat hidden -->
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-full"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-full"
  >
    <div
      v-if="chatMode === 'hidden' && isExpanded"
      class="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none z-30 gradient-overlay"
    ></div>
  </transition>

  <!-- text-base sets a 16px font-size base for the input subtree.
       This component sits inside `#ob-app-core` (10px base for the
       DS em-cascade); without this override the "Ask Anything" CTA
       and expanded input/placeholder inherit 10px and read too
       small. DS components are unaffected — they use
       calc(X * var(--r)) or em that's deliberately tied to the OB
       scope, neither of which we cross with this Tailwind class. -->
  <div
    ref="inputWrapper"
    class="shared-input-wrapper text-base"
    :class="[
      shouldAnimate ? 'transition-all duration-300 ease-out-spring' : ''
    ]"
    :style="positionStyle"
  >
    <!-- Collapsed CTA / FAB (draggable, morphs between states) -->
    <div
      v-if="chatMode === 'hidden' && !isExpanded"
      ref="collapsedElement"
      @pointerdown="handlePointerDown"
      @pointermove="handleEdgeDetection"
      @pointerleave="isOnEdge = false"
      @click="handleClick"
      :class="[
        'collapsed-cta flex items-center bg-white',
        shouldAnimate ? 'transition-all duration-300 ease-out-spring' : '',
        isFabMode ? 'minimal-btn justify-center' : '',
        isFabMode && !isDragging && !isAnimating && !isMorphing ? 'group' : '',
        isMorphing ? 'morph-pop' : '',
        isDragging ? 'dragging cursor-grabbing' : (isOnEdge && !isFabMode ? 'cursor-move' : 'cursor-pointer'),
        isAnimating ? 'no-glow' : ''
      ]"
      :style="collapsedStyle"
      style="touch-action: none;"
    >
      <!-- FAB Tooltip (only in FAB mode, position-aware) - hidden during FTUX -->
      <div
        v-if="isFabMode && !isDragging && !isAnimating && !isMorphing && !ftuxActive"
        :class="[
          'fab-tooltip absolute px-3 py-1.5 bg-white text-gray-700 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg border border-gray-200',
          fabTooltipPosition.classes
        ]"
      >
        <span>AI Assistant</span>
        <span class="ml-2 text-gray-400">⌘K</span>
        <!-- Tooltip arrow -->
        <div :class="['absolute border-4 border-transparent', fabTooltipPosition.arrowClasses]"></div>
      </div>

      <!-- FTUX Tooltips -->

      <!-- Centered content: Sparkles + Text -->
      <div
        :class="[
          'flex items-center transition-all duration-300 pointer-events-none',
          isFabMode ? 'justify-center' : 'justify-center flex-1 pl-6'
        ]"
      >
        <!-- Static sparkle -->
        <img
          v-if="!useAnimatedSparkle"
          :src="SparklesLogo"
          alt=""
          class="w-5 h-5 flex-shrink-0 pointer-events-none select-none"
          draggable="false"
        />
        <!-- Animated sparkle -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 flex-shrink-0 pointer-events-none select-none"
          viewBox="0 0 13 16"
          fill="none"
        >
          <defs>
            <linearGradient id="sparkle-grad1" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stop-color="#FF5C39"></stop>
              <stop offset="100%" stop-color="#FF9532"></stop>
              <animateTransform attributeName="gradientTransform" type="translate" values="0 -1; 0 1; 0 -1" dur="2s" repeatCount="indefinite"></animateTransform>
            </linearGradient>
            <linearGradient id="sparkle-grad2" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stop-color="#C5299B"></stop>
              <stop offset="100%" stop-color="#FF5C39"></stop>
              <animateTransform attributeName="gradientTransform" type="translate" values="0 -1; 0 1; 0 -1" dur="2s" repeatCount="indefinite"></animateTransform>
            </linearGradient>
            <linearGradient id="sparkle-grad3" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stop-color="#407EC9"></stop>
              <stop offset="100%" stop-color="#C5299B"></stop>
              <animateTransform attributeName="gradientTransform" type="translate" values="0 -1; 0 1; 0 -1" dur="2s" repeatCount="indefinite"></animateTransform>
            </linearGradient>
          </defs>
          <!-- Small top star -->
          <path d="M6.10649 3.41604C6.19782 3.41604 6.24705 3.35992 6.26108 3.27575C6.47191 2.13941 6.45081 2.08329 7.67353 1.86584C7.75784 1.8448 7.81403 1.7957 7.81403 1.70451C7.81403 1.62034 7.75784 1.56422 7.67353 1.55019C6.45081 1.33274 6.47191 1.27663 6.26108 0.140289C6.24705 0.0561156 6.19782 0 6.10649 0C6.01511 0 5.96595 0.0561156 5.95189 0.140289C5.74109 1.27663 5.76217 1.33274 4.53946 1.55019C4.44811 1.56422 4.39893 1.62034 4.39893 1.70451C4.39893 1.7957 4.44811 1.8448 4.53946 1.86584C5.76217 2.08329 5.74109 2.13941 5.95189 3.27575C5.96595 3.35992 6.01511 3.41604 6.10649 3.41604Z" fill="url(#sparkle-grad1)"></path>
          <!-- Medium left star -->
          <path d="M2.7054 8.24175C2.83892 8.24175 2.93027 8.15059 2.94432 8.02429C3.19729 6.15144 3.26054 6.15144 5.2 5.7797C5.31945 5.75865 5.41081 5.67448 5.41081 5.5412C5.41081 5.41495 5.31945 5.32376 5.2 5.30973C3.26054 5.03616 3.19026 4.97303 2.94432 3.07212C2.93027 2.93885 2.83892 2.84766 2.7054 2.84766C2.57892 2.84766 2.48757 2.93885 2.46648 3.07913C2.24162 4.95199 2.13621 4.94498 0.21081 5.30973C0.0913514 5.33077 0 5.41495 0 5.5412C0 5.6815 0.0913514 5.75865 0.238919 5.7797C2.15027 6.08835 2.24162 6.13743 2.46648 8.01029C2.48757 8.15059 2.57892 8.24175 2.7054 8.24175Z" fill="url(#sparkle-grad2)"></path>
          <!-- Large main star -->
          <path d="M7.46969 15.9996C7.6524 15.9996 7.78594 15.8663 7.82108 15.6769C8.31998 11.8399 8.86104 11.2508 12.6697 10.8299C12.8664 10.8089 13 10.6686 13 10.4792C13 10.2968 12.8664 10.1565 12.6697 10.1355C8.86104 9.71462 8.31998 9.12539 7.82108 5.28147C7.78594 5.09208 7.6524 4.96582 7.46969 4.96582C7.28698 4.96582 7.1535 5.09208 7.12538 5.28147C6.62648 9.12539 6.07835 9.71462 2.27675 10.1355C2.07296 10.1565 1.93945 10.2968 1.93945 10.4792C1.93945 10.6686 2.07296 10.8089 2.27675 10.8299C6.07134 11.3279 6.59836 11.8399 7.12538 15.6769C7.1535 15.8663 7.28698 15.9996 7.46969 15.9996Z" fill="url(#sparkle-grad3)"></path>
        </svg>
        <!-- Text content (fades out in FAB mode) -->
        <span
          :class="[
            'text-gray-500 transition-all duration-200 overflow-hidden whitespace-nowrap pointer-events-none select-none',
            isFabMode ? 'w-0 opacity-0 ml-0' : 'opacity-100 ml-2'
          ]"
        >{{ phase1Mode ? 'Ask about meetings & materials' : 'Ask Anything' }}</span>
      </div>
      <!-- Shortcut on right (fades out in FAB mode) -->
      <div
        :class="[
          'flex items-center space-x-0.5 text-gray-400 text-xs transition-all duration-200 overflow-hidden whitespace-nowrap pointer-events-none select-none',
          isFabMode ? 'w-0 opacity-0 pr-0' : 'opacity-100 pr-6'
        ]"
      >
        <span>⌘</span>
        <span>K</span>
      </div>
    </div>

    <!-- Expanded Input -->
    <div
      v-else-if="chatMode !== 'hidden' || isExpanded"
      ref="expandedWrapper"
      class="flex flex-col"
    >
      <!-- Suggested Questions (shown above input card in welcome state) -->
      <div v-if="showPromptPills && pillsVisible && chatMode !== 'hidden'" class="h-10 pointer-events-none suggestions-gradient"></div>
      <div
        v-if="showPromptPills && pillsVisible"
        :class="['bg-white rounded-t-2xl p-3 pb-6 transition-opacity duration-150 ease-out', pillClicked ? 'opacity-0' : '', chatMode === 'hidden' ? 'suggestion-container border border-gray-200 border-b-0' : '']"
      >
        <div class="text-gray-400 mb-1 px-1" style="font-size: 12px;">Suggested questions</div>
        <div
          v-for="(pill, idx) in promptPills"
          :key="pill.label"
          @click.stop="handlePillClick(pill)"
          class="suggestion-stagger flex items-center space-x-2 py-1.5 px-1 text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
          style="font-size: 13px;"
          :style="{ animationDelay: (500 + idx * 100) + 'ms' }"
        >
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
          <span>{{ pill.label }}</span>
        </div>
      </div>

      <div
        ref="expandedInput"
        class="expanded-input bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-3 relative z-10 -mt-3"
      >

      <!-- Textarea -->
      <textarea
        ref="textarea"
        rows="2"
        v-model="inputText"
        :placeholder="phase1Mode ? 'Ask about meetings & materials' : 'Ask Anything...'"
        class="w-full bg-transparent resize-none outline-none text-gray-900 placeholder-gray-400 leading-6"
        @input="handleInput"
        @keydown.enter.exact.prevent="handleSubmit"
        @keydown.escape="handleEscape"
      ></textarea>

      <!-- Bottom Controls -->
      <div class="flex items-center justify-between mt-2 min-h-[32px]">
        <div class="flex items-center space-x-1.5">
          <!-- Attach Button (hidden in Phase 0 and Phase 1) -->
          <button v-if="!phase0Mode && !phase1Mode" class="flex items-center space-x-1.5 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
            <span>Attach Documents</span>
          </button>

          <!-- Sources Dropdown (hidden for now) -->
          <!--
          <button v-if="!phase0Mode && !phase1Mode" class="flex items-center space-x-1.5 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <span>Sources</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          -->
        </div>

        <!-- Send Button -->
        <transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-75"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-75"
        >
          <button
            v-if="hasText"
            @click="handleSubmit"
            class="flex-shrink-0 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </transition>
      </div>
    </div>
    </div>

  </div>

  <!-- Open Chat Button (only in CTA mode, positioned in right corner) -->
  <div
    v-if="chatMode === 'hidden' && !isExpanded && !isFabMode && contentAreaRect"
    class="absolute"
    :style="openChatBtnStyle"
  >
    <button
      @click.stop="handleOpenChatClick"
      :class="[
        'open-chat-btn bg-white rounded-full flex items-center justify-center',
        'transition-all duration-200 ease-out',
        isDragging ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
        !isDragging ? 'hover:scale-105 active:scale-95' : ''
      ]"
      :style="{ width: '100%', height: '100%' }"
      title="Open Chat"
    >
      <svg class="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M15 3v18"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import SparklesLogo from '@/assets/SparklesGrandient.svg';
import { useDraggable } from '@/composables/useDraggable';

// FTUX integration
const ftuxActive = false;

const props = defineProps({
  chatMode: {
    type: String,
    default: 'hidden'
  },
  chatWidth: {
    type: Number,
    default: 480
  },
  contentAreaRect: {
    type: Object,
    default: null
  },
  sidebarWidth: {
    type: Number,
    default: 220
  },
  isResizing: {
    type: Boolean,
    default: false
  },
  preferFabMode: {
    type: Boolean,
    default: false
  },
  forceExpanded: {
    type: Boolean,
    default: false
  },
  forceInputText: {
    type: String,
    default: ''
  },
  phase0Mode: {
    type: Boolean,
    default: false
  },
  phase1Mode: {
    type: Boolean,
    default: false
  },
  showPromptPills: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'request-open-chat', 'open-chat', 'dragging-change', 'pill-click']);

const promptPills = [
  { label: 'Summarize the board book for my next meeting', scenarioId: 'book-qa' },
  { label: 'Walk me through the agenda', scenarioId: 'agenda-data-access' },
  { label: 'When is my next committee meeting?', scenarioId: 'meeting-information' }
];

const pillsVisible = ref(true);
const pillsKey = ref(0);

// Reset pills visibility and re-trigger animation when switching to a welcome state
watch(() => props.showPromptPills, (show) => {
  if (show) {
    pillsVisible.value = true;
    pillClicked.value = false;
    pillsKey.value++;
  }
});

const pillClicked = ref(false);

const handlePillClick = (pill) => {
  // Instantly hide suggestions
  pillClicked.value = true;
  pillsVisible.value = false;

  // Submit after fade completes
  setTimeout(() => {
    // Always open chat if hidden
    if (props.chatMode === 'hidden') {
      emit('request-open-chat', pill.label);
    } else {
      emit('submit', pill.label);
    }
    // Delay pill-click to let chat open and render first
    setTimeout(() => {
      emit('pill-click', { text: pill.label, scenarioId: pill.scenarioId });
    }, props.chatMode === 'hidden' ? 600 : 0);
  }, 300);
};

const inputWrapper = ref(null);
const expandedInput = ref(null);
const expandedWrapper = ref(null);
const collapsedElement = ref(null);
const textarea = ref(null);
const inputText = ref('');
const isExpanded = ref(false);
const isMorphing = ref(false);
const dragStartedAsCTA = ref(false); // Track if drag started from CTA mode
const useAnimatedSparkle = ref(true); // Toggle between static and animated sparkle
const isOnEdge = ref(false); // Track if cursor is on edge for move cursor hint

const EDGE_THRESHOLD = 8; // Pixels from edge to show move cursor

const hasText = computed(() => inputText.value.trim().length > 0);

// Define snap points based on content area
const MARGIN = 24;
const FAB_SIZE = 44;
const CTA_WIDTH = computed(() => props.phase1Mode ? 380 : 280);

const getSnapPoints = () => {
  const rect = props.contentAreaRect;
  if (!rect) return [];

  const fabOffset = FAB_SIZE / 2;

  return [
    { id: 'bottom-center', x: rect.width / 2, y: rect.height - MARGIN - fabOffset, type: 'cta' },
    { id: 'bottom-left', x: MARGIN + fabOffset, y: rect.height - MARGIN - fabOffset, type: 'fab' },
    { id: 'bottom-right', x: rect.width - MARGIN - fabOffset, y: rect.height - MARGIN - fabOffset, type: 'fab' },
    { id: 'top-left', x: MARGIN + fabOffset, y: MARGIN + fabOffset, type: 'fab' },
    { id: 'top-right', x: rect.width - MARGIN - fabOffset, y: MARGIN + fabOffset, type: 'fab' },
  ];
};

const getBounds = () => {
  const rect = props.contentAreaRect;
  if (!rect) return null;

  const padding = MARGIN + FAB_SIZE / 2;
  return {
    left: padding,
    top: padding,
    right: rect.width - padding,
    bottom: rect.height - padding
  };
};

const handleSnapComplete = (snapPoint) => {
  // Only trigger morph animation for drag interactions, not programmatic moves
  if (dragStartedAsCTA.value) {
    isMorphing.value = true;
    setTimeout(() => {
      isMorphing.value = false;
    }, 350);

    // FTUX: Trigger fab-snapped if snapped to a corner (FAB mode)
    if (snapPoint?.type === 'fab') {
    }
  }
  dragStartedAsCTA.value = false;
};

// Initialize draggable
const {
  isDragging,
  isAnimating,
  position: dragPosition,
  currentSnapPoint,
  targetSnapPoint,
  initialize: initializeDraggable,
  startDrag,
  updateDrag,
  endDrag,
  cancelDrag,
  updateForNewSnapPoints,
  moveToSnapPoint
} = useDraggable({
  getSnapPoints,
  getBounds,
  onSnapComplete: handleSnapComplete,
  storageKey: 'cta-snap-position',
  defaultSnapId: 'bottom-center'
});

// Whether we're in FAB mode (based on current or target snap point)
const isFabMode = computed(() => {
  if (isDragging.value) return true; // Always FAB while dragging
  // If animating, use the target snap point type
  if (isAnimating.value && targetSnapPoint.value) {
    return targetSnapPoint.value.type === 'fab';
  }
  return currentSnapPoint.value?.type === 'fab';
});

// Tooltip position based on which corner FAB is in
const fabTooltipPosition = computed(() => {
  const snapId = currentSnapPoint.value?.id || 'bottom-right';
  const isTop = snapId.startsWith('top-');
  const isLeft = snapId.endsWith('-left');

  // Position tooltip away from edges
  if (isTop && isLeft) {
    // Top-left: tooltip below and to the right
    return {
      classes: 'top-full left-0 mt-2',
      arrowClasses: 'bottom-full left-4 border-b-white'
    };
  } else if (isTop && !isLeft) {
    // Top-right: tooltip below and to the left
    return {
      classes: 'top-full right-0 mt-2',
      arrowClasses: 'bottom-full right-4 border-b-white'
    };
  } else if (!isTop && isLeft) {
    // Bottom-left: tooltip above and to the right
    return {
      classes: 'bottom-full left-0 mb-2',
      arrowClasses: 'top-full left-4 -mt-px border-t-white'
    };
  } else {
    // Bottom-right: tooltip above and to the left
    return {
      classes: 'bottom-full right-0 mb-2',
      arrowClasses: 'top-full right-4 -mt-px border-t-white'
    };
  }
});


// Should CSS transitions be enabled
const shouldAnimate = computed(() => {
  if (props.isResizing) return false;
  return !isDragging.value;
});

// Calculate input width based on mode
const inputWidth = computed(() => {
  if (props.chatMode === 'hidden') {
    return 560; // Centered floating width
  } else if (props.chatMode === 'split') {
    return props.chatWidth - 32; // Chat panel width minus padding
  } else {
    // Fullscreen - use max-w-3xl equivalent
    return Math.min(768, (props.contentAreaRect?.width || 800) - 32);
  }
});

// Style for the collapsed CTA/FAB element
const collapsedStyle = computed(() => {
  if (isFabMode.value) {
    return {
      width: FAB_SIZE + 'px',
      height: FAB_SIZE + 'px',
      borderRadius: '50%'
    };
  }
  return {
    borderRadius: '9999px',
    padding: '12px 0'
  };
});

// Style for the open chat button (absolute in right corner of content area)
const OPEN_CHAT_BTN_SIZE = 50; // Match CTA height
const openChatBtnStyle = computed(() => {
  const rect = props.contentAreaRect;
  if (!rect) return { opacity: 0 };

  return {
    width: OPEN_CHAT_BTN_SIZE + 'px',
    height: OPEN_CHAT_BTN_SIZE + 'px',
    left: (rect.width - MARGIN - OPEN_CHAT_BTN_SIZE) + 'px',
    top: (rect.height - MARGIN - OPEN_CHAT_BTN_SIZE) + 'px',
    zIndex: 40
  };
});

// Calculate position based on chat mode
const positionStyle = computed(() => {
  const rect = props.contentAreaRect;
  if (!rect) return { opacity: 0 };

  // When chat is hidden and collapsed, use drag position
  if (props.chatMode === 'hidden' && !isExpanded.value) {
    const width = isFabMode.value ? FAB_SIZE : CTA_WIDTH.value;
    const height = isFabMode.value ? FAB_SIZE : 50; // CTA is ~50px tall
    return {
      position: 'absolute',
      bottom: 'auto',
      top: (dragPosition.value.y - height / 2) + 'px',
      left: (dragPosition.value.x - width / 2) + 'px',
      width: width + 'px',
      zIndex: 40
    };
  }

  // When expanded or in split/fullscreen mode, use original logic
  let width;
  if (isExpanded.value || props.chatMode !== 'hidden') {
    width = inputWidth.value;
  } else {
    width = CTA_WIDTH.value;
  }

  let leftPos;
  if (props.chatMode === 'hidden') {
    leftPos = (rect.width - width) / 2;
  } else if (props.chatMode === 'split') {
    leftPos = rect.width - props.chatWidth + 16;
  } else {
    leftPos = (rect.width - width) / 2;
  }

  return {
    position: 'absolute',
    bottom: props.chatMode === 'hidden' ? '24px' : '16px',
    top: 'auto',
    left: leftPos + 'px',
    width: width + 'px',
    zIndex: 40
  };
});

// Edge detection for move cursor hint
const handleEdgeDetection = (e) => {
  if (isFabMode.value || isDragging.value) {
    isOnEdge.value = false;
    return;
  }

  const rect = collapsedElement.value?.getBoundingClientRect();
  if (!rect) return;

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Check if cursor is within EDGE_THRESHOLD of any edge
  const nearLeft = x <= EDGE_THRESHOLD;
  const nearRight = x >= rect.width - EDGE_THRESHOLD;
  const nearTop = y <= EDGE_THRESHOLD;
  const nearBottom = y >= rect.height - EDGE_THRESHOLD;

  isOnEdge.value = nearLeft || nearRight || nearTop || nearBottom;
};

// Pointer event handlers
let pointerDownTimestamp = 0;
let pointerDownPosition = { x: 0, y: 0 };
let didMove = false;
let pendingDragStart = null; // Store info for delayed drag start

const handlePointerDown = (e) => {
  if (props.chatMode !== 'hidden' || isExpanded.value) return;

  // Store for click detection
  pointerDownTimestamp = Date.now();
  pointerDownPosition = { x: e.clientX, y: e.clientY };
  didMove = false;

  // Don't start drag yet - wait for movement
  const elementRect = collapsedElement.value?.getBoundingClientRect();
  const containerRect = props.contentAreaRect;

  if (elementRect && containerRect) {
    // Store info for potential drag start
    pendingDragStart = { event: e, elementRect, containerRect };

    // Add document-level listeners
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  }
};

const DRAG_THRESHOLD = 5; // Pixels of movement before drag starts

const handlePointerMove = (e) => {
  const dist = Math.sqrt(
    Math.pow(e.clientX - pointerDownPosition.x, 2) +
    Math.pow(e.clientY - pointerDownPosition.y, 2)
  );

  // Start drag only after threshold movement
  if (!isDragging.value && pendingDragStart && dist > DRAG_THRESHOLD) {
    didMove = true;
    const wasCtaMode = currentSnapPoint.value?.type === 'cta';
    dragStartedAsCTA.value = wasCtaMode;

    // Trigger morph animation if starting from CTA
    if (wasCtaMode) {
      isMorphing.value = true;
      setTimeout(() => {
        isMorphing.value = false;
      }, 350);
    }

    // Use current mouse position for drag start, centering FAB on cursor
    startDrag(e, pendingDragStart.elementRect, pendingDragStart.containerRect, true);

    // Immediately update position to current cursor location
    const containerRect = props.contentAreaRect;
    if (containerRect) {
      updateDrag(e, containerRect);
    }

    emit('dragging-change', true);
    pendingDragStart = null;
  }

  if (!isDragging.value) return;

  const containerRect = props.contentAreaRect;
  if (containerRect) {
    updateDrag(e, containerRect);
  }
};

const handlePointerUp = () => {
  // Remove document listeners
  document.removeEventListener('pointermove', handlePointerMove);
  document.removeEventListener('pointerup', handlePointerUp);
  document.removeEventListener('pointercancel', handlePointerUp);

  // Clear pending drag start
  pendingDragStart = null;

  if (!isDragging.value) return;

  // Only mark as drag end if we actually moved
  if (didMove) {
    lastDragEndTime = Date.now();
  }

  endDrag();
  emit('dragging-change', false);
};

// Separate click handler - only fires if no drag occurred
let lastDragEndTime = 0;
const handleClick = () => {
  // Ignore clicks right after an actual drag (where movement occurred)
  if (didMove || Date.now() - lastDragEndTime < 200) return;

  if (currentSnapPoint.value?.type === 'fab') {
    emit('open-chat');
    // FTUX: Trigger chat-opened event
  } else {
    expand();
  }
};


const expand = async () => {
  isExpanded.value = true;
  await nextTick();
  textarea.value?.focus();

  // FTUX: Trigger cta-expanded event
};

const handleOpenChatClick = () => {
  emit('open-chat');
  // FTUX: Trigger chat-opened event
  ftuxTrigger('chat-opened');
};

const handleEscape = () => {
  if (props.chatMode === 'hidden') {
    isExpanded.value = false;
    textarea.value?.blur();
  }
};

const handleInput = () => {
  if (!textarea.value) return;
  textarea.value.style.height = 'auto';
  const newHeight = textarea.value.scrollHeight;
  const maxHeight = 200;
  textarea.value.style.height = Math.min(newHeight, maxHeight) + 'px';
  textarea.value.style.overflowY = newHeight > maxHeight ? 'auto' : 'hidden';
};

const handleSubmit = () => {
  if (!hasText.value) return;

  const message = inputText.value.trim();

  if (props.chatMode === 'hidden') {
    emit('request-open-chat', message);
  } else {
    emit('submit', message);
  }

  inputText.value = '';
  if (textarea.value) {
    textarea.value.style.height = 'auto';
  }

  // FTUX: Trigger message-sent event
};

// Watch preferFabMode - programmatically move between CTA and FAB based on view
watch(() => props.preferFabMode, (preferFab) => {
  // Skip if not in hidden mode, or expanded, or busy animating
  if (props.chatMode !== 'hidden' || isExpanded.value || isDragging.value || isAnimating.value) return;
  // Skip if snap points not ready
  if (!props.contentAreaRect || !initialized.value) return;

  const currentId = currentSnapPoint.value?.id;

  if (preferFab && currentId === 'bottom-center') {
    // Move to FAB corner
    moveToSnapPoint('bottom-right');
  } else if (!preferFab && currentId !== 'bottom-center') {
    // Move back to CTA center
    moveToSnapPoint('bottom-center');
  }
});

// Watch chat mode changes
watch(() => props.chatMode, (mode, oldMode) => {
  if (mode !== 'hidden') {
    isExpanded.value = true;
  } else if (oldMode && oldMode !== 'hidden') {
    isExpanded.value = false;
  }

  // Cancel any drag if chat mode changes
  if (isDragging.value) {
    cancelDrag();
    emit('dragging-change', false);
  }
}, { immediate: true });

// Track if we've initialized
const initialized = ref(false);

// Watch for content area changes to update snap points or initialize
watch(() => props.contentAreaRect, (rect) => {
  if (!rect) return;

  const snapPoints = getSnapPoints();
  if (snapPoints.length === 0) return;

  if (!initialized.value) {
    // First time we have valid snap points - initialize
    initializeDraggable(snapPoints);
    initialized.value = true;
  } else if (!isDragging.value && !isAnimating.value) {
    // Update position for resize
    updateForNewSnapPoints();
  }
}, { deep: true, immediate: true });

// Initialize draggable on mount if rect already available
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('mousedown', handleClickOutside);

  // Apply forced expanded state after layout settles
  if (props.forceExpanded && props.chatMode === 'hidden') {
    setTimeout(() => {
      isExpanded.value = true;
      nextTick(() => {
        if (props.forceInputText) {
          inputText.value = props.forceInputText;
        }
        textarea.value?.focus();
      });
    }, 200);
  } else if (props.forceInputText) {
    inputText.value = props.forceInputText;
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('pointermove', handlePointerMove);
  document.removeEventListener('pointerup', handlePointerUp);
  document.removeEventListener('pointercancel', handlePointerUp);
});

// Keyboard shortcuts (Cmd+K, Escape)
const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (props.chatMode === 'hidden' && !isExpanded.value) {
      if (isFabMode.value) {
        emit('open-chat');
      } else {
        expand();
      }
    } else if (props.chatMode === 'hidden') {
      textarea.value?.focus();
    }
  }

  // Escape to collapse expanded input (works even without focus)
  if (e.key === 'Escape' && props.chatMode === 'hidden' && isExpanded.value) {
    e.preventDefault();
    isExpanded.value = false;
  }
};

// Click outside to collapse expanded input (only in hidden mode, preserves text)
const handleClickOutside = (e) => {
  if (props.chatMode !== 'hidden' || !isExpanded.value) return;

  // Check if click was outside the expanded wrapper (includes suggestions + input)
  if (expandedWrapper.value && !expandedWrapper.value.contains(e.target)) {
    isExpanded.value = false;
  }
};
</script>

<style scoped>
.shared-input-wrapper {
  pointer-events: auto;
}

.ease-out-spring {
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Collapsed CTA with purple radial glow that fades to subtle purple shadow */
.collapsed-cta {
  border: 1px solid rgba(120, 120, 128, 0.16);
  box-shadow:
    0 4px 16px 0 rgba(0, 0, 0, 0.10),
    0 4px 32px 0 rgba(117, 99, 202, 0.25);
  animation: purple-glow-fade 3s ease-out;
  transition: border-color 0.3s ease, box-shadow 0.4s ease;
}

.collapsed-cta:hover:not(.dragging):not(.no-glow):not(.minimal-btn) {
  border-color: rgba(120, 120, 128, 0.24);
  box-shadow:
    64px -8px 76px 0 rgba(117, 99, 202, 0.30),
    -64px -8px 76px 0 rgba(117, 99, 202, 0.30),
    0 6px 20px 0 rgba(0, 0, 0, 0.15);
}

/* Dragging state */
.collapsed-cta.dragging {
  animation: none !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

/* Minimal/FAB mode - disable glow animation, use simple shadow */
.collapsed-cta.minimal-btn {
  animation: none;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.10);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}

/* Disable glow while animating position - keep simple shadow */
.collapsed-cta.no-glow {
  animation: none !important;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.10);
}

.collapsed-cta.minimal-btn:hover:not(.dragging) {
  transform: scale(1.12);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.15);
}

.collapsed-cta.minimal-btn:active:not(.dragging) {
  transform: scale(0.95);
}

@keyframes purple-glow-fade {
  0% {
    box-shadow:
      0 4px 16px 0 rgba(0, 0, 0, 0.10),
      0 4px 32px 0 rgba(117, 99, 202, 0.25);
  }
  30% {
    box-shadow:
      64px -8px 76px 0 rgba(117, 99, 202, 0.30),
      -64px -8px 76px 0 rgba(117, 99, 202, 0.30),
      0 4px 16px 0 rgba(0, 0, 0, 0.10),
      0 4px 32px 0 rgba(117, 99, 202, 0.25);
  }
  70% {
    box-shadow:
      64px -8px 76px 0 rgba(117, 99, 202, 0.15),
      -64px -8px 76px 0 rgba(117, 99, 202, 0.15),
      0 4px 16px 0 rgba(0, 0, 0, 0.10),
      0 4px 32px 0 rgba(117, 99, 202, 0.25);
  }
  100% {
    box-shadow:
      0 4px 16px 0 rgba(0, 0, 0, 0.10),
      0 4px 32px 0 rgba(117, 99, 202, 0.25);
  }
}


/* Liquid morph pop animation with shadow fade */
.morph-pop {
  animation: morph-pop 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
}

@keyframes morph-pop {
  0% {
    transform: scale(1);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
  }
  50% {
    transform: scale(0.92);
    box-shadow: 0 3px 12px 0 rgba(0, 0, 0, 0.08);
  }
  75% {
    transform: scale(1.08);
    box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.12);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.10);
  }
}

/* Open chat button */
.open-chat-btn {
  border: 1px solid rgba(120, 120, 128, 0.16);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.10);
}

.open-chat-btn:hover {
  box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.15);
}

/* White gradient overlay for expanded input modal effect */
.gradient-overlay {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.95) 40%,
    rgba(255, 255, 255, 0) 100%
  );
}

/* Enforce consistent max heights across all chat modes */
.expanded-input {
  max-height: 280px;
  transition: border-color 0.2s ease;
}

.expanded-input:focus-within {
  border-color: #71c5e8;
}

.expanded-input textarea {
  max-height: 200px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.expanded-input textarea::-webkit-scrollbar {
  width: 6px;
}

.expanded-input textarea::-webkit-scrollbar-track {
  background: transparent;
}

.expanded-input textarea::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.pill-stagger {
  opacity: 0;
  transform: translateY(6px);
  animation: pillFadeIn 400ms ease-out forwards;
}

.suggestions-gradient {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.9) 30%,
    rgba(255, 255, 255, 0) 100%
  );
}

.suggestion-container {
  opacity: 0;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  animation: pillFadeIn 400ms ease-out 500ms forwards;
}

.suggestion-stagger {
  opacity: 0;
  transform: translateY(6px);
  animation: pillFadeIn 400ms ease-out forwards;
}

@keyframes pillFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
