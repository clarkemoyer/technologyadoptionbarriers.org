'use client'

import { useState, useEffect, useCallback } from 'react'

export default function ReadingProgressBar() {
  const [headerH, setHeaderH] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const header = document.getElementById('header')
    if (!header) return
    const ro = new ResizeObserver(([entry]) => {
      setHeaderH(entry.contentRect.height)
    })
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    if (docHeight <= 0) {
      setProgress(0)
      return
    }
    setProgress(Math.min(100, (scrollTop / docHeight) * 100))
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

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
