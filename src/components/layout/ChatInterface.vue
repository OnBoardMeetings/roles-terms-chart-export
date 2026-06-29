<template>
  <!-- text-base sets a 16px font-size base for the chat subtree so
       descendant Tailwind divs without an explicit text-* class read
       at the expected size. AppShell sits inside `#ob-app-core`
       (10px base for the DS em-cascade trick on OBNavigationSideBar
       et al.); the chat UI is meta-chrome and shouldn't participate
       in that cascade. Bounding the override to the chat root keeps
       the DS components untouched. -->
  <div class="bg-white h-full relative text-base">
    <!-- Scroll container - extends full height, content scrolls behind input -->
    <div class="absolute inset-0 overflow-y-auto scrollbar-thin" data-chat-scroll>
      <!-- Max-width wrapper for fullscreen readability -->
      <div :class="chatMode === 'fullscreen' ? 'max-w-3xl mx-auto' : ''">
        <MessageList
          :messages="displayMessages"
          :is-loading="isLoading"
          :phase0-mode="phase0Mode"
          :phase1-mode="phase1Mode"
          @send-message="handlePillMessage"
        />
      </div>
      <!-- Space for content to scroll up past input area (SharedChatInput overlays here) -->
      <div class="h-[140px]"></div>
    </div>

    <!-- Fade Overlay -->
    <div class="absolute bottom-[100px] left-0 right-0 h-32 pointer-events-none blur-overlay"></div>

    <!-- Scrollbar mask -->
    <div class="absolute bottom-[100px] right-0 w-2 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

    <!-- Input backdrop area (input itself is SharedChatInput in AppShell) -->
    <div class="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none">
      <div class="absolute inset-x-0 top-0 bottom-0 bg-white/80 backdrop-blur-md"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import MessageList from './MessageList.vue';

const props = defineProps({
  currentScenario: Object,
  chatMode: {
    type: String,
    default: 'split'
  },
  pendingMessage: {
    type: String,
    default: null
  },
  phase0Mode: {
    type: Boolean,
    default: false
  },
  phase1Mode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['load-scenario']);
import { getScenario } from '../../data/scenarios.js';

const displayMessages = ref([]);
const isLoading = ref(false);
const streamingEnabled = ref(false);

// Watch for pending messages from SharedChatInput
watch(() => props.pendingMessage, (message) => {
  if (message) {
    displayMessages.value.push({
      role: 'user',
      content: message
    });
  }
});

// Scroll to show the user message at the top of the view
const scrollToUserMessage = () => {
  nextTick(() => {
    const scrollContainer = document.querySelector('[data-chat-scroll]');
    if (scrollContainer) {
      // Find the last user message element
      const userMessages = scrollContainer.querySelectorAll('[data-user-message]');
      const lastUserMsg = userMessages[userMessages.length - 1];
      if (lastUserMsg) {
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const msgTop = lastUserMsg.getBoundingClientRect().top;
        const offset = msgTop - containerTop - 16; // 16px padding from top
        scrollContainer.scrollBy({ top: offset, behavior: 'smooth' });
      }
    }
  });
};

// Handle messages from suggested action pills (user message already added via submit)
const handlePillMessage = async (payload) => {
  const { text, scenarioId } = typeof payload === 'string' ? { text: payload, scenarioId: null } : payload;

  if (scenarioId) {
    const scenario = getScenario(scenarioId);
    if (scenario) {
      // Find the assistant response messages (skip the welcome and first user message)
      const responseMessages = scenario.messages.filter(m => m.role === 'assistant').slice(1);

      for (const message of responseMessages) {
        // Show tool execution first
        if (message.tools && message.tools.length > 0) {
          const msgIndex = displayMessages.value.length;
          displayMessages.value.push({
            ...message,
            tools: message.tools.map(t => ({ ...t, status: 'running' }))
          });
          isLoading.value = true;
          scrollToUserMessage();

          await new Promise(resolve => setTimeout(resolve, 1500));

          // Complete tools
          displayMessages.value[msgIndex] = {
            ...displayMessages.value[msgIndex],
            tools: message.tools.map(t => ({ ...t, status: 'completed' }))
          };
          isLoading.value = false;
          scrollToUserMessage();

          await new Promise(resolve => setTimeout(resolve, 600));
        } else {
          isLoading.value = true;
          await new Promise(resolve => setTimeout(resolve, 1200));

          displayMessages.value.push(message);
          isLoading.value = false;
          scrollToUserMessage();

          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }
    }
  }
};

// Cancellation token for in-progress streaming
let streamingVersion = 0;

// Watch for scenario changes
watch(() => props.currentScenario, async (newScenario) => {
  if (!newScenario) return;

  // Cancel any in-progress streaming
  const thisVersion = ++streamingVersion;

  displayMessages.value = [];
  isLoading.value = false;

  // Only show initial loading if there are user messages (not welcome-only)
  const hasUserMessages = newScenario.messages.some(m => m.role === 'user');
  if (hasUserMessages) {
    isLoading.value = true;
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    if (streamingVersion !== thisVersion) return;
  }

  // Add messages with animation
  for (let i = 0; i < newScenario.messages.length; i++) {
    if (streamingVersion !== thisVersion) return;
    const message = newScenario.messages[i];

    if (message.role === 'user') {
      displayMessages.value.push(message);
      scrollToUserMessage();
      await new Promise(resolve => setTimeout(resolve, 600));
      if (streamingVersion !== thisVersion) return;
    } else {
      // Only show loading for assistant messages that come after a user message
      const previousMessage = i > 0 ? newScenario.messages[i - 1] : null;
      if (previousMessage && previousMessage.role === 'user') {
        // Show loading/tools for generated assistant messages
        if (message.tools && message.tools.length > 0) {
          // Add message with tools in running state
          const messageIndex = displayMessages.value.length;
          displayMessages.value.push({
            ...message,
            tools: message.tools.map(tool => ({ ...tool, status: 'running' }))
          });
          scrollToUserMessage();

          // Wait for tools to "complete"
          await new Promise(resolve => setTimeout(resolve, 1500));
          if (streamingVersion !== thisVersion) return;

          // Update the same message's tools to completed (in place)
          displayMessages.value[messageIndex] = {
            ...displayMessages.value[messageIndex],
            tools: message.tools.map(tool => ({ ...tool, status: 'completed' }))
          };

          isLoading.value = false;
          scrollToUserMessage();
          await new Promise(resolve => setTimeout(resolve, 800));
          if (streamingVersion !== thisVersion) return;
        } else {
          isLoading.value = true;
          await new Promise(resolve => setTimeout(resolve, 1200));
          if (streamingVersion !== thisVersion) return;

          displayMessages.value.push({
            ...message,
            streaming: streamingEnabled.value && message.streaming
          });

          isLoading.value = false;
          scrollToUserMessage();
          await new Promise(resolve => setTimeout(resolve, 800));
          if (streamingVersion !== thisVersion) return;
        }
      } else {
        // Welcome message or other non-generated message
        displayMessages.value.push({
          ...message,
          streaming: streamingEnabled.value && message.streaming
        });

        await new Promise(resolve => setTimeout(resolve, 400));
        if (streamingVersion !== thisVersion) return;
      }
    }
  }

  isLoading.value = false;
}, { immediate: true });

defineExpose({ handlePillMessage });
</script>

<style scoped>
.blur-overlay {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.9) 30%,
    rgba(255, 255, 255, 0) 100%
  );
}
</style>
