import type { Metadata } from 'next'
import liveData from '@/data/sensitivity-analysis.json'
import { SampleContent, type SampleData } from '@/components/results/sample/SampleContent'

export const metadata: Metadata = {
  title: 'Sample & Demographics - TABS Results',
  description:
    'Participant demographics for the Technology Adoption Barriers Survey across four result groups: roles, industries, organization sizes, and geographic distribution.',
  alternates: {
    canonical: '/results/sample',
  },
}

/**
 * Search-index seed for /results/sample. The page renders the shared
 * SampleContent component, so generate-search-index.ts cannot extract
 * meaningful text from this shell. This template literal is picked up
 * by scripts/generate-search-index.ts in place of the auto-extracted
 * body.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Sample and demographics for the Technology Adoption Barriers Survey: per-group breakdowns of roles (CIO, CTO, CEO, CFO, CHRO, CMO, CSO, CRO, COO, Other), organization sizes (under 100 to over 10,000), profit models (For-Profit, Non-Profit, Government), and Technical vs Non-Technical role classification. Demographics are computed independently for the four primary live result groups (Conservative Clean, Flexible Clean, Prolific Accepted, All V2 Finished). Demographic data is collected from two independent sources documented on the page: Survey Demographics (Qualtrics, questions Q1 through Q9) and Platform Demographics (Prolific base and prescreener fields). The page also documents the Prolific study prescreening criteria (Country of Residence, Employment Status, Employer Type, Company Size, Job Position) used for participant recruitment, and includes a Prolific x Qualtrics demographic overlap table that enables independent cross-validation of self-reported data.`

export default function SampleLivePage() {
  return <SampleContent variant="live" data={liveData as unknown as SampleData} />
}
