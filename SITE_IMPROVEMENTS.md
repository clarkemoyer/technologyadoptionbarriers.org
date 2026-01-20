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
- **Qualtrics MCP reliability**: Improve end-to-end MCP usability (OAuth/transport quirks currently prevent stable use of survey tools in VS Code; consider documenting a known-good flow or adding a local proxy/adapter)

## Survey Growth & Engagement (Ideas)

- **Share page (/share)**: A dedicated page with QR code + share links for live presentations.
- **Social sharing**: One-click share buttons on Articles and Barriers.
- **Barrier micro-interactions** (needs careful design): “Do you face this?” prompts on barrier cards to funnel into the survey.
  - Goal: increase completion by showing immediate relevance.
  - Considerations: avoid dark-pattern UX; if click events are tracked, ensure cookie-consent gating + clear disclosure; be mindful of priming/response bias if we later correlate clicks to survey outcomes.
- **Persona landing pages** (needs careful design): Targeted pages for CIO/CTO/CEO, practitioners, and change-management audiences explaining why the survey is valuable for each role.
  - This aligns with the survey’s first demographics question (Q1_Role), so the role segmentation is explicit and can be analyzed in results.
  - Considerations: keep claims evidence-based; avoid implying we track role before the survey; keep copy consistent across personas to reduce sampling/selection bias.

---

**Last Updated**: 2026-01-19  
**Repository**: technologyadoptionbarriers.org
