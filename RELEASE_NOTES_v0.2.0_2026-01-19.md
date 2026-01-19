# v0.2.0 2026-01-19

## Main Summary

- Added robust survey automation workflows (Qualtrics + Prolific) and improved operational visibility via GitHub Actions summaries.
- Improved site content and navigation CTAs while keeping accessibility/testing coverage strong.
- Reduced review/maintenance friction by deduplicating automation helpers and strengthening tests and documentation.

## 1. User Facing Changes

- Header: added Google site search and improved hover styling.
- Navigation/content: added and refined “Get Involved” and research-support CTAs.
- Content terminology: standardized “donation” terminology to “contribution” across the site.
- Media: added a press kit section.
- Reliability: automated display of the “surveys completed” statistic (site content stays current).

## 2. Internal Application Improvements

- CI/CD hardening: improved workflow consistency and failure diagnostics.
- Testing: expanded unit and E2E coverage, stabilized selectors, and added more edge-case coverage.
- Utilities: centralized GitHub Actions Step Summary + Markdown table escaping utilities and added unit tests.
- Documentation: expanded deployment, integration, and troubleshooting guidance.

## 3. External Integrations

### 3.1 Prolific

- Added CI-safe Prolific data collection workflow and supporting script improvements.
- Added Qualtrics↔Prolific verification workflow to validate markers and definition endpoints.

### 3.2 Qualtrics

- Added workflow + script to fetch Qualtrics survey questions and publish readable output to the GitHub Step Summary.
- Added Qualtrics survey copy/import workflows and API-based fallback paths.
- Automated Qualtrics survey metrics updates and added coverage for Qualtrics stats edge cases.

### 3.3 Google

- Added Google Analytics Data API client, scheduled GA report workflow, and report generation script improvements.
- Added Google site search in the header.

### 3.4 Microsoft

- None in this release.

## Lessons Learned

- GitHub Actions environment secrets are workflow-scoped; local tooling needs explicit env vars.
- Prefer the simplest auth mechanism available for automation (e.g., `X-API-TOKEN`) to reduce brittleness.
- Small, focused PRs + early CI validation reduce churn during iterative review cycles.
- GitHub Step Summary is a UX bonus: treat it as best-effort and escape Markdown defensively.
- When terminals/pagers are inconsistent, polling `gh api` is more reliable than interactive watch mode.

## Related

- Issue: #153

## Merged pull requests (newest → oldest)

- [#154](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/154) - Release: v0.2.0 2026-01-19
- [#152](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/152) - Release: site-2026-01-19
- [#142](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/142) - Add 404 page with technology adoption barrier theme
- [#139](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/139) - Expand Lighthouse CI to all pages with automatic discovery and weekly scheduled runs
- [#140](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/140) - Update barriers data to official TABS survey questions
- [#125](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/125) - Automation: fetch Qualtrics survey questions
- [#137](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/137) - Add aria-labels and test coverage for Barriers component filtering
- [#124](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/124) - Header: Google site search
- [#132](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/132) - Media page: add press kit section
- [#102](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/102) - docs: QualtricsProlific setup checklist
- [#108](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/108) - chore: Qualtrics MCP docs + API cheat sheet
- [#115](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/115) - Add Get Involved to navigation and reorder page CTAs
- [#116](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/116) - fix: add ARIA labels and improve error message truncation
- [#113](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/113) - Create Get Involved page and clarify researcher vs volunteer CTAs
- [#111](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/111) - feat: update donation terminology to reflect non-501(c)(3) status
- [#109](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/109) - fix: address code review feedback - type safety and error handling improvements
- [#106](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/106) - feat: API-only Qualtrics copy via import
- [#105](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/105) - feat: API-only Qualtrics clone fallback
- [#104](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/104) - fix: harden Qualtrics survey copy workflow
- [#103](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/103) - feat: add Qualtrics survey copy workflow
- [#101](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/101) - fix: verify Qualtrics survey via definition endpoint
- [#98](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/98) - chore: harden QualtricsProlific verification markers
- [#96](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/96) - chore: add QualtricsProlific verification workflow
- [#95](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/95) - chore: make Prolific workflow CI-safe
- [#90](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/90) - feat: add Making of TABS section
- [#88](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/88) - feat: automate homepage surveys completed stat
- [#86](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/86) - Stabilize header CTA E2E assertions
- [#83](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/83) - Make 'Take the TABS' primary header CTA
- [#79](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/79) - Configure site for apex domain deployment (technologyadoptionbarriers.org)
- [#80](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/80) - Update Qualtrics survey metrics
- [#75](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/75) - Fix in-page series navigation emphasis
- [#73](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/73) - Harden external links (noopener + noreferrer)
- [#74](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/74) - feat: update GTM ID to use environment variable
- [#67](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/67) - Fix SEO metadata + sitemap for Technology Adoption Models
- [#70](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/70) - feat: implement content for Article 2
- [#63](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/63) - feat: implement content for Article 1
- [#65](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/65) - Standardize in-page series navigation
- [#56](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/56) - Add comprehensive bibliography page to Technology Adoption Models series
- [#59](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/59) - Update Qualtrics survey metrics
- [#58](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/58) - docs: remove obsolete integration documentation
- [#60](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/60) - docs: clarify merge queue status + add CI merge_group trigger
- [#53](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/53) - Merge contact CTA section into footer and add policy links
- [#51](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/51) - fix: expand max-width constraints to 4096px for 4K display support
- [#54](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/54) - docs: CI-proof Copilot instructions
- [#49](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/49) - Fix mobile header overlapping homepage content
- [#47](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/47) - Fix mobile whitespace and add responsive text scaling across all article pages
- [#46](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/46) - Implement mega navigation for Technology Adoption Models series (2 branches, 17 articles)
- [#44](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/44) - Fix article page slugs to match live URLs
- [#43](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/43) - Match Article 1 copy structure on /technology-adoption-models
- [#42](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/42) - Remove extra caption text from /technology-adoption-models
- [#41](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/41) - Fix Article 1 copy on /technology-adoption-models
- [#40](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/40) - chore: rebrand to TABS (closes #39)
- [#38](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/38) - fix: remove duplicate triangle image
- [#37](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/37) - fix: missing tech adoption triangle image
- [#36](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/36) - feat: technology adoption models parity
- [#34](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/34) - feat: add github social icon to footer
- [#27](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/27) - ci: improve Prolific workflow summary
- [#32](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/32) - fix: remove broken neon logo placeholder
- [#30](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/30) - fix: update footer unit tests
- [#29](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/29) - fix: resolve homepage content and layout regressions
- [#28](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/28) - feat: complete homepage structural parity (Retroactive)
- [#17](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/17) - Add Prolific API integration for survey data collection
- [#26](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/26) - chore: fix npm audit via tmp override
- [#12](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/12) - npm(deps): bump the production-dependencies group across 1 directory with 5 updates
- [#15](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/15) - npm(deps-dev): bump the development-dependencies group across 1 directory with 6 updates
- [#5](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/5) - npm(deps-dev): bump @types/node from 24.10.1 to 25.0.3
- [#2](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2) - ci(deps): bump actions/upload-artifact from 5 to 6
- [#23](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/23) - feat: Qualtrics survey stats chart
- [#25](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/25) - ci: stream Playwright progress and upload artifacts
- [#22](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/22) - Qualtrics workflow: print responseCounts
- [#21](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/21) - Qualtrics workflow: auto-pick survey id + fix formatting
- [#20](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/20) - Relax Qualtrics workflow validation
- [#19](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/19) - Add Qualtrics API smoke workflow
- [#14](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/14) - Full Content Migration and Branding Revamp
- [#7](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/7) - Migrate TABS content from live site and add enhanced design - complete homepage with Hero, GetInvolved, Statistics, Impact, and Contact sections
- [#4](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/4) - npm(deps-dev): bump the development-dependencies group with 5 updates

## Closed issues included (newest → oldest)

- [#153](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/153) - Release v0.2.0 (2026-01-19)
- [#151](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/151) - Release: site-2026-01-19
- [#141](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/141) - Update the 404 page to be funny and have a funny picture related to technology adoption failure
- [#138](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/138) - Update Lighthouse testing to cover all pages and run weekly via a GH Action
- [#123](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/123) - Automation: fetch Qualtrics survey questions
- [#118](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/118) - Fix Search Functionality
- [#121](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/121) - Header: add Google site search
- [#129](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/129) - Media page: add press kit section
- [#122](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/122) - Automation: fetch Qualtrics survey questions
- [#128](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/128) - Media page: add press kit section
- [#114](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/114) - Upodate get involved order and navigantion
- [#112](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/112) - Create new expansion of the Support our research CTA for researcher
- [#110](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/110) - Update the Donation approach across the site
- [#89](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/89) - Create The Making of TABS Section
- [#87](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/87) - Automate homepage 'Surveys Completed' from Qualtrics (and make metrics updates reviewable)
- [#85](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/85) - Follow-up: stabilize header CTA tests
- [#81](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/81) - UX: Make 'Take the TABS' primary CTA button (top-right, always visible incl. mobile)
- [#84](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/84) - task: CI/CD Automation Enhancements (GA Reports & Qualtrics Validation)
- [#78](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/78) - Go-live: switch site to apex domain (technologyadoptionbarriers.org)
- [#77](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/77) - Go-live: switch site to apex domain (technologyadoptionbarriers.org)
- [#76](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/76) - feat: Google Analytics API Integration
- [#68](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/68) - Fixes to in page series navigation
- [#66](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/66) - Add SEO metadata to Technology Adoption Models pages + expand sitemap
- [#69](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/69) - [DOCS] Update Article 2: Organization's Playbook Content
- [#71](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/71) - Harden external links: use noopener with noreferrer
- [#72](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/72) - Update Google Tag Manager ID
- [#61](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/61) - [DOCS] Improve Article 1: Branch Introduction  The Users Journey
- [#62](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/62) - Standardize in-page series navigation across Technology Adoption Models pages
- [#55](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/55) - Add a new page to the Article series and the mega menu. Ensure that it meets all other requirements for aria and mobile responsiveness.
- [#57](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/57) - Remove un needed repo documentation files
- [#52](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/52) - Add this section as a footer section / merge this section with the footer
- [#50](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/50) - 4K max width is still not 'full width' across all pages on the site
- [#48](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/48) - Fix overlap of mobile menus with Homepage text
- [#35](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/35) - Technology Adoption Models pages and articles are not a perfect match to live site
- [#45](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/45) - Mega navigation for Technology Adoption Models series (2 branches, 17 articles)
- [#39](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/39) - Rebrand: remove Free For Charity references; update contact info to TABS
- [#33](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/33) - Add GitHub Social Icon to Footer
- [#31](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/31) - Fix White Box/Broken Logo in Bottom CTA
- [#13](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/13) - Complete Content Migration from TABS Live Site
- [#16](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/16) - Create Prolific workflows and supported functions with the API
- [#24](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/24) - Simplify E2E testing: faster runs + incremental results
- [#18](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/18) - Set up Qualtrics API access via GitHub Actions (QUALTRICS-prod)
- [#6](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/6) - Copy live site static page content into React app and track migration status
