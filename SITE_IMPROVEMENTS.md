# Site Improvements

This document tracks user-facing improvements and planned enhancements for the Technology Adoption Barriers Survey (TABS) site.

## Purpose

- Capture actionable, user-visible improvements (content, UX, performance, accessibility)
- Track improvements that affect the live experience on https://technologyadoptionbarriers.org
- Keep scope separate from internal refactors (see TECHNICAL_DEBT.md)

## Current Priorities

1. **Content clarity**
   - Ensure primary CTAs are unambiguous (Take the Survey, Read the Models, View Barriers)
   - Keep contact points consistent (`contact@technologyadoptionbarriers.org`)

2. **Performance**
   - Maintain fast LCP on the home page (minimize large media impact)
   - Keep static export optimized for GitHub Pages + custom domain

3. **Accessibility**
   - Verify headings are properly nested (single H1 per page)
   - Ensure interactive elements have clear labels and focus states

4. **Reliability**
   - Keep CI green (lint + build + Playwright smoke coverage)
   - Avoid regressions in GitHub Pages asset paths

## Suggested Enhancements

- **Media page**: Add a short press-kit section (one-paragraph project summary + contact email)
- **Barriers page**: Add filters/search if the barrier list grows
- **Models pages**: Add a “reading progress” / table-of-contents sidebar for long articles

## Survey Growth & Engagement

- **Sticky Header CTA**: Convert the "Take the TABS" nav link into a prominent button that remains visible to drive consistent traffic.
- **QR Code / Share Page**: Create a dedicated page (`/share`) with a QR code and simplified sharing links; ideal for use in live presentations.
- **Embedded Interactivity**: Add "Do you face this?" micro-interactions on Barrier cards that serve as a direct funnel to the survey.
- **Social Sharing**: Add one-click social share buttons to Article and Barrier pages to increase organic reach.
- **"See Yourself" Persona Pages**: Create targeted landing pages for specific C-Suite roles (CEO, CIO, CMO) explaining the specific value of participating.
- **Partner & Community Kits**: Develop tailored landing pages for trade organizations (e.g., SAFe, PMI, CMO Survey) to facilitate outreach to their specific members.

## Target Audience & Effectiveness Strategy

**Note on Demographics**: explicit demographic targeting configuration (e.g., age, income, exact job title logic) is managed directly within the Prolific and Qualtrics platforms and is not hard-coded in this repository.

> [!NOTE]
> Verified via Prolific API (Study ID: `6827327f0...`): The specific demographic filters are configured in the Prolific audience settings and are not exposed in the standard study metadata description.

To increase survey participation, we will target the following key personas through dedicated landing pages and tailored messaging:

### 1. C-Suite Leaders (Strategic Persona)

- **Target Roles**: CIO (Chief Information Officer), CTO (Chief Technology Officer), CEO (Chief Executive Officer), CDO (Chief Digital Officer).
- **Value Proposition**: Peer benchmarking, understanding ROI barriers, risk mitigation strategies.
- **Key Content Focus**: "Are your adoption speeds lagging behind industry peers? See what's holding them back."
- **Proposed URL**: `/start/executive-insights`

### 2. IT & Engineering Practitioners (Technical Persona)

- **Target Roles**: DevOps Engineers, SysAdmins, Site Reliability Engineers (SREs), Lead Developers.
- **Value Proposition**: Identifying technical debt, tool fatigue, and implementation roadblocks.
- **Key Content Focus**: "Frustrated by tools that don't fit? Tell us why adoption fails on the ground."
- **Proposed URL**: `/start/technical-barriers`

### 3. Change Management & Trade Orgs (Organizational Persona)

- **Target Roles**: Agile Coaches, Scrum Masters, Project Managers (PMP), Trade Org Members (SAFe, PMI).
- **Value Proposition**: Cultural resistance patterns, training gaps, process vs. tools analysis.
- **Key Content Focus**: "Is culture eating your strategy? Contribute to the industry-wide adoption study."
- **Proposed URL**: `/start/organizational-change`

---

**Last Updated**: 2026-01-16  
**Repository**: technologyadoptionbarriers.org
