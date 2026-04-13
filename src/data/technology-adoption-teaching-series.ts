/**
 * Technology Adoption Teaching Series - Navigation Structure
 *
 * Single source of truth for the teaching series section.
 * Used by:
 * - Header mega navigation
 * - In-page series navigation
 * - Sitemap generation
 */

import {
  buildTeachingSeriesSlideId,
  buildTeachingSeriesSlideSegment,
} from '@/lib/technology-adoption-teaching-series-segment'
import { normalizeQuotedTitle } from '@/lib/slugify'

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

export interface TeachingSeriesResource {
  id: string
  title: string
  segment: string
  sourceFile: string
  status?: 'published' | 'coming-soon'
}

export interface TeachingSeriesStructure {
  root: {
    title: string
    slug: string
  }
  parts: TeachingSeriesPart[]
}

const slide = (
  number: number,
  rawTitle: string,
  opts?: { isOptional?: boolean; status?: 'published' | 'coming-soon' }
): TeachingSeriesSlide => {
  const title = normalizeQuotedTitle(rawTitle)
  return {
    id: buildTeachingSeriesSlideId(number),
    number,
    title,
    segment: buildTeachingSeriesSlideSegment(number, title),
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
        slide(5, 'A Strategic Approach to Technology Adoption'),
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
        slide(25, 'Technology Lifecycle Cycles', { isOptional: true }),
        slide(26, 'The Trifecta of Adoption', { isOptional: true }),
        slide(27, 'Hardware Lifecycle Timeline: HDDs', { isOptional: true }),
        slide(28, 'Software Lifecycle Timeline: Adobe Flash', { isOptional: true }),
        slide(29, 'Supply Chain Lifecycle Timeline: Barcodes', { isOptional: true }),
        slide(30, 'Data Center Storage: A Moment in Time (2025)', { isOptional: true }),
        slide(31, 'Rich Web Experiences: A Moment in Time (2025)', { isOptional: true }),
        slide(32, 'Supply Chain Identification: A Moment in Time (2025)', { isOptional: true }),
        slide(33, 'ML/AI Lifecycle Timeline: Machine Learning & Artificial Intelligence', {
          isOptional: true,
        }),
        slide(34, 'ML/AI: A Moment in Time (2025)', { isOptional: true }),
        slide(35, 'Large Language Models: A Moment in Time (2025)', { isOptional: true }),
      ],
    },
  ],
}

export const technologyAdoptionTeachingSeriesResources: TeachingSeriesResource[] = [
  {
    id: 'opening-and-closing-scripts',
    title: 'Opening and closing scripts',
    segment: 'opening-and-closing-scripts',
    sourceFile: '02-opening-and-closing-scripts.md',
    status: 'published',
  },
  {
    id: 'qa-preparation-guide',
    title: 'Q&A preparation guide',
    segment: 'qa-preparation-guide',
    sourceFile: '03-qa-preparation-guide.md',
    status: 'published',
  },
  {
    id: 'handout-materials',
    title: 'Handout materials',
    segment: 'handout-materials',
    sourceFile: '04-handout-materials.md',
    status: 'published',
  },
  {
    id: 'technology-lifecycle-assessment-template',
    title: 'Technology lifecycle assessment template',
    segment: 'technology-lifecycle-assessment-template',
    sourceFile: '05-technology-lifecycle-assessment-template.md',
    status: 'published',
  },
  {
    id: 'workshop-and-trainer-materials',
    title: 'Workshop and trainer materials',
    segment: 'workshop-and-trainer-materials',
    sourceFile: '06-workshop-and-trainer-materials.md',
    status: 'published',
  },
]
