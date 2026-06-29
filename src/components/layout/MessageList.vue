<template>
  <div
    ref="messageContainer"
    class="p-6 pb-24 space-y-6"
  >
 <transition-group
 name="message"
 tag="div"
 class="space-y-6"
 >
 <div
 v-for="(message, index) in messages"
 :key="`message-${index}`"
 class="animate-fade-in"
 :data-user-message="message.role === 'user' ? '' : undefined"
 >
 <!-- User Message -->
 <UserMessage
 v-if="message.role === 'user'"
 :content="message.content"
 />

 <!-- Assistant Message -->
 <AssistantMessage
 v-else-if="message.role === 'assistant'"
 :content="message.content"
 :streaming="message.streaming"
 :tools="message.tools"
 :citations="message.citations"
 :suggested-actions="message.suggestedActions"
 :is-welcome="message.isWelcome"
 :phase0-mode="phase0Mode"
 :phase1-mode="phase1Mode"
 @send-message="$emit('send-message', $event)"
 />

 <!-- System Message: Compaction Notice -->
 <div v-else-if="message.role === 'system' && message.hint === 'new-conversation-link'">
   <div class="bg-white rounded-lg border border-gray-200 p-3">
     <div class="flex items-start space-x-2">
       <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" style="color: #FFC03F;">
         <path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.03226C11.8265 1.03226 14.9677 4.13145 14.9677 8C14.9677 11.8481 11.8513 14.9677 8 14.9677C4.15342 14.9677 1.03226 11.8528 1.03226 8C1.03226 4.15474 4.14845 1.03226 8 1.03226ZM8 0C3.58203 0 0 3.58332 0 8C0 12.4193 3.58203 16 8 16C12.418 16 16 12.4193 16 8C16 3.58332 12.418 0 8 0ZM6.83871 11.0968H7.22581V7.22581H6.83871C6.62494 7.22581 6.45161 7.05248 6.45161 6.83871V6.58065C6.45161 6.36687 6.62494 6.19355 6.83871 6.19355H8.3871C8.60087 6.19355 8.77419 6.36687 8.77419 6.58065V11.0968H9.16129C9.37506 11.0968 9.54839 11.2701 9.54839 11.4839V11.7419C9.54839 11.9557 9.37506 12.129 9.16129 12.129H6.83871C6.62494 12.129 6.45161 11.9557 6.45161 11.7419V11.4839C6.45161 11.2701 6.62494 11.0968 6.83871 11.0968ZM8 3.35484C7.4299 3.35484 6.96774 3.817 6.96774 4.3871C6.96774 4.95719 7.4299 5.41935 8 5.41935C8.5701 5.41935 9.03226 4.95719 9.03226 4.3871C9.03226 3.817 8.5701 3.35484 8 3.35484Z" fill="currentColor"/>
       </svg>
       <span class="text-xs text-gray-500">{{ message.content }}</span>
     </div>
   </div>
 </div>
 </div>
 </transition-group>

 <!-- Loading State -->
 <LoadingState v-if="isLoading"/>
 </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import UserMessage from '../messages/UserMessage.vue';
import AssistantMessage from '../messages/AssistantMessage.vue';
import LoadingState from '../messages/LoadingState.vue';

const props = defineProps({
 messages: {
 type: Array,
 default: () => []
 },
 isLoading: {
 type: Boolean,
 default: false
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

const messageContainer = ref(null);

// Find scrollable parent
const getScrollParent = (element) => {
  if (!element) return null;
  let parent = element.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};

// Auto-scroll to bottom when messages change
watch(() => props.messages.length, async () => {
  await nextTick();
  const scrollParent = getScrollParent(messageContainer.value);
  if (scrollParent) {
    scrollParent.scrollTo({
      top: scrollParent.scrollHeight,
      behavior: 'smooth'
    });
  }
});
</script>

<style scoped>
.message-enter-active {
 transition: all 0.3s ease-out;
}

.message-enter-from {
 opacity: 0;
 transform: translateY(20px);
}

.message-leave-active {
 transition: all 0.2s ease-in;
}

.message-leave-to {
 opacity: 0;
 transform: translateY(-20px);
}
</style>
