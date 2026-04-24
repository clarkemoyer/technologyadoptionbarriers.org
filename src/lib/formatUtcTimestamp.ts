/**
 * Formats an ISO timestamp string as a human-readable UTC date/time string.
 *
 * Trims fractional seconds to millisecond precision before parsing to avoid
 * issues with microsecond-precision timestamps on some runtimes.
 *
 * Returns null when the input is absent or falsy so callers can render a
 * placeholder (e.g. "—") instead of silently displaying incorrect data.
 *
 * @example
 * formatUtcTimestamp('2026-04-17T08:38:12.123456+00:00')
 * // => 'Apr 17, 2026, 8:38 AM UTC'
 */
export function formatUtcTimestamp(timestamp?: string | null): string | null {
  if (!timestamp) {
    return null
  }

  const normalizedTimestamp = timestamp.replace(/\.\d{4,}/, (match: string) => match.slice(0, 4))
  const date = new Date(normalizedTimestamp)

  // `toLocaleString` on an invalid Date yields "Invalid Date"; return null so
  // callers render their placeholder instead of shipping "Invalid Date UTC".
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return `${date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  })} UTC`
}
