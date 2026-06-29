<template>
 <div class="space-y-3">
 <!-- Tool Execution UI (hidden in Phase 0 and Phase 1 mode) -->
 <ToolExecutionUI
 v-if="filteredTools.length > 0 && !phase0Mode"
 :tools="filteredTools"
 />

 <!-- Message Content (only shows after tools complete, or immediately in Phase 0) -->
 <div v-if="toolsComplete" class="rounded-2xl rounded-tl-sm px-5 py-4">
 <MarkdownRenderer
 :content="displayContent"
 :streaming="streaming && !streamComplete"
 :phase0-mode="phase0Mode || phase1Mode"
 />
 </div>

 <!-- Suggested Actions (hidden in Phase 0 and Phase 1, except on welcome messages) -->
 <SuggestedActions
 v-if="suggestedActions && suggestedActions.length > 0 && toolsComplete && !phase0Mode && (!phase1Mode || isWelcome)"
 :actions="suggestedActions"
 @send-message="$emit('send-message', $event)"
 />
 </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import MarkdownRenderer from '../markdown/MarkdownRenderer.vue';
import ToolExecutionUI from './ToolExecutionUI.vue';
import SuggestedActions from '../interactive/SuggestedActions.vue';
import { useStreamingText } from '../../composables/useStreamingText.js';

const props = defineProps({
 content: {
 type: String,
 required: true
 },
 streaming: {
 type: Boolean,
 default: false
 },
 tools: {
 type: Array,
 default: () => []
 },
 citations: {
 type: Array,
 default: () => []
 },
 suggestedActions: {
 type: Array,
 default: () => []
 },
 phase0Mode: {
 type: Boolean,
 default: false
 },
 phase1Mode: {
 type: Boolean,
 default: false
 },
 isWelcome: {
 type: Boolean,
 default: false
 }
});

// Phase 1: map tool names to the 4 allowed MCP tools
const phase1ToolNameMap = {
  'list_upcoming_meetings': 'list_meetings',
  'list_meetings': 'list_meetings',
  'get_meeting_agenda': 'get_meeting',
  'get_meeting': 'get_meeting',
  'get_meeting_summary': 'get_meeting',
  'get_meeting_resolutions': 'get_meeting',
  'search_meeting_content': 'get_book_section_summary',
  'get_book_summary': 'get_book_summary',
  'get_book_section_summary': 'get_book_section_summary',
  'search_meetings': 'list_meetings',
  'search_documents': 'get_book_summary',
};

const filteredTools = computed(() => {
  if (!props.tools || props.tools.length === 0) return [];
  if (props.phase1Mode) {
    return props.tools
      .filter(t => t.name in phase1ToolNameMap)
      .map(t => ({ ...t, name: phase1ToolNameMap[t.name] }));
  }
  return props.tools;
});

// Check if all tools are complete (or no tools exist, or Phase 0/1 mode)
const toolsComplete = computed(() => {
 if (props.phase0Mode) return true; // Always show content immediately in Phase 0
 if (!props.tools || props.tools.length === 0) return true;
 return props.tools.every(tool => tool.status === 'completed' || tool.status === 'failed');
});

const { streamedText, isStreaming, streamText } = useStreamingText();
const streamComplete = ref(false);

const displayContent = ref(props.content);

watch(() => props.content, async (newContent) => {
 if (props.streaming) {
 streamComplete.value = false;
 await streamText(newContent, {
 speed: 15,
 onComplete: () => {
 streamComplete.value = true;
 }
 });
 displayContent.value = streamedText.value;
 
 // Watch for streaming updates
 const unwatch = watch(streamedText, (val) => {
 displayContent.value = val;
 });
 
 // Cleanup watcher when complete
 watch(streamComplete, (complete) => {
 if (complete) {
 unwatch();
 }
 });
 } else {
 displayContent.value = newContent;
 streamComplete.value = true;
 }
}, { immediate: true });
</script>
