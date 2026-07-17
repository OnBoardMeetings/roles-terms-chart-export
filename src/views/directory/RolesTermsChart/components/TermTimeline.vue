<template>
	<div class="term-timeline">
		<!-- Track is at least the container width, but stretches to a fixed
		     per-year width so the axis spreads out and scrolls horizontally —
		     product's Highcharts gantt has a horizontal scrollbar. -->
		<div class="term-timeline__track" :style="{ width: trackWidth }">
			<!-- Year axis. Band height matches the table header so the panels
			     line up row-for-row. -->
			<div class="term-timeline__axis">
				<span
					v-for="year in scale.years"
					:key="year"
					class="term-timeline__year systemCaption-2 system-label-secondary"
					:style="{ left: `${percentForYear(year)}%` }"
				>
					{{ year }}
				</span>
				<span
					v-if="todayInView"
					class="term-timeline__today-label systemCaption-2"
					:style="{ left: `${todayPercent}%` }"
				>
					{{ todayLabel }}
				</span>
			</div>

			<!-- Plot area: alternating year-column shading, the "today" indicator,
			     then one lane per person with term bars positioned by date. -->
			<div class="term-timeline__plot">
				<span
					v-for="band in yearBands"
					:key="`band-${band.year}`"
					class="term-timeline__band"
					:class="{ 'is-shaded': band.shaded }"
					:style="{ left: `${band.left}%`, width: `${band.width}%` }"
				/>

				<span
					v-if="todayInView"
					class="term-timeline__today"
					:style="{ left: `${todayPercent}%` }"
				/>

				<div v-for="person in people" :key="person.Id" class="term-timeline__lane">
					<span
						v-if="showLabels"
						class="term-timeline__lane-label systemCaption-2 systemFont-Bold"
						:style="{ left: `${laneLabelLeft(person)}%` }"
					>
						{{ person.Name }}
					</span>
					<span
						v-for="(entry, index) in person.Entries"
						:key="`${person.Id}-${index}`"
						class="term-timeline__bar"
						:style="barStyle(entry, person)"
						@mouseenter="showTip($event, person, entry)"
						@mouseleave="hideTip"
					/>
				</div>
			</div>
		</div>

		<!-- Hover tooltip — teleported to #ob-app-core (the DS token scope) and
		     pinned to the cursor so the timeline's scroll overflow never clips
		     it. Mirrors product's Highcharts callout content. -->
		<Teleport v-if="mounted" to="#ob-app-core">
			<div
				v-if="tip.visible"
				class="term-timeline__tooltip"
				:style="{ left: `${tip.x}px`, top: `${tip.y}px` }"
			>
				<div class="systemFootnote systemFont-Bold">{{ tip.name }}</div>
				<div class="systemCaption-2 system-label-secondary">{{ tip.role }}, {{ tip.group }}</div>
				<div class="systemCaption-2 system-label-secondary">Term Number: {{ tip.term }}</div>
				<div class="systemFootnote systemFont-SemiBold term-timeline__tooltip-dates">
					{{ tip.start }} – {{ tip.end }}
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import type { ChartPerson, RoleEntry } from '../models/RoleEntry';

const props = defineProps<{
	people: ChartPerson[];
	scale: { startMs: number; endMs: number; years: number[] };
	colorFor: (groupId: string) => string;
	/**
	 * Print/export layout: fit the whole span to the container width instead of
	 * scrolling. Guarantees a long tenure renders complete on one page — the
	 * brief's 10+ year concern — with the min-width bar floor keeping short
	 * terms legible rather than collapsing to hairlines.
	 */
	fitToWidth?: boolean;
	/**
	 * Label each lane with the person's name at the start of their earliest term.
	 * Used when the timeline is stacked below the table (print export) and no
	 * longer sits row-for-row beside it — mirrors the product's Highcharts labels.
	 */
	showLabels?: boolean;
}>();

// Minimum width per year column — keeps years readable and triggers the
// horizontal scrollbar when the data spans more years than the panel can show.
const YEAR_PX = 64;

// fitToWidth clamps the track to the container (no scroll); otherwise stretch to
// a fixed per-year width so the axis spreads and scrolls.
const trackWidth = computed(() =>
	props.fitToWidth ? '100%' : `max(100%, ${props.scale.years.length * YEAR_PX}px)`,
);

// Teleport target (#ob-app-core) may not exist at first mount — enable only
// after mount so Vue doesn't error trying to resolve a null target.
const mounted = ref(false);
onMounted(() => {
	mounted.value = true;
});

const span = (): number => props.scale.endMs - props.scale.startMs;

const clamp = (n: number): number => Math.max(0, Math.min(100, n));
const percentForMs = (ms: number): number => clamp(((ms - props.scale.startMs) / span()) * 100);

const percentForYear = (year: number): number => percentForMs(Date.UTC(year, 0, 1));

// Alternating year columns — product's Highcharts xAxis alternateGridColor.
const yearBands = computed(() =>
	props.scale.years.map((year, i) => {
		const left = percentForMs(Date.UTC(year, 0, 1));
		const right = percentForMs(Date.UTC(year + 1, 0, 1));
		return { year, left, width: right - left, shaded: i % 2 === 1 };
	}),
);

const todayPercent = percentForMs(Date.now());
const todayInView = todayPercent > 0 && todayPercent < 100;
// Local format (not UTC) — this is "now", and product labels it with its own
// date helper. Mirrors Highcharts currentDateIndicator.label.
const todayLabel = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
}).format(new Date());

const startMs = (e: RoleEntry): number => new Date(e.TermStartDateOnly).getTime();
// Open-ended terms run to the right edge of the scale.
const endMs = (e: RoleEntry): number =>
	e.TermEndDateOnly ? new Date(e.TermEndDateOnly).getTime() : props.scale.endMs;

function barStyle(entry: RoleEntry, person: ChartPerson): Record<string, string> {
	const left = percentForMs(startMs(entry));
	const right = percentForMs(endMs(entry));
	return {
		left: `${left}%`,
		width: `${Math.max(right - left, 0.6)}%`,
		backgroundColor: props.colorFor(person.GroupId),
	};
}

// Left edge (%) of a person's earliest term — where their name label sits.
function laneLabelLeft(person: ChartPerson): number {
	return Math.min(...person.Entries.map(e => percentForMs(startMs(e))));
}

// timeZone: 'UTC' — *DateOnly values parse as UTC midnight; local formatting
// would shift them a day in the tooltip.
const DATE_FMT = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC',
});

const tip = reactive({
	visible: false,
	x: 0,
	y: 0,
	name: '',
	role: '',
	group: '',
	term: '',
	start: '',
	end: '',
});

function showTip(event: MouseEvent, person: ChartPerson, entry: RoleEntry): void {
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
	// Pin above the cursor (viewport coordinates — the tooltip is teleported to
	// body), clamped so it never runs off the left/right edge.
	tip.x = Math.min(Math.max(event.clientX, 130), window.innerWidth - 130);
	tip.y = rect.top;
	tip.name = person.Name;
	tip.role = entry.RoleName;
	tip.group = entry.GroupName;
	tip.term = String(entry.TermNumber ?? 'None');
	tip.start = DATE_FMT.format(new Date(entry.TermStartDateOnly));
	tip.end = entry.TermEndDateOnly ? DATE_FMT.format(new Date(entry.TermEndDateOnly)) : 'No End Date';
	tip.visible = true;
}

function hideTip(): void {
	tip.visible = false;
}
</script>

<style scoped lang="scss">
.term-timeline {
	height: 100%;
	overflow-x: auto;
	overflow-y: hidden;

	&__track {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	&__axis {
		position: relative;
		height: calc(5.6 * var(--r));
		flex-shrink: 0;
	}

	&__year {
		position: absolute;
		bottom: calc(0.8 * var(--r));
		transform: translateX(-50%);
		white-space: nowrap;
	}

	&__today-label {
		position: absolute;
		top: calc(0.6 * var(--r));
		transform: translateX(-50%);
		white-space: nowrap;
		color: var(--system-red);
		font-weight: 600;
	}

	&__plot {
		position: relative;
		flex: 1;
	}

	&__lane {
		position: relative;
		height: calc(5.6 * var(--r));
	}

	// Name label above a lane's bar — only shown in stacked/print mode where the
	// timeline no longer sits beside the data table. Left set inline to the
	// person's earliest term start.
	&__lane-label {
		position: absolute;
		// Sit above the bar (which is centered at 50%) with a clear gap, so the
		// name isn't clipped against or crowded by the bar.
		bottom: calc(50% + 1 * var(--r));
		white-space: nowrap;
		color: var(--system-label-primary);
		pointer-events: none;
	}

	&__bar {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		// 10px tall, fully rounded — mirrors product's Highcharts pointWidth: 10
		// with borderRadius: 50.
		height: calc(1 * var(--r));
		border-radius: calc(0.5 * var(--r));
		min-width: calc(0.6 * var(--r));
		cursor: pointer;
	}

	&__band {
		position: absolute;
		top: 0;
		bottom: 0;

		&.is-shaded {
			background: #f4f4f5;
		}
	}

	&__today {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background: var(--system-red);
		z-index: 1;
	}

	&__tooltip {
		position: fixed;
		transform: translate(-50%, calc(-100% - 0.8 * var(--r)));
		// Hug the content: size to the widest line, capped so a long role or
		// date line wraps instead of stretching the box across the chart.
		width: max-content;
		max-width: calc(24 * var(--r));
		background: var(--system-background-primary, #fff);
		border-radius: calc(1.2 * var(--r));
		box-shadow: 0 calc(0.4 * var(--r)) calc(1.6 * var(--r)) rgba(0, 0, 0, 0.16);
		padding: calc(0.8 * var(--r)) calc(1.2 * var(--r));
		pointer-events: none;
		z-index: 1000;
	}

	&__tooltip-dates {
		margin-top: calc(0.4 * var(--r));
	}
}
</style>
