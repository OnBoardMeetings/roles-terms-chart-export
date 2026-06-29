<template>
 <div class="flex flex-wrap gap-2">
 <button
 v-for="(action, index) in actions"
 :key="index"
 @click="handleAction(action)"
      class="px-4 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-primary-400 transition-all duration-200 shadow-sm hover:shadow"
 >
 {{ action.label }}
 </button>
 </div>
</template>

<script setup>
const props = defineProps({
 actions: {
 type: Array,
 default: () => []
 }
});

const emit = defineEmits(['send-message']);

const handleAction = (action) => {
 emit('send-message', { text: action.action, scenarioId: action.scenarioId || null });
};
</script>
