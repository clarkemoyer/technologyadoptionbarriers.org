import { test, expect } from '@playwright/test'

/**
 * Contact Section Visibility Tests
 * Verifies the BottomCTA section ("Get in Touch. Get Involved.")
 */
test.describe('Contact Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should render the BottomCTA section', async ({ page }) => {
    const section = page.locator('#contact')
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await expect(section.getByText('Get in Touch. Get Involved.')).toBeVisible()
  })

  test('should include phone link', async ({ page }) => {
    const section = page.locator('#contact')
    await section.scrollIntoViewIfNeeded()

    // Check for the phone number link
    const phoneLink = section.locator('a[href="tel:5202228104"]')
    await expect(phoneLink).toBeVisible()
    await expect(phoneLink).toContainText('(520) 222 8104')
  })

  test('should include primary CTA buttons', async ({ page }) => {
    const section = page.locator('#contact')
    await section.scrollIntoViewIfNeeded()

    const surveyBtn = section.getByRole('link', { name: 'TAKE THE TABS' })
    await expect(surveyBtn).toBeVisible()
    await expect(surveyBtn).toHaveAttribute(
      'href',
      'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO'
    )

    const donateBtn = section.getByRole('link', { name: 'MAKE A DONATION' })
    await expect(donateBtn).toBeVisible()
  })
})
