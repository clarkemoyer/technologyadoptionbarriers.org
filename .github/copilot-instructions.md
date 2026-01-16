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

- Global popup system is currently commented out in `src/app/layout.tsx` (PopupProvider/PopupsRootClient).
