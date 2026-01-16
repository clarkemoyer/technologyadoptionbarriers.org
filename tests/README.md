# Playwright E2E Tests

This folder contains Playwright end-to-end tests for the Technology Adoption Barriers Survey (TABS) site.

## What we test

- Homepage loads and core hero content renders
- Key sections render (e.g., Statistics, Contact)
- Footer renders expected links/copyright text
- Cookie consent banner behavior
- Media (hero video) loads with expected attributes

## Specs

- `tests/logo.spec.ts` header logo + hero heading/tagline
- `tests/image-loading.spec.ts` basic image loading smoke checks
- `tests/mission-video.spec.ts` hero video presence + source
- `tests/animated-numbers.spec.ts` Statistics section smoke checks
- `tests/application-form.spec.ts` Contact section smoke checks (replaces old template application form modal)
- `tests/social-links.spec.ts` footer social link(s)
- `tests/copyright.spec.ts` footer copyright copy
- `tests/cookie-consent.spec.ts` cookie consent banner behavior

## Running locally

- `npm run build`
- `npm run preview`
- `npx playwright test`
