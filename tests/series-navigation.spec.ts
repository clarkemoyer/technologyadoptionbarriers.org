import { test, expect, type Page } from '@playwright/test'
import { technologyAdoptionModelsSeries } from '../src/data/technology-adoption-models-series'
import { escapeRegExp } from './utils/escape-regexp'

/**
 * Technology Adoption Models Series Navigation Tests
 *
 * These tests verify:
 * 1. Desktop sidebar shows Models accordion groups
 * 2. Mobile accordion navigation works correctly
 * 3. All series pages load with correct H1 titles
 * 4. Placeholder pages display "Coming soon"
 * 5. In-page series navigation renders correctly on mobile and desktop
 */

test.describe('Series Navigation - Desktop Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  test('should show Models accordion groups in desktop sidebar', async ({ page }) => {
    // Models top-level item is now a link (it has an href); click it to navigate
    const sidebar = page.getByRole('complementary', { name: /site navigation/i })
    const modelsLink = sidebar.getByRole('link', { name: /^Models$/i })
    await expect(modelsLink).toBeVisible({ timeout: 15000 })
    await modelsLink.click()

    // After navigating to the models landing page the sidebar auto-expands Models groups
    const seriesOverview = page.getByRole('button', { name: /Series Overview/i })
    await expect(seriesOverview).toBeVisible({ timeout: 10000 })

    // Verify branch accordion groups appear (data-driven)
    const branch1ShortTitle = technologyAdoptionModelsSeries.branches[0].title.split('–')[0].trim()
    const branch1Button = page.getByRole('button', {
      name: new RegExp(escapeRegExp(branch1ShortTitle), 'i'),
    })
    await expect(branch1Button).toBeVisible()
  })
})

test.describe('Series Navigation - Mobile Accordion', () => {
  async function openMobileMenu(page: Page) {
    const openMenuButton = page.getByRole('button', { name: /open navigation menu/i })
    await expect(openMenuButton).toBeVisible()

    const dialog = page.getByRole('dialog', { name: /navigation menu/i })

    // Wait for hydration by clicking and waiting for dialog visibility
    await openMenuButton.click()
    await expect(dialog).toBeVisible({ timeout: 15000 })
  }

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Dismiss cookie consent banner so it can't intercept mobile menu clicks.
    const cookieBanner = page.locator('[role="region"][aria-label="Cookie consent notice"]')
    const cookieBannerAppeared = await cookieBanner
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false)

    if (cookieBannerAppeared) {
      await cookieBanner.getByRole('button', { name: 'Decline All' }).click()
      await expect(cookieBanner).toBeHidden({ timeout: 5000 })
    }
  })

  test('should open mobile menu and show accordion', async ({ page }) => {
    // Navigate to the models landing page so the sidebar auto-activates the Models section
    await page.goto('/technology-adoption-models', { waitUntil: 'domcontentloaded' })
    await openMobileMenu(page)

    // Verify accordion groups are shown in sidebar
    const navigationDialog = page.getByRole('dialog', { name: /navigation menu/i })
    const seriesOverview = navigationDialog.getByRole('button', { name: /Series Overview/i })
    await expect(seriesOverview).toBeVisible({ timeout: 10000 })
  })

  test('should expand Branch 1 accordion in mobile menu', async ({ page }) => {
    // Navigate to the models landing page so the sidebar auto-activates the Models section
    await page.goto('/technology-adoption-models', { waitUntil: 'domcontentloaded' })
    await openMobileMenu(page)

    // Find and click Branch 1 accordion button (title derived from series data)
    const navigationDialog = page.getByRole('dialog', { name: /navigation menu/i })
    const branch1ShortTitle = technologyAdoptionModelsSeries.branches[0].title.split('–')[0].trim()
    const branch1Button = navigationDialog.getByRole('button', {
      name: new RegExp(escapeRegExp(branch1ShortTitle), 'i'),
    })
    await expect(branch1Button).toBeVisible()
    await branch1Button.click()
    await expect(branch1Button).toHaveAttribute('aria-expanded', 'true')

    // Verify articles are visible
    const article11 = navigationDialog.getByRole('link', { name: /The Bedrock/i })
    await article11.scrollIntoViewIfNeeded()
    await expect(article11).toBeVisible()
  })

  test('should expand Branch 2 accordion in mobile menu', async ({ page }) => {
    // Navigate to the models landing page so the sidebar auto-activates the Models section
    await page.goto('/technology-adoption-models', { waitUntil: 'domcontentloaded' })
    await openMobileMenu(page)

    // Find and click Branch 2 accordion button (title derived from series data)
    const navigationDialog = page.getByRole('dialog', { name: /navigation menu/i })
    const branch2ShortTitle = technologyAdoptionModelsSeries.branches[1].title.split('–')[0].trim()
    const branch2Button = navigationDialog.getByRole('button', {
      name: new RegExp(escapeRegExp(branch2ShortTitle), 'i'),
    })
    await expect(branch2Button).toBeVisible()
    await branch2Button.click()
    await expect(branch2Button).toHaveAttribute('aria-expanded', 'true')

    // Verify articles are visible
    const article21 = navigationDialog.getByRole('link', { name: /The Strategic Lens/i })
    await article21.scrollIntoViewIfNeeded()
    await expect(article21).toBeVisible()
  })
})

test.describe('Series Pages - Content Verification', () => {
  test('root page should load with correct title', async ({ page }) => {
    await page.goto(technologyAdoptionModelsSeries.root.slug)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Article 1: The Landscape of Technology Adoption Models & Frameworks/i,
      })
    ).toBeVisible()
  })

  test('Branch 1 introduction should load', async ({ page }) => {
    await page.goto(technologyAdoptionModelsSeries.branches[0].slug)
    await expect(
      page.getByRole('heading', { level: 1, name: /Branch Introduction.*User.*Journey/i })
    ).toBeVisible()
  })

  test('Branch 2 introduction should load', async ({ page }) => {
    await page.goto(technologyAdoptionModelsSeries.branches[1].slug)
    await expect(
      page.getByRole('heading', { level: 1, name: /Branch Introduction.*Organization.*Playbook/i })
    ).toBeVisible()
  })

  test('Article 1.1 should load (existing content)', async ({ page }) => {
    await page.goto(technologyAdoptionModelsSeries.branches[0].articles[0].slug)
    await expect(
      page.getByRole('heading', { level: 1, name: /Article 1\.1: The Bedrock/i })
    ).toBeVisible()
  })
})

test.describe('Placeholder Pages - Coming Soon', () => {
  const placeholderArticles = technologyAdoptionModelsSeries.branches.flatMap((branch) =>
    branch.articles.filter((article) => article.status === 'coming-soon')
  )

  for (const article of placeholderArticles) {
    test(`${article.id} should display "Coming soon"`, async ({ page }) => {
      await page.goto(article.slug)

      // Verify H1 contains the article title
      const h1Text = await page.getByRole('heading', { level: 1 }).textContent()
      expect(h1Text).toContain(article.title)

      // Verify "Coming soon" text is present
      await expect(
        page.locator('main').getByText('Coming soon', { exact: true }).first()
      ).toBeVisible()
    })
  }
})

test.describe('In-page Series Navigation - Responsive rendering', () => {
  test('mobile: renders branch accordions (summary buttons) instead of branch title links', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(technologyAdoptionModelsSeries.branches[0].articles[0].slug)

    await expect(page.getByRole('heading', { name: /Series navigation/i })).toBeVisible()

    const seriesNav = page.getByRole('navigation', {
      name: /Technology Adoption Models series navigation/i,
    })
    await expect(seriesNav).toBeVisible()

    const branchTitle = technologyAdoptionModelsSeries.branches[0].title
    await expect(seriesNav.locator('summary').filter({ hasText: branchTitle })).toBeVisible()
    await expect(seriesNav.getByRole('link', { name: branchTitle })).toHaveCount(0)
  })

  test('desktop: renders branch title links instead of accordion summary buttons', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(technologyAdoptionModelsSeries.branches[0].articles[0].slug)

    await expect(page.getByRole('heading', { name: /Series navigation/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Jump to current branch section/i })).toBeVisible()

    const seriesNav = page.getByRole('navigation', {
      name: /Technology Adoption Models series navigation/i,
    })
    await expect(seriesNav).toBeVisible()

    const branchTitle = technologyAdoptionModelsSeries.branches[0].title
    await expect(page.getByRole('link', { name: branchTitle }).first()).toBeVisible()
    await expect(seriesNav.locator('summary').filter({ hasText: branchTitle })).toBeHidden()
  })
})
