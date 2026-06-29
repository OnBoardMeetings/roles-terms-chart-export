<template>
  <div class="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-40">
    <div
      ref="inputContainer"
      :class="[
        'pointer-events-auto transition-all',
        isExpanded ? 'duration-300' : 'duration-200'
      ]"
      :style="containerStyle"
    >
      <!-- Collapsed CTA Bar -->
      <div
        v-if="!isExpanded"
        @click="expand"
        class="flex items-center space-x-3 px-6 py-3 bg-white rounded-full shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl hover:border-gray-300 transition-all duration-200"
      >
        <img :src="SparklesLogo" alt="" class="w-5 h-5" />
        <span class="text-gray-500">Ask Anything</span>
        <div class="flex items-center space-x-1 text-gray-400 text-sm">
          <span class="text-xs">⌘</span>
          <span class="text-xs">K</span>
        </div>
      </div>

      <!-- Expanded Input -->
      <div
        v-else
        ref="expandedInput"
        :class="[
          'bg-white rounded-2xl shadow-xl border border-gray-200 p-3 transition-all',
          isAnimatingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        ]"
        :style="{ width: expandedWidth + 'px' }"
      >
        <!-- Textarea -->
        <textarea
          ref="textarea"
          rows="2"
          v-model="inputText"
          placeholder="Ask Anything..."
          class="w-full bg-transparent resize-none outline-none text-gray-900 placeholder-gray-400 leading-6"
          @input="handleInput"
          @keydown.enter.exact="handleSubmit"
          @keydown.shift.enter.prevent
          @keydown.escape="collapse"
          @blur="handleBlur"
        ></textarea>

        <!-- Bottom Controls -->
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center space-x-1.5">
            <!-- Attach Button -->
            <button class="flex items-center space-x-1.5 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              <span>Attach</span>
            </button>

            <!-- Sources Dropdown -->
            <button class="flex items-center space-x-1.5 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <span>Sources</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
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
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import SparklesLogo from '@/assets/SparklesGrandient.svg';

const emit = defineEmits(['submit', 'expand', 'collapse']);

const inputContainer = ref(null);
const expandedInput = ref(null);
const textarea = ref(null);
const inputText = ref('');
const isExpanded = ref(false);
const isAnimatingOut = ref(false);
const expandedWidth = ref(560);

const hasText = computed(() => inputText.value.trim().length > 0);

const containerStyle = computed(() => {
  if (isExpanded.value) {
    return {
      transform: 'translateY(0)',
    };
  }
  return {};
});

const expand = async () => {
  isExpanded.value = true;
  emit('expand');
  await nextTick();
  textarea.value?.focus();
};

const collapse = () => {
  if (hasText.value) return; // Don't collapse if there's text
  isExpanded.value = false;
  emit('collapse');
};

const handleBlur = (e) => {
  // Don't collapse if clicking within the expanded input
  if (expandedInput.value?.contains(e.relatedTarget)) return;
  // Small delay to allow button clicks to register
  setTimeout(() => {
    if (!hasText.value && !textarea.value?.matches(':focus')) {
      collapse();
    }
  }, 150);
};

const handleInput = () => {
  if (!textarea.value) return;
  textarea.value.style.height = 'auto';
  const newHeight = textarea.value.scrollHeight;
  const maxHeight = 160;
  textarea.value.style.height = Math.min(newHeight, maxHeight) + 'px';
  textarea.value.style.overflowY = newHeight > maxHeight ? 'auto' : 'hidden';
};

const handleSubmit = () => {
  if (!hasText.value) return;

  const message = inputText.value.trim();
  isAnimatingOut.value = true;

  // Get position for FLIP animation
  const rect = inputContainer.value?.getBoundingClientRect();

  setTimeout(() => {
    emit('submit', {
      message,
      startRect: rect
    });

    // Reset state
    inputText.value = '';
    isExpanded.value = false;
    isAnimatingOut.value = false;
    if (textarea.value) {
      textarea.value.style.height = 'auto';
    }
  }, 150);
};

// Keyboard shortcut (Cmd+K)
const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (!isExpanded.value) {
      expand();
    }
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
textarea {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
