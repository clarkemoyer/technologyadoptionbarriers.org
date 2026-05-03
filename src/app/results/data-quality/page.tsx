import type { Metadata } from 'next'
import liveData from '@/data/sensitivity-analysis.json'
import {
  DataQualityContent,
  type DataQualityData,
} from '@/components/results/data-quality/DataQualityContent'

export const metadata: Metadata = {
  title: 'Data Quality Pipeline - TABS Results',
  description:
    'How the TABS project ensures data quality through multi-stage validation, disposition waterfall logic, and sensitivity analysis across five sample definitions.',
  alternates: {
    canonical: '/results/data-quality',
  },
}

/**
 * Search-index seed for /results/data-quality. The page renders the shared
 * DataQualityContent component, so generate-search-index.ts cannot extract
 * meaningful text from this shell. This template literal is picked up by
 * scripts/generate-search-index.ts in place of the auto-extracted body.
 *
 * IMPORTANT: this MUST be a single template literal - not a concatenation.
 */
export const SEARCH_CONTENT = `Data quality pipeline for the Technology Adoption Barriers Survey: how TABS ensures research-grade data through multi-stage validation, disposition waterfall logic, and sensitivity analysis across five sample definitions (Conservative Clean, Flexible Clean, Prolific Accepted, All V2 Finished, All V2). Documents the data flow from collection through validation to analysis, the quality checks applied at each stage (Prolific approval, IRI attention check, completion duration thresholds, reCAPTCHA, straightlining detection, authentication checks), edge cases discovered and resolved during the project, and the sensitivity analysis demonstrating findings are robust to inclusion criteria. All statistics are generated automatically by the daily analysis pipeline (tabs_v2_unified_data_analysis.py) and updated every time the pipeline runs.`

export default function DataQualityLivePage() {
  return <DataQualityContent variant="live" data={liveData as unknown as DataQualityData} />
}
