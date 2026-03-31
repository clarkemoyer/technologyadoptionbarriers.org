'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export interface TimeSeriesData {
  date: string
  sessions: number
  impressions: number
  clicks: number
  averagePosition: number
}

interface SEOHistoryChartProps {
  data: TimeSeriesData[]
}

const SEOHistoryChart: React.FC<SEOHistoryChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex items-center justify-center">
        <p className="text-gray-500 font-medium">Not enough historical data collected yet.</p>
      </div>
    )
  }

  const chartData = data.map((d) => {
    const dObj = new Date(d.date)
    return {
      name: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      impressions: d.impressions,
      clicks: d.clicks,
    }
  })

  return (
    <div className="w-full h-[400px] mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Historical Organic Trend (Trailing Weeks)
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            dy={10}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            dx={10}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="impressions"
            stroke="#0d9488"
            activeDot={{ r: 8 }}
            strokeWidth={3}
            name="Impressions (Left)"
            dot={{ r: 4, strokeWidth: 2 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="clicks"
            stroke="#f59e0b"
            strokeWidth={3}
            name="Clicks (Right)"
            dot={{ r: 4, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SEOHistoryChart
