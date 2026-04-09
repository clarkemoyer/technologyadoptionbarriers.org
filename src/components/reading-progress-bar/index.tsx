'use client'

import { useState, useEffect, useRef } from 'react'

export default function ReadingProgressBar() {
  const [headerH, setHeaderH] = useState(0)
  const [progress, setProgress] = useState(0)
  const rafId = useRef(0)

  useEffect(() => {
    const header = document.getElementById('header')
    if (!header) return
    const ro = new ResizeObserver(([entry]) => {
      setHeaderH(entry.contentRect.height)
    })
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    function handleScroll() {
      if (rafId.current) return
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const next = docHeight <= 0 ? 0 : Math.round(Math.min(100, (scrollTop / docHeight) * 100))
        setProgress((prev) => (prev === next ? prev : next))
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
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
  )
}
