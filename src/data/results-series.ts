export interface ResultsSeriesItem {
  title: string
  href: string
  /** When true, item is a non-navigable grouping header (excluded from prev/next) */
  isGroup?: boolean
  children?: ResultsSeriesItem[]
}

export const resultsSeries: ResultsSeriesItem[] = [
  { title: 'Results Overview', href: '/results' },
  {
    title: 'CRP 2026',
    href: '/results/crp-2026',
    children: [
      { title: 'Sample & Demographics', href: '/results/crp-2026/sample' },
      { title: 'Descriptive Statistics', href: '/results/crp-2026/descriptive' },
      { title: 'Sensitivity Analysis', href: '/results/crp-2026/sensitivity' },
      { title: 'Scale Reliability', href: '/results/crp-2026/reliability' },
      { title: 'Key Findings', href: '/results/crp-2026/findings' },
      { title: 'Data Quality', href: '/results/crp-2026/data-quality' },
      { title: 'Factor Analysis', href: '/results/crp-2026/factor-analysis' },
      { title: 'Instrument Validation', href: '/results/crp-2026/validation' },
      { title: 'Top 3 Barriers', href: '/results/crp-2026/top-barriers' },
    ],
  },
  {
    title: 'TABS Full Dataset',
    href: '/results/full-dataset',
    isGroup: true,
    children: [
      { title: 'Sample & Demographics', href: '/results/sample' },
      { title: 'Descriptive Statistics', href: '/results/descriptive' },
      { title: 'Scale Reliability', href: '/results/reliability' },
      { title: 'Sensitivity Analysis', href: '/results/sensitivity' },
      { title: 'Key Findings', href: '/results/findings' },
      { title: 'Data Quality', href: '/results/data-quality' },
      { title: 'Factor Analysis', href: '/results/factor-analysis' },
      { title: 'Instrument Validation', href: '/results/validation' },
      { title: 'Top 3 Barriers', href: '/results/top-barriers' },
    ],
  },
  {
    title: 'Shared',
    href: '/results',
    isGroup: true,
    children: [
      { title: 'Statistics Glossary', href: '/results/glossary' },
      { title: 'Reproducibility', href: '/results/reproducibility' },
    ],
  },
  { title: 'Dashboard', href: '/results/dashboard' },
  { title: 'Dataset Comparison', href: '/results/dataset-comparison' },
  { title: 'Survey Statistics', href: '/results/survey-stats' },
]

/** Flat ordered list for prev/next navigation (excludes group-only nodes) */
export function flattenResultsSeries(): Array<{
  title: string
  href: string
}> {
  const result: Array<{ title: string; href: string }> = []
  function walk(items: ResultsSeriesItem[]) {
    for (const item of items) {
      if (!item.isGroup) {
        result.push({ title: item.title, href: item.href })
      }
      if (item.children) walk(item.children)
    }
  }
  walk(resultsSeries)
  return result
}
