/**
 * Unit tests for DescriptiveContent variant-specific branching.
 *
 * Verify live and CRP variants render the right headings, sample
 * filtering, intro prose, correlation footnote, related links, and
 * back-link targets. Their purpose is to catch drift between the
 * two variants that the shared-component refactor is meant to prevent.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  DescriptiveContent,
  type DescriptiveData,
} from '@/components/results/descriptive/DescriptiveContent'

expect.extend(toHaveNoViolations)

jest.mock('@/components/last-updated', () => ({
  __esModule: true,
  default: ({ utcTimestamp }: { utcTimestamp?: string | null }) => (
    <p data-testid="last-updated">Last updated: {utcTimestamp ?? '-'}</p>
  ),
}))

const MOCK_DATA: DescriptiveData = {
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
      key: 'barrier_mean',
      values: {
        conservative_clean: 2.86,
        flexible_clean: 2.85,
        prolific_accepted: 2.84,
        v2_finished: 2.83,
        v2_all: 2.82,
      },
    },
    {
      key: 'barrier_sd',
      values: {
        conservative_clean: 0.5,
        flexible_clean: 0.51,
        prolific_accepted: 0.52,
        v2_finished: 0.53,
        v2_all: 0.54,
      },
    },
    {
      key: 'readiness_mean',
      values: {
        conservative_clean: 3.1,
        flexible_clean: 3.05,
        prolific_accepted: 3.0,
        v2_finished: 2.99,
        v2_all: 2.98,
      },
    },
    {
      key: 'readiness_sd',
      values: {
        conservative_clean: 0.6,
        flexible_clean: 0.61,
        prolific_accepted: 0.62,
        v2_finished: 0.63,
        v2_all: 0.64,
      },
    },
    {
      key: 'maturity_mean',
      values: {
        conservative_clean: 2.5,
        flexible_clean: 2.55,
        prolific_accepted: 2.6,
        v2_finished: 2.61,
        v2_all: 2.62,
      },
    },
    {
      key: 'maturity_sd',
      values: {
        conservative_clean: 0.7,
        flexible_clean: 0.71,
        prolific_accepted: 0.72,
        v2_finished: 0.73,
        v2_all: 0.74,
      },
    },
    {
      key: 'corr_br',
      values: {
        conservative_clean: -0.4,
        flexible_clean: -0.41,
        prolific_accepted: -0.42,
        v2_finished: -0.43,
      },
    },
    {
      key: 'corr_bm',
      values: {
        conservative_clean: -0.3,
        flexible_clean: -0.31,
        prolific_accepted: -0.32,
        v2_finished: -0.33,
      },
    },
    {
      key: 'corr_rm',
      values: {
        conservative_clean: 0.5,
        flexible_clean: 0.51,
        prolific_accepted: 0.52,
        v2_finished: 0.53,
      },
    },
  ],
}

describe('DescriptiveContent — live variant', () => {
  beforeEach(() => {
    render(<DescriptiveContent variant="live" data={MOCK_DATA} />)
  })

  it('renders "Descriptive Statistics" heading without CRP prefix', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /^Descriptive Statistics$/i })
    ).toBeInTheDocument()
  })

  it('renders LastUpdated component (not a static published badge)', () => {
    expect(screen.getByTestId('last-updated')).toBeInTheDocument()
    expect(screen.queryByText(/Published: April 2026/i)).not.toBeInTheDocument()
  })

  it('mentions the daily analysis pipeline in the intro', () => {
    expect(screen.getByText(/daily analysis pipeline/i)).toBeInTheDocument()
  })

  it('mentions "four primary result groups" in correlation intro', () => {
    expect(screen.getByText(/four primary result groups/i)).toBeInTheDocument()
  })

  it('renders all 5 samples in the construct tables', () => {
    expect(screen.getAllByText(/Conservative Clean \(N=113\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/All V2 Finished \(N=332\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/All V2 \(N=390\)/).length).toBeGreaterThan(0)
  })

  it('actually renders metric values for v2_finished and v2_all (live-only rows)', () => {
    // barrier_mean: v2_finished=2.83, v2_all=2.82 → fmt to 4 places
    expect(screen.getAllByText('2.8300').length).toBeGreaterThan(0) // v2_finished
    expect(screen.getAllByText('2.8200').length).toBeGreaterThan(0) // v2_all
    // readiness_mean: v2_all=2.98 → unique to live-only rows
    expect(screen.getAllByText('2.9800').length).toBeGreaterThan(0)
    // maturity_sd: v2_all=0.74 → unique to live-only rows
    expect(screen.getAllByText('0.7400').length).toBeGreaterThan(0)
  })

  it('correlation matrix includes v2_finished but excludes v2_all (live correlationExcludeKeys)', () => {
    // 4 correlation matrices × 3 diagonal cells each = 12 (was 15 if v2_all included)
    expect(screen.getAllByText('1.0000').length).toBe(12)
  })

  it('renders Sensitivity Analysis link with five-sample tail', () => {
    expect(screen.getByText(/full five-sample comparison including All V2/i)).toBeInTheDocument()
  })

  it('back link points to /results', () => {
    expect(screen.getByRole('link', { name: /Back to Results Overview/ })).toHaveAttribute(
      'href',
      '/results'
    )
  })
})

describe('DescriptiveContent — crp variant', () => {
  beforeEach(() => {
    render(<DescriptiveContent variant="crp" data={MOCK_DATA} />)
  })

  it('renders "CRP 2026: Descriptive Statistics" heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /CRP 2026: Descriptive Statistics/i })
    ).toBeInTheDocument()
  })

  it('renders a static "Published" badge instead of LastUpdated', () => {
    expect(screen.getByText(/Published: April 2026/i)).toBeInTheDocument()
    expect(screen.queryByTestId('last-updated')).not.toBeInTheDocument()
  })

  it('mentions the frozen CRP 2026 dataset in the intro', () => {
    expect(screen.getByText(/frozen CRP 2026 dataset/i)).toBeInTheDocument()
  })

  it('mentions "three CRP sample groups" in correlation intro', () => {
    expect(screen.getByText(/three CRP sample groups/i)).toBeInTheDocument()
  })

  it('shows only 3 CRP samples (no v2_finished or v2_all)', () => {
    expect(screen.getAllByText(/Conservative Clean \(N=113\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Prolific Accepted \(N=200\)/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/All V2 Finished \(N=/)).not.toBeInTheDocument()
    expect(screen.queryByText(/All V2 \(N=/)).not.toBeInTheDocument()
  })

  it('renders CRP 2026 Overview link instead of Sensitivity Analysis in correlation footnote', () => {
    expect(screen.getByText(/dataset methodology and sample definitions/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/full five-sample comparison including All V2/i)
    ).not.toBeInTheDocument()
  })

  it('back link points to /results/crp-2026 (Back to CRP 2026 Overview)', () => {
    expect(screen.getByRole('link', { name: /Back to CRP 2026 Overview/ })).toHaveAttribute(
      'href',
      '/results/crp-2026'
    )
  })
})

describe('DescriptiveContent — accessibility', () => {
  it('live variant has no axe violations', async () => {
    const { container } = render(<DescriptiveContent variant="live" data={MOCK_DATA} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('crp variant has no axe violations', async () => {
    const { container } = render(<DescriptiveContent variant="crp" data={MOCK_DATA} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('column headers use scope="col" on every table (live)', () => {
    const { container } = render(<DescriptiveContent variant="live" data={MOCK_DATA} />)
    // Live variant rendered tables:
    //   3 construct tables (Barriers, Readiness, Maturity) × 3 col headers each = 9
    //   4 correlation matrices × 4 col headers each = 16
    //   Total: 25
    expect(container.querySelectorAll('th[scope="col"]').length).toBe(25)
  })

  it('row labels use scope="row" on every table (live)', () => {
    const { container } = render(<DescriptiveContent variant="live" data={MOCK_DATA} />)
    // Live variant rendered row headers:
    //   3 construct tables × 5 sample rows each = 15
    //   4 correlation matrices × 3 construct rows each = 12
    //   Total: 27
    expect(container.querySelectorAll('th[scope="row"]').length).toBe(27)
  })

  it('column headers use scope="col" on every table (crp)', () => {
    const { container } = render(<DescriptiveContent variant="crp" data={MOCK_DATA} />)
    // CRP variant rendered tables:
    //   3 construct tables × 3 col headers each = 9
    //   3 correlation matrices × 4 col headers each = 12
    //   Total: 21
    expect(container.querySelectorAll('th[scope="col"]').length).toBe(21)
  })

  it('row labels use scope="row" on every table (crp)', () => {
    const { container } = render(<DescriptiveContent variant="crp" data={MOCK_DATA} />)
    // CRP variant rendered row headers:
    //   3 construct tables × 3 sample rows each = 9
    //   3 correlation matrices × 3 construct rows each = 9
    //   Total: 18
    expect(container.querySelectorAll('th[scope="row"]').length).toBe(18)
  })
})

describe('DescriptiveContent — formatting', () => {
  it('formats values to 4 decimal places', () => {
    render(<DescriptiveContent variant="live" data={MOCK_DATA} />)
    expect(screen.getAllByText('2.8600').length).toBeGreaterThan(0)
    expect(screen.getAllByText('0.5000').length).toBeGreaterThan(0)
  })

  it('formats correlations including negatives', () => {
    render(<DescriptiveContent variant="live" data={MOCK_DATA} />)
    expect(screen.getAllByText('-0.4000').length).toBeGreaterThan(0) // corr_br
    expect(screen.getAllByText('0.5000').length).toBeGreaterThan(0) // corr_rm
  })

  it('renders 1.0000 on the diagonal of each correlation matrix', () => {
    render(<DescriptiveContent variant="live" data={MOCK_DATA} />)
    // 4 result groups × 3 diagonal cells each = 12 cells of 1.0000 for live
    expect(screen.getAllByText('1.0000').length).toBe(12)
  })
})
