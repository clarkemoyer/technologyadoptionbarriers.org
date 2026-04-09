'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { slugify } from '@/lib/slugify'

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
  const panelRef = useRef<HTMLDivElement>(null)

  // Track header height
  useEffect(() => {
    const header = document.getElementById('header')
    if (!header) return
    const ro = new ResizeObserver(([entry]) => {
      setHeaderH(entry.contentRect.height)
    })
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  // Scan article for H2 headings
  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return

    const h2s = Array.from(article.querySelectorAll('h2'))
    const items: TocHeading[] = h2s.map((el) => {
      if (!el.id) {
        el.id = slugify(el.textContent || '')
      }
      // Ensure headings clear the sticky header when targeted
      if (!el.style.scrollMarginTop) {
        el.style.scrollMarginTop = '100px'
      }
      return { id: el.id, text: el.textContent || '' }
    })
    setHeadings(items)
  }, [pathname])

  // Scroll spy with IntersectionObserver
  useEffect(() => {
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
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )

    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  // Close mobile panel on outside click
  useEffect(() => {
    if (!mobileOpen) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileOpen])

  const hasSeries = seriesItems && seriesItems.length > 0
  const hasToc = headings.length > 0

  if (!hasSeries && !hasToc) return null

  const handleLinkClick = () => {
    setMobileOpen(false)
  }

  const seriesContent = hasSeries && (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {seriesLabel}
      </p>
      <ul className="space-y-1 text-sm">
        {seriesItems.map((item) => (
          <li key={`${item.href}:${item.title}`}>
            {item.children ? (
              <details
                className="group"
                ref={(node) => {
                  if (node && !node.hasAttribute('data-init')) {
                    node.open = item.isCurrent || item.children!.some((c) => c.isCurrent)
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
                  {item.isGroup ? (
                    <span
                      className={item.isCurrent ? 'font-bold text-gray-900' : 'hover:text-gray-900'}
                    >
                      {item.title}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={item.isCurrent ? 'font-bold text-gray-900' : 'hover:text-gray-900'}
                    >
                      {item.title}
                    </Link>
                  )}
                </summary>
                <ul className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
                  {item.children.map((child) => (
                    <li key={`${child.href}:${child.title}`}>
                      <Link
                        href={child.href}
                        onClick={handleLinkClick}
                        className={`block py-0.5 ${
                          child.isCurrent
                            ? 'border-l-2 border-tabs-teal-deep bg-blue-50 pl-2 font-bold text-gray-900'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
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
      {/* Desktop sidebar */}
      <nav
        aria-label="Page navigation"
        className={`hidden xl:block fixed z-30 ${className ?? ''}`}
        style={{
          top: `${headerH + 40}px`,
          right: 'max(1rem, calc((100vw - 1200px) / 2 - 240px))',
          width: '210px',
        }}
      >
        <div className="space-y-6 max-h-[calc(100vh-160px)] overflow-y-auto pr-2">
          {seriesContent}
          {hasSeries && hasToc && <hr className="border-gray-200" />}
          {tocContent}
        </div>
      </nav>

      {/* Mobile FAB + panel */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50" ref={panelRef}>
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
                <ul className="mt-2 space-y-1 text-sm">
                  {seriesItems!.map((item) => (
                    <li key={`mobile:${item.href}:${item.title}`}>
                      {item.children ? (
                        <details
                          ref={(node) => {
                            if (node && !node.hasAttribute('data-init')) {
                              node.open = item.isCurrent || item.children!.some((c) => c.isCurrent)
                              node.setAttribute('data-init', '')
                            }
                          }}
                        >
                          <summary className="flex cursor-pointer items-center gap-1 py-0.5 text-gray-600 hover:text-gray-900">
                            <span
                              className="text-[10px] transition-transform [details[open]>&]:rotate-90"
                              aria-hidden="true"
                            >
                              ▶
                            </span>
                            {item.isGroup ? (
                              <span
                                className={
                                  item.isCurrent ? 'font-bold text-gray-900' : 'hover:text-gray-900'
                                }
                              >
                                {item.title}
                              </span>
                            ) : (
                              <Link
                                href={item.href}
                                onClick={handleLinkClick}
                                className={
                                  item.isCurrent ? 'font-bold text-gray-900' : 'hover:text-gray-900'
                                }
                              >
                                {item.title}
                              </Link>
                            )}
                          </summary>
                          <ul className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
                            {item.children.map((child) => (
                              <li key={`mobile:${child.href}:${child.title}`}>
                                <Link
                                  href={child.href}
                                  onClick={handleLinkClick}
                                  className={`block py-0.5 ${
                                    child.isCurrent
                                      ? 'font-bold text-gray-900'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
                                >
                                  {child.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={handleLinkClick}
                          className={`block py-0.5 ${
                            item.isCurrent
                              ? 'font-bold text-gray-900'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {item.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {hasToc && (
              <details open>
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
    </>
  )
}
