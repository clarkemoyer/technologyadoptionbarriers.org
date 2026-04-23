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

export type MindMapViewerInitialFocus = {
  /** Top-left x in SVG coordinates. */
  x: number
  /** Top-left y in SVG coordinates. */
  y: number
  /** Width of the region in SVG coordinates. */
  w: number
  /** Height of the region in SVG coordinates. */
  h: number
}

type MindMapViewerProps = {
  /** Path under /public — e.g. '/Svgs/mind-maps/full-mind-map.svg'. */
  src: string
  /** Descriptive alt text for the image. */
  alt: string
  /** aria-label for the surrounding section; defaults to the alt text. */
  ariaLabel?: string
  /**
   * Optional region of the SVG (in SVG coordinates) to center and zoom to
   * on initial render. When omitted, the full image is fit to the wrapper.
   */
  initialFocus?: MindMapViewerInitialFocus
}

const FIT_PADDING = 0.95
const MIN_SCALE = 0.02
const MAX_SCALE = 8
const WHEEL_STEP = 0.1
const BUTTON_STEP = 0.15
const KEY_PAN_PX = 80

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

const fitScaleFor = (
  wrapperWidth: number,
  wrapperHeight: number,
  svgWidth: number,
  svgHeight: number
) => Math.min(wrapperWidth / svgWidth, wrapperHeight / svgHeight) * FIT_PADDING

const focusScaleFor = (
  wrapperWidth: number,
  wrapperHeight: number,
  regionWidth: number,
  regionHeight: number
) => Math.min(wrapperWidth / regionWidth, wrapperHeight / regionHeight) * FIT_PADDING

const MindMapViewer = ({ src, alt, ariaLabel, initialFocus }: MindMapViewerProps) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [svgDimensions, setSvgDimensions] = useState<SvgDimensions | null>(null)
  const [currentScale, setCurrentScale] = useState(MIN_SCALE)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const syncSvgDimensions = useCallback(() => {
    const img = imgRef.current
    if (!img || img.naturalWidth <= 0 || img.naturalHeight <= 0) return
    const next: SvgDimensions = { width: img.naturalWidth, height: img.naturalHeight }
    setSvgDimensions((prev) =>
      prev?.width === next.width && prev?.height === next.height ? prev : next
    )
  }, [])

  /** Center the whole image in the wrapper. */
  const fitToWrapper = useCallback(
    (animate = 0) => {
      const wrapper = wrapperRef.current
      const instance = transformRef.current
      if (!wrapper || !instance || !svgDimensions) return
      const w = wrapper.clientWidth
      const h = wrapper.clientHeight
      if (w <= 0 || h <= 0) return
      const scale = clamp(
        fitScaleFor(w, h, svgDimensions.width, svgDimensions.height),
        MIN_SCALE,
        MAX_SCALE
      )
      const x = (w - svgDimensions.width * scale) / 2
      const y = (h - svgDimensions.height * scale) / 2
      instance.setTransform(x, y, scale, animate)
      setCurrentScale(scale)
    },
    [svgDimensions]
  )

  /** Center a specific SVG-space region in the wrapper. */
  const focusRegion = useCallback(
    (region: MindMapViewerInitialFocus, animate = 0) => {
      const wrapper = wrapperRef.current
      const instance = transformRef.current
      if (!wrapper || !instance || !svgDimensions) return
      const w = wrapper.clientWidth
      const h = wrapper.clientHeight
      if (w <= 0 || h <= 0) return

      const { x: regionX, y: regionY, w: regionW, h: regionH } = region
      if (
        !Number.isFinite(regionX) ||
        !Number.isFinite(regionY) ||
        !Number.isFinite(regionW) ||
        !Number.isFinite(regionH) ||
        regionW <= 0 ||
        regionH <= 0
      ) {
        return
      }

      const scale = clamp(focusScaleFor(w, h, regionW, regionH), MIN_SCALE, MAX_SCALE)
      const regionCx = regionX + regionW / 2
      const regionCy = regionY + regionH / 2
      const x = w / 2 - regionCx * scale
      const y = h / 2 - regionCy * scale
      if (!Number.isFinite(scale) || !Number.isFinite(x) || !Number.isFinite(y)) return
      instance.setTransform(x, y, scale, animate)
      setCurrentScale(scale)
    },
    [svgDimensions]
  )

  const handleDoubleClick = () => {
    if (initialFocus) focusRegion(initialFocus, 200)
    else fitToWrapper(200)
  }

  // Covers the cached-image case: React may not fire onLoad if the image
  // is already in the browser cache when the component mounts.
  useEffect(() => {
    syncSvgDimensions()
  }, [syncSvgDimensions])

  // Initial framing: focus a region if provided, else fit the whole image.
  useEffect(() => {
    if (!svgDimensions) return
    const raf = requestAnimationFrame(() => {
      if (initialFocus) focusRegion(initialFocus, 0)
      else fitToWrapper(0)
    })
    return () => cancelAnimationFrame(raf)
  }, [fitToWrapper, focusRegion, initialFocus, svgDimensions])

  // RAF-throttled resize so rapid events coalesce into one update per frame.
  useEffect(() => {
    if (!svgDimensions) return
    let rafId: ReturnType<typeof requestAnimationFrame> | null = null
    const onResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        rafId = null
        if (initialFocus) focusRegion(initialFocus, 0)
        else fitToWrapper(0)
      })
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [fitToWrapper, focusRegion, initialFocus, svgDimensions])

  // Track fullscreen state so the toolbar label + icon reflect reality.
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Zoom buttons / slider / keyboard controls use the transform instance.
  const zoomTo = useCallback((nextScale: number, animate = 150) => {
    const wrapper = wrapperRef.current
    const instance = transformRef.current
    if (!wrapper || !instance) return
    const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE)
    const state = instance.state
    // Zoom toward the wrapper centre so the viewport doesn't drift.
    const w = wrapper.clientWidth
    const h = wrapper.clientHeight
    const cx = w / 2
    const cy = h / 2
    const ratio = clamped / state.scale
    const nextX = cx - (cx - state.positionX) * ratio
    const nextY = cy - (cy - state.positionY) * ratio
    instance.setTransform(nextX, nextY, clamped, animate)
    setCurrentScale(clamped)
  }, [])

  const panBy = useCallback((dx: number, dy: number) => {
    const instance = transformRef.current
    if (!instance) return
    const s = instance.state
    instance.setTransform(s.positionX + dx, s.positionY + dy, s.scale, 0)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement === el) {
      if (typeof document.exitFullscreen !== 'function') return
      void document.exitFullscreen().catch(() => {})
      return
    }
    if (typeof el.requestFullscreen !== 'function') return
    void el.requestFullscreen().catch(() => {})
  }, [])

  const handleZoomIn = () => zoomTo(currentScale + BUTTON_STEP)
  const handleZoomOut = () => zoomTo(currentScale - BUTTON_STEP)
  const handleReset = useCallback(() => {
    if (initialFocus) focusRegion(initialFocus, 200)
    else fitToWrapper(200)
  }, [initialFocus, focusRegion, fitToWrapper])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      // Don't steal arrow/key events from interactive controls (e.g. the zoom slider).
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT' || tag === 'TEXTAREA') return
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          panBy(0, KEY_PAN_PX)
          break
        case 'ArrowDown':
          e.preventDefault()
          panBy(0, -KEY_PAN_PX)
          break
        case 'ArrowLeft':
          e.preventDefault()
          panBy(KEY_PAN_PX, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          panBy(-KEY_PAN_PX, 0)
          break
        case '+':
        case '=':
          e.preventDefault()
          zoomTo(currentScale + BUTTON_STEP)
          break
        case '-':
        case '_':
          e.preventDefault()
          zoomTo(currentScale - BUTTON_STEP)
          break
        case '0':
          e.preventDefault()
          handleReset()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        default:
          break
      }
    },
    [currentScale, handleReset, panBy, toggleFullscreen, zoomTo]
  )

  const resolvedAriaLabel = ariaLabel ?? alt

  return (
    <section
      aria-label={resolvedAriaLabel}
      className="relative bg-slate-50 border-y border-slate-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-0"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={containerRef}
        className={isFullscreen ? 'relative bg-slate-50 w-screen h-screen' : 'relative'}
      >
        <div
          ref={wrapperRef}
          className="relative mx-auto"
          style={{
            height: isFullscreen ? '100vh' : 'min(80vh, 900px)',
            maxWidth: '100%',
          }}
        >
          <TransformWrapper
            ref={transformRef}
            initialScale={0.08}
            minScale={MIN_SCALE}
            maxScale={MAX_SCALE}
            limitToBounds={false}
            wheel={{ step: WHEEL_STEP }}
            doubleClick={{ disabled: true }}
            onTransform={(_, state) =>
              setCurrentScale((prev) => (prev === state.scale ? prev : state.scale))
            }
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
            className="absolute top-3 right-3 flex flex-wrap items-center gap-1 bg-white/95 border border-slate-300 rounded-md shadow-sm p-1"
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
            <input
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={0.01}
              value={currentScale}
              onChange={(e) => zoomTo(parseFloat(e.target.value), 0)}
              aria-label="Zoom level"
              title={`Zoom: ${(currentScale * 100).toFixed(0)}%`}
              className="w-24 accent-blue-600"
            />
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="px-3 py-1 text-base font-semibold text-slate-800 hover:bg-slate-100 rounded"
            >
              +
            </button>
            <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden="true" />
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset zoom and position"
              className="px-3 py-1 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              aria-pressed={isFullscreen}
              className="px-3 py-1 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded"
            >
              {isFullscreen ? 'Exit FS' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-slate-600 py-3 px-4">
        Source: exported from Lucidspark. Drag to pan, scroll or pinch to zoom, double-click to
        reset. Arrow keys pan, <kbd>+</kbd>/<kbd>-</kbd> zoom, <kbd>0</kbd> reset, <kbd>F</kbd>{' '}
        toggles fullscreen.{' '}
        <a
          href={assetPath(src)}
          className="underline hover:text-slate-900"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open raw SVG
        </a>
        .
      </p>
    </section>
  )
}

export default MindMapViewer
