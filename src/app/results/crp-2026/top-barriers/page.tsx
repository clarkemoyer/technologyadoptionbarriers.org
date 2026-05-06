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

/**
 * Search-index seed for /results/crp-2026/top-barriers. See sibling live page
 * for format contract.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Top 3 barriers from the CRP 2026 frozen TABS dataset (N=200). Forced-choice ranking shows the count of participants who selected each barrier in their top 3 from the full list of 18 candidate barriers. The page also surfaces the continuous Likert-rating mean for each barrier so readers can compare the two rankings: forced-choice surfaces salience (which barriers participants cannot ignore), and the continuous mean surfaces overall severity. Divergences between the two rankings highlight barriers whose perceived importance shifts when participants are forced to choose, with cultural barriers and cybersecurity barriers showing the largest swings in the CRP cohort. Pick counts and means are derived once from the frozen N=200 CSV and never change.`

export default function TopBarriersCrpPage() {
  return <TopBarriersContent variant="crp" data={crpData as TopBarriersData} />
}
