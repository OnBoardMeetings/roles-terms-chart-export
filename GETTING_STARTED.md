# Getting Started

## Quick Start

```bash
# 1. Create your prototype from this template (once per prototype)
gh repo create OnBoardMeetings/my-feature-prototype --template UX-Prototype-Template --clone
cd my-feature-prototype

# 2. Install dependencies (also installs changelog pre-commit hook).
#    Requires GITHUB_TOKEN in your shell env — see below for one-time setup.
npm install

# 3. Start developing
npm run dev
```

## GitHub Packages Authentication

`@onboardmeetings/design-system` and `@onboardmeetings/product-views` are private packages hosted on GitHub Packages. The template's checked-in `.npmrc` reads your auth token from the `GITHUB_TOKEN` environment variable — you set this once per machine and every prototype picks it up automatically.

**One-time setup:**
1. Create a GitHub personal access token (classic) with the `read:packages` and `repo` scopes: <https://github.com/settings/tokens/new?scopes=read:packages,repo&description=OnBoard%20prototype%20packages>
2. Copy the token (starts with `ghp_`).
3. Add to your shell profile (`~/.zshrc` on macOS default, `~/.bashrc` on most Linux):
   ```
   export GITHUB_TOKEN=ghp_yourtokenhere
   ```
4. Reload your shell: `source ~/.zshrc` (or open a new terminal).
5. `npm install` now works against GitHub Packages.

The token never gets committed — `.npmrc` references `${GITHUB_TOKEN}` at install time and resolves from your environment.

GitHub Codespaces exports `GITHUB_TOKEN` automatically — no manual setup if you develop in Codespaces.

## Updating the Design System

When the DS repo ships a new version:
```bash
npm update @onboardmeetings/design-system
```
Or set `"@onboardmeetings/design-system": "^0.1.0"` → whichever version you want in `package.json`, then `npm install`. The `^` range pulls all non-breaking updates automatically.

Claude Code reads `node_modules/@onboardmeetings/design-system/AGENTS.md` for the component inventory — updated with every DS release.

## Using the Design System

Import OB primitives inside `<div id="ob-app-core">` (already wrapped in `App.vue`):

```vue
<script setup>
import { OBButton } from '@onboardmeetings/design-system'
</script>

<template>
  <OBButton text="Continue" variant="preferred" />
  <OBButton text="Cancel" variant="secondary" />
</template>
```

Available variants: `preferred`, `primary`, `secondary`, `success`, `destructive`, `destructive-alt`, `text-only`, `header-action`.
Available sizes: `x-small`, `small`, `medium`, `large`.

**Known limitation (v0.0.2):** `iconLeft`/`iconRight` accept any `mdi-*` name from Material Design Icons. Custom OB SVG icons (the ~335 in `shared/icons/IconUniversal/`) are not yet bundled in the proxy — passing `location="Universal"` falls back to `mdi-<name>` with a one-time console warning. Designers wanting a specific icon should pass `iconLeftLocation="FontAwesome"` with a full `mdi-*` name.

## Using Product Views

Drop a real product screen into the viewport as a backdrop for your new capability:

```vue
<script setup>
import { OrganizationSelectorView } from '@onboardmeetings/product-views'

const handleSelect = (org) => {
  console.log('Selected:', org.name)
}
</script>

<template>
  <OrganizationSelectorView @select="handleSelect" />
</template>
```

Every view accepts props to override its default mock data (e.g. `<OrganizationSelectorView :organizations="myOrgs" />`). For views that consume the fixture registry, pass `apiFixtures` into `createPrototypeRuntime()` in `main.js`:

```js
app.use(createPrototypeRuntime({
  user: { name: 'Alex', orgId: 'org-123' },
  apiFixtures: {
    '/api/billing': { plan: 'enterprise', seats: 12 },
  },
}))
```

## Adding a Feature (the full workflow)

### 1. Define it in flags.config.js

```js
features: {
  'smart-search': {
    label: 'Smart Search',
    phase: 'phase1',
    stories: {
      'basic-search': {},                      // inherits phase1
      'search-filters': { phase: 'phase2' },   // ships later
    },
  },
},
```

### 2. Write the stories

In `src/components/docs/UXDocumentation.vue`, add to the `storyContent` map:

```js
'smart-search.basic-search': {
  description: 'As a user, I can search for documents by keyword so that I find what I need quickly.',
  acceptance: [
    'Search input appears in the header, 400px wide, placeholder "Search..."',
    'Results appear below input after 300ms debounce',
    'Each result shows title, date, and relevance score',
    'Empty state shows "No results found" with suggestion to broaden query',
  ],
},
```

Write acceptance criteria like you'd hand them to a developer — exact sizes, colors, timings, edge cases. See `progressiveRefinement/03_Progressive_Refinement_Story.md` for the format guide.

### 3. Build the feature

In `src/components/layout/MainView.vue` (or a new component):

```vue
<PhaseGate path="smart-search">
  <SearchBar />
  <div v-if="isActive('smart-search.search-filters')">
    <FilterPanel />
  </div>
</PhaseGate>
```

`PhaseGate` handles visibility automatically based on the selected phase.

### 4. Add scenarios (if it has chat flows)

In `src/data/scenarios.js` add the conversation, then tag it in `flags.config.js`:

```js
scenarios: {
  'search-demo': { phase: 'phase1' },
},
```

### 5. Commit

That's it. The changelog auto-detects the new feature, stories, and scenarios from the config diff.

## Moving Features Between Phases

**Option A — Phase Map (no code):** Click "Phase Map" in the header. Drag features between columns. Click "Copy for Claude." Paste into Claude Code. Done.

**Option B — Edit config:** Change `phase: 'phase1'` to `phase: 'phase2'` in `flags.config.js`.

Both approaches auto-update the changelog on commit.

## Customizing the Scaffold

- **Phases**: Edit the `phases` block in `flags.config.js` — add, remove, rename, recolor
- **Sidebar**: Edit `src/components/layout/SidebarNav.vue`
- **Brand colors (meta-chrome only)**: Edit `tailwind.config.js` primary palette
- **OB theme (inside `#ob-app-core`)**: Ships with the design system; bump `@onboardmeetings/design-system` when tokens change upstream
- **Font**: Edit `index.html` Google Fonts import
- **Browser frame URL**: Edit `src/App.vue`

## Phase Controls in Templates

```vue
<!-- Gate a whole feature -->
<PhaseGate path="smart-search">
  <MyComponent />
</PhaseGate>

<!-- Gate a specific story -->
<div v-if="isActive('smart-search.search-filters')">
  <FilterPanel />
</div>

<!-- Directive shorthand -->
<div v-phase="'phase1'">Only in Phase 1+</div>
```

## Changelog

**Automatic:** Config changes (new features, phase moves, new stories) are detected on every commit via the pre-commit hook.

**Manual:** For design decisions or UX changes not in the config:
```bash
npm run changelog:add -- "redesigned the search results layout"
```

The Changelog button in the header shows all entries.

## Upgrading the Design System or Product Views

Prototypes pin exact versions. To upgrade:

```bash
npm install @onboardmeetings/design-system@0.1.0 --save-exact
npm install @onboardmeetings/product-views@0.1.0 --save-exact
```

Changelogs for each package live in their respective repos under OnBoardMeetings.

## Progressive Refinement

The `progressiveRefinement/` directory is the reference for how to write stories:

1. **Epic Refinement** (`01_`) — Value, scope, go/no-go
2. **Feature Refinement** (`02_`) — Story stubbing, estimation
3. **Story Refinement** (`03_`) — Acceptance criteria format

When writing `storyContent` entries in UXDocumentation, follow the Story Refinement format.
