import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'

import { TechnologyAdoptionSeriesPresentationClient } from './presentation-client'

export const dynamic = 'force-static'

export default async function TechnologyAdoptionSeriesPresentationPage() {
  const slides = await getTechnologyAdoptionSeriesSlides()

  return <TechnologyAdoptionSeriesPresentationClient slides={slides} />
}
