'use client'

import { useState, useLayoutEffect, useRef } from 'react'
import { SIDEBAR_GAP, SIDEBAR_MIN_SPACE } from '@/lib/sidebar-constants'

/**
 * Measures the space to the right of the first `<article>` element and
 * decides whether there is room for a fixed desktop sidebar.
 *
 * Uses `useLayoutEffect` to measure layout before paint during client-side
 * renders after hydration, which helps avoid a visible flash where the FAB
 * briefly appears before being replaced by the sidebar on later client
 * updates. In Next.js App Router, the initial server-rendered HTML still
 * uses the default mobile state until hydration completes.
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
      if (!article) {
        if (prevCanShowDesktopRef.current !== false) {
          prevCanShowDesktopRef.current = false
          setCanShowDesktop(false)
        }
        if (prevTocLeftRef.current !== 0) {
          prevTocLeftRef.current = 0
          setTocLeft(0)
        }
        return
      }
      const rect = article.getBoundingClientRect()
      const viewportWidth = window.visualViewport?.width ?? document.documentElement.clientWidth
      const rightSpace = viewportWidth - rect.right
      const nextCanShow = rightSpace >= SIDEBAR_MIN_SPACE
      const maxLeft = Math.max(SIDEBAR_GAP, viewportWidth - SIDEBAR_MIN_SPACE)
      const nextLeft = Math.min(rect.right + SIDEBAR_GAP, maxLeft)
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
