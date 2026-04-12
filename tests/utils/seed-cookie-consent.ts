import type { Page } from '@playwright/test'

const FALLBACK_COOKIE_CONSENT_STORAGE_KEY = 'cookie-consent'

const FALLBACK_COOKIE_CONSENT = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
} as const

/** Keys the cookie-consent component expects on the stored object. */
const EXPECTED_CONSENT_KEYS: ReadonlyArray<keyof typeof FALLBACK_COOKIE_CONSENT> = [
  'necessary',
  'functional',
  'analytics',
  'marketing',
]

/**
 * Lightweight shape check: parsed value must be a non-null object whose keys
 * are a superset of the expected consent keys, each with a boolean value.
 * Returns `true` only when the shape is valid.
 */
function isValidCookieConsentShape(parsed: unknown): boolean {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return false
  }
  const record = parsed as Record<string, unknown>
  return EXPECTED_CONSENT_KEYS.every((key) => typeof record[key] === 'boolean')
}

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
    const parsed = JSON.parse(storageValue)
    if (!isValidCookieConsentShape(parsed)) {
      // Valid JSON but wrong shape (e.g. `"true"`, `{}`, or missing keys) —
      // fall back to the known-good default to prevent silent banner flakiness.
      return {
        storageKey,
        storageValue: JSON.stringify(FALLBACK_COOKIE_CONSENT),
      }
    }
    return {
      storageKey,
      storageValue: JSON.stringify(parsed),
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
