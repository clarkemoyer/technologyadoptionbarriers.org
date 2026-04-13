# Claude Agent Instructions for TABS

Welcome, Claude! This document provides specific instructions for working on the Technology Adoption Barriers Survey (TABS) repository using Anthropic Claude in VS Code or Antigravity.

## About This Project

You're working on a **Next.js 16.0.7 + TypeScript** website for Technology Adoption Barriers, a nonprofit focused on documenting and addressing technology adoption challenges.

**Key Facts:**

- Static site export (`output: 'export'`) deployed to GitHub Pages
- Production URL: https://technologyadoptionbarriers.org
- All changes go through PR workflow (no direct commits to `main`)
- CI enforces formatting, linting, tests, and accessibility checks
- **External APIs**: Qualtrics (surveys), Prolific (participant data), Zotero (reference library)
- **MCP Integration**: Qualtrics MCP, GitHub MCP, and Zotero MCP (pyzotero) available in IDE

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
- **Language**: TypeScript (strict mode) for the website; **Python** is the primary language for analysis and operational scripts
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

scripts/
├── analysis/               # Python operational & analysis scripts (primary)
├── archive/                # Archived TS scripts replaced by Python (reference only)
└── *.ts                    # Active TS scripts (SEO, reporting, utilities)
```

### Scripts: Python vs TypeScript

**Python (`scripts/analysis/`)** is the primary language for:

- Prolific submission operations (approve, reject, message, unreject)
- Disposition triage and summary generation
- Data analysis and psychometrics

**Archived TS (`scripts/archive/`)** contains the original TypeScript implementations
that have been replaced by Python equivalents. These are kept for reference only.
See `scripts/archive/README.md` for the full mapping table.

**Active TS (`scripts/*.ts`)** remains in use for:

- SEO and analytics data collection
- Qualtrics API operations
- Report generation and email
- GitHub/Copilot review automation

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
8. **Copilot Code Review**: Automatically triggered when PR is marked ready for review

**All checks must pass and reviews must be addressed before merge.**

### Prettier Enforcement (Automated Workflows)

**Any workflow that commits files MUST run Prettier before the commit.** AI agents and GitHub Actions bypass local pre-commit hooks, so formatting must be handled explicitly.

**Use the reusable composite action** for workflows that create data-update PRs:

```yaml
# Requires actions/checkout before this step:
- uses: ./.github/actions/format-and-pr
  with:
    token: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN }}
    files: 'src/data/my-file.json'
    commit-message: 'chore: update my data'
    pr-title: 'Update my data'
    pr-body: 'Automated data update.'
    branch: chore/my-data-update
```

If you can't use the composite action, add these steps before any commit-creating action:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v6
  with:
    node-version: '20'
    cache: 'npm'
- name: Install dependencies
  run: npm ci --ignore-scripts
- name: Format files
  run: npx prettier --write <files>
```

**Safety net**: The `prettier-autofix.yml` workflow monitors CI failures and auto-pushes formatting fixes to PR branches if Prettier is the cause.

### Code Review Process

1. **Automatic trigger**: When you mark a PR as "Ready for review", Copilot automatically reviews your code
2. **Review comments**: Address all comments from automated and human reviewers
3. **Resolve threads**: Mark review comments as resolved using:
   - GitHub web UI: Click "Resolve conversation" after addressing the issue
   - GitHub CLI: `gh pr review <pr-number> --approve` or `gh pr comment <pr-number> --body "Fixed in <commit>"`
4. **Re-request review**: After making changes, request another review if needed
5. **Final approval**: Merge after all reviews are addressed and CI passes

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
6. Mark PR as "Ready for review" (triggers automatic Copilot code review)
7. Wait for CI to pass
8. Address all review comments from Copilot and human reviewers
9. Resolve review threads using GitHub UI or CLI (`gh pr review`)
10. Merge after all reviews are approved and CI passes

**Never commit directly to `main`** - all changes via PR with code review.

## Performance Considerations

- **Keep bundle size minimal**: Check build output for large dependencies
- **Optimize images**: Use appropriate formats and sizes before adding
- **Lazy load when possible**: Use dynamic imports for large components
- **Monitor Lighthouse scores**: CI runs Lighthouse on every PR

## AI Coding Agents & Concurrency

TABS operates a **multi-agent setup** with three distinct AI coding agents working in parallel across different infrastructure pools.

| Agent       | Trigger                         | Concurrency    | Pool         | Primary Role                                   |
| ----------- | ------------------------------- | -------------- | ------------ | ---------------------------------------------- |
| **Copilot** | Assign `copilot-swe-agent[bot]` | ~4             | GitHub       | Pipeline, workflow, and analysis work          |
| **Jules**   | Add `jules` label to issue      | 60 (Ultra)     | Google Cloud | Visualization, content, and frontend work      |
| **Claude**  | Direct session orchestration    | 1 per worktree | Anthropic    | Orchestration, PR management, complex analysis |

_(Note: Gemini Code Assist also runs automatically on PRs if installed, but does not count against issue-to-PR agent concurrency)._

### Parallel Development with Git Worktrees

To maximize productivity, TABS developers use the **Git Worktree** pattern. This allows you to have multiple branches checked out simultaneously in different directories, each with its own Claude Code session.

**Why use worktrees?**

- **Zero context switching**: Keep your state (terminals, logs, running servers) for multiple tasks.
- **Parallel execution**: Run a long-running build or test suite in one worktree while coding in another.
- **Claude Concurrency**: Each worktree directory can host a separate `claude` session, allowing you to parallelize your own work.

**Example: Parallel Workflow**

```bash
# From the main repo directory, create worktrees with new branches:
git worktree add -b fix/issue-123 ../tabs-bugfix main
git worktree add -b docs/update-readme ../tabs-docs main
git worktree add -b feat/new-viz ../tabs-feature main

# Now you can open 3 separate terminals/Claude sessions:
cd ../tabs-bugfix && claude
cd ../tabs-docs && claude
cd ../tabs-feature && claude
```

**Note**: Each worktree needs its own terminal and Claude session. When finished, remove them with `git worktree remove <path>`.

### Google Jules Integration

Jules is Google's autonomous coding agent powered by Gemini. We use the **Ultra tier**, which gives us up to 60 concurrent tasks.

**How to use Jules:**

1. Create a GitHub issue describing the needed change (frontend, content, or visualization).
2. Add the `jules` label to the issue.
3. The `.github/workflows/jules-on-label.yml` workflow triggers automatically.
4. Jules clones the repo to a Google Cloud VM, processes the request, and opens a PR.

**Features we use:**

- Issue-to-PR coding via the `jules` label
- Automatic issue finding and scheduled sessions
- Build and quality checks before PR creation

Jules and Copilot are complementary - Jules handles scale and frontend tasks, while Copilot handles backend automation and code review.

## IDE-Specific Capabilities

Claude Code runs in **VS Code**, **Claude Desktop app**, and **web (claude.ai/code)**. All share `~/.claude/settings.json` and memory. MCP config locations differ:

| Platform       | MCP Config Location                           |
| -------------- | --------------------------------------------- |
| VS Code        | `.vscode/mcp.json` (per-project)              |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` |
| Web            | Connectors page (cloud-managed)               |

### Terminal Access (Your Advantage!)

As an IDE-integrated agent, **you have terminal/CLI access** that cloud agents don't:

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

#### GitHub MCP Servers

Two GitHub MCP servers are available with different access levels:

| MCP                         | Tool Prefix                   | Access          | Best For                                                                   |
| --------------------------- | ----------------------------- | --------------- | -------------------------------------------------------------------------- |
| **Local npx server**        | `mcp__github__`               | Full read/write | Comments, PRs, issues, branches, push files, reviews                       |
| **Built-in Copilot plugin** | `mcp__plugin_github_github__` | Read-only       | Fast reads: PR details, file contents, search, Copilot agent delegation    |
| **`gh` CLI**                | `Bash(gh ...)`                | Full read/write | Workflow dispatch, PR state changes (draft/ready), fallback for all writes |

**Local npx server setup** (Claude Desktop - `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<token from gh auth token>"
      }
    }
  }
}
```

**Important**: The built-in Copilot plugin injects its own token that cannot be overridden. It is read-only by design. Use the local npx server or `gh` CLI for all write operations.

**Token refresh**: The `gho_` OAuth token from `gh auth token` may expire. If MCP writes start failing with 401, run `gh auth refresh` and update the config.

#### Zotero MCP Server (pyzotero)

**Reference library management via MCP tools:**

- **Package**: `pyzotero[mcp]` (v1.11.0) - Python wrapper for the Zotero API
- **Setup**: `uvx --from "pyzotero[mcp]==1.11.0" pyzotero-mcp` (stdio transport)
- **Auth**: Connects to local Zotero desktop (localhost:23119), no API key needed
- **User ID**: Set `ZOTERO_USER_ID` to your Zotero account's user ID (e.g., `export ZOTERO_USER_ID="<your-zotero-user-id>"`)

**Zotero Library Tools (6):**

- `search(query, fulltext, itemtype, collection, tag)` - Search library by content, type, or tag
- `get_item(key)` - Retrieve a single item by key
- `get_children(key)` - Get child items (attachments, notes)
- `list_collections(limit)` - List all collections
- `list_tags(collection)` - List tags, optionally filtered by collection
- `get_fulltext(key)` - Extract full-text content from PDFs

**Semantic Scholar Tools (4):**

- `find_related(doi)` - Find semantically similar papers
- `get_citations(doi)` - Papers that cite a given paper
- `get_references(doi)` - Papers referenced by a given paper
- `search_semantic_scholar(query)` - Cross-database search with library cross-check

**Configuration locations:**

| Platform       | Config File                                   |
| -------------- | --------------------------------------------- |
| VS Code        | `.vscode/mcp.json` (type: stdio)              |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` |
| Claude Code    | Direct Python access via `pyzotero` library   |

**Direct Python access (Claude Code):**

```python
from pyzotero import zotero
zot = zotero.Zotero(0, 'user')
zot.endpoint = 'http://localhost:23119/api'
items = zot.top(limit=10)
collections = zot.collections_top()
```

**Library stats**: 3,368 items, 199 collections, 40 item types

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
import { getCurrentUser, listStudies, getStudy } from '@/lib/prolific-api'

// Verify token
const user = await getCurrentUser(apiToken)

// List all studies
const studies = await listStudies(apiToken)

// Get study details
const study = await getStudy(apiToken, studyId)
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
import { gaClient } from '@/lib/google-analytics'

// Fetch analytics report
const response = await gaClient.runReport({
  startDate: '28daysAgo',
  endDate: 'today',
  metrics: ['activeUsers', 'sessions', 'engagementRate'],
  dimensions: ['date', 'pagePath'],
})
```

**Workflow**: `.github/workflows/ga-report.yml` (daily at 00:00 UTC)

**Scripts**:

- `scripts/generate-report.ts` - Fetch GA data, save to `reports/` and `src/data/impact.json`
- `scripts/send-report-email.ts` - Email report to stakeholders

#### Google Search Console API v1

**SEO benchmarking and keyword transparency:**

- **Base URL**: Google Search Console API (via `googleapis` SDK)
- **Auth**: Service account credentials (email + private key, shared with GA4)
- **Environment**: `google-prod` (GitHub Actions)
- **Workflow**: `.github/workflows/seo-dashboard-sync.yml` (daily at 01:00 UTC)

**Scripts**:

- `scripts/update-seo-dashboard-sync.ts` - Fetch GSC + GA4 data and flag regressions

#### Zotero Web API v3

**Reference library management - vetted sources of truth for the CRP:**

- **Base URL**: `https://api.zotero.org`
- **Auth**: `Zotero-API-Key` header (or local API at `localhost:23119` - no key needed)
- **Client**: `pyzotero` Python library (v1.11.0)
- **Environment**: `zotero-prod` (GitHub Actions)
- **User ID**: Set via `ZOTERO_USER_ID` environment variable
- **Library**: 3,368 items, 199 collections

**Python usage:**

```python
import os
from pyzotero import zotero

# Cloud API (CI/GitHub Actions)
zot = zotero.Zotero(int(os.environ['ZOTERO_USER_ID']), 'user', os.environ['ZOTERO_API_KEY'])

# Local API (development - no key needed)
zot = zotero.Zotero(0, 'user')
zot.endpoint = 'http://localhost:23119/api'

# Common operations
items = zot.top(limit=10)                    # Top-level items
results = zot.items(q='technology adoption') # Search
colls = zot.all_collections()                # All collections
children = zot.children(item_key)            # Attachments/notes
zot.dump(attachment_key, path='./downloads') # Download PDF
```

### GitHub Environments Summary

All external API integrations use **GitHub environment secrets** for secure credential management:

| Environment      | API/Service             | Secrets/Variables | Status                     |
| ---------------- | ----------------------- | ----------------- | -------------------------- |
| `qualtrics-prod` | Qualtrics API v3        | 6 secrets, 5 vars | ✅ Active (5 workflows)    |
| `prolific-prod`  | Prolific API v1         | 2 secrets, 3 vars | ✅ Active (2 workflows)    |
| `google-prod`    | Google Analytics & SEO  | 6 secrets         | ✅ Active (2 workflows)    |
| `zotero-prod`    | Zotero Web API v3       | 1 secret, 3 vars  | ✅ Active (2 workflows)    |
| `microsoft-prod` | Microsoft Forms         | 1 secret          | ⚠️ Configured (future use) |
| `stripe-prod`    | Payment processing      | 1 secret          | ⚠️ Configured (future use) |
| `github-pages`   | GitHub Pages deployment | Auto token        | ✅ Active (deployment)     |

**Important**: Active environments are used in GitHub Actions workflows. Configured environments have secrets set up for future integrations or manual operations. All environments are **only accessible in GitHub Actions**. Local development requires setting up separate credentials via environment variables or MCP configurations.

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
export ZOTERO_API_KEY="your-zotero-api-key"
export ZOTERO_USER_ID="<your-zotero-user-id>"
export ZOTERO_BASE_URL="https://api.zotero.org"

# Option 2: VS Code MCP (recommended for Qualtrics/GitHub/Zotero)
# Copy .vscode/mcp.json.example to .vscode/mcp.json
# VS Code will prompt for OAuth tokens when connecting to Qualtrics/GitHub MCPs
```

## Daily Pipeline Architecture

The unified `daily-pipeline.yml` chains analysis and operations into a single workflow (replaces the separate `analysis-pipeline.yml` and `daily-disposition-processing.yml`):

```
Phase 1: Fetch Prolific Data          (prolific-prod, ~10s)
    |
Phase 2: Export, Enrich & Analyze     (qualtrics-prod, ~60s)
    |         7 steps: export -> enrich -> audit -> de-identify
    |                  -> descriptive -> advanced -> psychometrics -> quality
    |
    +---> Phase 3a: Auto-Approve CLEAN    (prolific-prod)
    +---> Phase 3b: Message FLAGs         (prolific-prod, 9 dispositions, sequential)
    +---> Phase 3c: Generate Dashboard    (prolific-prod, after 3a)
    |
Phase 4: Commit Results               (copilot env, format-and-pr action)
    |
Phase 5: Daily Report Issue           (always runs, creates GitHub issue)
```

**Schedule**: Daily at 09:00 UTC (5am ET) via cron, plus `workflow_dispatch`.

**Old workflows**: `analysis-pipeline.yml` and `daily-disposition-processing.yml` have schedule triggers removed and are marked REPLACED. They are kept for manual dispatch and fallback.

**Artifact flow**: Disposition CSV passes between phases via GitHub Actions artifacts (1-day retention). Analysis JSON artifacts have 7-day retention.

## Copilot Review Cycle

Automated multi-round code review via `copilot-review-cycle.yml` and `scripts/copilot-review-cycle.ts`.

**Trigger and monitor:**

```bash
# 1. Mark PR ready for review (if draft)
gh pr ready <PR#> --repo clarkemoyer/technologyadoptionbarriers.org

# 2. Trigger review cycle (up to 7 rounds)
gh workflow run copilot-review-cycle.yml \
  --repo clarkemoyer/technologyadoptionbarriers.org \
  --field pr_number=<PR#> --field round=1 --field max_rounds=7

# 3. Monitor in background (notifies on completion)
gh run watch <RUN_ID> --repo clarkemoyer/technologyadoptionbarriers.org --exit-status
```

**How it works (per round):**

1. Validate PR is open and not draft
2. Request Copilot review (API call, falls back to `@copilot review` comment)
3. Poll for review arrival (20s intervals, 15min timeout)
4. If 0 comments: post "Passed" comment, done
5. If comments found: create fix issue assigned to Copilot coding agent
6. Wait for fixes (direct push or sub-PR auto-merge, 30s intervals, 20min timeout)
7. Dispatch next round automatically
8. Repeat until clean or max rounds reached

**Timeouts**: Review polling 15min, fix waiting 20min, API retries 3x with exponential backoff.

**Retry on timeout**: If fixes aren't pushed within 20min, the script re-requests the fix and dispatches the next round anyway (instead of dying). The next round's review will catch whether comments were addressed.

### Automated Chain: Issue → Agent → Review → Human

When you assign a GitHub issue to the Copilot coding agent, the full chain runs hands-off:

```
1. Assign issue to copilot-swe-agent[bot]
2. Copilot agent works autonomously (creates copilot/* branch)
3. Agent opens draft PR [WIP]
4. Agent finishes → marks PR ready for review
5. auto-review-on-ready.yml fires (lightweight, no environment gate)
6. Dispatches copilot-review-cycle.yml via workflow_dispatch
7. Review cycle runs 1-7 rounds: review → fix → re-review
8. Posts consolidated round history table when clean
9. Human reviews final PR
```

**Key**: `auto-review-on-ready.yml` uses only `GITHUB_TOKEN` (no environment secrets), so it runs immediately for bot-created PRs without the `action_required` approval gate.

**Assign via CLI**:

```bash
# Assign Copilot to an issue
gh api repos/clarkemoyer/technologyadoptionbarriers.org/issues/<ISSUE#> \
  -X PATCH -f "assignees[]=copilot-swe-agent[bot]"

# Or use gh agent-task (gh v2.89+)
gh agent-task create  # from within the repo directory

# Monitor all agent tasks
gh agent-task list
```

## Privacy & Data Flow

Pipeline data has strict PII boundaries:

| Data                        | Contains PIDs?             | Committed to Repo?   | Retention         |
| --------------------------- | -------------------------- | -------------------- | ----------------- |
| `sensitivity-analysis.json` | No (aggregate stats)       | Yes                  | Permanent         |
| `data-audit.json`           | No (aggregate counts)      | Yes                  | Permanent         |
| `disposition-summary.json`  | No (aggregate counts)      | Yes                  | Permanent         |
| Disposition CSV             | Yes (PROLIFIC_PID)         | No (artifact only)   | 1 day             |
| Qualtrics raw CSV           | Yes (PII fields)           | No (stays on runner) | Ephemeral         |
| Prolific demographics       | Yes (per-participant)      | No (in-memory join)  | Ephemeral         |
| Step summaries              | No (aggregate counts)      | No (Actions UI)      | Workflow lifetime |
| Workflow logs               | Yes (PIDs in debug output) | No (Actions UI)      | 90 days           |

**Rules**:

- Never commit PROLIFIC_PID or participant-level data to the repository
- Step summaries use aggregate counts only (no PID tables)
- De-identified public dataset excludes all direct identifiers
- Raw demographic CSVs exist only in `${{ runner.temp }}` (ephemeral workspace)

## Workflow Dispatch Quick Reference

All workflows support `workflow_dispatch` for manual triggering:

| Workflow                           | Command                                                           | Purpose                                     |
| ---------------------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| `daily-pipeline.yml`               | `gh workflow run daily-pipeline.yml`                              | Full daily pipeline (analysis + operations) |
| `analysis-pipeline.yml`            | `gh workflow run analysis-pipeline.yml --ref <branch>`            | Analysis only (REPLACED, kept for manual)   |
| `daily-disposition-processing.yml` | `gh workflow run daily-disposition-processing.yml --ref <branch>` | Operations only (REPLACED, kept for manual) |
| `copilot-review-cycle.yml`         | `gh workflow run copilot-review-cycle.yml --field pr_number=X`    | Multi-round Copilot review                  |
| `qualtrics-api-smoke.yml`          | `gh workflow run qualtrics-api-smoke.yml`                         | Qualtrics API connectivity test             |
| `prolific-approve-submissions.yml` | `gh workflow run prolific-approve-submissions.yml`                | Manual approve CLEAN                        |
| `prolific-message-flagged.yml`     | `gh workflow run prolific-message-flagged.yml`                    | Manual message FLAGs                        |
| `prolific-reject-auto-exclude.yml` | `gh workflow run prolific-reject-auto-exclude.yml`                | Manual reject (requires confirmation)       |
| `validate-analysis.yml`            | `gh workflow run validate-analysis.yml`                           | Run Python analysis tests                   |
| `ci.yml`                           | `gh workflow run ci.yml --ref <branch>`                           | CI (format, lint, test, build, E2E)         |
| `jules-on-label.yml`               | `gh workflow run jules-on-label.yml` (or add `jules` label)       | Invoke Jules coding agent for an issue      |

**Tip**: Use `--ref <branch>` to test workflow changes on a PR branch before merging.

## Python Analysis Scripts

All Python scripts live in `scripts/analysis/`. They are the primary language for pipeline operations.

| Script                            | Purpose                                         | Called By              |
| --------------------------------- | ----------------------------------------------- | ---------------------- |
| `fetch_prolific_data.py`          | Fetch auth checks + submission statuses         | Pipeline Phase 1       |
| `export_qualtrics.py`             | Export survey responses to CSV                  | Pipeline Phase 2       |
| `enrich_qualtrics_csv.py`         | Join Qualtrics CSV with Prolific data           | Pipeline Phase 2       |
| `tabs_v2_data_audit.py`           | Disposition waterfall + CSV output              | Pipeline Phase 2       |
| `tabs_v2_analysis.py`             | Descriptive stats, sensitivity, inferential     | Pipeline Phase 2       |
| `tabs_v2_advanced.py`             | PCA, regression, ANOVA                          | Pipeline Phase 2       |
| `tabs_v2_psychometrics.py`        | KMO, HTMT, Cronbach's alpha, reliability        | Pipeline Phase 2       |
| `tabs_v2_quality_audit.py`        | Outlier detection, common method variance       | Pipeline Phase 2       |
| `approve_submissions.py`          | Bulk approve CLEAN on Prolific                  | Pipeline Phase 3a      |
| `message_flagged.py`              | Send personalized messages to FLAG participants | Pipeline Phase 3b      |
| `generate_disposition_summary.py` | Dashboard JSON from live Prolific + CSV         | Pipeline Phase 3c      |
| `disposition_triage.py`           | Standalone triage (fallback for operations)     | Disposition processing |
| `reject_auto_exclude.py`          | Reject AUTO-EXCLUDE participants                | Manual workflow only   |
| `reject_failed_iri.py`            | Reject failed IRI participants                  | Manual workflow only   |
| `tabs_api.py`                     | Shared API client (Qualtrics + Prolific)        | All scripts            |
| `prolific_tools.py`               | Prolific API utilities                          | All Prolific scripts   |

**Shared constants**: `tabs_v2_constants.json` (survey block definitions, item counts).

**Tests**: `scripts/analysis/tests/` contains Python unit tests. Run with `python -m pytest scripts/analysis/tests/`.

## Custom Agents

Claude Code agents are defined in `.claude/agents/` (gitignored - local only). They provide specialized behavior invoked automatically or explicitly.

### TABS Repo Agents

| Agent                  | Purpose                                                            | Model  | Tools                        |
| ---------------------- | ------------------------------------------------------------------ | ------ | ---------------------------- |
| `pipeline-validator`   | Check workflow runs, data freshness, production incidents          | Sonnet | Bash, Grep, Read, Glob       |
| `data-quality-checker` | Audit committed JSON for PII, schema consistency, count mismatches | Sonnet | Read, Grep, Glob (read-only) |
| `pr-manager`           | PR status, CI, reviews, merge readiness, trigger review cycles     | Sonnet | Bash, Grep, Read             |

### Global Agents (`~/.claude/agents/`)

| Agent                  | Purpose                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| `copilot-review-cycle` | Full review cycle - request review, read comments, fix code, commit, repeat |
| `pr-reviewer`          | FFC-specific PR review checklist (naming, security, a11y, static export)    |

**Invoke**: Claude auto-selects agents based on task description. You can also say "use the pipeline-validator agent" explicitly.

## Scheduled Tasks

Claude Code Desktop supports scheduled tasks that run automatically.

### Active Tasks

| Task             | Schedule        | Purpose                                                                               |
| ---------------- | --------------- | ------------------------------------------------------------------------------------- |
| `tabs-pr-triage` | Weekdays 9am ET | Morning briefing: open PRs, pipeline health, data freshness, incidents, review cycles |

**Manage**: Sidebar → Scheduled → click task to edit, run now, or disable.

**Create new tasks**: Via CLI `/schedule` or `mcp__scheduled-tasks__create_scheduled_task`.

Tasks run in this Claude Code session and auto-expire after 7 days. Use cloud triggers for persistent automation.

## Hooks

Project-level hooks in `.claude/settings.json`:

### Active Hooks

| Event         | Matcher       | Action                            |
| ------------- | ------------- | --------------------------------- |
| `PostToolUse` | `Write\|Edit` | Auto-run Prettier on edited files |

Hooks run automatically - no approval needed. They ensure formatting compliance without manual `npm run format`.

### Available Hook Events

| Event         | When                    | Use For                               |
| ------------- | ----------------------- | ------------------------------------- |
| `PostToolUse` | After any tool succeeds | Auto-format, auto-lint, notifications |
| `PreToolUse`  | Before a tool runs      | Block dangerous commands              |
| `Stop`        | When Claude finishes    | Verify tests pass before stopping     |

## Permission Model

Claude Code operates under a tiered permission system configured in `~/.claude/settings.json`.

### Denied (43 rules) - blocked entirely

- Git destructive: force push, reset --hard, clean, filter-branch
- Secret leakage: any bash with API_TOKEN, SECRET, PRIVATE_KEY, PASSWORD
- Remote code execution: curl\|bash, wget\|sh
- Filesystem: rm -rf
- Cloudflare deletions: D1, R2, KV, Hyperdrive
- GitHub merge via MCP (forces human approval)
- Calendar event deletion

### Prompts (18 tools) - requires approval each time

- Computer Use: clicks, typing, key presses, drag, clipboard write, open app
- Chrome: form fills, JS execution, file upload, click actions

### Auto-allowed (500+ tools) - runs without prompting

- All GitHub MCP read/write (local npx server)
- All Cloudflare create/read/update (NOT delete)
- Gmail drafts, Calendar create/update
- All Canva, Playwright, Preview operations
- All git and gh CLI operations (except destructive)
- All web search and fetch

**Safety principle**: Anything that permanently destroys data is either denied or requires per-use approval. Everything else is auto-allowed for productivity.

## Dependency Provenance

**Rule**: Only adopt from official sources or well-audited community projects. Our Python scripts (`scripts/analysis/`) are the safest API layer for Prolific and Qualtrics — neither company provides official SDKs or MCP servers.

### Dependency Risk Chart

_(Metrics snapshot as of April 2026. See tracking [issue #783](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/783) for the original source.)_

<<<<<<< HEAD

#### MCP Servers

| Dependency                                                    | Publisher              | Official?    | Stars        | Last Activity | Risk                                          |
| ------------------------------------------------------------- | ---------------------- | ------------ | ------------ | ------------- | --------------------------------------------- |
| GitHub MCP (`github/github-mcp-server`)                       | GitHub, Inc.           | **Yes**      | 28,565       | Mar 2026      | **Low**                                       |
| Cloudflare MCP (`cloudflare/mcp-server-cloudflare`)           | Cloudflare             | **Yes**      | 3,586        | Mar 2026      | **Low**                                       |
| Cloudflare Code Mode (`cloudflare/mcp`)                       | Cloudflare             | **Yes**      | 318          | Apr 2026      | **Low** (new)                                 |
| Google Analytics MCP (`googleanalytics/google-analytics-mcp`) | Google                 | **Yes**      | 1,734        | Mar 2026      | **Low**                                       |
| Microsoft Learn MCP (`MicrosoftDocs/mcp`)                     | Microsoft              | **Yes**      | 1,520        | Apr 2026      | **Low**                                       |
| `@modelcontextprotocol/server-github` (npm)                   | Anthropic (deprecated) | Was official | 83K monorepo | Feb 2026      | **Medium** -- deprecated, migrate             |
| Google Search Console (`AminForou/mcp-gsc`)                   | Community              | No           | 616          | Apr 2026      | **Medium**                                    |
| Google Search Console (`ahonn/mcp-server-gsc`)                | Community              | No           | 199          | Feb 2026      | **Medium**                                    |
| Qualtrics MCP (`yrvelez/qualtrics-mcp-server`)                | Community (academic)   | No           | 17           | Mar 2026      | **High** -- 3 contributors, single maintainer |
| R Statistics (`finite-sample/rmcp`)                           | Community              | No           | 201          | Dec 2025      | **High** -- stale 4+ months, 2 contributors   |
| Prolific MCP (`SeanAlexanderHarris/prolific-mcp`)             | **MISSING**            | No           | N/A          | N/A           | **CRITICAL** -- repo does not exist on GitHub |
| Qualtrics/SAP Official MCP                                    | Qualtrics/SAP          | N/A          | N/A          | N/A           | **Monitor** -- SAP is AAIF member             |
| Prolific Official MCP                                         | Prolific               | N/A          | N/A          | N/A           | **Monitor** -- None exists                    |

#### npm Packages and GitHub Actions

| Dependency                           | Publisher | Official? | Stars | Last Release | Risk                                          |
| ------------------------------------ | --------- | --------- | ----- | ------------ | --------------------------------------------- |
| `@google-analytics/data`             | Google    | **Yes**   | --    | Oct 2025     | **Low**                                       |
| `googleapis` (Search Console)        | Google    | **Yes**   | --    | Feb 2026     | **Low**                                       |
| `actions/upload-artifact` v7         | GitHub    | **Yes**   | 4,014 | Feb 2026     | **Low**                                       |
| `actions/download-artifact` v8       | GitHub    | **Yes**   | 1,810 | Mar 2026     | **Low**                                       |
| `peter-evans/create-pull-request` v8 | Community | No        | 2,731 | Jan 2026     | **Low** -- extremely mature, 30+ contributors |

#### API Clients (REST, no SDK)

_Note: Python scripts in scripts/analysis/ are functional -- no urgency._

| API              | Provider      | Official SDK?                   | Our Client                                                  | Risk                                    |
| ---------------- | ------------- | ------------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| Prolific API v1  | Prolific      | **No official SDK** (REST only) | `scripts/analysis/tabs_api.py` + `src/lib/prolific-api.ts`  | **Medium** -- custom client, API stable |
| Qualtrics API v3 | Qualtrics/SAP | **No official SDK** (REST only) | `scripts/analysis/tabs_api.py` + `src/lib/qualtrics-api.ts` | **Medium** -- custom client, API stable |

**Rule**: Prefer official sources. Our Python scripts (`scripts/analysis/`) are the safest API layer for Prolific and Qualtrics - neither company provides official SDKs or MCP servers.

## Resources

### Making of TABS Documentation

The live website documents this infrastructure at `/making-of-tabs/`:

- `/making-of-tabs/ai-assisted-development` - How AI agents build and maintain the site
- `/making-of-tabs/development-workflow` - CI/CD pipeline, merge queue, automated testing
- `/making-of-tabs/integrations/` - Cloudflare, GitHub, Google Analytics, Prolific, Qualtrics
- `/making-of-tabs/data-analysis` - Analysis pipeline, psychometrics, quality audits
- `/making-of-tabs/reproducible-analysis` - Reproducibility documentation

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
