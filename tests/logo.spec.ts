import { test, expect } from '@playwright/test'

/**
 * Logo and TABS Homepage Tests
 *
 * These tests verify critical elements are present on the TABS homepage:
 * 1. Header logo (top left corner) - validates site branding
 * 2. TABS hero section - validates the main heading is displayed
 *
 * Note: This site now displays Technology Adoption Barriers Survey (TABS) content
 * instead of the original Free For Charity template content.
 */

test.describe('Logo and TABS Homepage', () => {
  test('should display logo in header', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Find any logo in the header (the header should have a logo image)
    const headerLogo = page.locator('header img').first()

    // Verify a logo exists and is visible
    await expect(headerLogo).toBeVisible()
  })

  test('should display TABS hero section heading', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Find the main TABS heading
    const tabsHeading = page.locator('h1:has-text("The TABS Project")')

    // Verify the heading exists and is visible
    await expect(tabsHeading).toBeVisible()
  })

  test('should display TABS tagline', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Find the TABS tagline
    const tagline = page.locator('text=Know the Barriers. Break the Barriers.')

    // Verify the tagline is visible
    await expect(tagline).toBeVisible()
  })
})
