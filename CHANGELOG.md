# Changelog

All notable changes to the Technology Adoption Barriers Survey (TABS) website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-02-16

### Added

- Technology Adoption Models article series — 18 research articles across 2 branches with scholarly content from peer-reviewed PDFs
- 24 individual bibliography article pages created from PDF extraction
- Persona navigation with mega menu — "See Yourself in the Survey" landing pages for 11 roles
- Comprehensive FAQ page with accordion sections
- Teaching series pages — educational resources for the Technology Adoption series
- Full 25-slide presentation deck with 4K visuals and ASCII art gallery
- CMO Survey influence page under Making of TABS
- Prolific–Qualtrics live participant recruitment pipeline on production survey
- Prolific footer survey link for participant recruitment

### Changed

- Article style normalization — shared constants (`articleStyles.ts`) for consistent typography across all articles
- Visual naming system refactored from numeric IDs to semantic names
- Header mega menu now scrollable with fixed alignment issues
- "For Organizations" mega menu updated with category pages
- Trailing slash support — URLs with and without trailing slashes now resolve correctly
- 12 Dependabot dependency updates merged (Next.js 16.1.5, framer-motion 12.33.0, etc.)

### Fixed

- Qualtrics Flow EmbeddedData schema and Type field corrected for PUT validation
- Qualtrics COMPLETE_URL now passes ResponseID in completion redirect
- Prolific `IsNotEmpty` branch logic evaluation corrected for proper survey routing
- GA report workflow race condition fixed by switching to `create-pull-request` action
- Release notes generator date-range and HTML entity fixes

### Removed

- Legacy FFC-era components (20+ deleted component directories)
- All stale ESLint warnings resolved (16 → 0) by removing legacy code

## [0.2.0] - 2026-01-19

### Added

- Community health files for better GitHub integration
  - SUPPORT.md for support resources
  - .github/FUNDING.yml for sponsorship information
  - .github/CODEOWNERS for code ownership
  - .github/PULL_REQUEST_TEMPLATE.md for PR guidelines
  - .github/ISSUE_TEMPLATE/bug_report.md for bug reporting
  - .github/ISSUE_TEMPLATE/feature_request.md for feature suggestions
  - .github/ISSUE_TEMPLATE/documentation.md for documentation issues
  - .github/ISSUE_TEMPLATE/config.yml for issue template configuration
  - CITATION.cff for academic citation
  - CHANGELOG.md for release tracking
  - COMMUNITY_HEALTH_FILES.md for community health documentation

### Changed

- Automation and integrations: added and hardened Qualtrics/Prolific automation workflows and supporting scripts
- Site UX: refined header CTAs and introduced Google site search
- Testing: expanded unit + E2E coverage and improved stability

## [0.1.0] - 2025-12-11

### Added

- Initial release of the Technology Adoption Barriers Survey (TABS) website
- Next.js 16.0.7 single-page application with App Router
- TypeScript implementation throughout
- Tailwind CSS for styling
- Global popup system for donations and volunteer applications
- Mobile-responsive navigation with hamburger menu
- Static export configuration for GitHub Pages deployment
- Comprehensive testing suite (Playwright E2E tests)
- Accessibility features and WCAG compliance
- SEO optimization with metadata, sitemap, and robots.txt
- Cookie consent banner with preferences
- Google Tag Manager integration for analytics
- Multiple policy pages (Privacy, Terms, Security, etc.)
- Team member showcase with modal details
- FAQ section with accordion UI
- Testimonials carousel
- Programs and impact sections
- CNCF-compliant project governance
- Security features:
  - Branch protection rules
  - Signed commits requirement
  - CodeQL security scanning
  - Dependabot for dependency updates
  - Vulnerability disclosure policy
- Professional documentation:
  - README.md with comprehensive project overview
  - CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
  - CONTRIBUTING.md with detailed guidelines
  - SECURITY.md with security policies
  - GOVERNANCE.md for project leadership
  - MAINTAINERS.md listing project maintainers
  - THREAT-MODEL.md for security analysis
  - TESTING.md for test documentation
  - DEPLOYMENT.md for deployment instructions
  - QUICK_START.md for rapid onboarding
  - Multiple technical guides and documentation

### Technical Stack

- Next.js 16.0.7
- React 19
- TypeScript 5.7.2
- Tailwind CSS 3.4.17
- Playwright for E2E testing
- ESLint for code quality
- Prettier for code formatting
- Husky for git hooks
- Conventional commits enforcement

### Infrastructure

- GitHub Pages deployment
- GitHub Actions CI/CD
- Lighthouse performance monitoring
- Automated testing in CI
- Merge queue verification

[unreleased]: https://github.com/clarkemoyer/technologyadoptionbarriers.org/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/clarkemoyer/technologyadoptionbarriers.org/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/clarkemoyer/technologyadoptionbarriers.org/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/clarkemoyer/technologyadoptionbarriers.org/releases/tag/v0.1.0
