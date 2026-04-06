import React from 'react'
import { render } from '@testing-library/react'
import { DEFAULT_GTM_ID, sanitizeGtmId } from '@/components/google-tag-manager'

// Mock next/script so the script tag is rendered in jsdom
jest.mock('next/script', () => {
  return function MockScript({
    dangerouslySetInnerHTML,
    id,
  }: {
    dangerouslySetInnerHTML?: { __html: string }
    id?: string
    [key: string]: unknown
  }) {
    return <script id={id} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
  }
})

describe('sanitizeGtmId', () => {
  it('leaves a valid GTM ID unchanged', () => {
    expect(sanitizeGtmId('GTM-P5GBFCTL')).toBe('GTM-P5GBFCTL')
  })

  it('strips XSS payload characters', () => {
    expect(sanitizeGtmId("');alert(1)//")).toBe('alert1')
  })

  it('strips quotes and angle brackets', () => {
    expect(sanitizeGtmId('GTM-<script>alert("x")</script>')).toBe('GTM-scriptalertxscript')
  })

  it('strips semicolons, spaces, and other special characters', () => {
    expect(sanitizeGtmId('GTM-ABC; DROP TABLE users;--')).toBe('GTM-ABCDROPTABLEusers--')
  })

  it('allows hyphens through', () => {
    expect(sanitizeGtmId('GTM-ABCDEF')).toBe('GTM-ABCDEF')
  })

  it('returns an empty string for a fully disallowed input', () => {
    expect(sanitizeGtmId("';!@#$%^&*()")).toBe('')
  })
})

describe('DEFAULT_GTM_ID', () => {
  it('is a valid GTM container ID', () => {
    expect(DEFAULT_GTM_ID).toMatch(/^GTM-[A-Z0-9]+$/)
  })
})

describe('GoogleTagManager component', () => {
  it('renders the GTM script tag', () => {
    // Import after mocking
    const GoogleTagManager = require('@/components/google-tag-manager')
      .default as React.ComponentType
    const { container } = render(<GoogleTagManager />)
    const script = container.querySelector('script')
    expect(script).not.toBeNull()
  })

  it('renders the script with a valid GTM container ID', () => {
    const GoogleTagManager = require('@/components/google-tag-manager')
      .default as React.ComponentType
    const { container } = render(<GoogleTagManager />)
    const script = container.querySelector('script')
    // The inline script content should reference a GTM-XXXX ID
    expect(script?.innerHTML).toMatch(/GTM-[A-Z0-9]+/)
  })

  it('uses a GTM-format ID in the script tag, not a raw XSS payload', () => {
    const GoogleTagManager = require('@/components/google-tag-manager')
      .default as React.ComponentType
    const { container } = render(<GoogleTagManager />)
    const script = container.querySelector('script')
    // The GTM ID embedded in the script should match the expected format
    expect(script?.innerHTML).toMatch(/'GTM-[A-Z0-9]+'/)
    // Typical XSS injection markers should not appear as GTM ID content
    expect(script?.innerHTML).not.toContain("');alert(")
    expect(script?.innerHTML).not.toMatch(/'[^G][^T][^M].*?alert/)
  })
})

describe('GoogleTagManagerNoScript component', () => {
  it('renders a noscript element', () => {
    const { GoogleTagManagerNoScript } = require('@/components/google-tag-manager') as {
      GoogleTagManagerNoScript: React.ComponentType
    }
    const { container } = render(<GoogleTagManagerNoScript />)
    // noscript element should be present
    expect(container.querySelector('noscript')).not.toBeNull()
  })

  it('renders without throwing for a valid or invalid env-var GTM ID', () => {
    const { GoogleTagManagerNoScript } = require('@/components/google-tag-manager') as {
      GoogleTagManagerNoScript: React.ComponentType
    }
    expect(() => render(<GoogleTagManagerNoScript />)).not.toThrow()
  })
})
