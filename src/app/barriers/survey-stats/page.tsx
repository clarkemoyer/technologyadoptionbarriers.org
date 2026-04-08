import type { Metadata } from 'next'
import ClientRedirect from '@/components/client-redirect'

export const metadata: Metadata = {
  title: 'Redirecting - TABS',
  robots: { index: false, follow: true },
  alternates: { canonical: '/results/survey-stats' },
}

export default function SurveyStatsRedirect() {
  return <ClientRedirect to="/results/survey-stats" />
}
