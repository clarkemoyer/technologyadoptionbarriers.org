import type { Metadata } from 'next'
import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'

import PresentationClient from './presentation-client'

const FULL_DECK_SECTIONS = {
  1: {
    label: 'PART 1',
    title: 'What is Technology Adoption?',
    count: '4 slides',
  },
  5: {
    label: 'PART 2',
    title: 'Strategic Approaches & Lifecycle Planning',
    count: '8 slides',
  },
  13: {
    label: 'PART 3',
    title: 'Outcomes of Adoption',
    count: '4 slides',
  },
  17: { label: 'Q & A', title: 'Questions & Answers', count: '' },
  18: {
    label: 'OPTIONAL',
    title: 'Deep-Dive Slides',
    count: '18 slides',
  },
  36: {
    label: 'REFERENCES',
    title: 'References',
    count: 'All source citations',
  },
} as const

export const metadata: Metadata = {
  title: 'Teaching Series Presentation',
  description:
    'Interactive presentation slides for the Technology Adoption Barriers Survey (TABS) teaching series on technology adoption models and frameworks.',
}

export const dynamic = 'force-static'

export default async function TechnologyAdoptionSeriesPresentationPage() {
  const slides = await getTechnologyAdoptionSeriesSlides()

  return (
    <PresentationClient
      slides={slides}
      sections={FULL_DECK_SECTIONS}
      appendReferenceFramesToEnd
      referenceSection={{
        startSlide: 36,
        label: 'REFERENCES',
        title: 'References',
        count: 'All source citations',
      }}
    />
  )
}
