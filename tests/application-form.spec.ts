import { test, expect } from '@playwright/test'

/**
 * Contact Section Tests
 *
 * A previous template included a Microsoft Forms modal.
 * The current TABS homepage uses a Contact section instead.
 */

test.describe('Contact Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should render the contact section', async ({ page }) => {
    const section = page.locator('#contact')
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await expect(section.getByRole('heading', { level: 2, name: 'Get in Touch' })).toBeVisible()
  })

  test('should include phone and email links', async ({ page }) => {
    const section = page.locator('#contact')
    await section.scrollIntoViewIfNeeded()

    await expect(section.locator('a[href="tel:520-222-8104"]')).toBeVisible()
    await expect(
      section.locator('a[href="mailto:contact@technologyadoptionbarriers.org"]')
    ).toBeVisible()
  })

  test('should include a CTA to take the survey', async ({ page }) => {
    const section = page.locator('#contact')
    await section.scrollIntoViewIfNeeded()

    const cta = section.getByRole('link', { name: 'Take the TABS Survey' })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', 'https://technologyadoptionbarriers.org/')
    await expect(cta).toHaveAttribute('target', '_blank')
  })
})
