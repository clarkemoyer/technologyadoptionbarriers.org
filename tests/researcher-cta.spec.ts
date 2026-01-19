import { test, expect } from '@playwright/test'

test.describe('Support our Research CTA', () => {
  test('should display the researcher CTA card on homepage', async ({ page }) => {
    await page.goto('/')

    // Verify the card title is visible with new name
    const researcherCard = page.getByRole('heading', { name: 'Use Our Dataset', level: 3 })
    await expect(researcherCard).toBeVisible()

    // Verify the description mentions key terms
    await expect(page.getByText(/Researchers/i)).toBeVisible()
    await expect(page.getByText(/IRB-approved dataset access/i)).toBeVisible()

    // Verify the CTA button is present and has correct link to get-involved page
    const datasetButton = page.getByRole('link', { name: /request access/i })
    await expect(datasetButton).toBeVisible()
    await expect(datasetButton).toHaveAttribute('href', '/get-involved#use-dataset')
  })

  test('should display all four donation cards with updated titles', async ({ page }) => {
    await page.goto('/')

    // Check all four card titles are visible with new names
    await expect(page.getByRole('heading', { name: 'Donate to Support TABS' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Become a Sponsor' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Volunteer Your Skills' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Use Our Dataset' })).toBeVisible()
  })

  test('should have link to Get Involved page', async ({ page }) => {
    await page.goto('/')

    const getInvolvedLink = page.getByRole('link', { name: /see all ways to get involved/i })
    await expect(getInvolvedLink).toBeVisible()
    await expect(getInvolvedLink).toHaveAttribute('href', '/get-involved')
  })

  test('should render cards in responsive grid layout', async ({ page }) => {
    // Desktop view - should show 4 columns
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    // Use semantic selectors to count cards by their headings
    const cardHeadings = page.locator('h3').filter({
      hasText: /Donate to Support TABS|Become a Sponsor|Volunteer Your Skills|Use Our Dataset/,
    })
    await expect(cardHeadings).toHaveCount(4)

    // Mobile view - all cards should still be visible
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Use Our Dataset' })).toBeVisible()
    await expect(cardHeadings).toHaveCount(4)
  })

  test('researcher CTA button should be clickable', async ({ page }) => {
    await page.goto('/')

    const datasetButton = page.getByRole('link', { name: /request access/i })
    await expect(datasetButton).toBeVisible()
    await expect(datasetButton).toBeEnabled()

    // Verify button has hover effect (transform scale)
    const buttonClass = await datasetButton.getAttribute('class')
    expect(buttonClass).toContain('hover:scale-105')
  })
})
