import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import EffectSizeChart from '@/components/effect-size-chart'

expect.extend(toHaveNoViolations)

// The global jest.setup.js already mocks recharts ResponsiveContainer, so these
// tests work correctly in jsdom without additional per-file mocking.

const SAMPLE_DATA = [
  { construct: 'barriers', d: 0.85, ci_lower: 0.6, ci_upper: 1.1 },
  { construct: 'readiness', d: 0.42, ci_lower: 0.2, ci_upper: 0.65 },
  { construct: 'maturity', d: 0.1, ci_lower: -0.05, ci_upper: 0.25 },
  { construct: 'resources', d: -0.3, ci_lower: -0.55, ci_upper: -0.05 },
]

describe('EffectSizeChart', () => {
  it('returns null when no data is provided', () => {
    const { container } = render(<EffectSizeChart data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the chart container with role="img" when data is provided', () => {
    render(<EffectSizeChart data={SAMPLE_DATA} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders the aria-label on the chart container', () => {
    render(<EffectSizeChart data={SAMPLE_DATA} />)
    expect(screen.getByRole('img', { name: /effect size bar chart/i })).toBeInTheDocument()
  })

  it('includes the title in aria-label when provided', () => {
    render(<EffectSizeChart data={SAMPLE_DATA} title="Tech vs Non-Tech" />)
    expect(
      screen.getByRole('img', { name: /effect size bar chart: tech vs non-tech/i })
    ).toBeInTheDocument()
  })

  it('renders the title heading when title prop is provided', () => {
    render(<EffectSizeChart data={SAMPLE_DATA} title="Tech vs Non-Tech" />)
    expect(screen.getByText('Tech vs Non-Tech')).toBeInTheDocument()
  })

  it('renders with CI data without errors', () => {
    const withCI = [{ construct: 'barriers', d: 0.9, ci_lower: 0.6, ci_upper: 1.2 }]
    expect(() => render(<EffectSizeChart data={withCI} />)).not.toThrow()
  })

  it('renders without CI data without errors', () => {
    const withoutCI = [{ construct: 'barriers', d: 0.5 }]
    expect(() => render(<EffectSizeChart data={withoutCI} />)).not.toThrow()
  })

  it('meets accessibility standards', async () => {
    const { container } = render(<EffectSizeChart data={SAMPLE_DATA} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
