'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ErrorBar,
  ReferenceLine,
} from 'recharts'

export interface EffectSizeData {
  construct: string
  d: number | null
  ci_lower?: number | null
  ci_upper?: number | null
  error?: [number, number]
  fill?: string
}

interface EffectSizeChartProps {
  data: EffectSizeData[]
  title?: string
}

const getMagnitudeColor = (d: number | null | undefined): string => {
  if (d === null || d === undefined) return '#e5e7eb' // Gray 200 for missing
  const abs = Math.abs(d)
  if (abs < 0.2) return '#94a3b8' // Slate 400 (Negligible/Small)
  if (abs < 0.8) return '#3b82f6' // Blue 500 (Medium)
  return '#4f46e5' // Indigo 600 (Large)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const dVal = data.d !== null && data.d !== undefined ? data.d.toFixed(3) : '—'
    const ci =
      data.ci_lower != null && data.ci_upper != null
        ? `[${data.ci_lower.toFixed(3)}, ${data.ci_upper.toFixed(3)}]`
        : ''

    return (
      <div className="bg-white border border-gray-200 p-3 rounded shadow-md text-sm">
        <p className="font-bold text-gray-700 capitalize mb-1">{label}</p>
        <p className="text-gray-600">
          <span className="font-semibold">Cohen&apos;s d:</span> {dVal}
        </p>
        {ci && (
          <p className="text-gray-500 text-xs mt-1">
            <span className="font-semibold">95% CI:</span> {ci}
          </p>
        )}
      </div>
    )
  }

  return null
}

const CustomLegend = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600 mt-4">
      <div className="flex items-center gap-1.5">
        <span className="block w-3 h-3 rounded-sm bg-[#94a3b8]" aria-hidden="true" />
        <span>Negligible/Small (|d| &lt; 0.2)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="block w-3 h-3 rounded-sm bg-[#3b82f6]" aria-hidden="true" />
        <span>Medium (0.2 &ndash; 0.8)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="block w-3 h-3 rounded-sm bg-[#4f46e5]" aria-hidden="true" />
        <span>Large (|d| &gt; 0.8)</span>
      </div>
    </div>
  )
}

const EffectSizeChart: React.FC<EffectSizeChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) return null

  // Pre-process data for colors and error bars.
  // Keep rows with missing effect sizes so the chart can render them
  // using the existing missing-data color path.
  const chartData = data.map((item) => {
    let error: [number, number] | undefined = undefined
    if (
      item.d !== null &&
      item.d !== undefined &&
      item.ci_lower !== undefined &&
      item.ci_lower !== null &&
      item.ci_upper !== undefined &&
      item.ci_upper !== null
    ) {
      // ErrorBar expects relative values: [lower_offset, upper_offset]
      // Example: value is 0.5, CI is [0.2, 0.9] -> offsets are [0.5 - 0.2, 0.9 - 0.5] = [0.3, 0.4]
      error = [Math.max(0, item.d - item.ci_lower), Math.max(0, item.ci_upper - item.d)]
    }

    // Round the outer end of each bar: left side for negative d, right side for positive d
    const radius: [number, number, number, number] =
      item.d !== null && item.d !== undefined && item.d < 0 ? [4, 0, 0, 4] : [0, 4, 4, 0]

    return {
      ...item,
      fill: getMagnitudeColor(item.d),
      error,
      radius,
    }
  })

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic my-2">No effect size data available to display.</p>
    )
  }

  // Find domain bounds including CI whiskers, only for non-null d values
  let min = 0
  let max = 0
  chartData.forEach((item) => {
    if (item.d === null || item.d === undefined) return
    const lower = item.ci_lower ?? item.d
    const upper = item.ci_upper ?? item.d
    if (lower < min) min = lower
    if (upper > max) max = upper
  })

  // Pad the domain slightly
  min = Math.floor(min * 10) / 10 - 0.1
  max = Math.ceil(max * 10) / 10 + 0.1

  // Ensure enough space around zero for readability
  if (min > -0.2) min = -0.2
  if (max < 0.2) max = 0.2

  const titleId = title ? 'effect-size-chart-title' : undefined

  return (
    <figure className="w-full mb-8" aria-labelledby={titleId}>
      {title && (
        <figcaption id={titleId} className="text-sm font-semibold text-gray-700 mb-4 text-center">
          {title}
        </figcaption>
      )}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            aria-label={`Effect Size Bar Chart${title ? `: ${title}` : ''}`}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis
              type="number"
              domain={[min, max]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <YAxis
              type="category"
              dataKey="construct"
              tick={{ fontSize: 12, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={false}
              width={80}
              tickFormatter={(value) => {
                if (typeof value === 'string') {
                  return value.charAt(0).toUpperCase() + value.slice(1)
                }
                return value
              }}
            />
            <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#4b5563" strokeWidth={2} />
            <Legend content={<CustomLegend />} />
            <Bar dataKey="d" barSize={32}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  // Recharts Cell accepts radius arrays at runtime; TS types are narrower than actual API
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  radius={entry.radius as unknown as any}
                />
              ))}
              <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="#374151" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}

export default EffectSizeChart
