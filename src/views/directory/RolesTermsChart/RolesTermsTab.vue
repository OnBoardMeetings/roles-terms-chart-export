<template>
	<div class="roles-terms-tab system-background-grouped-primary">
		<!-- White rounded card on the grey page — product wraps the toolbar,
		     filters, and chart/table in one `grouped-components` card. -->
		<div class="roles-terms-tab__card system-background-grouped-secondary">
		<!-- Toolbar: chart/table toggle (left) + Export and filter actions (right).
		     Mirrors the header row in RolesTermsList.vue. -->
		<div class="roles-terms-tab__toolbar">
			<OBTabs
				v-model="viewKey"
				variant="segmented"
				:tabs="viewTabs"
				data-test-id="RolesTermsViewToggle"
			/>

			<div class="roles-terms-tab__actions">
				<!-- Export opens a modal to choose type (Excel / PDF) and destination
				     (download or save into an OnBoard resource folder). -->
				<PhaseGate path="roles-terms-visual-export">
					<OBButton
						variant="primary"
						size="small"
						rounded
						text="Export"
						@click="showExportModal = true"
					/>
				</PhaseGate>
				<OBButton
					variant="secondary"
					size="small"
					rounded
					:text="showFilters ? 'Hide filters' : 'Show filters'"
					@click="showFilters = !showFilters"
				/>
			</div>
		</div>

		<!-- Filter panel — gray container with dropdown buttons + selected tags.
		     Mirrors product's RoleEntryFilter (member/group/role/term/timeframe/
		     status). -->
		<div v-if="showFilters" class="roles-terms-tab__filters system-background-grouped-tertiary">
			<div class="roles-terms-tab__dropdowns" :class="{ 'has-tags': activeTags.length }">
				<FilterMultiSelect
					class="roles-terms-tab__select"
					label="Members"
					:options="memberOptions"
					:selected-values="filters.members"
					@toggle="v => toggleFilter('members', v)"
					@clear="filters.members = []"
				/>
				<FilterMultiSelect
					class="roles-terms-tab__select"
					label="Groups"
					:options="groupOptions"
					:selected-values="filters.groups"
					@toggle="v => toggleFilter('groups', v)"
					@clear="filters.groups = []"
				/>
				<FilterMultiSelect
					class="roles-terms-tab__select"
					label="Roles"
					:options="roleOptions"
					:selected-values="filters.roles"
					@toggle="v => toggleFilter('roles', v)"
					@clear="filters.roles = []"
				/>
				<FilterMultiSelect
					class="roles-terms-tab__select"
					label="Terms"
					:options="termOptions"
					:selected-values="filters.terms"
					@toggle="v => toggleFilter('terms', v)"
					@clear="filters.terms = []"
				/>
				<FilterMultiSelect
					class="roles-terms-tab__select"
					label="Timeframe"
					:options="timeframeOptions"
					:selected-values="filters.timeframe ? [filters.timeframe] : []"
					@toggle="setTimeframe"
					@clear="filters.timeframe = ''"
				/>
				<FilterMultiSelect
					class="roles-terms-tab__select"
					label="Status"
					:options="statusOptions"
					:selected-values="filters.statuses"
					@toggle="v => toggleFilter('statuses', v)"
					@clear="filters.statuses = []"
				/>
			</div>

			<div v-if="activeTags.length" class="roles-terms-tab__tags">
				<span
					v-for="tag in activeTags"
					:key="`${tag.dimension}-${tag.value}`"
					class="roles-terms-tab__tag systemFootnote systemFont-SemiBold"
				>
					{{ tag.label }}
					<button class="roles-terms-tab__tag-clear" aria-label="Remove filter" @click="removeTag(tag)">
						<OBIcon location="Lucide" name="X" size="calc(1.4 * var(--r))" />
					</button>
				</span>
				<button class="roles-terms-tab__tag-clearall systemFootnote" @click="clearFilters">
					Clear all
				</button>
			</div>
		</div>

		<!-- Add area — table view only, mirrors product's AddRolesList. Three
		     entry points (by group / by member / manually) that open the inline
		     role-entry builder. Admin-only in product. -->
		<div v-if="viewKey === 'table'" class="roles-terms-tab__add system-background-grouped-tertiary">
			<OBButton
				class="roles-terms-tab__add-button"
				variant="secondary"
				size="large"
				:text="'Add by Group'"
				@click="onAdd('group')"
			/>
			<OBButton
				class="roles-terms-tab__add-button"
				variant="secondary"
				size="large"
				:text="'Add by Member'"
				@click="onAdd('member')"
			/>
			<OBButton
				class="roles-terms-tab__add-button"
				variant="secondary"
				size="large"
				:text="'Add manually'"
				@click="onAdd('manual')"
			/>
		</div>

		<!-- Active view. The toggle swaps the chart timeline and the flat table;
		     both read the same filtered, sorted data from the composable. -->
		<div class="roles-terms-tab__view">
			<RolesTermsChartView v-if="viewKey === 'chart'" />
			<RoleEntryTable v-else :rows="entryRows" />
		</div>
		</div>

		<!-- Export flow: choose type + destination → download, board preview, or
		     save into a resource folder. `contained` renders each modal's overlay
		     in place inside #ob-app-core (scrim limited to the prototype frame)
		     instead of teleporting it to <body> over the whole hosting site. -->
		<v-defaults-provider :defaults="overlayDefaults">
			<ExportModal v-model="showExportModal" @download="onDownload" @resources="onResources" />
			<AddToResourcesModal v-model="showResourcesModal" @add="onAddedToResources" />

			<!-- Toast queue for download / save confirmations — contained too, so
			     it appears within the prototype frame, not over the hosting site. -->
			<OBSnackbarQueue />
		</v-defaults-provider>

		<!-- The board-ready preview is a full-page document view; keep it
		     viewport-sized (not contained) — confining it to the prototype frame
		     clipped its content. -->
		<RolesTermsPrintPreview v-model="showPrintPreview" :view="viewKey" />
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import {
	OBButton,
	OBIcon,
	OBSnackbarQueue,
	OBTabs,
	useSnackbarQueueStore,
	type IOBTab,
} from '@onboardmeetings/design-system';

import RolesTermsChartView from './RolesTermsChartView.vue';
import RoleEntryTable from './components/RoleEntryTable.vue';
import RolesTermsPrintPreview from './components/RolesTermsPrintPreview.vue';
import ExportModal from './components/ExportModal.vue';
import AddToResourcesModal from './components/AddToResourcesModal.vue';
import FilterMultiSelect from './components/FilterMultiSelect.vue';
import { useRolesTermsChart } from './composables/useRolesTermsChart';
import PhaseGate from '@/components/flags/PhaseGate.vue';

const {
	entryRows,
	filters,
	memberOptions,
	groupOptions,
	roleOptions,
	termOptions,
	statusOptions,
	timeframeOptions,
	activeTags,
	hasActiveFilters,
	toggleFilter,
	setTimeframe,
	removeTag,
	clearFilters,
} = useRolesTermsChart();

const viewKey = ref<'chart' | 'table'>('chart');
const showFilters = ref(false);
const showPrintPreview = ref(false);
const showExportModal = ref(false);
const showResourcesModal = ref(false);
const snackbar = useSnackbarQueueStore();

// Keep modal overlays + scrim inside the prototype frame (#ob-app-core) rather
// than teleported to <body> over the whole hosting site.
const overlayDefaults = {
	VDialog: { contained: true },
	VOverlay: { contained: true },
	VSnackbar: { contained: true },
};

const viewTabs: IOBTab[] = [
	{ key: 'chart', label: 'Chart', iconLeft: 'ChartColumn', iconLeftLocation: 'Lucide' },
	{ key: 'table', label: 'Table', iconLeft: 'Table', iconLeftLocation: 'Lucide' },
];

const emit = defineEmits<{
	export: [filtered: boolean];
	add: [mode: 'group' | 'member' | 'manual'];
}>();

// Download: Excel simulates a file download + confirmation toast; PDF opens the
// board-ready preview to print / save (its visual fidelity is the point).
function onDownload(type: 'excel' | 'pdf'): void {
	if (type === 'pdf') {
		showPrintPreview.value = true;
		return;
	}
	emit('export', hasActiveFilters.value);
	snackbar.addSnack({
		text: 'Your Excel download is complete.',
		actionVariant: 'primary',
		hideAction: true,
	});
}

// Save-to-Resources: open the folder picker (type carries over from the export
// modal, so it isn't re-selected here).
function onResources(): void {
	showResourcesModal.value = true;
}

function onAddedToResources(payload: { folder: string; fileName: string }): void {
	snackbar.addSnack({
		text: `“${payload.fileName}” added to ${payload.folder}.`,
		actionVariant: 'primary',
		hideAction: true,
	});
}

// Product opens a group/member picker dialog (RolesTermsAddByDialog) or drops
// straight into the inline builder for "manually". The proxy surfaces the
// entry points and emits the intent; the builder flow isn't modeled here.
const onAdd = (mode: 'group' | 'member' | 'manual') => emit('add', mode);
</script>

<style scoped lang="scss">
.roles-terms-tab {
	display: flex;
	flex-direction: column;
	height: 100%;
	// Grey gutter around the white card.
	padding: calc(2.4 * var(--r));

	&__card {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		border-radius: calc(1.2 * var(--r));
		overflow: hidden;
	}

	&__toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: calc(1.6 * var(--r));
		padding: calc(1.6 * var(--r)) calc(2.4 * var(--r));
		flex-wrap: wrap;

		// Pill-shaped chart/table toggle instead of the default rounded-square.
		:deep(.ob-tabs__list) {
			border-radius: calc(3 * var(--r));
		}
		:deep(.ob-tabs__slider) {
			border-radius: calc(2.6 * var(--r));
		}
	}

	&__actions {
		display: flex;
		align-items: center;
		gap: calc(1.6 * var(--r));
	}

	// Gray filter container — product's `.entry-group`. Dropdown panels are
	// teleported to <body> (see FilterDropdown), so no stacking/overflow
	// handling is needed here.
	&__filters {
		margin: 0 calc(2.4 * var(--r)) calc(1.6 * var(--r));
		border-radius: calc(1.2 * var(--r));
	}

	&__dropdowns {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: calc(1.2 * var(--r));
		padding: calc(1.6 * var(--r));

		// Separator between dropdowns and selected tags — product's
		// `.filter-seperator`.
		&.has-tags {
			border-bottom: calc(0.1 * var(--r)) solid var(--system-grey5);
		}
	}

	// Constrain each OBSelect so the six flow in a row instead of stacking
	// (the component root is otherwise full-width).
	&__select {
		flex: 0 0 auto;
		width: calc(17 * var(--r));
	}

	&__tags {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: calc(1.2 * var(--r));
		padding: calc(1.6 * var(--r));
	}

	&__tag {
		display: inline-flex;
		align-items: center;
		gap: calc(0.6 * var(--r));
		background: var(--system-background-primary);
		border-radius: calc(2.4 * var(--r));
		padding: calc(0.8 * var(--r)) calc(1.6 * var(--r));
		color: var(--system-label-primary);
	}

	&__tag-clear {
		display: inline-flex;
		align-items: center;
		border: 0;
		background: transparent;
		padding: 0;
		cursor: pointer;
		color: var(--system-red);
	}

	&__tag-clearall {
		border: 0;
		background: transparent;
		cursor: pointer;
		color: var(--system-label-secondary);
	}

	// Gray rounded add panel — product's `.add-buttons` (padding 1.6rem,
	// radius 1.2rem, 1.6rem gap between buttons). Same horizontal inset as
	// the filter panel so it lines up with the card's content edges.
	&__add {
		display: flex;
		flex-wrap: wrap;
		gap: calc(1.6 * var(--r));
		margin: 0 calc(2.4 * var(--r)) calc(1.6 * var(--r));
		padding: calc(1.6 * var(--r));
		border-radius: calc(1.2 * var(--r));
	}

	&__add-button {
		flex: 0 0 auto;
	}

	&__view {
		flex: 1;
		min-height: 0;
		// Inset the chart/table from the card edges; the components themselves
		// render transparent and fill this padded area.
		padding: 0 calc(2.4 * var(--r)) calc(2.4 * var(--r));
	}
}
</style>

<!--
  Unscoped: the snackbar (Vuetify v-snackbar) teleports outside #ob-app-core,
  where the DS's var(--system-background-primary) white surface doesn't resolve —
  it falls back to Vuetify's gray. Force the intended white + dark text with
  literal values so the toast reads as part of the prototype.
-->
<style lang="scss">
// Offset parent for the `contained` modal overlays, so their scrim is bounded
// to the prototype frame instead of the viewport.
#ob-app-core {
	position: relative;
}

.v-snackbar__wrapper {
	background-color: #ffffff !important;
	color: #000000 !important;
	box-shadow: 0 calc(0.1 * var(--r)) calc(2 * var(--r)) rgba(0, 0, 0, 0.16) !important;
}

.v-snackbar__wrapper .ob-snackbar-text {
	color: #000000 !important;
}
</style>
