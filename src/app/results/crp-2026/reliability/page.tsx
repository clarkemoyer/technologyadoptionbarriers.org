import type { Metadata } from 'next'
import crpData from '@/data/crp-sensitivity-analysis.json'
import crpValidationData from '@/data/crp-validation.json'
import {
  ReliabilityContent,
  type ReliabilityData,
} from '@/components/results/reliability/ReliabilityContent'

export const metadata: Metadata = {
  title: 'CRP 2026 Scale Reliability - TABS',
  description:
    "Cronbach's alpha reliability coefficients for the Technology Adoption Barriers Survey CRP 2026 frozen dataset across three sample definitions, demonstrating excellent internal consistency.",
  alternates: {
    canonical: '/results/crp-2026/reliability',
  },
}

/**
 * Search-index seed for /results/crp-2026/reliability. See sibling live page
 * for format contract.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Scale reliability for the CRP 2026 frozen TABS dataset (N=200), assessed using Cronbach's alpha. All three TABS constructs (Barriers, Readiness, Maturity) demonstrate excellent internal consistency with every alpha exceeding 0.84 across the three CRP sample definitions (Conservative Clean, Flexible Clean, Prolific Accepted). The page reports alphas to four decimal places per construct and sample, plus extended psychometrics: bootstrap confidence intervals for alpha, alpha-if-deleted summaries for each item, and reliability stratified by demographic subgroup. References Cronbach (1951) and Nunnally and Bernstein (1994).`

export default function ReliabilityCrpPage() {
  return (
    <ReliabilityContent
      variant="crp"
      data={crpData as unknown as ReliabilityData}
      validationData={crpValidationData}
    />
  )
}
