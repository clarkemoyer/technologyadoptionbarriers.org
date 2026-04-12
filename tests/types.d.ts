/**
 * Global type augmentation for custom in-page flags used by E2E test helpers.
 *
 * Declaring these on `Window` lets helpers like `seedCookieConsent` access
 * `window.__seedCookieConsentError` without unsafe `as unknown as Record`
 * casts, improving discoverability and compile-time safety.
 *
 * The `export {}` makes this file a module so that `declare global` properly
 * augments the global `Window` interface from within TypeScript's module system.
 */
export {}

declare global {
  interface Window {
    __seedCookieConsentError?: string
  }
}
