import type { Metadata } from 'next'
import crpData from '@/data/crp-sensitivity-analysis.json'
import {
  DataQualityContent,
  type DataQualityData,
} from '@/components/results/data-quality/DataQualityContent'

export const metadata: Metadata = {
  title: 'CRP 2026 Data Quality - TABS',
  description:
    'How the TABS project ensures data quality through multi-stage validation, disposition waterfall logic, and sensitivity analysis across 3 primary groups.',
  alternates: {
    canonical: '/results/crp-2026/data-quality',
  },
}

export default function DataQualityCrpPage() {
  return <DataQualityContent variant="crp" data={crpData as unknown as DataQualityData} />
}
