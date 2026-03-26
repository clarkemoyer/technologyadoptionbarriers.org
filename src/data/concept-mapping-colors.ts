/** Section color definitions for TABS concept mapping views (Simple & Complex). */
export const SECTIONS = [
  { key: 'A', label: 'Section A: Demographics', bg: '#D9E2F3', text: '#1f3864' },
  {
    key: 'B',
    label: 'Section B: Perceived Technology Adoption Barriers',
    bg: '#FFF2CC',
    text: '#7f6000',
  },
  {
    key: 'C',
    label: 'Section C: Perceived Organizational Technology Readiness',
    bg: '#FCE4D6',
    text: '#833c0b',
  },
  {
    key: 'D',
    label: 'Section D: Perceived Maturity of Organizational Capabilities',
    bg: '#E2EFDA',
    text: '#375623',
  },
  { key: 'E', label: 'Section E: Final Thoughts & Feedback', bg: '#F2F2F2', text: '#404040' },
] as const

/** Type of a single section definition from the SECTIONS tuple. */
export type SectionDef = (typeof SECTIONS)[number]
