/**
 * Basic render tests for all results pages.
 *
 * These tests verify that each results page renders without errors
 * when given the current (possibly placeholder) JSON data. They do
 * NOT test interactive behavior — only that the component tree mounts.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

/* ── Mock data imports ─────────────────────────────────────── */

const MOCK_SENSITIVITY_DATA = {
  last_updated: '2026-04-04T09:00:00Z',
  samples: [
    { key: 'conservative_clean', label: 'Conservative Clean', description: 'test', n: 77 },
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
        roles: {},
        org_sizes: {},
        profit_models: {},
        tech_vs_nontech: { technical: 0, non_technical: 0, other: 0 },
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
      },
      effect_sizes: {},
      cross_tabs: { by_role: [], by_org_size: [] },
      inferential: {},
    },
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

/* ── Tests ─────────────────────────────────────────────────── */

describe('Results Overview', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /results/i })).toBeInTheDocument()
  })
})

describe('Sensitivity Analysis Page', () => {
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
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/sample/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /sample & demographics/i })).toBeInTheDocument()
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

  it('renders filter bias analysis section', async () => {
    const { default: Page } = await import('@/app/results/dataset-comparison/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /filter bias analysis/i })).toBeInTheDocument()
  })
})

describe('Scale Reliability Page', () => {
  it('renders heading', async () => {
    const { default: Page } = await import('@/app/results/reliability/page')
    render(<Page />)
    expect(screen.getByRole('heading', { name: /scale reliability/i })).toBeInTheDocument()
  })
})
