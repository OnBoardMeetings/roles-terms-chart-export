import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Vite pre-bundles deps to optimize load. Without this exclude, its
  // optimizer re-processes product-views and inlines a second copy of
  // vue-router into the optimized dep. Two vue-router instances means
  // two `Symbol("router")` injection keys, so `useRouter()` inside
  // product-views views can't find the router that the scaffold's
  // `app.use(router)` registered. Excluding product-views makes Vite
  // serve it as raw ESM, and its `import { useRouter } from "vue-router"`
  // resolves to the single top-level vue-router install like it should.
  optimizeDeps: {
    exclude: ['@onboardmeetings/product-views'],
  }
})
