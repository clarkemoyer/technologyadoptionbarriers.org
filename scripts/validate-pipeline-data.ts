/**
 * Validate pipeline data files in src/data/ against JSON schemas.
 *
 * Files validated:
 *   - src/data/disposition-summary.json
 *   - src/data/sensitivity-analysis.json
 *   - src/data/data-audit.json
 *
 * Usage:
 *   npx tsx scripts/validate-pipeline-data.ts
 *   npx tsx scripts/validate-pipeline-data.ts --file disposition-summary
 *
 * Exit codes:
 *   0 – all validations passed
 *   1 – one or more validations failed
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

// ── Schemas ──────────────────────────────────────────────────────────────────

export const DispositionSummarySchema = z.object({
  updatedAt: z.string().min(1),
  study: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    status: z.string().min(1),
    totalAvailablePlaces: z.number().int().nonnegative(),
    placesTaken: z.number().int().nonnegative(),
    averageRewardPerHour: z.number().nonnegative(),
    averageTimeTaken: z.number().nonnegative(),
    reward: z.number().nonnegative(),
    publishedAt: z.string().min(1),
  }),
  completionProgress: z.object({
    target: z.number().int().positive(),
    completed: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    awaitingReview: z.number().int().nonnegative(),
    percentComplete: z.number().nonnegative(),
  }),
  dispositions: z.record(z.string(), z.number().int().nonnegative()),
  actions: z.object({
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
    returned: z.number().int().nonnegative(),
    timedOut: z.number().int().nonnegative(),
    awaitingReview: z.number().int().nonnegative(),
  }),
  iriPassRates: z.object({
    barrier: z.number().nonnegative(),
    readiness: z.number().nonnegative(),
    maturity: z.number().nonnegative(),
  }),
})

export type DispositionSummary = z.infer<typeof DispositionSummarySchema>

export const SensitivityAnalysisSchema = z.object({
  samples: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        description: z.string(),
        n: z.number().int().nonnegative(),
      })
    )
    .min(1),
  metrics: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        values: z.record(z.string(), z.number()),
      })
    )
    .min(1),
})

export type SensitivityAnalysis = z.infer<typeof SensitivityAnalysisSchema>

export const WaterfallStepSchema = z.object({
  step: z.number().int().nonnegative(),
  name: z.string().min(1),
  count: z.number().int().nonnegative(),
  cumulative_excluded: z.number().int().nonnegative(),
})

export const DataAuditSchema = z.object({
  disposition_counts: z.record(z.string(), z.number().int().nonnegative()),
  iri_pass_rates: z.object({
    barrier: z.number().min(0).max(1),
    readiness: z.number().min(0).max(1),
    maturity: z.number().min(0).max(1),
  }),
  waterfall_steps: z.array(WaterfallStepSchema).min(1),
  sample_sizes: z.object({
    total: z.number().int().nonnegative(),
    complete: z.number().int().nonnegative(),
    clean: z.number().int().nonnegative(),
  }),
})

export type DataAudit = z.infer<typeof DataAuditSchema>

// ── Validation helpers ────────────────────────────────────────────────────────

function loadJson(filePath: string): unknown {
  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

export interface ValidationResult {
  file: string
  ok: boolean
  errors: string[]
}

export function validateDispositionSummary(data: unknown): ValidationResult {
  const result = DispositionSummarySchema.safeParse(data)
  if (result.success) {
    return { file: 'disposition-summary.json', ok: true, errors: [] }
  }
  return {
    file: 'disposition-summary.json',
    ok: false,
    errors: result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`),
  }
}

export function validateSensitivityAnalysis(data: unknown): ValidationResult {
  const result = SensitivityAnalysisSchema.safeParse(data)
  if (result.success) {
    return { file: 'sensitivity-analysis.json', ok: true, errors: [] }
  }
  return {
    file: 'sensitivity-analysis.json',
    ok: false,
    errors: result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`),
  }
}

export function validateDataAudit(data: unknown): ValidationResult {
  const result = DataAuditSchema.safeParse(data)
  if (result.success) {
    return { file: 'data-audit.json', ok: true, errors: [] }
  }
  return {
    file: 'data-audit.json',
    ok: false,
    errors: result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`),
  }
}

// ── Main entry point ──────────────────────────────────────────────────────────

function main(): void {
  const dataDir = join(__dirname, '..', 'src', 'data')

  const fileArg = process.argv.find((a) => a.startsWith('--file='))
  const fileFilter = fileArg ? fileArg.replace('--file=', '') : null

  const tasks: Array<{ name: string; schema: (d: unknown) => ValidationResult }> = [
    { name: 'disposition-summary', schema: validateDispositionSummary },
    { name: 'sensitivity-analysis', schema: validateSensitivityAnalysis },
    { name: 'data-audit', schema: validateDataAudit },
  ].filter((t) => !fileFilter || t.name === fileFilter)

  if (tasks.length === 0) {
    console.error(`Unknown file filter: ${fileFilter}`)
    process.exit(1)
  }

  let allPassed = true

  for (const task of tasks) {
    const filePath = join(dataDir, `${task.name}.json`)
    let data: unknown
    try {
      data = loadJson(filePath)
    } catch (err) {
      console.error(`✗ ${task.name}.json — could not read/parse: ${(err as Error).message}`)
      allPassed = false
      continue
    }

    const result = task.schema(data)
    if (result.ok) {
      console.log(`✓ ${result.file}`)
    } else {
      console.error(`✗ ${result.file} — ${result.errors.length} error(s):`)
      for (const e of result.errors) {
        console.error(e)
      }
      allPassed = false
    }
  }

  if (!allPassed) {
    process.exit(1)
  }
}

// Run only when executed directly (not when imported as a module in tests)
const isDirectRun =
  typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module
if (isDirectRun) {
  main()
}
