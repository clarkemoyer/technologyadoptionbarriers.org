'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

export interface CrossTabRow {
  group: string
  n: number
  barrier_mean: number | null
  readiness_mean: number | null
  maturity_mean: number | null
}

interface CrossTabHeatmapProps {
  byRole?: CrossTabRow[]
  byOrgSize?: CrossTabRow[]
}

type ConstructKey = 'barrier_mean' | 'readiness_mean' | 'maturity_mean'

const CONSTRUCTS: { key: ConstructKey; label: string; abbr: string }[] = [
  { key: 'barrier_mean', label: 'Barriers', abbr: 'B' },
  { key: 'readiness_mean', label: 'Readiness', abbr: 'R' },
  { key: 'maturity_mean', label: 'Maturity', abbr: 'M' },
]

/** Color configuration per construct (hue, saturation). */
const CONSTRUCT_COLORS: Record<ConstructKey, { h: number; s: number }> = {
  barrier_mean: { h: 25, s: 80 }, // orange-red: higher = more barriers (more problematic)
  readiness_mean: { h: 142, s: 55 }, // green: higher = more ready (positive)
  maturity_mean: { h: 196, s: 65 }, // teal: higher = more mature (positive)
}

function getMinMax(rows: CrossTabRow[], key: ConstructKey): [number, number] {
  const values = rows.map((r) => r[key]).filter((v): v is number => v !== null)
  if (values.length === 0) return [1, 5]
  const min = Math.min(...values)
  const max = Math.max(...values)
  // Ensure range is non-trivial so colours are visible even with small spreads
  return [min, max > min ? max : min + 0.01]
}

function getCellStyle(
  value: number | null,
  key: ConstructKey,
  min: number,
  max: number
): CSSProperties {
  if (value === null) return {}
  const normalized = (value - min) / (max - min)
  const { h, s } = CONSTRUCT_COLORS[key]
  // Lightness goes from 96 % (low, pale) → 62 % (high, saturated)
  const l = Math.round(96 - normalized * 34)
  return { backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }
}

export default function CrossTabHeatmap({ byRole, byOrgSize }: CrossTabHeatmapProps) {
  const hasRole = (byRole?.length ?? 0) > 0
  const hasOrgSize = (byOrgSize?.length ?? 0) > 0
  const hasBoth = hasRole && hasOrgSize

  // Default to whichever split has data; prefer by_role if both exist
  const [view, setView] = useState<'by_role' | 'by_org_size'>(hasRole ? 'by_role' : 'by_org_size')

  const rows = (view === 'by_role' ? byRole : byOrgSize) ?? []
  const hasData = rows.length > 0

  const rowLabel = view === 'by_role' ? 'Role' : 'Org Size'

  // Compute per-construct min/max across the visible rows
  const ranges = Object.fromEntries(
    CONSTRUCTS.map(({ key }) => [key, getMinMax(rows, key)])
  ) as Record<ConstructKey, [number, number]>

  return (
    <div className="mt-3">
      {/* View toggle — only rendered when both splits exist */}
      {hasBoth && (
        <div
          className="flex gap-1 mb-3"
          role="group"
          aria-label="Select cross-tabulation breakdown"
        >
          {(
            [
              { value: 'by_role', label: 'By Role' },
              { value: 'by_org_size', label: 'By Org Size' },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setView(value)}
              aria-pressed={view === value}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                view === value
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {hasData ? (
        <>
          {/* ── Heatmap — visible on md+ ──────────────────────────── */}
          <div className="hidden md:block" aria-hidden="false">
            <div className="overflow-x-auto">
              <table
                className="text-xs border-collapse bg-white/70 rounded w-full"
                aria-label={`Cross-tabulation heatmap ${view === 'by_role' ? 'by role' : 'by organisation size'}`}
              >
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700 border-b border-gray-300">
                      {rowLabel}
                    </th>
                    <th className="py-2 px-2 text-right font-semibold text-gray-700 border-b border-gray-300">
                      n
                    </th>
                    {CONSTRUCTS.map(({ key, label }) => (
                      <th
                        key={key}
                        className="py-2 px-4 text-center font-semibold text-gray-700 border-b border-gray-300"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.group} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 px-3 font-medium text-gray-800 whitespace-nowrap">
                        {row.group}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-gray-600">{row.n}</td>
                      {CONSTRUCTS.map(({ key, label }) => {
                        const val = row[key]
                        const [min, max] = ranges[key]
                        return (
                          <td
                            key={key}
                            className="py-2 px-4 text-center font-mono font-medium"
                            style={getCellStyle(val, key, min, max)}
                            title={`${label}: ${val?.toFixed(2) ?? '—'} (n=${row.n})`}
                          >
                            {val?.toFixed(2) ?? '—'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Colour legend */}
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
              {CONSTRUCTS.map(({ key, label }) => {
                const { h, s } = CONSTRUCT_COLORS[key]
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-14 h-2.5 rounded"
                      style={{
                        background: `linear-gradient(to right, hsl(${h},${s}%,96%), hsl(${h},${s}%,62%))`,
                      }}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </div>
                )
              })}
              <span className="text-gray-400 italic">lighter ← lower · higher → darker</span>
            </div>
          </div>

          {/* ── Table fallback — visible on sm only ───────────────── */}
          <div className="md:hidden overflow-x-auto">
            <table
              className="w-full text-xs border-collapse bg-white/70 rounded"
              aria-label={`Cross-tabulation ${view === 'by_role' ? 'by role' : 'by organisation size'}`}
            >
              <caption className="sr-only">
                {`Mean scores by ${rowLabel.toLowerCase()}: Barriers (B), Readiness (R), Maturity (M)`}
              </caption>
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-1.5 px-2 text-left font-semibold">{rowLabel}</th>
                  <th className="py-1.5 px-2 text-right font-semibold">n</th>
                  {CONSTRUCTS.map(({ key, abbr, label }) => (
                    <th key={key} className="py-1.5 px-2 text-right font-semibold" title={label}>
                      {abbr}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.group} className="border-b border-gray-200">
                    <td className="py-1.5 px-2 font-medium">{row.group}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{row.n}</td>
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
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Cross-tabulation data will be populated by the next pipeline run.
        </p>
      )}
    </div>
  )
}
