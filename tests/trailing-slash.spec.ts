import { test, expect } from '@playwright/test'

test.describe('Trailing Slash URL Handling', () => {
  test('should handle /get-involved with trailing slash', async ({ page }) => {
    await page.goto('/get-involved/')

    // Should successfully load the page
    await expect(page).toHaveTitle(/Get Involved/)
    await expect(
      page.getByRole('heading', { name: 'Get Involved with TABS', level: 1 })
    ).toBeVisible()
  })

  test('should handle /get-involved without trailing slash', async ({ page }) => {
    await page.goto('/get-involved')

    // Should successfully load the page
    await expect(page).toHaveTitle(/Get Involved/)
    await expect(
      page.getByRole('heading', { name: 'Get Involved with TABS', level: 1 })
    ).toBeVisible()
  })

  test('should handle privacy-policy with trailing slash', async ({ page }) => {
    await page.goto('/privacy-policy/')

    // Should successfully load the page
    await expect(page).toHaveTitle(/Privacy Policy/)
    await expect(page.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeVisible()
  })

  test('should handle privacy-policy without trailing slash', async ({ page }) => {
    await page.goto('/privacy-policy')

    // Should successfully load the page
    await expect(page).toHaveTitle(/Privacy Policy/)
    await expect(page.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeVisible()
  })

  test('should handle barriers page with trailing slash', async ({ page }) => {
    await page.goto('/barriers/')

    // Should successfully load the page
    await expect(
      page.getByRole('heading', { name: /Tech Adoption Barriers/, level: 1 })
    ).toBeVisible()
  })

  test('should handle barriers page without trailing slash', async ({ page }) => {
    await page.goto('/barriers')

    // Should successfully load the page
    await expect(
      page.getByRole('heading', { name: /Tech Adoption Barriers/, level: 1 })
    ).toBeVisible()
  })

  test('should handle nested routes with trailing slash', async ({ page }) => {
    await page.goto('/for-organizations/technology-leaders/')

    // Should successfully load the page
    await expect(page).toHaveTitle(/Technology Leaders/)
    await expect(page.getByRole('heading', { name: /Technology Leaders/, level: 1 })).toBeVisible()
  })

  test('should handle nested routes without trailing slash', async ({ page }) => {
    await page.goto('/for-organizations/technology-leaders')

    // Should successfully load the page
    await expect(page).toHaveTitle(/Technology Leaders/)
    await expect(page.getByRole('heading', { name: /Technology Leaders/, level: 1 })).toBeVisible()
  })
})
