# Story Refinement
2026-01-25
This document is intended for the product development team to use as a guide for this phase in the product development process. 

# Table of Contents

1. [Purpose](#1-purpose)
2. [Overview](#2-overview)
3. [Principles & Conventions](#3-principles--conventions)
   - 3.1 [Right-Sizing Work Items to a System State](#31-right-sizing-work-items-to-a-system-state)
   - 3.2 [Defining the Story Title](#32-defining-the-story-title)
   - 3.3 [Defining the Story Description](#33-defining-the-story-description)
   - 3.4 [Defining the Acceptance Criteria](#34-defining-the-acceptance-criteria)
   - 3.5 [Estimating & Sizing](#35-estimating--sizing)
   - 3.6 [Surfacing Dependencies](#36-surfacing-dependencies)
4. [Definition of Ready](#4-definition-of-ready)

# 1. Purpose

- Deeply and exhaustively define a small chunk of a feature
- Surface the nooks and crannies of the work
- Streamline development by planning for all permutations and use cases
- Enable high-quality user experiences through intentional design of all states, not just happy paths

# 2. Overview

**Typical steps involved:**
1. **Scope the story** - Breakdown higher-level stubs into small increments
2. **Define title & description** - Succinctly communicate what the work is, who it is for, and why we're doing it
3. **Refine state-based acceptance criteria** - Iteratively and exhaustively define all system states, edge cases, and permutations
4. **Estimate story size** - Estimate the effort, creating prerequisite spikes as needed to reduce uncertainty
5. **Identify dependencies** - Track what blocks or is blocked by this story across teams
6. **Validate readiness** - Ensure the story meets Definition of Ready before sprint planning

**Typical people involved:**
- Product Manager
- Design
- Team Lead
- Engineers
- Stakeholders (consulted)

**Typical workflow:**
- **Converge:** As a group in backlog refinement, review stubbed story and share feedback, referencing product & design artifacts as needed
- **Diverge:** Independently diverge and apply updates to the story, designs, and other artifacts based on feedback
- **Converge:** Review again with the group, iterating on the details, and re-estimating as needed
- **Diverge:** Individually apply updates again
- **Repeat:** Converge and diverge iteratively until the story is ready

**Typical timing:**
- 1-2 sprints ahead (just-in-time), prioritizing acceptance criteria (AC) quality over speed.

# 3. Principles & Conventions

## 3.1. Right-Sizing Work Items to a System State

**Capabilities and Experiences**

Backlog items should generally be scoped around meaningful system states (an enabled capability or experience), not internal hygiene (like a technical task).

**Capabilities** are typically backend-focused use-cases the system can support, like:
- fetching and loading a list of records
- creating a new record
- submitting a form response

**Experiences** are typically front-end-focused user interactions with the system, like:
- viewing a list of records
- creating a new record
- submitting a form response

**Rationale**
This scoping helps us:
- maintain a clear story of who this is for, what it is, and why we're doing it
- encourage good code design, as each story represents a complete, testable unit of functionality
- enable co-authoring, as each story is self-contained and can be worked on independently

**Exceptions**
Sometimes it is appropriate to scope work around a technical task instead of a system state, but this should generally be reserved for platform health work. For example:
- Upgrade a dependency
- Refactor a module
- Remove dead code

## 3.2. Defining the Story Title

The title should:
- Anchor the work to the greater context
- Capture "what" capability or experience this increment represents

**Typical convention:**
Use the format `[Product] [Platform] - [Feature] - [Context] - [Specific Item/Action]`

Where:
- **Product** is the application or product abbreviation (configure per your org)
- **Platform** is the platform abbreviation (e.g., Web, iOS, Android, Desktop)
- **Feature** is the main feature or module being worked on
- **Context** is the specific context or page where the work occurs
- **Specific Item/Action** is the exact item or action being implemented

For example:
- "**App Web - Resources - Use Case - Refresh Resources in Folder**"
  - *The ability for the system to refresh resources in a folder*
- "**App Web - Resources - List Page - Resource Cell**"
  - *The ability for a user to experience a resource cell on the list page*
- "**App Web - Resources - Use Case - Search Resources**"
  - *The ability for the system to execute a resources search request*
- "**App Web - Resources - List Page - Search**"
  - *The ability for a user to search for resources on the list page*

**Rationale:**
A consistent pattern like this facilitates understanding and managing of the backlog.

## 3.3. Defining the Story Description

The description should define:
- Who benefits from this work
- What experience or capability is delivered
- And why that is valuable

**Typical convention:** 
Use the format "As a [who], I can [what], so that [why]"

For example:
- "As a user, I can refresh resources in a folder, so that I can acquire the latest content"
- "As a user, I can see the list of resources, so that I can browse them"

**Rationale:**
- Acts as a forcing function during refinement to ensure alignment on goals
- Ensures consumers of this story understand the value and purpose of the work

## 3.4. Defining the Acceptance Criteria

The acceptance criteria should:
- Define the desired state of the capability / experience and its behavior
- Be observable and verifiable
- Be exhaustive and unambiguous
- Be unconcerned with *how* the state is achieved / implemented

**Rationale:**
- Focuses on outcomes rather than implementation details
- Reduces micromanagement and allows engineers flexibility
- Provides clear criteria for testing and validation

**Typical conventions:**
- Use bullet points to organize related criteria and progressively disclose details
- Use nested bullet points underneath "if [x]" and "else if [y]" to represent conditional logic in a pseudo-code style
- Use tables to represent complex permutations or combinations of states
- Be succinct but comprehensive; remember that the readers will have context about the system but that they shouldn't be left to infer any behavior

**Example 1: State-Based AC of an Experience Story**

**Title**: App Web - Tasks - Task Detail - Save Changes
**State-Based AC:**
```
- Save Changes button
  - Title: "Save Changes"
  - State: 
    - If task has been modified
      - Enabled
    - Else if task has not yet been modified, or has been reverted to original state
      - Disabled
  - On tap:
    - Loading state:
      - Button is replaced with a loading indicator
      - All mutable fields are blurred from focus and disabled from user interaction
      - The "Cancel" button is disabled
    - Upon success:
      - View is dismissed
      - Underlying list view automatically refreshes to show updated task
    - Upon failure:
      - Buttons and view return to enabled state
      - Error dialog appears:
        - Title: "Error"
        - Message: "Failed to save changes. Please try again."
        - Dismiss button: "Dismiss"
```

**Example 2: AC with Complex Conditional States**

**Title**: App Web - Signatures - Detail Page - Envelope Details Card
**State-Based AC:**
```
- Envelope title label
  - Text: The title of the envelope
- Envelope sender label
  - Text: 
    - If we have the sender's name:
        - The sender's full name, including salutation and middle initial if available
    - Else:
        - "Unknown Sender"
- Envelope status label
    - If the action is open...
        - "Sent <date>", where date format follows:
        - If date is today:
            - "Sent Today at h:mm a" (e.g., "Sent Today at 8:15 AM")
        - Else if date is yesterday:
            - "Sent Yesterday at h:mm a" (e.g., "Sent Yesterday at 8:15 AM")
        - Else if date is in last 6 days:
            - "Sent on EEEE at h:mm a" (e.g., "Sent on Thursday at 8:15 AM")
        - Else if date is this year:
            - "Sent on MMMM d" (e.g., "Sent on August 21")
        - Else if date is in a previous year:
            - "Sent on MMMM d, yyyy" (e.g., "Sent on August 21, 2024")
    - Else if the action is completed...
        - "Completed <date>", following same date format
    - Else if the action is voided...
        - "Voided <date>", following same date format
    - Else if the action is deleted...
        - "Deleted <date>", following same date format
```

**Example 3: AC for a Backend Capability**

**Title**: App Web - Context - Active Context - Use Case - Set and Get Active Context
**State-Based AC:**
```
- Setting and Unsetting Active Context
  - Payload
    - Context type (e.g., recordList)
    - Associated ID (optional)
  - Setting
    - Callers can set a context as active
  - Unsetting
    - Callers can remove a context as active
  - Persistence
    - No durable persistence - active context is remembered in memory only
    - User-session agnostic
- Getting and Observing Active Context
  - Active contexts should be observable and retrievable
- Tests
  - Each node has unit tests
  - Each payload should have unit tests
  - The complete system has an integration test
```

**Why this level of detail is appropriate:**
- Ensures the work is ready, acting as a forcing function to uncover all edge cases and conditional states
- Streamlines development, given all details are available upfront
- Ensures consistent and predictable behavior, not giving room for interpretation and divergence
- Serves as acceptance test specification for QA
- Results in higher quality user experiences, instead of leaving gaps or inconsistencies. 

**What this is NOT:**
- Not waterfall - this is *more* agile. Responding to change becomes easier because we're surfacing and reviewing upfront and just-in-time (when it's cheap), not during development (when it's expensive).
- Not overkill - without this level of detail, teams get worse UX quality, more engineering friction, and inconsistent behavior. Engineers are left making product decisions in isolation, often discovering edge cases only if the compiler forces them to, resulting in gaps and ad-hoc solutions rather than intentional design.
- Not prescribing technical implementation details to achieve the state. Those technical decisions belong in the **Spec Refinement** phase.
- Not repeating or competing with design artifacts. Ensure that the team knows where sources of truth lie. 

## 3.5. Estimating & Sizing

When estimating and sizing work, the goal is to break work into the smallest deliverable increments possible. The distribution should heavily favor small stories:
- More 1-pointers than 2-pointers
- More 2-pointers than 3-pointers
- More 3-pointers than 5-pointers
- Rarely an 8-pointer
- Never a 13-pointer (must be split or returned to Feature Refinement)

**Typical convention for story points:** 
Story points map directly to days of work (1 point = 1 day to implement, review, validate, and close):
- 1 point <= 1 day to implement, review, validate, and close
- 2 points <= 2 days, still straightforward with a clear approach
- 3 points <= 3 days, moderate complexity but well-understood
- 5 points <= 5 days, significant complexity but high confidence
- 8 points <= 1 sprint, rarely used - high complexity, consider splitting or spiking first
- 13+ points > 1 sprint, never used - split the story or create a spike

**Responsible Party**
Only human engineers should be estimating work. Until they have, story points should be null. This is a forcing function to ensure engineers are making the right considerations and have buy in on the cost.

**Use Spikes to Manage Uncertainty:**

When confidence is insufficient to estimate or commit to a story, create a **spike work item** in a preceding sprint:

Key characteristics of a spike:
- A time-boxed discovery, research, or implementation planning work
- Goal is to reduce uncertainty and unblock the subsequent story
- Outputs may include documented findings, technical plans, architectural decisions, and/or proof of concept

**Example:**
- **Sprint N:** "Web - Collaboration - Spike - Investigate real-time collaboration options"
- **Sprint N+1:** "Web - Collaboration - Use Case - Real-time Note Sync"

**Re-Estimation:**

After defining AC, re-estimate based on complexity revealed. If the estimate significantly increases (e.g., 2->5 or 3->8), consider splitting the story or creating a spike to reduce uncertainty.

## 3.6. Surfacing Dependencies

Some work items are dependent on other work having been finished first. Tracking dependencies helps:
- Discover prerequisites
- Facilitate sequencing
- Ensure work is ready

Some dependencies may seem obvious, but others may be elusive. Documenting dependencies is a good forcing function to surface them all. 

**Typical convention:**
- A simple bulleted list within the "Dependencies" section can be sufficient
- Adding links to the blocking stories is extra helpful

Again, being succinct but comprehensive is good. Readers should have the context, they just need the simple reminder. 

# 4. Definition of Ready

A story can be considered "Ready" for sprint planning when the team agrees:
- [ ] The title, description, AC, and dependencies are fully refined, as described above
- [ ] The story is estimated
- [ ] Designs are completed and reviewed (if applicable)
- [ ] Technical feasibility is validated (no major unknowns or blockers)
- [ ] Team has shared understanding of the work (reviewed in backlog grooming)

When the above are true, the story is "ready" for sprint planning, including:
- Task & Test Case Refinement
- Spec Refinement
