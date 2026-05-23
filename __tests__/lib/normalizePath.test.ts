import { normalizePath } from '../../src/lib/normalizePath'

describe('normalizePath utility', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('without NEXT_PUBLIC_BASE_PATH', () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_BASE_PATH
    })

    it('should return / for root path', () => {
      expect(normalizePath('/')).toBe('/')
    })

    it('should remove trailing slash from paths', () => {
      expect(normalizePath('/about/')).toBe('/about')
      expect(normalizePath('/blog/post/')).toBe('/blog/post')
    })

    it('should not change paths without trailing slash', () => {
      expect(normalizePath('/about')).toBe('/about')
    })

    it('should return / for empty string', () => {
      expect(normalizePath('')).toBe('/')
    })
  })

  describe('with NEXT_PUBLIC_BASE_PATH', () => {
    const basePath = '/docs'

    beforeEach(() => {
      process.env.NEXT_PUBLIC_BASE_PATH = basePath
    })

    it('should strip basePath from exact match and return /', () => {
      expect(normalizePath('/docs')).toBe('/')
    })

    it('should strip basePath from path with trailing slash and return /', () => {
      expect(normalizePath('/docs/')).toBe('/')
    })

    it('should strip basePath from subpaths', () => {
      expect(normalizePath('/docs/about')).toBe('/about')
      expect(normalizePath('/docs/about/')).toBe('/about')
    })

    it('should not strip basePath if it is not a full path segment', () => {
      // /docsmore does not start with /docs/ and is not equal to /docs
      expect(normalizePath('/docsmore')).toBe('/docsmore')
    })

    it('should handle paths not starting with basePath', () => {
      expect(normalizePath('/other')).toBe('/other')
      expect(normalizePath('/')).toBe('/')
    })
  })
})
