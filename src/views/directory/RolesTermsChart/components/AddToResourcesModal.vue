<template>
	<OBModal
		:model-value="modelValue"
		size="medium"
		hide-close
		@update:model-value="v => emit('update:modelValue', v)"
	>
		<div class="add-resources">
			<h1 class="add-resources__title">Add To Resources</h1>

			<!-- Resource folder picker — mirrors the product's ResourceSelector. -->
			<div class="add-resources__section">
				<div class="add-resources__label">Resources</div>
				<ul class="add-resources__folders">
					<li
						v-for="folder in folders"
						:key="folder"
						class="add-resources__folder"
						:class="{ 'is-selected': selectedFolder === folder }"
						@click="selectedFolder = folder"
					>
						<OBIcon location="Lucide" name="Folder" size="calc(2 * var(--r))" use-default-coloring />
						<span>{{ folder }}</span>
					</li>
				</ul>
			</div>

			<div class="add-resources__field">
				<div class="add-resources__field-title">File Name</div>
				<OBTextField v-model="fileName" size="large" />
			</div>
		</div>

		<template #footer>
			<div class="add-resources__actions">
				<OBButton
					variant="secondary"
					size="large"
					text="Cancel"
					@click="emit('update:modelValue', false)"
				/>
				<OBButton
					variant="preferred"
					size="large"
					text="Add to Resources"
					:disabled="!selectedFolder"
					@click="onAdd"
				/>
			</div>
		</template>
	</OBModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { OBButton, OBIcon, OBModal, OBTextField } from '@onboardmeetings/design-system';

const props = defineProps<{ modelValue: boolean; defaultFileName?: string }>();
const emit = defineEmits<{
	'update:modelValue': [value: boolean];
	add: [payload: { folder: string; fileName: string }];
}>();

// Static sample folders for the prototype — the real ResourceSelector reads the
// org's resource tree.
const folders = ['Board Materials', 'Governance', 'Meeting Minutes'];

const selectedFolder = ref('');
const fileName = ref(props.defaultFileName ?? 'Roles & Terms Chart');

// Reset selection each time the modal opens.
watch(
	() => props.modelValue,
	open => {
		if (open) {
			selectedFolder.value = '';
			fileName.value = props.defaultFileName ?? 'Roles & Terms Chart';
		}
	},
);

function onAdd(): void {
	if (!selectedFolder.value) return;
	emit('add', { folder: selectedFolder.value, fileName: fileName.value });
	emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.add-resources {
	display: flex;
	flex-direction: column;
	gap: calc(2 * var(--r));
	padding-top: calc(0.8 * var(--r));

	// Explicit size/weight — DS typography utilities are scoped to #ob-app-core,
	// but OBModal teleports its content outside that element.
	// Explicit font-family: the DS latoSemiBold @font-face is applied via
	// #ob-app-core-scoped rules; this modal teleports outside that element.
	&__title {
		font-family: latoSemiBold, sans-serif;
		font-size: calc(2.8 * var(--r));
		font-weight: 700;
		line-height: 1.2;
	}

	&__section {
		display: flex;
		flex-direction: column;
		gap: calc(0.8 * var(--r));
	}

	&__label {
		font-family: latoSemiBold, sans-serif;
		font-size: calc(1.4 * var(--r));
		color: var(--system-label-secondary);
		padding-bottom: calc(0.8 * var(--r));
		border-bottom: calc(0.1 * var(--r)) solid var(--system-grey5);
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

	&__folders {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: calc(20 * var(--r));
		overflow-y: auto;
	}

	&__folder {
		display: flex;
		align-items: center;
		gap: calc(1.2 * var(--r));
		font-size: calc(1.7 * var(--r));
		padding: calc(1.2 * var(--r)) calc(0.8 * var(--r));
		border-radius: calc(0.8 * var(--r));
		border-bottom: calc(0.1 * var(--r)) solid var(--system-grey6, rgba(116, 116, 128, 0.12));
		cursor: pointer;
		color: var(--system-label-primary);

		&:hover {
			background: var(--system-grey6, rgba(116, 116, 128, 0.12));
		}

		&.is-selected {
			background: var(--system-indigo-transparent, rgba(76, 64, 132, 0.12));
		}
	}

	&__actions {
		display: flex;
		justify-content: flex-end;
		gap: calc(1.2 * var(--r));
		width: 100%;
	}
}
</style>
