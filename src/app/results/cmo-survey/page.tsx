import type { Metadata } from 'next'
import ClientRedirect from '@/components/client-redirect'

export const metadata: Metadata = {
  title: 'Redirecting - TABS',
  robots: { index: false, follow: true },
  alternates: { canonical: '/making-of-tabs/cmo-survey' },
}

export default function CMOSurveyRedirect() {
  return <ClientRedirect to="/making-of-tabs/cmo-survey" />
}
