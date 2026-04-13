import type { LifecyclePhase } from '@/components/technology-adoption-series/lifecycle-timeline-bar'

export interface LifecycleTimelineConfig {
  title: string
  phases: LifecyclePhase[]
  note: string
  source: string
}

/**
 * Shared lifecycle phase data for slides 27-29 and 33.
 * Used by slide-render.tsx (overview cards) and presentation-visuals.tsx (full-screen charts).
 */
export const LIFECYCLE_CONFIGS: Record<number, LifecycleTimelineConfig> = {
  27: {
    title: 'Hardware: Hard Disk Drives (HDDs)',
    phases: [
      { label: 'Bleeding Edge', years: '1956–1970', duration: 14, color: '#fbbf24' },
      { label: 'Leading Edge', years: '1970–1985', duration: 15, color: '#22d3ee' },
      { label: 'Mainstream', years: '1985–2015', duration: 30, color: '#22c55e' },
      { label: 'Trending Behind', years: '2015–2028', duration: 13, color: '#f97316' },
      {
        label: 'End of Support',
        years: '2028+',
        duration: 5,
        color: '#ef4444',
        textColor: '#fff',
      },
    ],
    note: 'Long mainstream (30 yrs) creates right-skewed curve',
    source: 'Computer History Museum (2024); IDC HDD Forecast (2024)',
  },
  28: {
    title: 'Software: Adobe Flash',
    phases: [
      { label: 'Bleeding Edge', years: '1996–2000', duration: 4, color: '#fbbf24' },
      { label: 'Leading Edge', years: '2000–2005', duration: 5, color: '#22d3ee' },
      { label: 'Mainstream', years: '2005–2012', duration: 7, color: '#22c55e' },
      { label: 'Trending Behind', years: '2012–2017', duration: 5, color: '#f97316' },
      {
        label: 'End of Support',
        years: '2017–2020',
        duration: 3,
        color: '#ef4444',
        textColor: '#fff',
      },
      {
        label: 'End of Life',
        years: '2020–2021',
        duration: 1,
        color: '#991b1b',
        textColor: '#fff',
      },
    ],
    note: 'Compressed EOL (1 yr) after HTML5 displaced it',
    source: 'Adobe Flash EOL Page (2020); W3Techs (2023)',
  },
  29: {
    title: 'Supply Chain: Barcode / UPC Systems',
    phases: [
      { label: 'Bleeding Edge', years: '1952–1974', duration: 22, color: '#fbbf24' },
      { label: 'Leading Edge', years: '1974–1985', duration: 11, color: '#22d3ee' },
      { label: 'Mainstream', years: '1985–2020', duration: 35, color: '#22c55e' },
      { label: 'Trending Behind', years: '2020–2030', duration: 10, color: '#f97316' },
      {
        label: 'End of Support',
        years: '2030+',
        duration: 5,
        color: '#ef4444',
        textColor: '#fff',
      },
    ],
    note: 'Extremely long bleeding edge (22 yrs) - infrastructure lag',
    source: 'GS1 Barcode History (2024); McKinsey Supply Chain 4.0 (2024)',
  },
  33: {
    title: 'ML/AI: Machine Learning & Artificial Intelligence',
    phases: [
      { label: 'Bleeding Edge', years: '1950–1997', duration: 47, color: '#fbbf24' },
      { label: 'Leading Edge', years: '1997–2020', duration: 23, color: '#22d3ee' },
      { label: 'Mainstream', years: '2020–2030+', duration: 10, color: '#22c55e' },
    ],
    note: 'Longest bleeding edge of any example (47 yrs) - multiple AI winters delayed adoption',
    source:
      'Stanford HAI AI Index (2024); Turing (1950); McCarthy Dartmouth (1956); Krizhevsky/AlexNet (2012)',
  },
}
