# Feature Refinement
2026-01-25
This document is intended for the product development team to use as a guide for this phase in the product development process. 

# Table of Contents

1. [Purpose](#1-purpose)
2. [Overview](#2-overview)
3. [Principles & Conventions](#3-principles--conventions)
   - 3.1 [Right-Sizing Features](#31-right-sizing-features)
   - 3.2 [Defining the Feature Title](#32-defining-the-feature-title)
   - 3.3 [Stubbing & Estimating Stories](#33-stubbing--estimating-stories)
   - 3.4 [Sequencing & Forecasting](#34-sequencing--forecasting)
4. [Definition of Ready](#4-definition-of-ready)

# 1. Purpose

- Mature the mid-level shape of the solution
- Quickly surface all dependencies and scope
- Forecast a realistic cost and timeline
- Drive strategic conversations on scope, resourcing, and release phasing

# 2. Overview

**Typical steps involved:**
- **Create the Features** - Create all possible features under the epic, being exhaustive and conservative
- **Stub the Stories** - Populate each feature with at least one story, focusing on possible breadth involved
- **Estimate the Stories** - Conservatively score the tickets to gauge effort
- **Sequence the Work** - Tentatively distribute tickets across upcoming sprints to project the timeline

**Typical people involved:**
- Product Manager
- Design
- Team Lead
- Engineers (informed)
- Stakeholders (consulted)

**Typical workflow:**
- The parties involved converge, in backlog refinement sessions and ad-hoc calls, syncing on the work and supporting artifacts (designs, stakeholder input, PRD, etc.)
- The parties diverge, independently updating the work and artifacts based on feedback
- The parties involved converge again, iterating on the details, and re-estimating as needed
- Repeat as needed
- Graduate into story refinement when ready

**Typical timing:**
- 2-6 sprints ahead, continuously scouting the mid-term horizon


# 3. Principles & Conventions

## 3.1. Right-Sizing Features

**Philosophy:**
Features should generally be:
- Scoped around a meaningful chunk of functionality for a user or system
- Small enough to be completed in 1-3 sprints
- Large enough to be meaningful and valuable

For example, within a Dashboard epic, you might have features like:
- "Dashboard - Upcoming Items Section"
- "Dashboard - Pending Actions Section"
- "Dashboard - Announcements Section"
- "Dashboard - Audit Events"
- "Dashboard - Notifications & Deep Links"

**Benefits:**
This scoping helps us:
- Strongly align work around the value prop (the capability or experience it is enabling)
- Manage the backlog in practical, cohesive chunks
- Split the work into pragmatic release phases
- Enable higher-level oversight and forecasting of the work


## 3.2. Defining the Feature Title

**Philosophy:**
The feature's title should:
- Anchor the work to the greater context
- Capture "what" capability or experience this increment represents
- Be concise but specific

**Typical convention:**
Use the format `[TeamIdentifier][InvestmentType] [EpicAbbreviation] - [FeatureName]`

Where:
- TeamIdentifier: A short label, tag, or emoji representing the team (follows from the epic)
- InvestmentType: A label or tag representing the investment type (follows from the epic)
- EpicAbbreviation: An abbreviation of the epic, to be distinguishing but brief
- FeatureName: The name of the feature

For example within an SSO Integration epic:
- "**[Alpha][Roadmap] SSO: Provider Configuration**"
- "**[Alpha][Roadmap] SSO: Login Flow**"
- "**[Alpha][Roadmap] SSO: User Provisioning**"
- "**[Alpha][Roadmap] SSO: Admin Dashboard**"
- "**[Alpha][Roadmap] SSO: Audit Logs**"
- "**[Alpha][Roadmap] SSO: MVP Release**"
- "**[Alpha][Roadmap] SSO: Post-Release Cleanup**"

These features are generally scoped to a chunk of functionality for the user or system, except the last two which are acceptable exceptions, scoped to technical tasks to be done.

**Rationale:**
This consistent, succinct naming helps us:
- Efficiently read and manage the backlog
- Understand the greater context when reading this feature's title in isolation
- Visualize the work in timeline views of the backlog


## 3.3. Stubbing & Estimating Stories

**Philosophy:**
When stubbing the stories under each feature, we should:
- Focus on explicit, possible breadth, not depth
- Stay high-level and conservative
- Expect changes

**Title and Estimate:**

At this phase, each story only needs a loosely formatted title and a story point estimate. 

For example:
- Under an Actions List feature, we might stub out stories like:
  - "List Items" (5 points)
  - "Search" (3 points)
  - "Filter" (3 points)
  - "Custom Sorting" (0 points)
- Under an Audit Logs feature, we might just stub a single story that we'll expand later like:
  - "TBD" (5 points)

For estimates, we should:
- Use the fibonacci scale, rounding up
- Stay conservative, not falling into the trap of overconfidence, and expect details to surface later
- Use zero story points to explicitly represent work that we don't plan to implement (we can remove these tickets later)

See the [Story Refinement](./03_Progressive_Refinement_Story.md) document for more details on estimating stories.

**Area Path and Iteration Path**

Each story needs metadata to categorize it within your tracking tool. The specifics depend on your organization, but typically include:

- **Area Path**: Used to categorize work by product, platform, or component. Configure paths that reflect your product and platform structure.
  - Example: `[Org]\[Backlog]\[Product]\[Platform]`

- **Iteration Path**: Used to categorize work by team and sprint. Configure paths that reflect your team structure.
  - Example: `[Org]\[Team Name]`

When stubbing work items, use the appropriate area path and the team's backlog iteration path. During the sequencing phase, the team will choose which sub-iteration path to use when assigning to a sprint. 

**Rationale:**
By creating & estimating lightweight stubs like this, we can:
- Surface all possible work to be considered
- Quickly forecast a realistic cost and timeline
- Save time by staying out of the weeds


## 3.4. Sequencing & Forecasting

**Philosophy:**
Stubbed stories should be sequenced logically to help with planning and forecasting.

**Typical convention:**
- Tentatively distribute tickets across upcoming sprints, allocating based on expected capacity and past velocity
- Sequence the work logically, considering dependencies, contributors, and other work streams
- Use the resulting plan to forecast and drive strategic planning
- Continuously revisit and adjust the plan over time

**Rationale:**
This approach helps us:
- Understand the cost and timeline
- Be honest with ourselves about the work involved
- Drive strategic planning and resource allocation
- Consider intermediate release phases or changes to scope early

# 4. Definition of Ready

**Philosophy:**
Feature Refinement doesn't need to be exhaustive - it needs to be "good enough" to enable Story Refinement. Teams should graduate work when they have sufficient mid-level clarity, knowing that details will emerge during Story Refinement.

**Typical readiness indicators:**
- All features under the epic have been identified and created
- Each feature has stubbed stories representing the breadth of work
- Stories have conservative estimates (even if rough)
- Work has been sequenced across sprints to forecast timeline
- Major dependencies and risks are identified
- The team has confidence in the cost and timeline forecast
- Design artifacts exist at an appropriate fidelity (concepts, rough flows)
- Product and engineering are aligned on scope and approach

**When the lines blur:**
The boundary between Feature and Story Refinement is naturally fuzzy. Some teams may:
- Begin Story Refinement on early features while still stubbing later ones
- Discover new stories during Story Refinement that require returning to Feature Refinement
- Move fluidly between the phases as understanding evolves

This is expected and healthy - just-in-time refinement means starting the next phase when you have enough clarity to make progress, not waiting for perfection.

**Rationale:**
Graduating to Story Refinement at the right time ensures teams don't over-invest in planning upfront, while still having enough structure to enable detailed story work. The fuzzy boundary allows teams to adapt their process to the nature of the work.
