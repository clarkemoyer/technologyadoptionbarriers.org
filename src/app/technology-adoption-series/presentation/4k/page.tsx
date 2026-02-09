import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'

import PresentationClient from '../presentation-client'

export const dynamic = 'force-static'

export default async function TechnologyAdoptionSeriesPresentationPage4K() {
  const slides = await getTechnologyAdoptionSeriesSlides()

  return <PresentationClient slides={slides} mode="4k" />
}
