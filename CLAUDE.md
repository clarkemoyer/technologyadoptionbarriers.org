# Claude Agent Instructions for TABS

Welcome, Claude! This document provides specific instructions for working on the Technology Adoption Barriers (TABS) repository using Anthropic Claude in VS Code or Antigravity.

## About This Project

You're working on a **Next.js 16.0.7 + TypeScript** website for Technology Adoption Barriers, a nonprofit focused on documenting and addressing technology adoption challenges.

**Key Facts:**

- Static site export (`output: 'export'`) deployed to GitHub Pages
- Production URL: https://technologyadoptionbarriers.org
- All changes go through PR workflow (no direct commits to `main`)
- CI enforces formatting, linting, tests, and accessibility checks
- **External APIs**: Qualtrics (surveys), Prolific (participant data)
- **MCP Integration**: Qualtrics MCP and GitHub MCP available in IDE

## Your Strengths in This Context

As Claude, you excel at:

- **Deep code analysis** - Understanding complex Next.js/React patterns
- **Thoughtful refactoring** - Improving code structure while maintaining functionality
- **Comprehensive testing** - Writing thorough unit and E2E tests
- **Documentation** - Creating clear, detailed technical documentation
- **Accessibility** - Understanding WCAG guidelines and ARIA patterns

Leverage these strengths when working on TABS!

## Critical Pre-Commit Commands

**Run these in order before every commit:**

```bash
npm run format      # Auto-fix formatting (Prettier)
npm run lint        # Check for errors (some warnings OK)
npm test            # Unit tests + accessibility (jest-axe)
npm run build       # Ensure static export works
npm run test:e2e    # Playwright E2E tests
```

**If any of these fail**, fix the issues before pushing. CI will reject PRs that don't pass these checks.

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 16.0.7 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Testing**: Jest + Testing Library, Playwright, jest-axe
- **Deployment**: GitHub Pages with custom domain

### Project Structure (Simplified)

```
src/
├── app/
│   ├── layout.tsx          # Root layout (metadata, shell)
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   └── [page-name]/        # Routes (kebab-case required!)
├── components/
│   ├── header/             # Navigation
│   ├── footer/             # Footer
│   ├── ui/                 # Reusable UI components
│   └── [feature]/          # Feature-specific components
├── data/                   # JSON content (FAQs, team, etc.)
└── lib/
    └── assetPath.ts        # GitHub Pages basePath helper
```

### Naming Convention Rules

**⚠️ CRITICAL: All folders MUST use kebab-case**

✅ **Correct:**

- `src/app/privacy-policy/`
- `src/components/cookie-consent/`
- `src/app/security-acknowledgements/`

❌ **Incorrect:**

- `src/app/PrivacyPolicy/`
- `src/components/cookieConsent/`
- `src/app/SecurityAcknowledgements/`

**Why kebab-case?**

1. **SEO**: Google recommends hyphens in URLs for word separation
2. **Readability**: URLs like `/privacy-policy` are clearer than `/privacypolicy`
3. **Accessibility**: Screen readers handle hyphens better than camelCase
4. **Standard**: Industry best practice for web development

Source: [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/url-structure)

## Common Development Tasks

### 1. Adding a New Page

```typescript
// 1. Create src/app/my-new-page/page.tsx (kebab-case!)
export default function MyNewPage() {
  return (
    <main>
      <h1>My New Page</h1>
      {/* Your content */}
    </main>
  );
}

// 2. Update src/app/sitemap.ts
export default function sitemap() {
  return [
    // ... existing routes
    {
      url: 'https://technologyadoptionbarriers.org/my-new-page',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}

// 3. Add navigation link in src/components/header/index.tsx
```

### 2. Working with Images

**ALWAYS use `assetPath()` for images:**

```typescript
import { assetPath } from "@/lib/assetPath";

// ✅ Correct - works on custom domain AND GitHub Pages
<img src={assetPath("/Images/logo.png")} alt="TABS Logo" />

// ❌ Wrong - breaks on GitHub Pages
<img src="/Images/logo.png" alt="TABS Logo" />
```

**Why?** The site deploys to two locations:

- Custom domain: `technologyadoptionbarriers.org` (no basePath)
- GitHub Pages: `[org].github.io/[repo]/` (with basePath)

The `assetPath()` helper handles both automatically.

### 3. Styling Components

Use **Tailwind CSS** classes directly:

```typescript
// Mobile-first responsive design
<div className="
  px-4 py-8           // Mobile: padding
  md:px-8 md:py-12    // Tablet: larger padding
  lg:px-16 lg:py-16   // Desktop: even larger
">
  <h1 className="
    text-2xl          // Mobile: smaller text
    md:text-3xl       // Tablet: medium text
    lg:text-4xl       // Desktop: larger text
  ">
    Heading
  </h1>
</div>
```

Check `src/app/globals.css` for global styles and custom CSS variables.

### 4. Writing Tests

**Unit Tests (Jest + Testing Library):**

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import MyComponent from '@/components/MyComponent';

expect.extend(toHaveNoViolations);

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**E2E Tests (Playwright):**

```typescript
// tests/my-feature.spec.ts
import { test, expect } from '@playwright/test'

test('feature works correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Technology Adoption Barriers')
})
```

## Accessibility Requirements

The project uses **jest-axe** to enforce accessibility. Common issues and fixes:

### Issue: Missing ARIA labels

```typescript
// ❌ Fails accessibility test
<button onClick={handleClick}>
  <svg>...</svg>  {/* Icon only */}
</button>

// ✅ Passes accessibility test
<button onClick={handleClick} aria-label="Close menu">
  <svg>...</svg>
</button>
```

### Issue: Missing alt text

```typescript
// ❌ Fails
<img src={assetPath("/logo.png")} />

// ✅ Passes
<img src={assetPath("/logo.png")} alt="TABS Logo" />
```

### Issue: Non-semantic HTML

```typescript
// ❌ Avoid
<div onClick={handleClick}>Click me</div>

// ✅ Use semantic elements
<button onClick={handleClick}>Click me</button>
```

## Known Issues & Workarounds

### 1. ESLint Warnings (Expected)

You'll see these warnings - **they're acceptable**:

- `@next/next/no-img-element` (6 warnings): Using `<img>` instead of `<Image>` because static export is incompatible with Next.js image optimization
- React hooks warnings (10 warnings): Technical debt, but functionality works correctly

**Don't try to fix these** - they're documented as acceptable. Fix new errors only.

### 2. Google Fonts Network Issue

On restricted networks, `npm run build` may fail with:

```
ENOTFOUND fonts.googleapis.com
```

This is a known limitation. The font imports are in `src/lib/fonts.ts`. In restricted environments, fonts may need to be disabled.

### 3. Static Export Limitations

Because we use `output: 'export'`:

- ❌ Cannot use Next.js `<Image>` component optimization
- ❌ Cannot use server-side features (API routes, middleware)
- ✅ Must use `<img>` with `assetPath()` helper
- ✅ All rendering happens at build time

## Testing Strategy

### When to Test What

**During development:**

1. `npm run format` - Auto-fix formatting
2. `npm run lint` - Check for new errors
3. `npm test` - Run unit tests (fast feedback)

**Before committing:** 4. `npm run build` - Ensure static export works 5. `npm run test:e2e` - Full E2E validation

**GitHub Pages basePath testing:**

```bash
NEXT_PUBLIC_BASE_PATH='' npm run test:e2e
```

This tests the empty basePath scenario (custom domain deployment).

## Code Review Tips

When reviewing your own code before committing:

1. **Accessibility**: Run `npm test` - jest-axe will catch ARIA issues
2. **TypeScript**: No `any` types unless absolutely necessary
3. **Mobile-first**: Check responsive design at different breakpoints
4. **Naming**: All folders use kebab-case (not camelCase or PascalCase)
5. **Images**: All use `assetPath()` helper
6. **Consistency**: Follow existing patterns in similar components

## CI/CD Pipeline

When you push to a PR, GitHub Actions runs:

1. **Format check**: `npm run format:check` (must pass)
2. **Lint**: `npm run lint` (errors must be fixed)
3. **Unit tests**: `npm test` (including jest-axe)
4. **Build**: `npm run build` (must succeed)
5. **E2E tests**: `npm run test:e2e` (must pass)
6. **CodeQL**: Security scanning
7. **Lighthouse**: Performance monitoring

**Merge queue** is enabled - all checks must pass before merge.

## Git Workflow

### Branch Naming

```bash
git checkout -b feat/add-new-section     # New feature
git checkout -b fix/navigation-bug       # Bug fix
git checkout -b docs/update-readme       # Documentation
git checkout -b chore/update-deps        # Maintenance
```

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add contact form component"
git commit -m "fix: resolve mobile navigation overlay issue"
git commit -m "docs: update testing guide"
git commit -m "chore: update dependencies"
```

### Pull Request Process

1. Create feature branch
2. Make changes and test locally
3. Push to GitHub
4. Open PR with template from `.github/PULL_REQUEST_TEMPLATE.md`
5. Link to issue: "Closes #42"
6. Wait for CI to pass
7. Address review comments
8. Merge via merge queue

**Never commit directly to `main`** - all changes via PR.

## Performance Considerations

- **Keep bundle size minimal**: Check build output for large dependencies
- **Optimize images**: Use appropriate formats and sizes before adding
- **Lazy load when possible**: Use dynamic imports for large components
- **Monitor Lighthouse scores**: CI runs Lighthouse on every PR

## IDE-Specific Capabilities

### Terminal Access (Your Advantage!)

As an IDE-integrated agent in VS Code/Antigravity, **you have terminal/CLI access** that cloud agents don't:

**You can run commands directly:**

```bash
# Development workflow
npm run dev              # Start dev server
npm test                 # Run tests with output
npm run build            # Build and see detailed output

# Git operations
git status               # Check working tree
git diff                 # See changes
git log --oneline -10    # Recent commits

# TypeScript scripts
npx tsx scripts/collect-prolific-data.ts
npx tsx scripts/fetch-qualtrics-questions.ts

# API testing
curl -H "X-API-TOKEN: $TOKEN" \
  "https://datacenter.qualtrics.com/API/v3/surveys"
```

**Use this to your advantage:**

- Debug test failures with full output
- Validate builds before committing
- Explore git history for context
- Test API connectivity locally

### MCP (Model Context Protocol) Integration

You can connect to MCP servers for enhanced capabilities:

#### Qualtrics MCP Server

**Survey management via MCP tools:**

- **Setup**: Copy `.vscode/mcp.json.example` to `.vscode/mcp.json`
- **Host**: `https://<your-qualtrics-datacenter>/API/mcp/survey-crud`
- **Auth**: OAuth 2.0 (VS Code prompts for token)
- **Transport**: HTTP with Server-Sent Events (SSE)

**Capabilities:**

- List all surveys in account
- Get survey metadata and definitions
- Copy surveys between projects
- Export survey definitions (QSF format)
- Import surveys from QSF files

**Example use cases:**

- "Show me all surveys with 'TABS' in the name"
- "Get the definition for survey ID SV_abc123"
- "Copy survey SV_xyz789 to a new project"

**Documentation**: [qualtrics-mcp.md](./qualtrics-mcp.md)

#### GitHub MCP Server

**Repository management via MCP:**

- **Setup**: Install from VS Code MCP Marketplace
- **Host**: `https://api.githubcopilot.com/mcp/`
- **Auth**: Handled by VS Code GitHub integration

**Capabilities:**

- Search code across repositories
- Create/update issues
- Manage pull requests
- Access GitHub Actions logs

**Example use cases:**

- "Find all usages of assetPath in this repo"
- "Show recent issues labeled 'bug'"
- "Get the latest CI run status"

### External API Access

#### Qualtrics REST API v3

**For operations not covered by MCP:**

- **Base URL**: `https://<datacenter>.qualtrics.com/API/v3`
- **Auth**: `X-API-TOKEN` header
- **Client**: `src/lib/qualtrics-api.ts`

**Common operations:**

```bash
# List surveys
curl -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  "$QUALTRICS_BASE_URL/API/v3/surveys"

# Copy survey (API-supported method)
curl -X POST \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "X-Copy-Source: SV_source123" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Copied Survey"}' \
  "$QUALTRICS_BASE_URL/API/v3/surveys"
```

**Documentation**: [qualtrics-api-cheatsheet.md](./qualtrics-api-cheatsheet.md)

#### Prolific API v1

**Participant recruitment and study data:**

- **Base URL**: `https://api.prolific.com/api/v1/`
- **Auth**: `Authorization: Token <token>` header
- **Client**: `src/lib/prolific-api.ts`

**Functions in TypeScript client:**

```typescript
import { getCurrentUser, listStudies, getStudy } from '@/lib/prolific-api';

// Verify token
const user = await getCurrentUser(apiToken);

// List all studies
const studies = await listStudies(apiToken);

// Get study details
const study = await getStudy(apiToken, studyId);
```

**Documentation**: [PROLIFIC_INTEGRATION.md](./PROLIFIC_INTEGRATION.md)

#### Google Analytics Data API v1

**Analytics reporting and impact metrics:**

- **Base URL**: Google Analytics Data API (via `@google-analytics/data` SDK)
- **Auth**: Service account credentials (email + private key)
- **Client**: `src/lib/google-analytics.ts`
- **Environment**: `google-prod` (GitHub Actions)

**Functions in TypeScript client:**

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

**Workflow**: `.github/workflows/ga-report.yml` (daily at 00:00 UTC)

**Scripts**:
- `scripts/generate-report.ts` - Fetch GA data, save to `reports/` and `src/data/impact.json`
- `scripts/send-report-email.ts` - Email report to stakeholders

### GitHub Environments Summary

All external API integrations use **GitHub environment secrets** for secure credential management:

| Environment      | API                     | Secrets                                              | Workflows                          |
| ---------------- | ----------------------- | ---------------------------------------------------- | ---------------------------------- |
| `qualtrics-prod` | Qualtrics API v3        | `QUALTRICS_API_TOKEN`, `QUALTRICS_BASE_URL`          | 5 workflows (copy, metrics, fetch) |
| `prolific-prod`  | Prolific API v1         | `TABS_PROLIFIC_TOKEN`                                | 2 workflows (collect, verify)      |
| `google-prod`    | Google Analytics Data   | `GA_PROPERTY_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GMAIL_APP_PASSWORD` | 1 workflow (daily report)          |
| `github-pages`   | GitHub Pages deployment | Automatic `GITHUB_TOKEN`                             | Deploy workflow                    |

**Important**: These environments are **only accessible in GitHub Actions**. Local development requires setting up separate credentials via environment variables or MCP configurations.

### Security: API Token Management

⚠️ **Critical security rules:**

- **NEVER commit tokens**: API tokens are stored in GitHub Secrets (environment-specific)
- **Local testing**: Use environment variables or MCP OAuth (never hardcode)
- **MCP configs**: All `.vscode/mcp.json` and `mcp.json` are gitignored
- **Templates only**: Only `.example` files are committed

**Setting up local tokens (for terminal testing):**

```bash
# Option 1: Shell environment (session-only)
export QUALTRICS_API_TOKEN="your-token-here"
export QUALTRICS_BASE_URL="https://your-dc.qualtrics.com"
export PROLIFIC_API_TOKEN="your-token-here"
export GA_PROPERTY_ID="properties/123456789"
export GOOGLE_SERVICE_ACCOUNT_EMAIL="service@project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Option 2: VS Code MCP (recommended for Qualtrics/GitHub)
# Copy .vscode/mcp.json.example to .vscode/mcp.json
# VS Code will prompt for OAuth tokens when connecting
```

## Resources

### Project Documentation

- [AGENTS.md](./AGENTS.md) - General agent instructions
- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md) - Detailed naming rules
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup guide

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Your Workflow Checklist

Before starting work:

- [ ] Read the linked GitHub issue thoroughly
- [ ] Understand the existing code patterns
- [ ] Check if tests exist for the area you're modifying

While coding:

- [ ] Follow kebab-case naming for folders
- [ ] Use `assetPath()` for all images
- [ ] Write accessible HTML (ARIA labels, semantic elements)
- [ ] Follow existing patterns and style
- [ ] Add/update tests for your changes

Before committing:

- [ ] Run `npm run format`
- [ ] Run `npm run lint` (fix errors)
- [ ] Run `npm test` (all pass, including accessibility)
- [ ] Run `npm run build` (succeeds)
- [ ] Run `npm run test:e2e` (all pass)
- [ ] Review your own changes in git diff

When opening PR:

- [ ] Use PR template
- [ ] Link to issue
- [ ] Add clear description
- [ ] Request Copilot review first (if available)
- [ ] Address all CI failures

---

**You've got this, Claude!** Your analytical approach and attention to detail are perfect for this project. Focus on quality, accessibility, and following the established patterns.

Questions? Open an issue or contact the maintainers at contact@technologyadoptionbarriers.org.
