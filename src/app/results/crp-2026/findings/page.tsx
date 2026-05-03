import type { Metadata } from 'next'
import crpData from '@/data/crp-sensitivity-analysis.json'
import crpValidationData from '@/data/crp-validation.json'
import { FindingsContent, type FindingsData } from '@/components/results/findings/FindingsContent'

export const metadata: Metadata = {
  title: 'CRP 2026 Key Findings - TABS',
  description:
    'Effect sizes, cross-tabulations, t-tests, and ANOVA from the CRP 2026 replication, computed independently across three CRP sample definitions.',
  alternates: {
    canonical: '/results/crp-2026/findings',
  },
}

/**
 * Search-index seed for /results/crp-2026/findings. See sibling live page
 * for format contract.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Key findings from the CRP 2026 frozen TABS dataset (N=200): effect sizes (Cohen's d), cross-tabulations, Welch's t-tests, and one-way ANOVA, all computed independently across three CRP sample definitions (Conservative Clean, Flexible Clean, Prolific Accepted). Compares Technical vs Non-Technical and Large vs Small/Medium organization groups across Barriers, Readiness, and Maturity constructs. Includes inferential extensions (mediation analysis, per-factor regressions, standardized sub-factor regressions, equivalence testing via TOST, and power analysis). Each test reports n values, t/F statistics, degrees of freedom, p-values, and significance flags at alpha = 0.05.`

export default function FindingsCrpPage() {
  return (
    <FindingsContent
      variant="crp"
      data={crpData as unknown as FindingsData}
      validationData={crpValidationData}
    />
  )
}
