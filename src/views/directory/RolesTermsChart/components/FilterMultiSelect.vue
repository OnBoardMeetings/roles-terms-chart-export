<template>
	<div class="filter-ms">
		<button
			ref="btn"
			class="filter-ms__activator systemSubheadline systemFont-SemiBold"
			:class="{ 'is-active': selectedValues.length > 0 }"
			@click="toggleOpen"
		>
			<span>{{ label }}</span>
			<OBIcon location="Lucide" name="ChevronDown" size="calc(1.4 * var(--r))" />
		</button>

		<!-- Menu teleports to #ob-app-core (DS token scope) so it escapes the
		     card overflow/stacking yet keeps theme variables. -->
		<Teleport v-if="mounted" to="#ob-app-core">
			<template v-if="open">
				<div class="filter-ms__backdrop" @click="open = false" />
				<div class="filter-ms__menu" :style="menuStyle">
					<div class="filter-ms__search">
						<OBIcon
							class="filter-ms__search-icon"
							location="Lucide"
							name="Search"
							size="calc(2 * var(--r))"
						/>
						<OBTextField
							v-model="query"
							size="small"
							:placeholder="`Search ${label.toLowerCase()}`"
						/>
					</div>

					<div class="filter-ms__band" />

					<div class="filter-ms__options">
						<div
							v-for="opt in filtered"
							:key="opt.value"
							class="filter-ms__option"
							@click="$emit('toggle', opt.value)"
						>
							<OBCheckbox
								class="filter-ms__check"
								:model-value="selectedValues.includes(opt.value)"
								:label="opt.label"
							/>
						</div>
						<div v-if="!filtered.length" class="filter-ms__empty systemBody system-label-secondary">
							No matches
						</div>
					</div>

					<div class="filter-ms__band" />

					<button class="filter-ms__clear" @click="$emit('clear')">
						<OBIcon location="Lucide" name="X" size="calc(1.8 * var(--r))" />
						<span class="systemBody">Clear</span>
					</button>
				</div>
			</template>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import { OBCheckbox, OBIcon, OBTextField } from '@onboardmeetings/design-system';

import type { FilterOption } from '../composables/useRolesTermsChart';

const props = defineProps<{
	label: string;
	options: FilterOption[];
	/** Currently-selected values (drives the active style + checked boxes). */
	selectedValues: string[];
}>();

defineEmits<{ toggle: [value: string]; clear: [] }>();

const btn = ref<HTMLElement | null>(null);
const open = ref(false);
const query = ref('');
// Enable the teleport only after mount (the #ob-app-core target may not exist yet).
const mounted = ref(false);
onMounted(() => {
	mounted.value = true;
});
const menuStyle = reactive({ left: '0px', top: '0px', width: 'calc(26 * var(--r))' });

const filtered = computed(() => {
	const q = query.value.trim().toLowerCase();
	return q ? props.options.filter(o => o.label.toLowerCase().includes(q)) : props.options;
});

function toggleOpen(): void {
	if (!open.value && btn.value) {
		const r = btn.value.getBoundingClientRect();
		menuStyle.left = `${r.left}px`;
		menuStyle.top = `${r.bottom + 4}px`;
		query.value = '';
	}
	open.value = !open.value;
}
</script>

<style scoped lang="scss">
.filter-ms {
	position: relative;
	display: inline-block;

	// Activator mirrors the OBSelect field look (bordered, rounded, chevron).
	&__activator {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: calc(0.8 * var(--r));
		width: 100%;
		height: calc(4 * var(--r));
		padding: 0 calc(1.2 * var(--r));
		border: calc(0.1 * var(--r)) solid var(--system-grey4);
		border-radius: calc(0.8 * var(--r));
		background: var(--system-background-primary);
		color: var(--system-label-primary);
		cursor: pointer;

		&.is-active {
			border-color: var(--system-primary);
			color: var(--system-primary);
		}
	}

	&__backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
	}

	// Flex column so the search + Clear stay pinned while the options scroll.
	&__menu {
		position: fixed;
		z-index: 1001;
		display: flex;
		flex-direction: column;
		background: var(--system-background-primary);
		border-radius: calc(1.2 * var(--r));
		box-shadow: 0 calc(0.4 * var(--r)) calc(1.6 * var(--r)) rgba(0, 0, 0, 0.16);
		max-height: calc(40 * var(--r));
		overflow: hidden;
	}

	&__search {
		position: relative;
		flex-shrink: 0;
		padding: calc(1.2 * var(--r)) calc(1.6 * var(--r));

		// Magnifier overlaid on the small text field; input is padded to clear it
		// and sized up so the icon + text aren't tiny.
		:deep(.v-field__input),
		:deep(input) {
			padding-left: calc(4 * var(--r));
			font-size: calc(1.7 * var(--r)) !important;
		}

		// No border on the search field, in any state.
		:deep(.v-field) {
			border: 0 !important;
		}
	}

	&__search-icon {
		position: absolute;
		left: calc(2.8 * var(--r));
		top: 50%;
		transform: translateY(-50%);
		z-index: 1;
		pointer-events: none;
		color: var(--system-label-secondary);
	}

	// Light-grey section band separating search ↔ list ↔ clear (grouped-list look).
	&__band {
		flex-shrink: 0;
		height: calc(0.8 * var(--r));
		background: var(--system-background-grouped-primary, #f2f2f7);
	}

	// The only scrolling region — keeps search pinned at top, Clear at bottom.
	&__options {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	// Full-width row: divider beneath, hover fills the whole row, whole row toggles.
	&__option {
		padding: calc(1 * var(--r)) calc(1.6 * var(--r));
		border-bottom: calc(0.1 * var(--r)) solid var(--system-grey5);
		cursor: pointer;

		&:hover {
			background: var(--system-fill-quarternary, rgba(118, 118, 128, 0.08));
		}

		&:last-child {
			border-bottom: 0;
		}
	}

	// Checkbox is display-only; the row owns the click + hover.
	&__check {
		pointer-events: none;
	}

	&__empty {
		padding: calc(1.2 * var(--r)) calc(1.6 * var(--r));
	}

	// Clear action — red X + label, pinned to the bottom.
	&__clear {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: calc(1.2 * var(--r));
		width: 100%;
		border: 0;
		background: transparent;
		cursor: pointer;
		padding: calc(1.6 * var(--r));
		color: var(--system-red);

		&:hover {
			background: var(--system-fill-quarternary, rgba(118, 118, 128, 0.08));
		}
	}
}
</style>
