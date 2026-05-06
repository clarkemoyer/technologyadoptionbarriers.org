import { normalizePath } from '../../src/lib/normalizePath'

describe('normalizePath', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('without basePath', () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_BASE_PATH
    })

    it('returns the path as-is for a normal path', () => {
      expect(normalizePath('/about')).toBe('/about')
    })

    it('strips a trailing slash from a path', () => {
      expect(normalizePath('/about/')).toBe('/about')
    })

    it('preserves root "/" without stripping', () => {
      expect(normalizePath('/')).toBe('/')
    })

    it('handles a multi-segment path', () => {
      expect(normalizePath('/foo/bar/baz')).toBe('/foo/bar/baz')
    })

    it('strips trailing slash from a multi-segment path', () => {
      expect(normalizePath('/foo/bar/')).toBe('/foo/bar')
    })
  })

  describe('with basePath', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/repo'
    })

    it('strips the basePath prefix from a matching path', () => {
      expect(normalizePath('/repo/about')).toBe('/about')
    })

    it('returns "/" when the pathname equals the basePath exactly', () => {
      expect(normalizePath('/repo')).toBe('/')
    })

    it('does not strip a non-matching prefix', () => {
      expect(normalizePath('/other/about')).toBe('/other/about')
    })

    it('strips basePath and trailing slash', () => {
      expect(normalizePath('/repo/about/')).toBe('/about')
    })
  })
})
