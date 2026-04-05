'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ErrorBar,
} from 'recharts'

export interface EffectSizeData {
  construct: string
  d: number | null
  n1: number
  n2: number
}

interface EffectSizeChartProps {
  data: EffectSizeData[]
  title: string
}

export const EFFECT_SIZE_THRESHOLDS = {
  negligible: 0.2,
  small: 0.5,
  medium: 0.8,
} as const

export type EffectSizeMagnitude = 'missing' | 'negligible' | 'small' | 'medium' | 'large'

export const getEffectSizeMagnitude = (d: number | null | undefined): EffectSizeMagnitude => {
  if (d === null || d === undefined) return 'missing'
  const abs = Math.abs(d)
  if (abs < EFFECT_SIZE_THRESHOLDS.negligible) return 'negligible'
  if (abs < EFFECT_SIZE_THRESHOLDS.small) return 'small'
  if (abs < EFFECT_SIZE_THRESHOLDS.medium) return 'medium'
  return 'large'
}

export const getMagnitudeColor = (d: number | null | undefined): string => {
  switch (getEffectSizeMagnitude(d)) {
    case 'missing':
      return '#e5e7eb' // Gray 200
    case 'negligible':
      return '#94a3b8' // Slate 400
    case 'small':
      return '#60a5fa' // Blue 400
    case 'medium':
      return '#3b82f6' // Blue 500
    case 'large':
      return '#4f46e5' // Indigo 600
  }
}

const EffectSizeChart: React.FC<EffectSizeChartProps> = ({ data, title }) => {
  const chartData = data.map((item) => {
    const hasValue = item.d !== null && item.d !== undefined
    const d = item.d ?? 0
    let margin = 0

    if (hasValue) {
      const se = Math.sqrt(
        (item.n1 + item.n2) / (item.n1 * item.n2) + (d * d) / (2 * (item.n1 + item.n2))
      )
      margin = 1.96 * se
    }

    return {
      ...item,
      d,
      hasValue,
      error: [margin, margin], // [lower, upper] relative to d
      color: getMagnitudeColor(item.d),
      sizeLabel: getEffectSizeMagnitude(item.d),
    }
  })

  if (chartData.length === 0) {
    return (
      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500 italic">
        No effect size data available for this comparison.
      </div>
    )
  }

  const maxD = Math.max(...chartData.map((d) => (d.hasValue ? Math.abs(d.d) + d.error[0] : 0.5)))
  const domainLimit = Math.max(1.0, Math.ceil(maxD * 2) / 2)

  return (
    <figure className="w-full bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 shadow-sm">
      <figcaption className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">
        {title}
      </figcaption>
      <div
        className="h-[250px] w-full"
        role="img"
        aria-label={`Horizontal bar chart showing Cohen's d effect sizes for ${title}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              type="number"
              domain={[-domainLimit, domainLimit]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(val) => (val > 0 ? `+${val}` : val)}
            />
            <YAxis
              dataKey="construct"
              type="category"
              tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }}
              width={90}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload
                  return (
                    <div className="bg-white border border-gray-200 p-2 shadow-lg rounded-md text-xs">
                      <p className="font-bold text-gray-900 capitalize mb-1">{d.construct}</p>
                      {d.hasValue ? (
                        <>
                          <p className="text-gray-700">
                            Cohen&rsquo;s d:{' '}
                            <span className="font-mono font-bold">
                              {d.d > 0 ? '+' : ''}
                              {d.d.toFixed(3)}
                            </span>
                          </p>
                          <p className="text-gray-700">
                            Magnitude:{' '}
                            <span className="font-semibold" style={{ color: d.color }}>
                              {d.sizeLabel}
                            </span>
                          </p>
                          <p className="text-gray-500 mt-1">
                            95% CI: [{(d.d - d.error[0]).toFixed(2)},{' '}
                            {(d.d + d.error[1]).toFixed(2)}]
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500 italic">Data not available</p>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />
            <Bar dataKey="d" barSize={20}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  radius={entry.d < 0 ? ([4, 0, 0, 4] as any) : ([0, 4, 4, 0] as any)}
                />
              ))}
              {chartData.some((d) => d.hasValue) && (
                <ErrorBar
                  dataKey="error"
                  width={4}
                  strokeWidth={1.5}
                  stroke="#475569"
                  direction="x"
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] sm:text-xs text-gray-500 border-t border-gray-50 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-400" />
          <span>Negligible (&lt; 0.2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#60a5fa' }} />
          <span>Small (0.2 - 0.5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span>Medium (0.5 - 0.8)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-indigo-600" />
          <span>Large (&gt; 0.8)</span>
        </div>
      </div>
    </figure>
  )
}

export default EffectSizeChart
