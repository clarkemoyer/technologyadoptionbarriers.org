'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch'
import { assetPath } from '@/lib/assetPath'

type SvgDimensions = {
  width: number
  height: number
}

type MindMapViewerProps = {
  /** Path under /public — e.g. '/Svgs/mind-maps/full-mind-map.svg'. */
  src: string
  /** Descriptive alt text for the image. */
  alt: string
  /** aria-label for the surrounding section; defaults to the alt text. */
  ariaLabel?: string
}

const FIT_PADDING = 0.95
/** Scale used on first render before `fitToWrapper` fires (SVG is very large so start small). */
export const INITIAL_SCALE = 0.08
/** Hard floor: prevents the user from shrinking the map to a near-invisible speck. */
export const MIN_SCALE = 0.02
/** Hard ceiling: 4× is sufficient to read leaf-level text in the exported map. */
export const MAX_SCALE = 4
/**
 * Fraction of the current scale added/removed per mouse-wheel tick.
 * Kept small so a single scroll notch produces a gentle zoom change rather
 * than a big jump. With step=0.03 each notch multiplies the scale by ~1.03.
 */
export const WHEEL_STEP = 0.03

const fitScaleFor = (
  wrapperWidth: number,
  wrapperHeight: number,
  svgWidth: number,
  svgHeight: number
) => Math.min(wrapperWidth / svgWidth, wrapperHeight / svgHeight) * FIT_PADDING

/**
 * Compute the scale and centered translation for fitting an SVG inside a wrapper,
 * clamped to [minScale, maxScale].
 *
 * Exported so unit tests can verify the clamping behaviour without depending on
 * real DOM layout (refs return 0 in JSDOM).
 */
export function computeFitTransform(
  wrapperWidth: number,
  wrapperHeight: number,
  svgWidth: number,
  svgHeight: number,
  minScale = MIN_SCALE,
  maxScale = MAX_SCALE
): { scale: number; x: number; y: number } {
  const raw = fitScaleFor(wrapperWidth, wrapperHeight, svgWidth, svgHeight)
  const scale = Math.max(minScale, Math.min(maxScale, raw))
  return {
    scale,
    x: (wrapperWidth - svgWidth * scale) / 2,
    y: (wrapperHeight - svgHeight * scale) / 2,
  }
}

const MindMapViewer = ({ src, alt, ariaLabel }: MindMapViewerProps) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const [svgDimensions, setSvgDimensions] = useState<SvgDimensions | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const syncSvgDimensions = useCallback(() => {
    const img = imgRef.current
    if (!img || img.naturalWidth <= 0 || img.naturalHeight <= 0) return
    const next: SvgDimensions = { width: img.naturalWidth, height: img.naturalHeight }
    setSvgDimensions((prev) =>
      prev?.width === next.width && prev?.height === next.height ? prev : next
    )
  }, [])

  const fitToWrapper = useCallback(
    (animate = 0) => {
      const wrapper = wrapperRef.current
      const instance = transformRef.current
      if (!wrapper || !instance || !svgDimensions) return
      const w = wrapper.clientWidth
      const h = wrapper.clientHeight
      if (w <= 0 || h <= 0) return
      const { scale, x, y } = computeFitTransform(w, h, svgDimensions.width, svgDimensions.height)
      instance.setTransform(x, y, scale, animate)
    },
    [svgDimensions]
  )

  // Covers the cached-image case: React may not fire `onLoad` if the image
  // is already in the browser cache when the component mounts.
  useEffect(() => {
    syncSvgDimensions()
  }, [syncSvgDimensions])

  useEffect(() => {
    if (!svgDimensions) return
    const raf = requestAnimationFrame(() => fitToWrapper(0))
    return () => cancelAnimationFrame(raf)
  }, [fitToWrapper, svgDimensions])

  // RAF-throttled resize so rapid events coalesce into one update per frame.
  useEffect(() => {
    if (!svgDimensions) return
    let rafId: ReturnType<typeof requestAnimationFrame> | null = null
    const onResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        rafId = null
        fitToWrapper(0)
      })
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [fitToWrapper, svgDimensions])

  const handleZoomIn = () => transformRef.current?.zoomIn()
  const handleZoomOut = () => transformRef.current?.zoomOut()
  const handleReset = () => fitToWrapper(200)
  // The library's own `doubleClick.mode: 'reset'` reverts to `initialScale`,
  // not the computed fit transform, which would jump the image off-center.
  // Handle the gesture ourselves so it matches the Reset button.
  const handleDoubleClick = () => fitToWrapper(200)

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement === el) {
      document.exitFullscreen().catch(() => {})
    } else {
      el.requestFullscreen().catch(() => {})
    }
  }, [])

  // Track fullscreen state so the button label + fit stay in sync with reality
  // (user can exit via Esc or browser fullscreen UI, which doesn't go through
  // our toggle handler).
  useEffect(() => {
    const onChange = () => {
      const nowFs = document.fullscreenElement === containerRef.current
      setIsFullscreen(nowFs)
      // Refit whenever the viewport-height changes (entering/leaving fullscreen
      // swaps between wrapper height and 100vh).
      requestAnimationFrame(() => fitToWrapper(0))
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [fitToWrapper])

  const resolvedAriaLabel = ariaLabel ?? alt

  return (
    <section
      ref={containerRef}
      aria-label={resolvedAriaLabel}
      className={
        isFullscreen
          ? 'relative bg-slate-50 w-screen h-screen flex flex-col overflow-hidden'
          : 'relative bg-slate-50 border-y border-slate-200'
      }
    >
      <div
        ref={wrapperRef}
        className="relative mx-auto"
        style={{
          ...(isFullscreen ? { flex: '1 1 0', minHeight: 0 } : { height: 'min(80vh, 900px)' }),
          maxWidth: '100%',
        }}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={INITIAL_SCALE}
          minScale={MIN_SCALE}
          maxScale={MAX_SCALE}
          limitToBounds={false}
          wheel={{ step: WHEEL_STEP }}
          smooth
          doubleClick={{ disabled: true }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={
              svgDimensions
                ? { width: svgDimensions.width, height: svgDimensions.height }
                : { width: '100%', height: '100%' }
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={assetPath(src)}
              alt={alt}
              width={svgDimensions?.width}
              height={svgDimensions?.height}
              onLoad={syncSvgDimensions}
              onDoubleClick={handleDoubleClick}
              draggable={false}
              style={{
                width: svgDimensions?.width,
                height: svgDimensions?.height,
                userSelect: 'none',
              }}
            />
          </TransformComponent>
        </TransformWrapper>

        <div
          className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 border border-slate-300 rounded-md shadow-sm p-1"
          role="toolbar"
          aria-label="Mind map controls"
        >
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="px-3 py-1 text-base font-semibold text-slate-800 hover:bg-slate-100 rounded"
          >
            &minus;
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="px-3 py-1 text-base font-semibold text-slate-800 hover:bg-slate-100 rounded"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset zoom and position"
            className="px-3 py-1 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded"
          >
            Reset
          </button>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-300" />
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-pressed={isFullscreen}
            className="px-3 py-1 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-slate-600 py-3 px-4">
        Source: exported from Lucidspark. For a fully interactive version with clickable nodes, see
        the{' '}
        <a
          href={assetPath(src)}
          className="underline hover:text-slate-900"
          target="_blank"
          rel="noopener noreferrer"
        >
          raw SVG
        </a>
        .
      </p>
    </section>
  )
}

export default MindMapViewer
