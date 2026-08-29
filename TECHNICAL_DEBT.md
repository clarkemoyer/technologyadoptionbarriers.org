# Technical Debt

**Document Purpose:** This document tracks backend and React application technical debt - code quality issues, security vulnerabilities, component fixes, and internal application improvements that are hidden from users but important for maintainability.

**Scope:** This document covers technical items that affect the **internal workings** of the React application, not user-facing features. For UI/UX enhancements and user-visible improvements, see [SITE_IMPROVEMENTS.md](./SITE_IMPROVEMENTS.md).

**Last Updated:** February 2026  
**Status:** Active Tracking  
**Repository:** technologyadoptionbarriers.org

---

## Table of Contents

1. [Overview](#overview)
2. [ESLint Status](#eslint-status)
3. [Security Vulnerabilities](#security-vulnerabilities)
4. [Dependency Management (Dependabot)](#dependency-management-dependabot)
5. [Backend & Application Improvements](#backend--application-improvements)
6. [Architecture Decisions](#architecture-decisions)
7. [Tracking and Prioritization](#tracking-and-prioritization)

---

## Overview

This document tracks technical debt items that:

- Don't currently block functionality
- Should be addressed in future refactoring
- Require monitoring and eventual resolution
- Are acceptable tradeoffs for now but not ideal long-term

**Current Technical Debt Count:** 0 ESLint warnings + 41 pnpm audit vulnerabilities (dev-only, see below)

**Recent Progress:**

- **February 2026 (v0.3.1):** Archived write-operation Qualtrics workflows. Centralized brand colors into Tailwind tokens. Comprehensive content credibility audit across 9 site sections. GitHub Sponsors integration (Stripe-backed). Prolific script idempotency improvements.
- **February 2026 (v0.3.0):** Removed legacy FFC/free-charity-web-hosting components, resolving all remaining React Hooks warnings. 18 article pages + 21 bibliography pages published. Teaching series, persona navigation, and FAQ page shipped.
- **December 2025:** Reduced React Hooks warnings from 10 to 1 (90% reduction) by fixing exhaustive-deps and set-state-in-effect issues.

---

## ESLint Status

### Summary

As of v0.3.1, the project produces **0 ESLint errors and 0 warnings**. Running `pnpm run lint` outputs a clean result.

### Previously Resolved Issues

All of the following ESLint categories were resolved by code fixes in December 2025 or by removal of legacy components in v0.3.0:

- ~~`react-hooks/set-state-in-effect` (6 occurrences)~~ ✅ **RESOLVED** - Fixed December 2025 using `useLayoutEffect`
- ~~`react-hooks/exhaustive-deps` (2 occurrences)~~ ✅ **RESOLVED** - Fixed December 2025 with `useCallback` and local refs
- ~~`react-hooks/immutability` (1 occurrence)~~ ✅ **RESOLVED** - Component (`src/components/home/Testimonials/index.tsx`) removed in v0.3.0
- ~~`@next/next/no-img-element` (6 occurrences)~~ ✅ **RESOLVED** - Legacy FFC components removed in v0.3.0; remaining `<img>` tags in header/footer are intentional (static export incompatible with `<Image />`)

### Architectural Note: `<img>` vs `<Image />`

The project uses `<img>` tags with the `assetPath()` helper instead of Next.js `<Image />`. This is an intentional architectural decision:

- Project uses `output: "export"` for static site generation
- Next.js Image Optimization requires a Node.js server, incompatible with static export
- Images use `assetPath()` for GitHub Pages basePath compatibility
- ESLint is configured to not warn about this pattern

**Priority:** N/A - Expected behavior, not technical debt

---

## Security Vulnerabilities

### Current Status (February 2026)

The project has **41 vulnerabilities** (5 moderate, 36 high) identified by `pnpm audit`. All are in **development-only dependencies** - none affect the production static site.

#### 1. ESLint / TypeScript-ESLint Dependency Chain (36 high, 5 moderate)

**Affected Packages:**

- `ajv` < 8.18.0 (ReDoS via `$data` option) - Moderate
- `minimatch` < 10.2.1 (ReDoS via repeated wildcards) - High
- `@isaacs/brace-expansion` 5.0.0 (Uncontrolled Resource Consumption) - High

**Dependency Chain:** `eslint` → `@eslint/eslintrc` → `ajv`/`minimatch`; `@typescript-eslint/*` → `minimatch`; `jest-snapshot` → `@isaacs/brace-expansion`

**Impact:**

- **Development only** - these packages are dev dependencies (linting, testing)
- **No production impact** - not included in `pnpm run build` output
- **Limited risk** - ReDoS requires crafted input patterns, not user-facing

**Available Fixes:**

- `pnpm audit fix` resolves `@isaacs/brace-expansion` safely
- `pnpm audit fix --force` would downgrade `eslint` to 4.x (breaking - not viable)
- Wait for `eslint-config-next` and `typescript-eslint` to update their dependency ranges

**Current Decision:** Monitor via Dependabot. The ESLint ecosystem will resolve these as packages adopt `ajv` 8.18+ and `minimatch` 10.2.1+.

---

### Previously Resolved Vulnerabilities

#### ✅ Next.js RCE Vulnerability (RESOLVED)

**CVE:** GHSA-9qr9-h5gf-34mp  
**Severity:** Critical  
**Status:** Fixed in next@16.0.7  
**Resolution Date:** December 2025

#### ✅ tmp Package Vulnerabilities (RESOLVED)

**CVE:** GHSA-52f5-9888-hmc6  
**Severity:** Low (4 occurrences)  
**Status:** Resolved by Lighthouse CI dependency update  
**Resolution Date:** January 2026

---

### Monitoring Process

**Automated Monitoring:**

- Dependabot checks for vulnerabilities weekly (Mondays at 9:00 AM UTC)
- GitHub Security Advisories trigger immediate alerts
- CodeQL scanning runs on every PR and push to main

**Manual Checks:**

```bash
# Check for vulnerabilities
pnpm audit

# View details
pnpm audit --json

# Attempt automatic fix (use with caution)
pnpm audit fix

# Fix including breaking changes (test thoroughly first!)
pnpm audit fix --force
```

**Response Protocol:**

1. **Critical/High:** Address immediately, create emergency PR
2. **Moderate:** Address within 1 week, include in next sprint
3. **Low (production):** Address within 1 month
4. **Low (dev only):** Monitor via Dependabot, low priority

---

## Dependency Management (Dependabot)

### Automated Dependency Updates

**Configuration:** `.github/dependabot.yml`

**Update Schedule:**

- **Frequency:** Weekly (Mondays at 9:00 AM UTC)
- **Scope:** npm packages (production and development)
- **Scope:** GitHub Actions workflow dependencies
- **Strategy:** Grouped updates for easier review

**Current Dependabot PRs:** Check [Pull Requests tab](../../pulls)

### Pending Dependency Updates

Monitor active Dependabot PRs for:

- Security patches
- Minor version updates
- Major version updates (require manual testing)

**Review Process:**

1. Dependabot creates PR with changes
2. CI runs automated tests
3. Review changelog for breaking changes
4. Test locally if needed
5. Merge when safe

**Documentation:** See [DEPENDABOT.md](./DEPENDABOT.md) for full setup guide

---

## Backend & Application Improvements

### Code Quality Enhancements

These are internal code quality improvements that don't affect user experience:

#### TypeScript & Linting

- **TypeScript Strict Mode**: Enable additional strict flags for better type safety
- **Import Organization**: Add eslint-plugin-import for consistent import sorting
- **pnpm audit CI Integration**: Add automated pnpm audit checks with failure threshold

**Priority:** Low  
**Impact:** Improves code maintainability and catches bugs earlier

---

#### Build Quality Gates

- **Bundle Size Analysis**: Add next-bundle-analyzer to track bundle size
- **Test Coverage Reports**: Add coverage collection and reporting to CI
- **Performance Budgets**: Set and enforce performance budgets in CI

**Priority:** Low  
**Impact:** Prevents performance regressions and monitors build health

---

#### CI/CD Improvements

- **Branch Protection**: Require status checks to pass before merging
- **Cache Optimization**: Improve caching strategy for faster builds
- **Parallel Testing**: Run test suites in parallel for faster feedback

**Priority:** Low-Medium  
**Impact:** Faster development feedback loops and better code quality gates

---

#### Testing Infrastructure

- **Increased Test Coverage**: Target 25-50% coverage for critical components
- **Component Unit Tests**: Add more Jest tests for complex components

**Current Status:** 19 test suites, 166 total tests (157 passing, 9 skipped), 18 suites passing. Coverage baseline improving.  
**Priority:** Medium  
**Impact:** Catches bugs earlier in development cycle

---

## Feature Workarounds

### 1. ImpactCounter Visual Component (Disabled)

**Issue:** The visual component `<ImpactCounter />` in the Footer caused persistent "Exit Code 1" build failures in the CI/CD pipeline (Next.js/Turbopack) on the `main` branch, despite passing locally.

**Current State (February 2026):**

- **Backend Active:** Data collection via `ga-report.yml` runs daily and auto-commits to `src/data/impact.json` (PR #321 merged Feb 2026).
- **Frontend Disabled:** The component import and usage remain commented out in `src/components/footer/index.tsx`.

**Resolution Plan:**

- Investigate CI-specific Next.js build constraints regarding dynamic JSON imports.
- Re-enable component once stable.
- Consider a simpler static rendering approach that avoids dynamic imports.

---

### 2. Qualtrics Write-Operation Workflows (Archived)

**Issue:** Write-operation Qualtrics workflows (`qualtrics-apply-prolific-integration.yml`, etc.) were active in `.github/workflows/` with manual triggers, posing a risk of accidental execution against the production survey.

**Current State (February 2026, PR #317):**

- **Workflows archived** to `workflows-archived/` directory
- **Read-only workflow retained:** `qualtrics-dump-flow.yml` for flow inspection
- **Rationale:** Preserves git history while preventing accidental execution

**Resolution:** Considered complete. Workflows can be restored if needed.

---

## Architecture Decisions

### Intentionally Not Implemented

These architectural patterns are not needed for this static site:

#### 1. Advanced Context Management

**Status:** Not needed  
**Reason:** Single-page architecture doesn't require complex state management  
**Impact:** Simpler codebase, easier maintenance

---

#### 2. Server-Side API Routes

**Status:** Not applicable  
**Reason:** Static export architecture doesn't support API routes  
**Alternative:** External API integration if needed

---

#### 3. Database Integration

**Status:** Not needed  
**Reason:** Static site, no database required for current scope

---

#### 4. Authentication System

**Status:** Not needed  
**Reason:** Public website, no login functionality required

---

#### 5. Advanced Form Handling

**Status:** Simplified  
**Reason:** Current form submissions are simulated (backend integration pending)

---

## Tracking and Prioritization

### Priority Levels

**🔴 High Priority (Address within 1 month):**

- Critical security vulnerabilities
- Blocking bugs
- Performance issues affecting users

**🟡 Medium Priority (Address within 3 months):**

- React Hooks ESLint warnings
- Moderate security vulnerabilities
- Code quality improvements that reduce maintenance burden

**🟢 Low Priority (Address when convenient):**

- Low severity vulnerabilities in dev dependencies
- Code style issues that don't affect functionality
- Nice-to-have enhancements

---

### Current Action Items

**Recently Completed (v0.3.0 / v0.3.1, February 2026):**

- [x] Refactor accordion components to use `useLayoutEffect` - **COMPLETED** (Dec 2025)
- [x] Review and fix `exhaustive-deps` warnings in carousel components - **COMPLETED** (Dec 2025)
- [x] Reduced React Hooks warnings from 10 to 0 - **COMPLETED** (v0.3.0 removed legacy components)
- [x] ESLint clean: 0 errors, 0 warnings - **COMPLETED** (v0.3.0)
- [x] Archive write-operation Qualtrics workflows - **COMPLETED** (PR #317)
- [x] Centralize brand colors into Tailwind tokens - **COMPLETED** (PR #291)
- [x] Content credibility audit across 9 site sections - **COMPLETED** (PRs #304–#312)
- [x] Prolific script idempotency improvements - **COMPLETED** (PR #318)

**Immediate (Next Sprint):**

- [ ] Monitor ESLint/ajv/minimatch vulnerability chain for upstream fixes
- [ ] Run `pnpm audit fix` to resolve `@isaacs/brace-expansion` safely
- [ ] Re-enable ImpactCounter component or replace with static rendering

**Short Term (Next Quarter):**

- [ ] Increase test coverage (currently 166 tests across 19 suites)
- [ ] Implement visual regression testing

**Long Term (Next 6 Months):**

- [ ] Add bundle size monitoring
- [ ] Evaluate Next.js Image component alternatives for static export

---

### Review Schedule

**Monthly Review:**

- Review new security vulnerabilities
- Assess Dependabot PRs
- Update priority levels

**Quarterly Review:**

- Re-evaluate technical debt priorities
- Plan refactoring sprints
- Update this document

**Annual Review:**

- Comprehensive code quality audit
- Major refactoring planning
- Technology stack updates

---

## Related Documentation

- [README.md](./README.md) - Main project documentation
- [SECURITY.md](./SECURITY.md) - Security policies and vulnerability reporting
- [DEPENDABOT.md](./DEPENDABOT.md) - Dependency management guide
- [SITE_IMPROVEMENTS.md](./SITE_IMPROVEMENTS.md) - Capability gap analysis
- [TESTING.md](./TESTING.md) - Testing strategy and guides
- [CODE_QUALITY.md](./CODE_QUALITY.md) - Code quality standards

---

**Questions or Concerns?**

If you have questions about technical debt items or want to propose prioritization changes:

- Open a GitHub Discussion
- Create an issue with label `technical-debt`
- Contact repository maintainers

---

**Document Maintenance:**

- Update this document when technical debt items are added or resolved
- Review and update priorities quarterly
- Keep the action items section current
