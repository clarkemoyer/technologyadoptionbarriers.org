import type { Metadata } from 'next'
import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'

import PresentationClient from '../../presentation/presentation-client'
import {
  LIFECYCLE_SLIDE_SET,
  LIFECYCLE_DECK_TITLE,
  LIFECYCLE_DECK_SUBTITLE,
  LIFECYCLE_SECTIONS,
} from '../constants'

export const metadata: Metadata = {
  title: 'Technology Lifecycle Positioning — Presentation',
  description:
    'Interactive presentation on technology lifecycle positioning: the dual-curve model, real-world timeline examples, and lifecycle cycles.',
}

export const dynamic = 'force-static'

export default async function LifecyclePositioningPresentationPage() {
  const allSlides = await getTechnologyAdoptionSeriesSlides()
  const slides = allSlides.filter((s) => LIFECYCLE_SLIDE_SET.has(s.number))

  return (
    <PresentationClient
      slides={slides}
      deckTitle={LIFECYCLE_DECK_TITLE}
      deckSubtitle={LIFECYCLE_DECK_SUBTITLE}
      sections={LIFECYCLE_SECTIONS}
    />
  )
}
