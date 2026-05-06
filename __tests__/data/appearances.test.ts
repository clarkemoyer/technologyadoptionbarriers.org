import { appearances } from '../../src/data/appearances'

describe('appearances data', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(appearances)).toBe(true)
    expect(appearances.length).toBeGreaterThan(0)
  })

  it('each appearance has all required fields', () => {
    appearances.forEach((item) => {
      expect(typeof item.date).toBe('string')
      expect(item.date.length).toBeGreaterThan(0)

      expect(typeof item.event).toBe('string')
      expect(item.event.length).toBeGreaterThan(0)

      expect(typeof item.session).toBe('string')
      expect(item.session.length).toBeGreaterThan(0)

      expect(typeof item.topic).toBe('string')
      expect(item.topic.length).toBeGreaterThan(0)

      expect(typeof item.location).toBe('string')
      expect(item.location.length).toBeGreaterThan(0)

      expect(typeof item.description).toBe('string')
      expect(item.description.length).toBeGreaterThan(0)
    })
  })

  it('date fields have a valid ISO 8601 format (YYYY-MM-DD)', () => {
    appearances.forEach((item) => {
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
