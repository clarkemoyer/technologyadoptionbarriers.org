/**
 * Sentinel string rendered on Results pages when pipeline data is missing or malformed.
 * Used as a visible error indicator in the UI; the post-deploy smoke test no longer scans
 * for this string automatically, but it remains useful as a human-readable fallback.
 */
export const DATA_UNAVAILABLE = '[DATA UNAVAILABLE - pipeline error]'
