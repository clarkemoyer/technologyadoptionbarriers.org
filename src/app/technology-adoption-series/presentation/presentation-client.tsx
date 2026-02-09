'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

import './presentation.css'

import { parseSimpleMarkdown, type MarkdownNode } from '@/lib/simple-markdown'
import {
  TechnologyAdoptionSeriesSlideMarkdown,
  TechnologyAdoptionSeriesSlideVisual,
  splitTechnologyAdoptionSeriesSlideSections,
} from '@/components/technology-adoption-series/slide-render'

type PresentationSlide = {
  number: number
  title: string
  segment: string
  contentMarkdown: string
}

const raf = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

const useKeyboardNavigation = (handlers: {
  onNext: () => void
  onPrev: () => void
  onToggleFullscreen: () => void
}) => {
  const { onNext, onPrev, onToggleFullscreen } = handlers

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        onNext()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
        return
      }

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        onToggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNext, onPrev, onToggleFullscreen])
}

const toDisplayTitle = (rawTitle: string) => {
  // Removes common numeric prefixes so the slide title doesn't include numbering.
  // Examples: "1. Title" → "Title", "01 - Title" → "Title"
  return rawTitle.replace(/^\s*\d+\s*(?:[.\-:)]+\s+|\s+)/, '').trim()
}

const splitOversizeNode = async (args: {
  node: MarkdownNode
  measure: (nodes: MarkdownNode[]) => Promise<boolean>
}): Promise<MarkdownNode[]> => {
  const { node, measure } = args

  if (node.type === 'ul' || node.type === 'ol') {
    const items = node.items
    if (items.length <= 1) return [node]

    let low = 1
    let high = items.length
    let best = 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const candidate: MarkdownNode = { ...node, items: items.slice(0, mid) }
      const fits = await measure([candidate])

      if (fits) {
        best = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    const first: MarkdownNode = { ...node, items: items.slice(0, best) }
    const rest = items.slice(best)
    if (!rest.length) return [first]
    return [first, { ...node, items: rest }]
  }

  if (node.type === 'table') {
    if (node.rows.length <= 1) return [node]

    let low = 1
    let high = node.rows.length
    let best = 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const candidate: MarkdownNode = { ...node, rows: node.rows.slice(0, mid) }
      const fits = await measure([candidate])
      if (fits) {
        best = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    const first: MarkdownNode = { ...node, rows: node.rows.slice(0, best) }
    const restRows = node.rows.slice(best)
    if (!restRows.length) return [first]
    return [first, { ...node, rows: restRows }]
  }

  if (node.type === 'paragraph') {
    const words = node.text.trim().split(/\s+/)
    if (words.length <= 18) return [node]
    const mid = Math.ceil(words.length / 2)
    return [
      { type: 'paragraph', text: words.slice(0, mid).join(' ') },
      { type: 'paragraph', text: words.slice(mid).join(' ') },
    ]
  }

  if (node.type === 'blockquote') {
    if (node.lines.length <= 2) return [node]
    const mid = Math.ceil(node.lines.length / 2)
    return [
      { type: 'blockquote', lines: node.lines.slice(0, mid) },
      { type: 'blockquote', lines: node.lines.slice(mid) },
    ]
  }

  return [node]
}

export function TechnologyAdoptionSeriesPresentationClient({
  slides,
}: {
  slides: PresentationSlide[]
}) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0)
  const [currentPageIdx, setCurrentPageIdx] = useState(0)
  const [pages, setPages] = useState<MarkdownNode[][]>([])
  const [measureNodes, setMeasureNodes] = useState<MarkdownNode[]>([])
  const [measureSize, setMeasureSize] = useState<{ width: number; height: number } | null>(null)
  const [paginationSizeKey, setPaginationSizeKey] = useState(0)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const textViewportRef = useRef<HTMLDivElement | null>(null)
  const measureViewportRef = useRef<HTMLDivElement | null>(null)
  const requestedPageRef = useRef<'first' | 'last'>('first')
  const paginationTokenRef = useRef(0)
  const currentPageIdxRef = useRef(0)

  useEffect(() => {
    currentPageIdxRef.current = currentPageIdx
  }, [currentPageIdx])

  const totalSlides = slides.length
  const currentSlide = slides[currentSlideIdx]

  const goNext = useCallback(() => {
    const totalPages = pages.length
    if (totalPages > 1 && currentPageIdx < totalPages - 1) {
      setCurrentPageIdx((idx) => Math.min(idx + 1, totalPages - 1))
      return
    }

    requestedPageRef.current = 'first'
    setPages([])
    setMeasureNodes([])
    setCurrentSlideIdx((idx) => Math.min(idx + 1, Math.max(0, totalSlides - 1)))
    setCurrentPageIdx(0)
  }, [currentPageIdx, pages.length, totalSlides])

  const goPrev = useCallback(() => {
    if (pages.length > 1 && currentPageIdx > 0) {
      setCurrentPageIdx((idx) => Math.max(0, idx - 1))
      return
    }

    requestedPageRef.current = 'last'
    setPages([])
    setMeasureNodes([])
    setCurrentSlideIdx((idx) => Math.max(0, idx - 1))
    setCurrentPageIdx(0)
  }, [currentPageIdx, pages.length])

  const toggleFullscreen = useCallback(() => {
    const element = wrapperRef.current
    if (!element) return

    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }

    void element.requestFullscreen()
  }, [])

  useKeyboardNavigation({
    onNext: goNext,
    onPrev: goPrev,
    onToggleFullscreen: toggleFullscreen,
  })

  const contentNodes = useMemo(() => {
    if (!currentSlide) return []
    const sections = splitTechnologyAdoptionSeriesSlideSections(currentSlide.contentMarkdown)
    return parseSimpleMarkdown(sections.content)
  }, [currentSlide])

  const { textNodes, visualDescriptions } = useMemo(() => {
    const visuals: string[] = []
    const textOnly: MarkdownNode[] = []

    for (const node of contentNodes) {
      if (node.type === 'visual') {
        if (node.description.trim()) visuals.push(node.description.trim())
        continue
      }
      textOnly.push(node)
    }

    return { textNodes: textOnly, visualDescriptions: visuals }
  }, [contentNodes])

  const visualDescription = visualDescriptions.join(' · ')
  const hasVisual = visualDescriptions.length > 0
  const visualFirst = (currentSlide?.number ?? 0) % 2 === 1

  const approxTextSize = useMemo(() => {
    return textNodes.reduce((acc, node) => {
      if (node.type === 'paragraph') return acc + node.text.length
      if (node.type === 'heading') return acc + node.text.length
      if (node.type === 'blockquote') return acc + node.lines.join(' ').length
      if (node.type === 'ul' || node.type === 'ol') return acc + node.items.length * 40
      if (node.type === 'table') return acc + node.rows.length * 40
      if (node.type === 'code') return acc + node.code.length
      if (node.type === 'pre') return acc + node.text.length
      if (node.type === 'image') return acc + 200
      return acc
    }, 0)
  }, [textNodes])

  const layoutMode = useMemo(() => {
    if (!hasVisual) return 'single'
    if (textNodes.length === 0) return 'visual-only'
    if (approxTextSize < 480) return 'visual-dominant'
    if (approxTextSize > 1200) return 'text-dominant'
    return 'balanced'
  }, [approxTextSize, hasVisual, textNodes.length])

  useEffect(() => {
    const viewport = textViewportRef.current
    if (!viewport) return

    setMeasureSize({ width: viewport.clientWidth, height: viewport.clientHeight })

    if (typeof ResizeObserver === 'undefined') return

    const ro = new ResizeObserver(() => {
      setMeasureSize({ width: viewport.clientWidth, height: viewport.clientHeight })
      setPaginationSizeKey((key) => key + 1)
    })

    ro.observe(viewport)
    return () => ro.disconnect()
  }, [currentSlideIdx])

  useEffect(() => {
    // Paginate slide content so we never need scrollbars in fullscreen.
    const measureViewport = measureViewportRef.current
    if (!measureViewport || !measureSize) {
      return
    }

    measureViewport.style.width = `${measureSize.width}px`
    measureViewport.style.height = `${measureSize.height}px`

    const token = paginationTokenRef.current + 1
    paginationTokenRef.current = token

    const measure = async (nodesToMeasure: MarkdownNode[]) => {
      setMeasureNodes(nodesToMeasure)
      await raf()
      if (paginationTokenRef.current !== token) return false
      return measureViewport.scrollHeight <= measureViewport.clientHeight
    }

    const run = async () => {
      const workingNodes = [...textNodes]
      const computedPages: MarkdownNode[][] = []
      let start = 0

      while (start < workingNodes.length) {
        let end = start
        let lastGood = start

        while (end < workingNodes.length) {
          end += 1
          const fits = await measure(workingNodes.slice(start, end))
          if (paginationTokenRef.current !== token) return

          if (fits) {
            lastGood = end
          } else {
            break
          }
        }

        if (lastGood === start) {
          const node = workingNodes[start]
          const split = await splitOversizeNode({ node, measure })
          if (paginationTokenRef.current !== token) return

          if (split.length > 1) {
            computedPages.push([split[0]])
            const remainder = split.slice(1)
            workingNodes.splice(start + 1, 0, ...remainder)
            start += 1
            continue
          }

          computedPages.push([node])
          start += 1
          continue
        }

        computedPages.push(workingNodes.slice(start, lastGood))
        start = lastGood
      }

      setPages(computedPages.length ? computedPages : [workingNodes])

      const desired = requestedPageRef.current
      if (desired === 'last') {
        setCurrentPageIdx(Math.max(0, computedPages.length - 1))
        requestedPageRef.current = 'first'
        return
      }

      const clamped = Math.min(
        currentPageIdxRef.current,
        Math.max(0, (computedPages.length ? computedPages.length : 1) - 1)
      )
      setCurrentPageIdx(clamped)
    }

    void run()
  }, [currentSlideIdx, measureSize, paginationSizeKey, textNodes])

  const pageNodes = pages.length ? pages[Math.min(currentPageIdx, pages.length - 1)] : textNodes
  const totalPages = pages.length

  const textViewportClasses =
    'h-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 p-5 sm:p-6'
  const visualViewportClasses =
    'h-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/20 p-5 sm:p-6'

  const visualNode =
    hasVisual && currentSlide ? (
      <TechnologyAdoptionSeriesSlideVisual
        slideNumber={currentSlide.number}
        description={visualDescription}
      />
    ) : null

  const showVisual = Boolean(visualNode)
  const showText = pageNodes.length > 0

  const visualColSpan =
    layoutMode === 'visual-dominant'
      ? 'lg:col-span-7'
      : layoutMode === 'text-dominant'
        ? 'lg:col-span-4'
        : 'lg:col-span-6'

  const textColSpan =
    layoutMode === 'visual-dominant'
      ? 'lg:col-span-5'
      : layoutMode === 'text-dominant'
        ? 'lg:col-span-8'
        : 'lg:col-span-6'

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950 text-slate-50 antialiased"
      aria-label="Presentation"
    >
      <nav
        className="fixed left-4 top-4 z-20 flex items-center gap-2"
        aria-label="Return navigation"
      >
        <Link
          href="/technology-adoption-series"
          className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-900"
        >
          ← Series
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-900"
        >
          Home
        </Link>
      </nav>

      <section
        className="mx-auto flex h-full w-full max-w-[1900px] flex-col px-4 pb-24 pt-16"
        aria-label="Slide"
      >
        <header className="px-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-300">
            Technology Adoption Teaching Series
          </div>
          <div className="mt-2 flex items-end justify-between gap-4">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              {currentSlide ? toDisplayTitle(currentSlide.title) : 'Loading slides…'}
            </h1>
            <div className="hidden shrink-0 text-xs font-semibold text-slate-400 sm:block">
              &lt;deck /&gt;
            </div>
          </div>
          <div className="mt-4 h-px w-full bg-slate-800" />
        </header>

        <div className="mt-6 flex-1 overflow-hidden" aria-label="Slide content">
          {showVisual && showText ? (
            <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
              <div
                className={`${visualColSpan} ${
                  visualFirst ? 'lg:order-1' : 'lg:order-2'
                } h-full overflow-hidden`}
              >
                <div className={visualViewportClasses}>{visualNode}</div>
              </div>

              <div
                className={`${textColSpan} ${
                  visualFirst ? 'lg:order-2' : 'lg:order-1'
                } h-full overflow-hidden`}
              >
                <div ref={textViewportRef} className={textViewportClasses}>
                  {currentSlide ? (
                    <TechnologyAdoptionSeriesSlideMarkdown
                      nodes={pageNodes}
                      slideNumber={currentSlide.number}
                      variant="presentation"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : showVisual ? (
            <div className="h-full overflow-hidden">
              <div className={visualViewportClasses}>{visualNode}</div>
            </div>
          ) : (
            <div ref={textViewportRef} className={textViewportClasses}>
              {currentSlide ? (
                <TechnologyAdoptionSeriesSlideMarkdown
                  nodes={pageNodes}
                  slideNumber={currentSlide.number}
                  variant="presentation"
                />
              ) : null}
            </div>
          )}
        </div>
      </section>

      <div
        className="fixed bottom-4 right-4 z-20 flex flex-wrap items-center justify-end gap-2"
        aria-label="Slide controls"
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={currentSlideIdx <= 0}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentSlideIdx >= totalSlides - 1}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900 disabled:opacity-40"
        >
          Next
        </button>
        <div className="px-2 text-sm font-semibold text-slate-200" aria-label="Slide counter">
          {totalSlides ? `${currentSlideIdx + 1} / ${totalSlides}` : null}
          {totalPages > 1 ? ` · ${currentPageIdx + 1}/${totalPages}` : ''}
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900"
          aria-label="Toggle fullscreen (F)"
        >
          Full screen
        </button>
        <div
          className="hidden text-xs font-semibold text-slate-400 sm:block"
          aria-label="Keyboard shortcuts"
        >
          Keys: ←/→, Space, F
        </div>
      </div>

      <div aria-hidden="true" className="measure-host">
        <div ref={measureViewportRef} className={textViewportClasses}>
          {currentSlide ? (
            <TechnologyAdoptionSeriesSlideMarkdown
              nodes={measureNodes}
              slideNumber={currentSlide.number}
              variant="presentation"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
