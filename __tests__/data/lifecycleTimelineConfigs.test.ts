import { LIFECYCLE_CONFIGS } from '../../src/data/lifecycle-timeline-configs'

describe('LIFECYCLE_CONFIGS', () => {
  it('exports an object', () => {
    expect(typeof LIFECYCLE_CONFIGS).toBe('object')
    expect(LIFECYCLE_CONFIGS).not.toBeNull()
  })

  it('contains entries for slides 27, 28, 29, and 33', () => {
    expect(LIFECYCLE_CONFIGS[27]).toBeDefined()
    expect(LIFECYCLE_CONFIGS[28]).toBeDefined()
    expect(LIFECYCLE_CONFIGS[29]).toBeDefined()
    expect(LIFECYCLE_CONFIGS[33]).toBeDefined()
  })

  it('each config has a title, phases, note, and source', () => {
    Object.values(LIFECYCLE_CONFIGS).forEach((config) => {
      expect(typeof config.title).toBe('string')
      expect(config.title.length).toBeGreaterThan(0)

      expect(Array.isArray(config.phases)).toBe(true)
      expect(config.phases.length).toBeGreaterThan(0)

      expect(typeof config.note).toBe('string')
      expect(typeof config.source).toBe('string')
    })
  })

  it('each phase has label, years, duration, and color', () => {
    Object.values(LIFECYCLE_CONFIGS).forEach((config) => {
      config.phases.forEach((phase) => {
        expect(typeof phase.label).toBe('string')
        expect(typeof phase.years).toBe('string')
        expect(typeof phase.duration).toBe('number')
        expect(phase.duration).toBeGreaterThan(0)
        expect(typeof phase.color).toBe('string')
        expect(phase.color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })
  })
})
