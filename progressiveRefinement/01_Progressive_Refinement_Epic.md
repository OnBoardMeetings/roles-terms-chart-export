# Epic Refinement
2026-01-25
This document is intended for the product development team to use as a guide for this phase in the product development process. 

# Table of Contents

1. [Purpose](#1-purpose)
2. [Overview](#2-overview)
3. [Principles & Conventions](#3-principles--conventions)
   - 3.1 [Discovery Artifacts](#31-discovery-artifacts)
   - 3.2 [Why should we pursue this?](#32-why-should-we-pursue-this)
   - 3.3 [What form should it take?](#33-what-form-should-it-take)
   - 3.4 [How might we accomplish it?](#34-how-might-we-accomplish-it)
   - 3.5 [When might it be achievable by?](#35-when-might-it-be-achievable-by)
   - 3.6 [Assessing ROI](#36-assessing-roi)
   - 3.7 [Populating the Epic](#37-populating-the-epic)
   - 3.8 [Prioritizing the Work](#38-prioritizing-the-work)
4. [Definition of Ready](#4-definition-of-ready)

# 1. Purpose

- Mature a bet into a backlog epic
- Strengthen understanding of the value and scope 
- Forecast a high-level cost and timeline
- Enable the go / no-go decision

# 2. Overview

**What this phase validates:**
- **Why** it would be valuable to the business and customers
- **What** high-level form it should take to solve the problem
- **How** it might be implemented (viably estimated, not prescribed)
- **When** it might be achievable by
- **ROI assessment** - is it a worthwhile pursuit based on cost and benefit?
- **Go / no-go decision** - Add to the backlog if ready
- **Prioritization** - Rank relative to other initiatives

**Typical people involved:**
- Product, Design, and Engineering Leadership
- Product Manager
- Design
- Team Lead and/or Principal Engineer
- Stakeholders (consulted)

**Typical workflow:**
- Product leads discovery using their preferred methodology, collaborating with Design and Engineering Leadership
- Teams converge to review progress and provide feedback on artifacts (design concepts, PRD, prototypes, etc.)
- Work is refined iteratively until the epic meets the Definition of Ready
- Epic is accepted into the backlog when readiness criteria are met

**Typical timing:**
- 2-12 months ahead, continuously scouting the long-term horizon


# 3. Principles & Conventions

## 3.1. Discovery Artifacts

**Philosophy:**
Discovery work should be tracked and accessible to enable alignment and collaboration. The specific format and methodology are flexible based on team preferences.

**Typical artifacts:**
- An epic in the backlog to anchor the work
- A discovery document or PRD to consolidate research and decisions
- Design artifacts (concepts, prototypes, user flows) as appropriate
- Stakeholder feedback and customer research notes

**Rationale:**
Making discovery visible helps to:
- Ensure alignment
- Prevent duplicate effort
- Create a knowledge base for when work graduates to Feature Refinement

## 3.2. Why should we pursue this?

**Philosophy:**
Starting with the "why", we should answer:
- How does this bet align with our **strategic business and product objectives**? 
  - How would we measure its impact on those objectives?
- Who is it for and what value does it provide them, i.e., what are the **customer problems** and **customer outcomes** it needs to deliver? 
  - How would we measure its impact on those outcomes?

**Expected artifacts:**
- Problem statement
- Customer personas or segments affected
- Jobs to be Done or customer pain points
- Success metrics (leading and lagging indicators)

**Rationale:**
Starting with "why" is **critical** to:
- Prevent building the wrong thing
- Ensure clear alignment on value
- Enable the team to make good scope and design tradeoffs later

## 3.3. What form should it take?

**Philosophy:**
When examining "what" we should build, we must consider:
- What are **plausible solutions** that could solve this work?
- What is in **scope** and not?
- What **usage metrics** would we need to see to validate the success of the bet?

**Expected artifacts:**
- Design concepts or prototypes
- Scope definition (what's in, what's out, what's deferred)
- User flows or journey maps
- Competitive analysis or inspiration

**Rationale:**
Exploring the solution space and scope boundaries help to:
- Identify the simplest path to value
- Prevent feature creep
- Enable realistic estimation

## 3.4. How might we accomplish it?

**Philosophy:**
When considering "what" to build, it is valuable to consider "how" we might accomplish it. By considering the technical approaches, we can:
- Discover more pragmatic solutions
- Discover innovative solutions that wouldn't have been previously considered
- Understand the dependencies and risks associated with each approach
- Begin to drive research early, to unblock eventual development

**Expected artifacts:**
- Technical feasibility assessment
- Architectural considerations or ADRs (for complex work)
- List of major dependencies (systems, teams, third parties)
- Risk identification and mitigation strategies

**Rationale:**
Early technical validation helps to:
- Prevent committing to infeasible solutions
- Surface dependencies and risks to inform timeline and resourcing decisions

## 3.5. When might it be achievable by?

**Philosophy:**
After understanding "how" we might build something, we need to estimate, conservatively, **when** it could be achieved. At what level of effort is the work still worthwhile?

**Expected artifacts:**
- High-level timeline estimate (quarters or months, not sprints)
- Resource requirements (team size, skillsets)
- Assumptions and confidence level
- Potential phasing options (MVP vs full scope)

**Rationale:**
Realistic timeline forecasts help to:
- Enable strategic planning and resource allocation
- Understand cost to assess whether the work is worth pursuing

## 3.6. Assessing ROI

**Philosophy:**
Not all good ideas are worth building. ROI assessment helps prioritize ruthlessly and make data-informed go/no-go decisions.

**Typical considerations:**
- Expected business value (revenue, retention, efficiency, strategic positioning)
- Estimated cost (timeline x team size)
- Confidence level in both value and cost estimates
- Opportunity cost (what else could the team build instead?)
- Strategic importance beyond quantifiable metrics

**Typical outputs:**
- Go/no-go recommendation
- If "go": target timeline and resourcing needs
- If "no-go" or "not yet": documented rationale for future reference

**Rationale:**
Explicit ROI assessment helps to:
- Prevent teams from building everything
- Force strategic choices about where to invest

## 3.7. Populating the Epic

**Philosophy:**
The epic has a critical role, it:
- Serves as the bridge between the discovery and delivery phases
- Acts as the fulcrum and source of truth for all downstream work
- Steers the quality of outcomes by driving precision and alignment to the core value of the initiative

**Epic title:**
Use this base format `[TeamIdentifier][InvestmentType] [Year] - [EpicName]`

Where:
- TeamIdentifier: A short label, tag, or emoji representing the team (configure per your org)
- InvestmentType: A label or emoji representing the primary investment purpose. Common categories:
  - Roadmap (new product capabilities)
  - Maintenance (keeping things running)
  - Security (security improvements)
  - Quality (bug fixes, UX improvements)
  - Stability & Scalability (performance, infrastructure)
- Year: The year the epic is being worked on (may need to be adjusted if work is later deferred)
- EpicName: A succinct and distinct name for the epic

For example:
- "**[Alpha][Roadmap] 2026 - SSO Integration**"

This base format is helpful because:
- It succinctly anchors the epic to the greater context (team, investment, year)
- It allows more verbosity to be clear on the initiative name

**Epic description:**
The epic description should define the core value statements to set the stage for all the work.

Consider the following:
- Business Value: "As a [org / department], we can [what], so that [why]"
- Customer Value: "As a [customer persona], I can [what], so that [why]"

For example:
- Business Value: "As an org, we can offer single sign-on, so that we can reduce onboarding friction for enterprise customers."
- Customer Value: "As an IT admin, I can configure SSO for my organization, so that our users have a seamless login experience."

These statements are:
- A forcing function to ensure we have a strong understanding of the core value of the initiative
- An anchor to strongly align all downstream collaborators

**Epic Links:**
The epic should contain links which:
- Point to all relevant discovery artifacts (PRD, design concepts, research, etc.).
- Are accessible by all downstream collaborators (i.e., permissions granted). 

This practice helps to:
- Democratize the discovery artifacts to all downstream collaborators
- Enable the artifacts to live in their own systems, imposing no upstream friction. 

**Epic T-Shirt Estimate:**
The epic should have an estimated size to help communicate the expected effort at the time of discovery. This is not a commitment, but a rough estimate of the expected effort.

**Rationale:**
This practice helps to:
- Enable roadmapping and resource planning
- Guide downstream refinement and scoping
- Manage expectations with stakeholders


## 3.8. Prioritizing the Work

**Philosophy:**
Prioritization is about making explicit tradeoffs. Different teams may use different frameworks - what matters is having a consistent, objective process.

**Typical considerations:**
- Strategic alignment and business value
- Customer impact and urgency
- Cost and timeline
- Dependencies on or from other work / teams
- Risk and uncertainty

**Typical outputs:**
- Relative ranking against other epics
- Target quarter or timeframe for Feature Refinement to begin
- Resource allocation decisions

**Rationale:**
Explicit prioritization helps to:
- Ensure the highest-value work gets refined and built first
- Make tradeoffs visible to stakeholders

# 4. Definition of Ready

**Philosophy:**
Discovery doesn't need to be perfect - it needs to be "good enough" to enable the next phase. Teams should graduate work to Feature Refinement when they have sufficient clarity, not when every question is answered.

**Typical readiness indicators:**
- The "why" is validated and aligned with stakeholders
- Success criteria are defined and understood how to be measured
- A viable solution direction is identified (doesn't need to be final)
- Technical feasibility is confirmed (no major blockers)
- High-level timeline and cost are understood
- Go decision has been made
- The epic is prioritized for upcoming quarters

**Rationale:**
Just-in-time refinement means starting Feature Refinement when you have enough clarity, not waiting for perfect information. Some details will still emerge during Feature and Story Refinement - that's expected.
