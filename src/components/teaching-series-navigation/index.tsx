'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { technologyAdoptionTeachingSeries } from '@/data/technology-adoption-teaching-series'
import { H2_CLASSES } from '@/lib/articleStyles'

type LinkState = {
  title: string
  slug?: string
  status?: 'published' | 'coming-soon'
  isOptional?: boolean
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

  const optionalSuffix = item.isOptional ? ' (Optional)' : ''

  if (!isLinkable(item)) {
    return (
      <span
        className={`${baseClasses} ${isCurrent ? 'bg-blue-50 text-blue-900' : 'text-gray-700'} cursor-default`}
        aria-current={isCurrent ? 'page' : undefined}
      >
        <span className="sr-only">{label}: </span>
        {item.title}
        {optionalSuffix}
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
      {optionalSuffix}
    </Link>
  )
}

const TeachingSeriesNavigation = ({ className }: { className?: string }) => {
  const pathname = usePathname() || '/'
  const currentPath = normalizePath(pathname)

  const { root, parts } = technologyAdoptionTeachingSeries

  const flatSlides = parts.flatMap((part) =>
    part.slides.map((s) => ({
      ...s,
      slug: `${root.slug}/${s.segment}`,
    }))
  )

  const previousNext = React.useMemo(() => {
    const items: LinkState[] = [
      { title: 'Series overview', slug: root.slug, status: 'published' },
      ...flatSlides.map((s) => ({
        title: `Slide ${s.number}: ${s.title}`,
        slug: s.slug,
        status: s.status,
        isOptional: s.isOptional,
      })),
    ]

    const currentIndex = items.findIndex((i) => normalizePath(i.slug || '') === currentPath)
    if (currentIndex === -1) return null

    return {
      prev: currentIndex > 0 ? items[currentIndex - 1] : null,
      next: currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
    }
  }, [currentPath, flatSlides, root.slug])

  return (
    <section
      className={`mb-10 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100 ${className || ''}`}
      aria-labelledby="teaching-series-navigation-heading"
    >
      <h2 id="teaching-series-navigation-heading" className={H2_CLASSES}>
        Series navigation
      </h2>

      <nav aria-label="Technology Adoption Teaching Series navigation" className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <NavRowItem
            label="Series root"
            item={{ title: root.title, slug: root.slug, status: 'published' }}
            isCurrent={normalizePath(root.slug) === currentPath}
            variant="prominent"
          />
        </div>

        {/* Desktop: three-column grid for parts */}
        <div className="hidden md:grid gap-6 md:grid-cols-3">
          {parts.map((part) => (
            <section key={part.id} aria-label={part.title}>
              <h3 className="font-bold text-gray-900">{part.title}</h3>
              <ul className="mt-2 space-y-1 text-sm font-sans">
                {part.slides.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`${root.slug}/${s.segment}`}
                      className={`rounded px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                        normalizePath(`${root.slug}/${s.segment}`) === currentPath
                          ? 'font-semibold text-gray-900 underline decoration-2 decoration-blue-500'
                          : 'text-blue-700 hover:underline'
                      }`}
                      aria-current={
                        normalizePath(`${root.slug}/${s.segment}`) === currentPath
                          ? 'page'
                          : undefined
                      }
                    >
                      Slide {s.number}: {s.title}
                      {s.isOptional ? <span className="text-gray-600"> (Optional)</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Mobile: collapsible parts */}
        <div className="md:hidden space-y-3">
          {parts.map((part) => {
            const isPartActive = part.slides.some(
              (s) => normalizePath(`${root.slug}/${s.segment}`) === currentPath
            )

            return (
              <details
                key={part.id}
                open={isPartActive}
                className="rounded border border-gray-200 bg-white"
              >
                <summary className="cursor-pointer list-none px-3 py-2 font-sans font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                  <span className="flex items-center justify-between gap-2">
                    <span>{part.title}</span>
                    <span aria-hidden="true" className="text-gray-500">
                      ▾
                    </span>
                  </span>
                </summary>
                <div className="px-3 pb-3">
                  <ul className="mt-2 space-y-1 text-sm font-sans">
                    {part.slides.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`${root.slug}/${s.segment}`}
                          className={`rounded px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                            normalizePath(`${root.slug}/${s.segment}`) === currentPath
                              ? 'font-semibold text-gray-900 underline decoration-2 decoration-blue-500'
                              : 'text-blue-700 hover:underline'
                          }`}
                          aria-current={
                            normalizePath(`${root.slug}/${s.segment}`) === currentPath
                              ? 'page'
                              : undefined
                          }
                        >
                          Slide {s.number}: {s.title}
                          {s.isOptional ? <span className="text-gray-600"> (Optional)</span> : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            )
          })}
        </div>

        {previousNext ? (
          <div className="pt-3 border-t border-gray-200 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="text-sm">
              <span className="font-semibold text-gray-900">Previous:</span>{' '}
              {previousNext.prev ? (
                <Link href={previousNext.prev.slug!} className="text-blue-700 hover:underline">
                  {previousNext.prev.title}
                </Link>
              ) : (
                <span className="text-gray-600">None</span>
              )}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-900">Next:</span>{' '}
              {previousNext.next ? (
                <Link href={previousNext.next.slug!} className="text-blue-700 hover:underline">
                  {previousNext.next.title}
                </Link>
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

export default TeachingSeriesNavigation
