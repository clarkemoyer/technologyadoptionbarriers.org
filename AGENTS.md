# Agent Instructions for Technology Adoption Barriers (TABS)

This document provides instructions for IDE-integrated AI coding agents working on the Technology Adoption Barriers repository.

## Quick Reference

- **Project**: Next.js 16.0.7 + TypeScript, statically exported (`output: 'export'`)
- **Framework**: Next.js App Router with static export for GitHub Pages
- **Languages**: TypeScript, React, Tailwind CSS
- **Testing**: Jest (unit tests), Playwright (E2E), jest-axe (accessibility)
- **CI/CD**: GitHub Actions with merge queue
- **Deployment**: GitHub Pages (custom domain: technologyadoptionbarriers.org)

## Development Workflow

### Issue → PR → Merge Process

1. **Always start from a GitHub Issue** - Never commit directly to `main`
2. **Create a branch**: `git checkout -b type/descriptive-name` (e.g., `feat/add-section`, `fix/navigation-bug`)
3. **Make focused changes** - Keep PRs small and targeted
4. **Link to issue** - Reference the issue in PR description (e.g., "Closes #42")
5. **All commits via PR merge** - Merge queue is enabled

### Pre-Commit Checklist (Run in Order)

```bash
npm run format      # Fix formatting (CI enforces this)
npm run lint        # Fix errors; warnings are acceptable
npm test            # Run Jest unit tests + accessibility checks
npm run build       # Ensure static export succeeds
npm run test:e2e    # Run Playwright E2E tests
```

**CRITICAL**: Always run these commands before pushing to avoid CI failures.

## Architecture Overview

### Key Technologies

- **Next.js App Router** with static export (`output: 'export'`)
- **TypeScript** with strict type checking
- **Tailwind CSS** for styling
- **React 19** (latest features)
- **Jest + Testing Library** for unit tests
- **Playwright** for E2E testing
- **jest-axe** for accessibility validation

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage entry point
│   ├── layout.tsx         # Root layout (metadata, providers)
│   ├── globals.css        # Global styles
│   └── [route-name]/      # Page routes (kebab-case required)
├── components/            # UI components (kebab-case naming)
├── data/                  # Static JSON content
└── lib/                   # Utility functions
    └── assetPath.ts      # GitHub Pages basePath helper
```

### Naming Conventions (REQUIRED)

**ALL folders MUST use kebab-case (lowercase with hyphens)**:

- ✅ `cookie-policy/`, `privacy-policy/`, `home-page/`
- ❌ `CookiePolicy/`, `privacyPolicy/`, `HomePage/`

**Why**: SEO best practice (Google recommends hyphens in URLs), readability, accessibility.

Source: [Google Search Central - URL Structure](https://developers.google.com/search/docs/crawling-indexing/url-structure)

## Common Tasks

### Adding New Pages

1. Create folder in `src/app/[page-name]/` (kebab-case required)
2. Add `page.tsx` with React component
3. Update sitemap in `src/app/sitemap.ts`
4. Update navigation in `src/components/header/index.tsx`

### Working with Images

**ALWAYS use `assetPath()` helper** for images that need to work on both custom domain and GitHub Pages:

```typescript
import { assetPath } from "@/lib/assetPath";

<img src={assetPath("/Images/logo.png")} alt="TABS Logo" />
```

**Why**: Custom domain uses `/logo.png`, GitHub Pages uses `/<repo-name>/logo.png`

### Styling Guidelines

- Use **Tailwind CSS** classes directly in components
- Follow existing patterns for responsive design (mobile-first)
- Check `src/app/globals.css` for global styles
- Test mobile and desktop layouts

## Testing Requirements

### Unit Tests (Jest)

```bash
npm test                    # Run all unit tests
npm test -- --coverage      # With coverage report
```

- Location: `__tests__/` directory
- Includes accessibility checks with `jest-axe`
- ARIA/accessibility issues will fail tests

### E2E Tests (Playwright)

```bash
npm run build              # Build first (required)
npm run test:e2e           # Run E2E tests
npm run test:headed        # Run with visible browser
npm run test:ui            # Interactive UI mode
```

- Location: `tests/` directory
- Tests run against production build (`npm run preview`)
- Critical paths: logo rendering, navigation, image loading

### Accessibility Testing

- **jest-axe** runs in unit tests - catches ARIA/role issues
- Common fixes needed:
  - Add `aria-label` to icon-only buttons
  - Ensure proper `role` attributes on interactive elements
  - Add descriptive `alt` text to images
  - Verify keyboard navigation works

## Code Quality Standards

### Linting

```bash
npm run lint               # Check for errors
```

**Expected warnings (acceptable):**

- `@next/next/no-img-element` (6 warnings) - Using `<img>` instead of `<Image>` due to static export
- React hooks warnings (10 warnings) - Technical debt, works correctly

**Action required**: Fix new errors; don't introduce new warnings.

### Formatting

```bash
npm run format             # Auto-fix formatting
npm run format:check       # Check only (used in CI)
```

CI enforces `format:check` - always run `npm run format` before pushing.

## GitHub Pages Deployment

### Dual Deployment Setup

- **Custom domain**: https://technologyadoptionbarriers.org (no basePath)
- **GitHub Pages**: https://[org].github.io/[repo]/ (with basePath)

### BasePath Handling

The site uses `NEXT_PUBLIC_BASE_PATH` environment variable:

- **Production**: Set in GitHub Actions workflow
- **Local testing**: `NEXT_PUBLIC_BASE_PATH='' npm run test:e2e`
- **Images**: Always use `assetPath()` helper (see above)

### Deployment Workflow

Automatic deployment on push to `main` via `.github/workflows/deploy.yml`:

1. Install dependencies (`npm ci`)
2. Set `NEXT_PUBLIC_BASE_PATH` for GitHub Pages
3. Build static site (`npm run build`)
4. Run Playwright tests
5. Deploy from `./out` directory

## Known Issues & Constraints

### Google Fonts Build Limitation

- **Issue**: `npm run build` may fail with "ENOTFOUND fonts.googleapis.com" on restricted networks
- **Files**: Font imports in `src/lib/fonts.ts`
- **Impact**: Fonts may need to be disabled in restricted environments

### Static Export Limitations

- Cannot use Next.js Image Optimization (incompatible with `output: 'export'`)
- Use `<img>` tags with `assetPath()` helper instead
- ESLint warnings about `no-img-element` are expected

## Security & Best Practices

### Security Scanning

- CodeQL runs on all PRs
- Dependabot monitors dependencies
- Address security issues immediately

### Accessibility (A11y)

- All interactive elements need keyboard support
- ARIA labels required for icon-only buttons
- Color contrast must meet WCAG AA standards
- Test with screen readers when possible

### Performance

- Lighthouse CI runs on PRs
- Keep bundle sizes minimal
- Optimize images before adding
- Use lazy loading where appropriate

## Communication & Support

- **Issues**: Use GitHub issue templates in `.github/ISSUE_TEMPLATE/`
- **PRs**: Follow `.github/PULL_REQUEST_TEMPLATE.md`
- **Contact**: contact@technologyadoptionbarriers.org
- **Documentation**: See README.md and linked guides

## Additional Resources

- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md) - Detailed naming rules
- [COPILOT_AUTOFIX_GUIDE.md](./COPILOT_AUTOFIX_GUIDE.md) - GitHub Copilot review process
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup guide

## Tips for Effective Development

1. **Read existing code first** - Understand patterns before making changes
2. **Test locally** - Always run the full pre-commit checklist
3. **Keep changes minimal** - Small PRs are easier to review
4. **Follow existing patterns** - Consistency matters
5. **Ask questions** - Open an issue if you're unsure
6. **Document changes** - Update relevant docs when changing behavior
7. **Accessibility matters** - Test with keyboard navigation
8. **Mobile-first** - Always check responsive layouts

---

**Remember**: This is a production site serving a real organization. Quality, accessibility, and user experience are paramount.
