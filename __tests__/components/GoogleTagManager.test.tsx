import React from 'react'
import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock next/script so it renders a deterministic element in jsdom
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ id }: { id?: string }) => <div data-testid="gtm-script" id={id} />,
}))

const DEFAULT_GTM_ID = 'GTM-P5GBFCTL'

describe('GoogleTagManager', () => {
  beforeEach(() => {
    jest.resetModules()
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID
  })

  it('renders without crashing using the default GTM ID', () => {
    const { default: GoogleTagManager } = require('@/components/google-tag-manager')
    const { container } = render(<GoogleTagManager />)
    expect(container.querySelector('[data-testid="gtm-script"]')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { default: GoogleTagManager } = require('@/components/google-tag-manager')
    const { container } = render(<GoogleTagManager />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('GoogleTagManagerNoScript', () => {
  beforeEach(() => {
    jest.resetModules()
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID
  })

  it('renders the noscript iframe with the default GTM ID', () => {
    const { GoogleTagManagerNoScript } = require('@/components/google-tag-manager')
    // Use renderToStaticMarkup: jsdom hides <noscript> content when scripting is enabled
    const html = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain('Google Tag Manager')
    expect(html).toContain(DEFAULT_GTM_ID)
  })

  it('includes the GTM ID in the iframe src attribute', () => {
    const { GoogleTagManagerNoScript } = require('@/components/google-tag-manager')
    const html = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain(`id=${DEFAULT_GTM_ID}`)
  })

  it('uses a valid custom GTM ID from the environment variable', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-VALID123'
    const { GoogleTagManagerNoScript } = require('@/components/google-tag-manager')
    const html = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain('GTM-VALID123')
    expect(html).not.toContain(DEFAULT_GTM_ID)
  })

  it('falls back to the default GTM ID when the env variable contains invalid characters', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'INVALID ID!'
    const { GoogleTagManagerNoScript } = require('@/components/google-tag-manager')
    const html = renderToStaticMarkup(<GoogleTagManagerNoScript />)
    expect(html).toContain(DEFAULT_GTM_ID)
    expect(html).not.toContain('INVALID ID!')
  })

  it('has no accessibility violations', async () => {
    const { GoogleTagManagerNoScript } = require('@/components/google-tag-manager')
    const { container } = render(<GoogleTagManagerNoScript />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
