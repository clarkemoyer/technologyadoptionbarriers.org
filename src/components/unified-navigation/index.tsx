'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { slugify } from '@/lib/slugify'
import { SIDEBAR_WIDTH } from '@/lib/sidebar-constants'
import { useSidebarPlacement } from '@/lib/useSidebarPlacement'

export interface SeriesNavItem {
  title: string
  href: string
  isCurrent?: boolean
  /** When true, item is a non-navigable grouping header */
  isGroup?: boolean
  children?: SeriesNavItem[]
}

interface UnifiedNavigationProps {
  /** Series/collection navigation items for the sidebar */
  seriesItems?: SeriesNavItem[]
  /** Label for the series section */
  seriesLabel?: string
  className?: string
}

interface TocHeading {
  id: string
  text: string
}

/** Default header height used before ResizeObserver reports actual value */
const DEFAULT_HEADER_HEIGHT = 80
/** Extra pixels below the sticky header for comfortable scroll targeting */
const SCROLL_MARGIN_GAP = 20
/** Minimum gap in pixels between the sidebar bottom and the viewport/footer edge */
const MIN_BOTTOM_GAP = 20

/** Recursively check if any descendant has isCurrent set */
function hasCurrentDescendant(items: SeriesNavItem[]): boolean {
  return items.some((c) => c.isCurrent || (c.children && hasCurrentDescendant(c.children)))
}

export default function UnifiedNavigation({
  seriesItems,
  seriesLabel = 'In this series',
  className,
}: UnifiedNavigationProps) {
  const pathname = usePathname()
  const [headerH, setHeaderH] = useState(0)
  const [headings, setHeadings] = useState<TocHeading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [footerOffset, setFooterOffset] = useState(MIN_BOTTOM_GAP)
  const { canShowDesktop, tocLeft } = useSidebarPlacement(pathname)
  const panelRef = useRef<HTMLDivElement>(null)
  const footerOffsetRef = useRef(MIN_BOTTOM_GAP)
  const rafIdRef = useRef<number | null>(null)

  // Track header height (with feature detection for ResizeObserver)
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const header = document.getElementById('header')
    if (!header) return
    const ro = new ResizeObserver(([entry]) => {
      setHeaderH(entry.contentRect.height)
    })
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  // Track footer position so the sidebar never overlaps it
  // Throttled via requestAnimationFrame; skips setState when value is unchanged.
  useEffect(() => {
    const update = () => {
      const footer = document.getElementById('site-footer')
      let next: number
      if (!footer) {
        next = MIN_BOTTOM_GAP
      } else {
        const rect = footer.getBoundingClientRect()
        const rawVisibleFooterPx = window.innerHeight - rect.top
        const maxVisibleFooterPx = Math.min(rect.height, window.innerHeight)
        const footerVisiblePx = Math.max(0, Math.min(rawVisibleFooterPx, maxVisibleFooterPx))
        next = footerVisiblePx > 0 ? footerVisiblePx + MIN_BOTTOM_GAP : MIN_BOTTOM_GAP
      }
      if (next !== footerOffsetRef.current) {
        footerOffsetRef.current = next
        setFooterOffset(next)
      }
    }

    const onScroll = () => {
      if (rafIdRef.current !== null) return
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null
        update()
      })
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [])

  // Scroll margin derived from dynamic header height + a small gap
  const effectiveHeaderH = headerH || DEFAULT_HEADER_HEIGHT
  const scrollMargin = `${effectiveHeaderH + SCROLL_MARGIN_GAP}px`

  // Scan article for H2 headings - ensure unique IDs
  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return

    const h2s = Array.from(article.querySelectorAll('h2'))
    const usedFinalIds = new Set<string>()
    const items: TocHeading[] = h2s.map((el, idx) => {
      let base: string
      if (!el.id) {
        base = slugify(el.textContent || '')
        if (!base) base = `section-${idx}`
      } else {
        base = el.id
      }
      let candidate = base
      let suffix = 2
      while (usedFinalIds.has(candidate)) {
        candidate = `${base}-${suffix}`
        suffix++
      }
      usedFinalIds.add(candidate)
      el.id = candidate
      // Ensure headings clear the sticky header when targeted
      el.style.scrollMarginTop = scrollMargin
      return { id: el.id, text: el.textContent || '' }
    })
    // DOM scan result - intentional sync from external system
    setHeadings(items) // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname, scrollMargin])

  // Scroll spy with IntersectionObserver - rootMargin tracks dynamic header height
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const article = document.querySelector('article')
    if (!article || headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: `-${effectiveHeaderH}px 0px -60% 0px`, threshold: 0.1 }
    )

    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings, effectiveHeaderH])

  // Reset mobile panel when switching to desktop sidebar
  useEffect(() => {
    if (canShowDesktop) setMobileOpen(false) // eslint-disable-line react-hooks/set-state-in-effect
  }, [canShowDesktop])

  // Close mobile panel on outside click
  useEffect(() => {
    if (!mobileOpen || canShowDesktop) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileOpen, canShowDesktop])

  const hasSeries = seriesItems && seriesItems.length > 0
  const hasToc = headings.length > 0

  if (!hasSeries && !hasToc) return null

  const handleLinkClick = () => {
    setMobileOpen(false)
  }

  /** Render series tree recursively to support arbitrary nesting depth */
  function renderSeriesTree(items: SeriesNavItem[], keyPrefix = '') {
    return (
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={`${keyPrefix}${item.href}:${item.title}`}>
            {item.children ? (
              <details
                className="group"
                ref={(node) => {
                  if (node && !node.hasAttribute('data-init')) {
                    node.open =
                      item.isCurrent ||
                      (item.children ? hasCurrentDescendant(item.children) : false)
                    node.setAttribute('data-init', '')
                  }
                }}
              >
                <summary className="flex cursor-pointer items-center gap-1 py-1 text-gray-600 hover:text-gray-900">
                  <span
                    className="text-[10px] transition-transform group-open:rotate-90"
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                  <span
                    className={item.isCurrent ? 'font-bold text-gray-900' : 'hover:text-gray-900'}
                  >
                    {item.title}
                  </span>
                </summary>
                {!item.isGroup && (
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`block ml-4 pl-2 py-0.5 text-sm ${
                      item.isCurrent
                        ? 'border-l-2 border-tabs-teal-deep bg-blue-50 font-bold text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.title}
                  </Link>
                )}
                <div className="ml-4 mt-1 border-l border-gray-200 pl-2">
                  {renderSeriesTree(item.children, `${keyPrefix}${item.href}:`)}
                </div>
              </details>
            ) : (
              <Link
                href={item.href}
                onClick={handleLinkClick}
                className={`block py-1 ${
                  item.isCurrent
                    ? 'border-l-2 border-tabs-teal-deep bg-blue-50 pl-2 font-bold text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    )
  }

  const seriesContent = hasSeries && (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {seriesLabel}
      </p>
      {renderSeriesTree(seriesItems)}
    </div>
  )

  const tocContent = hasToc && (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        On this page
      </p>
      <ul className="space-y-1 text-sm">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={handleLinkClick}
              className={`block py-0.5 transition-colors ${
                activeId === h.id
                  ? 'font-semibold text-tabs-teal-deep'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar — shown only when enough space to the right of the article */}
      {canShowDesktop && (
        <nav
          aria-label="Page navigation"
          className={`fixed z-30 ${className ?? ''}`}
          style={{
            top: `${effectiveHeaderH + 40}px`,
            bottom: `${footerOffset}px`,
            left: `${tocLeft}px`,
            width: `${SIDEBAR_WIDTH}px`,
          }}
        >
          <div className="space-y-6 h-full overflow-y-auto pr-2">
            {seriesContent}
            {hasSeries && hasToc && <hr className="border-gray-200" />}
            {tocContent}
          </div>
        </nav>
      )}

      {/* Mobile FAB + panel — shown when desktop sidebar doesn't fit */}
      {!canShowDesktop && (
        <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
          {mobileOpen && (
            <div
              id="mobile-nav-panel"
              className="absolute bottom-14 right-0 w-72 max-h-[60vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-4 space-y-4"
            >
              {hasSeries && (
                <details>
                  <summary className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 cursor-pointer">
                    {seriesLabel}
                  </summary>
                  <div className="mt-2">{renderSeriesTree(seriesItems, 'mobile:')}</div>
                </details>
              )}
              {hasToc && (
                <details
                  ref={(node) => {
                    if (node && !node.hasAttribute('data-init')) {
                      node.open = true
                      node.setAttribute('data-init', '')
                    }
                  }}
                >
                  <summary className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 cursor-pointer">
                    On this page
                  </summary>
                  <ul className="mt-2 space-y-1 text-sm">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          onClick={handleLinkClick}
                          className={`block py-0.5 transition-colors ${
                            activeId === h.id
                              ? 'font-semibold text-tabs-teal-deep'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          <button
            type="button"
            aria-label="Navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-tabs-teal-deep text-white shadow-lg hover:opacity-90 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
