import type { Metadata } from 'next'
import QualtricsSurveyStats from '@/components/survey-stats/qualtrics-survey-stats'
import { ResultsNav } from '@/components/results-nav'

export const metadata: Metadata = {
  title: 'Survey Statistics — TABS Results',
  description:
    'Live survey metrics and response data from the Technology Adoption Barriers Survey (TABS), pulled from Qualtrics via GitHub Actions.',
  alternates: {
    canonical: '/results/survey-stats',
  },
}

export default function SurveyStatsPage() {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <ResultsNav>
        <div className="bg-blue-600 py-[60px] text-center text-white">
          <h1 className="text-[48px] font-bold">Survey Statistics</h1>
          <p className="text-[20px] opacity-90">
            Live metrics pulled from Qualtrics via GitHub Actions.
          </p>
        </div>
        <QualtricsSurveyStats />
      </ResultsNav>
    </main>
  )
}
