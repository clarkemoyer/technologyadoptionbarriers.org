import type { Metadata } from 'next'
import crpData from '@/data/crp-sensitivity-analysis.json'
import {
  SensitivityContent,
  type SensitivityData,
} from '@/components/results/sensitivity/SensitivityContent'

export const metadata: Metadata = {
  title: 'CRP 2026 Sensitivity Analysis - TABS',
  description:
    'Full sensitivity analysis for the CRP 2026 Technology Adoption Barriers Survey: every metric computed across three CRP sample definitions to demonstrate robustness to inclusion criteria.',
  alternates: {
    canonical: '/results/crp-2026/sensitivity',
  },
}

export default function SensitivityCrpPage() {
  return <SensitivityContent variant="crp" data={crpData as unknown as SensitivityData} />
}
