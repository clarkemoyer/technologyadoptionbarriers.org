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
    await expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/in/clarkemoyer/')

    // Verify GitHub link is present
    const gitHubLink = page.locator('footer a[aria-label="GitHub"]')
    await expect(gitHubLink).toBeVisible()
    await expect(gitHubLink).toHaveAttribute('href', 'https://github.com/clarkemoyer/technologyadoptionbarriers.org')
  })

  test('should have social media icons', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    const linkedIn = page.locator('footer a[aria-label="LinkedIn"]')
    const gitHub = page.locator('footer a[aria-label="GitHub"]')

    await expect(linkedIn).toHaveCount(1)
    await expect(gitHub).toHaveCount(1)
  })
})
