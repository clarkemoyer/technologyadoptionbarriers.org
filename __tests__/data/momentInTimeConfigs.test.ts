import { MOMENT_IN_TIME_CONFIGS } from '../../src/data/moment-in-time-configs'

describe('MOMENT_IN_TIME_CONFIGS', () => {
  it('exports an object', () => {
    expect(typeof MOMENT_IN_TIME_CONFIGS).toBe('object')
    expect(MOMENT_IN_TIME_CONFIGS).not.toBeNull()
  })

  it('contains entries for slides 30, 31, 32, and 34', () => {
    expect(MOMENT_IN_TIME_CONFIGS[30]).toBeDefined()
    expect(MOMENT_IN_TIME_CONFIGS[31]).toBeDefined()
    expect(MOMENT_IN_TIME_CONFIGS[32]).toBeDefined()
    expect(MOMENT_IN_TIME_CONFIGS[34]).toBeDefined()
  })

  it('each config has title, subtitle, asOf, stages, and source', () => {
    Object.values(MOMENT_IN_TIME_CONFIGS).forEach((config) => {
      expect(typeof config.title).toBe('string')
      expect(config.title.length).toBeGreaterThan(0)

      expect(typeof config.subtitle).toBe('string')
      expect(config.subtitle.length).toBeGreaterThan(0)

      expect(typeof config.asOf).toBe('string')
      expect(config.asOf.length).toBeGreaterThan(0)

      expect(Array.isArray(config.stages)).toBe(true)
      expect(config.stages.length).toBeGreaterThan(0)

      expect(typeof config.source).toBe('string')
    })
  })

  it('each stage has a label, color, and technologies array', () => {
    Object.values(MOMENT_IN_TIME_CONFIGS).forEach((config) => {
      config.stages.forEach((stage) => {
        expect(typeof stage.stage).toBe('string')
        expect(stage.stage.length).toBeGreaterThan(0)

        expect(typeof stage.color).toBe('string')
        expect(stage.color).toMatch(/^#[0-9a-f]{6}$/i)

        expect(Array.isArray(stage.technologies)).toBe(true)
        expect(stage.technologies.length).toBeGreaterThan(0)
      })
    })
  })

  it('each technology has a name and detail', () => {
    Object.values(MOMENT_IN_TIME_CONFIGS).forEach((config) => {
      config.stages.forEach((stage) => {
        stage.technologies.forEach((tech) => {
          expect(typeof tech.name).toBe('string')
          expect(tech.name.length).toBeGreaterThan(0)

          expect(typeof tech.detail).toBe('string')
        })
      })
    })
  })
})
