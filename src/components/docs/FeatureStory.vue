<template>
  <div class="feature-story bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Story Header -->
    <div
      class="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- ID & Title -->
          <div class="flex items-center space-x-2">
            <span class="text-xs font-mono text-gray-400">{{ id }}</span>
            <span class="text-sm font-medium text-gray-900">{{ title }}</span>
          </div>
        </div>

        <!-- Tags & Actions -->
        <div class="flex items-center space-x-2">
          <span
            v-for="tag in tags"
            :key="tag"
            class="hidden sm:inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
          >
            {{ tag }}
          </span>
          <button
            @click.stop="copyStory"
            class="p-1.5 rounded hover:bg-gray-200 transition-colors"
            :title="copied ? 'Copied!' : 'Copy story'"
          >
            <svg v-if="!copied" class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <svg
            :class="[
              'w-4 h-4 text-gray-400 transition-transform duration-200',
              isExpanded ? 'rotate-180' : ''
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Expanded Content -->
    <div
      v-show="isExpanded"
      class="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50"
    >
      <!-- User Story -->
      <div class="mb-3">
        <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">User Story</h5>
        <p ref="descriptionRef" class="text-sm text-gray-700 italic">
          <slot name="description"></slot>
        </p>
      </div>

      <!-- Acceptance Criteria -->
      <div>
        <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Acceptance Criteria</h5>
        <ul ref="acceptanceRef" class="text-sm text-gray-600 space-y-1">
          <slot name="acceptance"></slot>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'pending',
    validator: (value) => ['pending', 'in-progress', 'complete'].includes(value)
  },
  tags: {
    type: Array,
    default: () => []
  }
});

const isExpanded = ref(false);
const copied = ref(false);
const descriptionRef = ref(null);
const acceptanceRef = ref(null);

const statusStyles = computed(() => {
  switch (props.status) {
    case 'complete':
      return { bg: 'bg-green-500', text: 'text-green-600' };
    case 'in-progress':
      return { bg: 'bg-blue-500', text: 'text-blue-600' };
    default:
      return { bg: 'bg-gray-200', text: 'text-gray-400' };
  }
});

const copyStory = async () => {
  // Get description text from slot
  const descText = descriptionRef.value?.textContent?.trim() || '';

  // Get acceptance criteria from slot
  const acItems = acceptanceRef.value?.querySelectorAll('li') || [];
  const acText = Array.from(acItems)
    .map(li => `- ${li.textContent?.trim()}`)
    .join('\n');

  const text = `**${props.id} - ${props.title}**

**User Story:**
${descText}

**Acceptance Criteria:**
${acText}`;

  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<style scoped>
.feature-story ul {
  list-style: none;
  padding: 0;
}

.feature-story ul li {
  position: relative;
  padding-left: 1.25rem;
}

.feature-story ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
}
</style>
