import type { Metadata } from 'next'
import ClientRedirect from '@/components/client-redirect'

export const metadata: Metadata = {
  title: 'Redirecting - TABS',
  robots: { index: false, follow: true },
  alternates: { canonical: '/results/data-quality' },
}

export default function DataAnalysisRedirect() {
  return <ClientRedirect to="/results/data-quality" />
}
