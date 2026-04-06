import React from 'react'
import { render } from '@testing-library/react'
import ReactDOMServer from 'react-dom/server'
import GoogleTagManager, { GoogleTagManagerNoScript } from '@/components/google-tag-manager'

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

    // We need to require the module fresh so the module-level evaluation runs again
    const {
      default: GTM,
      GoogleTagManagerNoScript: GTMNoScript,
    } = require('@/components/google-tag-manager')

    // Use ReactDOMServer.renderToString because JSDOM sometimes struggles with noscript innerHTML
    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)
    expect(htmlString).toContain('id=GTM-P5GBFCTL')
  })

  it('uses provided ID when valid', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'

    const {
      default: GTM,
      GoogleTagManagerNoScript: GTMNoScript,
    } = require('@/components/google-tag-manager')

    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)
    expect(htmlString).toContain('id=GTM-VALID123')
  })

  it('falls back to default ID when provided ID contains invalid characters (XSS attempt)', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-123"><script>alert("XSS")</script>'

    const {
      default: GTM,
      GoogleTagManagerNoScript: GTMNoScript,
    } = require('@/components/google-tag-manager')

    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)

    // The malicious ID should be completely rejected and we fall back to default
    expect(htmlString).toContain('id=GTM-P5GBFCTL')
    expect(htmlString).not.toContain('XSS')
  })
})
