<template>
	<div class="chart-entry-row">
		<span class="chart-entry-row__cell chart-entry-row__avatar">
			<span class="chart-entry-row__initials systemCaption-2">{{ initials }}</span>
		</span>
		<span class="chart-entry-row__cell chart-entry-row__name systemBody">
			{{ person.UserFirstName }}&nbsp;<span class="systemFont-Bold">{{ person.UserLastName }}</span>
		</span>
		<span class="chart-entry-row__cell systemBody">{{ person.GroupName }}</span>
		<span class="chart-entry-row__cell systemBody">{{ person.RoleName }}</span>
		<span class="chart-entry-row__cell systemBody">{{ service }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { ChartPerson } from '../models/RoleEntry';

const props = defineProps<{
	person: ChartPerson;
	/** Pre-formatted "x yr y mo" service string from the composable. */
	service: string;
}>();

// Product resolves an OBAvatar image via the org-privilege store; the prototype
// has no avatar service, so it falls back to initials exactly as product does
// when no privilege record exists for the user.
const initials = computed(
	() =>
		(props.person.UserFirstName.charAt(0) + props.person.UserLastName.charAt(0)).toUpperCase(),
);
</script>

<style scoped lang="scss">
.chart-entry-row {
	height: calc(5.6 * var(--r));
	display: flex;
	align-items: center;

	&__cell {
		display: inline-block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		padding-right: calc(0.8 * var(--r));
		color: var(--system-label-primary);
	}

	// Column widths mirror the header row in the source RoleEntryChart.
	&__cell:nth-child(1) {
		width: 6%;
	}
	&__cell:nth-child(2) {
		width: 31%;
	}
	&__cell:nth-child(3) {
		width: 30%;
	}
	&__cell:nth-child(4) {
		width: 15%;
	}
	&__cell:nth-child(5) {
		width: 18%;
	}

	&__avatar {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	&__initials {
		background: var(--system-grey4);
		height: calc(2.4 * var(--r));
		width: calc(2.4 * var(--r));
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: var(--system-label-primary);
	}
}
</style>
