import React from 'react'
import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import GoogleTagManager, {
  GoogleTagManagerNoScript,
  sanitizeGtmId,
} from '../../src/components/google-tag-manager'

// Mock next/script
jest.mock('next/script', () => {
  return function MockScript({
    dangerouslySetInnerHTML,
  }: {
    dangerouslySetInnerHTML: { __html: string }
  }) {
    return <div data-testid="mock-script" dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
  }
})

// ---------------------------------------------------------------------------
// Unit tests for the exported sanitizeGtmId helper
// ---------------------------------------------------------------------------
describe('sanitizeGtmId', () => {
  it('accepts a valid GTM ID containing only alphanumeric chars and hyphens', () => {
    expect(sanitizeGtmId('GTM-P5GBFCTL')).toBe('GTM-P5GBFCTL')
    expect(sanitizeGtmId('GTM-VALID123')).toBe('GTM-VALID123')
    expect(sanitizeGtmId('GTM-ABC-DEF')).toBe('GTM-ABC-DEF')
  })

  it('falls back to the default for an ID that contains special characters (XSS attempt)', () => {
    expect(sanitizeGtmId("GTM-123'); alert('xss'); //")).toBe('GTM-P5GBFCTL')
    expect(sanitizeGtmId("GTM-123\"><script>alert('xss')</script>")).toBe('GTM-P5GBFCTL')
    expect(sanitizeGtmId('GTM-123 withspace')).toBe('GTM-P5GBFCTL')
  })

  it('falls back to the default for an empty string', () => {
    expect(sanitizeGtmId('')).toBe('GTM-P5GBFCTL')
  })
})

// ---------------------------------------------------------------------------
// Integration tests for the GoogleTagManager (script) component
// ---------------------------------------------------------------------------
describe('GoogleTagManager component', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses the default GTM_ID when NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID is not set', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID
    const { getByTestId } = render(<GoogleTagManager />)
    expect(getByTestId('mock-script').innerHTML).toContain('GTM-P5GBFCTL')
  })

  it('uses a valid NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'
    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    expect(getByTestId('mock-script').innerHTML).toContain('GTM-VALID123')
  })

  it('falls back to the default when NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID contains malicious characters', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123'); alert('xss'); //"
    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    const html = getByTestId('mock-script').innerHTML
    expect(html).toContain('GTM-P5GBFCTL')
    expect(html).not.toContain("alert('xss')")
  })
})

// ---------------------------------------------------------------------------
// Integration tests for the GoogleTagManagerNoScript component
// ---------------------------------------------------------------------------
describe('GoogleTagManagerNoScript component', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // jsdom (with JS enabled) suppresses <noscript> children in the DOM, so we
  // use renderToStaticMarkup to obtain the full HTML and inspect the iframe src.

  it('renders a noscript element containing an iframe pointing to the GTM noscript URL', () => {
    const html = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain('googletagmanager.com/ns.html')
    expect(html).toContain('GTM-P5GBFCTL')
  })

  it('uses a valid NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID in the noscript iframe src', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'
    const {
      GoogleTagManagerNoScript: GTMNoScript,
    } = require('../../src/components/google-tag-manager')
    const html = renderToStaticMarkup(<GTMNoScript />)
    expect(html).toContain('id=GTM-VALID123')
  })

  it('falls back to the default in the noscript iframe src when NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID contains malicious characters', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123\"><script>alert('xss')</script>"
    const {
      GoogleTagManagerNoScript: GTMNoScript,
    } = require('../../src/components/google-tag-manager')
    const html = renderToStaticMarkup(<GTMNoScript />)
    expect(html).toContain('id=GTM-P5GBFCTL')
    expect(html).not.toContain('alert')
  })
})
