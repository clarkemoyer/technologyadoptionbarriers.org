/**
 * Unit tests for DataQualityContent variant-specific branching.
 *
 * These tests verify that the live and crp variants render the correct
 * headings, sample counts, prose words, filter-chain cards, cross-reference
 * links, and script references. Their purpose is to catch drift between the
 * two variants that the shared-component refactor is meant to prevent.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  DataQualityContent,
  type DataQualityData,
} from '@/components/results/data-quality/DataQualityContent'

/* ── Lightweight mock for PipelineDataFlow so the diagram doesn't interfere ── */
jest.mock('@/components/results/data-quality/PipelineDataFlow', () => ({
  PipelineDataFlow: ({ variant }: { variant?: 'live' | 'crp' }) => (
    <div data-testid="pipeline-data-flow" data-variant={variant} />
  ),
}))

/* ── Mock LastUpdated so it renders predictable text ── */
jest.mock('@/components/last-updated', () => ({
  __esModule: true,
  default: ({ utcTimestamp }: { utcTimestamp?: string | null }) => (
    <p data-testid="last-updated">Last updated: {utcTimestamp ?? '-'}</p>
  ),
}))

/* ── Shared test data ─────────────────────────────────────────── */

const MOCK_DATA: DataQualityData = {
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
      label: 'Barrier Mean',
      values: {
        conservative_clean: 3.1,
        flexible_clean: 3.0,
        prolific_accepted: 2.9,
        v2_finished: 2.8,
        v2_all: 2.7,
      },
    },
  ],
}

/* ── Live variant ─────────────────────────────────────────────── */

describe('DataQualityContent — live variant', () => {
  beforeEach(() => {
    render(<DataQualityContent variant="live" data={MOCK_DATA} />)
  })

  it('renders "Data Quality Pipeline" heading without CRP prefix', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /^data quality pipeline$/i })
    ).toBeInTheDocument()
    expect(screen.queryByText(/crp 2026:/i)).not.toBeInTheDocument()
  })

  it('shows the LastUpdated component (not a Published badge)', () => {
    expect(screen.getByTestId('last-updated')).toBeInTheDocument()
    expect(screen.queryByText(/published: april 2026/i)).not.toBeInTheDocument()
  })

  it('shows all five samples in the Sample Definitions table', () => {
    const section = screen
      .getByRole('heading', { name: /^sample definitions$/i })
      .closest('section')!
    const table = section.querySelector('table')!
    const t = within(table as HTMLElement)
    expect(t.getByText('Conservative Clean')).toBeInTheDocument()
    expect(t.getByText('Flexible Clean')).toBeInTheDocument()
    expect(t.getByText('Prolific Accepted')).toBeInTheDocument()
    expect(t.getByText('All V2 Finished')).toBeInTheDocument()
    expect(t.getByText('All V2')).toBeInTheDocument()
  })

  it('uses "five" in sensitivity-analysis prose', () => {
    // The word "five" appears in prose referencing the sample count
    expect(screen.getAllByText(/five/i).length).toBeGreaterThan(0)
  })

  it('renders the "All V2 Finished" filter-chain card', () => {
    // The heading is inside a filter-chain section, not the sample table row
    expect(screen.getByRole('heading', { name: /4\. all v2 finished/i })).toBeInTheDocument()
  })

  it('renders the "All V2" filter-chain card', () => {
    expect(
      screen.getByRole('heading', { name: /5\. all v2 \(complete dataset\)/i })
    ).toBeInTheDocument()
  })

  it('does NOT show the CRP "omitted definitions" note', () => {
    expect(
      screen.queryByText(/all v2 finished and all v2 sample definitions are not included/i)
    ).not.toBeInTheDocument()
  })

  it('links to /results/descriptive (not /results/crp-2026/)', () => {
    const link = screen.getByRole('link', { name: /descriptive statistics/i })
    expect(link).toHaveAttribute('href', '/results/descriptive')
  })

  it('links to /results/reliability', () => {
    const link = screen.getByRole('link', { name: /scale reliability/i })
    expect(link).toHaveAttribute('href', '/results/reliability')
  })

  it('links to /results/sensitivity', () => {
    const link = screen.getByRole('link', { name: /sensitivity analysis/i })
    expect(link).toHaveAttribute('href', '/results/sensitivity')
  })

  it('links Back to Results Overview → /results', () => {
    const link = screen.getByRole('link', { name: /← back to results overview/i })
    expect(link).toHaveAttribute('href', '/results')
  })

  it('references tabs_v2_unified_data_analysis.py (not tabs_v2_analysis.py)', () => {
    expect(screen.getAllByText('tabs_v2_unified_data_analysis.py').length).toBeGreaterThan(0)
    expect(screen.queryByText('tabs_v2_analysis.py')).not.toBeInTheDocument()
  })

  it('passes variant="live" to PipelineDataFlow', () => {
    expect(screen.getByTestId('pipeline-data-flow')).toHaveAttribute('data-variant', 'live')
  })
})

/* ── CRP variant ──────────────────────────────────────────────── */

describe('DataQualityContent — crp variant', () => {
  beforeEach(() => {
    render(<DataQualityContent variant="crp" data={MOCK_DATA} />)
  })

  it('renders "CRP 2026: Data Quality Pipeline" heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /crp 2026: data quality pipeline/i })
    ).toBeInTheDocument()
  })

  it('shows "Published: April 2026" badge (not LastUpdated)', () => {
    expect(screen.getByText(/published: april 2026/i)).toBeInTheDocument()
    expect(screen.queryByTestId('last-updated')).not.toBeInTheDocument()
  })

  it('shows only the three CRP samples — conservative, flexible, prolific_accepted', () => {
    expect(screen.getAllByText(/conservative clean/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/flexible clean/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/prolific accepted/i).length).toBeGreaterThan(0)
  })

  it('filters out All V2 Finished and All V2 from the sample table', () => {
    // "All V2" as a standalone label in the sample table must not appear.
    // The text "All V2" also appears in prose; narrow search to the heading-free zone.
    const sampleSection = screen
      .getByRole('heading', { name: /sample definitions/i })
      .closest('section')!
    expect(within(sampleSection).queryByText('All V2 Finished')).not.toBeInTheDocument()
    // "All V2" alone should not appear as a row label
    const rows = within(sampleSection).queryAllByText('All V2')
    expect(rows).toHaveLength(0)
  })

  it('uses "three" in prose', () => {
    expect(screen.getAllByText(/three/i).length).toBeGreaterThan(0)
  })

  it('does NOT render the "All V2 Finished" filter-chain card heading', () => {
    expect(screen.queryByRole('heading', { name: /4\. all v2 finished/i })).not.toBeInTheDocument()
  })

  it('does NOT render the "All V2" filter-chain card heading', () => {
    expect(
      screen.queryByRole('heading', { name: /5\. all v2 \(complete dataset\)/i })
    ).not.toBeInTheDocument()
  })

  it('shows the CRP "omitted definitions" note', () => {
    expect(
      screen.getByText(/all v2 finished and all v2 sample definitions are not included/i)
    ).toBeInTheDocument()
  })

  it('links to /results/crp-2026/descriptive', () => {
    const link = screen.getByRole('link', { name: /descriptive statistics/i })
    expect(link).toHaveAttribute('href', '/results/crp-2026/descriptive')
  })

  it('links to /results/crp-2026/reliability', () => {
    const link = screen.getByRole('link', { name: /scale reliability/i })
    expect(link).toHaveAttribute('href', '/results/crp-2026/reliability')
  })

  it('links to /results/crp-2026/sensitivity', () => {
    const link = screen.getByRole('link', { name: /sensitivity analysis/i })
    expect(link).toHaveAttribute('href', '/results/crp-2026/sensitivity')
  })

  it('links Back to Results Overview → /results/crp-2026', () => {
    const link = screen.getByRole('link', { name: /← back to results overview/i })
    expect(link).toHaveAttribute('href', '/results/crp-2026')
  })

  it('references tabs_v2_unified_data_analysis.py', () => {
    expect(screen.getAllByText('tabs_v2_unified_data_analysis.py').length).toBeGreaterThan(0)
  })

  it('passes variant="crp" to PipelineDataFlow', () => {
    expect(screen.getByTestId('pipeline-data-flow')).toHaveAttribute('data-variant', 'crp')
  })
})

/* ── fmt() formatting ─────────────────────────────────────────── */

describe('DataQualityContent — metric value formatting', () => {
  it('formats integers without decimal places', () => {
    const dataWithInt: DataQualityData = {
      ...MOCK_DATA,
      metrics: [
        {
          key: 'n_total',
          label: 'N Total',
          // Use 42 — absent from all sample n-values (78, 123, 200, 332, 390)
          // so the assertion is not a false positive from the N column.
          values: { conservative_clean: 42, flexible_clean: 123, prolific_accepted: 200 },
        },
      ],
    }
    render(<DataQualityContent variant="crp" data={dataWithInt} />)
    // The integer 42 should render as "42", not "42.0000"
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.queryByText('42.0000')).not.toBeInTheDocument()
  })

  it('formats floats to 4 decimal places', () => {
    const dataWithFloat: DataQualityData = {
      ...MOCK_DATA,
      metrics: [
        {
          key: 'alpha',
          label: 'Alpha',
          values: { conservative_clean: 0.912345, flexible_clean: 0.9, prolific_accepted: 0.85 },
        },
      ],
    }
    render(<DataQualityContent variant="crp" data={dataWithFloat} />)
    expect(screen.getByText('0.9123')).toBeInTheDocument()
  })

  it('renders dash for non-numeric values', () => {
    const dataWithNull: DataQualityData = {
      ...MOCK_DATA,
      metrics: [
        {
          key: 'placeholder',
          label: 'Placeholder',
          values: { conservative_clean: null, flexible_clean: undefined, prolific_accepted: 'N/A' },
        },
      ],
    }
    render(<DataQualityContent variant="crp" data={dataWithNull} />)
    // Each non-numeric value should render as "-"
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(3)
  })
})

/* ── Reproducibility section ──────────────────────────────────── */

describe('DataQualityContent — reproducibility section', () => {
  it('live: does NOT mention "public dataset" in reproducibility prose', () => {
    render(<DataQualityContent variant="live" data={MOCK_DATA} />)
    const section = screen.getByRole('heading', { name: /^reproducibility$/i }).closest('section')!
    expect(within(section).queryByText(/public dataset/i)).not.toBeInTheDocument()
  })

  it('live: does NOT show the "Open Data & Reproducibility" button', () => {
    render(<DataQualityContent variant="live" data={MOCK_DATA} />)
    expect(
      screen.queryByRole('link', { name: /open data & reproducibility/i })
    ).not.toBeInTheDocument()
  })

  it('crp: mentions "public CRP-2026 dataset" in reproducibility prose', () => {
    render(<DataQualityContent variant="crp" data={MOCK_DATA} />)
    const section = screen.getByRole('heading', { name: /^reproducibility$/i }).closest('section')!
    expect(within(section).getByText(/public crp-2026 dataset/i)).toBeInTheDocument()
  })

  it('crp: shows the "Open Data & Reproducibility" link to /results/reproducibility', () => {
    render(<DataQualityContent variant="crp" data={MOCK_DATA} />)
    const link = screen.getByRole('link', { name: /open data & reproducibility/i })
    expect(link).toHaveAttribute('href', '/results/reproducibility')
  })
})

/* ── "nested" prose accuracy ──────────────────────────────────── */

describe('DataQualityContent — sample-nesting prose', () => {
  it('live: overview bullet does NOT call samples "nested"', () => {
    render(<DataQualityContent variant="live" data={MOCK_DATA} />)
    // The bullet says "Five samples are computed" without "nested"
    expect(screen.queryByText(/five nested samples/i)).not.toBeInTheDocument()
  })

  it('live: Sample Definitions intro does NOT call samples "nested"', () => {
    render(<DataQualityContent variant="live" data={MOCK_DATA} />)
    expect(screen.queryByText(/five nested sample definitions/i)).not.toBeInTheDocument()
  })

  it('crp: overview bullet calls samples "nested"', () => {
    render(<DataQualityContent variant="crp" data={MOCK_DATA} />)
    expect(screen.getByText(/three nested samples/i)).toBeInTheDocument()
  })

  it('crp: Sample Definitions intro calls samples "nested"', () => {
    render(<DataQualityContent variant="crp" data={MOCK_DATA} />)
    // "Three nested" appears in both the overview bullet and the Sample Definitions intro
    const matches = screen.getAllByText(/three nested/i)
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })
})
