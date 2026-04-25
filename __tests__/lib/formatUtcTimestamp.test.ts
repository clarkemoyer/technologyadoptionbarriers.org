import { formatUtcTimestamp } from '../../src/lib/formatUtcTimestamp'

describe('formatUtcTimestamp', () => {
  it('returns null for undefined input', () => {
    expect(formatUtcTimestamp(undefined)).toBeNull()
  })

  it('returns null for null input', () => {
    expect(formatUtcTimestamp(null)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(formatUtcTimestamp('')).toBeNull()
  })

  it('returns null for unparseable input', () => {
    expect(formatUtcTimestamp('not-a-date')).toBeNull()
  })

  it('formats a Z-suffixed ISO timestamp', () => {
    expect(formatUtcTimestamp('2026-04-17T08:38:12Z')).toBe('Apr 17, 2026, 8:38 AM UTC')
  })

  it('formats a +00:00 offset ISO timestamp', () => {
    expect(formatUtcTimestamp('2026-04-17T08:38:12+00:00')).toBe('Apr 17, 2026, 8:38 AM UTC')
  })

  it('trims microsecond precision to milliseconds before parsing', () => {
    // 6-digit fractional seconds must be trimmed to 3 digits so Date can parse on
    // all runtimes; the result should be the same as the 3-digit version.
    expect(formatUtcTimestamp('2026-04-17T08:38:12.123456+00:00')).toBe('Apr 17, 2026, 8:38 AM UTC')
  })

  it('preserves 3-digit millisecond precision untouched', () => {
    expect(formatUtcTimestamp('2026-04-17T08:38:12.123Z')).toBe('Apr 17, 2026, 8:38 AM UTC')
  })
})
