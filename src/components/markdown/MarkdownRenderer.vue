<template>
 <div class="markdown-content">
 <!-- Streaming Cursor -->
 <div v-if="streaming" class="inline-block w-0.5 h-4 bg-primary-600 animate-pulse ml-0.5"></div>
 
 <!-- Rendered Content -->
 <div 
 v-html="renderedContent"
 @click="handleClick"
      class="prose max-w-none"
 ></div>

 <!-- Citation Tooltip -->
 <CitationTooltip
 v-if="activeCitation"
 :citation="activeCitation"
 :position="tooltipPosition"
 @close="activeCitation = null"
 />
 </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMarkdown } from '../../composables/useMarkdown.js';
import CitationTooltip from './CitationTooltip.vue';

const props = defineProps({
 content: {
 type: String,
 required: true
 },
 streaming: {
 type: Boolean,
 default: false
 },
 citations: {
 type: Array,
 default: () => []
 },
 phase0Mode: {
 type: Boolean,
 default: false
 }
});

const { render, renderPlain } = useMarkdown();

const activeCitation = ref(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const renderedContent = computed(() => {
 if (props.phase0Mode) {
   return renderPlain(props.content);
 }
 return render(props.content);
});

const handleClick = (event) => {
 // Handle citation clicks
 const target = event.target;
 if (target.classList.contains('citation-marker')) {
 const citationId = target.getAttribute('data-citation-id');
 if (citationId && props.citations) {
 const citation = props.citations.find(c => c.id === citationId);
 if (citation) {
 const rect = target.getBoundingClientRect();
 tooltipPosition.value = {
 x: rect.left + rect.width / 2,
 y: rect.top
 };
 activeCitation.value = citation;
 }
 }
 }
 
 // Handle action button clicks
 if (target.classList.contains('action-button')) {
 const action = target.getAttribute('data-action');
 console.log('Action clicked:', action);
 // In a real app, this would trigger the action
 }
};

// Close tooltip on scroll
const handleScroll = () => {
 activeCitation.value = null;
};

onMounted(() => {
 window.addEventListener('scroll', handleScroll, true);
});

onUnmounted(() => {
 window.removeEventListener('scroll', handleScroll, true);
});
</script>

<style scoped>
/* Override some prose styles for better dark mode */
:deep(.prose) {
 @apply text-gray-800 ;
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4) {
 @apply text-gray-900 ;
}

:deep(.prose code) {
  @apply text-gray-800;
}

:deep(.prose pre) {
  @apply bg-gray-100;
}

:deep(.prose a) {
  @apply text-primary-600;
}

:deep(.prose strong) {
 @apply text-gray-900 ;
}

/* Smooth rendering for streaming */
:deep(*) {
 animation: fadeIn 0.1s ease-in;
}

@keyframes fadeIn {
 from {
 opacity: 0;
 }
 to {
 opacity: 1;
 }
}
</style>
