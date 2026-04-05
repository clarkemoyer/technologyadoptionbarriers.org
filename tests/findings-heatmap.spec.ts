import { test, expect } from '@playwright/test'

test.describe('Findings Page Heatmap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/results/findings')
  })

  test('should display cross-tabulation section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cross-Tabulations' })).toBeVisible()
  })

  test('should show heatmap by default and toggle to table', async ({ page }) => {
    // Check if heatmap is visible for the first group's "By Role" section
    // The heatmap uses a grid with specific text
    const byRoleHeader = page.getByRole('heading', { name: 'By Role' }).first()
    await expect(byRoleHeader).toBeVisible()

    // Look for the heatmap grid header "Barrier"
    const barrierHeader = page.getByText('Barrier').first()
    await expect(barrierHeader).toBeVisible()

    // Find the toggle button for Table View
    const tableToggle = page.getByRole('button', { name: 'Switch to Table View' }).first()
    await tableToggle.click()

    // Now the table header "B" should be visible (from the table view)
    // We use getByText since it's a <th> in the table
    const bHeader = page.getByText('B', { exact: true }).first()
    await expect(bHeader).toBeVisible()

    // Toggle back to heatmap
    const heatmapToggle = page.getByRole('button', { name: 'Switch to Heatmap View' }).first()
    await heatmapToggle.click()
    await expect(barrierHeader).toBeVisible()
  })

  test('should apply color classes to barrier cells', async ({ page }) => {
    // The heatmap cells for barriers should have bg-amber-* classes
    // We can check if at least one such cell exists
    const amberCell = page.locator('.bg-amber-50, .bg-amber-100, .bg-amber-200, .bg-amber-300, .bg-amber-400, .bg-amber-500, .bg-amber-600, .bg-amber-700').first()
    await expect(amberCell).toBeVisible()
  })
})
