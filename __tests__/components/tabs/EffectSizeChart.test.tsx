import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EffectSizeChart, getMagnitude } from '@/components/tabs/effect-size-chart'
import type { EffectSizeEntry } from '@/components/tabs/effect-size-chart'

expect.extend(toHaveNoViolations)

// Recharts relies heavily on element measuring (ResizeObserver) which isn't present in standard jsdom.
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  }
})

const MOCK_ENTRIES: EffectSizeEntry[] = [
  {
    label: 'Barriers — Cons. Clean',
    construct: 'barriers',
    groupKey: 'conservative_clean',
    groupLabel: 'Conservative Clean',
    d: -0.2177,
  },
  {
    label: 'Barriers — Flex. Clean',
    construct: 'barriers',
    groupKey: 'flexible_clean',
    groupLabel: 'Flexible Clean',
    d: -0.18,
  },
  {
    label: 'Readiness — Cons. Clean',
    construct: 'readiness',
    groupKey: 'conservative_clean',
    groupLabel: 'Conservative Clean',
    d: 0.5395,
  },
  {
    label: 'Readiness — Flex. Clean',
    construct: 'readiness',
    groupKey: 'flexible_clean',
    groupLabel: 'Flexible Clean',
    d: 0.85,
  },
  {
    label: 'Maturity — Cons. Clean',
    construct: 'maturity',
    groupKey: 'conservative_clean',
    groupLabel: 'Conservative Clean',
    d: null,
  },
]

describe('EffectSizeChart', () => {
  it('renders nothing when all d values are null', () => {
    const nullEntries: EffectSizeEntry[] = [
      {
        label: 'Barriers — Cons. Clean',
        construct: 'barriers',
        groupKey: 'conservative_clean',
        groupLabel: 'Conservative Clean',
        d: null,
      },
    ]
    const { container } = render(
      <EffectSizeChart
        comparisonLabel="Tech vs Non-Tech"
        entries={nullEntries}
        ariaLabel="Effect size chart"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the comparison label heading', () => {
    render(
      <EffectSizeChart
        comparisonLabel="Technical vs Non-Technical"
        entries={MOCK_ENTRIES}
        ariaLabel="Effect size chart for tech vs non-tech"
      />
    )
    expect(screen.getByText('Technical vs Non-Technical')).toBeInTheDocument()
  })

  it('renders the accessible role="img" container', () => {
    render(
      <EffectSizeChart
        comparisonLabel="Tech vs Non-Tech"
        entries={MOCK_ENTRIES}
        ariaLabel="Effect size chart with 5 bars"
      />
    )
    expect(screen.getByRole('img', { name: 'Effect size chart with 5 bars' })).toBeInTheDocument()
  })

  it('renders a hidden data table with all entries for screen readers', () => {
    render(
      <EffectSizeChart
        comparisonLabel="Tech vs Non-Tech"
        entries={MOCK_ENTRIES}
        ariaLabel="Effect size chart"
      />
    )
    // The sr-only table should exist with the correct accessible name
    const table = screen.getByRole('table', { name: 'Data table: Tech vs Non-Tech' })
    expect(table).toBeInTheDocument()

    // Verify construct names appear in the table
    const cells = table.querySelectorAll('td')
    const cellTexts = Array.from(cells).map((c) => c.textContent)
    expect(cellTexts.some((t) => t?.toLowerCase().includes('barriers'))).toBe(true)
    expect(cellTexts.some((t) => t?.toLowerCase().includes('readiness'))).toBe(true)
    // Check that a d-value is formatted correctly (positive prefix)
    expect(cellTexts.some((t) => t === '+0.54' || t === '+0.85')).toBe(true)
    // Check that a negative d-value appears
    expect(cellTexts.some((t) => t?.startsWith('-'))).toBe(true)
    // Check that magnitude labels are present
    expect(cellTexts.some((t) => t === 'small' || t === 'medium' || t === 'negligible')).toBe(true)
  })

  it('renders the magnitude legend', () => {
    render(
      <EffectSizeChart
        comparisonLabel="Tech vs Non-Tech"
        entries={MOCK_ENTRIES}
        ariaLabel="Effect size chart"
      />
    )
    expect(screen.getByText('Magnitude:')).toBeInTheDocument()
    // Four magnitude labels
    expect(screen.getByText(/Negligible/)).toBeInTheDocument()
    expect(screen.getByText(/Small/)).toBeInTheDocument()
    expect(screen.getByText(/Medium/)).toBeInTheDocument()
    expect(screen.getByText(/Large/)).toBeInTheDocument()
  })

  it('meets accessibility standards', async () => {
    const { container } = render(
      <EffectSizeChart
        comparisonLabel="Tech vs Non-Tech"
        entries={MOCK_ENTRIES}
        ariaLabel="Horizontal bar chart showing Cohen's d values for tech vs non-tech comparison"
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('getMagnitude helper', () => {
  it('returns null for null input', () => {
    expect(getMagnitude(null)).toBeNull()
  })

  it('classifies |d| < 0.2 as negligible', () => {
    expect(getMagnitude(0.1)).toBe('negligible')
    expect(getMagnitude(-0.1)).toBe('negligible')
    expect(getMagnitude(0)).toBe('negligible')
  })

  it('classifies 0.2 ≤ |d| < 0.5 as small', () => {
    expect(getMagnitude(0.2)).toBe('small')
    expect(getMagnitude(0.4)).toBe('small')
    expect(getMagnitude(-0.35)).toBe('small')
  })

  it('classifies 0.5 ≤ |d| < 0.8 as medium', () => {
    expect(getMagnitude(0.5)).toBe('medium')
    expect(getMagnitude(0.7)).toBe('medium')
    expect(getMagnitude(-0.65)).toBe('medium')
  })

  it('classifies |d| ≥ 0.8 as large', () => {
    expect(getMagnitude(0.8)).toBe('large')
    expect(getMagnitude(1.2)).toBe('large')
    expect(getMagnitude(-0.9)).toBe('large')
  })
})
