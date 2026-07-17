<template>
	<OBModal
		:model-value="modelValue"
		size="medium"
		hide-close
		@update:model-value="v => emit('update:modelValue', v)"
	>
		<div class="export-modal">
			<h1 class="export-modal__title">Export</h1>
			<div class="export-modal__field">
				<div class="export-modal__field-title">Document Type</div>
				<OBSelect v-model="type" size="large" :options="typeOptions" />
			</div>
			<div class="export-modal__field export-modal__destination">
				<div class="export-modal__field-title">Destination</div>
				<OBRadioGroup v-model="destination" :options="destinationOptions" />
			</div>
		</div>

		<template #footer>
			<div class="export-modal__actions">
				<OBButton
					variant="secondary"
					size="large"
					text="Cancel"
					@click="emit('update:modelValue', false)"
				/>
				<OBButton variant="preferred" size="large" :text="exportButtonLabel" @click="onExport" />
			</div>
		</template>
	</OBModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { OBButton, OBModal, OBRadioGroup, OBSelect } from '@onboardmeetings/design-system';

type ExportType = 'excel' | 'pdf';
type Destination = 'download' | 'resources';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
	'update:modelValue': [value: boolean];
	download: [type: ExportType];
	resources: [type: ExportType];
}>();

// Visual PDF is the brief's focus, so it leads.
const type = ref<ExportType>('pdf');
const destination = ref<Destination>('resources');

const typeOptions = [
	{ value: 'pdf', label: 'PDF document' },
	{ value: 'excel', label: 'Excel document' },
];

// Primary action mirrors the chosen format — "Export PDF" / "Export Excel".
const exportButtonLabel = computed(() => `Export ${type.value === 'pdf' ? 'PDF' : 'Excel'}`);

const destinationOptions = [
	{
		value: 'resources',
		label: 'Save to Resources',
		description: 'Save it into an OnBoard resource folder.',
	},
	{ value: 'download', label: 'Download', description: 'Download the file to your device.' },
];

function onExport(): void {
	emit(destination.value === 'download' ? 'download' : 'resources', type.value);
	emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.export-modal {
	display: flex;
	flex-direction: column;
	gap: calc(2 * var(--r));
	padding-top: calc(0.8 * var(--r));

	// Explicit size/weight: the DS systemTitle-1 utility is scoped to
	// #ob-app-core, but OBModal teleports its content outside that element, so
	// the class doesn't match. var(--r) still resolves, so size off it directly.
	// Explicit font-family too: the DS font (latoSemiBold @font-face) is applied
	// via #ob-app-core-scoped rules, but the modal teleports outside that element,
	// so custom text here would otherwise fall back to the browser default font.
	&__title {
		font-family: latoSemiBold, sans-serif;
		font-size: calc(2.8 * var(--r));
		font-weight: 700;
		line-height: 1.2;
	}

	&__field {
		display: flex;
		flex-direction: column;
		gap: calc(0.8 * var(--r));
	}

	&__field-title {
		font-family: latoSemiBold, sans-serif;
		font-size: calc(1.7 * var(--r));
		font-weight: 600;
		color: var(--system-label-primary);
	}

	// A little extra breathing room before the destination choice.
	&__destination {
		margin-top: calc(1.2 * var(--r));
	}

	&__actions {
		display: flex;
		justify-content: flex-end;
		gap: calc(1.2 * var(--r));
		width: 100%;
	}
}
</style>
