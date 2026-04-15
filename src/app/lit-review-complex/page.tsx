'use client'

import React from 'react'
import SvgOverlay from '@/components/lit-review-complex/SvgOverlay'
import NodeCard from '@/components/lit-review-complex/NodeCard'
import { columns, nodes } from '@/components/lit-review-complex/data'

export default function LitReviewComplexPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 flex flex-col font-sans relative overflow-x-auto">
      {/* Header */}
      <header className="mb-8 z-20">
        <h1 className="text-2xl font-bold text-white mb-2">Literature Review Workflow Mapping</h1>
        <p className="text-slate-400 max-w-2xl text-sm">
          A visual representation of how sources and authors map to key concepts, and eventually
          translate into paper drafts and final outputs.
        </p>
      </header>

      {/* Main Workspace */}
      <div className="relative flex-1 flex flex-row gap-8 min-w-max">
        {/* SVG Overlay that draws the connecting curves */}
        <SvgOverlay />

        {/* Columns Grid */}
        {columns.map((col) => {
          // Filter nodes for this column based on type
          const columnNodes = nodes.filter((n) => n.type === col.type)

          return (
            <div key={col.id} className="flex flex-col w-64 z-10">
              {/* Column Header */}
              <div className="mb-6 pb-2 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  {col.title}
                </h2>
                <div className="text-xs text-slate-500 mt-1">{columnNodes.length} items</div>
              </div>

              {/* Column Items */}
              <div className="flex flex-col gap-4">
                {columnNodes.map((node) => (
                  <NodeCard key={node.id} node={node} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
