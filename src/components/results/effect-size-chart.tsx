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
  d: number
  n1: number
  n2: number
}

interface EffectSizeChartProps {
  data: EffectSizeData[]
  title: string
}

const getEffectSizeColor = (d: number) => {
  const absD = Math.abs(d)
  if (absD < 0.2) return '#94a3b8' // Slate 400 (Small)
  if (absD < 0.8) return '#3b82f6' // Blue 500 (Medium)
  return '#f59e0b' // Amber 500 (Large)
}

const getEffectSizeLabel = (d: number) => {
  const absD = Math.abs(d)
  if (absD < 0.2) return 'Small'
  if (absD < 0.8) return 'Medium'
  return 'Large'
}

const EffectSizeChart: React.FC<EffectSizeChartProps> = ({ data, title }) => {
  const chartData = data.map((item) => {
    const se = Math.sqrt(
      (item.n1 + item.n2) / (item.n1 * item.n2) + (item.d * item.d) / (2 * (item.n1 + item.n2))
    )
    const margin = 1.96 * se
    return {
      ...item,
      error: [margin, margin], // [lower, upper] relative to d
      color: getEffectSizeColor(item.d),
      sizeLabel: getEffectSizeLabel(item.d),
    }
  })

  // Determine domain based on data to keep it centered but responsive
  const maxD = Math.max(...chartData.map((d) => Math.abs(d.d) + d.error[0]))
  const domainLimit = Math.max(1.0, Math.ceil(maxD * 2) / 2)

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 shadow-sm">
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">{title}</h3>
      <div className="h-[250px] w-full" role="img" aria-label={`Effect size chart for ${title}`}>
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
                        95% CI: [{(d.d - d.error[0]).toFixed(2)}, {(d.d + d.error[1]).toFixed(2)}]
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />
            <Bar dataKey="d" barSize={20} radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <ErrorBar
                dataKey="error"
                width={4}
                strokeWidth={1.5}
                stroke="#475569"
                direction="x"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 justify-center text-[10px] sm:text-xs text-gray-500 border-t border-gray-50 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-400" />
          <span>Small (&lt; 0.2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span>Medium (0.2 - 0.8)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          <span>Large (&gt; 0.8)</span>
        </div>
      </div>
    </div>
  )
}

export default EffectSizeChart
