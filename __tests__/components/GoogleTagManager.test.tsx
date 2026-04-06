import { render } from '@testing-library/react'
import GoogleTagManager, {
  GoogleTagManagerNoScript,
  sanitizeGtmId,
  DEFAULT_GTM_ID,
} from '@/components/google-tag-manager'

// Mock next/script so dangerouslySetInnerHTML content is inspectable in jsdom
jest.mock('next/script', () => {
  return function MockScript({
    id,
    dangerouslySetInnerHTML,
  }: {
    id: string
    dangerouslySetInnerHTML?: { __html: string }
  }) {
    return <script id={id} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
  }
})

describe('sanitizeGtmId', () => {
  it('strips disallowed characters, leaving only alphanumeric and hyphens', () => {
    expect(sanitizeGtmId("');alert(1)//")).toBe('alert1')
  })

  it('preserves valid GTM ID characters', () => {
    expect(sanitizeGtmId('GTM-P5GBFCTL')).toBe('GTM-P5GBFCTL')
  })

  it('strips angle brackets', () => {
    expect(sanitizeGtmId('GTM-<script>')).toBe('GTM-script')
  })

  it('strips quotes and semicolons', () => {
    expect(sanitizeGtmId('GTM-AB"CD;EF')).toBe('GTM-ABCDEF')
  })

  it('returns empty string when input is all disallowed characters', () => {
    expect(sanitizeGtmId('\';"<>')).toBe('')
  })
})

describe('GoogleTagManager component', () => {
  it('renders a script tag with the default GTM ID', () => {
    const { container } = render(<GoogleTagManager />)
    const script = container.querySelector('#gtm-script')
    expect(script).not.toBeNull()
    expect(script!.innerHTML).toContain(DEFAULT_GTM_ID)
  })

  it('renders the GTM ID without disallowed characters in the script tag', () => {
    const { container } = render(<GoogleTagManager />)
    const script = container.querySelector('#gtm-script')
    // Extract the GTM ID from the script content to verify it was sanitized
    const match = script!.innerHTML.match(/'dataLayer','([^']+)'/)
    expect(match).not.toBeNull()
    expect(match![1]).not.toMatch(/[^a-zA-Z0-9-]/)
  })
})

describe('GoogleTagManagerNoScript component', () => {
  // In jsdom, scripting is enabled so <noscript> content is not rendered to the DOM.
  // We verify that the component renders a noscript element without errors.
  it('renders a noscript element', () => {
    const { container } = render(<GoogleTagManagerNoScript />)
    const noscript = container.querySelector('noscript')
    expect(noscript).not.toBeNull()
  })

  it('renders without throwing', () => {
    expect(() => render(<GoogleTagManagerNoScript />)).not.toThrow()
  })
})
