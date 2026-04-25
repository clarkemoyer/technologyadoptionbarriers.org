# feat: Standardize site navigation across all pages and collections

**Labels:** `enhancement`, `accessibility`, `ux`

---

## Problem

Site navigation is inconsistent across pages and collections. Mobile menus use different patterns depending on context - some auto-expand, some use chevron toggles, some use native `<details>` collapsibles. In-page navigation varies from page to page. Many collections and series have no previous/next links and no way to see sibling pages. Page ordering differs between the header, footer, and in-page navigation. The result is a site that's hard to navigate, especially on mobile, and especially on the denser article, stats, and bibliography pages.

---

## Current State: Navigation Audit

### Navigation Components

| Component        | File                                                  | Desktop                            | Mobile                                           | Used On                            |
| ---------------- | ----------------------------------------------------- | ---------------------------------- | ------------------------------------------------ | ---------------------------------- |
| **Header Nav**   | `src/components/header/index.tsx`                     | Horizontal bar + 3 mega menus      | Hamburger → slide-down with 11+ JS state toggles | All pages                          |
| **Series Nav**   | `src/components/series-navigation/index.tsx`          | 2-col grid at top of page          | `<details>/<summary>` collapsibles               | Tech Adoption Models articles only |
| **Teaching Nav** | `src/components/teaching-series-navigation/index.tsx` | 4-col grid at top of page          | Responsive grid                                  | Teaching Series slides only        |
| **Article TOC**  | `src/components/article-toc/index.tsx`                | Fixed right sidebar + progress bar | FAB button + popup                               | Some long articles                 |
| **Footer Nav**   | `src/components/footer/index.tsx`                     | 5-col grid                         | 1-2 col grid                                     | All pages                          |

### Collections Missing Standardized Series Navigation

| Collection              | Approx. Pages             | Has Dedicated Series Nav Component? | Has Standardized Prev/Next?                 |
| ----------------------- | ------------------------- | ----------------------------------- | ------------------------------------------- |
| Making of TABS          | ~15 pages, 3+ levels deep | No                                  | No (some pages have ad-hoc prev/next links) |
| Results                 | ~10 pages                 | No                                  | No                                          |
| CRP 2026                | ~8 pages                  | No                                  | No                                          |
| See Yourself (Personas) | ~12 pages                 | No                                  | No                                          |
| For Organizations       | ~4 pages                  | No                                  | No                                          |
| Concept Mapping         | 3 pages                   | No                                  | No                                          |
| Bibliography            | 41+ pages                 | No                                  | No                                          |

Technology Adoption Models and Teaching Series are the only sections shown here with dedicated, reusable series-navigation components and standardized prev/next patterns. Some other sections, including parts of Making of TABS, already use ad-hoc prev/next links on individual pages.

### Key Inconsistencies

1. **Three different mobile nav patterns**: JS toggles (header), native `<details>` (series nav), FAB popup (article TOC)
2. **Series navigation pushes content down**: The top-of-page box on Models and Teaching pages takes significant vertical space before the reader reaches the article
3. **Breadcrumbs are inconsistent across deep pages**: Some areas already render breadcrumb navigation, but many deep pages still lack reliable wayfinding and hierarchy cues
4. **Progress bar only on some pages**: The reading progress indicator exists in `article-toc` but isn't used on stats or results pages that are equally long
5. **Footer groups don't match header groups**: Different organization, different page order
6. **Dense pages lack navigation aids**: Results pages with heavy tables and data have no section jumping, no sticky headers, no "back to top"

---

## Design Decisions

### A. Mobile Menu Pattern - Hybrid

- **Header**: Keep custom JS toggles with Framer Motion animations. The header is a branded experience and warrants the polish.
- **In-page navigation**: Standardize on native `<details>/<summary>` for any collapsible sections within page content. Simpler, accessible by default, consistent.
- **Key change**: All in-page components that need collapsible behavior use the same native pattern. No more mixing FAB popups, JS toggles, and `<details>` across different components.

### B. In-Page Navigation - Unified Sidebar + Progress Bar

**Replace the current separate top-of-page series box and sidebar TOC with a single unified sidebar panel.** Content should start immediately - no large navigation box pushing the article down.

**Desktop (xl+ screens):**

- Fixed right sidebar, always visible
- **Top section**: Series/collection links (collapsible by branch or group), with "You are here" highlighting on the current page
- **Divider**
- **Bottom section**: Page TOC (auto-detected H2 headings with scroll spy)
- If the page is not in a series, only the page TOC section appears

**Mobile (< xl screens):**

- FAB button (bottom-right) opens a single unified panel
- Series section starts **collapsed** by default (since jumping within the current page is the more common action)
- Page TOC section starts **expanded**
- Panel closes on link tap

**Reading progress bar:**

- Thin teal bar fixed below the header showing scroll progress
- **Applied to ALL long pages** - articles, results, stats, bibliography - not just the pages that currently have it
- Provides "how much is left" context, especially valuable on data-heavy pages

**What this replaces:**

- The top-of-page gray box in `series-navigation/index.tsx` → moves into the sidebar
- The top-of-page gray box in `teaching-series-navigation/index.tsx` → moves into the sidebar
- The separate `article-toc/index.tsx` sidebar → merged into the unified sidebar component
- Three components become one, with the series data source varying by collection

### C. Previous/Next Links - Large Card-Style at Bottom

- Two cards side-by-side at the bottom of every page that's part of a collection
- Each card shows an arrow (← / →) and the **title** of the previous/next page
- Easy to tap on mobile, clearly shows where you're going
- Follows the pattern used by Next.js docs, Stripe docs, Tailwind docs
- "None" or absent when at the first/last page of a series

### D. Breadcrumbs - Pages 2+ Levels Deep

- Breadcrumb trail at the top of any page that is 2 or more levels below root
- Format: `Home > Making of TABS > Integrations > Prolific`
- Takes one line, does not displace content meaningfully
- Not shown on shallow pages (e.g., `/faq`, `/media`) where it adds no value
- Combined with the sidebar "You are here" indicator, gives full wayfinding at both the site level and the collection level

### E. Page Order - Collections Own Their Order; Header/Footer Match

- Each collection defines its own canonical reading order (e.g., Teaching Series goes Part 1 → Part 2 → Part 3; Models series follows branch structure)
- The **header and footer always list the same pages in the same order** as each other
- Collection reading order drives prev/next links; header order drives the menu listing
- Single data source per collection (the existing TypeScript data files in `src/data/`) extended to cover all collections, not just Models and Teaching

### F. Footer Navigation - Mirror Header + Policy Row

- Footer content groups match the header's mega menu groupings
- Same pages, same order within each group
- Policy/legal links remain in their own row at the bottom (Cookie Policy, Privacy, Terms, etc.)
- This makes the footer a reliable "full site map" that matches the header exactly

---

## Additional Improvements for Dense Pages

These apply to results pages, stats pages, bibliography, and long articles:

1. **Section-level "back to top" links** - Subtle link at the end of each major section (especially on results pages with many tables) that scrolls back to the sidebar TOC or page top. Reduces scrolling on mobile.

2. **Bibliography navigation** - The 41+ bibliography pages are reference material, not linear reading. The sidebar should show all entries so users can jump directly to any one, rather than relying solely on sequential prev/next.

3. **Anchor links on key sections** - All H2s get URL-friendly IDs so specific sections are shareable (e.g., `/results/descriptive#response-rates`). The article TOC already generates these - ensure it's consistent across all pages.

4. **Sticky table headers** - Results pages with long data tables should use sticky column headers so readers don't lose context when scrolling.

5. **"You are here" indicator** - In the sidebar's series section, the current page is clearly marked (bold + highlight background) so readers see their position at a glance.

---

## Implementation Plan

### Phase 1: Unified Sidebar Component

- Create a single `unified-navigation` component that handles both series context and page TOC
- Accept series data as a prop (optional - pages not in a series just show page TOC)
- Implement desktop sidebar (fixed right, two sections with divider)
- Implement mobile FAB + panel (series collapsed, TOC expanded by default)
- Include scroll spy for active heading detection
- Include "You are here" highlighting for current page in series

### Phase 2: Reading Progress Bar

- Extract progress bar from `article-toc` into a standalone component
- Apply to all long pages (articles, results, stats, bibliography)
- Fixed below header, teal fill, 0-100% based on scroll position

### Phase 3: Previous/Next Cards

- Create a `prev-next-cards` component
- Large card-style with arrow + page title
- Place at bottom of all collection pages
- Data driven from the same series data source as the sidebar

### Phase 4: Breadcrumbs

- Create a `breadcrumb` component
- Auto-generate from URL path segments with display-name mapping
- Render on pages 2+ levels deep
- One line, immediately below header / progress bar

### Phase 5: Extend Series Data to All Collections

- Create data files for collections that don't have them yet (Making of TABS, Results, CRP 2026, Personas, Organizations, Concept Mapping, Bibliography)
- Each defines page order, grouping, and display titles
- These data files drive the sidebar, prev/next cards, and breadcrumbs

### Phase 6: Footer Alignment

- Restructure footer content groups to match header mega menu groupings
- Same pages, same order
- Keep policy/legal row unchanged

### Phase 7: Dense Page Enhancements

- Add section-level "back to top" links on results and stats pages
- Add sticky table headers on results pages with long tables
- Ensure all H2s have shareable anchor IDs across all pages

### Phase 8: Retire Old Components

- Remove `series-navigation/index.tsx` (replaced by unified sidebar)
- Remove `teaching-series-navigation/index.tsx` (replaced by unified sidebar)
- Remove `article-toc/index.tsx` (replaced by unified sidebar + standalone progress bar)
- Update all pages to use the new components

### Phase 9: Testing

- Unit tests for all new components (including jest-axe accessibility)
- E2E tests validating navigation links across all collections
- Mobile viewport testing for FAB, panel, prev/next cards, breadcrumbs
- Verify page order consistency between header, footer, and sidebar

---

## Acceptance Criteria

- [ ] All collections have series navigation in the unified sidebar with prev/next cards at page bottom
- [ ] Reading progress bar appears on all long pages
- [ ] Mobile navigation uses consistent patterns (custom for header, native collapsibles for in-page)
- [ ] Breadcrumbs appear on all pages 2+ levels deep
- [ ] Page order is consistent between header and footer
- [ ] Sidebar shows "You are here" highlighting for current page
- [ ] Bibliography pages are navigable non-linearly (jump to any entry from sidebar)
- [ ] Results pages have sticky table headers and "back to top" section links
- [ ] All H2 headings have shareable anchor IDs
- [ ] Content starts immediately on article pages (no top-of-page navigation box)
- [ ] All navigation passes jest-axe accessibility tests
- [ ] E2E tests validate navigation across all collections
- [ ] Old navigation components are removed with no regressions
