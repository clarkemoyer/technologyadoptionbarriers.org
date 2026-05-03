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

export default function DataQualityLivePage() {
  return <DataQualityContent variant="live" data={liveData as unknown as DataQualityData} />
}
