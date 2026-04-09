'use client'

import { usePathname } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import PrevNextCards from '@/components/prev-next-cards'
import ReadingProgressBar from '@/components/reading-progress-bar'
import UnifiedNavigation, { type SeriesNavItem } from '@/components/unified-navigation'
import {
  makingOfTabsSeries,
  flattenMakingOfTabsSeries,
  type MakingOfTabsItem,
} from '@/data/making-of-tabs-series'

interface MakingOfTabsNavProps {
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

function mapToNavItems(items: MakingOfTabsItem[], currentPath: string): SeriesNavItem[] {
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

export function MakingOfTabsNav({ children }: MakingOfTabsNavProps) {
  const pathname = usePathname()
  const currentPath = normalizePath(pathname)

  const seriesNavItems = mapToNavItems(makingOfTabsSeries, currentPath)

  const flat = flattenMakingOfTabsSeries()
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
      <UnifiedNavigation seriesItems={seriesNavItems} seriesLabel="Making of TABS" />
      <ReadingProgressBar />
    </>
  )
}
