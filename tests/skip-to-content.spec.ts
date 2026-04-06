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

      // Before focus: Tailwind v4 sr-only clips the element with clip-path: inset(50%)
      const beforeClipPath = await skipLink.evaluate((el) => getComputedStyle(el).clipPath)
      expect(beforeClipPath).toBe('inset(50%)')

      // Press Tab — skip link receives focus and focus:not-sr-only removes the clip-path
      await page.keyboard.press('Tab')

      // After focus: clip-path is removed so the element is fully visible
      const afterClipPath = await skipLink.evaluate((el) => getComputedStyle(el).clipPath)
      expect(afterClipPath).toBe('none')
    })

    test(`moves focus to #main-content on ${path}`, async ({ page }) => {
      await page.goto(path)

      // Tab to skip link, then press Enter to activate it
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')

      // The focused element should now be #main-content
      const focusedId = await page.evaluate(() => {
        return (document.activeElement as HTMLElement | null)?.id ?? null
      })
      expect(focusedId).toBe('main-content')
    })
  }
})
