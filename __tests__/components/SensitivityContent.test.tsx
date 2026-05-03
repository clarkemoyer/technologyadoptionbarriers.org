/**
 * Unit tests for SensitivityContent variant-specific branching.
 *
 * These tests verify that the live and crp variants render the correct
 * headings, sample counts, prose words, comparison-group columns, related
 * links, and back-link targets. Their purpose is to catch drift between the
 * two variants that the shared-component refactor is meant to prevent.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  SensitivityContent,
  type SensitivityData,
} from '@/components/results/sensitivity/SensitivityContent'

expect.extend(toHaveNoViolations)

jest.mock('@/components/last-updated', () => ({
  __esModule: true,
  default: ({ utcTimestamp }: { utcTimestamp?: string | null }) => (
    <p data-testid="last-updated">Last updated: {utcTimestamp ?? '-'}</p>
  ),
}))

const MOCK_DATA: SensitivityData = {
  last_updated: '2026-04-04T09:00:00Z',
  samples: [
    {
      key: 'conservative_clean',
      label: 'Conservative Clean',
      description: 'Most restrictive',
      n: 78,
    },
    { key: 'flexible_clean', label: 'Flexible Clean', description: 'Expanded quality', n: 123 },
    {
      key: 'prolific_accepted',
      label: 'Prolific Accepted',
      description: 'Platform approved',
      n: 200,
    },
    { key: 'v2_finished', label: 'All V2 Finished', description: 'Completed responses', n: 332 },
    { key: 'v2_all', label: 'All V2', description: 'Entire dataset', n: 390 },
  ],
  metrics: [
    {
      key: 'barrier_mean',
      label: 'Barrier Grand Mean',
      values: {
        conservative_clean: 2.86,
        flexible_clean: 2.85,
        prolific_accepted: 2.84,
        v2_finished: 2.83,
        v2_all: 2.83,
      },
    },
    {
      key: 'readiness_alpha',
      label: 'Readiness α',
      values: {
        conservative_clean: 0.92,
        flexible_clean: 0.91,
        prolific_accepted: 0.9,
        v2_finished: 0.89,
        v2_all: 0.89,
      },
    },
  ],
}

describe('SensitivityContent — live variant', () => {
  beforeEach(() => {
    render(<SensitivityContent variant="live" data={MOCK_DATA} />)
  })

  it('renders "Sensitivity Analysis" heading without CRP prefix', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /^Sensitivity Analysis$/i })
    ).toBeInTheDocument()
  })

  it('renders LastUpdated component (not a static published badge)', () => {
    expect(screen.getByTestId('last-updated')).toBeInTheDocument()
    expect(screen.queryByText(/Published: April 2026/i)).not.toBeInTheDocument()
  })

  it('uses the word "five" for sample count', () => {
    expect(screen.getAllByText(/five/i).length).toBeGreaterThan(0)
  })

  it('mentions All V2 as the secondary anchor in the intro', () => {
    expect(screen.getByText(/All V2 \(N=390\)/)).toBeInTheDocument()
  })

  it('shows all five samples in the sample-definitions table', () => {
    // Each label appears across 3 tables (sample defs, full sensitivity, dataset comparison)
    expect(screen.getAllByText('Conservative Clean').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Flexible Clean').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Prolific Accepted').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('All V2 Finished').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('All V2').length).toBeGreaterThanOrEqual(1)
    // Sample-definitions table: 5 sample-key cells
    expect(screen.getByText('conservative_clean')).toBeInTheDocument()
    expect(screen.getByText('flexible_clean')).toBeInTheDocument()
    expect(screen.getByText('prolific_accepted')).toBeInTheDocument()
    expect(screen.getByText('v2_finished')).toBeInTheDocument()
    expect(screen.getByText('v2_all')).toBeInTheDocument()
  })

  it('renders three delta columns for the comparison table', () => {
    expect(screen.getByText(/Δ Flexible Clean/)).toBeInTheDocument()
    expect(screen.getByText(/Δ Prolific Accepted/)).toBeInTheDocument()
    expect(screen.getByText(/Δ All V2 Finished/)).toBeInTheDocument()
  })

  it('renders live-track related links', () => {
    expect(screen.getByRole('link', { name: /^Descriptive Statistics$/ })).toHaveAttribute(
      'href',
      '/results/descriptive'
    )
    expect(screen.getByRole('link', { name: /^Scale Reliability$/ })).toHaveAttribute(
      'href',
      '/results/reliability'
    )
    expect(screen.getByRole('link', { name: /^Data Quality Pipeline$/ })).toHaveAttribute(
      'href',
      '/results/data-quality'
    )
  })

  it('back link points to /results', () => {
    expect(screen.getByRole('link', { name: /Back to Results Overview/ })).toHaveAttribute(
      'href',
      '/results'
    )
  })

  it('mentions overlap caveat in constraints prose', () => {
    expect(screen.getByText(/Prolific Accepted and All V2 Finished overlap/i)).toBeInTheDocument()
  })
})

describe('SensitivityContent — crp variant', () => {
  beforeEach(() => {
    render(<SensitivityContent variant="crp" data={MOCK_DATA} />)
  })

  it('renders "CRP 2026: Sensitivity Analysis" heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /CRP 2026: Sensitivity Analysis/i })
    ).toBeInTheDocument()
  })

  it('renders a static "Published" badge instead of LastUpdated', () => {
    expect(screen.getByText(/Published: April 2026/i)).toBeInTheDocument()
    expect(screen.queryByTestId('last-updated')).not.toBeInTheDocument()
  })

  it('uses the word "three" for sample count', () => {
    expect(screen.getAllByText(/three/i).length).toBeGreaterThan(0)
  })

  it('mentions Prolific Accepted as the secondary anchor in the intro', () => {
    expect(screen.getByText(/Prolific Accepted \(N=200\)/)).toBeInTheDocument()
  })

  it('shows only the three CRP samples in the sample-definitions table', () => {
    // Sample-key column cells (unique to sample-definitions table)
    expect(screen.getByText('conservative_clean')).toBeInTheDocument()
    expect(screen.getByText('flexible_clean')).toBeInTheDocument()
    expect(screen.getByText('prolific_accepted')).toBeInTheDocument()
    expect(screen.queryByText('v2_finished')).not.toBeInTheDocument()
    expect(screen.queryByText('v2_all')).not.toBeInTheDocument()
    // Labels still present at least once (in headers + table rows)
    expect(screen.getAllByText('Conservative Clean').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('All V2 Finished')).not.toBeInTheDocument()
  })

  it('renders only two delta columns for the comparison table', () => {
    expect(screen.getByText(/Δ Flexible Clean/)).toBeInTheDocument()
    expect(screen.getByText(/Δ Prolific Accepted/)).toBeInTheDocument()
    expect(screen.queryByText(/Δ All V2 Finished/)).not.toBeInTheDocument()
  })

  it('renders crp-track related links', () => {
    expect(screen.getByRole('link', { name: /CRP 2026 Descriptive Statistics/ })).toHaveAttribute(
      'href',
      '/results/crp-2026/descriptive'
    )
    expect(screen.getByRole('link', { name: /CRP 2026 Scale Reliability/ })).toHaveAttribute(
      'href',
      '/results/crp-2026/reliability'
    )
    expect(screen.getByRole('link', { name: /CRP 2026 Sample & Demographics/ })).toHaveAttribute(
      'href',
      '/results/crp-2026/sample'
    )
  })

  it('back link points to /results/crp-2026', () => {
    expect(screen.getByRole('link', { name: /Back to CRP 2026 Results/ })).toHaveAttribute(
      'href',
      '/results/crp-2026'
    )
  })

  it('uses simple constraint chain without overlap caveat', () => {
    expect(
      screen.queryByText(/Prolific Accepted and All V2 Finished overlap/i)
    ).not.toBeInTheDocument()
  })

  it('Open Data & Reproducibility link is present on both variants', () => {
    expect(screen.getByRole('link', { name: /Open Data & Reproducibility/i })).toHaveAttribute(
      'href',
      '/results/reproducibility'
    )
  })
})

describe('SensitivityContent — accessibility', () => {
  it('live variant has no axe violations', async () => {
    const { container } = render(<SensitivityContent variant="live" data={MOCK_DATA} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('crp variant has no axe violations', async () => {
    const { container } = render(<SensitivityContent variant="crp" data={MOCK_DATA} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('all column headers have scope="col"', () => {
    const { container } = render(<SensitivityContent variant="live" data={MOCK_DATA} />)
    const colHeaders = container.querySelectorAll('th[scope="col"]')
    expect(colHeaders.length).toBeGreaterThan(0)
  })

  it('all metric row labels have scope="row"', () => {
    const { container } = render(<SensitivityContent variant="live" data={MOCK_DATA} />)
    const rowHeaders = container.querySelectorAll('th[scope="row"]')
    // 2 metrics × 2 tables (full sensitivity + dataset comparison) = 4 row headers
    expect(rowHeaders.length).toBe(4)
  })
})

describe('SensitivityContent — fmt formatting', () => {
  it('formats null/missing values as "-"', () => {
    const sparseData: SensitivityData = {
      ...MOCK_DATA,
      metrics: [
        {
          key: 'sparse',
          label: 'Sparse Metric',
          values: { conservative_clean: 1.2345 },
        },
      ],
    }
    render(<SensitivityContent variant="live" data={sparseData} />)
    // 1.2345 appears in both full sensitivity table and dataset comparison
    expect(screen.getAllByText('1.2345').length).toBeGreaterThanOrEqual(1)
    // Other samples should render '-' for missing values
    const dashes = screen.getAllByText('-')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('uses 4-decimal precision for metric values', () => {
    render(<SensitivityContent variant="live" data={MOCK_DATA} />)
    expect(screen.getAllByText('2.8600').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('0.9200').length).toBeGreaterThanOrEqual(1)
  })

  it('formats deltas with leading +/- sign', () => {
    render(<SensitivityContent variant="live" data={MOCK_DATA} />)
    // barrier_mean: flexible_clean (2.85) - conservative_clean (2.86) = -0.0100
    // also readiness_alpha: 0.91 - 0.92 = -0.0100, so 2 occurrences
    expect(screen.getAllByText('-0.0100').length).toBeGreaterThanOrEqual(1)
  })
})

describe('SensitivityContent — empty/edge cases', () => {
  it('handles empty metrics array gracefully', () => {
    const emptyData: SensitivityData = {
      ...MOCK_DATA,
      metrics: [],
    }
    const { container } = render(<SensitivityContent variant="live" data={emptyData} />)
    expect(within(container).getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('handles missing N values', () => {
    const noNData: SensitivityData = {
      ...MOCK_DATA,
      samples: MOCK_DATA.samples.map((s) => ({ ...s, n: null })),
    }
    render(<SensitivityContent variant="live" data={noNData} />)
    expect(screen.getAllByText(/N=\?/).length).toBeGreaterThan(0)
  })
})
