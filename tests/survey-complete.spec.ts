import { test, expect } from '@playwright/test'

test.describe('Survey Complete Page', () => {
  test('loads and shows expected content', async ({ page }) => {
    await page.goto('/survey-complete')

    await expect(page).toHaveTitle(/Survey Complete \| TABS/)

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Thank you for participating',
      })
    ).toBeVisible()

    await expect(page.getByText('Your response has been recorded.', { exact: false })).toBeVisible()

    const email = page.getByRole('link', { name: 'contact@technologyadoptionbarriers.org' })
    await expect(email).toHaveAttribute('href', 'mailto:contact@technologyadoptionbarriers.org')
  })
})
