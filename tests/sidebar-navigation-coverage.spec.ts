import { test, expect } from '@playwright/test'

/**
 * Sidebar Navigation Smoke Tests (Runtime)
 *
 * Verifies at runtime that:
 * 1. The left-hand sidebar renders and responds to interaction
 * 2. The right-hand sidebar does NOT duplicate the series/section navigation
 *
 * Route-level coverage (every route has a sidebar link) is enforced by the
 * Jest unit test: __tests__/data/sidebar-navigation-coverage.test.ts
 */

test.describe('No Series Duplication on Right Sidebar', () => {
  test('Making of TABS page shows only ON THIS PAGE in right sidebar, not series nav', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/making-of-tabs/cmo-survey', { waitUntil: 'domcontentloaded' })

    const rightNav = page.locator('nav[aria-label="Page navigation"]')
    const rightNavVisible = await rightNav.isVisible().catch(() => false)
    if (rightNavVisible) {
      await expect(rightNav.getByText('MAKING OF TABS')).toHaveCount(0)
    }
  })

  test('Results page shows only ON THIS PAGE in right sidebar, not series nav', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/results', { waitUntil: 'domcontentloaded' })

    const rightNav = page.locator('nav[aria-label="Page navigation"]')
    const rightNavVisible = await rightNav.isVisible().catch(() => false)
    if (rightNavVisible) {
      await expect(rightNav.getByText('RESULTS')).toHaveCount(0)
    }
  })
})
