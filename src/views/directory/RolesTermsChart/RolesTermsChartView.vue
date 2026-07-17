<template>
	<div class="roles-terms-chart" :class="{ 'is-collapsed': tableCollapsed }">
		<!-- Data panel: sortable people table. Hidden when collapsed. -->
		<div class="roles-terms-chart__table">
			<div class="roles-terms-chart__header system-background-grouped-tertiary">
				<span class="roles-terms-chart__col roles-terms-chart__col--avatar" />
				<button
					v-for="col in sortColumns"
					:key="col.field"
					class="roles-terms-chart__col roles-terms-chart__sort"
					:class="`roles-terms-chart__col--${col.field}`"
					@click="setSort(col.field)"
				>
					<span class="roles-terms-chart__col-label">
						<span class="systemBody systemFont-SemiBold">{{ col.label }}</span>
						<span v-if="col.sublabel" class="systemCaption-2 system-label-secondary">
							{{ col.sublabel }}
						</span>
					</span>
					<OBIcon
						location="Universal"
						:name="sortIcon(col.field)"
						size="calc(1.2 * var(--r))"
						use-default-coloring
					/>
				</button>
			</div>

			<div v-if="people.length" class="roles-terms-chart__body">
				<ChartEntryRow
					v-for="person in people"
					:key="person.Id"
					:person="person"
					:service="serviceLabel(person.TimeServed)"
				/>
			</div>
			<div v-else class="roles-terms-chart__empty">
				<p class="systemBody system-label-secondary">No roles or terms to display.</p>
			</div>
		</div>

		<!-- Timeline panel: term bars on a year-scaled track. -->
		<div v-if="people.length" class="roles-terms-chart__timeline">
			<TermTimeline :people="people" :scale="scale" :color-for="colorFor" />
		</div>

		<!-- Centered collapse button — surfaces on hover while the data panel is
		     shown; collapses it to give the chart full width. Mirrors product's
		     .collapse-chart-button. -->
		<button
			v-if="people.length && !tableCollapsed"
			class="roles-terms-chart__collapse-btn"
			aria-label="Hide data panel"
			@click="toggleCollapse"
		>
			<OBIcon location="Lucide" name="ChevronLeft" size="calc(2 * var(--r))" />
		</button>

		<!-- Left-edge bar that brings the data panel back when collapsed.
		     Mirrors product's .collapsed-left-table-bar. -->
		<button
			v-if="people.length && tableCollapsed"
			class="roles-terms-chart__expand-bar"
			aria-label="Show data panel"
			@click="toggleCollapse"
		>
			<OBIcon location="Lucide" name="ChevronRight" size="calc(2 * var(--r))" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { OBIcon } from '@onboardmeetings/design-system';

import ChartEntryRow from './components/ChartEntryRow.vue';
import TermTimeline from './components/TermTimeline.vue';
import { useRolesTermsChart } from './composables/useRolesTermsChart';
import type { SortField } from './models/RoleEntry';

const {
	people,
	scale,
	sortField,
	sortAsc,
	tableCollapsed,
	setSort,
	toggleCollapse,
	colorFor,
	serviceLabel,
} = useRolesTermsChart();

interface SortColumn {
	field: SortField;
	label: string;
	sublabel?: string;
}

const sortColumns: SortColumn[] = [
	{ field: 'name', label: 'Name' },
	{ field: 'group', label: 'Group' },
	{ field: 'role', label: 'Role' },
	{ field: 'serviceYears', label: 'Service', sublabel: 'as of today' },
];

const sortIcon = (field: SortField): string => {
	if (sortField.value !== field) return 'sort-solid';
	return sortAsc.value ? 'sort-up-solid' : 'sort-down-solid';
};
</script>

<style scoped lang="scss">
.roles-terms-chart {
	display: flex;
	position: relative;
	height: 100%;
	// Transparent + flush: the host (RolesTermsTab) provides the white card
	// and surrounding inset.
	background-color: transparent;

	&__table {
		display: flex;
		flex-direction: column;
		width: 50%;
		min-width: 0;
	}

	&__header {
		display: flex;
		align-items: center;
		height: calc(5.6 * var(--r));
		border-radius: calc(1.2 * var(--r)) 0 0 0;
		overflow: hidden;
		padding: 0 calc(0.8 * var(--r));
	}

	&__col {
		display: inline-flex;
		align-items: center;
		min-width: 0;

		&--avatar {
			width: 6%;
		}
		&--name {
			width: 31%;
		}
		&--group {
			width: 30%;
		}
		&--role {
			width: 15%;
		}
		&--serviceYears {
			width: 18%;
		}
	}

	&__sort {
		background: transparent;
		border: 0;
		padding: 0;
		cursor: pointer;
		gap: calc(0.8 * var(--r));
		color: var(--system-label-primary);
		text-align: left;
	}

	&__col-label {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	&__body {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0 calc(0.8 * var(--r));
	}

	&__empty {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: calc(4.8 * var(--r));
	}

	&__timeline {
		flex: 1;
		min-width: 0;
		border-left: calc(0.1 * var(--r)) solid var(--system-grey5);
	}

	// Hover affordances mirror product: the collapse button surfaces and the
	// chart's divider takes the primary colour.
	&:hover &__collapse-btn {
		display: flex;
	}
	&:hover &__timeline {
		border-left-color: var(--system-primary);
	}

	// Collapsed: hide the data panel and clear room for the left-edge bar.
	&.is-collapsed &__table {
		display: none;
	}
	&.is-collapsed &__timeline {
		margin-left: calc(2.8 * var(--r));
	}

	&__collapse-btn {
		display: none;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 2;
		align-items: center;
		justify-content: center;
		width: calc(3.2 * var(--r));
		height: calc(3.2 * var(--r));
		background: #e4e4e6;
		border: 0;
		border-radius: calc(1 * var(--r));
		cursor: pointer;
		color: var(--system-label-secondary);
	}

	&__expand-bar {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		z-index: 2;
		width: calc(2.8 * var(--r));
		background: rgba(116, 116, 128, 0.2);
		border: 0;
		border-radius: calc(1.2 * var(--r)) 0 0 calc(1.2 * var(--r));
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--system-label-secondary);
	}
}
</style>
