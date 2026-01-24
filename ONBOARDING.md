# Onboarding Guide for New Contributors

**Welcome to the Technology Adoption Barriers (TABS) project!** 🎉

This guide will help you get started as a contributor to the TABS website, whether you're a developer, researcher, content creator, or community member.

## Table of Contents

- [About TABS](#about-tabs)
- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [Understanding the Project](#understanding-the-project)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [API Integrations](#api-integrations)
- [Contributing Guidelines](#contributing-guidelines)
- [Testing Your Changes](#testing-your-changes)
- [Submitting Your First Pull Request](#submitting-your-first-pull-request)
- [Communication Channels](#communication-channels)
- [Resources](#resources)

## About TABS

**Technology Adoption Barriers (TABS)** is a research initiative documenting and addressing the challenges that individuals, businesses, and organizations face when adopting new technologies.

### Academic Research Foundation

TABS originated as a **Culminating Research Project (CRP) for the Smeal College of Business Doctor of Business Administration (DBA) program** at Penn State University. The project is led by **Clarke Moyer** as the primary researcher, with a CRP defense scheduled for **May 7, 2026**. A CRP is similar to a dissertation but is specific to doctoral programs (as distinct from PhD programs, which use the term "dissertation").

The DBA program at Smeal emphasizes applied research that bridges academic theory and business practice. TABS embodies this philosophy by:

- Conducting rigorous academic research on technology adoption barriers
- Translating research findings into practical resources for organizations
- Building an open-source platform that serves both academic and practitioner communities
- Demonstrating how scholarly work can create real-world impact

### Our Mission

We focus on understanding barriers including:

- Cost and financial constraints
- Complexity and technical challenges
- Lack of awareness and understanding
- Fear of change and resistance
- Compatibility and integration issues
- Infrastructure limitations
- Skill gaps and training needs
- Security concerns

### Project Scope

The TABS website serves as:

- **Research platform** - Publishing academic research on technology adoption
- **Resource hub** - Providing frameworks and tools for organizations
- **Data collection** - Gathering insights through surveys and studies
- **Community** - Connecting researchers, practitioners, and organizations
- **Academic contribution** - Supporting the Smeal DBA culminating research project

## Quick Start (5 Minutes)

Get up and running quickly with these essential steps:

### 1. Prerequisites

Ensure you have:

- **Node.js 20.x** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **A code editor** - We recommend [VS Code](https://code.visualstudio.com/)

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/clarkemoyer/technologyadoptionbarriers.org.git
cd technologyadoptionbarriers.org

# Install dependencies (takes ~15 seconds)
npm install

# Start development server (takes ~1 second)
npm run dev
```

Open http://localhost:3000 - you should see the TABS homepage! 🎉

### 3. Verify Setup

Run the test suite to ensure everything works:

```bash
# Format check
npm run format:check

# Lint
npm run lint

# Unit tests
npm test

# Build
npm run build
```

All checks should pass (16 warnings are expected and documented).

**👉 Next:** Continue reading to understand the project better, or jump to [Making Your First Change](#submitting-your-first-pull-request).

## Understanding the Project

### Technology Stack

**Frontend:**

- **Next.js 16.x** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Static Export** - `output: 'export'` for GitHub Pages

**Infrastructure:**

- **GitHub Pages** - Hosting platform
- **GitHub Actions** - CI/CD automation
- **Free for Charity** - Domain name provider

**APIs & Integrations:**

- **Qualtrics API v3** - Survey management
- **Prolific API v1** - Participant recruitment
- **Google Analytics Data API v1** - Analytics reporting
- **Microsoft Clarity** - User behavior analytics

### Site Structure

The site includes **40+ pages** organized into:

**Core Pages:**

- Homepage with hero, mission, FAQ, team sections
- TABS Home - Research initiative overview
- Get Involved - Participation opportunities
- Barriers - Technology adoption barriers
- Technology Adoption Models - Academic frameworks

**Article Series (15 articles):**

- Branch 1: The User's Journey (8 articles on individual adoption)
- Branch 2: The Organization's Playbook (7 articles on enterprise adoption)
- Bibliography - Comprehensive references

**For Organizations (5 pages):**

- Executive, Finance, Operations, Technology leaders

**Supporting Pages:**

- Start Your Journey (interactive)
- Making of TABS (behind the scenes)
- Media resources
- 7 legal and policy pages

See [README.md](./README.md#site-structure---complete-page-inventory) for complete page list.

### Architecture Overview

```
TABS Website (Static Next.js)
├── Frontend (React + TypeScript)
│   ├── 40+ pages (App Router)
│   ├── 100+ components
│   └── Responsive design (mobile-first)
│
├── APIs (External Integrations)
│   ├── Qualtrics (survey management)
│   ├── Prolific (participant recruitment)
│   └── Google Analytics (reporting)
│
├── Infrastructure
│   ├── GitHub Pages (hosting)
│   ├── GitHub Actions (CI/CD)
│   └── Free for Charity (domain)
│
└── Testing & Quality
    ├── Jest (unit tests)
    ├── Playwright (E2E tests)
    ├── jest-axe (accessibility)
    └── Lighthouse CI (performance)
```

## Development Environment Setup

### Recommended Tools

**Code Editor:**

- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - GitLens

**Terminal:**

- **Git Bash** (Windows)
- **Terminal** (macOS/Linux)
- **Windows Terminal** (Windows 11)

**Browser:**

- **Chrome** or **Edge** (DevTools support)
- Chrome extensions: React Developer Tools

### VS Code Configuration

Install recommended extensions:

```bash
# Open VS Code
code .

# VS Code will prompt to install recommended extensions
# Click "Install All" in the notification
```

### GitHub Setup

1. **Fork the repository** (if you're an external contributor)
2. **Clone your fork:**

   ```bash
   git clone https://github.com/YOUR-USERNAME/technologyadoptionbarriers.org.git
   cd technologyadoptionbarriers.org
   ```

3. **Add upstream remote:**

   ```bash
   git remote add upstream https://github.com/clarkemoyer/technologyadoptionbarriers.org.git
   ```

4. **Verify remotes:**
   ```bash
   git remote -v
   # origin    https://github.com/YOUR-USERNAME/technologyadoptionbarriers.org.git (fetch)
   # origin    https://github.com/YOUR-USERNAME/technologyadoptionbarriers.org.git (push)
   # upstream  https://github.com/clarkemoyer/technologyadoptionbarriers.org.git (fetch)
   # upstream  https://github.com/clarkemoyer/technologyadoptionbarriers.org.git (push)
   ```

### Environment Variables (Optional)

No environment variables are required for local development. The site works out of the box.

**Optional variables** (create `.env.local` if needed):

```bash
# .env.local (create if you need custom config)

# Optional: Override base path for testing
NEXT_PUBLIC_BASE_PATH=

# Optional: Set environment
NEXT_PUBLIC_SITE_ENV=development
```

## Project Structure

Understanding the project structure helps you find files quickly:

```
technologyadoptionbarriers.org/
├── src/
│   ├── app/                      # Next.js app directory (40+ pages)
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   ├── globals.css          # Global styles
│   │   ├── article-*/           # Article pages (15 articles)
│   │   ├── barriers/            # Barriers section
│   │   ├── for-organizations/   # Org resources (5 pages)
│   │   ├── making-of-tabs/      # Behind the scenes
│   │   ├── privacy-policy/      # Legal pages (7 pages)
│   │   └── ...                  # Other pages
│   │
│   ├── components/              # React components (100+)
│   │   ├── header/              # Navigation header
│   │   ├── footer/              # Site footer
│   │   ├── ui/                  # Reusable UI components
│   │   ├── cookie-consent/      # Cookie consent banner
│   │   ├── google-tag-manager/  # GTM integration
│   │   └── ...                  # Feature components
│   │
│   ├── lib/                     # Utility functions
│   │   ├── assetPath.ts         # GitHub Pages helper
│   │   ├── qualtrics-api.ts     # Qualtrics client
│   │   ├── prolific-api.ts      # Prolific client
│   │   └── google-analytics.ts  # GA client
│   │
│   └── data/                    # Static content (JSON)
│       ├── faqs/                # FAQ data
│       ├── team/                # Team members
│       ├── barriers.ts          # Barriers data
│       └── impact.json          # Impact metrics
│
├── public/                      # Static assets
│   ├── Images/                  # Images (always use assetPath())
│   ├── Svgs/                    # SVG files
│   └── ...                      # Other static files
│
├── tests/                       # Playwright E2E tests
│   ├── logo.spec.ts             # Logo visibility
│   └── github-pages.spec.ts     # Image path tests
│
├── __tests__/                   # Jest unit tests
│   ├── components/              # Component tests
│   └── lib/                     # Library tests
│
├── .github/
│   └── workflows/               # GitHub Actions (12 workflows)
│       ├── ci.yml               # CI pipeline
│       ├── deploy.yml           # Deployment
│       ├── qualtrics-*.yml      # Qualtrics workflows (6)
│       ├── prolific.yml         # Prolific data collection
│       └── ga-report.yml        # Analytics reporting
│
├── scripts/                     # Utility scripts
│   ├── generate-report.ts       # GA report generation
│   ├── send-report-email.ts     # Email delivery
│   └── ...                      # Other scripts
│
└── [config files]               # Next.js, ESLint, TypeScript, etc.
```

### Key Files to Know

| File                     | Purpose                               |
| ------------------------ | ------------------------------------- |
| `src/app/page.tsx`       | Homepage content                      |
| `src/app/layout.tsx`     | Root layout with metadata             |
| `src/components/header/` | Navigation and mobile menu            |
| `src/components/footer/` | Footer with links                     |
| `next.config.ts`         | Next.js configuration (static export) |
| `package.json`           | Dependencies and scripts              |
| `.prettierrc.json`       | Code formatting rules                 |
| `tsconfig.json`          | TypeScript configuration              |

## API Integrations

TABS integrates with three primary external APIs. Understanding these helps you work on data-driven features.

### Qualtrics API v3

**Purpose:** Survey management and data collection

**Key Features:**

- Annual survey rollover (10-year data collection plan)
- Automated survey configuration
- Question extraction and metadata
- Prolific integration setup

**Documentation:** [API Integration Guide](./API_INTEGRATION_GUIDE.md#qualtrics-api-v3)

**Workflows:**

- `qualtrics-copy-survey.yml` - Copy surveys for annual rollover
- `qualtrics-prolific-apply.yml` - Configure Prolific integration
- `qualtrics-prolific-verify.yml` - Verify integration setup

**Client Library:** `src/lib/qualtrics-api.ts`

### Prolific API v1

**Purpose:** Participant recruitment and study management

**Key Features:**

- Weekly automated data collection (Mondays 9 AM UTC)
- Study and submission management
- Participant data export (CSV)
- Statistics and approval rates

**Documentation:** [Prolific Integration Guide](./PROLIFIC_INTEGRATION.md)

**Workflows:**

- `prolific.yml` - Weekly data collection

**Client Library:** `src/lib/prolific-api.ts`

### Google Analytics Data API v1

**Purpose:** Analytics reporting and impact metrics

**Key Features:**

- Daily analytics report generation (00:00 UTC)
- Email delivery to stakeholders
- Impact metrics updates (`src/data/impact.json`)
- Public metrics display on website

**Documentation:** [API Integration Guide](./API_INTEGRATION_GUIDE.md#google-analytics-data-api-v1)

**Workflows:**

- `ga-report.yml` - Daily analytics reporting

**Client Library:** `src/lib/google-analytics.ts`

### Model Context Protocol (MCP)

**MCP servers** provide standardized interfaces for AI coding agents:

**Configured Servers:**

1. **GitHub MCP** - Repository operations, issues, PRs, workflows
2. **Qualtrics MCP** - Survey CRUD via OAuth + SSE
3. **Microsoft Learn MCP** - Official Microsoft documentation

**Documentation:** [MCP Servers Guide](./MCP_SERVERS.md)

**Note:** MCP is primarily for AI coding agents in IDEs (VS Code, Antigravity). Regular contributors don't need to configure MCP.

## Contributing Guidelines

### Code of Conduct

We follow the [Contributor Covenant 2.1](./CODE_OF_CONDUCT.md). Please read and adhere to it. Key points:

- **Be respectful** - Treat everyone with respect
- **Be inclusive** - Welcome diverse perspectives
- **Be collaborative** - Work together constructively
- **Report issues** - Contact maintainers if you see violations

### Contribution Types

We welcome contributions in several areas:

**Code:**

- Bug fixes
- Feature development
- Performance improvements
- Accessibility enhancements
- Test coverage

**Content:**

- Research articles
- Barriers documentation
- Case studies
- Resource guides

**Documentation:**

- API documentation
- Setup guides
- Tutorials
- Translations

**Design:**

- UI/UX improvements
- Accessibility
- Responsive design
- Visual assets

**Testing:**

- Unit tests
- E2E tests
- Accessibility tests
- Performance tests

### Development Workflow

1. **Find or create an issue**
   - Check [existing issues](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues)
   - Create new issue if needed
   - Comment that you're working on it

2. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make your changes**
   - Write code
   - Add/update tests
   - Update documentation

4. **Test locally**

   ```bash
   npm run format    # Auto-fix formatting
   npm run lint      # Check for errors
   npm test          # Run unit tests
   npm run build     # Build site
   npm run test:e2e  # Run E2E tests
   ```

5. **Commit with conventional commits**

   ```bash
   git add .
   git commit -m "feat: add new barrier category filter"
   # or
   git commit -m "fix: resolve mobile menu z-index issue"
   ```

   **Commit types:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Formatting (no code change)
   - `refactor:` - Code restructuring
   - `test:` - Adding tests
   - `chore:` - Maintenance

6. **Push and create PR**

   ```bash
   git push origin feat/your-feature-name
   ```

   Then create a Pull Request on GitHub.

### Code Style Guidelines

**Naming Conventions:**

- **Folders:** `kebab-case` (e.g., `for-organizations`, `article-1-1`)
- **Components:** `PascalCase` (e.g., `Header`, `FooterSection`)
- **Functions:** `camelCase` (e.g., `getData`, `formatDate`)
- **Constants:** `SCREAMING_SNAKE_CASE` (e.g., `API_BASE_URL`)

**Why kebab-case for folders?**

- SEO best practice (Google recommends hyphens in URLs)
- Better readability
- Screen reader friendly

**TypeScript:**

- Use strong typing (avoid `any`)
- Define interfaces for props
- Use type annotations

**React:**

- Functional components only
- Use hooks (useState, useEffect, etc.)
- Follow React best practices

**Tailwind CSS:**

- Mobile-first responsive design
- Use utility classes
- Extract components for repeated patterns

## Testing Your Changes

### Running Tests

**All tests:**

```bash
npm test              # Unit tests
npm run test:e2e      # E2E tests (requires build)
```

**Individual test files:**

```bash
npm test Header                    # Specific test
npm run test:e2e tests/logo.spec.ts  # Specific E2E test
```

**Watch mode (for development):**

```bash
npm run test:watch    # Unit tests re-run on changes
```

**Coverage:**

```bash
npm run test:coverage  # Generate coverage report
```

### Writing Tests

**Unit Test Example:**

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

**Accessibility Test:**

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

**E2E Test Example:**

```typescript
// tests/my-feature.spec.ts
import { test, expect } from '@playwright/test'

test('feature works correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Technology Adoption Barriers')
})
```

### Manual Testing

Before submitting PR:

1. **Visual check** - Test in browser (mobile + desktop)
2. **Responsive design** - Resize browser window
3. **Links** - Click all links to verify they work
4. **Forms** - Test any form interactions
5. **Accessibility** - Test with keyboard navigation

## Submitting Your First Pull Request

### Before Submitting

**Pre-submission checklist:**

- [ ] All tests pass (`npm test` + `npm run test:e2e`)
- [ ] Code is formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Changes are documented (README, comments, etc.)
- [ ] Commit messages follow conventional commits
- [ ] Branch is up to date with main

### Creating the PR

1. **Push your branch:**

   ```bash
   git push origin feat/your-feature-name
   ```

2. **Open GitHub** and create Pull Request

3. **Fill out PR template:**
   - **Title:** Clear, descriptive (e.g., "feat: add barrier category filter")
   - **Description:** What, why, how
   - **Screenshots:** For UI changes
   - **Issue link:** References #123
   - **Testing:** How you tested

4. **Request review** from maintainers

### PR Review Process

1. **Automated checks** run (CI/CD)
   - Format check
   - Linting
   - Unit tests
   - Build
   - E2E tests

2. **Code review** by maintainers
   - Review feedback as comments
   - Address feedback with new commits
   - Discussion in PR comments

3. **Approval** and merge
   - After all checks pass and review approved
   - Maintainer will merge
   - Your changes go live!

### After Your PR is Merged

**Celebrate!** 🎉 You've contributed to TABS!

**Next steps:**

- Delete your feature branch (optional)
- Update your local main branch
- Find another issue to work on

```bash
# Update your fork
git checkout main
git pull upstream main
git push origin main

# Delete feature branch (optional)
git branch -d feat/your-feature-name
git push origin --delete feat/your-feature-name
```

## Communication Channels

### GitHub

- **Issues:** [Report bugs, request features](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues)
- **Discussions:** [Ask questions, share ideas](https://github.com/clarkemoyer/technologyadoptionbarriers.org/discussions)
- **Pull Requests:** [Submit code changes](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pulls)

### Email

- **General:** contact@technologyadoptionbarriers.org
- **Security:** See [SECURITY.md](./SECURITY.md) for vulnerability reporting

### Response Times

- **Issues:** Usually within 48 hours
- **PRs:** Usually within 72 hours
- **Security:** Within 24 hours

## Resources

### Documentation

**Getting Started:**

- [README.md](./README.md) - Project overview
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Detailed contribution guide

**Technical:**

- [API Integration Guide](./API_INTEGRATION_GUIDE.md) - API documentation
- [TESTING.md](./TESTING.md) - Testing guide
- [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md) - Design guide
- [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md) - Naming rules

**Process:**

- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards
- [GOVERNANCE.md](./GOVERNANCE.md) - Decision-making
- [SECURITY.md](./SECURITY.md) - Security practices

### External Resources

**Next.js:**

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

**React:**

- [React Documentation](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)

**TypeScript:**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)

**Tailwind CSS:**

- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)

**Testing:**

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)

### Learning Resources

**Beginner:**

- [Next.js Learn](https://nextjs.org/learn) - Interactive tutorial
- [React Tutorial](https://react.dev/learn) - Official React tutorial
- [TypeScript for Beginners](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

**Intermediate:**

- [Next.js Blog Tutorial](https://nextjs.org/learn/basics/create-nextjs-app)
- [Advanced React Patterns](https://kentcdodds.com/blog/advanced-react-component-patterns)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

**Advanced:**

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Accessibility Guide](https://www.w3.org/WAI/WCAG21/quickref/)
- [Static Site Optimization](https://web.dev/fast/)

## Getting Help

### Common Issues

**Build fails:**

```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Tests fail:**

```bash
# Reinstall Playwright browsers
npx playwright install --with-deps chromium

# Run tests
npm run test:e2e
```

**Git issues:**

```bash
# Sync with upstream
git fetch upstream
git rebase upstream/main
```

### Where to Ask

**Technical questions:**

- GitHub Discussions (preferred)
- GitHub Issues (for bugs)
- Email (for private questions)

**Content questions:**

- GitHub Discussions
- Email

**Security questions:**

- See [SECURITY.md](./SECURITY.md)
- Email: contact@technologyadoptionbarriers.org

## Conclusion

**Thank you for your interest in contributing to TABS!** 🙏

Your contributions help us:

- Advance research on technology adoption
- Provide resources to organizations
- Build a stronger community
- Make technology more accessible

**Questions?** Don't hesitate to ask in [GitHub Discussions](https://github.com/clarkemoyer/technologyadoptionbarriers.org/discussions) or via email.

**Ready to contribute?** Check out [open issues](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues) and find one that interests you!

---

**Last Updated:** January 24, 2026  
**Version:** 1.0.0  
**Maintainer:** Clarke Moyer (contact@technologyadoptionbarriers.org)
