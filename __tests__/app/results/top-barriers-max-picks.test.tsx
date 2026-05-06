/**
 * Tests for the "Picks" chip and "How to read these counts" callout
 * in the max-picks scenario (total recorded picks === total_n × 3).
 *
 * These tests live in a separate file so they can declare their own
 * jest.mock() factories with allPicksUsed = true data, without
 * conflicting with the sub-max mock used in results-pages.test.tsx.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

/* ── Mock next/navigation (required by ResultsNav wrapper) ── */
jest.mock('next/navigation', () => ({
  usePathname: () => '/results/top-barriers',
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

/* ── Mock data ─────────────────────────────────────────────── */

// Max-picks scenario: sum of counts = total_n × 3 = 30, so allPicksUsed = true.
const TOTAL_N = 10
const MAX_PICKS_TOP3 = {
  total_n: TOTAL_N,
  items_sorted_desc: [
    { item: 'B1', text: 'Barrier one text', count: TOTAL_N, pct: 100.0 },
    { item: 'B2', text: 'Barrier two text', count: TOTAL_N, pct: 100.0 },
    { item: 'B3', text: 'Barrier three text', count: TOTAL_N, pct: 100.0 },
    ...Array.from({ length: 15 }, (_, i) => ({
      item: `B${i + 4}`,
      text: `Barrier ${i + 4} text`,
      count: 0,
      pct: 0.0,
    })),
  ],
}

const ITEM_DESCRIPTIVES = {
  barriers: Array.from({ length: 18 }, (_, i) => ({
    item: `B${i + 1}`,
    text: `Barrier ${i + 1} text`,
    mean: 3.0 - i * 0.1,
    sd: 0.8,
    n: TOTAL_N,
  })),
}

const BASE_DATA = {
  last_updated: '2026-04-04T09:00:00Z',
  samples: [
    { key: 'conservative_clean', label: 'Conservative Clean', description: 'test', n: 78 },
    { key: 'flexible_clean', label: 'Flexible Clean', description: 'test', n: 123 },
    { key: 'prolific_accepted', label: 'Prolific Accepted', description: 'test', n: 208 },
    { key: 'v2_finished', label: 'All V2 Finished', description: 'test', n: 332 },
    { key: 'v2_all', label: 'All V2', description: 'test', n: 390 },
  ],
  metrics: [],
  top3_pick_counts: MAX_PICKS_TOP3,
  item_descriptives: ITEM_DESCRIPTIVES,
}

jest.mock('@/data/sensitivity-analysis.json', () => BASE_DATA)
jest.mock('@/data/crp-sensitivity-analysis.json', () => ({
  ...BASE_DATA,
  samples: [
    { key: 'conservative_clean', label: 'Conservative Clean', description: 'test', n: 78 },
    { key: 'flexible_clean', label: 'Flexible Clean', description: 'test', n: 123 },
    { key: 'prolific_accepted', label: 'CRP Sample', description: 'test', n: 200 },
  ],
}))
jest.mock('@/data/disposition-summary.json', () => ({
  last_updated: '2026-04-04T09:00:00Z',
  actions: { approved: 208, returned: 10, rejected: 5 },
  dispositionByStatus: {},
  dispositionCounts: {},
}))
jest.mock('@/data/data-audit.json', () => ({
  last_updated: '2026-04-04T09:00:00Z',
  dispositionCounts: {},
  dispositionByStatus: {},
}))
jest.mock('@/components/effect-size-chart', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

/* ── Tests ─────────────────────────────────────────────────── */

describe('Live Top 3 Barriers — Picks chip and callout (max-picks case)', () => {
  it('shows "(= 3 × N)" annotation in chip when total equals 3×N', async () => {
    const { default: Page } = await import('@/app/results/top-barriers/page')
    render(<Page />)
    const chip = screen.getByText(/^Picks:/)
    expect(chip).toHaveTextContent(`(= 3 × ${TOTAL_N})`)
    // The callout's trailing sentence surfaces the max total
    expect(
      screen.getByText(
        new RegExp(`This equals the maximum possible total of 3 × ${TOTAL_N} = ${TOTAL_N * 3}`)
      )
    ).toBeInTheDocument()
  })
})

describe('CRP Top 3 Barriers — Picks chip and callout (max-picks case)', () => {
  it('shows "(= 3 × N)" annotation in chip when total equals 3×N', async () => {
    const { default: Page } = await import('@/app/results/crp-2026/top-barriers/page')
    render(<Page />)
    const chip = screen.getByText(/^Picks:/)
    expect(chip).toHaveTextContent(`(= 3 × ${TOTAL_N})`)
  })
})
