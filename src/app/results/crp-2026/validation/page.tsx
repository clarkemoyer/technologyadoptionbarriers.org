import type { Metadata } from 'next'
import validationData from '@/data/crp-validation.json'
import { ValidationPageContent } from '@/components/results/validation/ValidationPageContent'

export const metadata: Metadata = {
  title: 'Instrument Validation - TABS CRP 2026',
  description:
    'Comprehensive psychometric validation of the 43-item TABS instrument at N=200: reliability, factor analysis, convergent and discriminant validity, item diagnostics, and normality assessment.',
  alternates: {
    canonical: '/results/crp-2026/validation',
  },
}

export default function ValidationPage() {
  return <ValidationPageContent data={validationData} variant="crp" />
}
