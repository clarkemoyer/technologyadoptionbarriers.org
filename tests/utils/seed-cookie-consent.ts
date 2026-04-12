import type { Page } from '@playwright/test'

/**
 * Seeds cookie consent in localStorage via `page.addInitScript` so the
 * consent banner never appears. Call before `page.goto()`.
 */
export async function seedCookieConsent(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({
        necessary: true,
        functional: true,
        analytics: false,
        marketing: false,
      })
    )
  })
}
