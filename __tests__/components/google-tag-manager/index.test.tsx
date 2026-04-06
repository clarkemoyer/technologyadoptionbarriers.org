import ReactDOMServer from 'react-dom/server'
import { DEFAULT_GTM_ID } from '@/components/google-tag-manager'

describe('GoogleTagManager', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Clear module cache so module-level constants re-evaluate
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  it('uses default ID when no environment variable is provided', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID

    const { GoogleTagManagerNoScript: GTMNoScript } = require('@/components/google-tag-manager')

    // Use ReactDOMServer.renderToString because JSDOM sometimes struggles with noscript innerHTML
    const htmlString = ReactDOMServer.renderToString(<GTMNoScript />)
    expect(htmlString).toContain(`id=${DEFAULT_GTM_ID}`)
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
    expect(htmlString).toContain(`id=${DEFAULT_GTM_ID}`)
    expect(htmlString).not.toContain('XSS')
  })

  it('uses default GTM ID in script output when env var is invalid', () => {
    process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-EVIL"><script>alert("XSS")</script>'

    // jest.doMock is called AFTER jest.resetModules() (in beforeEach) so it registers
    // the mock in a clean state. The subsequent require() picks up this mock correctly.
    let capturedHtml = ''
    jest.doMock('next/script', () => ({
      __esModule: true,
      default: ({ dangerouslySetInnerHTML }: { dangerouslySetInnerHTML?: { __html: string } }) => {
        if (dangerouslySetInnerHTML) capturedHtml = dangerouslySetInnerHTML.__html
        return null
      },
    }))

    const { default: GoogleTagManager } = require('@/components/google-tag-manager')

    ReactDOMServer.renderToString(<GoogleTagManager />)

    // The malicious ID must not appear in the script; the safe default must be used
    expect(capturedHtml).toContain(DEFAULT_GTM_ID)
    expect(capturedHtml).not.toContain('XSS')
  })
})
