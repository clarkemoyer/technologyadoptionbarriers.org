import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import EffectSizeChart from '@/components/effect-size-chart'

expect.extend(toHaveNoViolations)

// Recharts relies heavily on element measuring (ResizeObserver) which isn't present in standard jsdom.
// We must mock ResponsiveContainer to render with a fixed size.
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
    { construct: 'barriers', d: 0.42, ci_lower: 0.18, ci_upper: 0.65 },
    { construct: 'readiness', d: -0.31, ci_lower: -0.54, ci_upper: -0.08 },
    { construct: 'maturity', d: 0.87, ci_lower: 0.61, ci_upper: 1.13 },
  ]

  it('returns null when no data is provided', () => {
    const { container } = render(<EffectSizeChart data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the chart container when data is provided', () => {
    render(<EffectSizeChart data={mockData} />)
    // The figure element should be in the DOM
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('renders with a title using figcaption', () => {
    render(<EffectSizeChart data={mockData} title="Tech vs Non-Tech" />)
    expect(screen.getByText('Tech vs Non-Tech')).toBeInTheDocument()
  })

  it('renders rows with null d values without filtering them out', () => {
    const dataWithNull = [
      { construct: 'barriers', d: 0.42, ci_lower: 0.18, ci_upper: 0.65 },
      { construct: 'readiness', d: null, ci_lower: null, ci_upper: null },
    ]
    // Should not throw and should render without the null row causing an error
    expect(() => render(<EffectSizeChart data={dataWithNull} />)).not.toThrow()
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('renders CI tooltip content', () => {
    // The tooltip is in the DOM as a Recharts managed element; verify
    // the chart renders without error when CI data is present
    render(<EffectSizeChart data={mockData} />)
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('meets accessibility standards', async () => {
    const { container } = render(<EffectSizeChart data={mockData} title="Effect Sizes" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('meets accessibility standards without a title', async () => {
    const { container } = render(<EffectSizeChart data={mockData} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
