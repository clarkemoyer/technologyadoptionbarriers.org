import { test, expect } from '@playwright/test'
import { technologyAdoptionModelsSeries } from '../src/data/technology-adoption-models-series'

/**
 * Technology Adoption Models Series Navigation Tests
 *
 * These tests verify:
 * 1. Desktop mega menu navigation works correctly
 * 2. Mobile accordion navigation works correctly
 * 3. All series pages load with correct H1 titles
 * 4. Placeholder pages display "Coming soon"
 * 5. Keyboard navigation (Escape key closes mega menu)
 */

test.describe('Series Navigation - Desktop Mega Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Ensure we're on desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('should open mega menu on Technology Adoption Models hover/click', async ({ page }) => {
    // Wait for page to fully load and hydrate
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Additional wait for React hydration

    // Find the Technology Adoption Models button
    const megaMenuButton = page.getByRole('button', { name: /Technology Adoption Models/i })
    await expect(megaMenuButton).toBeVisible()

    // Click to open mega menu
    await megaMenuButton.click()

    // Wait for menu animation
    await page.waitForTimeout(500)

    // Verify mega menu is visible with timeout
    const megaMenu = page.locator('#mega-menu')
    await expect(megaMenu).toBeVisible({ timeout: 10000 })

    // Verify root link is present
    const rootLink = megaMenu.getByRole('link', {
      name: technologyAdoptionModelsSeries.root.title,
    })
    await expect(rootLink).toBeVisible()
  })

  test('should display all branch titles in mega menu', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const megaMenuButton = page.getByRole('button', { name: /Technology Adoption Models/i })

    await megaMenuButton.click()
    await page.waitForTimeout(500)

    const megaMenu = page.locator('#mega-menu')
    await expect(megaMenu).toBeVisible({ timeout: 10000 })

    // Check Branch 1 title
    const branch1Link = megaMenu.getByRole('link', {
      name: technologyAdoptionModelsSeries.branches[0].title,
    })
    await expect(branch1Link).toBeVisible()

    // Check Branch 2 title
    const branch2Link = megaMenu.getByRole('link', {
      name: technologyAdoptionModelsSeries.branches[1].title,
    })
    await expect(branch2Link).toBeVisible()
  })

  test('should display all articles in mega menu', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const megaMenuButton = page.getByRole('button', { name: /Technology Adoption Models/i })

    await megaMenuButton.click()
    await page.waitForTimeout(500)

    const megaMenu = page.locator('#mega-menu')
    await expect(megaMenu).toBeVisible({ timeout: 10000 })

    // Verify a few key articles are present
    await expect(megaMenu.getByRole('link', { name: /Article 1\.1: The Bedrock/i })).toBeVisible()
    await expect(
      megaMenu.getByRole('link', { name: /Article 1\.2: The Game Changer/i })
    ).toBeVisible()
    await expect(
      megaMenu.getByRole('link', { name: /Article 2\.1: The Strategic Lens/i })
    ).toBeVisible()
  })

  test('should close mega menu on Escape key', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const megaMenuButton = page.getByRole('button', { name: /Technology Adoption Models/i })

    await megaMenuButton.click()
    await page.waitForTimeout(500)

    const megaMenu = page.locator('#mega-menu')
    await expect(megaMenu).toBeVisible({ timeout: 10000 })

    // Press Escape
    await page.keyboard.press('Escape')

    // Mega menu should be hidden
    await expect(megaMenu).not.toBeVisible()
  })

  test('should navigate to article from mega menu', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const megaMenuButton = page.getByRole('button', { name: /Technology Adoption Models/i })

    await megaMenuButton.click()
    await page.waitForTimeout(500)

    const megaMenu = page.locator('#mega-menu')
    await expect(megaMenu).toBeVisible({ timeout: 10000 })

    // Click on Article 1.1
    await megaMenu.getByRole('link', { name: /Article 1\.1: The Bedrock/i }).click()

    // Wait for navigation
    await page.waitForURL(
      '**/article-1-1-the-bedrock-foundational-theories-that-shaped-tech-acceptance'
    )

    // Verify H1 is present
    await expect(
      page.getByRole('heading', { level: 1, name: /Article 1\.1: The Bedrock/i })
    ).toBeVisible()
  })
})

test.describe('Series Navigation - Mobile Accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('should open mobile menu and show accordion', async ({ page }) => {
    // Wait for page to load and hydrate
    await page.waitForLoadState('networkidle')

    // Open mobile menu
    const mobileMenuButton = page.getByRole('button', { name: /Open menu/i })
    await expect(mobileMenuButton).toBeVisible()
    await mobileMenuButton.click()

    // Wait a bit for animation
    await page.waitForTimeout(500)

    // Verify Technology Adoption Models link is visible
    const seriesLink = page.getByRole('link', { name: /Technology Adoption Models/i }).first()
    await expect(seriesLink).toBeVisible({ timeout: 10000 })
  })

  test('should expand Branch 1 accordion in mobile menu', async ({ page }) => {
    // Open mobile menu
    const mobileMenuButton = page.getByRole('button', { name: /Open menu/i })
    await mobileMenuButton.click()

    // Find and click Branch 1 accordion button
    const branch1Button = page.getByRole('button', {
      name: new RegExp(technologyAdoptionModelsSeries.branches[0].title, 'i'),
    })
    await branch1Button.click()

    // Verify articles are visible
    await expect(page.getByRole('link', { name: /Article 1\.1: The Bedrock/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Article 1\.2: The Game Changer/i })).toBeVisible()
  })

  test('should expand Branch 2 accordion in mobile menu', async ({ page }) => {
    // Open mobile menu
    const mobileMenuButton = page.getByRole('button', { name: /Open menu/i })
    await mobileMenuButton.click()

    // Find and click Branch 2 accordion button
    const branch2Button = page.getByRole('button', {
      name: new RegExp(technologyAdoptionModelsSeries.branches[1].title, 'i'),
    })
    await branch2Button.click()

    // Verify articles are visible
    await expect(
      page.getByRole('link', { name: /Article 2\.1: The Strategic Lens/i })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Article 2\.2: From Chaos to Control/i })
    ).toBeVisible()
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
  const placeholderArticles = [
    technologyAdoptionModelsSeries.branches[0].articles[1], // 1.2
    technologyAdoptionModelsSeries.branches[0].articles[2], // 1.3
    technologyAdoptionModelsSeries.branches[0].articles[3], // 1.4
    technologyAdoptionModelsSeries.branches[0].articles[4], // 1.5
    technologyAdoptionModelsSeries.branches[0].articles[5], // 1.6
    technologyAdoptionModelsSeries.branches[0].articles[6], // 1.7
    technologyAdoptionModelsSeries.branches[1].articles[0], // 2.1
    technologyAdoptionModelsSeries.branches[1].articles[1], // 2.2
    technologyAdoptionModelsSeries.branches[1].articles[2], // 2.3
    technologyAdoptionModelsSeries.branches[1].articles[3], // 2.4
    technologyAdoptionModelsSeries.branches[1].articles[4], // 2.5
    technologyAdoptionModelsSeries.branches[1].articles[5], // 2.6
    technologyAdoptionModelsSeries.branches[1].articles[6], // 2.7
  ]

  for (const article of placeholderArticles) {
    test(`${article.id} should display "Coming soon"`, async ({ page }) => {
      await page.goto(article.slug)

      // Verify H1 contains the article title
      const h1Text = await page.getByRole('heading', { level: 1 }).textContent()
      expect(h1Text).toContain(article.title)

      // Verify "Coming soon" text is present
      await expect(page.getByText(/Coming soon/i)).toBeVisible()
    })
  }
})
