<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 class="text-base font-semibold text-gray-900">Changelog</h2>
            <p class="text-xs text-gray-400 mt-0.5">{{ changelog.length }} {{ changelog.length === 1 ? 'entry' : 'entries' }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Entries -->
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div v-for="(entry, i) in changelog" :key="i">
            <!-- Date -->
            <div class="flex items-center space-x-2 mb-2">
              <span class="text-xs font-semibold text-gray-900">{{ entry.date }}</span>
            </div>

            <!-- Changes grouped by type -->
            <ul class="space-y-1.5">
              <li
                v-for="(change, j) in entry.changes"
                :key="j"
                class="flex items-start space-x-2 text-sm text-gray-700"
              >
                <span
                  :class="[
                    'mt-0.5 flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded',
                    typeBadge(change.type).classes
                  ]"
                >{{ typeBadge(change.type).label }}</span>
                <span>{{ change.text }}</span>
                <span v-if="change.auto" class="text-[10px] text-gray-300 flex-shrink-0 mt-0.5">auto</span>
              </li>
            </ul>

            <div v-if="i < changelog.length - 1" class="mt-4 border-t border-gray-100"></div>
          </div>

          <!-- Empty state -->
          <div v-if="changelog.length === 0" class="text-center py-8 text-gray-400">
            <p class="text-sm">No changelog entries yet.</p>
            <p class="text-xs mt-1">Run <code class="bg-gray-100 px-1 rounded">npm run changelog:add</code> to add one.</p>
          </div>

          <!-- How it works (always visible at bottom) -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <details class="text-xs text-gray-400">
              <summary class="cursor-pointer hover:text-gray-600 transition-colors font-medium">How to add changelog entries</summary>
              <div class="mt-2 space-y-2 text-gray-500">
                <p><strong>Automatic:</strong> Changes to phases, features, and stories in <code class="bg-gray-100 px-1 rounded">flags.config.js</code> are detected automatically on every commit.</p>
                <p><strong>Manual:</strong> For anything else, run:</p>
                <code class="block bg-gray-100 px-3 py-2 rounded text-gray-700">npm run changelog:add</code>
                <p>Pick a type (added/changed/fixed/removed), type a sentence describing the change, and it's captured. The next commit compiles it into this changelog.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { changelog } from '../data/changelog.js'

defineEmits(['close'])

const typeBadge = (type) => {
  const badges = {
    added:   { label: 'Add', classes: 'bg-green-100 text-green-700' },
    changed: { label: 'Chg', classes: 'bg-blue-100 text-blue-700' },
    fixed:   { label: 'Fix', classes: 'bg-amber-100 text-amber-700' },
    removed: { label: 'Rem', classes: 'bg-red-100 text-red-700' },
  }
  return badges[type] || badges.changed
}
</script>
