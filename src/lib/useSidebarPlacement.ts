'use client'

import { useState, useLayoutEffect, useRef } from 'react'
import { SIDEBAR_GAP, SIDEBAR_MIN_SPACE } from '@/lib/sidebar-constants'

/**
 * Measures the space to the right of the first `<article>` element and
 * decides whether there is room for a fixed desktop sidebar.
 *
 * Uses `useLayoutEffect` so the correct variant (desktop sidebar vs mobile
 * FAB) renders on the first paint — avoiding a visible flash where the FAB
 * appears briefly on wide viewports before being replaced by the sidebar.
 *
 * Returns `{ canShowDesktop, tocLeft }`.
 */
export function useSidebarPlacement() {
  const [canShowDesktop, setCanShowDesktop] = useState(false)
  const [tocLeft, setTocLeft] = useState(0)
  const prevCanShowDesktopRef = useRef(false)
  const prevTocLeftRef = useRef(0)

  useLayoutEffect(() => {
    let rafId: number | null = null

    const update = () => {
      const article = document.querySelector('article')
      if (!article) return
      const rect = article.getBoundingClientRect()
      const rightSpace = window.innerWidth - rect.right
      const nextCanShow = rightSpace >= SIDEBAR_MIN_SPACE
      const nextLeft = rect.right + SIDEBAR_GAP
      if (nextCanShow !== prevCanShowDesktopRef.current) {
        prevCanShowDesktopRef.current = nextCanShow
        setCanShowDesktop(nextCanShow)
      }
      if (nextLeft !== prevTocLeftRef.current) {
        prevTocLeftRef.current = nextLeft
        setTocLeft(nextLeft)
      }
    }

    const onResize = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        update()
      })
    }

    update()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return { canShowDesktop, tocLeft }
}
