'use client'

import { usePathname } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import PrevNextCards from '@/components/prev-next-cards'
import ReadingProgressBar from '@/components/reading-progress-bar'
import UnifiedNavigation, { type SeriesNavItem } from '@/components/unified-navigation'
import { resultsSeries, flattenResultsSeries, type ResultsSeriesItem } from '@/data/results-series'
import { normalizePath } from '@/lib/normalizePath'

interface ResultsNavProps {
  children: React.ReactNode
}

function mapToNavItems(items: ResultsSeriesItem[], currentPath: string): SeriesNavItem[] {
  return items.map((item) => ({
    title: item.title,
    href: item.href,
    isCurrent: !item.isGroup && normalizePath(item.href) === currentPath,
    isGroup: item.isGroup,
    children: item.children
      ? item.children.map((child) => ({
          title: child.title,
          href: child.href,
          isCurrent: normalizePath(child.href) === currentPath,
        }))
      : undefined,
  }))
}

export function ResultsNav({ children }: ResultsNavProps) {
  const pathname = usePathname()
  const currentPath = normalizePath(pathname)

  const seriesNavItems = mapToNavItems(resultsSeries, currentPath)

  const flat = flattenResultsSeries()
  const currentIndex = flat.findIndex((item) => normalizePath(item.href) === currentPath)
  const prev = currentIndex > 0 ? flat[currentIndex - 1] : null
  const next = currentIndex !== -1 && currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null

  return (
    <>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        {children}
        <PrevNextCards prev={prev} next={next} className="mt-12" />
      </div>
      <UnifiedNavigation seriesItems={seriesNavItems} seriesLabel="Results" />
      <ReadingProgressBar />
    </>
  )
}
