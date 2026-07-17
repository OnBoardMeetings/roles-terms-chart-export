import { createRouter, createWebHashHistory } from 'vue-router';

// Route map matches the 10 sidebar nav sections. Every section starts at the
// shared _placeholder.vue until a designer copies a real view in from
// @onboardmeetings/product-views (see CLAUDE.md for the workflow).
//
// Adding a real view:
//   1. Drop the .vue file under src/views/<section>/
//   2. Replace the dynamic import below to point at it
//   3. Add any sub-routes the section needs (e.g. /meetings/:id)
//
// Hash history is intentional: the scaffold's meta-chrome already uses query
// params (?phase=, ?scenario=, etc.), so the inner app routes through the hash
// to keep the two URL spaces from colliding.
const routes = [
	{ path: '/', redirect: '/home' },
	{
		path: '/home',
		name: 'home',
		component: () => import('@/views/home/index.vue'),
	},
	// Fullscreen routes render without the AppShell chrome (sidebar + chat).
	// The OrganizationSelector is a pre-app-shell view in real product — it
	// overlays the whole app. App.vue reads `meta.layout === 'fullscreen'`
	// to decide whether to render AppShell or the route component directly.
	{
		path: '/organization-selector',
		name: 'organization-selector',
		component: () => import('@/views/organizationSelector/index.vue'),
		meta: { layout: 'fullscreen' },
	},
	{
		path: '/search',
		name: 'search',
		component: () => import('@/views/_placeholder.vue'),
		meta: { label: 'Search' },
	},
	{
		path: '/meetings',
		name: 'meetings',
		component: () => import('@/views/meetings/index.vue'),
		meta: { label: 'Meetings' },
	},
	{
		path: '/notifications',
		name: 'notifications',
		component: () => import('@/views/_placeholder.vue'),
		meta: { label: 'Notifications' },
	},
	{
		path: '/resources',
		name: 'resources',
		component: () => import('@/views/_placeholder.vue'),
		meta: { label: 'Resources' },
	},
	{
		path: '/actions',
		name: 'actions',
		component: () => import('@/views/_placeholder.vue'),
		meta: { label: 'Actions' },
	},
	{
		path: '/messenger',
		name: 'messenger',
		component: () => import('@/views/_placeholder.vue'),
		meta: { label: 'Messenger' },
	},
	{
		path: '/directory',
		name: 'directory',
		component: () => import('@/views/directory/index.vue'),
		meta: { label: 'Directory' },
	},
	{
		path: '/tasks',
		name: 'tasks',
		component: () => import('@/views/_placeholder.vue'),
		meta: { label: 'Tasks' },
	},
	{
		path: '/settings',
		name: 'settings',
		component: () => import('@/views/_placeholder.vue'),
		meta: { label: 'Settings' },
	},
];

export const router = createRouter({
	history: createWebHashHistory(),
	routes,
});
