import { test, expect } from '@playwright/test'

test.describe('Support our Research CTA', () => {
  test('should display the researcher CTA card on homepage', async ({ page }) => {
    await page.goto('/')

    // Verify the card title is visible
    const researcherCard = page.getByRole('heading', { name: 'Support our Research', level: 3 })
    await expect(researcherCard).toBeVisible()

    // Verify the description mentions key terms
    await expect(page.getByText(/TABS dataset/i)).toBeVisible()
    await expect(page.getByText(/IRB/i)).toBeVisible()
    await expect(page.getByText(/papers and dissertations/i)).toBeVisible()

    // Verify the CTA button is present and has correct link
    const datasetButton = page.getByRole('link', { name: /request dataset access/i })
    await expect(datasetButton).toBeVisible()
    await expect(datasetButton).toHaveAttribute(
      'href',
      'mailto:clarke@technologyadoptionbarriers.org?subject=TABS%20Dataset%20Access%20Request'
    )
  })

  test('should display all four donation cards', async ({ page }) => {
    await page.goto('/')

    // Check all four card titles are visible
    await expect(page.getByRole('heading', { name: 'Donate to the general fund' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Donate as a Sponsor' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Become a Supporting Researcher' })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Support our Research' })).toBeVisible()
  })

  test('should render cards in responsive grid layout', async ({ page }) => {
    // Desktop view - should show 4 columns
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    const cards = page.locator('section.bg-gray-50 > div > div')
    await expect(cards).toHaveCount(4)

    // Mobile view - all cards should still be visible
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Support our Research' })).toBeVisible()
    await expect(cards).toHaveCount(4)
  })

  test('researcher CTA button should be clickable', async ({ page }) => {
    await page.goto('/')

    const datasetButton = page.getByRole('link', { name: /request dataset access/i })
    await expect(datasetButton).toBeVisible()
    await expect(datasetButton).toBeEnabled()

    // Verify button has hover effect (transform scale)
    const buttonClass = await datasetButton.getAttribute('class')
    expect(buttonClass).toContain('hover:scale-105')
  })
})
