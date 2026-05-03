/**
 * Unit tests for ReliabilityContent variant-specific branching.
 *
 * Verify live and CRP variants render the right headings, alpha tables,
 * sample counts, interpretation prose, related links, and back-link
 * targets. Their purpose is to catch drift between the two variants
 * that the shared-component refactor is meant to prevent.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  ReliabilityContent,
  type ReliabilityData,
} from '@/components/results/reliability/ReliabilityContent'

expect.extend(toHaveNoViolations)

jest.mock('@/components/last-updated', () => ({
  __esModule: true,
  default: ({ utcTimestamp }: { utcTimestamp?: string | null }) => (
    <p data-testid="last-updated">Last updated: {utcTimestamp ?? '-'}</p>
  ),
}))

jest.mock('@/components/glossary-term', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock('@/components/results/reliability/ExtendedReliabilitySections', () => ({
  ExtendedReliabilitySections: () => <div data-testid="extended-reliability-sections" />,
}))

jest.mock('@/lib/results/findPrimarySample', () => ({
  findPrimarySample: () => ({
    bootstrap_alpha_ci: {},
    alpha_if_deleted_summary: {},
    reliability_by_demo: {},
  }),
}))

const MOCK_DATA: ReliabilityData = {
  last_updated: '2026-04-04T09:00:00Z',
  samples: [
    { key: 'conservative_clean', label: 'Conservative Clean', n: 113 },
    { key: 'flexible_clean', label: 'Flexible Clean', n: 165 },
    { key: 'prolific_accepted', label: 'Prolific Accepted', n: 200 },
    { key: 'v2_finished', label: 'All V2 Finished', n: 332 },
    { key: 'v2_all', label: 'All V2', n: 390 },
  ],
  metrics: [
    {
      key: 'alpha_barriers',
      values: {
        conservative_clean: 0.91,
        flexible_clean: 0.92,
        prolific_accepted: 0.92,
        v2_finished: 0.93,
        v2_all: 0.93,
      },
    },
    {
      key: 'alpha_readiness',
      values: {
        conservative_clean: 0.93,
        flexible_clean: 0.93,
        prolific_accepted: 0.94,
        v2_finished: 0.95,
        v2_all: 0.95,
      },
    },
    {
      key: 'alpha_maturity',
      values: {
        conservative_clean: 0.85,
        flexible_clean: 0.86,
        prolific_accepted: 0.86,
        v2_finished: 0.87,
        v2_all: 0.87,
      },
    },
  ],
}

describe('ReliabilityContent — live variant', () => {
  beforeEach(() => {
    render(<ReliabilityContent variant="live" data={MOCK_DATA} validationData={{}} />)
  })

  it('renders "Scale Reliability" heading without CRP prefix', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /^Scale Reliability$/i })
    ).toBeInTheDocument()
  })

  it('renders LastUpdated component (not a static published badge)', () => {
    expect(screen.getByTestId('last-updated')).toBeInTheDocument()
    expect(screen.queryByText(/Published: April 2026/i)).not.toBeInTheDocument()
  })

  it('uses "five" for sample count in intro', () => {
    expect(screen.getAllByText(/five sample definitions/i).length).toBeGreaterThan(0)
  })

  it('renders all five samples in the alpha table', () => {
    expect(screen.getByText('Conservative Clean')).toBeInTheDocument()
    expect(screen.getByText('Flexible Clean')).toBeInTheDocument()
    expect(screen.getByText('Prolific Accepted')).toBeInTheDocument()
    expect(screen.getByText('All V2 Finished')).toBeInTheDocument()
    expect(screen.getByText('All V2')).toBeInTheDocument()
  })

  it('uses "the full dataset" in interpretation', () => {
    expect(screen.getByText(/the full dataset/i)).toBeInTheDocument()
    expect(screen.queryByText(/the full CRP dataset/i)).not.toBeInTheDocument()
  })

  it('renders Sensitivity Analysis link with five-sample description', () => {
    expect(screen.getByRole('link', { name: /^Sensitivity Analysis$/ })).toHaveAttribute(
      'href',
      '/results/sensitivity'
    )
  })

  it('does not render CRP 2026 Overview link', () => {
    expect(screen.queryByRole('link', { name: /CRP 2026 Overview/ })).not.toBeInTheDocument()
  })

  it('back link points to /results', () => {
    expect(screen.getByRole('link', { name: /Back to Results Overview/ })).toHaveAttribute(
      'href',
      '/results'
    )
  })
})

describe('ReliabilityContent — crp variant', () => {
  beforeEach(() => {
    render(<ReliabilityContent variant="crp" data={MOCK_DATA} validationData={{}} />)
  })

  it('renders "CRP 2026: Scale Reliability" heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /CRP 2026: Scale Reliability/i })
    ).toBeInTheDocument()
  })

  it('renders a static "Published" badge instead of LastUpdated', () => {
    expect(screen.getByText(/Published: April 2026/i)).toBeInTheDocument()
    expect(screen.queryByTestId('last-updated')).not.toBeInTheDocument()
  })

  it('uses "three" for sample count in intro', () => {
    expect(screen.getAllByText(/three sample definitions/i).length).toBeGreaterThan(0)
  })

  it('mentions the CRP frozen dataset in intro', () => {
    expect(screen.getByText(/across the CRP 2026 frozen dataset/i)).toBeInTheDocument()
  })

  it('shows only the three CRP samples in the alpha table (no v2_*)', () => {
    expect(screen.getByText('Conservative Clean')).toBeInTheDocument()
    expect(screen.getByText('Flexible Clean')).toBeInTheDocument()
    expect(screen.getByText('Prolific Accepted')).toBeInTheDocument()
    expect(screen.queryByText('All V2 Finished')).not.toBeInTheDocument()
    expect(screen.queryByText(/^All V2$/)).not.toBeInTheDocument()
  })

  it('uses "the full CRP dataset" in interpretation', () => {
    expect(screen.getByText(/the full CRP dataset/i)).toBeInTheDocument()
  })

  it('renders CRP 2026 Overview link instead of Sensitivity Analysis', () => {
    expect(screen.getByRole('link', { name: /CRP 2026 Overview/ })).toHaveAttribute(
      'href',
      '/results/crp-2026'
    )
    expect(screen.queryByRole('link', { name: /^Sensitivity Analysis$/ })).not.toBeInTheDocument()
  })

  it('back link points to /results', () => {
    expect(screen.getByRole('link', { name: /Back to Results Overview/ })).toHaveAttribute(
      'href',
      '/results'
    )
  })
})

describe('ReliabilityContent — accessibility', () => {
  it('live variant has no axe violations', async () => {
    const { container } = render(
      <ReliabilityContent variant="live" data={MOCK_DATA} validationData={{}} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('crp variant has no axe violations', async () => {
    const { container } = render(
      <ReliabilityContent variant="crp" data={MOCK_DATA} validationData={{}} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('column headers use scope="col"', () => {
    const { container } = render(
      <ReliabilityContent variant="live" data={MOCK_DATA} validationData={{}} />
    )
    expect(container.querySelectorAll('th[scope="col"]').length).toBeGreaterThan(0)
  })

  it('row labels use scope="row" (3 constructs)', () => {
    const { container } = render(
      <ReliabilityContent variant="live" data={MOCK_DATA} validationData={{}} />
    )
    expect(container.querySelectorAll('th[scope="row"]').length).toBe(3)
  })
})

describe('ReliabilityContent — empty / missing metrics', () => {
  it('renders dashes when metrics are missing', () => {
    const emptyMetricsData: ReliabilityData = { ...MOCK_DATA, metrics: [] }
    render(<ReliabilityContent variant="live" data={emptyMetricsData} validationData={{}} />)
    // 3 constructs × 5 samples = 15 cells of '-'
    const dashes = screen.getAllByText('-')
    expect(dashes.length).toBeGreaterThanOrEqual(15)
  })

  it('formats alpha values to 4 decimal places', () => {
    render(<ReliabilityContent variant="live" data={MOCK_DATA} validationData={{}} />)
    expect(screen.getAllByText('0.9100').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('0.9300').length).toBeGreaterThanOrEqual(1)
  })
})
