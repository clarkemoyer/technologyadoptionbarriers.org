import type { Page } from '@playwright/test'

/* ------------------------------------------------------------------
 * Global type augmentation - lets helpers reference
 * `window.__seedCookieConsentError` without unsafe casts.
 * Because this file already has top-level exports, TypeScript treats
 * it as a module, so `declare global` properly augments the browser
 * `Window` interface.
 * ----------------------------------------------------------------*/
declare global {
  interface Window {
    __seedCookieConsentError?: string
  }
}

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
  /**
   * When `true`, localStorage failures inside the init script set the
   * deterministic in-page flag `window.__seedCookieConsentError` with the
   * error message.  Use {@link assertCookieConsentSeeded} after navigation
   * to surface the failure as a test-level error.
   *
   * Defaults to `true` when the `CI` env var is set, `false` otherwise.
   */
  strict?: boolean
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

  const strict = options?.strict ?? Boolean(process.env.CI)

  try {
    const parsed = JSON.parse(storageValue)
    if (!isValidCookieConsentShape(parsed)) {
      // Valid JSON but wrong shape (e.g. `"true"`, `{}`, or missing keys) -
      // fall back to the known-good default to prevent silent banner flakiness.
      return {
        storageKey,
        storageValue: JSON.stringify(FALLBACK_COOKIE_CONSENT),
        strict,
      }
    }
    return {
      storageKey,
      storageValue: JSON.stringify(parsed),
      strict,
    }
  } catch {
    // storageValue is not valid JSON - fall back to the known-good default.
    return {
      storageKey,
      storageValue: JSON.stringify(FALLBACK_COOKIE_CONSENT),
      strict,
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
  const { storageKey, storageValue, strict } = resolveCookieConsentSeed(options)

  await page.addInitScript(
    ({ storageKey: initStorageKey, storageValue: initStorageValue, strict: initStrict }) => {
      // Clear any stale error flag from a previous navigation/init-script
      // run so a successful setItem doesn't trip assertCookieConsentSeeded().
      window.__seedCookieConsentError = undefined
      try {
        localStorage.setItem(initStorageKey, initStorageValue)
      } catch (err) {
        if (initStrict) {
          // Set a deterministic in-page flag so assertCookieConsentSeeded()
          // can surface the failure as a test-level error after navigation.
          window.__seedCookieConsentError = err instanceof Error ? err.message : String(err)
        }
      }
    },
    {
      storageKey,
      storageValue,
      strict,
    }
  )
}

/**
 * Asserts that cookie consent was successfully seeded in localStorage.
 *
 * Call **after** `page.goto()` to verify the init-script succeeded.
 * Uses the same storage-key resolution as {@link seedCookieConsent}, so
 * per-call overrides and environment-based configuration stay in sync.
 * Throws a targeted error when strict mode detected a localStorage failure
 * (via the `window.__seedCookieConsentError` flag) or when the storage key
 * is missing entirely.
 */
export async function assertCookieConsentSeeded(page: Page, options?: CookieConsentSeedOptions) {
  const { storageKey } = resolveCookieConsentSeed(options)
  const error = await page.evaluate(() => window.__seedCookieConsentError)
  if (error) {
    throw new Error(`[seedCookieConsent] localStorage.setItem failed in strict mode: ${error}`)
  }

  const value = await page.evaluate((key) => localStorage.getItem(key), storageKey)
  if (value === null) {
    throw new Error(
      `[seedCookieConsent] localStorage key "${storageKey}" was not set after navigation`
    )
  }
}
