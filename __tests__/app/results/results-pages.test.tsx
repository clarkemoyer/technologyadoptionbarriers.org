/**
 * Basic render tests for all results pages.
 *
 * These tests verify that each results page renders without errors
 * when given the current (possibly placeholder) JSON data. They do
 * NOT test interactive behavior - only that the component tree mounts.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

/* ── Mock next/navigation (required by ResultsNav wrapper) ── */
const mockedUsePathname = jest.fn().mockReturnValue('/results')
jest.mock('next/navigation', () => ({
  usePathname: () => mockedUsePathname(),
}))

/* ── Mock browser APIs not available in jsdom ── */
beforeAll(() => {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  if (typeof globalThis.IntersectionObserver === 'undefined') {
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      value: MockIntersectionObserver,
      configurable: true,
      writable: true,
    })
  }
  if (typeof window.IntersectionObserver === 'undefined') {
    Object.defineProperty(window, 'IntersectionObserver', {
      value: MockIntersectionObserver,
      configurable: true,
      writable: true,
    })
  }
  if (typeof globalThis.ResizeObserver === 'undefined') {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      value: MockResizeObserver,
      configurable: true,
      writable: true,
    })
  }
  if (typeof window.ResizeObserver === 'undefined') {
    Object.defineProperty(window, 'ResizeObserver', {
      value: MockResizeObserver,
      configurable: true,
      writable: true,
    })
  }
})

/* ── Mock data imports ─────────────────────────────────────── */

const MOCK_SENSITIVITY_DATA = {
  last_updated: '2026-04-04T09:00:00Z',
  samples: [
    { key: 'conservative_clean', label: 'Conservative Clean', description: 'test', n: 20 },
    { key: 'flexible_clean', label: 'Flexible Clean', description: 'test', n: 118 },
    { key: 'prolific_accepted', label: 'Prolific Accepted', description: 'test', n: 208 },
    { key: 'v2_finished', label: 'All V2 Finished', description: 'test', n: 332 },
    { key: 'v2_all', label: 'All V2', description: 'test', n: 390 },
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
    {
      key: 'barrier_sd',
      label: 'Barrier SD',
      values: {
        conservative_clean: 0.5,
        flexible_clean: 0.6,
        prolific_accepted: 0.7,
        v2_finished: 0.8,
        v2_all: 0.9,
      },
    },
    {
      key: 'readiness_mean',
      label: 'Readiness Mean',
      values: {
        conservative_clean: 2.5,
        flexible_clean: 2.4,
        prolific_accepted: 2.3,
        v2_finished: 2.2,
        v2_all: 2.1,
      },
    },
    {
      key: 'readiness_sd',
      label: 'Readiness SD',
      values: {
        conservative_clean: 0.5,
        flexible_clean: 0.5,
        prolific_accepted: 0.6,
        v2_finished: 0.6,
        v2_all: 0.7,
      },
    },
    {
      key: 'maturity_mean',
      label: 'Maturity Mean',
      values: {
        conservative_clean: 2.0,
        flexible_clean: 2.0,
        prolific_accepted: 1.9,
        v2_finished: 1.9,
        v2_all: 1.8,
      },
    },
    {
      key: 'maturity_sd',
      label: 'Maturity SD',
      values: {
        conservative_clean: 0.4,
        flexible_clean: 0.4,
        prolific_accepted: 0.5,
        v2_finished: 0.5,
        v2_all: 0.5,
      },
    },
    {
      key: 'corr_br',
      label: 'Corr B-R',
      values: {
        conservative_clean: -0.3,
        flexible_clean: -0.3,
        prolific_accepted: -0.2,
        v2_finished: -0.2,
        v2_all: -0.2,
      },
    },
    {
      key: 'corr_bm',
      label: 'Corr B-M',
      values: {
        conservative_clean: -0.2,
        flexible_clean: -0.2,
        prolific_accepted: -0.1,
        v2_finished: -0.1,
        v2_all: -0.1,
      },
    },
    {
      key: 'corr_rm',
      label: 'Corr R-M',
      values: {
        conservative_clean: 0.6,
        flexible_clean: 0.6,
        prolific_accepted: 0.5,
        v2_finished: 0.5,
        v2_all: 0.5,
      },
    },
    {
      key: 'alpha_barriers',
      label: 'Alpha Barriers',
      values: {
        conservative_clean: 0.91,
        flexible_clean: 0.9,
        prolific_accepted: 0.89,
        v2_finished: 0.88,
        v2_all: 0.87,
      },
    },
    {
      key: 'alpha_readiness',
      label: 'Alpha Readiness',
      values: {
        conservative_clean: 0.88,
        flexible_clean: 0.87,
        prolific_accepted: 0.86,
        v2_finished: 0.85,
        v2_all: 0.84,
      },
    },
    {
      key: 'alpha_maturity',
      label: 'Alpha Maturity',
      values: {
        conservative_clean: 0.85,
        flexible_clean: 0.84,
        prolific_accepted: 0.83,
        v2_finished: 0.82,
        v2_all: 0.81,
      },
    },
  ],
  sample_details: {
    conservative_clean: {
      demographics: {
        roles: { CIO: 5, CTO: 3, 'Operations Director': 8, Other: 4 },
        org_sizes: {},
        profit_models: {},
        tech_vs_nontech: { technical: 8, non_technical: 8, other: 4 },
        other_roles: { total: 4, categories: { 'Technical Specialist': 4 } },
      },
      effect_sizes: {},
      cross_tabs: { by_role: [], by_org_size: [] },
      inferential: {},
    },
    flexible_clean: {
      demographics: {
        roles: {},
        org_sizes: {},
        profit_models: {},
        tech_vs_nontech: { technical: 0, non_technical: 0, other: 0 },
        other_roles: { total: 0, categories: {} },
      },
      effect_sizes: {},
      cross_tabs: { by_role: [], by_org_size: [] },
      inferential: {},
    },
    prolific_accepted: {
      demographics: {
        roles: {},
        org_sizes: {},
        profit_models: {},
        tech_vs_nontech: { technical: 0, non_technical: 0, other: 0 },
        other_roles: { total: 0, categories: {} },
      },
      effect_sizes: {},
      cross_tabs: { by_role: [], by_org_size: [] },
      inferential: {},
    },
    v2_finished: {
      demographics: {
        roles: {},
        org_sizes: {},
        profit_models: {},
        tech_vs_nontech: { technical: 0, non_technical: 0, other: 0 },
        other_roles: { total: 0, categories: {} },
      },
      effect_sizes: {},
      cross_tabs: { by_role: [], by_org_size: [] },
      inferential: {},
    },
    v2_all: {
      demographics: {
        roles: {},
        org_sizes: {},
        profit_models: {},
        tech_vs_nontech: { technical: 0, non_technical: 0, other: 0 },
        other_roles: { total: 0, categories: {} },
      },
      effect_sizes: {},
      cross_tabs: { by_role: [], by_org_size: [] },
      inferential: {},
    },
  },
  role_categories: [
    {
      label: 'C-Suite Adjacent',
      description: 'Chief-level titles not in the standard 9 C-suite options',
      examples: 'CDO, CPO, CAO',
    },
    {
      label: 'Technical Specialist',
      description: 'Individual contributor or specialist technical roles',
      examples: 'Engineer, Architect, Analyst',
    },
    {
      label: 'Uncategorized',
      description: 'Responses that did not match any keyword pattern, or blank entries',
      examples: '',
    },
  ],
  // filter_bias_analysis: mix of ok:true and ok:false to exercise both rendering paths
  filter_bias_analysis: {
    role: { ok: true, chi2: 1.23, p_value: 0.54, df: 6, error: null },
    organization_size: { ok: true, chi2: 4.56, p_value: 0.03, df: 15, error: null },
    profit_model: { ok: false, chi2: null, p_value: null, df: null, error: 'degenerate table' },
    profit_model_distribution: {
      labels: ['For-Profit', 'Non-Profit', 'Government/Public Sector'],
      groups: {
        'Conservative Clean': {
          'For-Profit': 50,
          'Non-Profit': 15,
          'Government/Public Sector': 12,
        },
        'Flexible Clean': { 'For-Profit': 80, 'Non-Profit': 22, 'Government/Public Sector': 16 },
        'Prolific Accepted': {
          'For-Profit': 140,
          'Non-Profit': 38,
          'Government/Public Sector': 30,
        },
        'All V2 Finished': { 'For-Profit': 220, 'Non-Profit': 65, 'Government/Public Sector': 47 },
      },
    },
  },
  top3_pick_counts: {
    total_n: 10,
    items_sorted_desc: [
      { item: 'B1', text: 'Barrier one text', count: 9, pct: 90.0 },
      { item: 'B2', text: 'Barrier two text', count: 7, pct: 70.0 },
      { item: 'B3', text: 'Barrier three text', count: 6, pct: 60.0 },
      { item: 'B4', text: 'Barrier four text', count: 4, pct: 40.0 },
      { item: 'B5', text: 'Barrier five text', count: 2, pct: 20.0 },
      { item: 'B6', text: 'Barrier six text', count: 0, pct: 0.0 },
      { item: 'B7', text: 'Barrier seven text', count: 0, pct: 0.0 },
      { item: 'B8', text: 'Barrier eight text', count: 0, pct: 0.0 },
      { item: 'B9', text: 'Barrier nine text', count: 0, pct: 0.0 },
      { item: 'B10', text: 'Barrier ten text', count: 0, pct: 0.0 },
      { item: 'B11', text: 'Barrier eleven text', count: 0, pct: 0.0 },
      { item: 'B12', text: 'Barrier twelve text', count: 0, pct: 0.0 },
      { item: 'B13', text: 'Barrier thirteen text', count: 0, pct: 0.0 },
      { item: 'B14', text: 'Barrier fourteen text', count: 0, pct: 0.0 },
      { item: 'B15', text: 'Barrier fifteen text', count: 0, pct: 0.0 },
      { item: 'B16', text: 'Barrier sixteen text', count: 0, pct: 0.0 },
      { item: 'B17', text: 'Barrier seventeen text', count: 0, pct: 0.0 },
      { item: 'B18', text: 'Barrier eighteen text', count: 0, pct: 0.0 },
    ],
  },
  // sum of counts above: 9+7+6+4+2 = 28, which is < total_n * 3 = 30 (two missed picks)
  // item_descriptives is required for dataAvailable = true in top-barriers pages
  item_descriptives: {
    barriers: Array.from({ length: 18 }, (_, i) => ({
      item: `B${i + 1}`,
      text: `Barrier ${i + 1} text`,
      mean: 3.0 - i * 0.1,
      sd: 0.8,
      n: 10,
    })),
  },
}

const MOCK_DISPOSITION_DATA = {
  last_updated: '2026-04-04T09:00:00Z',
  actions: { approved: 208, returned: 10, rejected: 5 },
  dispositionByStatus: {},
  dispositionCounts: {},
}

jest.mock('@/data/sensitivity-analysis.json', () => MOCK_SENSITIVITY_DATA)
jest.mock('@/data/disposition-summary.json', () => MOCK_DISPOSITION_DATA)
jest.mock('@/data/data-audit.json', () => ({
  last_updated: '2026-04-04T09:00:00Z',
  dispositionCounts: {},
  dispositionByStatus: {},
}))
jest.mock('@/data/crp-sensitivity-analysis.json', () => ({
  ...MOCK_SENSITIVITY_DATA,
  samples: [
    { key: 'conservative_clean', label: 'Conservative Clean', description: 'test', n: 78 },
    { key: 'flexible_clean', label: 'Flexible Clean', description: 'test', n: 123 },
    { key: 'prolific_accepted', label: 'CRP Sample', description: 'test', n: 200 },
  ],
}))

// Mock EffectSizeChart so we can inspect the data props it receives.
jest.mock('@/components/effect-size-chart', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

/* ── Tests ─────────────────────────────────────────────────── */

describe('Results Overview', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/page')
    render(<Page />)
    // The redesigned landing contains multiple headings whose text matches
    // /results/i (the h1 "Results" plus the h3 "Live Results" inside the
    // Two-result-tracks split-path card). Narrow to the h1 to stay specific.
    expect(screen.getByRole('heading', { level: 1, name: /^results$/i })).toBeInTheDocument()
  })
})

describe('Sensitivity Analysis Page', () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue('/results/sensitivity')
  })
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/sensitivity/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /sensitivity analysis/i })).toBeInTheDocument()
  })
})

describe('Descriptive Statistics Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/descriptive/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /descriptive statistics/i })).toBeInTheDocument()
  })
})

describe('Key Findings Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/findings/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /key findings/i })).toBeInTheDocument()
  })

  it('renders inferential statistics section', async () => {
    const { default: Page } = await import('@/app/results/findings/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /inferential statistics/i })).toBeInTheDocument()
  })
})

describe('Sample & Demographics Page', () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue('/results/sample')
  })
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/sample/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /sample & demographics/i })).toBeInTheDocument()
  })

  it('renders Technical vs. Non-Technical Breakdown panel when tech_vs_nontech data is present', async () => {
    const { default: Page } = await import('@/app/results/sample/page')
    render(<Page />)
    // The conservative_clean group has non-zero roles (hasDemoData=true) and tech_vs_nontech defined
    expect(screen.getByText(/technical vs\. non-technical breakdown/i)).toBeInTheDocument()
  })

  it('renders Other Role Categories panel when other_roles data is present', async () => {
    const { default: Page } = await import('@/app/results/sample/page')
    render(<Page />)
    // The conservative_clean group has other_roles.total=4 and categories set.
    // The methodology block (now enabled for the live variant) also contains
    // "Other Role Categories", so we expect at least one match.
    expect(screen.getAllByText(/other.*role categories/i).length).toBeGreaterThan(0)
  })

  it('renders Understanding Other Roles methodology section from role_categories data', async () => {
    const { default: Page } = await import('@/app/results/sample/page')
    render(<Page />)
    expect(
      screen.getByRole('heading', { name: /understanding.*other.*roles/i })
    ).toBeInTheDocument()
    // Category labels from mock role_categories should appear in the methodology table
    expect(screen.getByText('C-Suite Adjacent')).toBeInTheDocument()
    // Technical Specialist appears in both the demo panel and methodology table
    expect(screen.getAllByText('Technical Specialist').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Uncategorized')).toBeInTheDocument()
  })

  it('renders empty-state row when role_categories is absent from JSON', async () => {
    // roleCategories is derived inside the component, so temporarily removing it
    // from the shared mock object is sufficient - no module re-load required.
    const saved = MOCK_SENSITIVITY_DATA.role_categories
    ;(MOCK_SENSITIVITY_DATA as Record<string, unknown>).role_categories = undefined
    try {
      const { default: Page } = await import('@/app/results/sample/page')
      render(<Page />)
      expect(
        screen.getByText(/role-category methodology details are not available/i)
      ).toBeInTheDocument()
    } finally {
      ;(MOCK_SENSITIVITY_DATA as Record<string, unknown>).role_categories = saved
    }
  })
})

describe('Dataset Comparison Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/dataset-comparison/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /dataset comparison/i })).toBeInTheDocument()
  })

  it('renders sample overview table', async () => {
    const { default: Page } = await import('@/app/results/dataset-comparison/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /sample overview/i })).toBeInTheDocument()
  })

  it('renders core metrics comparison', async () => {
    const { default: Page } = await import('@/app/results/dataset-comparison/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /core metrics comparison/i })).toBeInTheDocument()
  })

  it('renders Filter Bias Analysis heading and chi-square rows without crashing', async () => {
    const { default: Page } = await import('@/app/results/dataset-comparison/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /filter bias analysis/i })).toBeInTheDocument()
    // All three demographic category rows are present
    expect(screen.getByText(/role \(tech vs non-tech\)/i)).toBeInTheDocument()
    // "Organization Size" also appears as a section heading; assert at least one match
    expect(screen.getAllByText(/organization size/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/profit model/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders profit model distribution table when data is present', async () => {
    const { default: Page } = await import('@/app/results/dataset-comparison/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /profit model distribution/i })).toBeInTheDocument()
    // Profit-model category labels appear as column headers
    expect(screen.getByText('For-Profit')).toBeInTheDocument()
    expect(screen.getByText('Non-Profit')).toBeInTheDocument()
  })

  it('renders "Unable to compute" for categories with ok:false without crashing', async () => {
    // Mock has profit_model: { ok: false } so "Unable to compute" must appear at least once
    const { default: Page } = await import('@/app/results/dataset-comparison/page')
    render(<Page />)
    expect(screen.getByText(/unable to compute/i)).toBeInTheDocument()
  })
})

describe('Scale Reliability Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/reliability/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /scale reliability/i })).toBeInTheDocument()
  })
})

describe('CRP 2026 Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /TABS 2026 CRP Results/i })).toBeInTheDocument()
  })

  it('renders download section', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /download the dataset/i })).toBeInTheDocument()
  })
})

describe('CRP 2026 Descriptive Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/descriptive/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /CRP 2026.*Descriptive/i })).toBeInTheDocument()
  })
})

describe('CRP 2026 Reliability Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/reliability/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /CRP 2026.*Reliability/i })).toBeInTheDocument()
  })
})

describe('CRP 2026 Sensitivity Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/sensitivity/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /CRP 2026.*Sensitivity/i })).toBeInTheDocument()
  })
})

describe('CRP 2026 Findings Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/findings/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /CRP 2026.*Findings/i })).toBeInTheDocument()
  })

  it('maps d_ci_lower/d_ci_upper from JSON to ci_lower/ci_upper for EffectSizeChart', async () => {
    type ChartEntry = { construct: string; ci_lower: number | null; ci_upper: number | null }
    const MockChart = jest.requireMock('@/components/effect-size-chart').default as jest.Mock<
      null,
      [{ data: ChartEntry[] }]
    >
    MockChart.mockClear()

    const sampleDetail = MOCK_SENSITIVITY_DATA.sample_details.conservative_clean
    const savedEffects = (sampleDetail as Record<string, unknown>).effect_sizes
    ;(sampleDetail as Record<string, unknown>).effect_sizes = {
      tech_vs_nontech: {
        tech_n: 10,
        nontech_n: 8,
        constructs: {
          barriers: {
            d: 0.85,
            d_ci_lower: 0.6,
            d_ci_upper: 1.1,
            tech_mean: 3.5,
            nontech_mean: 2.8,
          },
        },
      },
    }

    try {
      const { default: Page } = await import('@/app/results/crp-2026/findings/page')
      render(<Page />)

      expect(MockChart).toHaveBeenCalled()
      const renderedItems = MockChart.mock.calls.flatMap(([props]) => props.data)
      const barriersEntry = renderedItems.find((e) => e.construct === 'barriers')
      expect(barriersEntry).toBeDefined()
      expect(barriersEntry?.ci_lower).toBe(0.6)
      expect(barriersEntry?.ci_upper).toBe(1.1)
    } finally {
      ;(sampleDetail as Record<string, unknown>).effect_sizes = savedEffects
    }
  })
})

describe('CRP 2026 Sample Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/sample/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /CRP 2026.*Sample/i })).toBeInTheDocument()
  })
})

describe('CRP 2026 Data Quality Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/data-quality/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /CRP 2026.*Data Quality/i })).toBeInTheDocument()
  })
})

describe('CRP 2026 Factor Analysis Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/factor-analysis/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /Barrier Factor Structure/i })).toBeInTheDocument()
  })
})

describe('Statistics Glossary Page (shared)', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/glossary/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /Statistics Glossary/i })).toBeInTheDocument()
  })

  it('renders at least one glossary entry', async () => {
    const { default: Page } = await import('@/app/results/glossary/page')
    render(<Page />)
    expect(screen.getAllByText(/Cronbach/i).length).toBeGreaterThan(0)
  })
})

describe('Full Dataset Factor Analysis Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/factor-analysis/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /Barrier Factor Structure/i })).toBeInTheDocument()
  })
})

describe('Full Dataset Validation Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/validation/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /Instrument Validation/i })).toBeInTheDocument()
  })
})

describe('CRP 2026 Validation Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/validation/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /Instrument Validation/i })).toBeInTheDocument()
  })

  it('renders a summary table', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/validation/page')
    render(<Page />)
    expect(screen.getAllByRole('table').length).toBeGreaterThan(0)
  })
})

describe('Live Top 3 Barriers — Picks chip and callout', () => {
  it('shows observed pick total and callout when picks < 3×N (sub-max case)', async () => {
    // Default mock has sum=28, total_n=10; allPicksUsed = false.
    const { default: Page } = await import('@/app/results/top-barriers/page')
    render(<Page />)
    // Chip element renders and contains the observed total
    const chip = screen.getByText(/^Picks:/)
    expect(chip).toBeInTheDocument()
    expect(chip).toHaveTextContent('28')
    // No max-picks annotation in the chip
    expect(chip).not.toHaveTextContent('= 3 ×')
    // "How to read" callout is visible
    expect(screen.getByText(/How to read these counts/i)).toBeInTheDocument()
  })
})

describe('CRP Top 3 Barriers — Picks chip and callout', () => {
  it('shows observed pick total and callout when picks < 3×N (sub-max case)', async () => {
    // CRP mock inherits top3_pick_counts from MOCK_SENSITIVITY_DATA: sum=28, total_n=10.
    const { default: Page } = await import('@/app/results/crp-2026/top-barriers/page')
    render(<Page />)
    const chip = screen.getByText(/^Picks:/)
    expect(chip).toBeInTheDocument()
    expect(chip).toHaveTextContent('28')
    expect(chip).not.toHaveTextContent('= 3 ×')
    expect(screen.getByText(/How to read these counts/i)).toBeInTheDocument()
  })
})
