<template>
	<div class="directory-view system-background-grouped-primary">
		<!-- Directory section tabs — mirrors the product's UserDirectory tab bar
		     (Members / Groups / Roles & Terms / Skills Tracking). Roles & Terms is
		     the third tab and the only one this prototype builds out. -->
		<div class="directory-view__tabs">
			<OBTabs v-model="activeTab" variant="underline" :tabs="directoryTabs" />
		</div>

		<div class="directory-view__body">
			<RolesTermsTab v-if="activeTab === 'roles'" />
			<div v-else class="directory-view__placeholder systemTitle-3 system-label-secondary">
				{{ activeLabel }} isn’t part of this prototype — it focuses on Roles &amp; Terms.
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { OBTabs } from '@onboardmeetings/design-system';

import RolesTermsTab from './RolesTermsChart/RolesTermsTab.vue';

const directoryTabs = [
	{ key: 'members', label: 'Members' },
	{ key: 'groups', label: 'Groups' },
	{ key: 'roles', label: 'Roles & Terms' },
	{ key: 'skills', label: 'Skills Tracking' },
];

const activeTab = ref('roles');
const activeLabel = computed(() => directoryTabs.find(t => t.key === activeTab.value)?.label ?? '');
</script>

<style scoped lang="scss">
.directory-view {
	display: flex;
	flex-direction: column;
	height: 100%;

	&__tabs {
		background-color: var(--system-background-primary);
		padding: calc(1.2 * var(--r)) calc(2.4 * var(--r)) 0;
	}

	&__body {
		flex: 1;
		min-height: 0;
	}

	&__placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: calc(4.8 * var(--r));
		text-align: center;
	}
}
</style>
