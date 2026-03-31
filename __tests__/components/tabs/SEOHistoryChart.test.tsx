import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import SEOHistoryChart from '@/components/tabs/seo-history-chart'

expect.extend(toHaveNoViolations)

// Recharts relies heavily on element measuring (ResizeObserver) which isn't present in standard jsdom.
// We must mock it or mock the chart to render properly in tests.
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  }
})

describe('SEOHistoryChart', () => {
  const mockData = [
    {
      date: '2026-03-23T12:52:28.828Z',
      sessions: 4250,
      impressions: 38500,
      clicks: 2180,
      averagePosition: 28.4,
    },
    {
      date: '2026-03-24T12:52:28.828Z',
      sessions: 4300,
      impressions: 40000,
      clicks: 2200,
      averagePosition: 28.0,
    },
  ]

  it('renders the empty state when no data is provided', () => {
    render(<SEOHistoryChart data={[]} />)
    expect(screen.getByText('Not enough historical data collected yet.')).toBeInTheDocument()
  })

  it('renders the chart container when data is provided', () => {
    render(<SEOHistoryChart data={mockData} />)
    expect(screen.getByText('Historical Organic Trend (Trailing Weeks)')).toBeInTheDocument()
  })

  it('meets accessibility standards', async () => {
    const { container } = render(<SEOHistoryChart data={mockData} />)
    // Pass the container directly to jest-axe
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
