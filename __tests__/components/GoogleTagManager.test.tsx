import React from 'react'
import { render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock next/script BEFORE importing the component so the mock is in place
// when the module is first evaluated. This matches the established pattern in
// this repo (e.g., ClientRedirect.test.tsx).
jest.mock('next/script', () => {
  return function MockScript({
    dangerouslySetInnerHTML,
    id,
  }: {
    dangerouslySetInnerHTML?: { __html: string }
    id?: string
  }) {
    return (
      <div data-testid="mock-script" id={id} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
    )
  }
})

describe('GoogleTagManager Component XSS Protection', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset the module registry so each test gets a fresh evaluation of the
    // component module (and therefore a fresh GTM_ID constant).
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses default GTM_ID if NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID is not set', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID
    // require AFTER setting env so the module-level GTM_ID constant picks up the value
    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    const script = getByTestId('mock-script')
    expect(script.innerHTML).toContain('GTM-P5GBFCTL')
  })

  it('uses valid NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'
    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    const script = getByTestId('mock-script')
    expect(script.innerHTML).toContain('GTM-VALID123')
  })

  it('strips malicious characters from GTM_ID (XSS attempt via script injection)', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123'); alert('xss'); //"
    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    const script = getByTestId('mock-script')
    // The sanitizer strips all chars except [a-zA-Z0-9-].
    // The function-call injection must not survive (parentheses and quotes are stripped).
    expect(script.innerHTML).not.toContain("alert('xss')")
    // The raw unsanitized value must not appear verbatim in the output
    expect(script.innerHTML).not.toContain("GTM-123'); alert")
  })

  it('has no accessibility violations', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-TEST123'
    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { container } = render(<GTM />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  describe('GoogleTagManagerNoScript', () => {
    it('renders iframe with the correct GTM URL when env var is valid', () => {
      process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'
      // require AFTER env is set to get a freshly evaluated sanitizedGtmId
      const {
        GoogleTagManagerNoScript: GTMNoScript,
      } = require('../../src/components/google-tag-manager')
      // Use renderToString because jsdom's scripting-enabled noscript element does not
      // expose child nodes in the DOM; renderToString gives the full server HTML output.
      const html = renderToString(<GTMNoScript />)
      expect(html).toContain('id=GTM-VALID123')
      expect(html).toContain('https://www.googletagmanager.com/ns.html')
    })

    it('uses default GTM_ID in iframe when env var is not set', () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID
      const {
        GoogleTagManagerNoScript: GTMNoScript,
      } = require('../../src/components/google-tag-manager')
      const html = renderToString(<GTMNoScript />)
      expect(html).toContain('id=GTM-P5GBFCTL')
    })

    it('strips malicious characters from iframe src (XSS attempt)', () => {
      process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123\"><script>alert('xss')</script>"
      const {
        GoogleTagManagerNoScript: GTMNoScript,
      } = require('../../src/components/google-tag-manager')
      const html = renderToString(<GTMNoScript />)
      // The sanitizer strips [^a-zA-Z0-9-] characters, preventing tag injection.
      // The angle-bracket break-out sequences must be gone.
      expect(html).not.toContain('"><script>')
      expect(html).not.toContain("alert('xss')")
    })

    it('has no accessibility violations', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-TEST123'
      const {
        GoogleTagManagerNoScript: GTMNoScript,
      } = require('../../src/components/google-tag-manager')
      const { container } = render(<GTMNoScript />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
