'use client'

import { useRef } from 'react'
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch'
import { assetPath } from '@/lib/assetPath'

const SVG_WIDTH = 10206
const SVG_HEIGHT = 6731

const MindMapViewer = () => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null)

  const handleZoomIn = () => transformRef.current?.zoomIn()
  const handleZoomOut = () => transformRef.current?.zoomOut()
  const handleReset = () => transformRef.current?.resetTransform()

  return (
    <section
      aria-label="TABS literature review mind map"
      className="relative bg-slate-50 border-y border-slate-200"
    >
      <div className="relative mx-auto" style={{ height: 'min(80vh, 900px)', maxWidth: '100%' }}>
        <TransformWrapper
          ref={transformRef}
          initialScale={0.15}
          minScale={0.05}
          maxScale={4}
          limitToBounds={false}
          centerOnInit
          wheel={{ step: 0.1 }}
          doubleClick={{ mode: 'reset' }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: SVG_WIDTH, height: SVG_HEIGHT }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath('/Svgs/lit-review/mind-map.svg')}
              alt="TABS literature review mind map showing technology adoption models, frameworks, standards, and the culminating research project workflow."
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              draggable={false}
              style={{
                width: SVG_WIDTH,
                height: SVG_HEIGHT,
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
