import type { Metadata } from 'next'
import crpData from '@/data/crp-sensitivity-analysis.json'
import {
  TopBarriersContent,
  type TopBarriersData,
} from '@/components/results/top-barriers/TopBarriersContent'

export const metadata: Metadata = {
  title: 'CRP 2026 Top 3 Barriers - TABS',
  description:
    'Top-3 barrier salience ranking for the TABS CRP 2026 frozen dataset (N=200). Compares forced-choice pick counts with mean-based ranking and highlights divergences between cultural and cybersecurity barriers.',
  alternates: {
    canonical: '/results/crp-2026/top-barriers',
  },
}

export default function TopBarriersCrpPage() {
  return <TopBarriersContent variant="crp" data={crpData as TopBarriersData} />
}
