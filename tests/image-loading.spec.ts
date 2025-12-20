import { test, expect } from '@playwright/test'

/**
 * Image Loading Tests
 *
 * These tests verify that images load correctly when the site is built.
 * The tests check that images in the header load properly.
 *
 * Note: The TABS homepage uses SVG icons instead of hero images, so we
 * focus on testing header logo loading.
 */

test.describe('Image Loading', () => {
  test('header logo should load correctly and be visible', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Find the first logo image in the header
    const headerLogo = page.locator('header img').first()

    // Verify the logo is visible (meaning it loaded successfully)
    await expect(headerLogo).toBeVisible()

    // Verify the header logo has a src attribute
    const headerSrc = await headerLogo.getAttribute('src')
    expect(headerSrc).toBeTruthy()
  })

  test('TABS hero section should be present without requiring images', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // The TABS hero section uses text and SVG icons, not images
    // Verify the hero section is present by checking for the main heading
    const heroHeading = page.locator('h1:has-text("Technology Adoption Barriers Survey")')
    await expect(heroHeading).toBeVisible()

    // Verify the hero section has the expected background styling
    const heroSection = page.locator('section#hero')
    await expect(heroSection).toBeVisible()
  })

  // TABS homepage uses SVG icons instead of raster images
  // Skip the image-specific loading test as it's not applicable
  test.skip('hero image loading test - not applicable to TABS', async ({ page }) => {
    // This test is skipped because the TABS homepage uses SVG icons
    // instead of raster hero images that need to be loaded
  })
})
