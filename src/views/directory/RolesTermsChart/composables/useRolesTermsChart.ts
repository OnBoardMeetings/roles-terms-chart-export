import { computed, reactive, ref, type ComputedRef, type Ref } from 'vue';

import type { ChartPerson, RoleEntry, SortField } from '../models/RoleEntry';
import { roleEntries as seedEntries } from '../fixtures/roleEntries';

/**
 * Product's RoleEntryChart is a Vuex + Highcharts-gantt beast: it reads
 * `RoleTermsStore` getters keyed by the route's organizationId, listens on an
 * EventBus for filter updates, and renders the timeline through a licensed
 * Highcharts gantt instance. This proxy reduces that to the parts a designer
 * iterates on:
 *
 *   - the same `collectionOfPeople` grouping (unique user/group/role triples
 *     with their term entries collapsed under one row) and served-time maths,
 *   - the four-way column sort with a remembered secondary key,
 *   - a data-fitted time scale the CSS timeline positions bars against,
 *   - the RoleEntryFilter dropdowns (member / group / role / term / timeframe /
 *     status) that filter both the chart and the table.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const entries: Ref<RoleEntry[]> = ref(seedEntries.map(e => ({ ...e })));

const sortField: Ref<SortField> = ref('group');
const sortAsc = ref(true);
const prevSortField: Ref<SortField> = ref('group');
const prevSortAsc = ref(true);

const tableCollapsed = ref(false);

export type TermStatus = 'active' | 'past' | 'upcoming';

/** Group palette — mirrors product's `--system-*` colour rotation. */
const GROUP_PALETTE = [
	'var(--system-blue)',
	'var(--system-teal)',
	'var(--system-indigo)',
	'var(--system-green)',
	'var(--system-orange)',
	'var(--system-red)',
	'var(--system-brand)',
	'var(--system-purple)',
	'var(--system-yellow)',
	'var(--system-pink)',
];

const startMs = (e: RoleEntry): number => new Date(e.TermStartDateOnly).getTime();
const endMs = (e: RoleEntry): number =>
	e.TermEndDateOnly ? new Date(e.TermEndDateOnly).getTime() : Number.NaN;

const stringCompare = (left: string, right: string): number => {
	const a = left.trim().toLowerCase();
	const b = right.trim().toLowerCase();
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
};

function statusFor(entry: RoleEntry, now: number): TermStatus {
	if (new Date(entry.TermStartDateOnly).getTime() > now) return 'upcoming';
	if (entry.TermEndDateOnly && new Date(entry.TermEndDateOnly).getTime() < now) return 'past';
	return 'active';
}

/**
 * Served time in ms: future terms excluded, open-ended (and not-yet-ended)
 * terms counted up to today. Same rule product applies before formatting the
 * "x yr y mo" service column.
 */
function timeServed(personEntries: RoleEntry[], now: number): number {
	return personEntries.reduce((total, e) => {
		const start = startMs(e);
		if (start > now) return total;
		const end = e.TermEndDateOnly ? Math.min(endMs(e), now) : now;
		return total + Math.max(0, end - start);
	}, 0);
}

// ─── Filters ────────────────────────────────────────────────────────────────
// Mirrors product's RoleEntryFilter dropdowns. members/groups/roles/terms/
// statuses are multi-select (each selection surfaces as a removable tag);
// timeframe is a single relative-window preset.

export type FilterDimension = 'members' | 'groups' | 'roles' | 'terms' | 'statuses';

export interface FilterOption {
	value: string;
	label: string;
}

const filters = reactive({
	members: [] as string[],
	groups: [] as string[],
	roles: [] as string[],
	terms: [] as string[],
	statuses: [] as string[],
	timeframe: '' as string,
});

const TIMEFRAME_OPTIONS: FilterOption[] = [
	{ value: 'next-12', label: 'Starting within 12 months' },
	{ value: 'next-24', label: 'Starting within 24 months' },
	{ value: 'ended-12', label: 'Ended within 12 months' },
];

/** Distinct, label-bearing option lists for each dropdown (from all entries). */
function distinctOptions(key: (e: RoleEntry) => string, label: (e: RoleEntry) => string): FilterOption[] {
	const seen = new Map<string, string>();
	for (const e of entries.value) {
		const v = key(e);
		if (!seen.has(v)) seen.set(v, label(e));
	}
	return [...seen.entries()].map(([value, lbl]) => ({ value, label: lbl }));
}

const memberOptions: ComputedRef<FilterOption[]> = computed(() =>
	distinctOptions(e => e.UserId, e => `${e.UserFirstName} ${e.UserLastName}`),
);
const groupOptions: ComputedRef<FilterOption[]> = computed(() =>
	distinctOptions(e => e.GroupId, e => e.GroupName),
);
const roleOptions: ComputedRef<FilterOption[]> = computed(() =>
	distinctOptions(e => e.RoleId, e => e.RoleName),
);
const termOptions: ComputedRef<FilterOption[]> = computed(() =>
	distinctOptions(
		e => String(e.TermNumber ?? ''),
		e => (e.TermNumber != null ? `Term ${e.TermNumber}` : 'No term'),
	).filter(o => o.value !== ''),
);
const statusOptions: FilterOption[] = [
	{ value: 'active', label: 'Active' },
	{ value: 'past', label: 'Past' },
	{ value: 'upcoming', label: 'Upcoming' },
];

function matchesTimeframe(e: RoleEntry, now: number): boolean {
	if (!filters.timeframe) return true;
	const start = startMs(e);
	const end = e.TermEndDateOnly ? endMs(e) : null;
	if (filters.timeframe === 'next-12') return start >= now && start <= now + 365 * MS_PER_DAY;
	if (filters.timeframe === 'next-24') return start >= now && start <= now + 730 * MS_PER_DAY;
	if (filters.timeframe === 'ended-12') return end != null && end <= now && end >= now - 365 * MS_PER_DAY;
	return true;
}

/** Entries after every active filter dimension. */
const filteredEntries: ComputedRef<RoleEntry[]> = computed(() => {
	const now = Date.now();
	return entries.value.filter(
		e =>
			(filters.members.length === 0 || filters.members.includes(e.UserId)) &&
			(filters.groups.length === 0 || filters.groups.includes(e.GroupId)) &&
			(filters.roles.length === 0 || filters.roles.includes(e.RoleId)) &&
			(filters.terms.length === 0 ||
				(e.TermNumber != null && filters.terms.includes(String(e.TermNumber)))) &&
			(filters.statuses.length === 0 || filters.statuses.includes(statusFor(e, now))) &&
			matchesTimeframe(e, now),
	);
});

const hasActiveFilters = computed(
	() =>
		filters.members.length > 0 ||
		filters.groups.length > 0 ||
		filters.roles.length > 0 ||
		filters.terms.length > 0 ||
		filters.statuses.length > 0 ||
		filters.timeframe !== '',
);

const TAG_PREFIX: Record<FilterDimension, string> = {
	members: 'Member',
	groups: 'Group',
	roles: 'Role',
	terms: 'Term',
	statuses: 'Status',
};

export interface FilterTag {
	dimension: FilterDimension | 'timeframe';
	value: string;
	label: string;
}

const optionsFor: Record<FilterDimension, ComputedRef<FilterOption[]> | FilterOption[]> = {
	members: memberOptions,
	groups: groupOptions,
	roles: roleOptions,
	terms: termOptions,
	statuses: statusOptions,
};

function labelOf(dim: FilterDimension, value: string): string {
	const opts = optionsFor[dim];
	const list = Array.isArray(opts) ? opts : opts.value;
	return list.find(o => o.value === value)?.label ?? value;
}

/** Selected values as removable tags — product's tags-container. */
const activeTags: ComputedRef<FilterTag[]> = computed(() => {
	const tags: FilterTag[] = [];
	(['members', 'groups', 'roles', 'terms', 'statuses'] as FilterDimension[]).forEach(dim => {
		for (const value of filters[dim]) {
			tags.push({ dimension: dim, value, label: `${TAG_PREFIX[dim]}: ${labelOf(dim, value)}` });
		}
	});
	if (filters.timeframe) {
		const label = TIMEFRAME_OPTIONS.find(o => o.value === filters.timeframe)?.label ?? filters.timeframe;
		tags.push({ dimension: 'timeframe', value: filters.timeframe, label: `Timeframe: ${label}` });
	}
	return tags;
});

function toggleFilter(dim: FilterDimension, value: string): void {
	const arr = filters[dim];
	const i = arr.indexOf(value);
	if (i === -1) arr.push(value);
	else arr.splice(i, 1);
}

function setTimeframe(value: string): void {
	filters.timeframe = filters.timeframe === value ? '' : value;
}

function removeTag(tag: FilterTag): void {
	if (tag.dimension === 'timeframe') {
		filters.timeframe = '';
		return;
	}
	const arr = filters[tag.dimension];
	const i = arr.indexOf(tag.value);
	if (i !== -1) arr.splice(i, 1);
}

function clearFilters(): void {
	filters.members = [];
	filters.groups = [];
	filters.roles = [];
	filters.terms = [];
	filters.statuses = [];
	filters.timeframe = '';
}

// ─── Derived view data ───────────────────────────────────────────────────────

/** Stable assignment of palette colours to groups by first appearance. */
const groupColors: ComputedRef<Record<string, string>> = computed(() => {
	const out: Record<string, string> = {};
	let i = 0;
	for (const e of entries.value) {
		if (!(e.GroupId in out)) {
			out[e.GroupId] = GROUP_PALETTE[i % GROUP_PALETTE.length];
			i += 1;
		}
	}
	return out;
});

function colorFor(groupId: string): string {
	return groupColors.value[groupId] ?? '#000';
}

/** People rows, grouped + served-time computed + sorted by the active column. */
const people: ComputedRef<ChartPerson[]> = computed(() => {
	const now = Date.now();
	const source = filteredEntries.value;
	const byId = new Map<string, ChartPerson>();

	for (const e of source) {
		const id = `${e.UserId}-${e.GroupId}-${e.RoleId}`;
		if (byId.has(id)) continue;
		const personEntries = source.filter(x => `${x.UserId}-${x.GroupId}-${x.RoleId}` === id);
		byId.set(id, {
			Id: id,
			UserId: e.UserId,
			UserFirstName: e.UserFirstName,
			UserLastName: e.UserLastName,
			Name: `${e.UserFirstName} ${e.UserLastName}`,
			GroupId: e.GroupId,
			GroupName: e.GroupName,
			RoleId: e.RoleId,
			RoleName: e.RoleName,
			Entries: personEntries,
			TimeServed: timeServed(personEntries, now),
		});
	}

	const rows = [...byId.values()];

	const primary: Record<SortField, (a: ChartPerson, b: ChartPerson) => number> = {
		name: (a, b) => stringCompare(a.UserLastName, b.UserLastName),
		group: (a, b) => stringCompare(a.GroupName, b.GroupName),
		role: (a, b) => stringCompare(a.RoleName, b.RoleName),
		serviceYears: (a, b) => a.TimeServed - b.TimeServed,
	};

	rows.sort((a, b) => {
		const p = primary[sortField.value](a, b);
		if (p !== 0) return sortAsc.value ? p : -p;
		const s = primary[prevSortField.value](a, b);
		return prevSortAsc.value ? s : -s;
	});

	return rows;
});

/** Time scale fitted to the data: whole years from earliest start to latest end. */
const scale: ComputedRef<{ startMs: number; endMs: number; years: number[] }> = computed(() => {
	const rows = people.value;
	if (rows.length === 0) {
		const y = new Date().getFullYear();
		return { startMs: Date.UTC(y, 0, 1), endMs: Date.UTC(y + 1, 0, 1), years: [y] };
	}

	let minYear = Number.POSITIVE_INFINITY;
	let maxYear = Number.NEGATIVE_INFINITY;
	for (const row of rows) {
		for (const e of row.Entries) {
			minYear = Math.min(minYear, new Date(e.TermStartDateOnly).getUTCFullYear());
			const endYear = e.TermEndDateOnly
				? new Date(e.TermEndDateOnly).getUTCFullYear()
				: new Date(e.TermStartDateOnly).getUTCFullYear();
			maxYear = Math.max(maxYear, endYear);
		}
	}
	// Pad a year on the right so open-ended bars have room to run past "today".
	maxYear = Math.max(maxYear, new Date().getUTCFullYear()) + 1;

	const years: number[] = [];
	for (let y = minYear; y <= maxYear; y += 1) years.push(y);

	return { startMs: Date.UTC(minYear, 0, 1), endMs: Date.UTC(maxYear + 1, 0, 1), years };
});

export interface EntryRow {
	key: string;
	UserId: string;
	UserFirstName: string;
	UserLastName: string;
	GroupId: string;
	GroupName: string;
	RoleId: string;
	RoleName: string;
	TermNumber: number | null;
	TermStartDateOnly: string;
	TermEndDateOnly: string | null;
	status: TermStatus;
}

/**
 * Flat per-term rows for the table view — product's RoleEntryList renders one
 * row per entry (Name / Group / Role / Term # / Start / End / Status), ordered
 * by the same column sort as the chart, then by term number within a person.
 */
const entryRows: ComputedRef<EntryRow[]> = computed(() => {
	const now = Date.now();
	const rows: EntryRow[] = [];
	for (const person of people.value) {
		const ordered = [...person.Entries].sort((a, b) => (a.TermNumber ?? 0) - (b.TermNumber ?? 0));
		ordered.forEach((e, i) => {
			rows.push({
				key: `${person.Id}-${i}`,
				UserId: e.UserId,
				UserFirstName: e.UserFirstName,
				UserLastName: e.UserLastName,
				GroupId: e.GroupId,
				GroupName: e.GroupName,
				RoleId: e.RoleId,
				RoleName: e.RoleName,
				TermNumber: e.TermNumber,
				TermStartDateOnly: e.TermStartDateOnly,
				TermEndDateOnly: e.TermEndDateOnly,
				status: statusFor(e, now),
			});
		});
	}
	return rows;
});

function setSort(field: SortField): void {
	if (sortField.value === field) {
		sortAsc.value = !sortAsc.value;
		return;
	}
	// Remember the previous column as the tiebreaker (skip when leaving service sort).
	if (sortField.value !== 'serviceYears') {
		prevSortField.value = sortField.value;
		prevSortAsc.value = sortAsc.value;
	}
	sortField.value = field;
	sortAsc.value = true;
}

function toggleCollapse(): void {
	tableCollapsed.value = !tableCollapsed.value;
}

/**
 * Per-row Delete from the table's ⋯ menu — mirrors product's RoleEntryListItem
 * delete action. Product round-trips through the API + Vuex; the proxy just
 * drops the matching term from local reactive state so the demo behaves.
 */
function removeEntry(row: EntryRow): void {
	const i = entries.value.findIndex(
		e =>
			e.UserId === row.UserId &&
			e.GroupId === row.GroupId &&
			e.RoleId === row.RoleId &&
			e.TermNumber === row.TermNumber &&
			e.TermStartDateOnly === row.TermStartDateOnly,
	);
	if (i !== -1) entries.value.splice(i, 1);
}

/** "x yr y mo" / "n days" service label — mirrors ChartEntryListItem.yearsService. */
function serviceLabel(timeServedMs: number): string {
	const totalDays = timeServedMs / MS_PER_DAY;
	if (totalDays > 0 && totalDays < 30) return `${Math.floor(totalDays)} days`;
	const years = Math.floor(totalDays / 365);
	const months = Math.floor((totalDays % 365) / 30);
	return `${years > 0 ? `${years} yr ` : ''}${months > 0 ? `${months} mo` : ''}`.trim() || '—';
}

export function useRolesTermsChart() {
	return {
		people,
		entryRows,
		scale,
		sortField,
		sortAsc,
		tableCollapsed,
		setSort,
		toggleCollapse,
		removeEntry,
		colorFor,
		serviceLabel,
		// filters
		filters,
		memberOptions,
		groupOptions,
		roleOptions,
		termOptions,
		statusOptions,
		timeframeOptions: TIMEFRAME_OPTIONS,
		activeTags,
		hasActiveFilters,
		toggleFilter,
		setTimeframe,
		removeTag,
		clearFilters,
	};
}
