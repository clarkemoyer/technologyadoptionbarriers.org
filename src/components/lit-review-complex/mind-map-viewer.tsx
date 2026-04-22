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

const FIT_PADDING = 0.95

const parseViewBox = (viewBox: string | null): SvgDimensions | null => {
  if (!viewBox) return null

  const parts = viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number)

  if (parts.length !== 4 || Number.isNaN(parts[2]) || Number.isNaN(parts[3])) {
    return null
  }

  const width = parts[2]
  const height = parts[3]

  if (width <= 0 || height <= 0) return null

  return { width, height }
}

const getDimensionsFromSvgElement = (svgElement: Element | null): SvgDimensions | null => {
  if (!svgElement) return null

  const viewBoxDimensions = parseViewBox(svgElement.getAttribute('viewBox'))
  if (viewBoxDimensions) return viewBoxDimensions

  const width = parseFloat(svgElement.getAttribute('width') ?? '')
  const height = parseFloat(svgElement.getAttribute('height') ?? '')

  if (!Number.isNaN(width) && !Number.isNaN(height) && width > 0 && height > 0) {
    return { width, height }
  }

  return null
}

const getSvgDimensionsFromContainer = (container: HTMLDivElement): SvgDimensions | null => {
  const inlineSvg = container.querySelector('svg')
  const inlineDimensions = getDimensionsFromSvgElement(inlineSvg)
  if (inlineDimensions) return inlineDimensions

  const objectElement = container.querySelector('object')
  const objectSvg = objectElement?.contentDocument?.querySelector('svg') ?? null
  const objectDimensions = getDimensionsFromSvgElement(objectSvg)
  if (objectDimensions) return objectDimensions

  const imageElement = container.querySelector('img')
  if (imageElement && imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
    return {
      width: imageElement.naturalWidth,
      height: imageElement.naturalHeight,
    }
  }

  return null
}

const fitScaleFor = (
  wrapperWidth: number,
  wrapperHeight: number,
  svgWidth: number,
  svgHeight: number
) => Math.min(wrapperWidth / svgWidth, wrapperHeight / svgHeight) * FIT_PADDING

const MindMapViewer = () => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [svgDimensions, setSvgDimensions] = useState<SvgDimensions | null>(null)

  const syncSvgDimensions = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const nextDimensions = getSvgDimensionsFromContainer(wrapper)
    if (!nextDimensions) return

    setSvgDimensions((previousDimensions) => {
      if (
        previousDimensions?.width === nextDimensions.width &&
        previousDimensions?.height === nextDimensions.height
      ) {
        return previousDimensions
      }

      return nextDimensions
    })
  }, [])

  const fitToWrapper = useCallback(
    (animate = 0) => {
      const wrapper = wrapperRef.current
      const instance = transformRef.current
      if (!wrapper || !instance || !svgDimensions) return
      const w = wrapper.clientWidth
      const h = wrapper.clientHeight
      if (w <= 0 || h <= 0) return
      const scale = fitScaleFor(w, h, svgDimensions.width, svgDimensions.height)
      const x = (w - svgDimensions.width * scale) / 2
      const y = (h - svgDimensions.height * scale) / 2
      instance.setTransform(x, y, scale, animate)
    },
    [svgDimensions]
  )

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      syncSvgDimensions()
    })

    return () => {
      cancelAnimationFrame(raf)
    }
  }, [syncSvgDimensions])

  // Fit on mount once the wrapper and SVG have real dimensions.
  useEffect(() => {
    if (!svgDimensions) return

    const raf = requestAnimationFrame(() => fitToWrapper(0))
    return () => cancelAnimationFrame(raf)
  }, [fitToWrapper, svgDimensions])

  // Re-fit on viewport resize so the map stays framed when the layout changes.
  useEffect(() => {
    if (!svgDimensions) return

    const onResize = () => fitToWrapper(0)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fitToWrapper, svgDimensions])

  const handleZoomIn = () => transformRef.current?.zoomIn()
  const handleZoomOut = () => transformRef.current?.zoomOut()
  const handleReset = () => fitToWrapper(200)

  return (
    <section
      aria-label="TABS literature review mind map"
      className="relative bg-slate-50 border-y border-slate-200"
    >
      <div
        ref={wrapperRef}
        className="relative mx-auto"
        style={{ height: 'min(80vh, 900px)', maxWidth: '100%' }}
      >
        {/* `initialScale` is only applied on mount; later fit updates are handled via `setTransform`. */}
        <TransformWrapper
          ref={transformRef}
          initialScale={0.08}
          minScale={0.02}
          maxScale={4}
          limitToBounds={false}
          wheel={{ step: 0.1 }}
          doubleClick={{ mode: 'reset', animationTime: 200 }}
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
              src={assetPath('/Svgs/lit-review/mind-map.svg')}
              alt="TABS literature review mind map showing technology adoption models, frameworks, standards, and the culminating research project workflow."
              width={svgDimensions?.width}
              height={svgDimensions?.height}
              onLoad={syncSvgDimensions}
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
          className="absolute top-3 right-3 flex gap-1 bg-white/95 border border-slate-300 rounded-md shadow-sm p-1"
          role="toolbar"
          aria-label="Mind map zoom controls"
        >
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
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="px-3 py-1 text-base font-semibold text-slate-800 hover:bg-slate-100 rounded"
          >
            &minus;
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset zoom and position"
            className="px-3 py-1 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-slate-600 py-3 px-4">
        Source: exported from Lucidspark. For a fully interactive version with clickable nodes, see
        the{' '}
        <a
          href={assetPath('/Svgs/lit-review/mind-map.svg')}
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
