import ReactDOMServer from 'react-dom/server'

// Mock next/script to avoid hook issues in test environment
jest.mock('next/script', () => {
  return function MockScript({
    dangerouslySetInnerHTML,
  }: {
    dangerouslySetInnerHTML?: { __html: string }
  }) {
    if (dangerouslySetInnerHTML) {
      return <script dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
    }
    return null
  }
})

describe('GoogleTagManager', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  it('uses default ID when no environment variable is provided', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID

    const { GoogleTagManagerNoScript: GTMNoScript } = require('@/components/google-tag-manager')

    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)
    expect(htmlString).toContain('id=GTM-P5GBFCTL')
  })

  it('uses provided ID when valid', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'

    const { GoogleTagManagerNoScript: GTMNoScript } = require('@/components/google-tag-manager')

    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)
    expect(htmlString).toContain('id=GTM-VALID123')
  })

  it('falls back to default ID when provided ID contains invalid characters (XSS attempt)', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-123"><script>alert("XSS")</script>'

    const { GoogleTagManagerNoScript: GTMNoScript } = require('@/components/google-tag-manager')

    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)

    // The malicious ID should be completely rejected and we fall back to default
    expect(htmlString).toContain('id=GTM-P5GBFCTL')
    expect(htmlString).not.toContain('XSS')
  })

  it('falls back to default ID in GoogleTagManager script when env var is invalid', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-BAD<ID>'

    const { default: GTMComponent } = require('@/components/google-tag-manager')

    const htmlString = ReactDOMServer.renderToString(<GTMComponent />)

    // The invalid ID should be rejected; script payload should reference the default ID
    expect(htmlString).toContain('GTM-P5GBFCTL')
    expect(htmlString).not.toContain('GTM-BAD')
  })
})
