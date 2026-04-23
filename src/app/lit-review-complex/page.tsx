import type { Metadata } from 'next'
import RedirectClient from './components/redirect-client'

/**
 * Permanent redirect stub: /lit-review-complex → /making-of-tabs/mind-maps/literature-review
 *
 * The route was deployed briefly under this slug before being reorganised.
 * Because this is a static export (GitHub Pages) Next.js `redirects()` in
 * next.config.ts are not available; this client-side redirect is the
 * lightest-weight equivalent.  The canonical tag and noindex directive ensure
 * search engines follow the new URL instead of indexing this stub.
 */
export const metadata: Metadata = {
  title: 'Redirecting… | Making of TABS',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/making-of-tabs/mind-maps/literature-review',
  },
}

export default function LitReviewComplexRedirectPage() {
  return <RedirectClient />
}
