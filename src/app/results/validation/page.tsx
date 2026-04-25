import type { Metadata } from 'next'
import validationData from '@/data/live-validation.json'
import { ValidationPageContent } from '@/components/results/validation/ValidationPageContent'

export const metadata: Metadata = {
  title: 'Instrument Validation - TABS Full Dataset',
  description:
    'Comprehensive psychometric validation of the 43-item TABS instrument using the full dataset: reliability, factor analysis, convergent and discriminant validity, item diagnostics, and normality assessment.',
  alternates: {
    canonical: '/results/validation',
  },
}

export default function ValidationPage() {
  return <ValidationPageContent data={validationData} variant="live" />
}
