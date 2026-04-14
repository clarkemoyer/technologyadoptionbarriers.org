'use client'

import { usePathname } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import PrevNextCards from '@/components/prev-next-cards'
import ReadingProgressBar from '@/components/reading-progress-bar'
import UnifiedNavigation from '@/components/unified-navigation'
import { flattenMakingOfTabsSeries } from '@/data/making-of-tabs-series'
import { normalizePath } from '@/lib/normalizePath'

export default function MakingOfTabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentPath = normalizePath(pathname)

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
      <UnifiedNavigation />
      <ReadingProgressBar />
    </>
  )
}
