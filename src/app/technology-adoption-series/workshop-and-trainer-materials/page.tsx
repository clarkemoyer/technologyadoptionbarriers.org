import type { Metadata } from 'next'

import { TechnologyAdoptionSeriesResourcePage } from '../_resource-page'

export const metadata: Metadata = {
  title: 'Workshop and trainer materials - Technology Adoption Teaching Series',
  description:
    'Workshop agenda and trainer notes to run the Technology Adoption Teaching Series in a live session.',
}

export const dynamic = 'force-static'

export default async function WorkshopAndTrainerMaterialsPage() {
  return <TechnologyAdoptionSeriesResourcePage segment="workshop-and-trainer-materials" />
}
