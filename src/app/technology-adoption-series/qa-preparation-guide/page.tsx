import type { Metadata } from 'next'

import { TechnologyAdoptionSeriesResourcePage } from '../_resource-page'

export const metadata: Metadata = {
  title: 'Q&A preparation guide - Technology Adoption Teaching Series',
  description:
    'A facilitator guide for preparing questions and handling Q&A during the Technology Adoption Teaching Series.',
}

export const dynamic = 'force-static'

export default async function QAPreparationGuidePage() {
  return <TechnologyAdoptionSeriesResourcePage segment="qa-preparation-guide" />
}
