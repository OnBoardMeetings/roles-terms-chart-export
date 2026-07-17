<template>
	<OBModal
		:model-value="modelValue"
		size="fullscreen"
		title="Export preview"
		@update:model-value="v => emit('update:modelValue', v)"
	>
		<!-- Board-ready page. Reads the same filtered/sorted composable state the
		     live view shows, so the export mirrors what the admin sees at export
		     time. -->
		<div class="rt-print">
			<header class="rt-print__masthead">
				<div class="rt-print__title systemFont-Bold">Roles &amp; Terms</div>
				<div class="systemFootnote system-label-secondary">
					{{ viewLabel }} · as of {{ today }}
				</div>
			</header>

			<!-- Chart page: data table + fit-to-width timeline (no scroll, full
			     span) so long tenures render complete and legible on one page. -->
			<template v-if="view === 'chart'">
				<div class="rt-print__legend">
					<span v-for="g in legend" :key="g.id" class="rt-print__legend-item systemCaption-2">
						<span class="rt-print__swatch" :style="{ background: g.color }" />
						{{ g.name }}
					</span>
				</div>

				<div v-if="people.length" class="rt-print__chart">
					<div class="rt-print__chart-table">
						<div class="rt-print__chart-head system-background-grouped-tertiary">
							<span class="rt-print__chart-col rt-print__chart-col--avatar" />
							<span
								v-for="col in chartColumns"
								:key="col.key"
								class="rt-print__chart-col systemFootnote systemFont-Bold"
								:class="`rt-print__chart-col--${col.key}`"
							>
								{{ col.label }}
							</span>
						</div>
						<ChartEntryRow
							v-for="person in people"
							:key="person.Id"
							:person="person"
							:service="serviceLabel(person.TimeServed)"
						/>
					</div>
					<div class="rt-print__chart-timeline" :style="{ height: timelineHeight }">
						<TermTimeline
							:people="people"
							:scale="scale"
							:color-for="colorFor"
							fit-to-width
							show-labels
						/>
					</div>
				</div>
				<p v-else class="rt-print__empty systemBody system-label-secondary">
					No roles or terms to display.
				</p>
			</template>

			<!-- Table page: the entry table, content-only (no ⋯ actions, static
			     headers). -->
			<div v-else class="rt-print__table">
				<RoleEntryTable :rows="entryRows" print />
			</div>
		</div>

		<!-- Own the footer so we control the actual button elements — the modal's
		     `buttons` prop doesn't forward a class we can paint purple. -->
		<template #footer>
			<div class="rt-print__actions">
				<OBButton
					variant="secondary"
					size="large"
					text="Close"
					@click="emit('update:modelValue', false)"
				/>
				<OBButton
					class="rt-print-pdf-btn"
					variant="primary"
					size="large"
					text="Print / Save as PDF"
					@click="onPrint"
				/>
			</div>
		</template>
	</OBModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { OBButton, OBModal } from '@onboardmeetings/design-system';

import ChartEntryRow from './ChartEntryRow.vue';
import TermTimeline from './TermTimeline.vue';
import RoleEntryTable from './RoleEntryTable.vue';
import { useRolesTermsChart } from '../composables/useRolesTermsChart';

const props = defineProps<{ modelValue: boolean; view: 'chart' | 'table' }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; downloaded: [] }>();

const { people, entryRows, scale, colorFor, serviceLabel } = useRolesTermsChart();

const chartColumns = [
	{ key: 'name', label: 'Name' },
	{ key: 'group', label: 'Group' },
	{ key: 'role', label: 'Role' },
	{ key: 'serviceYears', label: 'Service' },
];

const viewLabel = computed(() => (props.view === 'chart' ? 'Chart view' : 'Table view'));

// Stacked timeline needs an explicit height (one lane per person + the axis
// band) since it no longer fills a flex row beside the table.
const timelineHeight = computed(() => `calc(${people.value.length + 1} * 5.6 * var(--r))`);

const today = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
}).format(new Date());

// Distinct groups (first appearance) with their assigned colour — the export's
// key to reading the timeline.
const legend = computed(() => {
	const seen = new Map<string, { id: string; name: string; color: string }>();
	for (const p of people.value) {
		if (!seen.has(p.GroupId)) {
			seen.set(p.GroupId, { id: p.GroupId, name: p.GroupName, color: colorFor(p.GroupId) });
		}
	}
	return [...seen.values()];
});

function onPrint(): void {
	window.print();
	// Signal the download so the host can confirm with a toast, then close the
	// preview so we land back on the Roles & Terms page.
	emit('downloaded');
	emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.rt-print {
	display: flex;
	flex-direction: column;
	gap: calc(1.6 * var(--r));
	// A page-like sheet so reviewers judge the export as a document, not a screen.
	background: var(--system-background-primary, #fff);
	padding: calc(2.4 * var(--r));

	&__masthead {
		display: flex;
		flex-direction: column;
		gap: calc(0.4 * var(--r));
		padding-bottom: calc(1.6 * var(--r));
		border-bottom: calc(0.1 * var(--r)) solid var(--system-grey5);
	}

	&__title {
		font-size: calc(4 * var(--r));
		line-height: 1.15;
	}

	&__legend {
		display: flex;
		flex-wrap: wrap;
		gap: calc(1.6 * var(--r));
	}

	&__legend-item {
		display: inline-flex;
		align-items: center;
		gap: calc(0.6 * var(--r));
		color: var(--system-label-primary);
	}

	&__swatch {
		width: calc(1.2 * var(--r));
		height: calc(1.2 * var(--r));
		border-radius: calc(0.3 * var(--r));
		flex-shrink: 0;
	}

	// Stacked for the export: the data table on top, the full-width timeline
	// below (labeled) — the timeline gets the whole page width, which also keeps
	// long tenures legible.
	&__chart {
		display: flex;
		flex-direction: column;
	}

	&__chart-table {
		width: 100%;
	}

	&__chart-head {
		display: flex;
		align-items: center;
		height: calc(5.6 * var(--r));
		border-radius: calc(0.8 * var(--r)) 0 0 0;
		padding: 0 calc(0.8 * var(--r));
	}

	// Column widths mirror ChartEntryRow so header labels sit over their data.
	&__chart-col {
		display: inline-block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--system-label-primary);

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

	&__chart-timeline {
		width: 100%;
		margin-top: calc(1.6 * var(--r));
		padding-top: calc(1.6 * var(--r));
		border-top: calc(0.1 * var(--r)) solid var(--system-grey5);
	}

	&__empty {
		padding: calc(4.8 * var(--r));
		text-align: center;
	}

	&__actions {
		display: flex;
		justify-content: flex-end;
		gap: calc(1.2 * var(--r));
		width: 100%;
	}
}
</style>

<!--
  Unscoped + literal colour on purpose. OBModal teleports the footer outside
  #ob-app-core, where the --system-* tokens aren't defined (so var(--system-*)
  resolves to nothing → transparent) and the scoped data-v may not attach to a
  slotted child-component root. The compound selector (.ob-button.primary.v-btn)
  out-specifies the DS's own variant rule; #4c4084 is --system-primary
  (--system-indigo), the brand purple.
-->
<style lang="scss">
.rt-print-pdf-btn.ob-button.primary.v-btn {
	background: #4c4084 !important;
	background-color: #4c4084 !important;
	border-color: #4c4084 !important;
}

.rt-print-pdf-btn.ob-button.primary .v-btn__content {
	color: #fff !important;
}

// Print output: show only the board-ready page. Everything else — the app
// chrome, the modal's "Export preview" title bar, the scrim, and the footer
// buttons — is hidden, so the printed/saved PDF is just the export content.
@media print {
	@page {
		size: landscape;
		margin: 12mm;
	}

	body * {
		visibility: hidden !important;
	}

	.rt-print,
	.rt-print * {
		visibility: visible !important;
	}

	.rt-print {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
	}

	// Drop the dark modal scrim so it doesn't tint the page, and let the modal
	// shell expand instead of clipping to its on-screen height.
	.v-overlay__scrim {
		display: none !important;
	}

	.v-overlay__content {
		position: static !important;
		max-height: none !important;
		height: auto !important;
		overflow: visible !important;
	}
}
</style>
