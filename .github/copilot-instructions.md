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

- Install: `npm install`
- Dev: `npm run dev`
- Format (fix before pushing): `npm run format` (CI enforces `npm run format:check`).
- Lint: `npm run lint` (some warnings are acceptable; don’t introduce new errors).
- Unit tests: `npm test` (Jest, see `__tests__/`).
- Build: `npm run build` (writes `out/`).
- Preview: `npm run preview` (serves `out/` on port 3000).
- E2E: `npm run test:e2e` (Playwright runs against `npm run preview`; see `playwright.config.ts`).

### Prevent common CI breaks (do this before pushing / merge-queue)

- Run in this order:
  1. `npm run format` (avoids CI `format:check` failures)
  2. `npm run lint` (fix errors; don’t add new ones)
  3. `npm test` (includes `jest-axe` accessibility checks; ARIA/name issues fail here — see `__tests__/components/*.test.tsx`)
  4. `npm run build` (static export must succeed)
  5. `npm run test:e2e` (Playwright runs against `npm run preview`)
- If you’re working with a GitHub Pages basePath locally, match CI by running E2E with an empty basePath: `NEXT_PUBLIC_BASE_PATH='' npm run test:e2e`.
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

- `next/font/google` is used (`src/lib/fonts.ts`); restricted networks can break `npm run build` if `fonts.googleapis.com` is blocked.

### Intentional “inactive” feature

<<<<<<< HEAD
# Preview built site
npm run preview
# Visit http://localhost:3000
```

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
npm run build

# Install Playwright browsers (first time only)
npx playwright install chromium

# Run all tests
npm test

# Run tests in headed mode (to see browser)
npm run test:headed

# Run tests with UI
npm run test:ui
```

**Test Suites:**

- `tests/logo.spec.ts` - Verifies logo visibility in NavBar and hero section
- `tests/github-pages.spec.ts` - Validates image loading for GitHub Pages deployment

**Testing Image Rendering for GitHub Pages:**
To test the GitHub Pages deployment locally with basePath:

```bash
# Build with basePath for GitHub Pages
NEXT_PUBLIC_BASE_PATH=/<your-repo> npm run build

# Preview the site
npm run preview

# Run tests (in another terminal)
npm test
```

### Pre-Commit Validation

**ALWAYS run before committing changes:**

```bash
npm run lint  # Fix any errors, warnings about img tags are expected
npm test     # Run automated tests (requires build first)
```

## Application Architecture

### Key Features

- **Global Popup System**: Centralized Donate/Volunteer modals accessible from any component
  - Provider: `src/app/components/PopupProvider.tsx`
  - Mount: `src/app/components/PopupsRootClient.tsx`
  - Buttons: `DonateButton.tsx`, `VolunteerButton.tsx`
- **Mobile Navigation**: Slide-out panel with overlay in `NavBar.tsx`
- **Static Export**: Configured for GitHub Pages deployment via `next.config.ts`
- **SEO Optimized**: Comprehensive metadata in `layout.tsx`, sitemap, and robots.txt
- **GitHub Pages Image Support**: Assets use `assetPath()` helper to handle basePath for GitHub Pages deployment

### Project Structure

**Note: Folder structure was refactored to use consistent kebab-case naming and remove redundant suffixes.**

**IMPORTANT:** When updating this structure, ALWAYS show all items fully. When new pages or folders are added, explicitly list them here. Do NOT use placeholders like `[other policy pages]` or `[other feature folders]` - show the actual folder names.

```
src/
├── app/                                        # Next.js app directory
│   ├── page.tsx                               # Main homepage entry point
│   ├── layout.tsx                             # Root layout with metadata, providers
│   ├── globals.css                            # Global styles
│   ├── home-page/                             # Homepage components (formerly Figma-Home-page)
│   ├── cookie-policy/                         # Cookie Policy page
│   ├── donation-policy/                       # Donation Policy page
│   ├── privacy-policy/                        # Privacy Policy page
│   ├── security-acknowledgements/             # Security Acknowledgements page
│   ├── terms-of-service/                      # Terms of Service page
│   ├── vulnerability-disclosure-policy/       # Vulnerability Disclosure Policy page
│   ├── sitemap.ts                             # Dynamic sitemap generation
│   └── robots.ts                              # Robots.txt configuration
├── components/                                # All UI components (kebab-case naming)
│   ├── header/                               # Site header/navigation
│   ├── footer/                               # Site footer
│   ├── cookie-consent/                        # Cookie consent banner
│   ├── google-tag-manager/                    # Analytics integration
│   ├── ui/                                    # Reusable UI components
│   ├── home-page/                             # Homepage-specific components
│   ├── home/                                  # Alternative home components
│   ├── domains/                               # Domain-related components
│   ├── donate/                                # Donation components
│   ├── volunteer/                             # Volunteer components
│   ├── 501c3/                                 # 501c3 charity components
│   ├── about-us/                              # About page components
│   ├── charity-validation-guide/              # Charity validation guide components
│   ├── contact-us/                            # Contact form components
│   ├── endowment-fund/                        # Endowment fund components
│   ├── free-charity-web-hosting/              # Web hosting program components
│   ├── guidestar-guide/                       # GuideStar guide components
│   ├── help-for-charities/                    # Help resources
│   ├── online-impacts-onboarding/             # Online impacts onboarding components
│   ├── pre501c3/                              # Pre-501c3 charity components
│   ├── service-delivery-stages/               # Service delivery stages components
│   ├── techstack/                             # Technology stack components
│   ├── tools-for-success/                     # Tools and resources
│   ├── volunteer-proving-ground/              # Volunteer proving ground components
│   └── web-developer-training-guide/          # Web developer training guide components
├── data/                                      # Static content
│   ├── faqs/                                  # FAQ JSON files
│   ├── team/                                  # Team member data
│   └── testimonials/                          # Testimonial data
└── lib/                                       # Utility functions
    └── assetPath.ts                           # Helper for GitHub Pages basePath support
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
- **Navigation links**: Update `src/app/components/NavBar.tsx`
- **Team information**: Modify `src/app/data/team.ts`
- **FAQ content**: Update `src/app/data/faqs.ts`
- **Testimonials**: Edit `src/app/data/testimonials.ts`

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
2. `npm ci` for clean install
3. `NEXT_PUBLIC_BASE_PATH=/<repo-name>` is set for GitHub Pages deployment
4. `next build` builds the site with proper basePath
5. Playwright tests run to validate the build
6. Static files deployed from `./out` directory

**Dual Deployment:**

- **Custom domain**: https://technologyadoptionbarriers.org (CNAME configured, no basePath needed)
- **GitHub Pages**: https://<org>.github.io/<repo>/ (basePath required)

## Known Issues and Limitations

### Google Fonts Build Failure

- **Issue**: `npm run build` fails with "ENOTFOUND fonts.googleapis.com"
- **Cause**: Network restrictions prevent Google Fonts access
- **Workaround**: Temporarily comment out font imports in `src/app/layout.tsx`
- **Files affected**: Lines 2, 9-12, 73 in `src/app/layout.tsx`

### ESLint Warnings

The project currently has 16 ESLint warnings. All have been reviewed and are acceptable:

**1. `@next/next/no-img-element` warnings (6 occurrences)** - ✅ ACCEPTABLE

- **Files**: `header/index.tsx`, `footer/index.tsx`, `endowment-fund/Hero/index.tsx`, `free-charity-web-hosting/About-FFC-Hosting/index.tsx`, `ui/General-Donation-Card.tsx`, `ui/trainingcard.tsx`
- **Cause**: Using `<img>` tags instead of Next.js `<Image />` component
- **Why acceptable**: Static export (`output: "export"`) is incompatible with Next.js Image Optimization. We use `assetPath()` helper to ensure images work on GitHub Pages.
- **Impact**: Images load correctly but without automatic optimization

**2. React Hooks warnings (10 occurrences)** - ⚠️ ACCEPTABLE but technical debt

- `react-hooks/set-state-in-effect` (6): Setting state in `useEffect` for accordion animations and cookie consent - works correctly
- `react-hooks/exhaustive-deps` (2): Missing effect dependencies - intentional for current implementation
- `react-hooks/immutability` (2): Direct mutation in Swiper setup - works correctly but violates best practices

**Running `npm run lint` will show these warnings - this is expected and does not indicate a problem.**

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
npm install          # 17 seconds

# Development
npm run dev          # http://localhost:3000 (1 second startup)
npm run lint         # 2 seconds, warnings expected

# Testing
npm run build        # Build first (required for tests)
npm test             # Run Playwright tests
npm run test:headed  # Run tests in headed mode
npm run test:ui      # Run tests with Playwright UI

# Production (requires font workaround)
npm run build        # 20 seconds when fonts disabled
npm run preview      # http://localhost:3000

# Test GitHub Pages deployment locally
NEXT_PUBLIC_BASE_PATH=/<your-repo> npm run build
npm run preview      # Test with basePath

# File structure overview
ls -la src/app/      # Main application code
ls -la public/       # Static assets (icons, images)
ls -la tests/        # Playwright test files
ls -la .github/      # GitHub workflows and configs
```

## Troubleshooting

### Build Failures

1. **Google Fonts error**: Apply font workaround in `layout.tsx`
2. **TypeScript errors**: Run `npm run lint` to identify issues
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

Remember: **NEVER CANCEL** long-running commands. **ALWAYS** test manually after changes. **ALWAYS** apply Google Fonts workaround before building.
=======
- Global popup system is currently commented out in `src/app/layout.tsx` (PopupProvider/PopupsRootClient).
>>>>>>> 38231785a07c793802e5df3e79d0a7da3eeeb3bb
