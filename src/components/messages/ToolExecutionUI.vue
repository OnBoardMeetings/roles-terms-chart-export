<template>
 <div class="space-y-2">
 <!-- Parallel Tools -->
 <div v-if="isParallel" class="bg-white rounded-lg border border-gray-200 p-4">
 <div class="flex items-center space-x-2 mb-3">
 <div class="text-sm font-medium text-gray-700">
 🔄 Running {{ tools.length }} tools in parallel
 </div>
 </div>
 <div class="space-y-2">
 <div
 v-for="(tool, index) in tools"
 :key="index"
 class="flex items-center justify-between p-2 bg-gray-50 rounded"
 >
 <div class="flex items-center space-x-2 flex-1">
 <span :class="getStatusIcon(tool.status)">
 {{ getIcon(tool.status) }}
 </span>
 <span class="text-sm text-gray-700">{{ formatToolName(tool.name) }}</span>
 </div>
 <div v-if="tool.duration" class="text-xs text-gray-500">
 {{ tool.duration }}ms
 </div>
 </div>
 </div>
 </div>

 <!-- Sequential/Single Tools -->
 <div v-else class="space-y-2">
 <div
 v-for="(tool, index) in tools"
 :key="index"
 class="bg-white rounded-lg border border-gray-200 p-3"
 >
 <div class="flex items-center justify-between">
 <div class="flex items-center space-x-2">
 <span :class="getStatusIcon(tool.status)">
 {{ getIcon(tool.status) }}
 </span>
 <span class="text-sm font-medium text-gray-700">
 {{ formatToolName(tool.name) }}
 </span>
 </div>
 <div class="flex items-center space-x-2">
 <span class="text-xs text-gray-500">
 {{ getStatusText(tool.status) }}
 </span>
 <span v-if="tool.duration" class="text-xs text-gray-500">
 {{ tool.duration }}ms
 </span>
 </div>
 </div>
 
 <!-- Progress Steps -->
 <div v-if="tool.progressSteps" class="mt-3 space-y-1">
 <div
 v-for="(step, stepIndex) in tool.progressSteps"
 :key="stepIndex"
 class="flex items-center space-x-2 text-xs"
 >
 <div class="w-1 h-1 rounded-full bg-primary-500"></div>
 <span class="text-gray-600">{{ step }}</span>
 </div>
 </div>

 <!-- Error Message -->
 <div v-if="tool.error" class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
 {{ tool.error }}
 </div>
 </div>
 </div>
 </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
 tools: {
 type: Array,
 default: () => []
 }
});

const isParallel = computed(() => {
 return props.tools.some(t => t.parallel);
});

const formatToolName = (name) => {
 return name
 .split('_')
 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
 .join(' ');
};

const getIcon = (status) => {
 const icons = {
 completed: '✓',
 running: '⋯',
 queued: '○',
 failed: '✗'
 };
 return icons[status] || '○';
};

const getStatusIcon = (status) => {
 const colors = {
 completed: 'text-green-600 ',
 running: 'text-blue-600 animate-pulse',
 queued: 'text-gray-400 ',
 failed: 'text-red-600 '
 };
 return colors[status] || 'text-gray-400';
};

const getStatusText = (status) => {
 const texts = {
 completed: 'Completed',
 running: 'Running',
 queued: 'Queued',
 failed: 'Failed'
 };
 return texts[status] || 'Unknown';
};
</script>
