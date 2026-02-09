/**
 * Technology Adoption Teaching Series - Navigation Structure
 *
 * Single source of truth for the teaching series section.
 * Used by:
 * - Header mega navigation
 * - In-page series navigation
 * - Sitemap generation
 */

import { normalizeQuotedTitle, slugify } from '@/lib/slugify'

export interface TeachingSeriesSlide {
  id: string
  number: number
  title: string
  segment: string
  status?: 'published' | 'coming-soon'
  isOptional?: boolean
}

export interface TeachingSeriesPart {
  id: string
  title: string
  slides: TeachingSeriesSlide[]
}

export interface TeachingSeriesStructure {
  root: {
    title: string
    slug: string
  }
  parts: TeachingSeriesPart[]
}

const pad2 = (value: number) => String(value).padStart(2, '0')

const buildSegment = (slideNumber: number, slideTitle: string) => {
  const titleSlug = slugify(slideTitle)
  return `slide-${pad2(slideNumber)}-${titleSlug || `slide-${pad2(slideNumber)}`}`
}

const slide = (
  number: number,
  rawTitle: string,
  opts?: { isOptional?: boolean; status?: 'published' | 'coming-soon' }
): TeachingSeriesSlide => {
  const title = normalizeQuotedTitle(rawTitle)
  return {
    id: `slide-${pad2(number)}`,
    number,
    title,
    segment: buildSegment(number, title),
    status: opts?.status ?? 'published',
    isOptional: opts?.isOptional ?? false,
  }
}

export const technologyAdoptionTeachingSeries: TeachingSeriesStructure = {
  root: {
    title: 'Technology Adoption Teaching Series',
    slug: '/technology-adoption-series',
  },
  parts: [
    {
      id: 'part-1',
      title: 'Part 1: What is Technology Adoption?',
      slides: [
        slide(1, 'What is Technology Adoption?'),
        slide(2, 'The Technology Adoption Framework'),
        slide(3, 'Voluntary vs. Involuntary User Adoption'),
        slide(4, 'Why Technology Dies on the Shelf'),
      ],
    },
    {
      id: 'part-2',
      title: 'Part 2: Strategic Approaches & Lifecycle Planning',
      slides: [
        slide(5, 'The Technology Adoption Framework'),
        slide(6, 'Technology Lifecycle Positioning'),
        slide(7, 'Lifecycle Position Drives Everything You Build'),
        slide(8, 'Strategic Lifecycle Positioning'),
        slide(9, 'Solution and Architecture Approaches'),
        slide(10, 'Connecting Lifecycle to Architecture Approaches'),
        slide(11, 'Lifecycle Planning for Adoption Success'),
        slide(12, 'Development Decisions That Flow From Adoption'),
      ],
    },
    {
      id: 'part-3',
      title: 'Part 3: Outcomes of Adoption',
      slides: [
        slide(13, 'Technical Capabilities That Enable Adoption'),
        slide(14, 'Measuring Adoption Success'),
        slide(15, 'Case Study: Adoption Success in Action'),
        slide(16, 'Best Practices for Voluntary Adoption'),
        slide(17, 'Q&A and Optional Deep Dives', { isOptional: true }),
        slide(18, 'Technology Lifecycle Examples in Practice', { isOptional: true }),
        slide(19, 'Common Cloud Platform Technologies', { isOptional: true }),
        slide(20, 'Technology Selection Framework', { isOptional: true }),
        slide(21, 'Anti-Patterns in Technology Adoption', { isOptional: true }),
        slide(22, 'Organizational vs User Adoption Deep Dive', { isOptional: true }),
        slide(23, 'Handling Inherited Legacy Systems', { isOptional: true }),
        slide(24, 'AI/ML Technology Adoption Considerations', { isOptional: true }),
      ],
    },
  ],
}
