'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts'

export interface EffectSizeEntry {
  /** Y-axis label shown on the chart (e.g. "Barriers — Cons. Clean") */
  label: string
  /** Construct name (barriers | readiness | maturity) */
  construct: string
  /** Result group short key */
  groupKey: string
  /** Result group display name */
  groupLabel: string
  /** Cohen's d value (can be negative) */
  d: number | null
  /** CI lower bound — included for future use once PR #840 adds CI computation */
  dLow?: number | null
  /** CI upper bound — included for future use once PR #840 adds CI computation */
  dHigh?: number | null
}

interface EffectSizeChartProps {
  /** Section header shown above the chart (e.g. "Technical vs Non-Technical") */
  comparisonLabel: string
  /** Flat list of data entries (one entry per construct × group combination) */
  entries: EffectSizeEntry[]
  /** Accessible label for the chart image role */
  ariaLabel: string
}

const MAGNITUDE_COLORS = {
  negligible: '#94a3b8', // slate-400
  small: '#60a5fa', // blue-400
  medium: '#f59e0b', // amber-500
  large: '#ef4444', // red-400
} as const

export function getMagnitude(d: number | null): 'negligible' | 'small' | 'medium' | 'large' | null {
  if (d === null) return null
  const abs = Math.abs(d)
  if (abs < 0.2) return 'negligible'
  if (abs < 0.5) return 'small'
  if (abs < 0.8) return 'medium'
  return 'large'
}

function getColor(d: number | null): string {
  const mag = getMagnitude(d)
  if (!mag) return '#e5e7eb'
  return MAGNITUDE_COLORS[mag]
}

interface TooltipPayload {
  payload?: EffectSizeEntry
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0]?.payload
  if (!entry) return null
  const mag = getMagnitude(entry.d)
  const dStr =
    entry.d !== null && entry.d !== undefined ? (entry.d > 0 ? '+' : '') + entry.d.toFixed(2) : '—'
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-900 mb-1 capitalize">{entry.construct}</p>
      <p className="text-gray-500 text-xs mb-1">{entry.groupLabel}</p>
      <p className="text-gray-700">
        Cohen&apos;s&nbsp;d:{' '}
        <span className="font-mono font-semibold" style={{ color: getColor(entry.d) }}>
          {dStr}
        </span>
      </p>
      {mag && <p className="text-gray-500 italic text-xs capitalize mt-0.5">{mag}</p>}
    </div>
  )
}

export const EffectSizeChart: React.FC<EffectSizeChartProps> = ({
  comparisonLabel,
  entries,
  ariaLabel,
}) => {
  const validEntries = entries.filter((e) => e.d !== null)
  if (validEntries.length === 0) return null

  const dValues = validEntries.map((e) => e.d as number)
  const minD = Math.min(...dValues)
  const maxD = Math.max(...dValues)
  const pad = 0.15
  const domainMin = Math.min(-pad, minD - pad)
  const domainMax = Math.max(pad, maxD + pad)

  // Dynamically size the chart based on the number of entries.
  // barHeight (28px): provides adequate spacing per label and hover target.
  // marginTop (16px): padding above the first bar.
  // marginBottom (36px): space for the X-axis label ("Cohen's d") below the axis ticks.
  const barHeight = 28
  const marginTop = 16
  const marginBottom = 36
  const height = entries.length * barHeight + marginTop + marginBottom

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{comparisonLabel}</h4>

      <div role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={entries}
            layout="vertical"
            margin={{ top: marginTop, right: 48, left: 10, bottom: marginBottom }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />

            <XAxis
              type="number"
              domain={[domainMin, domainMax]}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              label={{
                value: "Cohen's d",
                position: 'insideBottom',
                offset: -20,
                fontSize: 11,
                fill: '#6B7280',
              }}
              tickFormatter={(v: number) => v.toFixed(1)}
            />

            <YAxis
              type="category"
              dataKey="label"
              width={148}
              tick={{ fontSize: 11, fill: '#374151' }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />

            {/* Zero reference line */}
            <ReferenceLine x={0} stroke="#374151" strokeWidth={1.5} />

            {/* Threshold lines for magnitude categories */}
            {[-0.8, -0.5, -0.2, 0.2, 0.5, 0.8].map((v) => (
              <ReferenceLine key={v} x={v} stroke="#D1D5DB" strokeDasharray="3 3" />
            ))}

            <Bar dataKey="d" maxBarSize={20} radius={[0, 3, 3, 0]} isAnimationActive={false}>
              {entries.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.d)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Screen-reader summary table */}
      <table className="sr-only" aria-label={`Data table: ${comparisonLabel}`}>
        <thead>
          <tr>
            <th scope="col">Construct</th>
            <th scope="col">Result Group</th>
            <th scope="col">Cohen&apos;s d</th>
            <th scope="col">Magnitude</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const mag = getMagnitude(e.d)
            const dStr =
              e.d !== null && e.d !== undefined ? (e.d > 0 ? '+' : '') + e.d.toFixed(2) : 'no data'
            return (
              <tr key={i}>
                <td className="capitalize">{e.construct}</td>
                <td>{e.groupLabel}</td>
                <td>{dStr}</td>
                <td>{mag ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Visible magnitude legend */}
      <div
        className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-xs text-gray-600"
        aria-hidden="true"
      >
        <span className="font-medium text-gray-700">Magnitude:</span>
        {(
          [
            { key: 'negligible', label: 'Negligible (|d|\u00a0<\u00a00.2)' },
            { key: 'small', label: 'Small (0.2\u20130.5)' },
            { key: 'medium', label: 'Medium (0.5\u20130.8)' },
            { key: 'large', label: 'Large (>\u00a00.8)' },
          ] as const
        ).map(({ key, label }) => (
          <span key={key} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: MAGNITUDE_COLORS[key] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default EffectSizeChart
