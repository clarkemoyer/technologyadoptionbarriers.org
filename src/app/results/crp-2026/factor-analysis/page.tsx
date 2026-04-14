import type { Metadata } from 'next'
import validationData from '@/data/crp-validation.json'
import { FactorAnalysisContent } from '@/components/results/validation/FactorAnalysisContent'

export const metadata: Metadata = {
  title: 'Barrier Factor Structure - TABS CRP 2026',
  description:
    'Hierarchical factor analysis of the 18-item TABS Barriers scale showing theory-based groupings, EFA-derived 2-factor structure, and exploratory 3-group decomposition at N=200.',
  alternates: {
    canonical: '/results/crp-2026/factor-analysis',
  },
}

export default function FactorAnalysisPage() {
  return <FactorAnalysisContent data={validationData} variant="crp" />
}
