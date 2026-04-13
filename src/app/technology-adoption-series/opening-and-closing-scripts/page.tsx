import type { Metadata } from 'next'

import { TechnologyAdoptionSeriesResourcePage } from '../_resource-page'

export const metadata: Metadata = {
  title: 'Opening and closing scripts - Technology Adoption Teaching Series',
  description:
    'Facilitator scripts for starting and ending the Technology Adoption Teaching Series workshop.',
}

export const dynamic = 'force-static'

export default async function OpeningAndClosingScriptsPage() {
  return <TechnologyAdoptionSeriesResourcePage segment="opening-and-closing-scripts" />
}
