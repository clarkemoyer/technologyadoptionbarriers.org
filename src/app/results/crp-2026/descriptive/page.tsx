import type { Metadata } from 'next'
import crpData from '@/data/crp-sensitivity-analysis.json'
import {
  DescriptiveContent,
  type DescriptiveData,
} from '@/components/results/descriptive/DescriptiveContent'

export const metadata: Metadata = {
  title: 'CRP 2026 Descriptive Statistics - TABS',
  description:
    'Grand means, standard deviations, and inter-construct correlations for the TABS CRP 2026 frozen dataset across barriers, readiness, and maturity constructs.',
  alternates: {
    canonical: '/results/crp-2026/descriptive',
  },
}

/**
 * Search-index seed for /results/crp-2026/descriptive. See sibling live page
 * for format contract.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Descriptive statistics for the CRP 2026 frozen TABS dataset (N=200): grand means, standard deviations, and inter-construct correlations for the three TABS constructs (Barriers, Readiness, Maturity), computed independently across the three CRP sample groups (Conservative Clean, Flexible Clean, Prolific Accepted). Per-construct sections explain Barriers (severity of technology adoption obstacles), Readiness (organizational preparedness for adoption), and Maturity (current level of technology process maturity). Correlation matrices show Pearson product-moment correlations among Barriers, Readiness, and Maturity for each CRP sample group. The page also documents the "Don't Know" response handling on Readiness and Maturity (excluded from scoring rather than mapped to a numeric value).`

export default function DescriptiveCrpPage() {
  return <DescriptiveContent variant="crp" data={crpData as unknown as DescriptiveData} />
}
