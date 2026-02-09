'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { parseSimpleMarkdown, RenderMarkdownNodes, type MarkdownNode } from '@/lib/simple-markdown'
import { splitTechnologyAdoptionSeriesSlideSections } from '@/components/technology-adoption-series/slide-render'
import { PresentationVisual } from './presentation-visuals'
import type { TechnologyAdoptionSeriesSlide } from '@/lib/technology-adoption-series'
import './presentation.css'

/* ====================================================================
   Frame-expansion presenter
   ====================================================================
   Instead of paginating within a slide, we expand 24 source slides
   into ~80-120 "frames" so every screen shows ONE clear piece of
   information, optimised for 1080p / 4K full-screen viewing.
   ==================================================================== */

// ── Types ────────────────────────────────────────────────────────────

type FrameType = 'deck-title' | 'section' | 'slide-title' | 'content' | 'visual' | 'statement'

interface PresentationFrame {
  type: FrameType
  /** Source slide number (0 = synthetic deck-title) */
  sourceSlide: number
  /** Display title */
  title: string
  /** Markdown nodes for 'content' frames */
  nodes?: MarkdownNode[]
  /** Centred text for 'statement' frames */
  statement?: string
  /** Section label / title / count for 'section' frames */
  sectionLabel?: string
  sectionTitle?: string
  sectionSlideCount?: string
}

// ── Constants ────────────────────────────────────────────────────────

/** Source slides that begin a new section. */
const SECTIONS: Record<number, { label: string; title: string; count: string }> = {
  1: {
    label: 'PART 1',
    title: 'What is Technology Adoption?',
    count: '4 slides',
  },
  5: {
    label: 'PART 2',
    title: 'Strategic Approaches & Lifecycle Planning',
    count: '8 slides',
  },
  13: {
    label: 'PART 3',
    title: 'Outcomes of Adoption',
    count: '4 slides',
  },
  17: { label: 'Q & A', title: 'Questions & Answers', count: '' },
  18: {
    label: 'OPTIONAL',
    title: 'Deep-Dive Slides',
    count: '7 slides',
  },
}

/** Slides that have a dark-native visual component. */
const SLIDES_WITH_VISUALS = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 21, 24,
])

const MAX_FRAME_SIZE = 400 // estimated chars before splitting
const MAX_LIST_ITEMS = 4

// ── Helpers ──────────────────────────────────────────────────────────

function isVisualDescription(node: MarkdownNode): boolean {
  // The parser can emit { type: 'visual' } or a blockquote starting
  // with "**Visual:"
  if (node.type === 'visual') return true
  return node.type === 'blockquote' && node.lines.some((l) => /^\*?\*?Visual\b/i.test(l))
}

function isStatement(node: MarkdownNode): boolean {
  if (node.type !== 'paragraph') return false
  const c = node.text
  // Only match known statement prefixes — avoid capturing label-style bold lines
  // like "**Technology Adoption Definition:**" which end with a colon.
  if (/^\*\*.*:\*?\*?$/.test(c.trim())) return false
  return (
    /^\*\*Key (Question|Insight|Takeaway|Point)/i.test(c) ||
    c.startsWith('⚠️') ||
    /^\*\*(WARNING|AVOID|REMEMBER|CRITICAL)/i.test(c)
  )
}

function extractStatementText(raw: string): string {
  let text = raw
    .replace(/^\*\*Key (Question|Insight|Takeaway|Point):\*?\*?\s*/i, '')
    .replace(/^\*\*WARNING:\*?\*?\s*/i, '⚠️ ')
    .replace(/^\*\*(.*)\*\*$/, '$1')
    .replace(/^⚠️\s*\*?\*?/, '⚠️ ')
    .replace(/\*\*/g, '')
    .trim()
  // Strip surrounding quotes to avoid double-quoting in StatementFrame
  text = text
    .replace(/^["\u201C\u201D]+/, '')
    .replace(/["\u201C\u201D]+$/, '')
    .trim()
  return text
}

function estimateNodeSize(node: MarkdownNode): number {
  if (node.type === 'heading') return 100
  if (node.type === 'paragraph') return node.text.length
  if (node.type === 'ul' || node.type === 'ol') return node.items.length * 80
  if (node.type === 'table') return 500
  if (node.type === 'blockquote') return node.lines.length * 60
  if (node.type === 'code') return 300
  return 80
}

function splitLargeList(node: MarkdownNode, max: number): MarkdownNode[] {
  if (node.type !== 'ul' && node.type !== 'ol') return [node]
  if (node.items.length <= max) return [node]
  const chunks: MarkdownNode[] = []
  for (let i = 0; i < node.items.length; i += max) {
    chunks.push({ ...node, items: node.items.slice(i, i + max) })
  }
  return chunks
}

/** Split an oversize paragraph or blockquote into multiple nodes so no
 *  single frame renders with clipped / overflowed content. */
function splitOversizeNode(node: MarkdownNode): MarkdownNode[] {
  if (node.type === 'paragraph' && node.text.length > MAX_FRAME_SIZE) {
    const words = node.text.split(/\s+/)
    const mid = Math.ceil(words.length / 2)
    return [
      { type: 'paragraph', text: words.slice(0, mid).join(' ') },
      { type: 'paragraph', text: words.slice(mid).join(' ') },
    ]
  }
  if (node.type === 'blockquote' && node.lines.length > 4) {
    const mid = Math.ceil(node.lines.length / 2)
    return [
      { type: 'blockquote', lines: node.lines.slice(0, mid) },
      { type: 'blockquote', lines: node.lines.slice(mid) },
    ]
  }
  return [node]
}

// ── Frame expansion ──────────────────────────────────────────────────

function expandToFrames(slides: TechnologyAdoptionSeriesSlide[]): PresentationFrame[] {
  const frames: PresentationFrame[] = []

  // ── Deck title frame ──
  frames.push({
    type: 'deck-title',
    sourceSlide: 0,
    title: 'Technology Adoption Teaching Series',
  })

  for (const slide of slides) {
    // ── Section divider ──
    const sec = SECTIONS[slide.number]
    if (sec) {
      frames.push({
        type: 'section',
        sourceSlide: slide.number,
        title: sec.title,
        sectionLabel: sec.label,
        sectionTitle: sec.title,
        sectionSlideCount: sec.count,
      })
    }

    // ── Parse content ──
    const { content } = splitTechnologyAdoptionSeriesSlideSections(slide.contentMarkdown)
    const rawNodes = parseSimpleMarkdown(content)

    // Separate visuals, statements, regular text
    const textNodes: MarkdownNode[] = []
    const statements: string[] = []
    let hasVisualDesc = false

    for (const node of rawNodes) {
      if (isVisualDescription(node)) {
        hasVisualDesc = true
      } else if (isStatement(node)) {
        statements.push(extractStatementText(node.type === 'paragraph' ? node.text : ''))
      } else {
        textNodes.push(node)
      }
    }

    // ── Slide title frame ──
    frames.push({
      type: 'slide-title',
      sourceSlide: slide.number,
      title: slide.title,
    })

    // ── Chunk text nodes into content frames ──
    let currentChunk: MarkdownNode[] = []
    let currentSize = 0

    const flushChunk = () => {
      if (currentChunk.length > 0) {
        frames.push({
          type: 'content',
          sourceSlide: slide.number,
          title: slide.title,
          nodes: [...currentChunk],
        })
        currentChunk = []
        currentSize = 0
      }
    }

    for (const node of textNodes) {
      // Tables get their own frame
      if (node.type === 'table') {
        flushChunk()
        frames.push({
          type: 'content',
          sourceSlide: slide.number,
          title: slide.title,
          nodes: [node],
        })
        continue
      }

      // Split large lists
      if ((node.type === 'ul' || node.type === 'ol') && node.items.length > MAX_LIST_ITEMS) {
        flushChunk()
        for (const part of splitLargeList(node, MAX_LIST_ITEMS)) {
          frames.push({
            type: 'content',
            sourceSlide: slide.number,
            title: slide.title,
            nodes: [part],
          })
        }
        continue
      }

      // Headings start a new chunk when an existing one is open
      if (node.type === 'heading' && currentChunk.length > 0) {
        flushChunk()
      }

      // Split oversize single nodes (long paragraphs / blockquotes)
      // so content is never clipped by overflow-hidden.
      const parts = splitOversizeNode(node)
      for (const part of parts) {
        const nodeSize = estimateNodeSize(part)
        if (currentSize + nodeSize > MAX_FRAME_SIZE && currentChunk.length > 0) {
          flushChunk()
        }
        currentChunk.push(part)
        currentSize += nodeSize
      }
    }
    flushChunk()

    // ── Statement frames ──
    for (const stmt of statements) {
      frames.push({
        type: 'statement',
        sourceSlide: slide.number,
        title: slide.title,
        statement: stmt,
      })
    }

    // ── Visual frame — always show if we have a dark-native component,
    //    regardless of whether the markdown has a Visual: description ──
    if (SLIDES_WITH_VISUALS.has(slide.number)) {
      frames.push({
        type: 'visual',
        sourceSlide: slide.number,
        title: slide.title,
      })
    }
  }

  return frames
}

// ── Keyboard / touch navigation ──────────────────────────────────────

function useKeyboardNavigation(
  total: number,
  setCurrent: React.Dispatch<React.SetStateAction<number>>
) {
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        setCurrent((c) => Math.min(c + 1, total - 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        setCurrent((c) => Math.max(c - 1, 0))
      } else if (e.key === 'Home') {
        e.preventDefault()
        setCurrent(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setCurrent(total - 1)
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [total, setCurrent, toggleFullscreen])

  return toggleFullscreen
}

// ── Frame renderers ──────────────────────────────────────────────────

/** Tailwind selector overrides that make rendered markdown work on a
 *  dark background at presentation scale. Applied to ContentFrame. */
const proseOverrides = [
  '[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-4',
  '[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-4',
  '[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mb-3',
  '[&_h4]:text-xl  [&_h4]:font-bold [&_h4]:text-white [&_h4]:mb-3',
  '[&_p]:text-xl  [&_p]:leading-relaxed [&_p]:text-slate-200 [&_p]:mb-4 lg:[&_p]:text-2xl',
  '[&_li]:text-xl [&_li]:leading-relaxed [&_li]:text-slate-200 lg:[&_li]:text-2xl',
  '[&_ul]:space-y-3 [&_ul]:pl-6',
  '[&_ol]:space-y-3 [&_ol]:pl-6',
  '[&_strong]:text-white [&_strong]:font-bold',
  '[&_em]:text-cyan-300',
  '[&_code]:text-cyan-300 [&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded',
  '[&_table]:w-full [&_table]:border-collapse [&_table]:rounded-xl [&_table]:overflow-hidden',
  '[&_th]:bg-slate-800/80 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-base [&_th]:font-bold [&_th]:text-slate-300',
  '[&_td]:px-4 [&_td]:py-2.5 [&_td]:text-base [&_td]:text-slate-200 [&_td]:border-t [&_td]:border-slate-700/50',
  '[&_blockquote]:border-l-4 [&_blockquote]:border-cyan-500/40 [&_blockquote]:pl-4 [&_blockquote]:text-xl [&_blockquote]:italic [&_blockquote]:text-slate-300',
  '[&_a]:text-cyan-400 [&_a]:underline',
].join(' ')

function DeckTitleFrame() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 text-lg font-semibold tracking-widest uppercase text-cyan-400">
        Teaching Series
      </div>
      <h1 className="text-5xl font-extrabold leading-tight text-white lg:text-7xl">
        Technology Adoption
      </h1>
      <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-300 lg:text-2xl">
        A Strategic Framework for Understanding and Implementing Technology Change
      </p>
      <div className="mt-10 text-base text-slate-500">
        Technology Adoption Barriers &middot; technologyadoptionbarriers.org
      </div>
    </div>
  )
}

function SectionFrame({ frame }: { frame: PresentationFrame }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-6 inline-flex items-center gap-3">
        <div className="h-px w-16 bg-cyan-500/40" />
        <span className="text-lg font-bold tracking-widest uppercase text-cyan-400">
          {frame.sectionLabel}
        </span>
        <div className="h-px w-16 bg-cyan-500/40" />
      </div>
      <h2 className="text-4xl font-extrabold text-white lg:text-6xl">{frame.sectionTitle}</h2>
      {frame.sectionSlideCount ? (
        <div className="mt-4 text-lg text-slate-400">{frame.sectionSlideCount}</div>
      ) : null}
    </div>
  )
}

function SlideTitleFrame({ frame }: { frame: PresentationFrame }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 text-base font-semibold text-cyan-400/60">Slide {frame.sourceSlide}</div>
      <h2 className="max-w-4xl text-4xl font-extrabold leading-tight text-white lg:text-6xl">
        {frame.title}
      </h2>
    </div>
  )
}

function ContentFrame({ frame }: { frame: PresentationFrame }) {
  if (!frame.nodes?.length) return null
  return (
    <div className="flex h-full flex-col justify-center px-4">
      <div className="mb-6 text-sm font-semibold tracking-wider uppercase text-cyan-400/50">
        {frame.title}
      </div>
      <div className={proseOverrides}>
        <RenderMarkdownNodes nodes={frame.nodes} variant="presentation" />
      </div>
    </div>
  )
}

function VisualFrame({ frame }: { frame: PresentationFrame }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 text-sm font-semibold tracking-wider uppercase text-cyan-400/50">
        {frame.title}
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="h-full w-full">
          <PresentationVisual slideNumber={frame.sourceSlide} />
        </div>
      </div>
    </div>
  )
}

function StatementFrame({ frame }: { frame: PresentationFrame }) {
  const isWarning = frame.statement?.startsWith('⚠️')
  // Only add decorative quotes when the statement isn't already quoted
  const alreadyQuoted = /^["\u201C]/.test(frame.statement ?? '')
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-6 text-sm font-semibold tracking-wider uppercase text-cyan-400/50">
        {frame.title}
      </div>
      {isWarning ? (
        <div className="max-w-4xl text-3xl font-bold leading-snug text-amber-300 lg:text-5xl">
          {frame.statement}
        </div>
      ) : alreadyQuoted ? (
        <blockquote className="max-w-4xl text-3xl font-semibold leading-snug text-white lg:text-5xl">
          {frame.statement}
        </blockquote>
      ) : (
        <blockquote className="max-w-4xl text-3xl font-semibold leading-snug text-white lg:text-5xl">
          &ldquo;{frame.statement}&rdquo;
        </blockquote>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────

export default function PresentationClient({
  slides,
}: {
  slides: TechnologyAdoptionSeriesSlide[]
}) {
  const frames = useMemo(() => expandToFrames(slides), [slides])
  const [currentIdx, setCurrentIdx] = useState(0)
  const toggleFullscreen = useKeyboardNavigation(frames.length, setCurrentIdx)

  const frame = frames[currentIdx]
  const [showHelp, setShowHelp] = useState(false)

  // ── Keyboard shortcut help (toggle with ?) ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault()
        setShowHelp((h) => !h)
      } else if (e.key === 'Escape' && showHelp) {
        setShowHelp(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showHelp])

  // ── Touch navigation ──
  const touchStart = useRef(0)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }, [])
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStart.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 60) {
        if (diff > 0) setCurrentIdx((c) => Math.min(c + 1, frames.length - 1))
        else setCurrentIdx((c) => Math.max(c - 1, 0))
      }
    },
    [frames.length]
  )

  // ── Frame renderer ──
  const renderFrame = () => {
    switch (frame.type) {
      case 'deck-title':
        return <DeckTitleFrame />
      case 'section':
        return <SectionFrame frame={frame} />
      case 'slide-title':
        return <SlideTitleFrame frame={frame} />
      case 'content':
        return <ContentFrame frame={frame} />
      case 'visual':
        return <VisualFrame frame={frame} />
      case 'statement':
        return <StatementFrame frame={frame} />
    }
  }

  const progress = ((currentIdx + 1) / frames.length) * 100

  return (
    <div
      className="presentation-root flex h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* Thin progress bar */}
      <div className="h-1 w-full bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Frame content area with fade transition */}
      <div className="flex-1 overflow-hidden px-12 py-8 lg:px-20 lg:py-12">
        <div
          key={currentIdx}
          className="h-full animate-[fadeIn_0.3s_ease-out]"
          style={{ animationFillMode: 'both' }}
        >
          {renderFrame()}
        </div>
      </div>

      {/* Keyboard shortcut overlay */}
      {showHelp ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowHelp(false)}
          role="dialog"
          aria-label="Keyboard shortcuts"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-base text-slate-300">
              {[
                ['→ / Space / PageDown', 'Next frame'],
                ['← / PageUp', 'Previous frame'],
                ['Home', 'First frame'],
                ['End', 'Last frame'],
                ['F', 'Toggle fullscreen'],
                ['?', 'Toggle this help'],
                ['Esc', 'Close help'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <kbd className="rounded bg-slate-800 px-2 py-0.5 font-mono text-sm text-cyan-300">
                    {key}
                  </kbd>
                  <span className="text-slate-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Navigation bar */}
      <nav
        className="flex items-center justify-between border-t border-slate-800 px-6 py-3"
        aria-label="Presentation navigation"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/technology-adoption-series"
            className="rounded-lg bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
          >
            ← Series
          </Link>
          <button
            onClick={() => setCurrentIdx((c) => Math.max(c - 1, 0))}
            disabled={currentIdx === 0}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-30"
            aria-label="Previous frame"
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentIdx((c) => Math.min(c + 1, frames.length - 1))}
            disabled={currentIdx === frames.length - 1}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-30"
            aria-label="Next frame"
          >
            Next →
          </button>
        </div>

        <div className="text-sm text-slate-500">
          {currentIdx + 1} / {frames.length}
          {frame.sourceSlide > 0 ? (
            <span className="ml-2 text-slate-600">&middot; Slide {frame.sourceSlide}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(true)}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
            aria-label="Show keyboard shortcuts"
          >
            ?
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700"
            aria-label="Toggle fullscreen"
          >
            ⛶ Fullscreen
          </button>
        </div>
      </nav>
    </div>
  )
}
