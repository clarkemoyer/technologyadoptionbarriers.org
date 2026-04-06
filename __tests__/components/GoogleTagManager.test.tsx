import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { render } from '@testing-library/react'

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
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses default GTM_ID if NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID is not set', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID

    let GTM!: React.FC
    jest.isolateModules(() => {
      GTM = require('../../src/components/google-tag-manager').default
    })

    const { getByTestId } = render(<GTM />)
    const script = getByTestId('mock-script')
    expect(script.innerHTML).toContain('GTM-P5GBFCTL')
  })

  it('uses valid NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'

    let GTM!: React.FC
    jest.isolateModules(() => {
      GTM = require('../../src/components/google-tag-manager').default
    })

    const { getByTestId } = render(<GTM />)
    const script = getByTestId('mock-script')
    expect(script.innerHTML).toContain('GTM-VALID123')
  })

  it('falls back to default if NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID contains malicious characters (XSS attempt)', () => {
    // Malicious payload that could break out of the string literal
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123'); alert('xss'); //"

    let GTM!: React.FC
    jest.isolateModules(() => {
      GTM = require('../../src/components/google-tag-manager').default
    })

    const { getByTestId } = render(<GTM />)
    const script = getByTestId('mock-script')

    // Should fall back to default instead of using the malicious payload
    expect(script.innerHTML).toContain('GTM-P5GBFCTL')
    expect(script.innerHTML).not.toContain("alert('xss')")
  })

  it('NoScript uses valid GTM_ID', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'

    let GoogleTagManagerNoScript!: React.FC
    jest.isolateModules(() => {
      GoogleTagManagerNoScript =
        require('../../src/components/google-tag-manager').GoogleTagManagerNoScript
    })

    const html = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain('id=GTM-VALID123')
    expect(html).not.toContain('GTM-P5GBFCTL')
  })

  it('NoScript falls back to default if NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID contains malicious characters', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = "GTM-123\"><script>alert('xss')</script>"

    let GoogleTagManagerNoScript!: React.FC
    jest.isolateModules(() => {
      GoogleTagManagerNoScript =
        require('../../src/components/google-tag-manager').GoogleTagManagerNoScript
    })

    const html = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain('id=GTM-P5GBFCTL')
    expect(html).not.toContain('alert')
  })
})
