/**
 * Shared constants for the lifecycle-positioning topic page and its
 * presentation routes.  Centralised here so the slide list and
 * descriptions stay in sync across all three entry-points.
 */

import type { SectionMap } from '@/app/technology-adoption-series/presentation/presentation-client'

/** Slide numbers included in the lifecycle positioning focused deck. */
export const LIFECYCLE_SLIDE_NUMBERS = [2, 6, 25, 27, 30, 29, 32, 33, 34, 35] as const

/** Look-up set for fast filtering. */
export const LIFECYCLE_SLIDE_SET = new Set<number>(LIFECYCLE_SLIDE_NUMBERS)

/** Per-slide descriptions shown in the "Included slides" table of contents. */
export const LIFECYCLE_SLIDE_DESCRIPTIONS: Partial<Record<number, string>> = {
  2: 'Three types of adoption: organizational, individual mandatory, and individual optional.',
  6: 'The dual-curve model and target zone: balancing innovation potential against adoption risk.',
  25: 'Transition signals and decision rules for moving before lifecycle risk becomes urgent.',
  27: 'Hard Disk Drives (HDDs): a 70+ year hardware lifecycle from IBM RAMAC to SSD displacement.',
  30: 'Data center storage in 2025 through a portfolio-risk and investment-timing lens.',
  29: 'Barcode/UPC Systems: an 80+ year supply chain lifecycle with a 22-year bleeding edge.',
  32: 'Supply chain identification in 2025 through an ecosystem-coordination and standards lens.',
  33: 'ML/AI: a 75+ year lifecycle from Turing to ChatGPT with two AI winters.',
  34: 'ML/AI in 2025 through governance and workforce planning priorities.',
  35: 'LLMs in 2025 through model-ops, deprecation, and migration planning priorities.',
}

/** Deck title for the focused lifecycle positioning presentation. */
export const LIFECYCLE_DECK_TITLE = 'Technology Lifecycle Positioning'

/** Deck subtitle for the focused lifecycle positioning presentation. */
export const LIFECYCLE_DECK_SUBTITLE =
  'Strategic Adoption, the Dual-Curve Model, and Real-World Lifecycle Examples'

/** Section map for the lifecycle positioning presentation footer. */
export const LIFECYCLE_SECTIONS: SectionMap = {
  2: { label: 'FOUNDATIONS', title: 'Adoption Foundations', count: '1 slide' },
  6: { label: 'MODEL', title: 'Lifecycle Model', count: '1 slide' },
  25: { label: 'TIMELINES', title: 'Hardware & Supply Chain', count: '5 slides' },
  33: { label: 'AI / ML', title: 'AI & ML Lifecycle', count: '3 slides' },
}
