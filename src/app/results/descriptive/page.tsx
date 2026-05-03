import type { Metadata } from 'next'
import liveData from '@/data/sensitivity-analysis.json'
import {
  DescriptiveContent,
  type DescriptiveData,
} from '@/components/results/descriptive/DescriptiveContent'

export const metadata: Metadata = {
  title: 'Descriptive Statistics - TABS Results',
  description:
    'Grand means, standard deviations, and inter-construct correlations for the Technology Adoption Barriers Survey across barriers, readiness, and maturity constructs.',
  alternates: {
    canonical: '/results/descriptive',
  },
}

/**
 * Search-index seed for /results/descriptive. The page renders the shared
 * DescriptiveContent component, so generate-search-index.ts cannot extract
 * meaningful text from this shell. This template literal is picked up by
 * scripts/generate-search-index.ts in place of the auto-extracted body.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Descriptive statistics for the Technology Adoption Barriers Survey: grand means, standard deviations, and inter-construct correlations for the three TABS constructs (Barriers, Readiness, Maturity). Construct-level grand means and SDs are reported across all five live sample definitions (Conservative Clean, Flexible Clean, Prolific Accepted, All V2 Finished, and All V2). Inter-construct correlation matrices are reported for the four primary result groups (Conservative Clean, Flexible Clean, Prolific Accepted, All V2 Finished). Per-construct sections explain Barriers (severity of technology adoption obstacles), Readiness (organizational preparedness for adoption), and Maturity (current level of technology process maturity). Correlation matrices show Pearson product-moment correlations among Barriers, Readiness, and Maturity for each result group. The page also documents the "Don't Know" response handling on Readiness and Maturity (excluded from scoring rather than mapped to a numeric value).`

export default function DescriptiveLivePage() {
  return <DescriptiveContent variant="live" data={liveData as unknown as DescriptiveData} />
}
