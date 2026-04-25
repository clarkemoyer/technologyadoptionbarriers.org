import type { Metadata } from 'next'
import validationData from '@/data/live-validation.json'
import { FactorAnalysisContent } from '@/components/results/validation/FactorAnalysisContent'

export const metadata: Metadata = {
  title: 'Barrier Factor Structure - TABS Full Dataset',
  description:
    'Hierarchical factor analysis of the 18-item TABS Barriers scale showing theory-based groupings, EFA-derived 2-factor structure, and exploratory 3-group decomposition using the full dataset.',
  alternates: {
    canonical: '/results/factor-analysis',
  },
}

export default function FactorAnalysisPage() {
  return <FactorAnalysisContent data={validationData} variant="live" />
}
