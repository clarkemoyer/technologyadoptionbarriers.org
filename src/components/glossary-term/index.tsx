'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { glossaryTerms, type GlossaryTermEntry } from '@/data/glossary-terms'

/**
 * Note: intentionally separate from src/components/ui/tooltip.tsx.
 * That component uses role="tooltip" (non-interactive) for icon labels.
 * This component uses role="dialog" because its popover contains a
 * focusable "See full entry" link, which ARIA 1.2 prohibits inside
 * role="tooltip".
 */

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
  children?: ReactNode
  /** Where the "See full entry" link points. Defaults to the canonical glossary. */
  glossaryHref?: string
}

/**
 * Inline glossary term with an accessible hover/focus/tap popover.
 *
 * Renders as a `<button>` so the popover can be triggered by keyboard
 * (focus), mouse (hover), or touch (tap). Escape dismisses and restores
 * focus to the trigger when called from within the popover. A pointerdown
 * outside the component closes it.
 *
 * If `termId` is not in the glossary data, the component renders its
 * children (or the id) as plain text without a popover - no crash and no
 * silent "popover on an unknown term" trap.
 */
export default function Term({ termId, children, glossaryHref = '/results/glossary' }: TermProps) {
  const entry = useMemo(() => termLookup.get(termId), [termId])

  const [open, setOpen] = useState(false)
  const popoverId = useId()
  const titleId = useId()
  const definitionId = useId()
  const containerRef = useRef<HTMLSpanElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // True while the pointer is inside the trigger button or the popover.
  // Used to suppress click-toggling when hover already controls open state:
  // mouseenter (hover) fires before click on desktop, so without this guard
  // a hover+click sequence would open then immediately close the popover.
  const mouseInsideRef = useRef(false)

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  // Delays closing by 150 ms so the pointer can traverse the mb-2 gap between
  // the trigger and the popover without unmounting the popover prematurely.
  // Also skips closing when keyboard focus is still inside the component.
  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      if (!containerRef.current?.contains(document.activeElement)) {
        setOpen(false)
      }
    }, 150)
  }, [cancelClose])

  const closePopover = useCallback(
    ({ restoreFocus = false }: { restoreFocus?: boolean } = {}) => {
      cancelClose()
      const container = containerRef.current
      const trigger = container?.querySelector<HTMLButtonElement>('button')
      const activeElement = document.activeElement
      const shouldRestoreFocus =
        restoreFocus &&
        trigger instanceof HTMLButtonElement &&
        !!activeElement &&
        container?.contains(activeElement) &&
        activeElement !== trigger

      setOpen(false)

      if (!shouldRestoreFocus || !(trigger instanceof HTMLButtonElement)) {
        return
      }

      // Intercept the programmatic focusin in capture phase so React's
      // onFocus handler (which would re-open the popover) never fires.
      const swallowProgrammaticFocus = (event: FocusEvent) => {
        event.stopPropagation()
        trigger.removeEventListener('focusin', swallowProgrammaticFocus, true)
      }
      trigger.addEventListener('focusin', swallowProgrammaticFocus, true)
      requestAnimationFrame(() => {
        trigger.focus()
      })
    },
    [cancelClose]
  )

  // Cleanup pending timer on unmount.
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopover({ restoreFocus: true })
      }
    }
    const onClickOutside = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        closePopover()
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onClickOutside)
    }
  }, [open, closePopover])

  if (!entry) {
    return <>{children ?? termId}</>
  }

  const display = children ?? entry.term

  // Close when focus exits the entire component. React synthetic onBlur
  // bubbles, so a blur on either the trigger button or the "See full
  // entry" link hits this handler; relatedTarget is the element receiving
  // focus next. If the next focus is outside the container (e.g. the user
  // Tabs past the link), close the popover. If it's still inside (e.g.
  // Tab from button into link), leave it open.
  const handleContainerBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
      setOpen(false)
    }
  }

  return (
    <span ref={containerRef} className="relative inline-block" onBlur={handleContainerBlur}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-describedby={open ? definitionId : undefined}
        className="decoration-dotted decoration-blue-500 underline underline-offset-2 text-current bg-transparent border-0 p-0 cursor-help focus-visible:outline-2 focus-visible:outline-blue-600"
        onClick={() => {
          // When the mouse is inside the component, hover already controls the
          // open state — suppress toggling so hover+click doesn't close the
          // popover immediately after hover opened it. For keyboard and touch
          // (where mouseInsideRef stays false), allow normal toggle behavior.
          if (mouseInsideRef.current) return
          setOpen((v) => !v)
        }}
        onMouseEnter={() => {
          mouseInsideRef.current = true
          cancelClose()
          setOpen(true)
        }}
        onMouseLeave={() => {
          mouseInsideRef.current = false
          scheduleClose()
        }}
        onFocus={() => {
          cancelClose()
          setOpen(true)
        }}
      >
        {display}
      </button>
      {open && (
        <span
          id={popoverId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="absolute bottom-full left-0 mb-2 w-72 rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-800 shadow-lg z-50"
          onMouseEnter={() => {
            mouseInsideRef.current = true
            cancelClose()
            setOpen(true)
          }}
          onMouseLeave={() => {
            mouseInsideRef.current = false
            scheduleClose()
          }}
        >
          <span id={titleId} className="block font-semibold text-blue-900 mb-1">
            {entry.term}
          </span>
          <span id={definitionId} className="block leading-relaxed">
            {entry.shortDefinition}
          </span>
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
