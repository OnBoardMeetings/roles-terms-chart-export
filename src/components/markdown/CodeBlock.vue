<template>
 <div class="code-block relative group">
 <!-- Header -->
 <div class="flex items-center justify-between px-4 py-2 rounded-t-lg">
 <span class="text-xs font-medium">{{ language }}</span>
 <button
 @click="copyCode"
 class="text-xs px-2 py-1 hover:bg-gray-600 rounded transition-colors"
 >
 {{ copied ? '✓ Copied!' : 'Copy' }}
 </button>
 </div>

 <!-- Code Content -->
 <pre class="bg-gray-900 p-4 rounded-b-lg overflow-x-auto text-sm"><code :class="`language-${language}`">{{ code }}</code></pre>
 </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
 code: {
 type: String,
 required: true
 },
 language: {
 type: String,
 default: 'text'
 },
 showLineNumbers: {
 type: Boolean,
 default: false
 }
});

const copied = ref(false);

const copyCode = async () => {
 try {
 await navigator.clipboard.writeText(props.code);
 copied.value = true;
 setTimeout(() => {
 copied.value = false;
 }, 2000);
 } catch (err) {
 console.error('Failed to copy:', err);
 }
};
</script>
