import { test, expect } from '@playwright/test'

test.describe('Findings Page Heatmap', () => {
  test.beforeEach(async ({ page }) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    await page.goto(`${basePath}/results/findings`)
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

    // Verify semantically that at least one element within actual heatmap rows
    // has a non-transparent computed background color, without depending on
    // specific Tailwind palette classes.
    const hasColoredCell = await byRoleSection.locator('[role="row"] *').evaluateAll((elements) =>
      elements.some((element) => {
        const htmlElement = element as HTMLElement
        const style = window.getComputedStyle(htmlElement)
        const backgroundColor = style.backgroundColor
        const isVisible =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          htmlElement.getBoundingClientRect().width > 0 &&
          htmlElement.getBoundingClientRect().height > 0

        return (
          isVisible &&
          backgroundColor !== 'transparent' &&
          backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          // Filter out default white backgrounds
          backgroundColor !== 'rgb(255, 255, 255)' &&
          backgroundColor !== '#ffffff'
        )
      })
    )

    expect(hasColoredCell).toBe(true)
  })
})
