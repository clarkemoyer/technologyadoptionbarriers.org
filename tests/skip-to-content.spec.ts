import { test, expect } from '@playwright/test'

/**
 * Skip-to-Content Navigation Tests
 *
 * These tests verify that the skip-to-content link works correctly for
 * keyboard and screen reader users:
 * 1. The skip link is the first tabbable element on all pages
 * 2. The skip link becomes visible on keyboard focus (not hidden)
 * 3. Activating the skip link moves focus to the #main-content target
 */

const pages = ['/', '/results', '/results/findings']

test.describe('Skip-to-content link', () => {
  for (const path of pages) {
    test(`is the first tabbable element on ${path}`, async ({ page }) => {
      await page.goto(path)

      // Tab once from the top of the page
      await page.keyboard.press('Tab')

      // The focused element should be the skip link
      const focusedHref = await page.evaluate(() => {
        const el = document.activeElement as HTMLAnchorElement | null
        return el?.getAttribute('href') ?? null
      })
      expect(focusedHref).toBe('#main-content')
    })

    test(`becomes visible on keyboard focus on ${path}`, async ({ page }) => {
      await page.goto(path)

      const skipLink = page.locator('a[href="#main-content"]')

      // Before focus: the element is visually hidden (1×1px)
      const beforeRect = await skipLink.evaluate((el) => {
        const rect = el.getBoundingClientRect()
        return { width: rect.width, height: rect.height }
      })
      expect(beforeRect.width).toBeLessThanOrEqual(1)
      expect(beforeRect.height).toBeLessThanOrEqual(1)

      // Press Tab - skip link receives focus and focus:not-sr-only reveals it
      await page.keyboard.press('Tab')

      // After focus: the element occupies visible space (well over 1px in each dimension)
      const afterRect = await skipLink.evaluate((el) => {
        const rect = el.getBoundingClientRect()
        return { width: rect.width, height: rect.height }
      })
      expect(afterRect.width).toBeGreaterThan(10)
      expect(afterRect.height).toBeGreaterThan(10)
    })

    test(`moves focus to #main-content on ${path}`, async ({ page }) => {
      await page.goto(path)

      // Tab to skip link, then press Enter to activate it
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')

      // Wait for the hash navigation to settle
      await page.waitForFunction(() => location.hash === '#main-content')

      // The #main-content target (tabIndex={-1}) should have received focus
      const focusedId = await page.evaluate(() => {
        return (document.activeElement as HTMLElement | null)?.id ?? null
      })
      expect(focusedId).toBe('main-content')
    })
  }
})
