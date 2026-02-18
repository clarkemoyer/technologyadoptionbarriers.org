import type { Metadata } from 'next'
import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'

import PresentationClient from './presentation-client'

export const metadata: Metadata = {
  title: 'Teaching Series Presentation',
  description:
    'Interactive presentation slides for the Technology Adoption Barriers Survey (TABS) teaching series on technology adoption models and frameworks.',
}

export const dynamic = 'force-static'

export default async function TechnologyAdoptionSeriesPresentationPage() {
  const slides = await getTechnologyAdoptionSeriesSlides()

  return <PresentationClient slides={slides} />
}
