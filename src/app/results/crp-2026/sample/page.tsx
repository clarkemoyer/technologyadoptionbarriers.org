import type { Metadata } from 'next'
import crpData from '@/data/crp-sensitivity-analysis.json'
import { SampleContent, type SampleData } from '@/components/results/sample/SampleContent'

export const metadata: Metadata = {
  title: 'CRP 2026 Sample & Demographics - TABS',
  description:
    'Participant demographics for the Technology Adoption Barriers Survey across three result groups: roles, industries, organization sizes, and geographic distribution.',
  alternates: {
    canonical: '/results/crp-2026/sample',
  },
}

/**
 * Search-index seed for /results/crp-2026/sample. See sibling live page
 * for format contract.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Sample and demographics for the CRP 2026 frozen TABS dataset (N=200): per-group breakdowns of roles (CIO, CTO, CISO, CEO, CFO, CHRO, CMO, CSO, CRO, COO, Other), organization sizes (under 100 to over 10,000), profit models (For-Profit, Non-Profit, Government), and Technical vs Non-Technical role classification with explicit transparency into how each Other-role free-text response is bucketed via TECH_TITLES, NONTECH_TITLES, and the regex patterns in classify_role_binary(). Demographics are computed independently for the three primary CRP sample groups (Conservative Clean, Flexible Clean, Prolific Accepted). Demographic data is collected from two independent sources documented on the page: Survey Demographics (Qualtrics, questions Q1 through Q9) and Platform Demographics (Prolific base and prescreener fields). The page also documents the Prolific study prescreening criteria and includes a Prolific x Qualtrics demographic overlap table for cross-validation. Counts shown as <5 are k-anonymity suppressed.`

export default function SampleCrpPage() {
  return <SampleContent variant="crp" data={crpData as unknown as SampleData} />
}
