/**
 * Unit tests for PipelineDataFlow variant-based href rewriting.
 *
 * The DataQualityContent tests mock PipelineDataFlow, so the hasCrpTwin
 * href rewriting never runs during that suite. These tests render the
 * component directly so the variant → href transformation is actually
 * exercised.
 *
 * Stages with hasCrpTwin: true are 4, 6, 7, 8, 9.
 * Stages without hasCrpTwin (1, 2, 3, 5, 10) must never be rewritten.
 * Stage 11 is external and stays unchanged in all variants.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PipelineDataFlow } from '@/components/results/data-quality/PipelineDataFlow'

/** Return the closest <a> ancestor of the h3 whose text matches `title`. */
function stageLink(title: string): HTMLElement {
  const h3 = screen.getByRole('heading', { name: title, level: 3 })
  const link = h3.closest('a')
  if (!link) throw new Error(`No <a> ancestor found for stage heading "${title}"`)
  return link as HTMLElement
}

/* ── live variant (default) ─────────────────────────────────────────────── */

describe('PipelineDataFlow — live variant', () => {
  beforeEach(() => {
    render(<PipelineDataFlow variant="live" />)
  })

  it('stage 4 links to /results/data-quality', () => {
    expect(stageLink('Disposition Audit')).toHaveAttribute('href', '/results/data-quality')
  })

  it('stage 6 links to /results/descriptive', () => {
    expect(stageLink('Descriptive Analysis')).toHaveAttribute('href', '/results/descriptive')
  })

  it('stage 7 links to /results/findings', () => {
    expect(stageLink('Advanced Analysis')).toHaveAttribute('href', '/results/findings')
  })

  it('stage 8 links to /results/validation', () => {
    expect(stageLink('Psychometrics / Validation')).toHaveAttribute('href', '/results/validation')
  })

  it('stage 9 links to /results/validation', () => {
    expect(stageLink('Quality Audit')).toHaveAttribute('href', '/results/validation')
  })

  it('stage 5 (no hasCrpTwin) links to /results/reproducibility', () => {
    expect(stageLink('De-identify Public Dataset')).toHaveAttribute(
      'href',
      '/results/reproducibility'
    )
  })
})

/* ── crp variant — hasCrpTwin stages rewritten ──────────────────────────── */

describe('PipelineDataFlow — crp variant', () => {
  beforeEach(() => {
    render(<PipelineDataFlow variant="crp" />)
  })

  it('stage 4 href rewritten to /results/crp-2026/data-quality', () => {
    expect(stageLink('Disposition Audit')).toHaveAttribute('href', '/results/crp-2026/data-quality')
  })

  it('stage 6 href rewritten to /results/crp-2026/descriptive', () => {
    expect(stageLink('Descriptive Analysis')).toHaveAttribute(
      'href',
      '/results/crp-2026/descriptive'
    )
  })

  it('stage 7 href rewritten to /results/crp-2026/findings', () => {
    expect(stageLink('Advanced Analysis')).toHaveAttribute('href', '/results/crp-2026/findings')
  })

  it('stage 8 href rewritten to /results/crp-2026/validation', () => {
    expect(stageLink('Psychometrics / Validation')).toHaveAttribute(
      'href',
      '/results/crp-2026/validation'
    )
  })

  it('stage 9 href rewritten to /results/crp-2026/validation', () => {
    expect(stageLink('Quality Audit')).toHaveAttribute('href', '/results/crp-2026/validation')
  })

  it('stage 5 (no hasCrpTwin) stays at /results/reproducibility', () => {
    expect(stageLink('De-identify Public Dataset')).toHaveAttribute(
      'href',
      '/results/reproducibility'
    )
  })

  it('stage 1 (no hasCrpTwin) stays at /results/dashboard', () => {
    expect(stageLink('Fetch Prolific Data')).toHaveAttribute('href', '/results/dashboard')
  })

  it('stage 2 (no hasCrpTwin) stays at /results/survey-stats', () => {
    expect(stageLink('Export Qualtrics CSV')).toHaveAttribute('href', '/results/survey-stats')
  })
})

/* ── default variant falls back to live ─────────────────────────────────── */

describe('PipelineDataFlow — default (no variant prop)', () => {
  it('uses live hrefs when no variant is supplied', () => {
    render(<PipelineDataFlow />)
    expect(stageLink('Disposition Audit')).toHaveAttribute('href', '/results/data-quality')
    expect(stageLink('Descriptive Analysis')).toHaveAttribute('href', '/results/descriptive')
  })
})
