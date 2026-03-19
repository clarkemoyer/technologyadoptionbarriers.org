import type { Metadata } from 'next'
import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'

import PresentationClient from '../presentation-client'
import { FULL_DECK_REFERENCE_SECTION, FULL_DECK_SECTIONS } from '../full-deck-sections'

export const metadata: Metadata = {
  title: 'Teaching Series Presentation (4K)',
  description:
    'High-resolution 4K presentation slides for the Technology Adoption Barriers Survey (TABS) teaching series.',
}

export const dynamic = 'force-static'

export default async function TechnologyAdoptionSeriesPresentationPage4K() {
  const slides = await getTechnologyAdoptionSeriesSlides()

  return (
    <PresentationClient
      slides={slides}
      mode="4k"
      sections={FULL_DECK_SECTIONS}
      appendReferenceFramesToEnd
      referenceSection={FULL_DECK_REFERENCE_SECTION}
    />
  )
}
