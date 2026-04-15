'use client'

import React, { useEffect, useState, useRef } from 'react'
import { connections } from './data'

interface Point {
  x: number
  y: number
}

interface NodeRects {
  [key: string]: DOMRect
}

export default function SvgOverlay() {
  const [nodeRects, setNodeRects] = useState<NodeRects>({})
  const overlayRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const updateRects = () => {
      const newRects: NodeRects = {}
      connections.forEach((conn) => {
        const sourceEl = document.getElementById(`node-${conn.source}`)
        const targetEl = document.getElementById(`node-${conn.target}`)

        if (sourceEl) newRects[conn.source] = sourceEl.getBoundingClientRect()
        if (targetEl) newRects[conn.target] = targetEl.getBoundingClientRect()
      })
      setNodeRects(newRects)
    }

    updateRects()

    // Create a ResizeObserver to observe changes in the container size
    const observer = new ResizeObserver(updateRects)

    // Debounce resize
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateRects, 100)
    }

    window.addEventListener('resize', handleResize)
    document.body.addEventListener('scroll', updateRects, true)

    // Initial delay to ensure DOM layout is settled
    setTimeout(updateRects, 500)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.body.removeEventListener('scroll', updateRects, true)
      observer.disconnect()
      clearTimeout(timeoutId)
    }
  }, [])

  const getContainerOffset = () => {
    if (!overlayRef.current) return { x: 0, y: 0 }
    const rect = overlayRef.current.getBoundingClientRect()
    return { x: rect.left, y: rect.top }
  }

  const createPath = (sourceRect: DOMRect, targetRect: DOMRect, containerOffset: Point) => {
    // Connect right side of source to left side of target
    const startX = sourceRect.right - containerOffset.x
    const startY = sourceRect.top + sourceRect.height / 2 - containerOffset.y

    const endX = targetRect.left - containerOffset.x
    const endY = targetRect.top + targetRect.height / 2 - containerOffset.y

    const controlPointOffset = Math.abs(endX - startX) * 0.4

    return `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`
  }

  return (
    <svg
      ref={overlayRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ minHeight: '100%' }}
    >
      <defs>
        <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {connections.map((conn, idx) => {
        const sourceRect = nodeRects[conn.source]
        const targetRect = nodeRects[conn.target]

        if (!sourceRect || !targetRect) return null

        const offset = getContainerOffset()
        const pathData = createPath(sourceRect, targetRect, offset)

        return (
          <path
            key={`${conn.source}-${conn.target}-${idx}`}
            d={pathData}
            fill="none"
            stroke={conn.color || 'url(#gradientLine)'}
            strokeWidth="2"
            opacity={0.6}
            className="transition-all duration-300 ease-in-out"
          />
        )
      })}
    </svg>
  )
}
