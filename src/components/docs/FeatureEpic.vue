<template>
  <div class="feature-epic mb-10">
    <!-- Epic Header -->
    <div class="flex items-start space-x-3 mb-4 group">
      <div class="w-1 h-12 bg-primary-500 rounded-full flex-shrink-0 mt-0.5"></div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <button
            @click="copyFeature"
            class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-gray-100"
            :title="copied ? 'Copied!' : 'Copy feature'"
          >
            <svg v-if="!copied" class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-500">{{ description }}</p>
      </div>
    </div>

    <!-- Stories Container -->
    <div class="ml-4 pl-4 border-l-2 border-gray-100 space-y-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
});

const copied = ref(false);

const copyFeature = async () => {
  const text = `**${props.title}**\n${props.description}`;

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
.feature-epic {
  /* Epic styles */
}
</style>
