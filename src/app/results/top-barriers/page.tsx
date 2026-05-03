import type { Metadata } from 'next'
import liveData from '@/data/sensitivity-analysis.json'
import {
  TopBarriersContent,
  type TopBarriersData,
} from '@/components/results/top-barriers/TopBarriersContent'

export const metadata: Metadata = {
  title: 'Top 3 Barriers (Live) - TABS',
  description:
    'Live forced-choice Top 3 barriers ranking from the growing TABS V2 dataset. Compares pick counts with continuous-rating means and updates daily as new responses are accepted on Prolific.',
  alternates: {
    canonical: '/results/top-barriers',
  },
}

export default function TopBarriersLivePage() {
  return <TopBarriersContent variant="live" data={liveData as TopBarriersData} />
}
