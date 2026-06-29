# UX Prototype Template

## Workflow: Adding a Feature

This is the sequence. Every new feature follows these steps in order. Do not skip steps.

### 1. Define the feature in flags.config.js
Add the feature and its stories to the `features` block. Assign a phase. Stories without an explicit `phase` inherit from the feature. Stories that ship later get an explicit phase.

```js
'my-feature': {
  label: 'My Feature',
  phase: 'phase1',
  stories: {
    'core-behavior': {},                    // inherits phase1
    'enhanced-behavior': { phase: 'phase2' }, // ships later
  },
},
```

### 2. Write story content in UXDocumentation
Add entries to the `storyContent` map in `src/components/docs/UXDocumentation.vue`. Each story needs a user story description and acceptance criteria following progressive refinement format:

```js
'my-feature.core-behavior': {
  description: 'As a [user], I can [action] so that [benefit].',
  acceptance: [
    'Specific, testable criterion with exact values (sizes, colors, timings)',
    'Another criterion',
  ],
},
```

Acceptance criteria must be specific enough to implement — exact pixel values, color codes, animation durations. See `progressiveRefinement/03_Progressive_Refinement_Story.md` for the full format.

### 3. Implement the feature in MainView (or relevant component)
Use `PhaseGate` and `isActive()` to gate visibility by feature and story:

```vue
<PhaseGate path="my-feature">
  <!-- Renders when my-feature's phase is active -->
  <div v-if="isActive('my-feature.enhanced-behavior')">
    <!-- Only when enhanced-behavior's phase is also active -->
  </div>
</PhaseGate>
```

### 4. Changelog is automatic
The pre-commit hook auto-detects changes to `flags.config.js` (new features, phase moves, new stories). For non-config changes, run:
```bash
npm run changelog:add -- "description of what changed"
```

## Workflow: Prototyping a Real Product View

This is the primary loop designers will run you through. When someone says "I want to prototype something in the meetings list" or "let's change the dashboard," execute this workflow:

### 1. Find the view source in product-views

Product views live in `node_modules/@onboardmeetings/product-views/src/views/`. List what's available:

```bash
ls node_modules/@onboardmeetings/product-views/src/views/
```

Each subfolder is a view. If the user asks for a section that doesn't have a view yet (`meetings`, `tasks`, etc.), tell them — product-views may not have built that one yet.

### 2. Copy the view into the template

Drop the view(s) into `src/views/<section>/`:

```bash
mkdir -p src/views/meetings
cp -r node_modules/@onboardmeetings/product-views/src/views/MeetingList/* src/views/meetings/
```

Local copies are now free to modify. They do NOT track upstream product-views changes — that's intentional. A prototype is a one-shot divergence.

### 3. Wire the route

Open `src/router.js`. Find the section's route entry (every sidebar section already has a placeholder route). Replace the `_placeholder.vue` import with the real view:

```js
{
  path: '/meetings',
  name: 'meetings',
  component: () => import('@/views/meetings/MeetingListView.vue'),
},
```

Add sub-routes as the prototype grows (`/meetings/:id` for detail, etc.). Sidebar nav keys on route `name`, so don't change the name.

### 4. Layer the new experience

Now edit the copied view freely. Pull in OB* components from `@onboardmeetings/design-system` — consult `node_modules/@onboardmeetings/design-system/AGENTS.md` first for the component surface. Do not re-implement DS primitives in Tailwind; reach for `OBButton`, `OBMeetingCell`, `OBModal`, etc.

### 5. Verify

Run `npm run dev`, navigate the sidebar, confirm the section now renders the real view instead of the placeholder.

---

## Workflow: Moving Features Between Phases

**From the UI:** Open Phase Map (button in header), drag features/stories between columns, click "Copy for Claude" to get the config update, paste into Claude Code.

**From the config:** Change the `phase` value in `flags.config.js`. The changelog auto-diff captures it on next commit.

**Rule:** Stories cannot be in an earlier phase than their parent feature. The Phase Map enforces this on drag. In the config, a story's phase must have an `order` >= its feature's phase order.

## Workflow: Moving Features Between Phases (Designer without agent)

Open Phase Map overlay → drag → Copy for Claude → paste into Claude Code → agent updates flags.config.js → commit → changelog auto-updates.

---

## Tech Stack
- Vue 3 (Composition API, `<script setup>`)
- Vite 7
- Tailwind CSS 3.4 — meta-chrome only. **Strictly outside `<div id="ob-app-core">`.** See "Scoping rule" below.
- Vuetify 3 + SCSS — scoped to `<div id="ob-app-core">` via `@onboardmeetings/design-system`
- Pinia — installed by `createPrototypeRuntime()` for product-view fixtures only
- `@onboardmeetings/design-system` — OB* primitives (OBButton, …) published from OnBoardMeetings/onboard-design-system
- `@onboardmeetings/product-views` — extracted screens + prototype runtime, published from OnBoardMeetings/onboard-product-views. Ships both `dist/` (build output) and `src/` (view sources) so the "Prototyping a Real Product View" workflow can `cp` from node_modules.
- `vue-router` 4 — hash-history routing inside the prototype shell
- markdown-it (custom plugins for :::blocks and citations)
- Lucide icons
- html-to-image (screenshots)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run changelog` — Compile changelog fragments into src/data/changelog.js
- `npm run changelog:add` — Interactive prompt to create a changelog entry
- `npm run changelog:add -- "description"` — Inline changelog entry (type defaults to "added")
- `npm run changelog:add -- --type changed "description"` — Inline with explicit type (added|changed|fixed|removed)
- `npm run changelog:clean` — Compile and remove processed fragment files

## Architecture

### Feature Flag System
**`flags.config.js`** is the single source of truth for what exists and when it ships.

- **Phases** are cumulative. Selecting Phase 2 shows Phase 1 + Phase 2. Selecting Future shows everything.
- **Features** have a `phase` — when the feature first appears.
- **Stories** without a `phase` inherit from their feature. Stories with an explicit `phase` are detached — they ship in a different phase than their parent.

The flagging schema only tracks features and stories. Chat conversations (`src/data/scenarios.js`) are pure content data — they don't participate in phase gating.

The `useFlags()` composable makes this reactive. Components use:
- `<PhasePicker>` — header radio selector for phases (cumulative)
- `<PhaseBadge path="feature.story">` — colored phase indicator
- `<PhaseGate path="feature.story">` — conditional rendering wrapper
- `v-phase="'phase1'"` — directive for inline visibility control

### Phase Map Overlay
Opened via "Phase Map" button in header. Shows all features and stories organized by phase in draggable columns.

- Dragging a feature moves it and all inheriting stories.
- Expanding a feature (click chevron) shows individual stories that can be dragged independently.
- Stories cannot be placed before their parent feature's phase.
- "Copy for Claude" exports the full updated config blocks — paste directly into Claude Code.
- Changes are session-only (reset on refresh). The config file is canonical.

### Scenario System (chat content only)
Scenarios in `src/data/scenarios.js` are conversation flows for the chat sidebar. Each scenario has:
- `id`, `title`, `description`
- `category` — bucket the scenario lives in (`phase0`, `phase1`, `future`); the chat sidebar filters its conversation list by category
- `messages[]` — array of `{ role, content, tools?, citations? }`
- Content uses markdown with custom :::block syntax

Scenarios are NOT part of the flagging schema — they don't appear in `flags.config.js` and don't show up in the Phase Map. Add or edit them by editing `src/data/scenarios.js` directly.

### Changelog System
**Do not edit `src/data/changelog.js` directly** — it is auto-generated.

1. **Auto-diff:** On every commit, the pre-commit hook diffs `flags.config.js` against the last git tag and auto-detects new features, phase moves, and new stories.
2. **Manual entries:** `npm run changelog:add -- "description"` for non-config changes.
3. **Pre-commit hook:** Compiles fragments + auto-diff into `src/data/changelog.js` and stages it. Installed automatically via `npm install`.
4. **UI:** Changelog modal (header button) shows all entries with type badges and a "How to add entries" section.

**Agent rule:** For config changes, just modify `flags.config.js` — the auto-diff handles it. For other changes, use `npm run changelog:add -- "description"`. Never create fragment files manually. Never edit `src/data/changelog.js`.

### Progressive Refinement Framework
The `progressiveRefinement/` directory defines how work moves from idea to implementation:

1. **Epic Refinement** (`01_`) — Go/no-go decision, value and scope
2. **Feature Refinement** (`02_`) — Story stubbing, estimation, sequencing
3. **Story Refinement** (`03_`) — Acceptance criteria, dependencies, sprint-ready

Stories in `storyContent` (UXDocumentation.vue) should follow the Story Refinement format: specific, testable acceptance criteria with exact values. The progressive refinement docs are the reference for what "good" looks like at each level.

### Routing
`src/router.js` is the single source of truth for what the sidebar can navigate to. Ten routes ship by default (one per sidebar section). Home is wired to `OrganizationSelectorView` from product-views; every other section points at `src/views/_placeholder.vue` until a designer copies a real view in.

- Hash history (`#/meetings`) — chosen so the inner app's routes don't collide with the meta-chrome's query params (`?phase=`, `?scenario=`, etc.).
- Sidebar nav uses route `name` for the active-link id. If you add a sub-route (e.g. `/meetings/:id`), keep the top-level `name: 'meetings'` intact so the sidebar continues to highlight correctly.
- `?view=meetings` query param still works — `App.vue` calls `router.push` for it on mount.

### Views
```
src/views/
  _placeholder.vue      — shared skeleton + flag-demo shapes for unwired sections
  home/                 — wraps OrganizationSelectorView from product-views
  <section>/            — added by designers following the "Prototyping a Real Product View" workflow
```

### Component Structure
```
src/components/
  layout/      — AppShell, ChatInterface, MainView (<RouterView /> slot),
                 SharedChatInput (CTA pill, FAB, morphing input), MessageList
  messages/    — AssistantMessage, UserMessage, LoadingState, ToolExecutionUI
  markdown/    — MarkdownRenderer, CodeBlock, CitationTooltip, InteractiveTable
  interactive/ — CollapsibleSection, SuggestedActions, SourcePanel
  docs/        — UXDocumentation, FeatureEpic, FeatureStory
  flags/       — PhasePicker, PhaseBadge, PhaseGate, PhaseMapOverlay
```

### Custom Markdown Blocks
The markdown renderer supports:
- `:::meeting{id="1"}` — Meeting cards with date cells
- `:::document{id="1"}` — Document cards
- `:::source{id="1"}` — Citation source cards
- `:::error{}` — Error callouts
- `:::info{}` / `:::warning{}` — Info/warning callouts
- `:::actions` — Action button groups
- `:::tools{mode="parallel"}` — Tool execution status

### Design System and Product Views
The OnBoard design system (`@onboardmeetings/design-system`) and product views (`@onboardmeetings/product-views`) are consumed as versioned npm packages from GitHub Packages. Prototypes pin exact versions.

Both packages render correctly only inside `<div id="ob-app-core">` (see `src/App.vue`). That element is the scoping boundary: OB tokens, Vuetify, and the light theme apply inside it; template meta-chrome (Tailwind) stays outside.

#### Scoping rule (hard line)

**Inside `#ob-app-core`: DS components and product-views only. No Tailwind.**

The OB scope sets `font-size: 10px` and exposes `--r: 10px` so that `calc(X * var(--r))` and `em` units in DS components resolve correctly. Mixing Tailwind chrome inside that scope causes silent typography bugs — Tailwind utility classes work (they compute from html root), but any plain div without an explicit text-* class inherits the 10px and reads tiny. Worse, "fixing" it with a `text-base` override at a high level breaks DS components that use `em` deliberately (OBNavigationSideBar's labels, widths, and radii are all em-based to inherit the 10px base).

So:
- **New surfaces in the prototype experience** (sidebars, modals, panels, custom layouts) → composed from DS primitives. If a DS primitive doesn't exist for the shape you need, build it in the DS first or fall back to a single `<v-card>` / `<v-sheet>` and DS tokens (`systemBody`, `systemHeadline`, `calc(X * var(--r))` spacing, `var(--system-*)` colors).
- **Tailwind classes** → reserved for the outer prototype frame: the browser-mockup chrome around the viewport, the phase picker, the changelog modal trigger, the docs panel — anything that lives outside the rendered OnBoard product itself.

#### Legacy chat surfaces (to be converted)

The current chat experience — `src/components/layout/ChatInterface.vue`, `SharedChatInput.vue`, `MessageList.vue`, `messages/*.vue`, `markdown/*.vue` — is **legacy Tailwind chrome inside `#ob-app-core`**. It's a port from the original assist project that predates this scoping rule. Each of those components currently carries a `text-base` override on its root to work around the typography bug, which is a bandaid, not a fix.

Target state: rebuild the chat in DS primitives so the bandaids can come out. New chat work should use DS components (or extend the DS); don't add new Tailwind subtrees inside `#ob-app-core`.

`src/main.js` calls `createPrototypeRuntime()` from the product-views package, which installs Pinia + Vuetify (lightTheme) and stubs `window.OB_Env`, `window.__obOrgHeaders`, `window.__obUserManager`, and a fixture-based `baseApi` so product views can render without a live backend. Fixture data is supplied via the `apiFixtures` option to `createPrototypeRuntime()`.

**Version resolution gotcha:** a copied product view's `import { OBButton } from '@onboardmeetings/design-system'` resolves against this scaffold's DS install (one install, never duplicated). Peer deps are manifest-time claims, not runtime behavior. If you hit version weirdness — e.g. a compiled product view calls a DS symbol that no longer exists — read `node_modules/@onboardmeetings/product-views/CLAUDE.md` for the full externalization model.

**Agent rule:** before composing any UI with DS components, read `node_modules/@onboardmeetings/design-system/AGENTS.md`. It is the offline inventory of every exported component with props, emits, slots, common patterns, and gotchas. It ships with the package and is updated whenever the DS is rebuilt. Prefer a DS component over a hand-rolled Tailwind reimplementation whenever the intent matches — OBButton for actions, OBNavigationSideBar for the shell, OBMeetingCell for meeting rows, OBFileCell + OBDropzone for file surfaces, etc.

#### Updating the DS in this prototype

When the DS ships a new version, pull it in with a single command:

```bash
npm update @onboardmeetings/design-system
```

That respects the `^` range in `package.json` and fetches the latest compatible release. To jump across a major boundary (e.g. `0.x` → `1.0`), edit the pin in `package.json` manually, then `npm install`.

Verify after updating:
1. Re-read `node_modules/@onboardmeetings/design-system/AGENTS.md` — component surface may have changed.
2. Run `npm run dev` and click through the prototype; visual regressions in DS components land silently.
3. If `npm install` complains about `product-views` peer deps, retry with `--legacy-peer-deps`. `product-views` pins DS strictly and loosens slowly; `--legacy-peer-deps` is safe when DS bumps are additive (the usual case).

New DS version numbers appear on the [packages page](https://github.com/OnBoardMeetings/onboard-design-system/pkgs/npm/design-system). Release notes live on git tags in the [DS repo](https://github.com/OnBoardMeetings/onboard-design-system).

#### Authentication

The template's checked-in `.npmrc` reads `GITHUB_TOKEN` from your shell env. One-time machine setup is in [GETTING_STARTED.md](./GETTING_STARTED.md). If `npm install` / `npm update` errors with `401 Unauthorized`, your `GITHUB_TOKEN` env var is missing or expired.

## Conventions
- Scaffold state management is local (refs, composables). Pinia is installed by the prototype runtime but reserved for product-view fixtures — do not introduce Pinia stores in scaffold code.
- Use `@/` alias for imports from `src/`
- `flags.config.js` is the single source of truth for what exists and when it ships
- Story content lives in `storyContent` map in UXDocumentation.vue
- Scenarios in `src/data/scenarios.js` define chat conversation content; they are NOT in the flagging schema — chat sidebar filters by `category`, not by phase flags
- Phase assignments live in `flags.config.js`, not scattered across components
- The pre-commit hook keeps the changelog in sync automatically
- Every feature in `flags.config.js` should have corresponding story content in UXDocumentation
- Acceptance criteria follow progressive refinement Story Refinement format
