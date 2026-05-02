import type { Metadata } from 'next'
import QualtricsSurveyStats from '@/components/survey-stats/qualtrics-survey-stats'
export const metadata: Metadata = {
  title: 'Response Funnel - TABS Results',
  description:
    'Every count the TABS daily pipeline tracks - Qualtrics raw responses, Prolific submissions, disposition triage, attention-check pass rates - with the API source and an explanation for each number.',
  alternates: {
    canonical: '/results/survey-stats',
  },
}

export default function SurveyStatsPage() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <div className="bg-blue-600 py-[60px] text-center text-white">
        <h1 className="text-[48px] font-bold">Response Funnel</h1>
        <p className="text-[20px] opacity-90">
          From raw Qualtrics submissions to the final analysis dataset — every step, every count.
        </p>
      </div>
      <QualtricsSurveyStats />
    </div>
  )
}
