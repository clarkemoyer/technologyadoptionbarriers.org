import type { Metadata } from 'next'
import crpData from '@/data/crp-sensitivity-analysis.json'
import {
  SensitivityContent,
  type SensitivityData,
} from '@/components/results/sensitivity/SensitivityContent'

export const metadata: Metadata = {
  title: 'CRP 2026 Sensitivity Analysis - TABS',
  description:
    'Full sensitivity analysis for the CRP 2026 Technology Adoption Barriers Survey: every metric computed across three CRP sample definitions to demonstrate robustness to inclusion criteria.',
  alternates: {
    canonical: '/results/crp-2026/sensitivity',
  },
}

/**
 * Search-index seed for /results/crp-2026/sensitivity. The page renders the
 * shared SensitivityContent component, so generate-search-index.ts cannot
 * extract meaningful text from this shell. See sibling live page for the
 * format contract.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Sensitivity analysis for the CRP 2026 frozen dataset (N=200) tests whether findings are robust to the choice of inclusion criteria. Every key metric - means, standard deviations, inter-construct correlations, and reliability coefficients - is computed independently across three nested CRP sample definitions: Conservative Clean, Flexible Clean, and Prolific Accepted. The page documents each sample definition with N values, shows the full sensitivity table with values to four decimal places, and presents a dataset comparison view of deltas from Conservative Clean to each progressively less restrictive sample. Findings demonstrate stability of construct means (within 0.10 scale points), directionally consistent correlations between Barriers, Readiness, and Maturity, and Cronbach's alpha values above 0.84 across all samples. Constraints: Conservative Clean is a subset of Flexible Clean is a subset of Prolific Accepted.`

export default function SensitivityCrpPage() {
  return <SensitivityContent variant="crp" data={crpData as unknown as SensitivityData} />
}
