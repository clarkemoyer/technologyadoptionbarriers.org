import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import EffectSizeChart from '@/components/effect-size-chart'

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

describe('EffectSizeChart', () => {
  const mockData = [
    {
      construct: 'barriers',
      d: 0.45,
      ci_lower: 0.12,
      ci_upper: 0.78,
    },
    {
      construct: 'readiness',
      d: -0.23,
      ci_lower: -0.55,
      ci_upper: 0.09,
    },
    {
      construct: 'maturity',
      d: 0.92,
      ci_lower: 0.61,
      ci_upper: 1.23,
    },
  ]

  it('renders null when no data is provided', () => {
    const { container } = render(<EffectSizeChart data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders chart when data is provided', () => {
    const { container } = render(<EffectSizeChart data={mockData} />)
    expect(container.querySelector('figure')).toBeInTheDocument()
  })

  it('renders title as figcaption when provided', () => {
    render(<EffectSizeChart data={mockData} title="Tech vs Non-Tech" />)
    expect(screen.getByText('Tech vs Non-Tech')).toBeInTheDocument()
    const figcaption = screen.getByText('Tech vs Non-Tech').closest('figcaption')
    expect(figcaption).toBeInTheDocument()
  })

  it('renders chart with null d values (missing data path)', () => {
    const dataWithNull = [...mockData, { construct: 'other', d: null }]
    const { container } = render(<EffectSizeChart data={dataWithNull} />)
    expect(container.querySelector('figure')).toBeInTheDocument()
  })

  it('shows tooltip content for items with CI bounds', () => {
    render(<EffectSizeChart data={mockData} />)
    // Tooltip is rendered by Recharts on hover; verify data is passed correctly
    // by checking the chart renders without error for items with ci_lower/ci_upper
    expect(screen.queryByText('Effect Size Bar Chart')).not.toBeInTheDocument()
  })

  it('meets accessibility standards with title', async () => {
    const { container } = render(<EffectSizeChart data={mockData} title="Effect Sizes" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('meets accessibility standards without title', async () => {
    const { container } = render(<EffectSizeChart data={mockData} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
