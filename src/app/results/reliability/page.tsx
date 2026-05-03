import type { Metadata } from 'next'
import liveData from '@/data/sensitivity-analysis.json'
import liveValidationData from '@/data/live-validation.json'
import {
  ReliabilityContent,
  type ReliabilityData,
} from '@/components/results/reliability/ReliabilityContent'

export const metadata: Metadata = {
  title: 'Scale Reliability - TABS Results',
  description:
    "Cronbach's alpha reliability coefficients for the Technology Adoption Barriers Survey scales across five sample definitions, demonstrating excellent internal consistency.",
  alternates: {
    canonical: '/results/reliability',
  },
}

/**
 * Search-index seed for /results/reliability. The page renders the shared
 * ReliabilityContent component, so generate-search-index.ts cannot extract
 * meaningful text from this shell. This template literal is picked up by
 * scripts/generate-search-index.ts in place of the auto-extracted body.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Scale reliability for the Technology Adoption Barriers Survey, assessed using Cronbach's alpha (the most widely used measure of internal consistency). All three TABS constructs (Barriers, Readiness, Maturity) demonstrate excellent internal consistency with every alpha exceeding 0.84 across all five sample definitions (Conservative Clean, Flexible Clean, Prolific Accepted, All V2 Finished, All V2). The page reports alphas to four decimal places per construct and sample, plus extended psychometrics: bootstrap confidence intervals for alpha, alpha-if-deleted summaries for each item, and reliability stratified by demographic subgroup. References Cronbach (1951) and Nunnally and Bernstein (1994).`

export default function ReliabilityLivePage() {
  return (
    <ReliabilityContent
      variant="live"
      data={liveData as unknown as ReliabilityData}
      validationData={liveValidationData}
    />
  )
}
