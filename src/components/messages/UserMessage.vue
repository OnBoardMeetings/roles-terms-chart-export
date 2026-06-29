<template>
 <div class="flex justify-end">
 <div class="max-w-[80%] rounded-2xl rounded-tr-sm px-5 py-3" style="background-color: rgba(116, 116, 128, 0.08);">
 <div class="text-gray-900">{{ content }}</div>
 </div>
 </div>
</template>

<script setup>
defineProps({
 content: {
 type: String,
 required: true
 }
});
</script>
