/**
 * Shared constants for the lifecycle-positioning topic page and its
 * presentation routes.  Centralised here so the slide list and
 * descriptions stay in sync across all three entry-points.
 */

import type { SectionMap } from '@/app/technology-adoption-series/presentation/presentation-client'

/** Slide numbers included in the lifecycle positioning focused deck. */
export const LIFECYCLE_SLIDE_NUMBERS = [
  6, 18, 19, 20, 25, 27, 28, 29, 30, 31, 32, 33, 34, 35,
] as const

/** Look-up set for fast filtering. */
export const LIFECYCLE_SLIDE_SET = new Set<number>(LIFECYCLE_SLIDE_NUMBERS)

/** Per-slide descriptions shown in the "Included slides" table of contents. */
export const LIFECYCLE_SLIDE_DESCRIPTIONS: Partial<Record<number, string>> = {
  6: 'The dual-curve model showing innovation potential vs adoption risk across five lifecycle stages.',
  18: 'Real-world examples of technologies at each lifecycle stage.',
  19: 'Common cloud platform technologies categorized by lifecycle position.',
  20: 'A framework for evaluating and selecting technologies within lifecycle context.',
  25: 'How lifecycle positions change over time and what drives transitions.',
  27: 'Hard Disk Drives (HDDs): a 70+ year hardware lifecycle from IBM RAMAC to SSD displacement.',
  28: 'Adobe Flash: a 25-year software lifecycle from dominance to complete removal.',
  29: 'Barcode/UPC Systems: an 80+ year supply chain lifecycle with a 22-year bleeding edge.',
  30: 'Data center storage landscape frozen at 2025 — companion to the HDD timeline.',
  31: 'Rich web experience technologies frozen at 2025 — companion to the Flash timeline.',
  32: 'Supply chain identification landscape frozen at 2025 — companion to the barcode timeline.',
  33: 'ML/AI: a 75+ year lifecycle from Turing to ChatGPT with two AI winters.',
  34: 'ML/AI landscape frozen at 2025 — from AGI at bleeding edge to expert systems at end of life.',
  35: 'Large Language Models frozen at 2025 — the fastest-moving sub-domain in technology.',
}

/** Deck title for the focused lifecycle positioning presentation. */
export const LIFECYCLE_DECK_TITLE = 'Technology Lifecycle Positioning'

/** Deck subtitle for the focused lifecycle positioning presentation. */
export const LIFECYCLE_DECK_SUBTITLE =
  'The Dual-Curve Model, Real-World Timelines, and Selection Frameworks'

/** Section map for the lifecycle positioning presentation footer. */
export const LIFECYCLE_SECTIONS: SectionMap = {
  6: { label: 'MODEL', title: 'Lifecycle Model', count: '1 slide' },
  18: {
    label: 'DEEP DIVE',
    title: 'Examples & Frameworks',
    count: '3 slides',
  },
  25: { label: 'TIMELINES', title: 'Lifecycle Timelines', count: '7 slides' },
  33: { label: 'AI / ML', title: 'AI & ML Lifecycle', count: '3 slides' },
}
