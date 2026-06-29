<template>
 <teleport to="body">
 <transition
 enter-active-class="transition-all duration-200"
 enter-from-class="opacity-0 scale-95"
 enter-to-class="opacity-100 scale-100"
 leave-active-class="transition-all duration-150"
 leave-from-class="opacity-100 scale-100"
 leave-to-class="opacity-0 scale-95"
 >
 <div
 v-if="citation"
 class="fixed z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4"
 :style="tooltipStyle"
 @click.stop
 >
 <!-- Citation Content -->
 <div class="space-y-2">
 <div class="flex items-start justify-between">
 <div class="flex-1">
 <h4 class="text-sm font-semibold text-gray-900">
 {{ citation.title }}
 </h4>
 <p class="text-xs text-gray-600 mt-1">
 {{ citation.authors }}{{ citation.year ? ` (${citation.year})` : '' }}
 </p>
 </div>
 <button
 @click="$emit('close')"
 class="text-gray-400 hover:text-gray-600 ml-2"
 >
 ✕
 </button>
 </div>
 
 <p v-if="citation.excerpt" class="text-xs text-gray-700 italic">
 "{{ citation.excerpt }}"
 </p>
 
 <div v-if="citation.url" class="pt-2 border-t border-gray-200">
 <a
 :href="citation.url"
 target="_blank"
 class="text-xs text-primary-600 hover:underline inline-flex items-center"
 >
 View full source →
 </a>
 </div>
 </div>

 <!-- Arrow -->
 <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-200 rotate-45"></div>
 </div>
 </transition>
 </teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
 citation: {
 type: Object,
 default: null
 },
 position: {
 type: Object,
 default: () => ({ x: 0, y: 0 })
 }
});

defineEmits(['close']);

const tooltipStyle = computed(() => {
 return {
 left: `${props.position.x}px`,
 top: `${props.position.y - 10}px`,
 transform: 'translate(-50%, -100%)'
 };
});
</script>
