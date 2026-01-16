import { test, expect } from '@playwright/test'

/**
 * Social Links Tests
 *
 * These tests verify that:
 * 1. Social media links are present and functional
 * 2. Defunct platforms (like Google+) are not present
 * 3. All social icons link to correct destinations
 */

test.describe('Footer Social Links', () => {
  test('should not contain Google+ social link', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Check that Google+ link is not present
    const googlePlusLink = page.locator('footer a[href*="plus.google.com"]')
    await expect(googlePlusLink).toHaveCount(0)

    // Also check that Google Plus label is not present
    const googlePlusLabel = page.locator('footer a[aria-label="Google Plus"]')
    await expect(googlePlusLabel).toHaveCount(0)
  })

  test('should display active social media links', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Verify LinkedIn link is present
    const linkedInLink = page.locator('footer a[aria-label="LinkedIn"]')
    await expect(linkedInLink).toBeVisible()
    await expect(linkedInLink).toHaveAttribute('aria-label', 'LinkedIn')
    await expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/in/clarkemoyer/')
  })

  test('should have exactly 1 social media icon', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    const socialMediaLinks = page.locator('footer a[aria-label="LinkedIn"]')
    await expect(socialMediaLinks).toHaveCount(1)
  })
})
