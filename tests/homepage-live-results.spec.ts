import { test, expect } from '@playwright/test'
import sensitivityData from '../src/data/sensitivity-analysis.json'

test.describe('Homepage Live Results Section', () => {
  test('should display live results section with top 3 barriers', async ({ page }) => {
    await page.goto('/')

    // Check section heading
    await expect(page.getByRole('heading', { name: 'Live Results: Top Barriers' })).toBeVisible()

    // Check participant count is displayed (derive from data to avoid brittleness)
    const totalN = sensitivityData.top3_pick_counts.total_n
    await expect(page.locator('#live-results')).toContainText(totalN.toLocaleString())

    // Check all 3 rank badges are visible
    const section = page.locator('#live-results')
    await expect(section.getByText('1', { exact: true })).toBeVisible()
    await expect(section.getByText('2', { exact: true })).toBeVisible()
    await expect(section.getByText('3', { exact: true })).toBeVisible()

    // Check that exactly 3 live-result cards are displayed and each has non-empty text
    const cards = section.locator('.grid').first().locator(':scope > *')
    await expect(cards).toHaveCount(3)
    const cardTexts = await cards.allTextContents()
    expect(cardTexts).toHaveLength(3)
    for (const cardText of cardTexts) {
      expect(cardText.trim().length).toBeGreaterThan(0)
    }

    // Check CTA link to results page
    const ctaLink = page.getByRole('link', { name: /View All Results & Analysis/i })
    await expect(ctaLink).toBeVisible()
    // Use pathname-based check to be basePath-safe (GitHub Pages prepends a basePath)
    const href = await ctaLink.getAttribute('href')
    const hrefPathname = new URL(href!, page.url()).pathname
    expect(hrefPathname).toMatch(/\/results\/?$/)
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

    expect(statisticsIndex).toBeGreaterThan(-1)
    expect(liveResultsIndex).toBeGreaterThan(-1)
    expect(liveResultsIndex).toBeGreaterThan(statisticsIndex)
  })

  test('CTA link should navigate to results page', async ({ page }) => {
    await page.goto('/')

    const ctaLink = page.getByRole('link', { name: /View All Results & Analysis/i })
    await ctaLink.click()

    // Wait for navigation and check pathname exactly (allow optional trailing slash and any basePath)
    await page.waitForURL((url) => /\/results\/?$/.test(url.pathname))
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/\/results\/?$/)
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
