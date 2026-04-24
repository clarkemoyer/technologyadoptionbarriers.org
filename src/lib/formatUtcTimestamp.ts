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

  // Parsing an invalid timestamp yields NaN; return null so callers render
  // their placeholder instead of shipping a misleading timestamp string.
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const month = monthNames[date.getUTCMonth()]
  const day = date.getUTCDate()
  const year = date.getUTCFullYear()
  const hours24 = date.getUTCHours()
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12

  return `${month} ${day}, ${year}, ${hours12}:${minutes} ${period} UTC`
}
