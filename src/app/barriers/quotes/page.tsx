import type { Metadata } from 'next'
import QuotesPageClient from './quotes-client'

export const metadata: Metadata = {
  title: 'Famous Quotes on Technology Adoption | TABS',
  description:
    "Explore 50+ famous quotes about technology adoption, innovation, and resistance to change — from ancient philosophers to modern AI leaders. A curated chronological journey through humanity's relationship with new technology.",
  keywords: [
    'technology adoption quotes',
    'innovation quotes',
    'technology resistance quotes',
    'diffusion of innovations',
    'digital transformation quotes',
    'famous technology quotes',
    'AI adoption quotes',
  ],
  openGraph: {
    title: 'Famous Quotes on Technology Adoption | TABS',
    description:
      'Explore 50+ famous quotes about technology adoption, from ancient philosophers to modern AI leaders.',
    type: 'website',
  },
}

export default function QuotesPage() {
  return <QuotesPageClient />
}
