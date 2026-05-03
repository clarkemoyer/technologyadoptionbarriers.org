import type { Metadata } from 'next'
import liveData from '@/data/sensitivity-analysis.json'
import {
  SensitivityContent,
  type SensitivityData,
} from '@/components/results/sensitivity/SensitivityContent'

export const metadata: Metadata = {
  title: 'Sensitivity Analysis - TABS Results',
  description:
    'Full sensitivity analysis for the Technology Adoption Barriers Survey: every metric computed across five sample definitions to demonstrate robustness to inclusion criteria.',
  alternates: {
    canonical: '/results/sensitivity',
  },
}

/**
 * Search-index seed for /results/sensitivity. The page renders the shared
 * SensitivityContent component, so generate-search-index.ts cannot extract
 * meaningful text from this shell. This template literal is picked up by
 * scripts/generate-search-index.ts in place of the auto-extracted body.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 * The extractor only reads the first literal token after the `=` sign; a
 * `+`-joined value will be silently truncated in the search index.
 */
export const SEARCH_CONTENT = `Sensitivity analysis tests whether findings are robust to the choice of inclusion criteria. Every key metric - means, standard deviations, inter-construct correlations, and reliability coefficients - is computed independently across five nested sample definitions: Conservative Clean, Flexible Clean, Prolific Accepted, All V2 Finished, and All V2. The page documents each sample definition with N values, shows the full sensitivity table with values to four decimal places, and presents a dataset comparison view of deltas from Conservative Clean to each progressively less restrictive sample. Findings demonstrate stability of construct means (within 0.10 scale points), directionally consistent correlations between Barriers, Readiness, and Maturity, and Cronbach's alpha values above 0.84 across all samples. Constraints: Conservative Clean is a subset of Flexible Clean is a subset of Prolific Accepted is a subset of All V2; All V2 Finished is a subset of All V2; Prolific Accepted and All V2 Finished overlap but neither is a strict subset of the other.`

export default function SensitivityLivePage() {
  return <SensitivityContent variant="live" data={liveData as unknown as SensitivityData} />
}
