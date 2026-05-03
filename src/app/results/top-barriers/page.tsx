import type { Metadata } from 'next'
import liveData from '@/data/sensitivity-analysis.json'
import {
  TopBarriersContent,
  type TopBarriersData,
} from '@/components/results/top-barriers/TopBarriersContent'

export const metadata: Metadata = {
  title: 'Top 3 Barriers (Live) - TABS',
  description:
    'Live forced-choice Top 3 barriers ranking from the growing TABS V2 dataset. Compares pick counts with continuous-rating means and updates daily as new responses are accepted on Prolific.',
  alternates: {
    canonical: '/results/top-barriers',
  },
}

/**
 * Search-index seed for /results/top-barriers. The page renders the shared
 * TopBarriersContent component, so generate-search-index.ts cannot extract
 * meaningful text from this shell. This template literal is picked up by
 * scripts/generate-search-index.ts in place of the auto-extracted body.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Top 3 barriers from the live Technology Adoption Barriers Survey, updated daily as new responses are accepted on Prolific. Forced-choice ranking shows the count of participants who selected each barrier in their top 3 from the full list of 18 candidate barriers. The page also surfaces the continuous Likert-rating mean for each barrier so readers can compare the two rankings: forced-choice surfaces salience (which barriers participants cannot ignore), and the continuous mean surfaces overall severity. Divergences between the two rankings highlight barriers whose perceived importance shifts when participants are forced to choose. Covers cultural barriers, cybersecurity barriers, infrastructure barriers, and skills-and-training barriers. Pick counts and means update daily from the unified analysis pipeline.`

export default function TopBarriersLivePage() {
  return <TopBarriersContent variant="live" data={liveData as TopBarriersData} />
}
