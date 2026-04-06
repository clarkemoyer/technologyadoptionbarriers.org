import React from 'react'
import { render } from '@testing-library/react'

// Mock next/script before importing the component (pattern from ClientRedirect.test.tsx)
jest.mock('next/script', () => {
  return function MockScript({
    dangerouslySetInnerHTML,
    id,
  }: {
    dangerouslySetInnerHTML?: { __html: string }
    id?: string
  }) {
    return (
      <div data-testid={id ?? 'mock-script'} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
    )
  }
})

import { sanitizeGtmId } from '../../src/components/google-tag-manager'

// ─────────────────────────────────────────────────────────────────────────────
// sanitizeGtmId helper – unit tests for the exported sanitization logic.
// Testing the helper directly avoids duplicating the regex in each component
// test while still giving full coverage of every sanitization rule.
// ─────────────────────────────────────────────────────────────────────────────
describe('sanitizeGtmId helper', () => {
  it('returns the input unchanged for a valid GTM ID', () => {
    expect(sanitizeGtmId('GTM-P5GBFCTL')).toBe('GTM-P5GBFCTL')
    expect(sanitizeGtmId('GTM-VALID123')).toBe('GTM-VALID123')
    expect(sanitizeGtmId('GTM-ABC')).toBe('GTM-ABC')
  })

  it('returns the default ID when the input is undefined', () => {
    expect(sanitizeGtmId(undefined)).toBe('GTM-P5GBFCTL')
  })

  it('returns the default ID when the input is an empty string', () => {
    expect(sanitizeGtmId('')).toBe('GTM-P5GBFCTL')
  })

  it('returns the default ID when the input contains script-injection characters', () => {
    expect(sanitizeGtmId("GTM-123'); alert('xss'); //")).toBe('GTM-P5GBFCTL')
    expect(sanitizeGtmId('GTM-123"><script>alert("xss")</script>')).toBe('GTM-P5GBFCTL')
    expect(sanitizeGtmId('GTM 123')).toBe('GTM-P5GBFCTL')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GoogleTagManager component – integration tests.
// GTM_ID is a module-level constant, so we must re-require the module after
// changing process.env.  jest.resetModules() in beforeEach ensures each test
// gets a fresh module with its own GTM_ID evaluation.
// ─────────────────────────────────────────────────────────────────────────────
describe('GoogleTagManager component', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('embeds a valid GTM ID from the env var in the script', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'

    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    expect(getByTestId('gtm-script').innerHTML).toContain('GTM-VALID123')
  })

  it('falls back to the default GTM ID in the script when the env var is absent', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID

    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    expect(getByTestId('gtm-script').innerHTML).toContain('GTM-P5GBFCTL')
  })

  it('falls back to the default GTM ID in the script when the env var contains malicious characters', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123'); alert('xss'); //"

    const { default: GTM } = require('../../src/components/google-tag-manager')
    const { getByTestId } = render(<GTM />)
    const html = getByTestId('gtm-script').innerHTML
    expect(html).toContain('GTM-P5GBFCTL')
    expect(html).not.toContain("alert('xss')")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GoogleTagManagerNoScript component – integration tests.
// Uses the same re-require pattern.  JSDOM treats <noscript> as empty because
// it simulates a JS-enabled environment, so we use renderToStaticMarkup to
// inspect the server-rendered HTML which includes the inner <iframe>.
// ─────────────────────────────────────────────────────────────────────────────
describe('GoogleTagManagerNoScript component', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('renders the iframe with a valid GTM ID in the src', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'

    const { GoogleTagManagerNoScript } = require('../../src/components/google-tag-manager')

    const { renderToStaticMarkup } = require('react-dom/server')
    const html: string = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain('id=GTM-VALID123')
  })

  it('falls back to the default GTM ID in the iframe src when the env var is absent', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID

    const { GoogleTagManagerNoScript } = require('../../src/components/google-tag-manager')

    const { renderToStaticMarkup } = require('react-dom/server')
    const html: string = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain('id=GTM-P5GBFCTL')
  })

  it('falls back to the default GTM ID in the iframe src when the env var is malicious', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123\"><script>alert('xss')</script>"

    const { GoogleTagManagerNoScript } = require('../../src/components/google-tag-manager')

    const { renderToStaticMarkup } = require('react-dom/server')
    const html: string = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain('id=GTM-P5GBFCTL')
    expect(html).not.toContain('alert')
  })
})
