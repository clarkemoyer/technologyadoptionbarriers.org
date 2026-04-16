import type { Metadata } from 'next'
import ClientRedirect from '@/components/client-redirect'

export const metadata: Metadata = {
  title: 'Redirecting - TABS',
  robots: { index: false, follow: true },
  alternates: {
    canonical: '/bibliography-1-8-personal-computing-utilization-thompson-1991',
  },
}

export default function BibliographyRedirect() {
  return <ClientRedirect to="/bibliography-1-8-personal-computing-utilization-thompson-1991" />
}
