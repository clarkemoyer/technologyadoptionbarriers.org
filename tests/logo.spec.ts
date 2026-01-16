import { test, expect } from '@playwright/test'

/**
 * Logo and TABS Homepage Tests
 *
 * These tests verify critical elements are present on the TABS homepage:
 * 1. Header logo (top left corner) - validates site branding
 * 2. TABS hero section - validates the main heading is displayed
 *
 * Note: This site now displays Technology Adoption Barriers Survey (TABS) content
 * instead of older template content.
 */

test.describe('Logo and TABS Homepage', () => {
  test('should display logo in header', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Find the logo in the header
    // Use :near or specific header container if possible, or just first one
    const headerLogo = page.locator('header').getByRole('img', { name: 'TABS Logo' }).first()

    // Verify a logo exists and is visible
    await expect(headerLogo).toBeVisible()
  })

  test('should display TABS hero section heading', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Find the main hero heading
    const tabsHeading = page.getByRole('heading', {
      level: 1,
      name: /Technology Adoption Barriers Survey/i,
    })

    // Verify the heading exists and is visible
    await expect(tabsHeading).toBeVisible()
  })

  test('should display TABS tagline', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Find the TABS tagline
    const tagline = page.getByText(/Know the Barriers, Break the Barriers/i)

    // Verify the tagline is visible
    await expect(tagline).toBeVisible()
  })
})
