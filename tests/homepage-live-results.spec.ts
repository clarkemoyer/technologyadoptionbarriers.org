import { test, expect } from '@playwright/test'

test.describe('Homepage Live Results Section', () => {
  test('should display live results section with top 3 barriers', async ({ page }) => {
    await page.goto('/')

    // Check section heading
    await expect(page.getByRole('heading', { name: 'Live Results: Top Barriers' })).toBeVisible()

    // Check participant count is displayed
    await expect(page.locator('#live-results')).toContainText('260')

    // Check all 3 rank badges are visible
    const section = page.locator('#live-results')
    await expect(section.getByText('1', { exact: true })).toBeVisible()
    await expect(section.getByText('2', { exact: true })).toBeVisible()
    await expect(section.getByText('3', { exact: true })).toBeVisible()

    // Check that barrier texts are displayed
    await expect(section).toContainText('High cost associated with acquiring or implementing')
    await expect(section).toContainText('Difficulty integrating new technologies')
    await expect(section).toContainText('Concerns about cybersecurity risks')

    // Check CTA link to results page
    const ctaLink = page.getByRole('link', { name: /View All Results & Analysis/i })
    await expect(ctaLink).toBeVisible()
    // Next.js adds trailing slash
    const href = await ctaLink.getAttribute('href')
    expect(href).toMatch(/^\/results\/?$/)
  })

  test('should have proper section ordering on homepage', async ({ page }) => {
    await page.goto('/')

    // Get all section IDs in order
    const sections = await page
      .locator('section[id]')
      .evaluateAll((elements) => elements.map((el) => el.id))

    // Verify live-results comes after statistics
    const statisticsIndex = sections.indexOf('statistics')
    const liveResultsIndex = sections.indexOf('live-results')

    expect(liveResultsIndex).toBeGreaterThan(statisticsIndex)
    expect(liveResultsIndex).toBeGreaterThan(-1)
  })

  test('CTA link should navigate to results page', async ({ page }) => {
    await page.goto('/')

    const ctaLink = page.getByRole('link', { name: /View All Results & Analysis/i })
    await ctaLink.click()

    // Wait for navigation and check URL (Next.js adds trailing slash)
    await page.waitForURL(/\/results\/?/)
    await expect(page).toHaveURL(/\/results\/?/)
  })

  test('should display percentages for each barrier', async ({ page }) => {
    await page.goto('/')

    const section = page.locator('#live-results')

    // Check for percentage symbols (at least 3 for top 3 barriers)
    const percentages = await section.getByText(/%/).count()
    expect(percentages).toBeGreaterThanOrEqual(3)
  })

  test('should have responsive grid layout', async ({ page }) => {
    await page.goto('/')

    const grid = page.locator('#live-results .grid').first()
    await expect(grid).toHaveClass(/grid-cols-1/)
    await expect(grid).toHaveClass(/md:grid-cols-3/)
  })
})
