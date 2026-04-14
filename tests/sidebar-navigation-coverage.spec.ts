import { test, expect } from '@playwright/test'
import { sidebarSections } from '../src/data/sidebar-navigation'

/**
 * Sidebar Navigation Coverage Smoke Tests
 *
 * Post-deploy smoke tests that verify:
 * 1. Every sidebar section exposes at least one navigation link
 * 2. CMO Survey appears in the left-hand sidebar
 * 3. The right-hand sidebar does NOT duplicate the series/section navigation
 *    (it should only contain the "ON THIS PAGE" table-of-contents)
 */

test.describe('Sidebar Navigation Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  // Verify every section with groups exposes at least one link
  for (const section of sidebarSections) {
    if (section.groups.length === 0) continue

    test(`section "${section.label}" has sidebar links`, async ({ page }) => {
      const sidebar = page.locator('#sidebar')
      await expect(sidebar).toBeVisible({ timeout: 10000 })

      // Click the section's top-level button to activate it
      const sectionButton = sidebar.getByRole('button', {
        name: new RegExp(`^${section.label}$`, 'i'),
      })
      await expect(sectionButton).toBeVisible()
      await sectionButton.click()

      // Verify at least one accordion group becomes visible
      const firstGroupTitle = section.groups[0].title
      const groupButton = sidebar.getByRole('button', {
        name: new RegExp(firstGroupTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      })
      await expect(groupButton).toBeVisible({ timeout: 5000 })

      // Expand the first group and verify at least one link
      await groupButton.click()
      const firstLink = section.groups[0].links[0]
      const link = sidebar.getByRole('link', {
        name: new RegExp(firstLink.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      })
      await expect(link).toBeVisible({ timeout: 5000 })
    })
  }

  test('CMO Survey has a link in the left-hand sidebar', async ({ page }) => {
    const sidebar = page.locator('#sidebar')
    await expect(sidebar).toBeVisible({ timeout: 10000 })

    // Activate the "Making of TABS" section
    const makingOfTabsButton = sidebar.getByRole('button', { name: /^Making of TABS$/i })
    await expect(makingOfTabsButton).toBeVisible()
    await makingOfTabsButton.click()

    // Look for CMO Survey link inside the sidebar
    const cmoLink = sidebar.getByRole('link', { name: /CMO Survey/i })
    await expect(cmoLink).toBeVisible({ timeout: 5000 })
  })
})

test.describe('No Series Duplication on Right Sidebar', () => {
  test('Making of TABS page shows only ON THIS PAGE in right sidebar, not series nav', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/making-of-tabs/cmo-survey', { waitUntil: 'domcontentloaded' })

    // The right-side unified navigation should exist for the page TOC
    const rightNav = page.locator('nav[aria-label="Page navigation"]')

    // If the right-side nav is visible, it should only show the ON THIS PAGE
    // section, NOT a series label like "MAKING OF TABS"
    const rightNavVisible = await rightNav.isVisible().catch(() => false)
    if (rightNavVisible) {
      // The series section label should NOT be present
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
