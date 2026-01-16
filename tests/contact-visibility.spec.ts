import { test, expect } from '@playwright/test'

/**
 * Contact Section Visibility Tests
 * Verifies the TABS homepage Contact section.
 */
test.describe('Contact Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should render the BottomCTA section', async ({ page }) => {
    const section = page.locator('#contact')
    await expect(section).toBeAttached()
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await expect(section.getByRole('heading', { level: 2, name: 'Get in Touch' })).toBeVisible()
  })

  test('should include phone link', async ({ page }) => {
    const section = page.locator('#contact')
    await expect(section).toBeAttached()
    await section.scrollIntoViewIfNeeded()

    // Check for the phone number link
    const phoneLink = section.locator('a[href="tel:520-222-8104"]')
    await expect(phoneLink).toBeVisible()
    await expect(phoneLink).toContainText('520-222-8104')
  })

  test('should include email and survey CTA links', async ({ page }) => {
    const section = page.locator('#contact')
    await expect(section).toBeAttached()
    await section.scrollIntoViewIfNeeded()

    const emailLink = section.locator('a[href="mailto:contact@technologyadoptionbarriers.org"]')
    await expect(emailLink).toBeVisible()

    const surveyCta = section.getByRole('link', { name: 'Take the TABS Survey' })
    await expect(surveyCta).toBeVisible()
    await expect(surveyCta).toHaveAttribute('href', 'https://technologyadoptionbarriers.org/')
    await expect(surveyCta).toHaveAttribute('target', '_blank')
  })
})
