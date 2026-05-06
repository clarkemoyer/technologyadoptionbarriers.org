import {
  SIDEBAR_WIDTH,
  SIDEBAR_GAP,
  SIDEBAR_EDGE_PADDING,
  SIDEBAR_MIN_SPACE,
} from '../../src/lib/sidebar-constants'

describe('sidebar-constants', () => {
  it('exports SIDEBAR_WIDTH as a positive number', () => {
    expect(typeof SIDEBAR_WIDTH).toBe('number')
    expect(SIDEBAR_WIDTH).toBeGreaterThan(0)
  })

  it('exports SIDEBAR_GAP as a positive number', () => {
    expect(typeof SIDEBAR_GAP).toBe('number')
    expect(SIDEBAR_GAP).toBeGreaterThan(0)
  })

  it('exports SIDEBAR_EDGE_PADDING as a positive number', () => {
    expect(typeof SIDEBAR_EDGE_PADDING).toBe('number')
    expect(SIDEBAR_EDGE_PADDING).toBeGreaterThan(0)
  })

  it('SIDEBAR_MIN_SPACE equals SIDEBAR_WIDTH + SIDEBAR_GAP + SIDEBAR_EDGE_PADDING', () => {
    expect(SIDEBAR_MIN_SPACE).toBe(SIDEBAR_WIDTH + SIDEBAR_GAP + SIDEBAR_EDGE_PADDING)
  })

  it('SIDEBAR_MIN_SPACE is large enough to accommodate the sidebar', () => {
    expect(SIDEBAR_MIN_SPACE).toBeGreaterThan(SIDEBAR_WIDTH)
  })
})
