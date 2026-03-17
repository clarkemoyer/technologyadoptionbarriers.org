import type { Metadata } from 'next'
import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'

import PresentationClient from '../../../presentation/presentation-client'

export const metadata: Metadata = {
  title: 'Technology Lifecycle Positioning — Presentation (4K)',
  description:
    'High-resolution 4K presentation on technology lifecycle positioning: the dual-curve model, real-world timeline examples, and lifecycle cycles.',
}

export const dynamic = 'force-static'

/** Slide numbers included in this focused topic presentation. */
const LIFECYCLE_SLIDE_NUMBERS = new Set([6, 18, 19, 20, 25, 27, 28, 29])

export default async function LifecyclePositioningPresentationPage4K() {
  const allSlides = await getTechnologyAdoptionSeriesSlides()
  const slides = allSlides.filter((s) => LIFECYCLE_SLIDE_NUMBERS.has(s.number))

  return <PresentationClient slides={slides} mode="4k" />
}
