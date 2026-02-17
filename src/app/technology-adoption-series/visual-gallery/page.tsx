'use client'

import React, { useState } from 'react'
import { PresentationVisual, VISUAL_REGISTRY } from '../presentation/presentation-visuals' // Adjusted import path
import { VISUAL_GALLERY_DATA } from '@/data/visual-gallery'
import { assetPath } from '@/lib/assetPath'

export default function VisualGalleryPage() {
  const [viewMode, setViewMode] = useState<'split' | 'modern' | 'ascii'>('split')

  // Group by part
  const groupedVisuals = VISUAL_GALLERY_DATA.reduce(
    (acc, visual) => {
      if (!acc[visual.part]) acc[visual.part] = []
      acc[visual.part].push(visual)
      return acc
    },
    {} as Record<string, typeof VISUAL_GALLERY_DATA>
  )

  const parts = Object.keys(groupedVisuals)

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 px-6 py-16 text-center sm:px-12">
        <h1 className="text-4xl font-extrabold text-white md:text-5xl">Visual Gallery</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          A comprehensive library of all diagrams and models from the Technology Adoption Series,
          available in both Modern (React) and ASCII (Text) formats.
        </p>
      </div>

      {/* Controls */}
      <div className="sticky top-[80px] z-50 border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm font-semibold text-slate-600">
            Showing {VISUAL_GALLERY_DATA.length} Visuals
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('modern')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'modern'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Modern Only
            </button>
            <button
              onClick={() => setViewMode('ascii')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'ascii'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              ASCII Only
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1600px] px-6 py-12">
        {parts.map((part) => (
          <section key={part} className="mb-16">
            <h2 className="mb-8 border-b border-slate-200 pb-4 text-2xl font-bold text-slate-800">
              {part}
            </h2>
            <div className="grid gap-12">
              {groupedVisuals[part].map((visual) => (
                <div
                  key={visual.id}
                  id={visual.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{visual.title}</h3>
                      <div className="text-xs text-slate-500 font-mono mt-1">ID: {visual.id}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-400">
                      Slide {visual.slideNumber}
                    </div>
                  </div>

                  <div
                    className={`grid ${
                      viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                    } divide-y lg:divide-x lg:divide-y-0 divide-slate-100`}
                  >
                    {/* Modern View */}
                    {(viewMode === 'split' || viewMode === 'modern') && (
                      <div className="bg-slate-900 p-6 min-h-[400px] flex items-center justify-center">
                        <div className="w-full h-full aspect-video">
                          {/* We need to render the component directly or use PresentationVisual */}
                          {/* Since PresentationVisual expects 'id' and uses registry, let's use that */}
                          <PresentationVisual id={visual.id} mode="hd" />
                        </div>
                      </div>
                    )}

                    {/* ASCII View */}
                    {(viewMode === 'split' || viewMode === 'ascii') && (
                      <div className="bg-gray-900 p-6 min-h-[400px] overflow-auto flex items-center justify-center">
                        <pre className="font-mono text-xs sm:text-sm text-emerald-400 whitespace-pre leading-snug">
                          {visual.ascii.trim()}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
