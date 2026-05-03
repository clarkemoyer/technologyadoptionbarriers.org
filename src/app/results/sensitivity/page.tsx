import type { Metadata } from 'next'
import liveData from '@/data/sensitivity-analysis.json'
import {
  SensitivityContent,
  type SensitivityData,
} from '@/components/results/sensitivity/SensitivityContent'

export const metadata: Metadata = {
  title: 'Sensitivity Analysis - TABS Results',
  description:
    'Full sensitivity analysis for the Technology Adoption Barriers Survey: every metric computed across five sample definitions to demonstrate robustness to inclusion criteria.',
  alternates: {
    canonical: '/results/sensitivity',
  },
}

export default function SensitivityLivePage() {
  return <SensitivityContent variant="live" data={liveData as unknown as SensitivityData} />
}
