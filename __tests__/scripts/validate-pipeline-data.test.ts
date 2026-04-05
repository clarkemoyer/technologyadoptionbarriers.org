/**
 * Tests for scripts/validate-pipeline-data.ts
 *
 * Tests the exported Zod schema validation functions directly with
 * inline fixture data, verifying that:
 *   - valid data passes
 *   - malformed data fails with appropriate error messages
 */

import {
  validateDispositionSummary,
  validateSensitivityAnalysis,
  validateDataAudit,
} from '../../scripts/validate-pipeline-data'

// ── Shared fixtures ───────────────────────────────────────────────────────────

const VALID_DISPOSITION_SUMMARY = {
  updatedAt: '2026-04-05T11:12:32.183868+00:00',
  study: {
    id: 'abc123',
    name: 'Technology Adoption Barriers Survey (2026)',
    status: 'ACTIVE',
    totalAvailablePlaces: 500,
    placesTaken: 246,
    averageRewardPerHour: 3919.05,
    averageTimeTaken: 10,
    reward: 700,
    publishedAt: '2026-03-23T18:00:28.650000Z',
  },
  completionProgress: {
    target: 500,
    completed: 246,
    approved: 209,
    awaitingReview: 37,
    percentComplete: 49.2,
  },
  dispositions: {
    INCOMPLETE: 61,
    CLEAN: 93,
    'FLAG-SMEAL': 43,
  },
  actions: {
    approved: 209,
    rejected: 29,
    returned: 133,
    timedOut: 6,
    awaitingReview: 37,
  },
  iriPassRates: {
    barrier: 58.1,
    readiness: 71.1,
    maturity: 80.8,
  },
}

const VALID_SENSITIVITY_ANALYSIS = {
  samples: [
    {
      key: 'conservative_clean',
      label: 'Conservative Clean',
      description: 'Prolific APPROVED + all quality checks',
      n: 77,
    },
    {
      key: 'flexible_clean',
      label: 'Flexible Clean',
      description: 'Prolific APPROVED + basic quality',
      n: 118,
    },
  ],
  metrics: [
    {
      key: 'barrier_mean',
      label: 'Barrier Grand Mean',
      values: {
        conservative_clean: 2.8033,
        flexible_clean: 2.7881,
      },
    },
  ],
}

const VALID_DATA_AUDIT = {
  disposition_counts: {
    INCOMPLETE: 61,
    CLEAN: 93,
    'FLAG-SMEAL': 43,
  },
  iri_pass_rates: {
    barrier: 0.495,
    readiness: 0.605,
    maturity: 0.685,
  },
  waterfall_steps: [
    { step: 0, name: 'INCOMPLETE', count: 61, cumulative_excluded: 61 },
    { step: 1, name: 'FLAG-AUTH-FAIL', count: 0, cumulative_excluded: 61 },
  ],
  sample_sizes: {
    total: 400,
    complete: 339,
    clean: 93,
  },
}

// ── validateDispositionSummary ────────────────────────────────────────────────

describe('validateDispositionSummary', () => {
  it('passes for valid data', () => {
    const result = validateDispositionSummary(VALID_DISPOSITION_SUMMARY)
    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.file).toBe('disposition-summary.json')
  })

  it('passes when completionProgress.approved is absent (optional with default 0)', () => {
    const { completionProgress, ...rest } = VALID_DISPOSITION_SUMMARY
    const { approved: _, ...progressWithoutApproved } = completionProgress
    const data = { ...rest, completionProgress: progressWithoutApproved }
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when updatedAt is missing', () => {
    const { updatedAt: _, ...data } = VALID_DISPOSITION_SUMMARY
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('updatedAt'))).toBe(true)
  })

  it('fails when study is missing', () => {
    const { study: _, ...data } = VALID_DISPOSITION_SUMMARY
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('study'))).toBe(true)
  })

  it('fails when completionProgress is missing', () => {
    const { completionProgress: _, ...data } = VALID_DISPOSITION_SUMMARY
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('completionProgress'))).toBe(true)
  })

  it('fails when dispositions is missing', () => {
    const { dispositions: _, ...data } = VALID_DISPOSITION_SUMMARY
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('dispositions'))).toBe(true)
  })

  it('fails when actions is missing', () => {
    const { actions: _, ...data } = VALID_DISPOSITION_SUMMARY
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('actions'))).toBe(true)
  })

  it('fails when iriPassRates is missing', () => {
    const { iriPassRates: _, ...data } = VALID_DISPOSITION_SUMMARY
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('iriPassRates'))).toBe(true)
  })

  it('fails when completionProgress.target is not a positive integer', () => {
    const data = {
      ...VALID_DISPOSITION_SUMMARY,
      completionProgress: { ...VALID_DISPOSITION_SUMMARY.completionProgress, target: 0 },
    }
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
  })

  it('fails when iriPassRates values are outside 0–100 range', () => {
    const data = {
      ...VALID_DISPOSITION_SUMMARY,
      iriPassRates: { barrier: 101, readiness: 71.1, maturity: 80.8 },
    }
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
  })

  it('fails when dispositions values are not non-negative integers', () => {
    const data = {
      ...VALID_DISPOSITION_SUMMARY,
      dispositions: { CLEAN: -1 },
    }
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
  })

  it('fails when study.id is empty string', () => {
    const data = {
      ...VALID_DISPOSITION_SUMMARY,
      study: { ...VALID_DISPOSITION_SUMMARY.study, id: '' },
    }
    const result = validateDispositionSummary(data)
    expect(result.ok).toBe(false)
  })

  it('fails for non-object input and uses (root) label in error', () => {
    const result = validateDispositionSummary(null)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('(root)'))).toBe(true)
  })

  it('fails for string input', () => {
    expect(validateDispositionSummary('string').ok).toBe(false)
  })

  it('fails for numeric input', () => {
    expect(validateDispositionSummary(42).ok).toBe(false)
  })
})

// ── validateSensitivityAnalysis ───────────────────────────────────────────────

describe('validateSensitivityAnalysis', () => {
  it('passes for valid data', () => {
    const result = validateSensitivityAnalysis(VALID_SENSITIVITY_ANALYSIS)
    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.file).toBe('sensitivity-analysis.json')
  })

  it('fails when samples is missing', () => {
    const { samples: _, ...data } = VALID_SENSITIVITY_ANALYSIS
    const result = validateSensitivityAnalysis(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('samples'))).toBe(true)
  })

  it('fails when metrics is missing', () => {
    const { metrics: _, ...data } = VALID_SENSITIVITY_ANALYSIS
    const result = validateSensitivityAnalysis(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('metrics'))).toBe(true)
  })

  it('fails when samples is empty array', () => {
    const data = { ...VALID_SENSITIVITY_ANALYSIS, samples: [] }
    const result = validateSensitivityAnalysis(data)
    expect(result.ok).toBe(false)
  })

  it('fails when metrics is empty array', () => {
    const data = { ...VALID_SENSITIVITY_ANALYSIS, metrics: [] }
    const result = validateSensitivityAnalysis(data)
    expect(result.ok).toBe(false)
  })

  it('fails when a sample is missing required key field', () => {
    const data = {
      ...VALID_SENSITIVITY_ANALYSIS,
      samples: [{ label: 'No key', description: 'desc', n: 10 }],
    }
    const result = validateSensitivityAnalysis(data)
    expect(result.ok).toBe(false)
  })

  it('fails when sample n is negative', () => {
    const data = {
      ...VALID_SENSITIVITY_ANALYSIS,
      samples: [{ ...VALID_SENSITIVITY_ANALYSIS.samples[0], n: -5 }],
    }
    const result = validateSensitivityAnalysis(data)
    expect(result.ok).toBe(false)
  })

  it('fails when a metric is missing values', () => {
    const data = {
      ...VALID_SENSITIVITY_ANALYSIS,
      metrics: [{ key: 'barrier_mean', label: 'Barrier Mean' }],
    }
    const result = validateSensitivityAnalysis(data)
    expect(result.ok).toBe(false)
  })

  it('fails for non-object input and uses (root) label in error', () => {
    const result = validateSensitivityAnalysis(null)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('(root)'))).toBe(true)
  })

  it('fails for array input', () => {
    expect(validateSensitivityAnalysis([]).ok).toBe(false)
  })
})

// ── validateDataAudit ─────────────────────────────────────────────────────────

describe('validateDataAudit', () => {
  it('passes for valid data', () => {
    const result = validateDataAudit(VALID_DATA_AUDIT)
    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.file).toBe('data-audit.json')
  })

  it('fails when disposition_counts is missing', () => {
    const { disposition_counts: _, ...data } = VALID_DATA_AUDIT
    const result = validateDataAudit(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('disposition_counts'))).toBe(true)
  })

  it('fails when iri_pass_rates is missing', () => {
    const { iri_pass_rates: _, ...data } = VALID_DATA_AUDIT
    const result = validateDataAudit(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('iri_pass_rates'))).toBe(true)
  })

  it('fails when waterfall_steps is missing', () => {
    const { waterfall_steps: _, ...data } = VALID_DATA_AUDIT
    const result = validateDataAudit(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('waterfall_steps'))).toBe(true)
  })

  it('fails when sample_sizes is missing', () => {
    const { sample_sizes: _, ...data } = VALID_DATA_AUDIT
    const result = validateDataAudit(data)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('sample_sizes'))).toBe(true)
  })

  it('fails when waterfall_steps is empty', () => {
    const data = { ...VALID_DATA_AUDIT, waterfall_steps: [] }
    const result = validateDataAudit(data)
    expect(result.ok).toBe(false)
  })

  it('fails when iri_pass_rates.barrier is out of [0,1] range', () => {
    const data = {
      ...VALID_DATA_AUDIT,
      iri_pass_rates: { ...VALID_DATA_AUDIT.iri_pass_rates, barrier: 1.5 },
    }
    const result = validateDataAudit(data)
    expect(result.ok).toBe(false)
  })

  it('fails when a waterfall step is missing required fields', () => {
    const data = {
      ...VALID_DATA_AUDIT,
      waterfall_steps: [{ step: 0, name: 'INCOMPLETE' }], // missing count and cumulative_excluded
    }
    const result = validateDataAudit(data)
    expect(result.ok).toBe(false)
  })

  it('fails when disposition_counts has negative values', () => {
    const data = {
      ...VALID_DATA_AUDIT,
      disposition_counts: { CLEAN: -5 },
    }
    const result = validateDataAudit(data)
    expect(result.ok).toBe(false)
  })

  it('fails for non-object input and uses (root) label in error', () => {
    const result = validateDataAudit(null)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('(root)'))).toBe(true)
  })

  it('fails for string input', () => {
    expect(validateDataAudit('invalid').ok).toBe(false)
  })
})
