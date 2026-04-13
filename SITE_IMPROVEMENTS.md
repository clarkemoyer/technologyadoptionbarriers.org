# Site Improvements

This document tracks user-facing improvements and planned enhancements for the Technology Adoption Barriers Survey (TABS) site.

## Purpose

- Capture actionable, user-visible improvements (content, UX, performance, accessibility)
- Track improvements that affect the live experience on https://technologyadoptionbarriers.org
- Keep scope separate from internal refactors (see TECHNICAL_DEBT.md)

## Recently Shipped (v0.3.0 / v0.3.1)

The following items were previously tracked here and are now **complete**:

- ✅ **Comprehensive FAQ page** - 42 questions across 8 categories with accordion interface (PR #292, Issue #210)
- ✅ **Persona landing pages** - "See Yourself in the Survey" with mega menu, homepage teaser, and footer integration (PR #206, #208, Issue #205)
- ✅ **Technology Adoption Models article series** - 18 scholarly articles + 21 bibliography pages fully populated (PRs #263, #267, #275, Issue #261)
- ✅ **Teaching series pages** - Educational resources, slide deck, handout materials, workshop guides (PR #245, Issue #244)
- ✅ **Full slide deck** - 25-slide presentation with 4K visuals and frame expansion on series landing page (PR #249, #250, Issue #248)
- ✅ **CMO Survey influence page** - Added under Making of TABS (PR #203, Issue #202)
- ✅ **"For Organizations" mega menu** - Category pages accessible from navigation (PR #225, Issue #224)
- ✅ **Brand color centralization** - Tailwind tokens replace scattered hex values (PR #291, Issue #290)
- ✅ **GitHub Sponsors integration** - Stripe-backed donations live at three site locations (PR #320, Issue #99)
- ✅ **Content credibility audit** - 9-section review of all user-facing content (PRs #304-#312, Issue #294)
- ✅ **Prolific footer survey link** - Direct participant recruitment link (PR #233, Issue #232)

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

## Open Enhancement Issues

- **[#323](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/323)**: Reading progress / TOC sidebar for long article pages - sticky table of contents with scroll-aware highlighting
- **[#324](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/324)**: Press-kit section expansion on the Media page - project summary, logo pack, key facts, citation
- **Barriers page**: Add filters/search if the barrier list grows
- **Qualtrics MCP reliability**: Document and keep a known-good flow (OAuth Bearer token + SSE headers) for stable use in VS Code and the GitHub coding agent

## Survey Growth & Engagement (Ideas)

- **Share page (/share)**: A dedicated page with QR code + share links for live presentations.
- **Social sharing**: One-click share buttons on Articles and Barriers.
- **Barrier micro-interactions** (needs careful design): “Do you face this?” prompts on barrier cards to funnel into the survey.
  - Goal: increase completion by showing immediate relevance.
  - Considerations: avoid dark-pattern UX; if click events are tracked, ensure cookie-consent gating + clear disclosure; be mindful of priming/response bias if we later correlate clicks to survey outcomes.

---

**Last Updated**: 2026-02-19
**Repository**: technologyadoptionbarriers.org
