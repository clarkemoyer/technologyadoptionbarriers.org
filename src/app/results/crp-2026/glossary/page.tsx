import type { Metadata } from 'next'
import ClientRedirect from '@/components/client-redirect'

export const metadata: Metadata = {
  title: 'Redirecting - TABS',
  robots: { index: false, follow: true },
  alternates: { canonical: '/results/glossary' },
}

export default function GlossaryRedirect() {
  return <ClientRedirect to="/results/glossary" />
}
