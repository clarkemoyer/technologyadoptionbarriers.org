import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import EffectSizeChart, { EffectSizeData } from '@/components/results/effect-size-chart'

expect.extend(toHaveNoViolations)

// Mock ResponsiveContainer and other Recharts parts that need DOM measuring
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  }
})

describe('EffectSizeChart', () => {
  const mockData: EffectSizeData[] = [
    { construct: 'barriers', d: -0.22, n1: 15, n2: 50 },
    { construct: 'readiness', d: 0.54, n1: 15, n2: 50 },
    { construct: 'maturity', d: 0.16, n1: 15, n2: 50 },
  ]

  it('renders the empty state when no data is provided', () => {
    render(<EffectSizeChart data={[]} title="Test Chart" />)
    expect(screen.getByText(/No effect size data available/i)).toBeInTheDocument()
  })

  it('renders the chart with correct title and legend', () => {
    render(<EffectSizeChart data={mockData} title="Tech vs Non-Tech" />)
    expect(screen.getByText('Tech vs Non-Tech')).toBeInTheDocument()
    expect(screen.getByText(/Negligible \(< 0\.2\)/)).toBeInTheDocument()
    expect(screen.getByText(/Small \(0\.2 - 0\.5\)/)).toBeInTheDocument()
    expect(screen.getByText(/Medium \(0\.5 - 0\.8\)/)).toBeInTheDocument()
    expect(screen.getByText(/Large \(> 0\.8\)/)).toBeInTheDocument()
  })

  it('meets accessibility standards', async () => {
    const { container } = render(<EffectSizeChart data={mockData} title="A11y Test" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
