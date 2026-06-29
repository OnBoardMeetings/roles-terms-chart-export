<template>
  <div class="h-full flex overflow-hidden bg-gray-100 rounded-lg shadow-inner">
    <!-- Sidebar Navigation (from @onboardmeetings/design-system) -->
    <OBNavigationSideBar
      v-model:collapsed="sidebarCollapsed"
      :main-links="navLinks"
      :active-link-id="activeLinkId"
      organization-name="Passageways, Inc."
      user-name="Neophytos C. Palettas"
      @select="navigateTo($event.id)"
      @select-organization="router.push({ name: 'organization-selector' })"
    />

    <!-- Main Content Area -->
    <div ref="contentArea" class="flex-1 overflow-hidden relative">
      <!-- Main View (resizes in split, full in hidden/fullscreen) -->
      <div
        :class="[
          'absolute top-0 bottom-0 left-0',
          isResizing ? '' : 'transition-all duration-300 ease-in-out'
        ]"
        :style="{ right: chatMode === 'split' ? chatWidth + 'px' : '0' }"
      >
        <MainView
          :chat-mode="chatMode"
          :phase1-mode="phase1Mode"
          @toggle-chat="toggleChat"
          @load-scenario="emit('load-scenario', $event)"
        />
      </div>

      <!-- Resize Handle (only in split mode) -->
      <div
        v-if="chatMode === 'split'"
        class="absolute top-0 bottom-0 z-30"
        :style="{ right: chatWidth + 'px' }"
      >
        <div
          class="resize-handle absolute inset-y-0 -left-2 w-4 cursor-col-resize"
          @mousedown="startResize"
          @dblclick="resetWidth"
        >
        </div>
      </div>

      <!--
        Single Chat Container (animates between states). Same legacy
        Tailwind-inside-#ob-app-core caveat as ChatInterface and
        SharedChatInput — `text-base` overrides the OB scope's 10px
        font-size base so the chat header ("AI Assistant") and any
        descendant divs without explicit text-* classes read at the
        right size. Bandaid until the chat surfaces are rebuilt with
        DS primitives (see CLAUDE.md → Legacy chat surfaces).
      -->
      <div
        :class="[
          'absolute top-0 bottom-0 right-0 bg-white border-l border-gray-200 z-20 text-base',
          isResizing ? '' : 'transition-all duration-300 ease-in-out'
        ]"
        :style="chatContainerStyle"
      >
        <div v-if="chatMode !== 'hidden'" class="h-full flex flex-col overflow-visible">
          <!-- Chat Header -->
          <div class="h-14 flex items-center px-2 border-b border-gray-200 flex-shrink-0">
            <!-- Left: Expand/Collapse -->
            <div class="w-10 flex justify-start relative">
              <button
                v-if="chatMode === 'split'"
                @click="handleExpandClick"
                class="chat-expand-btn p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Expand"
              >
                <PanelRightOpen class="w-5 h-5" />
              </button>
              <button
                v-if="chatMode === 'fullscreen' && splitModeAvailable"
                @click="handleCollapseClick"
                class="chat-collapse-btn p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Collapse"
              >
                <PanelRightClose class="w-5 h-5" />
              </button>
            </div>

            <!-- Center: Title -->
            <div class="flex-1 flex items-center justify-center space-x-2">
              <img :src="SparklesLogo" alt="AI Assistant" class="w-5 h-5" />
              <span class="font-medium text-gray-900">AI Assistant</span>
            </div>

            <!-- Right: Close -->
            <div class="w-10 flex justify-end relative">
              <button
                @click="handleCloseClick"
                class="chat-close-btn p-2 text-gray-400 new-convo-btn hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Phase 1 New Conversation Topbar -->
          <div v-if="phase1Mode" class="h-14 flex items-center justify-end px-2 border-b border-gray-200 flex-shrink-0 relative">
            <button
              @click="showClearConfirm = true"
              class="flex items-center space-x-1.5 p-2 text-gray-400 new-convo-btn hover:bg-gray-100 rounded-lg transition-colors"
              title="Start new conversation"
              style="font-family: 'Lato', sans-serif;"
            >
              <span class="text-sm">New Conversation</span>
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>

          <!-- Conversation History Topbar (hidden in Phase 0 and Phase 1 mode) -->
          <div v-if="!emptyChat && !phase1Mode" class="h-14 flex items-center justify-between px-2 border-b border-gray-200 flex-shrink-0 relative" style="z-index: 40; overflow: visible;">
            <!-- Conversation Selector Dropdown -->
            <div class="relative">
              <button
                @click="showConversationDropdown = !showConversationDropdown"
                class="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span class="font-medium truncate max-w-[200px]">{{ emptyChat ? 'New Conversation' : currentConversation.title }}</span>
                <ChevronDown class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200" :class="{ 'rotate-180': showConversationDropdown }" />
              </button>

              <!-- Dropdown Menu -->
              <transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2"
              >
                <div
                  v-if="showConversationDropdown"
                  class="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[100]"
                >
                  <!-- Today Section -->
                  <div v-if="todayConversations.length > 0" class="px-3 py-1.5">
                    <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Today</span>
                  </div>
                  <button
                    v-for="conv in todayConversations"
                    :key="conv.id"
                    @click="selectConversation(conv)"
                    class="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span class="text-sm text-gray-700 truncate">{{ conv.title }}</span>
                    <span class="text-xs text-gray-400 flex-shrink-0 ml-2">{{ conv.time }}</span>
                  </button>

                  <!-- Older Section -->
                  <div v-if="olderConversations.length > 0" class="px-3 py-1.5 mt-2 border-t border-gray-100 pt-3">
                    <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Older</span>
                  </div>
                  <button
                    v-for="conv in olderConversations"
                    :key="conv.id"
                    @click="selectConversation(conv)"
                    class="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span class="text-sm text-gray-700 truncate">{{ conv.title }}</span>
                    <span class="text-xs text-gray-400 flex-shrink-0 ml-2">{{ conv.time }}</span>
                  </button>
                </div>
              </transition>
            </div>

            <!-- New Conversation Button -->
            <div class="w-10 flex justify-end">
              <button
                @click="createNewConversation"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="New Conversation"
              >
                <Plus class="w-5 h-5" />
              </button>
            </div>

            <!-- Click outside to close dropdown -->
            <div
              v-if="showConversationDropdown"
              class="fixed inset-0 z-[99]"
              @click="showConversationDropdown = false"
            ></div>
          </div>

          <!-- Chat Interface -->
          <div class="flex-1 overflow-hidden">
            <ChatInterface
              ref="chatInterface"
              :current-scenario="currentScenario"
              :chat-mode="chatMode"
              :pending-message="pendingMessage"
              :phase0-mode="emptyChat"
              :phase1-mode="phase1Mode"
              @load-scenario="$emit('load-scenario', $event)"
            />
          </div>
        </div>
      </div>

      <!-- Clear Conversation Confirmation Modal -->
      <transition
        enter-active-class="transition-opacity duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
      <div v-if="showClearConfirm" class="absolute inset-0 z-[200] flex items-center justify-center" @click.self="showClearConfirm = false">
        <div class="absolute inset-0 bg-black/30"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-[563px] z-10" style="font-family: 'Lato', sans-serif;">
          <div style="padding: 40px 40px 24px 40px;">
            <h3 style="color: #000; font-variant-numeric: slashed-zero; font-family: 'Lato', sans-serif; font-size: 28px; font-weight: 600; line-height: 34px;">Start new conversation?</h3>
            <p class="text-base text-gray-500" style="margin-top: 16px; font-family: 'Lato', sans-serif; font-weight: 400;">This will clear the current chat history and reset the assistant's context. Any previous messages won't be available.</p>
          </div>
          <div class="flex items-center justify-end" style="padding: 0 40px 40px 40px; gap: 24px;">
            <button
              @click="showClearConfirm = false"
              class="h-12 px-5 rounded-lg transition-colors modal-btn-hover"
              style="color: #4c4084; background-color: rgba(116, 116, 128, 0.08); font-variant-numeric: slashed-zero; font-family: 'Lato', sans-serif; font-size: 17px; font-weight: 400; line-height: 34px;"
            >Keep chatting</button>
            <button
              @click="confirmClearConversation"
              class="h-12 px-5 rounded-lg transition-colors hover:opacity-90"
              style="color: white; background-color: #4c4084; font-variant-numeric: slashed-zero; font-family: 'Lato', sans-serif; font-size: 17px; font-weight: 400; line-height: 34px;"
            >Start new</button>

          </div>
        </div>
      </div>
      </transition>

      <!-- Shared Chat Input (single element that moves between positions) -->
      <SharedChatInput
        :chat-mode="chatMode"
        :chat-width="chatWidth"
        :content-area-rect="contentAreaRect"
        :is-resizing="isResizing || sidebarAnimating"
        :prefer-fab-mode="preferFabMode"
        :force-expanded="forceExpanded"
        :force-input-text="forceInputText"
        :phase0-mode="emptyChat"
        :phase1-mode="phase1Mode"
        :show-prompt-pills="isWelcomeState"
        @submit="handleInputSubmit"
        @request-open-chat="handleOpenChatWithMessage"
        @open-chat="handleOpenChat"
        @pill-click="handlePillClick"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { X, PanelRightOpen, PanelRightClose, ChevronDown, Plus } from 'lucide-vue-next';
import SparklesLogo from '@/assets/SparklesGrandient.svg';
import { OBNavigationSideBar } from '@onboardmeetings/design-system';
import MainView from './MainView.vue';

// Nav items for the scaffold prototype. Uses the real product's feature-* icons
// bundled into the design-system package (src/icons/universal/). Names match the
// real product's NavigationMenuItem definitions in apps/core/src/features/
// navigation/composables/useNavigationLinks.ts.
const navLinks = [
  { id: 'home', label: 'Home', iconName: 'feature-home', iconLocation: 'Universal' },
  { id: 'search', label: 'Search', iconName: 'feature-search', iconLocation: 'Universal' },
  { id: 'meetings', label: 'Meetings', iconName: 'feature-meetings', iconLocation: 'Universal' },
  { id: 'notifications', label: 'Notifications', iconName: 'feature-notifications', iconLocation: 'Universal' },
  { id: 'resources', label: 'Resources', iconName: 'feature-resources', iconLocation: 'Universal' },
  { id: 'actions', label: 'Actions', iconName: 'feature-actions', iconLocation: 'Universal' },
  { id: 'messenger', label: 'Messenger', iconName: 'feature-messenger', iconLocation: 'Universal' },
  { id: 'directory', label: 'Directory', iconName: 'feature-directory', iconLocation: 'Universal' },
  { id: 'tasks', label: 'Tasks', iconName: 'feature-tasks', iconLocation: 'Universal' },
  { id: 'settings', label: 'Settings', iconName: 'feature-settings', iconLocation: 'Universal' },
];
import ChatInterface from './ChatInterface.vue';
import SharedChatInput from './SharedChatInput.vue';
import { scenarios } from '../../data/scenarios.js';

const STORAGE_KEY = 'agentic-chat-width';
const ABSOLUTE_MIN_WIDTH = 320; // Never go below this
const ABSOLUTE_MAX_WIDTH = 800; // Never exceed this
const MIN_MAIN_CONTENT_WIDTH = 400; // Main content needs at least this
const SPLIT_MODE_MIN_CONTENT_WIDTH = 900; // Below this, split mode disabled
const DEFAULT_WIDTH = 420;

const props = defineProps({
  currentScenario: Object,
  initialChatMode: {
    type: String,
    default: 'split'
  },
  emptyChat: {
    type: Boolean,
    default: false
  },
  forceDropdown: {
    type: Boolean,
    default: false
  },
  forceExpanded: {
    type: Boolean,
    default: false
  },
  forceSidebar: {
    type: String,
    default: null
  },
  forceChatWidth: {
    type: Number,
    default: null
  },
  forceInputText: {
    type: String,
    default: ''
  },
  phase1Mode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['load-scenario', 'chat-mode-change', 'split-available-change', 'reset-conversation']);

// Layout state
const sidebarCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true');
const sidebarAnimating = ref(false);

// Routing: active sidebar link mirrors the current route name. Clicking a nav
// item calls router.push — the routing state lives in the URL hash.
const route = useRoute();
const router = useRouter();
const activeLinkId = computed(() => (typeof route.name === 'string' ? route.name : 'home'));
const navigateTo = (id) => {
	router.push({ name: id }).catch(() => {});
};

// Views that prefer FAB mode over full CTA.
const fabPreferredViews = ['settings', 'directory', 'tasks'];
const preferFabMode = computed(() => fabPreferredViews.includes(activeLinkId.value));
const chatMode = ref(props.initialChatMode);
const contentArea = ref(null);
const chatInterface = ref(null);
const preferredChatMode = ref('split'); // Remember user's preferred mode
const pendingMessage = ref(null); // Message from shared input
const contentAreaRect = ref(null); // For positioning shared input

// Conversation history state - uses scenario titles as fake conversations
const showConversationDropdown = ref(props.forceDropdown);
const currentConversation = ref({ id: 'new', title: 'New Conversation' });

// Build conversations from scenarios with fake times
// In Phase 0 mode (emptyChat), only show Phase 0 scenarios
// In Phase 1 mode, show Phase 0 + Phase 1 scenarios
const conversations = computed(() => {
  const times = ['3h', '6h', '6d', '1w', '2w', '1mo'];
  const filteredScenarios = props.emptyChat
    ? scenarios.filter(s => s.category === 'phase0')
    : props.phase1Mode
      ? scenarios.filter(s => s.category === 'phase0' || s.category === 'phase1' || s.category === 'future')
      : scenarios;
  return filteredScenarios.map((s, i) => ({
    id: s.id,
    title: s.title,
    time: times[i] || '1mo',
    group: i < 2 ? 'today' : 'older'
  }));
});

const todayConversations = computed(() => conversations.value.filter(c => c.group === 'today'));
const olderConversations = computed(() => conversations.value.filter(c => c.group === 'older'));

// Chat width with persistence
const chatWidth = ref(DEFAULT_WIDTH);
const contentAreaWidth = ref(1200); // Default, updated on mount/resize

// Dynamic constraints based on content area width
const dynamicMinWidth = computed(() => {
  // 30% of content area, but respect absolute bounds
  const percentBased = Math.floor(contentAreaWidth.value * 0.3);
  return Math.max(ABSOLUTE_MIN_WIDTH, Math.min(percentBased, 400));
});

const dynamicMaxWidth = computed(() => {
  // 55% of content area or leave at least MIN_MAIN_CONTENT_WIDTH for main content
  const maxByPercent = Math.floor(contentAreaWidth.value * 0.55);
  const maxByMainContent = contentAreaWidth.value - MIN_MAIN_CONTENT_WIDTH;
  return Math.min(ABSOLUTE_MAX_WIDTH, Math.max(dynamicMinWidth.value, Math.min(maxByPercent, maxByMainContent)));
});

// Whether split mode is available at current width
const splitModeAvailable = computed(() => {
  return contentAreaWidth.value >= SPLIT_MODE_MIN_CONTENT_WIDTH;
});

// Computed style for chat container
const chatContainerStyle = computed(() => {
  switch (chatMode.value) {
    case 'hidden':
      return { width: '0px' };
    case 'split':
      return { width: chatWidth.value + 'px' };
    case 'fullscreen':
      return { width: '100%' };
    default:
      return { width: '0px' };
  }
});

// Update content area rect for input positioning and width tracking
const updateContentAreaRect = () => {
  if (contentArea.value) {
    const rect = contentArea.value.getBoundingClientRect();
    contentAreaRect.value = rect;
    contentAreaWidth.value = rect.width;

    // Clamp chat width to new dynamic bounds
    if (chatWidth.value < dynamicMinWidth.value) {
      chatWidth.value = dynamicMinWidth.value;
    } else if (chatWidth.value > dynamicMaxWidth.value) {
      chatWidth.value = dynamicMaxWidth.value;
    }
  }
};

// ResizeObserver for detecting container size changes
let resizeObserver = null;

// Load saved width on mount and track content area
onMounted(() => {
  // Initial rect update first to establish contentAreaWidth
  updateContentAreaRect();

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed)) {
      // Clamp to current dynamic bounds
      chatWidth.value = Math.min(dynamicMaxWidth.value, Math.max(dynamicMinWidth.value, parsed));
    }
  }

  // Watch for content area size changes (e.g., when pattern panel toggles)
  resizeObserver = new ResizeObserver(() => {
    updateContentAreaRect();
  });
  if (contentArea.value) {
    resizeObserver.observe(contentArea.value);
  }

  // Apply URL param force overrides
  if (props.forceSidebar === 'expanded') {
    sidebarCollapsed.value = false;
  } else if (props.forceSidebar === 'collapsed') {
    sidebarCollapsed.value = true;
  }
  if (props.forceChatWidth !== null && !isNaN(props.forceChatWidth)) {
    chatWidth.value = props.forceChatWidth;
  }

  // Emit initial split availability
  emit('split-available-change', splitModeAvailable.value);
});

// Resize handling
const isResizing = ref(false);

const startResize = (e) => {
  isResizing.value = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
};

const handleResize = (e) => {
  if (!isResizing.value || !contentArea.value) return;

  const containerRect = contentArea.value.getBoundingClientRect();
  const newWidth = containerRect.right - e.clientX;

  // Clamp between dynamic min and max
  chatWidth.value = Math.min(dynamicMaxWidth.value, Math.max(dynamicMinWidth.value, newWidth));
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';

  // Persist to localStorage
  localStorage.setItem(STORAGE_KEY, chatWidth.value.toString());

  // FTUX: Trigger panel-resized event
};

// Chat header button handlers with FTUX triggers
const handleExpandClick = () => {
  chatMode.value = 'fullscreen';
};

const handleCollapseClick = () => {
  chatMode.value = 'split';
};

const handleCloseClick = () => {
  chatMode.value = 'hidden';
};

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

// Sync chatMode with prop changes
watch(() => props.initialChatMode, (newMode) => {
  chatMode.value = newMode;
});

// Track if user has sent a message in the current session
const userHasSentMessage = ref(false);
const pillsDelayed = ref(false);
const showClearConfirm = ref(false);
const conversationUsageDemo = ref(false);
let conversationDemoVersion = 0;

const confirmClearConversation = () => {
  showClearConfirm.value = false;
  pillsDelayed.value = true;
  setTimeout(() => {
    userHasSentMessage.value = false;
    currentConversation.value = { id: 'new', title: 'New Conversation' };
    emit('reset-conversation');
    setTimeout(() => {
      pillsDelayed.value = false;
    }, 1000);
  }, 200);
};

// Sync conversation title when scenario changes externally
watch(() => props.currentScenario, (newScenario) => {
  // Cancel any running demo if switching away
  if (!newScenario || newScenario.id !== 'conversation-usage') {
    conversationUsageDemo.value = false;
  }

  // Reset sent message flag on scenario change
  userHasSentMessage.value = false;

  if (newScenario) {
    currentConversation.value = {
      id: newScenario.id,
      title: newScenario.title
    };

    // Auto-demo: when conversation-usage pattern loads, simulate full welcome → pill → reset flow
    if (newScenario.id === 'conversation-usage') {
      const demoVersion = ++conversationDemoVersion;

      // Step 1: Wait for welcome to render, then auto-click a pill
      setTimeout(async () => {
        if (conversationDemoVersion !== demoVersion) return;

        // Simulate pill click: hide pills first, then submit
        const pillText = 'Summarize the board book for my next meeting';
        userHasSentMessage.value = true;

        // Wait for pills to fade out, then submit the message
        await new Promise(resolve => setTimeout(resolve, 400));
        if (conversationDemoVersion !== demoVersion) return;

        pendingMessage.value = pillText;
        setTimeout(() => { pendingMessage.value = null; }, 100);

        // Load the book-qa response inline
        setTimeout(() => {
          if (conversationDemoVersion !== demoVersion) return;
          if (chatInterface.value?.handlePillMessage) {
            chatInterface.value.handlePillMessage({ text: pillText, scenarioId: 'book-qa' });
          }

          // Demo stops here — compaction notice is visible for user to review
        }, 300);
      }, 3500);
    }
  }
}, { immediate: true });

// Track if we auto-switched away from split due to constraints
const autoSwitchedFromSplit = ref(false);

// Watch for split mode availability changes
watch(splitModeAvailable, (available) => {
  emit('split-available-change', available);

  if (!available && chatMode.value === 'split') {
    // Auto-switch to fullscreen if split becomes unavailable while in split mode
    autoSwitchedFromSplit.value = true;
    chatMode.value = 'fullscreen';
  } else if (available && autoSwitchedFromSplit.value && chatMode.value === 'fullscreen') {
    // Return to split when constraints allow, if we auto-switched away
    autoSwitchedFromSplit.value = false;
    chatMode.value = 'split';
  }
});

// Track sidebar animation and persist state
watch(sidebarCollapsed, (collapsed) => {
  sidebarAnimating.value = true;
  setTimeout(() => {
    sidebarAnimating.value = false;
  }, 300); // Match sidebar transition duration
  // Persist sidebar state to localStorage
  localStorage.setItem('sidebar-collapsed', collapsed ? 'true' : 'false');
});

const toggleChat = () => {
  if (chatMode.value === 'hidden') {
    // Use split if available, otherwise fullscreen
    chatMode.value = splitModeAvailable.value ? 'split' : 'fullscreen';
  } else {
    chatMode.value = 'hidden';
  }
};

// Reset to default width on double-click
const resetWidth = () => {
  chatWidth.value = DEFAULT_WIDTH;
  localStorage.setItem(STORAGE_KEY, DEFAULT_WIDTH.toString());
};

// Handle submit when chat is already open
const handleInputSubmit = (message) => {
  userHasSentMessage.value = true;
  pendingMessage.value = message;
  // Clear after ChatInterface processes it
  setTimeout(() => {
    pendingMessage.value = null;
  }, 100);
};

// Get effective preferred mode (respects split availability)
const effectivePreferredMode = computed(() => {
  if (preferredChatMode.value === 'split' && !splitModeAvailable.value) {
    return 'fullscreen';
  }
  return preferredChatMode.value;
});

// Handle request to open chat with a message (from hidden state)
const handleOpenChatWithMessage = (message) => {
  // Open chat first (input will animate to new position)
  chatMode.value = effectivePreferredMode.value;

  // Then add the message after animation starts
  setTimeout(() => {
    pendingMessage.value = message;
    setTimeout(() => {
      pendingMessage.value = null;
    }, 100);
  }, 300);
};

// Handle opening chat without a message (from circular button)
const handleOpenChat = () => {
  chatMode.value = effectivePreferredMode.value;
};

// Track preferred mode when user manually changes it
watch(chatMode, (newMode) => {
  emit('chat-mode-change', newMode);
  // Remember non-hidden modes as preferred
  if (newMode !== 'hidden') {
    preferredChatMode.value = newMode;
  }
});

// Conversation history functions
const selectConversation = (conv) => {
  currentConversation.value = conv;
  showConversationDropdown.value = false;
  // Load the selected scenario
  emit('load-scenario', conv.id);
};

const createNewConversation = () => {
  currentConversation.value = { id: 'new', title: 'New Conversation' };
  showConversationDropdown.value = false;
};

// Whether the chat is in welcome state (no user messages yet)
const isWelcomeState = computed(() => {
  if (pillsDelayed.value) return false;
  if (userHasSentMessage.value) return false;
  if (!props.currentScenario?.messages) return true;
  return !props.currentScenario.messages.some(m => m.role === 'user');
});

// Handle pill click from SharedChatInput — load scenario response inline
const handlePillClick = (payload) => {
  if (payload.scenarioId) {
    // Small delay to let the user message appear first
    setTimeout(() => {
      chatInterface.value?.handlePillMessage?.(payload);
    }, 300);
  }
};


</script>

<style scoped>
.modal-btn-hover:hover {
  background-color: rgba(120, 120, 128, 0.16) !important;
}

.new-convo-btn:hover {
  color: rgba(60, 60, 67, 0.6);
}
</style>


