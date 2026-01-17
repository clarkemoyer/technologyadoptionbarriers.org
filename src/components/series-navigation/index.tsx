'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { technologyAdoptionModelsSeries } from '@/data/technology-adoption-models-series'
import { H2_CLASSES } from '@/lib/articleStyles'

type LinkState = {
  title: string
  slug?: string
  status?: 'published' | 'coming-soon'
}

const normalizePath = (pathname: string) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const withoutBasePath =
    basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname
  const withoutTrailingSlash =
    withoutBasePath.length > 1 ? withoutBasePath.replace(/\/$/, '') : withoutBasePath
  return withoutTrailingSlash || '/'
}

const isComingSoon = (item: LinkState) => item.status === 'coming-soon'

const isLinkable = (item: LinkState) => Boolean(item.slug)

const NavRowItem = ({
  item,
  isCurrent,
  label,
  variant = 'default',
}: {
  item: LinkState
  isCurrent: boolean
  label: string
  variant?: 'default' | 'prominent'
}) => {
  const baseClasses =
    variant === 'prominent'
      ? 'inline-flex items-center rounded px-3 py-2 text-base sm:text-lg font-sans font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
      : 'inline-flex items-center rounded px-2 py-1 text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'

  const currentClasses = isCurrent
    ? 'bg-blue-50 text-blue-900'
    : isComingSoon(item)
      ? 'text-gray-700 hover:bg-gray-100'
      : 'text-blue-700 hover:bg-blue-50'

  if (!isLinkable(item)) {
    return (
      <span
        className={`${baseClasses} ${isCurrent ? 'bg-blue-50 text-blue-900' : 'text-gray-700'} cursor-default`}
        aria-current={isCurrent ? 'page' : undefined}
      >
        <span className="sr-only">{label}: </span>
        {item.title}
        {isComingSoon(item) ? <span className="ml-1 text-gray-600">(Coming soon)</span> : null}
      </span>
    )
  }

  return (
    <Link
      href={item.slug!}
      className={`${baseClasses} ${currentClasses}`}
      aria-current={isCurrent ? 'page' : undefined}
    >
      <span className="sr-only">{label}: </span>
      {item.title}
    </Link>
  )
}

const BranchListItem = ({ item, isCurrent }: { item: LinkState; isCurrent: boolean }) => {
  const common =
    'rounded px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'

  if (!isLinkable(item)) {
    return (
      <span
        className={`${common} ${isCurrent ? 'font-semibold text-gray-900' : 'text-gray-700'} cursor-default`}
        aria-current={isCurrent ? 'page' : undefined}
      >
        {item.title}
        {isComingSoon(item) ? <span className="ml-1 text-gray-600">(Coming soon)</span> : null}
      </span>
    )
  }

  return (
    <Link
      href={item.slug!}
      className={`${common} ${isCurrent ? 'font-semibold text-gray-900 underline decoration-2 decoration-blue-500' : isComingSoon(item) ? 'text-gray-700 hover:underline' : 'text-blue-700 hover:underline'}`}
      aria-current={isCurrent ? 'page' : undefined}
    >
      {item.title}
      {isComingSoon(item) ? <span className="ml-1 text-gray-600">(Coming soon)</span> : null}
    </Link>
  )
}

const SeriesNavigation = ({ className }: { className?: string }) => {
  const pathname = usePathname() || '/'
  const currentPath = normalizePath(pathname)

  const { root, branches, bibliography } = technologyAdoptionModelsSeries

  const currentBranch =
    branches.find(
      (branch) =>
        normalizePath(branch.slug) === currentPath ||
        branch.articles.some((article) => normalizePath(article.slug) === currentPath)
    ) || null

  const previousNext = React.useMemo(() => {
    if (!currentBranch) return null

    const items: LinkState[] = [
      { title: 'Branch introduction', slug: currentBranch.slug, status: 'published' },
      ...currentBranch.articles.map((a) => ({ title: a.title, slug: a.slug, status: a.status })),
    ]

    const currentIndex = items.findIndex((i) => normalizePath(i.slug || '') === currentPath)
    if (currentIndex === -1) return null

    return {
      prev: currentIndex > 0 ? items[currentIndex - 1] : null,
      next: currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
    }
  }, [currentBranch, currentPath])

  return (
    <section
      className={`mb-10 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100 ${className || ''}`}
      aria-labelledby="series-navigation-heading"
    >
      <h2 id="series-navigation-heading" className={H2_CLASSES}>
        Series navigation
      </h2>

      <nav aria-label="Technology Adoption Models series navigation" className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <NavRowItem
            label="Series root"
            item={{ title: root.title, slug: root.slug, status: 'published' }}
            isCurrent={normalizePath(root.slug) === currentPath}
            variant="prominent"
          />

          {bibliography ? (
            <NavRowItem
              label="Bibliography"
              item={{ title: bibliography.title, slug: bibliography.slug, status: 'published' }}
              isCurrent={normalizePath(bibliography.slug) === currentPath}
            />
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {branches.map((branch) => (
            <div key={branch.id}>
              <div className="font-bold text-gray-900">
                <BranchListItem
                  item={{ title: branch.title, slug: branch.slug, status: 'published' }}
                  isCurrent={normalizePath(branch.slug) === currentPath}
                />
              </div>
              <ul className="mt-2 space-y-1 text-sm font-sans">
                {branch.articles.map((article) => (
                  <li key={article.id}>
                    <BranchListItem
                      item={{ title: article.title, slug: article.slug, status: article.status }}
                      isCurrent={normalizePath(article.slug) === currentPath}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {previousNext ? (
          <div className="pt-3 border-t border-gray-200 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="text-sm">
              <span className="font-semibold text-gray-900">Previous:</span>{' '}
              {previousNext.prev ? (
                <BranchListItem item={previousNext.prev} isCurrent={false} />
              ) : (
                <span className="text-gray-600">None</span>
              )}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-900">Next:</span>{' '}
              {previousNext.next ? (
                <BranchListItem item={previousNext.next} isCurrent={false} />
              ) : (
                <span className="text-gray-600">None</span>
              )}
            </div>
          </div>
        ) : null}
      </nav>
    </section>
  )
}

export default SeriesNavigation
