<template>
	<div class="role-entry-table" :class="{ 'is-print': print }">
		<div class="role-entry-table__header system-background-grouped-tertiary">
			<span class="role-entry-table__cell role-entry-table__cell--avatar" />
			<!-- Print export renders static column labels (no sort buttons/icons) —
			     the export is content, not an interactive control. -->
			<component
				:is="print ? 'span' : 'button'"
				v-for="col in columns"
				:key="col.key"
				class="role-entry-table__cell role-entry-table__sort"
				@click="print ? undefined : setSort(col.key)"
			>
				<span class="systemBody systemFont-Bold">{{ col.label }}</span>
				<OBIcon
					v-if="!print"
					location="Universal"
					:name="sortIcon(col.key)"
					size="calc(1.2 * var(--r))"
					use-default-coloring
				/>
			</component>
		</div>

		<div v-if="sortedRows.length" class="role-entry-table__body">
			<div v-for="row in sortedRows" :key="row.key" class="role-entry-table__row">
				<span class="role-entry-table__cell role-entry-table__cell--avatar">
					<span class="role-entry-table__initials systemCaption-2">{{ initials(row) }}</span>
				</span>
				<span class="role-entry-table__cell systemBody">
					{{ row.UserFirstName }}&nbsp;<span class="systemFont-Bold">{{ row.UserLastName }}</span>
				</span>
				<span class="role-entry-table__cell systemBody">{{ row.GroupName }}</span>
				<span class="role-entry-table__cell systemBody">{{ row.RoleName }}</span>
				<span class="role-entry-table__cell systemBody">{{ row.TermNumber ?? '—' }}</span>
				<span class="role-entry-table__cell systemBody">{{ fmt(row.TermStartDateOnly) }}</span>
				<span class="role-entry-table__cell systemBody">{{ row.TermEndDateOnly ? fmt(row.TermEndDateOnly) : 'No End Date' }}</span>
				<span class="role-entry-table__cell role-entry-table__status">
					<span class="role-entry-table__dot" :class="`is-${row.status}`" />
					<span class="systemCallout">{{ statusLabel(row.status) }}</span>
				</span>

				<!-- Trailing per-row actions — mirrors product's RoleEntryListItem
				     `more-item` overflow menu (Add Next Term / Update Role & Term /
				     Delete). Absolutely positioned so the 8 data columns keep the
				     product's width mapping. Omitted from the print export. -->
				<span v-if="!print" class="role-entry-table__more">
					<OBMenu location="bottom end" :menu-items="rowActions(row)" :width="220">
						<template #activator="{ props: menuProps }">
							<button
								class="role-entry-table__more-trigger"
								v-bind="menuProps"
								aria-label="Row actions"
							>
								<OBIcon
									location="Lucide"
									name="Ellipsis"
									size="calc(1.8 * var(--r))"
									use-default-coloring
								/>
							</button>
						</template>
					</OBMenu>
				</span>
			</div>
		</div>
		<div v-else class="role-entry-table__empty">
			<p class="systemBody system-label-secondary">No roles or terms to display.</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { OBIcon, OBMenu, type IMenuItem } from '@onboardmeetings/design-system';

import { useRolesTermsChart, type EntryRow, type TermStatus } from '../composables/useRolesTermsChart';

const props = defineProps<{ rows: EntryRow[]; print?: boolean }>();

const { removeEntry } = useRolesTermsChart();

// Overflow-menu actions per row — same three entries product exposes on each
// RoleEntryListItem. Add Next Term / Update Role open editing flows the proxy
// doesn't model, so they're inert here; Delete drops the term from local state.
const rowActions = (row: EntryRow): IMenuItem[] => [
	{
		dataTestId: 'RoleEntryAddNextTerm',
		label: 'Add Next Term',
		iconRight: 'CirclePlus',
		iconRightLocation: 'Lucide',
		action: () => {},
	},
	{
		dataTestId: 'RoleEntryUpdate',
		label: 'Update Role & Term',
		iconRight: 'Pencil',
		iconRightLocation: 'Lucide',
		dividerBottom: true,
		action: () => {},
	},
	{
		dataTestId: 'RoleEntryDelete',
		label: 'Delete',
		iconRight: 'Trash2',
		iconRightLocation: 'Lucide',
		isDestructive: true,
		action: () => removeEntry(row),
	},
];

type SortKey = 'name' | 'group' | 'role' | 'term' | 'start' | 'end' | 'status';

const columns: { key: SortKey; label: string }[] = [
	{ key: 'name', label: 'Name' },
	{ key: 'group', label: 'Group' },
	{ key: 'role', label: 'Role' },
	{ key: 'term', label: 'Term' },
	{ key: 'start', label: 'Start' },
	{ key: 'end', label: 'End' },
	{ key: 'status', label: 'Status' },
];

// Inherits the chart's grouping order until a column is clicked.
const sortField = ref<SortKey | ''>('');
const sortAsc = ref(true);

function setSort(key: SortKey): void {
	if (sortField.value === key) sortAsc.value = !sortAsc.value;
	else {
		sortField.value = key;
		sortAsc.value = true;
	}
}

const sortIcon = (key: SortKey): string => {
	if (sortField.value !== key) return 'sort-solid';
	return sortAsc.value ? 'sort-up-solid' : 'sort-down-solid';
};

const STATUS_ORDER: Record<TermStatus, number> = { active: 0, upcoming: 1, past: 2 };

const sortValue = (r: EntryRow, key: SortKey): string | number => {
	switch (key) {
		case 'name':
			return r.UserLastName.toLowerCase();
		case 'group':
			return r.GroupName.toLowerCase();
		case 'role':
			return r.RoleName.toLowerCase();
		case 'term':
			return r.TermNumber ?? 0;
		case 'start':
			return new Date(r.TermStartDateOnly).getTime();
		case 'end':
			return r.TermEndDateOnly ? new Date(r.TermEndDateOnly).getTime() : Number.POSITIVE_INFINITY;
		case 'status':
			return STATUS_ORDER[r.status];
	}
};

const sortedRows = computed(() => {
	if (!sortField.value) return props.rows;
	const dir = sortAsc.value ? 1 : -1;
	const key = sortField.value;
	return [...props.rows].sort((a, b) => {
		const av = sortValue(a, key);
		const bv = sortValue(b, key);
		if (av < bv) return -dir;
		if (av > bv) return dir;
		return 0;
	});
});

const initials = (r: EntryRow): string =>
	(r.UserFirstName.charAt(0) + r.UserLastName.charAt(0)).toUpperCase();

// timeZone: 'UTC' — the *DateOnly values parse as UTC midnight; formatting in
// local time would shift them a day (e.g. 2020-01-01 → "Dec 31, 2019").
const DATE_FMT = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC',
});
const fmt = (iso: string): string => DATE_FMT.format(new Date(iso));

const statusLabel = (s: TermStatus): string =>
	({ active: 'Active', past: 'Past', upcoming: 'Upcoming' })[s];
</script>

<style scoped lang="scss">
.role-entry-table {
	display: flex;
	flex-direction: column;
	height: 100%;
	// Transparent + flush: the host (RolesTermsTab) provides the white card
	// and surrounding inset.
	background-color: transparent;

	&__header,
	&__row {
		display: flex;
		align-items: center;
		height: calc(5.6 * var(--r));
		// Right inset reserves room for the absolutely-positioned ⋯ menu —
		// product does the same with `padding-right: 2rem` on its rows.
		padding: 0 calc(3.2 * var(--r)) 0 calc(1.6 * var(--r));
	}

	&__header {
		border-radius: calc(1.2 * var(--r)) calc(1.2 * var(--r)) 0 0;
	}

	&__row {
		position: relative;
		border-bottom: calc(0.1 * var(--r)) solid var(--system-grey6, rgba(116, 116, 128, 0.12));
	}

	&__body {
		flex: 1;
		overflow-y: auto;
	}

	&__cell {
		display: inline-block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		padding-right: calc(0.8 * var(--r));
		color: var(--system-label-primary);
	}

	// Sortable header cell — label + sort icon, mirrors product's clickable headers.
	&__sort {
		display: inline-flex;
		align-items: center;
		gap: calc(0.6 * var(--r));
		background: transparent;
		border: 0;
		padding: 0 calc(0.8 * var(--r)) 0 0;
		cursor: pointer;
		color: var(--system-label-primary);
		text-align: left;
	}

	// Column widths mirror product's RoleEntryListItem body-row
	// (avatar / Name / Group / Role / Term / Start / End / Status).
	&__cell:nth-child(1) { width: 6%; }
	&__cell:nth-child(2) { width: 15%; }
	&__cell:nth-child(3) { width: 15%; }
	&__cell:nth-child(4) { width: 12%; }
	&__cell:nth-child(5) { width: 8%; }
	&__cell:nth-child(6) { width: 16%; }
	&__cell:nth-child(7) { width: 16%; }
	&__cell:nth-child(8) { width: 12%; }

	&__cell--avatar {
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
	}

	&__status {
		display: flex;
		align-items: center;
		// Matches product's status-indicator margin-right: 0.8rem.
		gap: calc(0.8 * var(--r));
	}

	&__dot {
		// 10px dot — product's status-indicator is 1rem.
		width: calc(1 * var(--r));
		height: calc(1 * var(--r));
		border-radius: 50%;
		flex-shrink: 0;

		// Colours mirror product: active=green, upcoming=purple, past=red.
		&.is-active {
			background: var(--system-green);
		}
		&.is-past {
			background: var(--system-red);
		}
		&.is-upcoming {
			background: var(--system-purple);
		}
	}

	// Trailing ⋯ actions — pinned to the right edge of each row, matching
	// product's absolutely-positioned `more-item`.
	&__more {
		position: absolute;
		right: calc(0.8 * var(--r));
		top: 0;
		height: 100%;
		display: flex;
		align-items: center;
	}

	&__more-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 0;
		padding: calc(0.4 * var(--r));
		cursor: pointer;
		color: var(--system-primary);
		border-radius: 50%;

		&:hover {
			background: var(--system-grey6, rgba(116, 116, 128, 0.12));
		}
	}

	&__empty {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: calc(4.8 * var(--r));
	}

	// Print export: no ⋯ reserve, static (non-clickable) headers, and let the
	// preview page own the scroll/pagination instead of an inner scroll region.
	&.is-print {
		.role-entry-table__header,
		.role-entry-table__row {
			padding-right: calc(1.6 * var(--r));
		}

		.role-entry-table__sort {
			cursor: default;
		}

		.role-entry-table__body {
			overflow: visible;
		}
	}
}
</style>
