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

---

**Last Updated**: 2026-01-16  
**Repository**: technologyadoptionbarriers.org
