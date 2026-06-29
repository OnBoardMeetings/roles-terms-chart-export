<template>
	<div class="h-full">
		<RouterView />
	</div>
</template>

<script setup>
// MainView is now just a slot for vue-router. The parent passes chatMode /
// phase1Mode for historical reasons; they're no-ops here. Routed views under
// src/views/ render themselves inside this slot.
defineProps({
	chatMode: { type: String, default: 'hidden' },
	phase1Mode: { type: Boolean, default: false },
});

defineEmits(['toggle-chat', 'load-scenario']);
</script>
