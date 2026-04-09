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
    title: 'TABS Full Dataset',
    href: '/results/full-dataset',
    isGroup: true,
    children: [
      { title: 'Sample & Demographics', href: '/results/sample' },
      { title: 'Descriptive Statistics', href: '/results/descriptive' },
      { title: 'Scale Reliability', href: '/results/reliability' },
      { title: 'Sensitivity Analysis', href: '/results/sensitivity' },
      { title: 'Research Findings', href: '/results/findings' },
      { title: 'Data Quality', href: '/results/data-quality' },
      { title: 'Reproducibility', href: '/results/reproducibility' },
    ],
  },
  { title: 'Dashboard', href: '/results/dashboard' },
  { title: 'Dataset Comparison', href: '/results/dataset-comparison' },
  { title: 'CMO Survey', href: '/results/cmo-survey' },
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
