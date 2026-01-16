import { test, expect } from '@playwright/test'

/**
 * Survey Statistics Tests
 *
 * These tests verify that the TABS homepage statistics section renders
 * with the expected headings and baseline values.
 */

test.describe('Survey Statistics', () => {
  const getStatCard = (
    section: ReturnType<import('@playwright/test').Page['locator']>,
    title: string
  ) => {
    const heading = section.getByRole('heading', { level: 3, name: title })
    return heading.locator('..')
  }

  test('should render the Survey Statistics section with expected cards', async ({ page }) => {
    await page.goto('/')

    const section = page.locator('#statistics')
    await expect(section).toBeVisible()

    await expect(
      section.getByRole('heading', { level: 2, name: 'Survey Statistics' })
    ).toBeVisible()

    const surveysCompleted = getStatCard(section, 'Surveys Completed')
    await expect(surveysCompleted).toBeVisible()
    await expect(surveysCompleted.getByText(/^0$/)).toBeVisible()

    const dollarsRaised = getStatCard(section, '$ Raised')
    await expect(dollarsRaised).toBeVisible()
    await expect(dollarsRaised.getByText(/^\$0$/)).toBeVisible()

    const hoursVolunteered = getStatCard(section, 'Hours Volunteered')
    await expect(hoursVolunteered).toBeVisible()
    await expect(hoursVolunteered.getByText(/^0$/)).toBeVisible()
  })
})
