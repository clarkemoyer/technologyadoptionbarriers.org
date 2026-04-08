import type { Metadata } from 'next'

import { TechnologyAdoptionSeriesResourcePage } from '../_resource-page'

export const metadata: Metadata = {
  title: 'Handout materials - Technology Adoption Teaching Series',
  description:
    'Printable participant handouts to support the Technology Adoption Teaching Series session.',
}

export const dynamic = 'force-static'

export default async function HandoutMaterialsPage() {
  return <TechnologyAdoptionSeriesResourcePage segment="handout-materials" />
}
