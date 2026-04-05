import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import EffectSizeChart from '@/components/results/effect-size-chart'

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

const mockData = [
  { construct: 'barriers', d: 0.15, n1: 50, n2: 60 },
  { construct: 'readiness', d: 0.35, n1: 50, n2: 60 },
  { construct: 'maturity', d: 0.65, n1: 50, n2: 60 },
]

describe('EffectSizeChart', () => {
  it('renders the chart title', () => {
    render(<EffectSizeChart title="Tech vs Non-Tech" data={mockData} />)
    expect(screen.getByText('Tech vs Non-Tech')).toBeInTheDocument()
  })

  it('renders all four legend items with correct threshold labels', () => {
    render(<EffectSizeChart title="Tech vs Non-Tech" data={mockData} />)
    expect(screen.getByText(/Negligible/)).toBeInTheDocument()
    expect(screen.getByText(/Small/)).toBeInTheDocument()
    expect(screen.getByText(/Medium/)).toBeInTheDocument()
    expect(screen.getByText(/Large/)).toBeInTheDocument()
  })

  it('renders with empty data without crashing', () => {
    render(<EffectSizeChart title="Empty Chart" data={[]} />)
    expect(screen.getByText('Empty Chart')).toBeInTheDocument()
  })

  it('meets accessibility standards', async () => {
    const { container } = render(<EffectSizeChart title="Tech vs Non-Tech" data={mockData} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
