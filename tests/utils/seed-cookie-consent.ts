import type { Page } from '@playwright/test'

const COOKIE_CONSENT_STORAGE_KEY = 'cookie-consent'

const DEFAULT_COOKIE_CONSENT = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
} as const

const SERIALIZED_COOKIE_CONSENT = JSON.stringify(DEFAULT_COOKIE_CONSENT)

/**
 * Seeds cookie consent in localStorage via `page.addInitScript` so the
 * consent banner never appears. Call before `page.goto()`.
 */
export async function seedCookieConsent(page: Page) {
  await page.addInitScript(
    ({ storageKey, storageValue }) => {
      try {
        localStorage.setItem(storageKey, storageValue)
      } catch {
        // Ignore storage access failures in restricted init-script contexts.
      }
    },
    {
      storageKey: COOKIE_CONSENT_STORAGE_KEY,
      storageValue: SERIALIZED_COOKIE_CONSENT,
    }
  )
}
