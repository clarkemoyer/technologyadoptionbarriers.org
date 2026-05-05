/**
 * Unit tests for SampleContent variant-specific branching.
 *
 * Verify live and CRP variants render the right headings, sample
 * filtering, tech-bucket label, methodology block visibility,
 * findings cross-reference link, and back-link target. Their purpose
 * is to catch drift between the two variants that the shared-component
 * refactor is meant to prevent.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SampleContent, type SampleData } from '@/components/results/sample/SampleContent'

expect.extend(toHaveNoViolations)

jest.mock('@/components/last-updated', () => ({
  __esModule: true,
  default: ({ utcTimestamp }: { utcTimestamp?: string | null }) => (
    <p data-testid="last-updated">Last updated: {utcTimestamp ?? '-'}</p>
  ),
}))

const SAMPLE_DETAIL = {
  demographics: {
    roles: { CIO: 5, CTO: 6, CEO: 8, Other: 3 },
    org_sizes: { '50-249': 7, '250-999': 9, '1000+': 6 },
    profit_models: { 'For-Profit': 18, 'Non-Profit': 4 },
    tech_vs_nontech: { technical: 11, non_technical: 8, other: 3 },
    other_roles: {
      total: 3,
      categories: { 'Director / Manager': 2, 'C-Suite Adjacent': 1 },
    },
  },
}

const MOCK_DATA: SampleData = {
  last_updated: '2026-04-04T09:00:00Z',
  samples: [
    {
      key: 'conservative_clean',
      label: 'Conservative Clean',
      n: 113,
      description: 'Most restrictive',
    },
    { key: 'flexible_clean', label: 'Flexible Clean', n: 165, description: 'Expanded clean' },
    {
      key: 'prolific_accepted',
      label: 'Prolific Accepted',
      n: 200,
      description: 'Prolific approved',
    },
    {
      key: 'v2_finished',
      label: 'All V2 Finished',
      n: 332,
      description: 'All finished V2 responses',
    },
    { key: 'v2_all', label: 'All V2', n: 390, description: 'Entire dataset' },
  ],
  sample_details: {
    conservative_clean: SAMPLE_DETAIL,
    flexible_clean: SAMPLE_DETAIL,
    prolific_accepted: SAMPLE_DETAIL,
    v2_finished: SAMPLE_DETAIL,
  },
  role_categories: [
    {
      label: 'Director / Manager',
      description: 'Director or Manager-level roles',
      examples: 'director, manager, sr. director',
    },
    {
      label: 'C-Suite Adjacent',
      description: 'Roles adjacent to the C-suite',
      examples: 'president, founder',
    },
  ],
}

describe('SampleContent — live variant', () => {
  beforeEach(() => {
    render(<SampleContent variant="live" data={MOCK_DATA} />)
  })

  it('renders "Sample & Demographics" heading without CRP prefix', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /^Sample & Demographics$/i })
    ).toBeInTheDocument()
  })

  it('renders LastUpdated component (not a static published badge)', () => {
    expect(screen.getByTestId('last-updated')).toBeInTheDocument()
    expect(screen.queryByText(/Published: April 2026/i)).not.toBeInTheDocument()
  })

  it('mentions "four primary result groups" in intro', () => {
    expect(screen.getByText(/four primary result groups/i)).toBeInTheDocument()
  })

  it('renders all four groups in Sample Size Summary', () => {
    expect(screen.getAllByText(/All V2 Finished/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Conservative Clean/).length).toBeGreaterThan(0)
  })

  it('uses full tech-bucket label including CISO + reclassified Other', () => {
    expect(
      screen.getAllByText(/Technical \(CIO, CTO, CISO \+ reclassified Other\)/).length
    ).toBeGreaterThan(0)
  })

  it('renders the role-classification methodology details block', () => {
    expect(screen.getAllByText(/How is this classification computed/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Technical bucket/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Non-Technical bucket/i).length).toBeGreaterThan(0)
  })

  it('Findings cross-reference link points to /results/findings', () => {
    const findingsLinks = screen.getAllByRole('link', { name: /^Findings$/ })
    expect(findingsLinks.length).toBeGreaterThan(0)
    findingsLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/results/findings')
    })
  })

  it('back link points to /results', () => {
    expect(screen.getByRole('link', { name: /Back to Results Overview/ })).toHaveAttribute(
      'href',
      '/results'
    )
  })
})

describe('SampleContent — crp variant', () => {
  beforeEach(() => {
    render(<SampleContent variant="crp" data={MOCK_DATA} />)
  })

  it('renders "CRP 2026: Sample & Demographics" heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /CRP 2026: Sample & Demographics/i })
    ).toBeInTheDocument()
  })

  it('renders a static "Published" badge instead of LastUpdated', () => {
    expect(screen.getByText(/Published: April 2026/i)).toBeInTheDocument()
    expect(screen.queryByTestId('last-updated')).not.toBeInTheDocument()
  })

  it('mentions "three primary result groups" in intro', () => {
    expect(screen.getByText(/three primary result groups/i)).toBeInTheDocument()
  })

  it('does NOT render All V2 Finished in the Sample Size Summary', () => {
    expect(screen.queryByText(/All V2 Finished/)).not.toBeInTheDocument()
  })

  it('uses verbose tech-bucket label with CISO + reclassified Other', () => {
    expect(
      screen.getAllByText(/Technical \(CIO, CTO, CISO \+ reclassified Other\)/).length
    ).toBeGreaterThan(0)
  })

  it('renders the role-classification methodology details block', () => {
    expect(screen.getAllByText(/How is this classification computed/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Technical bucket/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Non-Technical bucket/i).length).toBeGreaterThan(0)
  })

  it('Findings cross-reference link points to /results/crp-2026/findings', () => {
    const findingsLinks = screen.getAllByRole('link', { name: /^Findings$/ })
    expect(findingsLinks.length).toBeGreaterThan(0)
    findingsLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/results/crp-2026/findings')
    })
  })

  it('back link points to /results/crp-2026', () => {
    expect(screen.getByRole('link', { name: /Back to CRP 2026 Overview/ })).toHaveAttribute(
      'href',
      '/results/crp-2026'
    )
  })

  it('missing-data message references the CRP filename', () => {
    const noDataData: SampleData = { ...MOCK_DATA, sample_details: {} }
    const { container } = render(<SampleContent variant="crp" data={noDataData} />)
    expect(within(container).getAllByText(/crp-sensitivity-analysis\.json/).length).toBeGreaterThan(
      0
    )
  })
})

describe('SampleContent — accessibility', () => {
  it('live variant has no axe violations', async () => {
    const { container } = render(<SampleContent variant="live" data={MOCK_DATA} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('crp variant has no axe violations', async () => {
    const { container } = render(<SampleContent variant="crp" data={MOCK_DATA} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('column headers use scope="col"', () => {
    const { container } = render(<SampleContent variant="live" data={MOCK_DATA} />)
    expect(container.querySelectorAll('th[scope="col"]').length).toBeGreaterThan(0)
  })
})

describe('SampleContent — missing data fallback', () => {
  it('renders DATA_UNAVAILABLE message when sample_details are missing', () => {
    const emptyData: SampleData = { ...MOCK_DATA, sample_details: {} }
    render(<SampleContent variant="live" data={emptyData} />)
    expect(screen.getAllByText(/Demographics data missing/).length).toBeGreaterThan(0)
  })

  it('live missing-data message references sensitivity-analysis.json', () => {
    const emptyData: SampleData = { ...MOCK_DATA, sample_details: {} }
    render(<SampleContent variant="live" data={emptyData} />)
    expect(screen.getAllByText(/sensitivity-analysis\.json/).length).toBeGreaterThan(0)
  })
})

// Helper: override tech_vs_nontech.other for a single sample_detail group
const withOther = (other: number): SampleData => ({
  ...MOCK_DATA,
  sample_details: {
    conservative_clean: {
      demographics: {
        ...MOCK_DATA.sample_details!.conservative_clean.demographics,
        tech_vs_nontech: { technical: 11, non_technical: 8, other },
      },
    },
  },
})

describe('SampleContent — non-technical label data-awareness', () => {
  it('shows "+ reclassified Other" suffix when other === 0', () => {
    render(<SampleContent variant="live" data={withOther(0)} />)
    expect(screen.getAllByText(/Non-Technical.*\+ reclassified Other/).length).toBeGreaterThan(0)
  })

  it('omits "+ reclassified Other" suffix when other > 0', () => {
    render(<SampleContent variant="live" data={withOther(3)} />)
    expect(screen.queryByText(/Non-Technical.*\+ reclassified Other/)).not.toBeInTheDocument()
    // The base label (without suffix) is present
    expect(screen.getAllByText(/Non-Technical \(CEO/).length).toBeGreaterThan(0)
  })
})
