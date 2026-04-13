'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SIDEBAR_WIDTH } from '@/lib/sidebar-constants'
import { useSidebarPlacement } from '@/lib/useSidebarPlacement'

/* ------------------------------------------------------------------ */
/*  Utility                                                           */
/* ------------------------------------------------------------------ */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface TOCItem {
  id: string
  text: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

/**
 * Self-contained reading-progress bar + table-of-contents sidebar for
 * article pages. Drop it anywhere inside the page – it finds the nearest
 * `<article>` element, scans for `<h2>` headings, assigns IDs if needed,
 * and renders:
 *   • a thin progress bar fixed below the site header
 *   • a sticky sidebar on xl+ screens
 *   • a floating toggle button + popup on smaller screens
 *
 * Zero props required.
 */
export default function ArticleTOC() {
  const pathname = usePathname()
  const [items, setItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [headerH, setHeaderH] = useState(80)
  const { canShowDesktop, tocLeft } = useSidebarPlacement(pathname)
  const observerRef = useRef<IntersectionObserver | null>(null)

  /* ---------- track header height (shrinks on scroll) ---------- */
  useEffect(() => {
    const header = document.getElementById('header')
    if (!header) return
    const ro = new ResizeObserver(([entry]) => {
      setHeaderH(entry.contentRect.height)
    })
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  /* ---------- reset mobile panel when switching to desktop ---------- */
  useEffect(() => {
    if (canShowDesktop) setMobileOpen(false)
  }, [canShowDesktop])

  /* ---------- scan headings on mount ---------- */
  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return

    const headings = Array.from(article.querySelectorAll('h2'))
    const tocItems: TOCItem[] = headings.map((h) => {
      if (!h.id) {
        h.id = slugify(h.textContent ?? '')
      }
      return { id: h.id, text: h.textContent ?? '' }
    })

    /* schedule state update to avoid synchronous setState in effect */
    requestAnimationFrame(() => setItems(tocItems))

    /* intersection observer for active heading */
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    )

    headings.forEach((h) => observerRef.current?.observe(h))
    return () => observerRef.current?.disconnect()
  }, [])

  /* ---------- scroll progress ---------- */
  const handleScroll = useCallback(() => {
    const article = document.querySelector('article')
    if (!article) return
    const rect = article.getBoundingClientRect()
    const scrollable = article.scrollHeight - window.innerHeight
    if (scrollable <= 0) {
      setProgress(100)
      return
    }
    setProgress(Math.min(100, Math.max(0, (-rect.top / scrollable) * 100)))
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    /* defer initial call to avoid synchronous setState in effect */
    requestAnimationFrame(handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  /* nothing to show if the article has no h2s */
  if (items.length === 0) return null

  /* ---------- render ---------- */
  return (
    <>
      {/* ---- reading-progress bar ---- */}
      <div
        aria-hidden="true"
        className="fixed left-0 right-0 z-40 h-[3px] bg-gray-200/60 transition-[top] duration-300"
        style={{ top: `${headerH}px` }}
      >
        <div
          className="h-full bg-tabs-teal-deep transition-[width] duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ---- desktop sidebar (shown only when enough space) ---- */}
      {canShowDesktop && (
        <nav
          aria-label="Table of contents"
          className="fixed z-30 transition-[top] duration-300"
          style={{
            top: `${headerH + 40}px`,
            left: `${tocLeft}px`,
            width: `${SIDEBAR_WIDTH}px`,
          }}
        >
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            On this page
          </p>
          <ul
            className="space-y-1.5 border-l-2 border-gray-200 pl-3 overflow-y-auto"
            style={{ maxHeight: `calc(100vh - ${headerH + 100}px)` }}
          >
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`block text-[12px] leading-snug py-0.5 transition-colors ${
                    activeId === item.id
                      ? 'text-tabs-teal-deep font-semibold -ml-[14px] pl-[12px] border-l-2 border-tabs-teal-deep'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* ---- mobile floating button + popup (shown when desktop TOC doesn't fit) ---- */}
      {!canShowDesktop && (
        <div className="fixed bottom-6 right-6 z-50">
          {mobileOpen && (
            <nav
              aria-label="Table of contents"
              className="absolute bottom-14 right-0 w-72 max-h-[50vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-4"
            >
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                On this page
              </p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setMobileOpen(false)}
                      className={`block text-sm py-1 ${
                        activeId === item.id
                          ? 'text-tabs-teal-deep font-semibold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Table of contents"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-tabs-teal-deep text-white shadow-lg hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tabs-teal-deep focus-visible:ring-offset-2"
          >
            {/* list-bullet icon */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
