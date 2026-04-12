import type { Page } from '@playwright/test'

const FALLBACK_COOKIE_CONSENT_STORAGE_KEY = 'cookie-consent'

const FALLBACK_COOKIE_CONSENT = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
} as const

type CookieConsentSeedOptions = {
  storageKey?: string
  storageValue?: string
}

function resolveCookieConsentSeed(options?: CookieConsentSeedOptions) {
  const storageKey =
    options?.storageKey ??
    process.env.PLAYWRIGHT_COOKIE_CONSENT_STORAGE_KEY ??
    FALLBACK_COOKIE_CONSENT_STORAGE_KEY

  const storageValue =
    options?.storageValue ??
    process.env.PLAYWRIGHT_COOKIE_CONSENT_STORAGE_VALUE ??
    JSON.stringify(FALLBACK_COOKIE_CONSENT)

  try {
    return {
      storageKey,
      storageValue: JSON.stringify(JSON.parse(storageValue)),
    }
  } catch {
    // storageValue is not valid JSON — fall back to the known-good default.
    return {
      storageKey,
      storageValue: JSON.stringify(FALLBACK_COOKIE_CONSENT),
    }
  }
}

/**
 * Seeds cookie consent in localStorage via `page.addInitScript` so the
 * consent banner never appears. Call before `page.goto()`.
 *
 * The storage key/value can be supplied by test setup via environment
 * variables or per-call overrides, which avoids coupling this helper to a
 * single hardcoded app-side schema.
 */
export async function seedCookieConsent(page: Page, options?: CookieConsentSeedOptions) {
  const { storageKey, storageValue } = resolveCookieConsentSeed(options)

  await page.addInitScript(
    ({ storageKey: initStorageKey, storageValue: initStorageValue }) => {
      try {
        localStorage.setItem(initStorageKey, initStorageValue)
      } catch {
        // Ignore storage access failures in restricted init-script contexts.
      }
    },
    {
      storageKey,
      storageValue,
    }
  )
}
