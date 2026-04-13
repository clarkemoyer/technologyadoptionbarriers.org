import type { Metadata } from 'next'
import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'

import PresentationClient from '../../../presentation/presentation-client'
import {
  LIFECYCLE_SLIDE_SET,
  LIFECYCLE_SLIDE_NUMBERS,
  LIFECYCLE_DECK_TITLE,
  LIFECYCLE_DECK_SUBTITLE,
  LIFECYCLE_SECTIONS,
} from '../../constants'

export const metadata: Metadata = {
  title: 'Technology Lifecycle Positioning - Presentation (4K)',
  description:
    'High-resolution 4K presentation on technology lifecycle positioning: the dual-curve model, real-world timeline examples, and lifecycle cycles.',
}

export const dynamic = 'force-static'

export default async function LifecyclePositioningPresentationPage4K() {
  const allSlides = await getTechnologyAdoptionSeriesSlides()
  const order: Record<number, number> = Object.fromEntries(
    LIFECYCLE_SLIDE_NUMBERS.map((number, idx) => [number, idx])
  )
  const slides = allSlides
    .filter((s) => LIFECYCLE_SLIDE_SET.has(s.number))
    .sort((a, b) => (order[a.number] ?? 999) - (order[b.number] ?? 999))

  return (
    <PresentationClient
      slides={slides}
      mode="4k"
      deckTitle={LIFECYCLE_DECK_TITLE}
      deckSubtitle={LIFECYCLE_DECK_SUBTITLE}
      sections={LIFECYCLE_SECTIONS}
      combinedContentVisualSlides={[4]}
      visualFirstSlides={[2, 6, 25, 27, 29, 30, 32, 33, 34, 35]}
      hideTableFramesForSlides={[27, 30, 29, 32, 33, 34, 35]}
      mergeFirstTwoNonVisualFramesForSlides={[27, 29, 30, 32, 33]}
      referenceFrameLimit={2}
      appendReferenceFramesToEnd
    />
  )
}
