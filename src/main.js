import { createApp } from 'vue'
import './style.css'
import '@mdi/font/css/materialdesignicons.css'
// FA Free — MIT-licensed, visually equivalent to FA Pro Regular for the icons
// both sets share. Real product uses Pro via CDN; we bundle Free for parity.
import '@fortawesome/fontawesome-free/css/all.css'
import '@onboardmeetings/design-system/style.css'
import '@onboardmeetings/product-views/style.css'
import { createPrototypeRuntime } from '@onboardmeetings/product-views'
import App from './App.vue'
import { vPhase } from './directives/vPhase'
import { router } from './router'

const app = createApp(App)
app.use(router)
app.directive('phase', vPhase)

// Installs Pinia + Vuetify lightTheme + stubs window.OB_Env / __obOrgHeaders /
// __obUserManager / a fixture-based baseApi. Product-view components render
// correctly only inside <div id="ob-app-core"> — see App.vue.
app.use(createPrototypeRuntime({
  user: { name: 'Prototype Designer', orgId: 'prototype-org' },
}))

app.mount('#app')
