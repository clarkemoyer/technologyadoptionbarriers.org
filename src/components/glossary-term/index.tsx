'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { glossaryTerms, type GlossaryTermEntry } from '@/data/glossary-terms'

const termLookup: Map<string, GlossaryTermEntry> = new Map(
  glossaryTerms.map((entry) => [entry.id, entry])
)

type TermProps = {
  /** Id of the entry in src/data/glossary-terms.ts. */
  termId: string
  /**
   * Optional override for the visible text. Defaults to the entry's `term`.
   * Useful for rendering short forms (e.g. "KMO") when the entry's `term`
   * is "Kaiser-Meyer-Olkin (KMO) Measure".
   */
  children?: React.ReactNode
  /** Where the "See full entry" link points. Defaults to the canonical glossary. */
  glossaryHref?: string
}

/**
 * Inline glossary term with an accessible hover/focus/tap tooltip.
 *
 * Renders as a `<button>` so the tooltip can be triggered by keyboard
 * (focus), mouse (hover), or touch (tap). Escape dismisses. A click
 * outside the button closes it.
 *
 * If `termId` is not in the glossary data, the component renders its
 * children (or the id) as plain text without a tooltip - no crash and no
 * silent "popover on an unknown term" trap.
 */
export default function Term({ termId, children, glossaryHref = '/results/glossary' }: TermProps) {
  const entry = useMemo(() => termLookup.get(termId), [termId])

  const [open, setOpen] = useState(false)
  const tooltipId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Do not re-focus the trigger here - it fires onFocus, which re-opens
        // the tooltip. The trigger already has focus when Escape is pressed.
        setOpen(false)
      }
    }
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [open])

  if (!entry) {
    return <>{children ?? termId}</>
  }

  const display = children ?? entry.term

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open ? 'true' : 'false'}
        className="decoration-dotted decoration-blue-500 underline underline-offset-2 text-current bg-transparent border-0 p-0 cursor-help focus-visible:outline-2 focus-visible:outline-blue-600"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          // Keep open if focus moved into the tooltip (e.g. onto the "See full entry" link).
          if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
            setOpen(false)
          }
        }}
      >
        {display}
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-0 mb-2 w-72 rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-800 shadow-lg z-50"
          // Keep the tooltip open while the pointer is over it.
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <span className="block font-semibold text-blue-900 mb-1">{entry.term}</span>
          <span className="block leading-relaxed">{entry.shortDefinition}</span>
          <Link
            href={`${glossaryHref}#${entry.id}`}
            className="mt-2 inline-block text-xs text-blue-700 hover:underline focus-visible:underline"
          >
            See full entry
          </Link>
        </span>
      )}
    </span>
  )
}
