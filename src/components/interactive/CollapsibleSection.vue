<template>
 <details class="collapsible-section border border-gray-200 rounded-lg overflow-hidden">
 <summary class="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium text-gray-900 transition-colors">
 {{ title }}
 </summary>
 <div class="px-4 py-3 bg-white">
 <slot></slot>
 </div>
 </details>
</template>

<script setup>
defineProps({
 title: {
 type: String,
 required: true
 }
});
</script>
