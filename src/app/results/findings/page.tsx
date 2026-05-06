import type { Metadata } from 'next'
import liveData from '@/data/sensitivity-analysis.json'
import liveValidationData from '@/data/live-validation.json'
import { FindingsContent, type FindingsData } from '@/components/results/findings/FindingsContent'

export const metadata: Metadata = {
  title: 'Key Findings - TABS Results',
  description:
    'Effect sizes, cross-tabulations, t-tests, and ANOVA from the Technology Adoption Barriers Survey, computed independently across four result groups.',
  alternates: {
    canonical: '/results/findings',
  },
}

/**
 * Search-index seed for /results/findings. The page renders the shared
 * FindingsContent component, so generate-search-index.ts cannot extract
 * meaningful text from this shell. This template literal is picked up by
 * scripts/generate-search-index.ts in place of the auto-extracted body.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Key findings from the Technology Adoption Barriers Survey: effect sizes (Cohen's d), cross-tabulations, Welch's t-tests, and one-way ANOVA, all computed independently across four primary result groups (Conservative Clean, Flexible Clean, Prolific Accepted, All V2 Finished). Compares Technical (CIO/CTO) vs Non-Technical and Large vs Small/Medium organization groups across Barriers, Readiness, and Maturity constructs. Includes inferential extensions (mediation analysis, per-factor regressions, standardized sub-factor regressions, equivalence testing via TOST, and power analysis). Each test reports n values, t/F statistics, degrees of freedom, p-values, and significance flags at alpha = 0.05.`

export default function FindingsLivePage() {
  return (
    <FindingsContent
      variant="live"
      data={liveData as unknown as FindingsData}
      validationData={liveValidationData}
    />
  )
}
