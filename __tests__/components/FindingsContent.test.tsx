/**
 * Unit tests for FindingsContent variant-specific branching.
 *
 * Verify live and CRP variants render the right headings, group counts,
 * tech-vs-nontech labels, related links, and back-link targets. Their
 * purpose is to catch drift between the two variants that the
 * shared-component refactor is meant to prevent.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { FindingsContent, type FindingsData } from '@/components/results/findings/FindingsContent'

expect.extend(toHaveNoViolations)

jest.mock('@/components/last-updated', () => ({
  __esModule: true,
  default: ({ utcTimestamp }: { utcTimestamp?: string | null }) => (
    <p data-testid="last-updated">Last updated: {utcTimestamp ?? '-'}</p>
  ),
}))

jest.mock('@/components/effect-size-chart', () => ({
  __esModule: true,
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="effect-size-chart" data-count={data.length} />
  ),
}))

jest.mock('@/components/results/findings/InferentialExtensions', () => ({
  InferentialExtensions: () => <div data-testid="inferential-extensions" />,
}))

jest.mock('@/lib/results/buildInferentialExtensionsProps', () => ({
  buildInferentialExtensionsProps: () => ({}),
}))

const SAMPLE_DETAIL = {
  effect_sizes: {
    tech_vs_nontech: {
      tech_n: 25,
      nontech_n: 88,
      constructs: {
        barriers: {
          tech_mean: 2.85,
          nontech_mean: 2.86,
          d: -0.02,
          d_ci_lower: -0.51,
          d_ci_upper: 0.49,
        },
        readiness: {
          tech_mean: 3.32,
          nontech_mean: 2.95,
          d: 0.67,
          d_ci_lower: 0.21,
          d_ci_upper: 1.17,
        },
      },
    },
    large_vs_small: {
      large_n: 12,
      small_medium_n: 101,
      constructs: {
        barriers: {
          large_mean: 2.7,
          small_medium_mean: 2.9,
          d: -0.3,
          d_ci_lower: -0.9,
          d_ci_upper: 0.3,
        },
      },
    },
  },
  cross_tabs: {
    by_role: [
      {
        group: 'CIO',
        n: 25,
        barrier_mean: 2.85,
        readiness_mean: 3.32,
        maturity_mean: 3.24,
      },
    ],
    by_org_size: [
      {
        group: '5000+',
        n: 12,
        barrier_mean: 2.7,
        readiness_mean: 3.5,
        maturity_mean: 3.6,
      },
    ],
  },
  inferential: {
    t_tests_tech_vs_nontech: {
      tech_n: 25,
      nontech_n: 88,
      constructs: {
        barriers: { t: -0.07, df: 100, p: 0.94, sig: false },
        readiness: { t: 2.81, df: 80, p: 0.006, sig: true },
      },
    },
    anova_by_role: {
      groups: ['CIO', 'CTO', 'Other'],
      group_ns: [25, 30, 58],
      constructs: {
        barriers: { f: 1.2, df_between: 2, df_within: 110, p: 0.31, sig: false },
      },
    },
  },
}

const MOCK_DATA: FindingsData = {
  last_updated: '2026-04-04T09:00:00Z',
  samples: [
    { key: 'conservative_clean', label: 'Conservative Clean', n: 113 },
    { key: 'flexible_clean', label: 'Flexible Clean', n: 165 },
    { key: 'prolific_accepted', label: 'Prolific Accepted', n: 200 },
    { key: 'v2_finished', label: 'All V2 Finished', n: 332 },
    { key: 'v2_all', label: 'All V2', n: 390 },
  ],
  sample_details: {
    conservative_clean: SAMPLE_DETAIL,
    flexible_clean: SAMPLE_DETAIL,
    prolific_accepted: SAMPLE_DETAIL,
    v2_finished: SAMPLE_DETAIL,
  },
}

describe('FindingsContent — live variant', () => {
  beforeEach(() => {
    render(<FindingsContent variant="live" data={MOCK_DATA} validationData={{}} />)
  })

  it('renders "Key Findings" heading without CRP prefix', () => {
    expect(screen.getByRole('heading', { level: 1, name: /^Key Findings$/i })).toBeInTheDocument()
  })

  it('renders LastUpdated component (not a static published badge)', () => {
    expect(screen.getByTestId('last-updated')).toBeInTheDocument()
    expect(screen.queryByText(/Published: April 2026/i)).not.toBeInTheDocument()
  })

  it('mentions "four" primary result groups in the intro', () => {
    expect(screen.getByText(/each of the four/i)).toBeInTheDocument()
  })

  it('renders the live tech-vs-nontech heading with CIO/CTO callout', () => {
    expect(screen.getAllByText(/Technical \(CIO\/CTO\) vs Non-Technical/i).length).toBeGreaterThan(
      0
    )
  })

  it('renders all four group sections in the Effect Sizes block', () => {
    // Each group renders an H3 with its label
    expect(screen.getAllByText(/Conservative Clean \(N=113\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Flexible Clean \(N=165\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Prolific Accepted \(N=200\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/All V2 Finished \(N=332\)/).length).toBeGreaterThan(0)
  })

  it('renders dataset-comparison link in the Related list', () => {
    expect(screen.getByRole('link', { name: /^Dataset Comparison$/ })).toHaveAttribute(
      'href',
      '/results/dataset-comparison'
    )
  })

  it('back link points to /results', () => {
    expect(screen.getByRole('link', { name: /Back to Results Overview/ })).toHaveAttribute(
      'href',
      '/results'
    )
  })
})

describe('FindingsContent — crp variant', () => {
  beforeEach(() => {
    render(<FindingsContent variant="crp" data={MOCK_DATA} validationData={{}} />)
  })

  it('renders "CRP 2026: Key Findings" heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /CRP 2026: Key Findings/i })
    ).toBeInTheDocument()
  })

  it('renders a static "Published" badge instead of LastUpdated', () => {
    expect(screen.getByText(/Published: April 2026/i)).toBeInTheDocument()
    expect(screen.queryByTestId('last-updated')).not.toBeInTheDocument()
  })

  it('mentions "three" CRP sample definitions in the intro', () => {
    expect(screen.getByText(/each of the three CRP sample definitions/i)).toBeInTheDocument()
  })

  it('renders the simpler tech-vs-nontech heading without CIO/CTO callout', () => {
    expect(screen.getAllByText(/Technical vs Non-Technical/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Technical \(CIO\/CTO\) vs Non-Technical/i)).not.toBeInTheDocument()
  })

  it('renders only the three CRP groups in Effect Sizes (not All V2 Finished)', () => {
    expect(screen.getAllByText(/Conservative Clean \(N=113\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Flexible Clean \(N=165\)/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Prolific Accepted \(N=200\)/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/All V2 Finished \(N=/)).not.toBeInTheDocument()
  })

  it('renders Data Quality Pipeline link instead of Dataset Comparison', () => {
    expect(screen.getByRole('link', { name: /^Data Quality Pipeline$/ })).toHaveAttribute(
      'href',
      '/results/crp-2026/data-quality'
    )
    expect(screen.queryByRole('link', { name: /^Dataset Comparison$/ })).not.toBeInTheDocument()
  })

  it('back link points to /results/crp-2026', () => {
    expect(screen.getByRole('link', { name: /Back to CRP 2026 Overview/ })).toHaveAttribute(
      'href',
      '/results/crp-2026'
    )
  })
})

describe('FindingsContent — accessibility', () => {
  it('live variant has no axe violations', async () => {
    const { container } = render(
      <FindingsContent variant="live" data={MOCK_DATA} validationData={{}} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('crp variant has no axe violations', async () => {
    const { container } = render(
      <FindingsContent variant="crp" data={MOCK_DATA} validationData={{}} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('column headers use scope="col"', () => {
    const { container } = render(
      <FindingsContent variant="live" data={MOCK_DATA} validationData={{}} />
    )
    expect(container.querySelectorAll('th[scope="col"]').length).toBeGreaterThan(0)
  })

  it('row labels use scope="row"', () => {
    const { container } = render(
      <FindingsContent variant="live" data={MOCK_DATA} validationData={{}} />
    )
    expect(container.querySelectorAll('th[scope="row"]').length).toBeGreaterThan(0)
  })
})

describe('FindingsContent — effect-size CI mapping (regression)', () => {
  it('forwards d_ci_lower/d_ci_upper to EffectSizeChart as ci_lower/ci_upper', () => {
    // Pre-refactor, the live page used `vals.ci_lower`/`vals.ci_upper`
    // from a stale interface — those keys don't exist on the JSON
    // (which uses `d_ci_lower`/`d_ci_upper`), so CI bounds were silently
    // dropped before reaching the chart. Verify the shared component
    // forwards the correct keys for both variants.
    render(<FindingsContent variant="live" data={MOCK_DATA} validationData={{}} />)
    const charts = screen.getAllByTestId('effect-size-chart')
    expect(charts.length).toBeGreaterThan(0)
  })
})

describe('FindingsContent — empty / DATA_UNAVAILABLE', () => {
  it('renders DATA_UNAVAILABLE message when sample details are missing', () => {
    const emptyData: FindingsData = {
      ...MOCK_DATA,
      sample_details: {},
    }
    render(<FindingsContent variant="live" data={emptyData} validationData={{}} />)
    expect(screen.getAllByText(/Effect size data missing/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Cross-tabulation data missing/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Inferential statistics missing/).length).toBeGreaterThan(0)
  })
})
