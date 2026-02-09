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
            <div className="panel-scroll">
              {currentSlide ? (
                <TechnologyAdoptionSeriesSlideMarkdown
                  nodes={contentNodes}
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
    </div>
  )
}
