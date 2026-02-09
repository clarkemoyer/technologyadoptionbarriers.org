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

const stripVisualNodes = (nodes: MarkdownNode[]) => nodes.filter((node) => node.type !== 'visual')

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
  const contentViewportRef = useRef<HTMLDivElement | null>(null)
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
    return stripVisualNodes(parseSimpleMarkdown(sections.content))
  }, [currentSlide])

  useEffect(() => {
    const viewport = contentViewportRef.current
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

    const token = paginationTokenRef.current + 1
    paginationTokenRef.current = token

    const measure = async (nodesToMeasure: MarkdownNode[]) => {
      setMeasureNodes(nodesToMeasure)
      await raf()
      if (paginationTokenRef.current !== token) return false
      return measureViewport.scrollHeight <= measureViewport.clientHeight
    }

    const run = async () => {
      const workingNodes = [...contentNodes]
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
  }, [contentNodes, currentSlideIdx, measureSize, paginationSizeKey])

  const pageNodes = pages.length ? pages[Math.min(currentPageIdx, pages.length - 1)] : contentNodes
  const totalPages = pages.length

  return (
    <div ref={wrapperRef} className="presentation-wrapper" aria-label="Presentation">
      <nav className="return-nav" aria-label="Return navigation">
        <Link href="/technology-adoption-series" className="return-link">
          ← Series
        </Link>
        <Link href="/" className="return-link">
          Home
        </Link>
      </nav>

      <section className="slide-container" aria-label="Slide">
        <header>
          <div className="slide-meta">Technology Adoption Teaching Series</div>
          <h1 className="slide-title">
            <span>{currentSlide ? toDisplayTitle(currentSlide.title) : 'Loading slides…'}</span>
          </h1>
        </header>

        <div className="content-area">
          <div className="panel" aria-label="Slide content">
            <div ref={contentViewportRef} className="panel-scroll">
              {currentSlide ? (
                <TechnologyAdoptionSeriesSlideMarkdown
                  nodes={pageNodes}
                  slideNumber={currentSlide.number}
                  variant="presentation"
                />
              ) : null}
            </div>
          </div>

          <div className="panel" aria-label="Slide visual">
            <div className="panel-scroll">
              {currentSlide ? (
                <TechnologyAdoptionSeriesSlideVisual slideNumber={currentSlide.number} />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="controls" aria-label="Slide controls">
        <button type="button" onClick={goPrev} disabled={currentSlideIdx <= 0} className="nav-btn">
          Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentSlideIdx >= totalSlides - 1}
          className="nav-btn"
        >
          Next
        </button>
        <div className="slide-counter" aria-label="Slide counter">
          {totalSlides ? `${currentSlideIdx + 1} / ${totalSlides}` : null}
          {totalPages > 1 ? ` · ${currentPageIdx + 1}/${totalPages}` : ''}
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="nav-btn"
          aria-label="Toggle fullscreen (F)"
        >
          Full screen
        </button>
        <div className="shortcuts" aria-label="Keyboard shortcuts">
          Keys: ←/→, Space, F
        </div>
      </div>

      <div className="panel" aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
        <div
          ref={measureViewportRef}
          className="panel-scroll"
          style={{ width: measureSize?.width ?? 640, height: measureSize?.height ?? 360 }}
        >
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
