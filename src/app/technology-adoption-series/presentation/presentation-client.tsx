'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

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

export function TechnologyAdoptionSeriesPresentationClient({
  slides,
}: {
  slides: PresentationSlide[]
}) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const totalSlides = slides.length
  const currentSlide = slides[currentSlideIdx]

  const goNext = useCallback(() => {
    setCurrentSlideIdx((idx) => Math.min(idx + 1, Math.max(0, totalSlides - 1)))
  }, [totalSlides])

  const goPrev = useCallback(() => {
    setCurrentSlideIdx((idx) => Math.max(0, idx - 1))
  }, [])

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

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-[9999] bg-slate-950" aria-label="Presentation">
      <nav className="fixed left-4 top-4 z-10 flex flex-wrap gap-2" aria-label="Return navigation">
        <Link
          href="/technology-adoption-series"
          className="rounded-full border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
        >
          ← Series
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
        >
          Home
        </Link>
      </nav>

      <div className="flex min-h-screen items-center justify-center p-4">
        <section
          className="flex h-[720px] w-[1280px] max-h-[calc(100vh-160px)] max-w-full flex-col overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl"
          aria-label="Slide"
        >
          <header className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Technology Adoption Teaching Series
                </div>
                <h1 className="mt-1 text-2xl font-bold text-gray-900">
                  {currentSlide
                    ? `Slide ${currentSlide.number}: ${currentSlide.title}`
                    : 'Loading slides…'}
                </h1>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {totalSlides ? `${currentSlideIdx + 1} / ${totalSlides}` : null}
              </div>
            </div>
          </header>

          <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden p-6 lg:grid-cols-2">
            <div className="h-full overflow-hidden">
              <div className="h-full overflow-y-auto pr-2">
                {currentSlide ? (
                  <TechnologyAdoptionSeriesSlideMarkdown
                    nodes={contentNodes}
                    slideNumber={currentSlide.number}
                    variant="presentation"
                  />
                ) : (
                  <p className="text-gray-700">Loading…</p>
                )}
              </div>
            </div>

            <div className="h-full overflow-hidden">
              <div className="h-full overflow-y-auto pl-2">
                {currentSlide ? (
                  <TechnologyAdoptionSeriesSlideVisual slideNumber={currentSlide.number} />
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-4 right-4 z-10 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentSlideIdx <= 0}
          className="rounded-lg border border-slate-600 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentSlideIdx >= totalSlides - 1}
          className="rounded-lg border border-slate-600 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900 disabled:opacity-40"
        >
          Next
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-lg border border-slate-600 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900"
          aria-label="Toggle fullscreen (F)"
        >
          Full screen
        </button>
        <div className="hidden text-xs text-slate-300 sm:block" aria-label="Keyboard shortcuts">
          Keys: ←/→, Space, F
        </div>
      </div>
    </div>
  )
}
