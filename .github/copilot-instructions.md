## Repo-specific Copilot instructions (TABS)

### Workflow (Issue → PR → merge)

- Start every change from a GitHub Issue; open a PR that references the Issue (no direct commits to `main`).
- All commits land via PR merge (merge queue is enabled); don’t bypass PR review.
- Pushing new commits to a PR can trigger GitHub Copilot review sessions; address Copilot + human review comments before merging. See `COPILOT_AUTOFIX_GUIDE.md`.
- CI/merge queue runs formatting, lint, unit tests, build, and Playwright E2E; see `MERGE_QUEUE_VERIFICATION.md`.

### Big picture

- Next.js App Router + TypeScript, statically exported (`output: 'export'`); see `next.config.ts`.
- Root shell: `src/app/layout.tsx` (Header/Footer/CookieConsent + GTM). Homepage: `src/app/page.tsx` → `src/app/tabs-home`.
- App routes are in `src/app/*` and must use kebab-case folders (URLs/SEO).

### Local dev + pre-push checks

- Install: `pnpm install`
- Dev: `pnpm run dev`
- Format (fix before pushing): `pnpm run format` (CI enforces `pnpm run format:check`).
- Lint: `pnpm run lint` (some warnings are acceptable; don’t introduce new errors).
- Unit tests: `pnpm test` (Jest, see `__tests__/`).
- Build: `pnpm run build` (writes `out/`).
- Preview: `pnpm run preview` (serves `out/` on port 3000).
- E2E: `pnpm run test:e2e` (Playwright runs against `pnpm run preview`; see `playwright.config.ts`).

### Prevent common CI breaks (do this before pushing / merge-queue)

- Run in this order:
  1. `pnpm run format` (avoids CI `format:check` failures)
  2. `pnpm run lint` (fix errors; don’t add new ones)
  3. `pnpm test` (includes `jest-axe` accessibility checks; ARIA/name issues fail here - see `__tests__/components/*.test.tsx`)
  4. `pnpm run build` (static export must succeed)
  5. `pnpm run test:e2e` (Playwright runs against `pnpm run preview`)
- If you’re working with a GitHub Pages basePath locally, match CI by running E2E with an empty basePath: `NEXT_PUBLIC_BASE_PATH='' pnpm run test:e2e`.
- When Copilot review flags ARIA/a11y issues, fix them immediately (typical fixes: `aria-label` on icon-only buttons, correct `role`/focus handling in dialogs, descriptive `alt` text). PR template has an Accessibility checklist in `.github/PULL_REQUEST_TEMPLATE.md`.

### GitHub Pages basePath + assets

- GitHub Pages uses `NEXT_PUBLIC_BASE_PATH` → `basePath` + `assetPrefix` in `next.config.ts`.
- Make asset URLs basePath-safe using one of the existing patterns:
  - `assetPath('/Images/...')` from `src/lib/assetPath.ts`
  - `const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''` then `basePath + '/Images/…'` (example: `src/components/header/index.tsx`).

### Analytics + consent

- GTM always loads (`src/components/google-tag-manager/index.tsx`).
- Cookie consent gates GA/Clarity/Meta Pixel and pushes `consent_update` to `window.dataLayer` (`src/components/cookie-consent/index.tsx`). If reviews flag ARIA/accessibility issues, fix them and re-run checks.

### Known constraint: restricted network builds

- `next/font/google` is used (`src/lib/fonts.ts`); restricted networks can break `pnpm run build` if `fonts.googleapis.com` is blocked.

### Intentional “inactive” feature

# Preview built site

pnpm run preview

# Visit http://localhost:3000

````

## Validation Requirements

### Manual Testing Scenarios

**ALWAYS test application functionality after making changes:**

1. **Homepage Load Test**: Navigate to http://localhost:3000 and verify page loads completely
2. **Navigation Test**: Test mobile hamburger menu and desktop navigation
3. **Popup System Test**: Click "Donate" and "Volunteer" buttons to test global popup functionality
4. **Responsive Design Test**: Verify mobile and desktop layouts work correctly
5. **Static Content Test**: Verify all sections load (Programs, Impact, Team, FAQ)
6. **Logo Rendering Test**: Verify logos display correctly in NavBar (top left) and hero section

### Automated Testing

**Playwright tests are available to validate critical functionality:**

```bash
# Build the site first
pnpm run build

# Install Playwright browsers (first time only)
pnpm exec playwright install chromium

# Run all tests
pnpm test

# Run tests in headed mode (to see browser)
pnpm run test:headed

# Run tests with UI
pnpm run test:ui
````

**Test Suites:**

- `tests/logo.spec.ts` - Verifies logo visibility in NavBar and hero section
- `tests/github-pages.spec.ts` - Validates image loading for GitHub Pages deployment

**Testing Image Rendering for GitHub Pages:**
To test the GitHub Pages deployment locally with basePath:

```bash
# Build with basePath for GitHub Pages
NEXT_PUBLIC_BASE_PATH=/<your-repo> pnpm run build

# Preview the site
pnpm run preview

# Run tests (in another terminal)
pnpm test
```

### Pre-Commit Validation

**ALWAYS run before committing changes:**

```bash
pnpm run lint  # Fix any errors, warnings about img tags are expected
pnpm test     # Run automated tests (requires build first)
```

## Application Architecture

### Key Features

- **Multi-page static site**: 149+ pages covering research articles, bibliography, teaching series, organizational resources, and more
- **Mobile Navigation**: Slide-out panel with overlay in `src/components/header/index.tsx`
- **Static Export**: Configured for GitHub Pages deployment via `next.config.ts`
- **SEO Optimized**: Comprehensive metadata in `layout.tsx`, sitemap (149+ routes), and robots.txt
- **GitHub Pages Image Support**: Assets use `assetPath()` helper to handle basePath for GitHub Pages deployment
- **Teaching Series**: Presentation viewer with 4K support, handout materials, workshop guides
- **Article Series**: 16 research articles across two branches (plus root landing and bibliography pages) with shared styling via `articleStyles.ts`
- **Bibliography Pages**: 24 auto-generated bibliography entries with structured citations

### Project Structure

**Note: Folder structure uses consistent kebab-case naming. All folders MUST use kebab-case.**

**IMPORTANT:** When updating this structure, generally show all items fully. When new pages or folders are added, explicitly list them here. For large, sequentially numbered sets of pages (e.g., `article-1-1` through `article-1-7` or `bibliography-1-1` through `bibliography-1-21`), you may use explicit ranges instead of listing every item. Do NOT use vague placeholders like `[other policy pages]` or `[other feature folders]` - show the actual folder names or a clear numeric range.

```
src/
├── app/                                        # Next.js App Router (149+ pages)
│   ├── page.tsx                               # Homepage entry point
│   ├── layout.tsx                             # Root layout with metadata, providers
│   ├── not-found.tsx                          # 404 page
│   ├── globals.css                            # Global styles
│   ├── sitemap.ts                             # Dynamic sitemap generation
│   ├── robots.ts                              # Robots.txt configuration
│   │
│   ├── tabs-home/                             # Homepage components
│   ├── barriers/                              # Barriers documentation
│   │   └── survey-stats/                      # Survey statistics
│   ├── start/                                 # Interactive starting point
│   │   └── [role]/                           # Dynamic persona-based routing (11 roles)
│   ├── get-involved/                          # Participation opportunities
│   ├── media/                                 # Press kit and media resources
│   ├── survey-complete/                       # Post-survey completion
│   ├── for-organizations/                     # Resources for organizations
│   │   ├── executive-leaders/
│   │   ├── finance-leaders/
│   │   ├── operations-leaders/
│   │   └── technology-leaders/
│   ├── making-of-tabs/                        # Behind the scenes
│   │   ├── cmo-survey/
│   │   └── tabs-presentation/
│   ├── technology-adoption-models/            # Academic frameworks
│   ├── technology-adoption-series/            # Teaching series hub
│   │   ├── [slide]/                          # Dynamic slide viewer
│   │   ├── presentation/                     # Presentation viewer
│   │   │   └── 4k/                          # 4K presentation
│   │   ├── handout-materials/
│   │   ├── opening-and-closing-scripts/
│   │   ├── qa-preparation-guide/
│   │   ├── technology-lifecycle-assessment-template/
│   │   ├── visual-gallery/
│   │   └── workshop-and-trainer-materials/
│   ├── tabs-presentation/                     # Standalone presentation page
│   │
│   ├── article-1-branch-introduction-.../     # Branch 1: User's Journey (1 intro + 7 articles)
│   ├── article-1-1-... through article-1-7-.../
│   ├── article-2-branch-introduction-.../     # Branch 2: Organization's Playbook (1 intro + 7 articles)
│   ├── article-2-1-... through article-2-7-.../
│   ├── article-bibliography-.../              # Series bibliography
│   ├── bibliography-1-1-... through bibliography-1-21-.../  # 21 Branch 1 bibliography pages
│   ├── bibliography-2-1-... through bibliography-2-3-.../   # 3 Branch 2 bibliography pages
│   │
│   ├── contribution-policy/                   # Legal & Policy Pages
│   ├── cookie-policy/
│   ├── privacy-policy/
│   ├── security-acknowledgements/
│   ├── terms-of-service/
│   └── vulnerability-disclosure-policy/
│
├── components/                                # Reusable React components (kebab-case naming)
│   ├── header/                               # Site header/navigation
│   ├── footer/                               # Site footer
│   ├── cookie-consent/                        # Cookie consent banner
│   ├── google-tag-manager/                    # Analytics integration
│   ├── clarity-route-tracker/                 # Microsoft Clarity tracking
│   ├── impact/                                # Impact metrics display
│   ├── series-navigation/                     # Article series navigation
│   ├── survey-stats/                          # Qualtrics survey statistics
│   ├── tabs/                                  # TABS survey component
│   ├── tabs-page/                             # Homepage TABS section
│   ├── teaching-series-navigation/            # Teaching series navigation
│   ├── technology-adoption-series/            # Teaching series components
│   ├── charity-validation-guide/              # Charity validation components
│   └── ui/                                    # Reusable UI components
│
├── data/                                      # Static content
│   ├── faqs/                                  # FAQ JSON files
│   ├── faqs.ts                                # FAQ data aggregation
│   ├── team/                                  # Team member JSON files
│   ├── team.ts                                # Team data aggregation
│   ├── testimonials/                          # Testimonial JSON files
│   ├── testimonials.ts                        # Testimonial data aggregation
│   ├── barriers.ts                            # Barriers data
│   ├── impact.json                            # Impact metrics
│   ├── persona-navigation.ts                  # Role-based navigation
│   ├── qualtrics-metrics.json                 # Qualtrics raw response counts (Response Funnel)
│   ├── disposition-summary.json               # Prolific funnel + disposition triage (homepage + Response Funnel)
│   ├── technology-adoption-models-series.ts   # Article series data
│   ├── technology-adoption-teaching-series.ts # Teaching series data
│   └── visual-gallery.ts                      # Visual gallery data
│
└── lib/                                       # Utility functions
    ├── articleStyles.ts                       # Shared article page styling constants
    ├── assetPath.ts                           # Helper for GitHub Pages basePath
    ├── fonts.ts                               # Font configuration
    ├── github-utils.ts                        # GitHub API utilities
    ├── google-analytics.ts                    # Google Analytics client
    ├── personas.ts                            # Role-based persona utilities
    ├── prolific-api.ts                        # Prolific API client
    ├── qualtrics-api.ts                       # Qualtrics API client
    ├── release-notes.ts                       # Release notes utilities
    ├── simple-markdown.tsx                    # Markdown rendering utility
    ├── slugify.ts                             # URL slug generation
    ├── stripHtml.ts                           # HTML stripping utility
    ├── tabs-survey.ts                         # TABS survey utilities
    ├── technology-adoption-series.ts          # Article series utilities
    └── technology-adoption-teaching-series-segment.ts  # Teaching series segment utilities
```

**Naming Conventions:**

**IMPORTANT: All folders MUST use kebab-case (lowercase with hyphens)**

- All component folders use kebab-case (e.g., `home-page`, `cookie-consent`)
- All app route folders use kebab-case (e.g., `cookie-policy`, `privacy-policy`)
- Removed redundant `-components` suffix from folder names
- Removed Figma references from folder names
- Consistent structure makes imports clearer and more maintainable

**Why kebab-case is Required:**

1. **SEO Best Practice**: Search engines prefer kebab-case URLs as they clearly separate words and improve readability
   - Source: Google Search Central - "Use hyphens to separate words in URLs" (https://developers.google.com/search/docs/crawling-indexing/url-structure)
   - Source: Moz SEO Guide - "Hyphens are treated as space by search engines" (https://moz.com/learn/seo/url)

2. **URL Readability**: Kebab-case URLs are more readable to both users and search engines
   - Example: `/cookie-policy` is clearer than `/cookiepolicy` or `/CookiePolicy`
   - Hyphens act as word separators, improving keyword recognition

3. **Industry Standard**: Kebab-case is the web standard for URLs and file paths
   - Used by major frameworks (Next.js, React Router, Vue Router)
   - Consistent with HTTP/REST API conventions

4. **Accessibility**: Screen readers handle hyphenated text better than camelCase or PascalCase

**Never use PascalCase or camelCase for folder names** - it negatively impacts SEO and URL readability.

### Configuration Files

- `next.config.ts` - Static export configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.mjs` - ESLint with Next.js rules
- `postcss.config.mjs` - Tailwind CSS PostCSS configuration
- `.github/workflows/ci.yml` - CI workflow for testing
- `.github/workflows/deploy.yml` - GitHub Pages deployment
- `.github/workflows/codeql.yml` - Security scanning
- `.github/workflows/lighthouse.yml` - Performance monitoring

## Common Tasks

### Content Updates

- **Homepage content**: Edit `src/app/page.tsx`
- **Navigation links**: Update `src/components/header/index.tsx`
- **Team information**: Modify `src/data/team/` JSON files and `src/data/team.ts`
- **FAQ content**: Update `src/data/faqs/` JSON files and `src/data/faqs.ts`
- **Testimonials**: Edit `src/data/testimonials/` JSON files and `src/data/testimonials.ts`
- **Article series**: Edit `src/app/article-*` page files; shared styles in `src/lib/articleStyles.ts`

### SEO and Metadata

- **Site metadata**: Edit `metadata` object in `src/app/layout.tsx`
- **Sitemap**: Update `src/app/sitemap.ts` for new routes
- **Robots.txt**: Modify `src/app/robots.ts`

### Styling and UI

- **Global styles**: Edit `src/app/globals.css`
- **Component styles**: Use Tailwind classes directly in components
- **Font issues**: Remember to handle Google Fonts limitation when building

### Adding Images and Assets

When adding images or other static assets that need to work on both custom domain and GitHub Pages:

**ALWAYS use the `assetPath()` helper for images:**

```typescript
import { assetPath } from "../lib/assetPath";

// In your component:
<img src={assetPath("/my-image.png")} alt="Description" />
```

**Why this is needed:**

- Custom domain (technologyadoptionbarriers.org): images at `/my-image.png`
- GitHub Pages: images at `/<repo-name>/my-image.png`
- The helper automatically handles both scenarios based on the `NEXT_PUBLIC_BASE_PATH` environment variable

**Implementation note:** The helper is defined in `src/lib/assetPath.ts` and can be used in `<img>` tags when assets must work under a GitHub Pages base path.

### Deployment Process

The site auto-deploys to GitHub Pages via `.github/workflows/deploy.yml` when pushed to main branch:

1. Node.js 20 setup
2. `pnpm install --frozen-lockfile` for clean install
3. `NEXT_PUBLIC_BASE_PATH=/<repo-name>` is set for GitHub Pages deployment
4. `next build` builds the site with proper basePath
5. Playwright tests run to validate the build
6. Static files deployed from `./out` directory

**Dual Deployment:**

- **Custom domain**: https://technologyadoptionbarriers.org (CNAME configured, no basePath needed)
- **GitHub Pages**: https://<org>.github.io/<repo>/ (basePath required)

## Known Issues and Limitations

### Google Fonts Build Failure

- **Issue**: `pnpm run build` fails with "ENOTFOUND fonts.googleapis.com"
- **Cause**: Network restrictions prevent Google Fonts access
- **Workaround**: Temporarily comment out font imports in `src/app/layout.tsx`
- **Files affected**: Lines 2, 9-12, 73 in `src/app/layout.tsx`

### ESLint Warnings

The project currently passes ESLint with **0 errors and 0 warnings**.

As of v0.3.0, all previously-acceptable warnings (stale `@next/next/no-img-element` and React Hooks warnings from deleted FFC-era components) have been resolved by removing the legacy code.

**Running `pnpm run lint` should produce a clean output.** If new warnings appear, fix them before pushing.

## GitHub Community Health Files

This repository includes a comprehensive set of GitHub-recognized community health files that automatically appear in GitHub's navigation interface. See [COMMUNITY_HEALTH_FILES.md](../COMMUNITY_HEALTH_FILES.md) for complete documentation.

### Core Documentation (Automatic GitHub Navigation)

**Files in repository root:**

- `README.md` - Main documentation (always visible in navigation)
- `LICENSE` - Apache 2.0 license (appears in License tab)
- `CODE_OF_CONDUCT.md` - Contributor Covenant 2.1 (appears in Code of conduct tab)
- `CONTRIBUTING.md` - Contribution guidelines (appears in Contributing tab and sidebar)
- `SECURITY.md` - Security policies (appears in Security tab)
- `SUPPORT.md` - Support resources and help (appears in sidebar)
- `CITATION.cff` - Academic citation info (enables "Cite this repository" button)
- `CHANGELOG.md` - Release notes and version history

**Files in .github directory:**

- `.github/FUNDING.yml` - Funding sources (enables "Sponsor" button)
- `.github/CODEOWNERS` - Code ownership (auto-assigns PR reviewers)
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template (auto-populates PR description)
- `.github/ISSUE_TEMPLATE/` - Issue templates:
  - `bug_report.md` - Bug reporting template
  - `feature_request.md` - Feature request template
  - `documentation.md` - Documentation issue template
  - `reviewer-onboarding.md` - Reviewer onboarding template
  - `config.yml` - Issue template configuration with support links

### Verifying Community Health Files

To verify files are recognized by GitHub:

1. Visit: https://github.com/<your-org>/<your-repo>/community
2. Check navigation tabs on mobile (README, Code of conduct, Contributing, License, Security, More)
3. Look for "Sponsor" button in repository header
4. Look for "Cite this repository" button
5. Create a new issue to see issue templates
6. Create a new PR to see PR template

### Maintaining Community Health Files

When updating documentation:

- Keep files in their designated locations (root or .github/)
- Follow GitHub's naming conventions exactly
- Update COMMUNITY_HEALTH_FILES.md when adding new files
- Test that files appear in GitHub navigation after updates

## Quick Reference Commands

```bash
# Repository setup
node --version        # Verify Node.js 20.x
pnpm install          # 17 seconds

# Development
pnpm run dev          # http://localhost:3000 (1 second startup)
pnpm run lint         # 2 seconds, should be clean (0 warnings)

# Testing
pnpm test             # Run Jest unit tests (124 tests, 17 suites)
pnpm run build        # Build first (required for E2E tests)
pnpm run test:e2e     # Run Playwright E2E tests
pnpm run test:e2e:headed  # Run Playwright in headed mode
pnpm run test:e2e:ui      # Run Playwright with UI

# Production (requires font workaround)
pnpm run build        # 20 seconds when fonts disabled
pnpm run preview      # http://localhost:3000

# Test GitHub Pages deployment locally
NEXT_PUBLIC_BASE_PATH=/<your-repo> pnpm run build
pnpm run preview      # Test with basePath

# File structure overview
ls -la src/app/      # Main application code
ls -la public/       # Static assets (icons, images)
ls -la tests/        # Playwright test files
ls -la .github/      # GitHub workflows and configs
```

## Troubleshooting

### Build Failures

1. **Google Fonts error**: Apply font workaround in `layout.tsx`
2. **TypeScript errors**: Run `pnpm run lint` to identify issues
3. **Network timeouts**: Increase timeout values as specified above

### Development Server Issues

1. **Port conflicts**: Stop existing servers or use different port
2. **Cache issues**: Delete `.next` directory and rebuild
3. **Font rendering**: Expected to fail without workaround applied

### GitHub CLI Issues

1. **"No commits between..." error when creating PR**:
   - **Symptoms**: `gh pr create` fails with validation errors about no commits.
   - **Fix**: The CLI may be confused about the default repository context. Run:
     ```bash
     gh repo set-default <owner>/<repo>
     ```
   - **Verify**: Ensure you have pushed at least one commit (even an empty one) to your feature branch before creating the PR.

# Remember: **NEVER CANCEL** long-running commands. **ALWAYS** test manually after changes. **ALWAYS** apply Google Fonts workaround before building.

## Data Privacy & PII Protection

**CRITICAL: This project handles research participant data. These rules apply to ALL agents (Copilot, Jules, Claude).**

**NEVER commit:**

- Prolific Participant IDs (PIDs) - 24-character hex strings (e.g., `5df961cb53e8466f17606ae1`)
- Email addresses, names, or any direct identifiers
- Raw Qualtrics CSV data
- Prolific demographic data
- API tokens, secrets, or credentials
- Build artifacts (`*.log`, `patch_*.sh`, `ide_capabilities.txt`, `.env`)

**Safe to commit (aggregates only):**

- `src/data/sensitivity-analysis.json` - aggregate statistics
- `src/data/disposition-summary.json` - aggregate counts
- `src/data/data-audit.json` - aggregate waterfall

**Step summaries:** Use aggregate counts only. Never include PID tables.

**If you find PII in committed files:** Create a `security` issue. Do NOT try to fix it in a PR (it's already in git history).
