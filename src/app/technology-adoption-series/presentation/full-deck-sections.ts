import type { SectionMap } from './presentation-client'

export const FULL_DECK_SECTIONS: SectionMap = {
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
}

export const FULL_DECK_REFERENCE_SECTION = {
  startSlide: 36,
  label: 'REFERENCES',
  title: 'References',
  count: 'All source citations',
} as const
