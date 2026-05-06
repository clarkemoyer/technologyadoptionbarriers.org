import { DATA_UNAVAILABLE } from '../../src/lib/sentinelMarker'

describe('sentinelMarker', () => {
  it('exports DATA_UNAVAILABLE as a non-empty string', () => {
    expect(typeof DATA_UNAVAILABLE).toBe('string')
    expect(DATA_UNAVAILABLE.length).toBeGreaterThan(0)
  })

  it('contains the expected sentinel text', () => {
    expect(DATA_UNAVAILABLE).toContain('DATA UNAVAILABLE')
    expect(DATA_UNAVAILABLE).toContain('pipeline error')
  })

  it('is enclosed in brackets', () => {
    expect(DATA_UNAVAILABLE).toMatch(/^\[.*\]$/)
  })
})
