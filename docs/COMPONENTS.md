# Component Behavior Specification

This document is the developer handoff reference. Each component's behavior is specified at the level of detail needed for implementation.

---

## AppShell

**Purpose:** Main application layout — sidebar, content area, and resizable chat panel.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| currentScenario | Object | null | Active conversation scenario |
| initialChatMode | String | 'split' | 'hidden' / 'split' / 'fullscreen' |
| emptyChat | Boolean | false | Show welcome state with no messages |

**Chat Modes:**
| Mode | Behavior |
|------|----------|
| hidden | Chat panel collapsed to 0px; CTA pill visible |
| split | Chat panel visible at persisted width; main content resizes |
| fullscreen | Chat panel fills content area |

**Resize Behavior:**
- Drag handle between main content and chat panel
- Min width: 320px (absolute) or 30% of container
- Max width: 800px (absolute) or 55% of container
- Double-click resets to 420px default
- Width persists to localStorage

**Responsive:**
- Split mode disabled below 900px content width
- Auto-switches to fullscreen; returns to split when width recovers

---

## ChatInterface

**Purpose:** Message display area with scroll management.

**Scroll Behavior:**
- New messages auto-scroll to bottom
- User scroll-up preserves position
- Fade overlay at bottom (100px) with backdrop blur

---

## PatternExplorer

**Purpose:** Sidebar for browsing and selecting scenarios.

**Behavior:**
- Groups scenarios by phase (from flags.config.js)
- Each scenario card shows title, description, and phase badge
- Active scenario highlighted with primary color
- Untagged scenarios (not in flags.config.js) shown in "Untagged" group

---

## PhasePicker

**Purpose:** Header control for toggling active phases.

**Behavior:**
- Renders one button per phase defined in flags.config.js
- Active phases shown with white background + shadow
- Clicking toggles phase on/off
- At least one phase must remain active (prevents empty state)
- Each phase shows its configured color dot

---

## FeatureStory

**Purpose:** Expandable story card for UX documentation.

**States:**
| State | Visual |
|-------|--------|
| pending | Gray circle indicator |
| in-progress | Blue circle with pulse animation |
| complete | Green circle with checkmark |

**Interactions:**
- Click header to expand/collapse
- Copy button copies story as formatted markdown to clipboard
- Tags shown as rounded pills

---

## SharedChatInput

**Purpose:** Unified input that morphs between CTA pill (hidden mode) and text input (split/fullscreen).

**States:**
- Collapsed CTA pill (hidden mode) — draggable to corners
- Expanded text input — positioned at bottom of chat panel
- FAB mode — minimal circular button when dragged to corner

**Animations:**
- CTA → Input morph: 300ms ease-out
- Corner snap: 350ms with pop effect
- Position persists to localStorage

---

## MarkdownRenderer

**Purpose:** Renders markdown with custom block syntax.

**Custom Blocks:**
| Syntax | Renders As |
|--------|-----------|
| `:::meeting{id="1"}` | Meeting card with date cell, title, time, action buttons |
| `:::document{id="1"}` | Document card with date cell and open button |
| `:::source{id="1"}` | Citation source card with metadata |
| `:::error{}` | Red error callout |
| `:::info{}` | Blue info callout |
| `:::warning{}` | Yellow warning callout |
| `:::actions` | Inline action button group |
| `[1]` | Inline citation marker (clickable) |

**Block Content Format:**
```
:::meeting{id="1"}
title: Meeting Title
date: March 27, 2026
time: 10:00 - 11:30 AM EST
url: /path/to/book
joinUrl: /path/to/join
:::
```
