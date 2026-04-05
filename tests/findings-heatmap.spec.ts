import { test, expect } from '@playwright/test'

test.describe('Findings Page Heatmap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/results/findings')
  })

  test('should display cross-tabulation section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cross-Tabulations' })).toBeVisible()
  })

  test('should show heatmap by default and toggle to table', async ({ page }) => {
    // Scope the assertions to the first "By Role" cross-tab instance
    const byRoleSection = page.getByTestId('cross-tab-by-role').first()
    await expect(byRoleSection).toBeVisible()

    // Look for the heatmap grid header "Barrier" within this specific section
    const barrierHeader = byRoleSection.getByText('Barrier', { exact: true })
    await expect(barrierHeader).toBeVisible()

    // Toggle to table view within the same "By Role" section
    const tableToggle = byRoleSection.getByRole('button', { name: 'Switch to Table View' })
    await tableToggle.click()

    // Assert the table header within the same scoped section
    // In table view it uses "B"
    const bHeader = byRoleSection.getByText('B', { exact: true })
    await expect(bHeader).toBeVisible()

    // Toggle back to heatmap within the same section
    const heatmapToggle = byRoleSection.getByRole('button', { name: 'Switch to Heatmap View' })
    await heatmapToggle.click()
    await expect(barrierHeader).toBeVisible()
  })

  test('should apply color classes to barrier cells in actual data rows', async ({ page }) => {
    // Scope to the first "By Role" heatmap
    const byRoleSection = page.getByTestId('cross-tab-by-role').first()
    await expect(byRoleSection).toBeVisible()

    // Assert against amber-colored cells within actual heatmap rows (using role="row"),
    // excluding non-row UI like the legend.
    const amberCell = byRoleSection
      .locator('[role="row"]')
      .locator(
        '.bg-amber-50, .bg-amber-100, .bg-amber-200, .bg-amber-300, .bg-amber-400, .bg-amber-500, .bg-amber-600, .bg-amber-700'
      )
      .first()

    await expect(amberCell).toBeVisible()
  })
})
