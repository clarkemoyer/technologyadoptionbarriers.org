import type { Metadata } from 'next'

import { TechnologyAdoptionSeriesResourcePage } from '../_resource-page'

export const metadata: Metadata = {
  title: 'Technology lifecycle assessment template - Technology Adoption Teaching Series',
  description:
    'A practical template for assessing technology lifecycle positioning and adoption risk.',
}

export const dynamic = 'force-static'

export default async function TechnologyLifecycleAssessmentTemplatePage() {
  return <TechnologyAdoptionSeriesResourcePage segment="technology-lifecycle-assessment-template" />
}
