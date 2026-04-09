'use client'

import { usePathname } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import PrevNextCards from '@/components/prev-next-cards'
import ReadingProgressBar from '@/components/reading-progress-bar'
import UnifiedNavigation, { type SeriesNavItem } from '@/components/unified-navigation'
import { resultsSeries, flattenResultsSeries, type ResultsSeriesItem } from '@/data/results-series'

interface ResultsNavProps {
  children: React.ReactNode
}

function normalizePath(pathname: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const withoutBasePath =
    basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname
  const withoutTrailingSlash =
    withoutBasePath.length > 1 ? withoutBasePath.replace(/\/$/, '') : withoutBasePath
  return withoutTrailingSlash || '/'
}

function mapToNavItems(items: ResultsSeriesItem[], currentPath: string): SeriesNavItem[] {
  return items.map((item) => ({
    title: item.title,
    href: item.href,
    isCurrent: normalizePath(item.href) === currentPath,
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
  const next = currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null

  return (
    <>
      <Breadcrumbs />
      {children}
      <PrevNextCards prev={prev} next={next} className="mt-12" />
      <UnifiedNavigation seriesItems={seriesNavItems} seriesLabel="Results" />
      <ReadingProgressBar />
    </>
  )
}
