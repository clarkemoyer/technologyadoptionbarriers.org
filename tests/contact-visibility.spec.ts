import { test, expect } from '@playwright/test'
import { TABS_WEBSITE_QUALTRICS_SURVEY_URL } from '../src/lib/tabs-survey'

/**
 * Contact Section Visibility Tests
 * Verifies the contact section in the footer (formerly BottomCTA, now merged into Footer).
 */
test.describe('Contact Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should render the contact section in footer', async ({ page }) => {
    const section = page.locator('#contact')
    await expect(section).toBeAttached()
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await expect(section.locator('h2')).toContainText('Get in Touch. Get Involved.')
  })

  test('should include phone link', async ({ page }) => {
    const section = page.locator('#contact')
    await expect(section).toBeAttached()
    await section.scrollIntoViewIfNeeded()

    // Check for the phone number link
    const phoneLink = section.locator('a[href^="tel:"]')
    await expect(phoneLink).toBeVisible()
    await expect(phoneLink).toHaveAttribute('href', /tel:5202228104/)
    await expect(phoneLink).toContainText('520')
  })

  test('should include primary CTA links', async ({ page }) => {
    const section = page.locator('#contact')
    await expect(section).toBeAttached()
    await section.scrollIntoViewIfNeeded()

    const takeTheTabs = section.getByRole('link', { name: /take the tabs/i })
    await expect(takeTheTabs).toBeVisible()
    await expect(takeTheTabs).toHaveAttribute('href', TABS_WEBSITE_QUALTRICS_SURVEY_URL)
    await expect(takeTheTabs).toHaveAttribute('target', '_blank')

    const supportLink = section.getByRole('link', { name: /support tabs/i })
    await expect(supportLink).toBeVisible()
  })
})
