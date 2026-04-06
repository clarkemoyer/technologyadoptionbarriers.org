import React from 'react'
import ReactDOMServer from 'react-dom/server'

describe('GoogleTagManager', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  it('uses default ID when no environment variable is provided', async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID

    // Import the module after resetting modules so module-level evaluation runs again
    const { GoogleTagManagerNoScript: GTMNoScript } =
      await import('@/components/google-tag-manager')

    // Use ReactDOMServer.renderToString because JSDOM sometimes struggles with noscript innerHTML
    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)
    expect(htmlString).toContain('id=GTM-P5GBFCTL')
  })

  it('uses provided ID when valid', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'

    const { GoogleTagManagerNoScript: GTMNoScript } =
      await import('@/components/google-tag-manager')

    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)
    expect(htmlString).toContain('id=GTM-VALID123')
  })

  it('falls back to default ID when provided ID contains invalid characters (XSS attempt)', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-123"><script>alert("XSS")</script>'

    const { GoogleTagManagerNoScript: GTMNoScript } =
      await import('@/components/google-tag-manager')

    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)

    // The malicious ID should be completely rejected and we fall back to default
    expect(htmlString).toContain('id=GTM-P5GBFCTL')
    expect(htmlString).not.toContain('XSS')
  })
})
