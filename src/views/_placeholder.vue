<template>
	<div class="h-full flex flex-col bg-gray-50">
		<!-- View header: shows the route label when known, otherwise a skeleton bar. -->
		<header class="h-14 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
			<span v-if="label" class="text-base font-medium text-gray-700">{{ label }}</span>
			<div v-else class="h-5 bg-gray-200 rounded w-32"></div>
		</header>

		<main class="flex-1 overflow-auto p-6 relative">
			<!-- Copy-in prompt: this view has no real product-view wired up yet. -->
			<div class="mb-6 rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600">
				<div class="font-medium text-gray-800 mb-1">Placeholder view</div>
				<p class="mb-2">
					This section has no view from <code class="px-1 py-0.5 bg-gray-100 rounded">@onboardmeetings/product-views</code> wired up yet.
				</p>
				<p class="text-gray-500">
					Ask your coding assistant to prototype this section — it will copy a real view from the product-views package into <code class="px-1 py-0.5 bg-gray-100 rounded">src/views/</code> and route to it. See <code class="px-1 py-0.5 bg-gray-100 rounded">CLAUDE.md → Workflow: prototyping a real product view</code>.
				</p>
			</div>

			<!-- Skeleton scaffolding so the space isn't empty while a designer is setting up. -->
			<div class="space-y-6">
				<div class="bg-white rounded-xl border border-gray-200 p-6">
					<div class="h-6 bg-gray-200 rounded w-48 mb-4"></div>
					<div class="space-y-3 mb-6">
						<div class="h-4 bg-gray-100 rounded w-full"></div>
						<div class="h-4 bg-gray-100 rounded w-5/6"></div>
						<div class="h-4 bg-gray-100 rounded w-4/5"></div>
					</div>
					<div class="h-32 bg-gray-100 rounded-lg mb-4"></div>
					<div class="h-4 bg-gray-100 rounded w-2/3"></div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-200 p-5">
						<div class="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
						<div class="space-y-2">
							<div class="h-3 bg-gray-100 rounded w-full"></div>
							<div class="h-3 bg-gray-100 rounded w-4/5"></div>
						</div>
						<div class="h-16 bg-gray-50 rounded-lg mt-4"></div>
					</div>
				</div>

				<div class="bg-white rounded-xl border border-gray-200 p-6">
					<div class="h-5 bg-gray-200 rounded w-40 mb-5"></div>
					<div class="space-y-4">
						<div v-for="i in 5" :key="i" class="flex items-center space-x-4">
							<div class="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
							<div class="flex-1 space-y-2">
								<div class="h-4 bg-gray-200 rounded w-1/3"></div>
								<div class="h-3 bg-gray-100 rounded w-2/3"></div>
							</div>
							<div class="h-8 w-20 bg-gray-100 rounded"></div>
						</div>
					</div>
				</div>

				<div class="h-32"></div>
			</div>

		</main>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const label = computed(() => route.meta?.label ?? '');
</script>
