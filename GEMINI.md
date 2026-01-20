# Gemini Agent Instructions for TABS

Hey Gemini! Whether you're working in VS Code or Antigravity, welcome to the Technology Adoption Barriers (TABS) repository. This guide will help you contribute effectively to this Next.js + TypeScript nonprofit website project.

## Project at a Glance

**What you're working on:**

- A Next.js 16.0.7 static website for Technology Adoption Barriers nonprofit
- Deployed to GitHub Pages with custom domain
- Production URL: https://technologyadoptionbarriers.org
- **External APIs**: Qualtrics (survey management), Prolific (participant data)
- **IDE Tools**: MCP servers for Qualtrics & GitHub, terminal access

**Your mission:**
Help maintain and improve a high-quality, accessible website that serves a real nonprofit organization.

## Your Strengths - Use Them!

As Gemini, you're particularly good at:

- **Quick comprehension** - Rapidly understanding codebases
- **Pattern recognition** - Identifying code patterns and inconsistencies
- **Practical solutions** - Finding pragmatic fixes to problems
- **Multi-modal thinking** - Understanding code in context
- **Efficient iteration** - Quick turnaround on fixes

Apply these strengths to make meaningful contributions!

## The Golden Rules

### Rule #1: Always Test Before Committing

Run these commands **in this exact order** before every commit:

```bash
npm run format      # Fix code formatting automatically
npm run lint        # Check for code errors
npm test            # Run unit tests + accessibility checks
npm run build       # Build the static site
npm run test:e2e    # Run end-to-end tests
```

If **any** of these fail, fix the issue before pushing. CI will reject your PR otherwise.

### Rule #2: Use kebab-case for ALL Folders

**✅ Correct:**

```
src/app/privacy-policy/
src/components/cookie-consent/
src/app/terms-of-service/
```

**❌ Wrong:**

```
src/app/PrivacyPolicy/
src/components/cookieConsent/
src/app/TermsOfService/
```

**Why?** SEO best practice - Google recommends hyphens in URLs. It's also more readable and accessible.

### Rule #3: GitHub Pages Asset Paths

**Always** use the `assetPath()` helper for images:

```typescript
import { assetPath } from "@/lib/assetPath";

// ✅ Do this
<img src={assetPath("/Images/logo.png")} alt="TABS Logo" />

// ❌ Not this
<img src="/Images/logo.png" alt="TABS Logo" />
```

**Reason:** The site deploys to two places (custom domain and GitHub Pages). The helper ensures images work in both locations.

### Rule #4: Follow the Code Review Workflow

All changes go through Pull Requests with automated code review:

1. Create a feature branch (`git checkout -b feat/my-feature`)
2. Make your changes
3. Push and open a PR
4. Mark PR as "Ready for review" - **this automatically triggers Copilot code review**
5. Address all review comments (automated and human)
6. Resolve review threads using GitHub UI or `gh pr review` command
7. Wait for all CI checks to pass
8. Merge after reviews are approved

## Quick Start Guide

### Setting Up Your Environment

```bash
# Clone and install
git clone https://github.com/clarkemoyer/technologyadoptionbarriers.org.git
cd technologyadoptionbarriers.org
npm install

# Start development server
npm run dev
# Visit http://localhost:3000
```

### Tech Stack Overview

| Technology     | Purpose                         |
| -------------- | ------------------------------- |
| Next.js 16.0.7 | React framework with App Router |
| TypeScript     | Type-safe JavaScript            |
| Tailwind CSS   | Utility-first CSS framework     |
| Jest           | Unit testing                    |
| Playwright     | End-to-end testing              |
| jest-axe       | Accessibility testing           |
| GitHub Actions | CI/CD pipeline                  |
| GitHub Pages   | Hosting platform                |

## Project Structure (Simplified)

```
technologyadoptionbarriers.org/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout (shell, metadata)
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Global styles
│   │   └── [route]/           # Other pages (kebab-case!)
│   ├── components/            # Reusable React components
│   │   ├── header/           # Site navigation
│   │   ├── footer/           # Site footer
│   │   ├── ui/               # UI components
│   │   └── [feature]/        # Feature components
│   ├── data/                 # JSON content files
│   └── lib/                  # Utility functions
│       └── assetPath.ts     # BasePath helper for images
├── tests/                    # Playwright E2E tests
├── __tests__/               # Jest unit tests
└── public/                  # Static assets (images, icons)
```

## Common Tasks & How-Tos

### Task 1: Adding a New Page

```typescript
// Step 1: Create src/app/my-page/page.tsx
export default function MyPage() {
  return (
    <main className="px-4 py-8">
      <h1 className="text-3xl font-bold">My Page</h1>
      <p>Page content here</p>
    </main>
  );
}

// Step 2: Update src/app/sitemap.ts
export default function sitemap() {
  return [
    // ... existing entries
    {
      url: 'https://technologyadoptionbarriers.org/my-page',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}

// Step 3: Add link in navigation (src/components/header/index.tsx)
```

### Task 2: Styling with Tailwind CSS

Use Tailwind classes directly in your components:

```typescript
export default function Card() {
  return (
    <div className="
      bg-white
      rounded-lg
      shadow-md
      p-6
      hover:shadow-lg
      transition-shadow
      duration-300
    ">
      <h2 className="text-xl font-semibold mb-2">Card Title</h2>
      <p className="text-gray-600">Card description</p>
    </div>
  );
}
```

**Mobile-first responsive design:**

```typescript
<div className="
  text-base       // Mobile: base size
  md:text-lg      // Tablet: larger
  lg:text-xl      // Desktop: even larger
">
  Responsive text
</div>
```

### Task 3: Writing Tests

**Unit Test Example (Jest + Testing Library):**

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import MyComponent from '@/components/MyComponent';

expect.extend(toHaveNoViolations);

describe('MyComponent', () => {
  it('renders heading', () => {
    render(<MyComponent />);
    expect(screen.getByRole('heading')).toHaveTextContent('My Component');
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**E2E Test Example (Playwright):**

```typescript
// tests/navigation.spec.ts
import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')

  // Check heading exists
  await expect(page.locator('h1')).toContainText('Technology Adoption Barriers')

  // Check navigation works
  await page.click('text=About')
  await expect(page).toHaveURL(/.*about/)
})
```

### Task 4: Ensuring Accessibility

The project uses **jest-axe** to catch accessibility issues. Common problems and fixes:

#### Problem: Missing ARIA label on icon button

```typescript
// ❌ Fails accessibility test
<button onClick={toggleMenu}>
  <MenuIcon />
</button>

// ✅ Passes
<button onClick={toggleMenu} aria-label="Toggle navigation menu">
  <MenuIcon />
</button>
```

#### Problem: Missing alt text on image

```typescript
// ❌ Fails
<img src={assetPath("/logo.png")} />

// ✅ Passes
<img src={assetPath("/logo.png")} alt="TABS Logo" />
```

#### Problem: Non-semantic HTML

```typescript
// ❌ Avoid
<div onClick={handleSubmit} className="button-style">
  Submit
</div>

// ✅ Use semantic elements
<button onClick={handleSubmit} className="button-style">
  Submit
</button>
```

## Handling Known Issues

### Issue 1: Expected ESLint Warnings

When you run `npm run lint`, you'll see warnings like:

```
⚠ @next/next/no-img-element (6 warnings)
⚠ react-hooks/exhaustive-deps (2 warnings)
⚠ react-hooks/set-state-in-effect (6 warnings)
```

**These are expected and acceptable!** Don't try to fix them:

- `no-img-element`: We use `<img>` instead of `<Image>` because static export doesn't support Next.js image optimization
- React hooks warnings: Technical debt that works correctly in production

**Your job:** Fix new errors, don't introduce new warnings.

### Issue 2: Google Fonts Build Failures

On restricted networks, `npm run build` might fail with:

```
ENOTFOUND fonts.googleapis.com
```

This is a known limitation - font imports in `src/lib/fonts.ts` require network access. In restricted environments, fonts may need to be disabled temporarily.

### Issue 3: Static Export Limitations

Because we use `output: 'export'` in `next.config.ts`:

- ❌ Can't use Next.js `<Image>` component
- ❌ Can't use server-side features (API routes, middleware)
- ✅ Must use `<img>` tags with `assetPath()` helper
- ✅ All pages render at build time

This is by design for GitHub Pages deployment.

## Git Workflow Best Practices

### Branch Naming Convention

```bash
feat/add-testimonials-section    # New feature
fix/mobile-menu-bug              # Bug fix
docs/update-readme               # Documentation
chore/update-dependencies        # Maintenance
test/add-e2e-coverage           # Test improvements
```

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add testimonials carousel to homepage
fix: resolve navigation overlay z-index issue
docs: update testing guide with accessibility section
chore: update Next.js to v16.0.7
test: add E2E tests for donation flow
```

### Pull Request Workflow

1. **Create branch**: `git checkout -b feat/my-feature`
2. **Make changes**: Edit files, add tests
3. **Run checks**: All 5 commands in "Golden Rules" section
4. **Commit**: `git commit -m "feat: descriptive message"`
5. **Push**: `git push origin feat/my-feature`
6. **Open PR**: Use template in `.github/PULL_REQUEST_TEMPLATE.md`
7. **Link issue**: Add "Closes #X" in PR description
8. **Mark ready**: Set PR to "Ready for review" - **automatically triggers Copilot code review**
9. **Wait for CI**: GitHub Actions runs all checks
10. **Address reviews**: Fix issues identified by Copilot and human reviewers
11. **Resolve threads**: Use GitHub UI "Resolve conversation" or `gh pr review` CLI
12. **Merge**: After all reviews approved and CI passes

## CI/CD Pipeline

When you push, GitHub Actions automatically runs:

| Check               | Command                | Must Pass?           |
| ------------------- | ---------------------- | -------------------- |
| Formatting          | `npm run format:check` | ✅ Yes               |
| Linting             | `npm run lint`         | ✅ Yes (errors only) |
| Unit Tests          | `npm test`             | ✅ Yes               |
| Build               | `npm run build`        | ✅ Yes               |
| E2E Tests           | `npm run test:e2e`     | ✅ Yes               |
| Security Scan       | CodeQL                 | ✅ Yes               |
| Performance         | Lighthouse             | ⚠️ Advisory          |
| **Copilot Review**  | Automatic              | ⚠️ Address comments  |

**All checks must pass and reviews must be addressed** before your PR can merge.

### Code Review Process

**Automatic Trigger:** When you mark a PR as "Ready for review", Copilot automatically analyzes your code.

**How to handle reviews:**

1. **Read review comments** - Copilot and human reviewers will provide feedback
2. **Make fixes** - Address each comment by updating your code
3. **Resolve threads** - After fixing, mark conversations as resolved:
   - **GitHub UI**: Click "Resolve conversation" button
   - **GitHub CLI**: `gh pr review <pr-number> --comment -b "Fixed in commit abc1234"`
4. **Re-request review** - If you made significant changes, request another review
5. **Get approval** - All reviewers must approve before merge

## Deployment Process

**Automatic deployment** on merge to `main`:

1. GitHub Actions triggers `.github/workflows/deploy.yml`
2. Installs dependencies with `npm ci`
3. Sets `NEXT_PUBLIC_BASE_PATH` for GitHub Pages
4. Builds static site with `npm run build`
5. Runs Playwright tests to validate build
6. Deploys `./out` directory to GitHub Pages
7. Site updates at both:
   - https://technologyadoptionbarriers.org (custom domain)
   - https://[org].github.io/[repo]/ (GitHub Pages)

No manual intervention needed!

## Performance & Quality

### Keep Bundle Size Small

Check build output for large dependencies:

```bash
npm run build
# Look for "First Load JS" sizes in output
```

Goal: Keep initial bundle under 200KB.

### Optimize Images

Before adding images:

1. Compress with tools like TinyPNG
2. Use appropriate format (WebP for photos, SVG for logos)
3. Resize to actual display size (don't upload 4K images for 300px display)

### Monitor Lighthouse Scores

CI runs Lighthouse on every PR. Aim for:

- Performance: >90
- Accessibility: 100
- Best Practices: >90
- SEO: 100

## Accessibility Checklist

Before submitting a PR with UI changes:

- [ ] All interactive elements have focus states
- [ ] Icon-only buttons have `aria-label`
- [ ] Images have descriptive `alt` text
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Keyboard navigation works (test with Tab key)
- [ ] Screen reader compatible (test with NVDA/VoiceOver if possible)
- [ ] No accessibility violations in `npm test`

## Helpful Resources

### Project Documentation

- [AGENTS.md](./AGENTS.md) - General agent instructions
- [CLAUDE.md](./CLAUDE.md) - Claude-specific instructions
- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Detailed contribution guide
- [TESTING.md](./TESTING.md) - Comprehensive testing documentation
- [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md) - Naming rules and rationale
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup guide

### External Documentation

- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Language guide
- [React Testing Library](https://testing-library.com/react) - Testing utilities
- [Playwright](https://playwright.dev/) - E2E testing framework
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines

## Your Pre-Commit Checklist

### Before You Start

- [ ] Read the GitHub issue thoroughly
- [ ] Understand the problem you're solving
- [ ] Check if tests exist for the area you're modifying
- [ ] Review similar code to understand patterns

### While Coding

- [ ] Use kebab-case for all folder names
- [ ] Use `assetPath()` for all image sources
- [ ] Add ARIA labels to icon-only buttons
- [ ] Write semantic HTML (buttons, not divs with onClick)
- [ ] Follow existing code style and patterns
- [ ] Add comments only where necessary

### Before Committing

- [ ] `npm run format` - ✅ Auto-fix formatting
- [ ] `npm run lint` - ✅ Fix any new errors
- [ ] `npm test` - ✅ All tests pass (including jest-axe)
- [ ] `npm run build` - ✅ Static export succeeds
- [ ] `npm run test:e2e` - ✅ E2E tests pass
- [ ] Review your git diff - ✅ Changes look correct

### Opening Your PR

- [ ] Use PR template from `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Link to issue with "Closes #X" or "Fixes #X"
- [ ] Add clear description of changes
- [ ] Include screenshots for UI changes
- [ ] Request review from maintainers

## Tips for Success

1. **Start small** - Make focused changes, not sweeping refactors
2. **Test frequently** - Run tests often during development
3. **Ask questions** - Open an issue if you're unsure about something
4. **Follow patterns** - Look at existing code before creating new patterns
5. **Accessibility matters** - This is a nonprofit serving real users
6. **Mobile-first** - Always check responsive layouts
7. **Documentation** - Update docs when changing behavior
8. **Be patient** - CI takes a few minutes; don't skip checks

## Common Pitfalls to Avoid

❌ **Don't:**

- Skip the pre-commit commands
- Use PascalCase or camelCase for folder names
- Hardcode image paths (use `assetPath()`)
- Remove or modify existing tests
- Commit directly to `main`
- Introduce new TypeScript `any` types
- Add large dependencies without discussion
- Ignore accessibility warnings from jest-axe

✅ **Do:**

- Run all 5 pre-commit commands in order
- Use kebab-case for all folders
- Use `assetPath()` for images
- Add tests for new functionality
- Work in feature branches
- Use proper TypeScript types
- Keep dependencies minimal
- Fix accessibility issues immediately

## Getting Help

**Stuck? Here's how to get help:**

1. **Check documentation**: Start with [README.md](./README.md) and linked guides
2. **Search issues**: Someone may have faced the same problem
3. **Open an issue**: Use templates in `.github/ISSUE_TEMPLATE/`
4. **Contact maintainers**: contact@technologyadoptionbarriers.org
5. **Review existing code**: Look for similar patterns in the codebase

## Your IDE Superpowers

### Terminal & CLI Access

**You have terminal access!** Cloud-based agents don't. Use it:

```bash
# Development commands
npm run dev              # Start dev server, see live output
npm test                 # Run tests with detailed results
npm run build            # Build and check for issues

# Git commands
git status               # Check what changed
git diff                 # See your modifications
git log --oneline -5     # Recent commit history

# TypeScript scripts (data collection)
npx tsx scripts/collect-prolific-data.ts
npx tsx scripts/fetch-qualtrics-questions.ts
npx tsx scripts/generate-report.ts

# API testing (requires env vars)
curl -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  "https://datacenter.qualtrics.com/API/v3/surveys"
```

**When to use terminal:**

- Debug failing tests (see full error output)
- Validate builds before committing
- Run custom data collection scripts
- Test API connectivity locally

### MCP Servers (Model Context Protocol)

**Connect to external tools via MCP:**

#### 1. Qualtrics MCP Server

**What it does:** Survey management through natural language

**Setup:**

1. Copy `.vscode/mcp.json.example` to `.vscode/mcp.json`
2. Replace `<your-qualtrics-host>` with your datacenter (e.g., `by-brand.iad1.qualtrics.com`)
3. VS Code will prompt for OAuth token when first used

**What you can do:**

- "List all surveys in my account"
- "Get the definition for survey SV_abc123"
- "Copy survey SV_xyz789 to a new project called 'TABS Pilot'"
- "Export survey definition as QSF file"

**Technical details:**

- URL: `https://<datacenter>/API/mcp/survey-crud`
- Auth: OAuth 2.0 Bearer token
- Transport: HTTP with Server-Sent Events (SSE)

**Docs**: [qualtrics-mcp.md](./qualtrics-mcp.md)

#### 2. GitHub MCP Server

**What it does:** Repository management from your IDE

**Setup:** Install GitHub MCP from VS Code Marketplace

**What you can do:**

- Search code across the repository
- Create and update issues
- Manage pull requests
- Check GitHub Actions status

**Technical details:**

- URL: `https://api.githubcopilot.com/mcp/`
- Auth: VS Code GitHub integration

### API Integrations

#### Qualtrics REST API v3

**For advanced survey operations:**

| What                  | How                                               |
| --------------------- | ------------------------------------------------- |
| **Base URL**          | `https://<datacenter>.qualtrics.com/API/v3`      |
| **Authentication**    | Header: `X-API-TOKEN: <your-token>`              |
| **Client Library**    | `src/lib/qualtrics-api.ts`                        |
| **Used in workflows** | Copy surveys, update metrics, fetch questions     |
| **Documentation**     | [qualtrics-api-cheatsheet.md](./qualtrics-api-cheatsheet.md) |

**Example (terminal):**

```bash
# Set your token (don't commit this!)
export QUALTRICS_API_TOKEN="your-token-here"
export QUALTRICS_BASE_URL="https://your-dc.qualtrics.com"

# List all surveys
curl -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  "$QUALTRICS_BASE_URL/API/v3/surveys"

# Copy a survey
curl -X POST \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "X-Copy-Source: SV_sourceId123" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"My Copy"}' \
  "$QUALTRICS_BASE_URL/API/v3/surveys"
```

#### Prolific API v1

**For participant data:**

| What                  | How                                      |
| --------------------- | ---------------------------------------- |
| **Base URL**          | `https://api.prolific.com/api/v1/`       |
| **Authentication**    | Header: `Authorization: Token <token>`   |
| **Client Library**    | `src/lib/prolific-api.ts`                |
| **Used in workflows** | Collect study data weekly                |
| **Documentation**     | [PROLIFIC_INTEGRATION.md](./PROLIFIC_INTEGRATION.md) |

**Available functions:**

```typescript
import {
  getCurrentUser,
  listStudies,
  getStudy,
  listStudySubmissions,
  exportSubmissionsCSV,
} from '@/lib/prolific-api';

// Verify your token works
const user = await getCurrentUser(apiToken);

// Get all your studies
const studies = await listStudies(apiToken);

// Get specific study
const study = await getStudy(apiToken, 'study-id-123');
```

**Example (terminal):**

```bash
# Set your token
export PROLIFIC_API_TOKEN="your-token-here"

# Get current user (verify token)
curl -H "Authorization: Token $PROLIFIC_API_TOKEN" \
  "https://api.prolific.com/api/v1/users/me/"

# List all studies
curl -H "Authorization: Token $PROLIFIC_API_TOKEN" \
  "https://api.prolific.com/api/v1/studies/"
```

#### 3. Google Analytics Data API v1

**What it does:** Collect analytics and impact metrics

| What                  | How                                      |
| --------------------- | ---------------------------------------- |
| **API Type**          | Google Analytics Data API v1             |
| **SDK**               | `@google-analytics/data` NPM package     |
| **Authentication**    | Service account (email + private key)    |
| **Client Library**    | `src/lib/google-analytics.ts`            |
| **Environment**       | `google-prod` (GitHub Actions only)      |
| **Used in workflows** | Daily analytics report (00:00 UTC)       |

**Available functions:**

```typescript
import { gaClient } from '@/lib/google-analytics';

// Fetch analytics report
const response = await gaClient.runReport({
  startDate: '28daysAgo',
  endDate: 'today',
  metrics: ['activeUsers', 'sessions', 'engagementRate'],
  dimensions: ['date', 'pagePath'],
});
```

**Scripts:**
- `scripts/generate-report.ts` - Fetch GA data and update impact metrics
- `scripts/send-report-email.ts` - Email daily report to stakeholders

**Example (terminal):**

```bash
# Set service account credentials
export GA_PROPERTY_ID="properties/123456789"
export GOOGLE_SERVICE_ACCOUNT_EMAIL="service@project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Generate analytics report
npx tsx scripts/generate-report.ts

# Results saved to:
# - reports/ga-report-YYYY-MM-DD.json
# - src/data/impact.json (public metrics)
```

### Complete GitHub Environments Overview

All APIs use **GitHub environment secrets** for credential management:

| Environment        | API/Service         | Secrets/Variables | Status & Workflows                                   |
| ------------------ | ------------------- | ----------------- | ---------------------------------------------------- |
| **qualtrics-prod** | Qualtrics API v3    | 7 secrets, 4 vars | ✅ **Active** - 5 workflows:<br>• Copy surveys<br>• Update metrics<br>• Fetch questions<br>• API smoke test<br>• Prolific verification |
| **prolific-prod**  | Prolific API v1     | 2 secrets, 3 vars | ✅ **Active** - 2 workflows:<br>• Weekly data collection<br>• Prolific verification |
| **google-prod**    | Google Analytics v1 | 6 secrets         | ✅ **Active** - 1 workflow:<br>• Daily analytics report |
| **microsoft-prod** | Microsoft Forms     | 1 secret          | ⚠️ **Configured** (future integration)               |
| **stripe-prod**    | Payment processing  | 1 secret          | ⚠️ **Configured** (future integration)               |
| **github-pages**   | GitHub Pages        | Auto token        | ✅ **Active** - Site deployment                      |

**Key points:**
- ✅ **Active** environments are used in GitHub Actions workflows
- ⚠️ **Configured** environments have secrets set up for future integrations or manual operations
- ✅ All environments are **only accessible in GitHub Actions**
- ✅ Local development requires separate credential setup
- ✅ All secrets are encrypted and never exposed in logs
- ✅ Use environment variables locally, never commit tokens

### Security: Never Commit Tokens!

⚠️ **Critical security rules:**

| What                        | Where/How                                                      |
| --------------------------- | -------------------------------------------------------------- |
| **API tokens in CI**        | GitHub Secrets in environment-specific configs                 |
| **API tokens locally**      | Environment variables (never committed)                        |
| **MCP configs**             | `.vscode/mcp.json` and `mcp.json` (both gitignored)            |
| **What you can commit**     | Only `.example` template files                                 |
| **If you leak a token**     | Revoke immediately in the service (Qualtrics/Prolific/Google) |

**Safe local setup:**

```bash
# Terminal testing (session only - set all you need)
export QUALTRICS_API_TOKEN="your-qualtrics-token"
export QUALTRICS_BASE_URL="https://your-dc.qualtrics.com"
export PROLIFIC_API_TOKEN="your-prolific-token"
export GA_PROPERTY_ID="properties/123456789"
export GOOGLE_SERVICE_ACCOUNT_EMAIL="service@project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Or use MCP for Qualtrics/GitHub (recommended - more secure)
# Copy .vscode/mcp.json.example to .vscode/mcp.json
# VS Code will prompt for OAuth tokens securely when you connect
```

## Final Words

You're contributing to a **real nonprofit website** that serves an important mission. Your work matters!

Focus on:

- **Quality** - Write clean, tested code
- **Accessibility** - Make the site usable for everyone
- **Performance** - Keep it fast and responsive
- **Maintainability** - Follow conventions and document changes

**Thank you for contributing to Technology Adoption Barriers!** 🎉

Questions or feedback on these instructions? Open an issue or contact the maintainers.

---

**Quick command reference:**

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run format       # Fix formatting
npm run lint         # Check for errors
npm test             # Run unit tests
npm run build        # Build static site
npm run test:e2e     # Run E2E tests
npm run preview      # Preview production build
```

Ready to contribute? Create a branch and start coding! 🚀
