import React from 'react'
import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import GoogleTagManager from '../../src/components/google-tag-manager'

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

describe('GoogleTagManager Component XSS Protection', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses default GTM_ID if NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID is not set', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID
    const { getByTestId } = render(<GoogleTagManager />)
    const script = getByTestId('mock-script')
    expect(script.innerHTML).toContain('GTM-P5GBFCTL')
  })

  it('uses valid NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'

    // We need to re-import the component because GTM_ID is evaluated at the module level
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    const script = getByTestId('mock-script')
    expect(script.innerHTML).toContain('GTM-VALID123')
  })

  it('falls back to default if NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID contains malicious characters (XSS attempt)', () => {
    // Malicious payload that could break out of the string literal
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123'); alert('xss'); //"

    // We need to re-import the component because GTM_ID is evaluated at the module level
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    const script = getByTestId('mock-script')

    // Should fallback to default instead of using the malicious payload
    expect(script.innerHTML).toContain('GTM-P5GBFCTL')
    expect(script.innerHTML).not.toContain("alert('xss')")
  })

  it('NoScript renders with valid GTM_ID', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'

    // We need to re-import the component because GTM_ID is evaluated at the module level
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {
      GoogleTagManagerNoScript: GTMNoScript,
    } = require('../../src/components/google-tag-manager')
    // jsdom suppresses noscript children when scripting is enabled; use renderToStaticMarkup instead
    const html = renderToStaticMarkup(<GTMNoScript />)
    expect(html).toContain('Google Tag Manager')
    expect(html).toContain('id=GTM-VALID123')
  })

  it('NoScript falls back to default if NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID contains malicious characters', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123\"><script>alert('xss')</script>"

    // We need to re-import the component because GTM_ID is evaluated at the module level
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {
      GoogleTagManagerNoScript: GTMNoScript,
    } = require('../../src/components/google-tag-manager')
    // jsdom suppresses noscript children when scripting is enabled; use renderToStaticMarkup instead
    const html = renderToStaticMarkup(<GTMNoScript />)
    expect(html).toContain('id=GTM-P5GBFCTL')
    expect(html).not.toContain('alert')
  })
})
