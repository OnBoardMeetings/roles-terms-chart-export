# Progressive Refinement Framework

Welcome to the Progressive Refinement Framework - a comprehensive methodology for product development from strategic discovery through implementation.

## Overview

The Progressive Refinement Framework defines a structured approach to maturing ideas from high-level bets into executable, well-specified work. This framework bridges product strategy, planning, and technical implementation through five sequential refinement phases.

## Framework Purpose

- **Reduce risk** through incremental refinement at appropriate levels of detail
- **Enable predictability** by defining clear deliverables and gates between phases
- **Facilitate collaboration** across product, design, and engineering
- **Support both human and AI-assisted implementation** through detailed specifications
- **Maintain alignment** from strategic intent through technical execution

## The Five Refinement Phases

### [1. Epic Refinement](./01_Progressive_Refinement_Epic.md)
**Timeline:** 2-12 months ahead
**Purpose:** Mature a bet into a backlog epic
**Output:** Go/no-go decision, prioritized epic with high-level cost and timeline
**Led by:** PM, Design, Engineering Leadership

Discover and validate the "why" and "what" of an initiative. Assess ROI and make go/no-go decisions on major investments.

---

### [2. Feature Refinement](./02_Progressive_Refinement_Feature.md)
**Timeline:** 2-6 sprints ahead
**Purpose:** Mature the mid-level shape of the solution
**Output:** Features with stubbed stories, conservative estimates, and sequenced plan
**Led by:** PM, Design, Team Lead

Break epics into features, stub out stories, estimate conservatively, and forecast realistic timelines.

---

### [3. Story Refinement](./03_Progressive_Refinement_Story.md)
**Timeline:** 1-2 sprints ahead
**Purpose:** Deeply and exhaustively define a small chunk of a feature
**Output:** Stories with complete acceptance criteria, estimates, and dependencies
**Led by:** PM, Design, Engineers

Define comprehensive acceptance criteria, surface dependencies, and ensure stories are sprint-ready.

---

### 4. Task and Test Case Refinement
**Timeline:** Sprint Planning day
**Purpose:** Finalize a clear, achievable sprint plan
**Output:** Sprint commitment with tasks (hour estimates) and test cases
**Led by:** Engineers

Break stories into concrete tasks, estimate in hours, define test cases, and commit to sprint delivery.

---

### 5. Spec Refinement
**Timeline:** First 1-2 days of sprint
**Purpose:** Define the procedural execution plan for implementation
**Output:** Approved implementation spec stored in work item
**Led by:** Implementing Engineer (with AI assistance)

Create detailed technical specifications that enable predictable implementation by humans or AI agents.

---

## The Progressive Flow

```
Epic Refinement (months ahead)
    |
Feature Refinement (sprints ahead)
    |
Story Refinement (1-2 sprints ahead)
    |
Sprint Planning:
  -> Task & Test Case Refinement
  -> Sprint Commitment
    |
Sprint Execution:
  -> Spec Refinement (Day 1-2)
  -> Implementation (Rest of sprint)
```

## Quick Reference Table

| Phase | When | Who Leads | Key Output | Definition of Ready |
|-------|------|-----------|------------|-------------------|
| **Epic** | Months ahead | PM, Design, Eng Leadership | Epic with go/no-go decision | ROI validated, prioritized |
| **Feature** | Sprints ahead | PM, Design, Team Lead | Stubbed stories, forecast | All features created, estimated |
| **Story** | 1-2 sprints ahead | PM, Design, Engineers | Complete acceptance criteria | AC defined, dependencies known |
| **Task & Test** | Sprint Planning | Engineers | Tasks, test cases, commitment | Hour estimates, team commitment |
| **Spec** | Day 1-2 of sprint | Implementing Engineer | Implementation blueprint | Reviewed, approved, locked |

## Supporting Resources

### Templates

- **Spec Template** - Reusable template for authoring implementation specifications (create or link your own)

### Integration with Technical Architecture

The Progressive Refinement Framework works in concert with your technical architecture documentation:

**During Epic/Feature Refinement (Phases 1-2), leaders reference:**
- Release process documentation

**During Task & Test Case Refinement (Phase 4), engineers reference:**
- Automation testing practices
- UI testing framework and patterns

**During Spec Refinement (Phase 5), engineers reference:**
- Architecture overview and layered architecture components
- Component classification guidelines
- Type safety and state management principles
- Code style guide and coding standards
- Implementation pattern templates

## Key Concepts

### Progressive Refinement
Work matures through phases, with each phase adding appropriate detail at the right time. Early phases stay high-level; later phases become progressively more detailed.

### Definition of Ready
Each phase has explicit exit criteria that must be met before work advances to the next phase. This ensures quality and prevents premature commitment.

### Shift from Coding to Design
Engineers focus on systems thinking and architectural design (specs) rather than just writing code. Specs become the primary engineering artifact, enabling both human and AI implementation.

### Collaborative Discovery
Refinement is collaborative across disciplines (PM, Design, Engineering) with different leaders at each phase based on the nature of decisions being made.

### Appropriate Fidelity
Detail matches the horizon - rough estimates months out, precise specifications days before implementation.

## Navigation

- **For epic planning:** [01_Progressive_Refinement_Epic.md](./01_Progressive_Refinement_Epic.md)
- **For feature planning:** [02_Progressive_Refinement_Feature.md](./02_Progressive_Refinement_Feature.md)
- **For story planning:** [03_Progressive_Refinement_Story.md](./03_Progressive_Refinement_Story.md)
- **For sprint planning:** Task & Test Case Refinement (add your own document)
- **For implementation:** Spec Refinement (add your own document) and Spec Template

---

**Framework Version:** 2026-01-25
