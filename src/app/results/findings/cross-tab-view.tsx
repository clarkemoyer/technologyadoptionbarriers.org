'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, Table as TableIcon } from 'lucide-react'

export interface CrossTabRow {
  group: string
  n: number
  barrier_mean: number | null
  readiness_mean: number | null
  maturity_mean: number | null
}

interface CrossTabViewProps {
  data: CrossTabRow[]
  label: string
}

const getBarrierColor = (val: number | null) => {
  if (val === null) return 'bg-gray-100 text-gray-400'
  // Barriers range from 1-5, but observed means are 2.5 - 3.2
  if (val < 2.6) return 'bg-amber-50 text-amber-900'
  if (val < 2.7) return 'bg-amber-100 text-amber-900'
  if (val < 2.8) return 'bg-amber-200 text-amber-900'
  if (val < 2.9) return 'bg-amber-300 text-amber-900'
  if (val < 3.0) return 'bg-amber-400 text-amber-900'
  if (val < 3.1) return 'bg-amber-500 text-white'
  if (val < 3.2) return 'bg-amber-600 text-white'
  return 'bg-amber-700 text-white'
}

const getReadinessColor = (val: number | null) => {
  if (val === null) return 'bg-gray-100 text-gray-400'
  if (val < 2.9) return 'bg-blue-50 text-blue-900'
  if (val < 3.1) return 'bg-blue-100 text-blue-900'
  if (val < 3.3) return 'bg-blue-200 text-blue-900'
  return 'bg-blue-300 text-blue-900'
}

const getMaturityColor = (val: number | null) => {
  if (val === null) return 'bg-gray-100 text-gray-400'
  if (val < 2.9) return 'bg-emerald-50 text-emerald-900'
  if (val < 3.1) return 'bg-emerald-100 text-emerald-900'
  if (val < 3.3) return 'bg-emerald-200 text-emerald-900'
  return 'bg-emerald-300 text-emerald-900'
}

export default function CrossTabView({ data, label }: CrossTabViewProps) {
  const [view, setView] = useState<'heatmap' | 'table'>('heatmap')

  // Set default view based on screen size on mount
  useEffect(() => {
    const handleInitialView = () => {
      if (window.innerWidth < 768) {
        setView('table')
      }
    }
    // Using requestAnimationFrame to avoid the synchronous setState warning
    // and ensure it happens after the initial paint.
    requestAnimationFrame(handleInitialView)
  }, [])

  return (
    <div
      className="flex flex-col gap-3"
      data-testid={`cross-tab-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-600 uppercase">{label}</h4>
        <div className="flex bg-gray-200/50 p-1 rounded-md">
          <button
            type="button"
            onClick={() => setView('heatmap')}
            className={`p-1.5 rounded transition-colors ${
              view === 'heatmap'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Heatmap View"
            aria-label="Switch to Heatmap View"
            aria-pressed={view === 'heatmap'}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            className={`p-1.5 rounded transition-colors ${
              view === 'table'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Table View"
            aria-label="Switch to Table View"
            aria-pressed={view === 'table'}
          >
            <TableIcon size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'heatmap' ? (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="overflow-x-auto"
          >
            <div className="min-w-[300px]" role="table" aria-label={`${label} Heatmap`}>
              <div
                className="grid grid-cols-[1fr_repeat(4,minmax(50px,80px))] gap-1 border-b border-gray-200 pb-1 mb-1"
                role="row"
              >
                <div role="columnheader" className="text-[10px] font-bold text-gray-400 uppercase">
                  Group
                </div>
                <div
                  role="columnheader"
                  className="text-[10px] font-bold text-gray-400 uppercase text-center"
                >
                  n
                </div>
                <div
                  role="columnheader"
                  className="text-[10px] font-bold text-gray-400 uppercase text-center"
                >
                  Barrier
                </div>
                <div
                  role="columnheader"
                  className="text-[10px] font-bold text-gray-400 uppercase text-center"
                >
                  Ready
                </div>
                <div
                  role="columnheader"
                  className="text-[10px] font-bold text-gray-400 uppercase text-center"
                >
                  Mature
                </div>
              </div>
              <div className="space-y-1" role="rowgroup">
                {data.map((row) => (
                  <div
                    key={row.group}
                    className="grid grid-cols-[1fr_repeat(4,minmax(50px,80px))] gap-1 items-center"
                    role="row"
                  >
                    <div
                      role="cell"
                      className="text-xs font-medium text-gray-700 truncate pr-2"
                      title={row.group}
                    >
                      {row.group}
                    </div>
                    <div role="cell" className="text-[11px] font-mono text-gray-500 text-center">
                      {row.n}
                    </div>
                    <div
                      role="cell"
                      className={`text-[11px] font-mono font-bold text-center py-2 rounded-sm ${getBarrierColor(
                        row.barrier_mean
                      )}`}
                    >
                      {row.barrier_mean?.toFixed(2) ?? '—'}
                    </div>
                    <div
                      role="cell"
                      className={`text-[11px] font-mono text-center py-2 rounded-sm ${getReadinessColor(
                        row.readiness_mean
                      )}`}
                    >
                      {row.readiness_mean?.toFixed(2) ?? '—'}
                    </div>
                    <div
                      role="cell"
                      className={`text-[11px] font-mono text-center py-2 rounded-sm ${getMaturityColor(
                        row.maturity_mean
                      )}`}
                    >
                      {row.maturity_mean?.toFixed(2) ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400 uppercase font-bold">Barrier:</span>
                  <div className="flex gap-0.5">
                    <div
                      className="w-3 h-3 bg-amber-50 border border-gray-200 rounded-sm"
                      title="Low Barrier"
                    ></div>
                    <div className="w-3 h-3 bg-amber-300 border border-gray-200 rounded-sm"></div>
                    <div
                      className="w-3 h-3 bg-amber-700 border border-gray-200 rounded-sm"
                      title="High Barrier"
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400 uppercase font-bold">Ready:</span>
                  <div className="flex gap-0.5">
                    <div
                      className="w-3 h-3 bg-blue-50 border border-gray-200 rounded-sm"
                      title="Lower Readiness"
                    ></div>
                    <div
                      className="w-3 h-3 bg-blue-300 border border-gray-200 rounded-sm"
                      title="Higher Readiness"
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400 uppercase font-bold">Mature:</span>
                  <div className="flex gap-0.5">
                    <div
                      className="w-3 h-3 bg-emerald-50 border border-gray-200 rounded-sm"
                      title="Lower Maturity"
                    ></div>
                    <div
                      className="w-3 h-3 bg-emerald-300 border border-gray-200 rounded-sm"
                      title="Higher Maturity"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-xs border-collapse bg-white/70 rounded">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-1.5 px-2 text-left font-semibold">Group</th>
                  <th className="py-1.5 px-2 text-right font-semibold">n</th>
                  <th className="py-1.5 px-2 text-right font-semibold">B</th>
                  <th className="py-1.5 px-2 text-right font-semibold">R</th>
                  <th className="py-1.5 px-2 text-right font-semibold">M</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.group} className="border-b border-gray-200">
                    <td className="py-1.5 px-2 font-medium">{row.group}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-gray-500">{row.n}</td>
                    <td className="py-1.5 px-2 text-right font-mono">
                      {row.barrier_mean?.toFixed(2) ?? '—'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono">
                      {row.readiness_mean?.toFixed(2) ?? '—'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono">
                      {row.maturity_mean?.toFixed(2) ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
