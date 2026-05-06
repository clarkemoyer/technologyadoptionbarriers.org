import fs from 'fs'
import path from 'path'
import { z } from 'zod'

// Schema for src/data/disposition-summary.json
export const DispositionSummarySchema = z.object({
  updatedAt: z.string(),
  study: z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
    totalAvailablePlaces: z.number().min(0),
    placesTaken: z.number().min(0),
    averageRewardPerHour: z.number().min(0),
    averageTimeTaken: z.number().min(0),
    reward: z.number().min(0),
    publishedAt: z.string(),
  }),
  completionProgress: z.object({
    target: z.number().min(0),
    completed: z.number().min(0),
    approved: z.number().min(0),
    awaitingReview: z.number().min(0),
    percentComplete: z.number().min(0).max(100),
  }),
  totalResponses: z.number().min(0).optional(),
  uniqueParticipants: z.number().min(0).optional(),
  duplicatesRemoved: z.number().min(0).optional(),
  dispositions: z.record(z.string(), z.number().min(0)),
  dispositionByStatus: z.record(z.string(), z.record(z.string(), z.number().min(0))).optional(),
  autoExcludeBreakdown: z.record(z.string(), z.number().min(0)).optional(),
  actions: z.object({
    approved: z.number().min(0),
    rejected: z.number().min(0),
    returned: z.number().min(0),
    timedOut: z.number().min(0),
    awaitingReview: z.number().min(0),
    active: z.number().min(0),
    messaged: z.number().min(0),
  }),
  iriPassRates: z.object({
    barrier: z.number().min(0).max(100),
    readiness: z.number().min(0).max(100),
    maturity: z.number().min(0).max(100),
    denominator: z.number().min(0),
  }),
  studyId: z.string().optional(),
  studyName: z.string().optional(),
})

// Schema for src/data/sensitivity-analysis.json
export const SensitivityAnalysisSchema = z
  .object({
    samples: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        description: z.string(),
        n: z.number().min(0),
      })
    ),
    metrics: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        values: z.record(z.string(), z.number()),
      })
    ),
  })
  .passthrough()

// Schema for src/data/data-audit.json
export const DataAuditSchema = z.object({
  disposition_counts: z.record(z.string(), z.number().min(0)).optional(),
  iri_pass_rates: z.record(z.string(), z.number().min(0).max(1)).optional(),
  duration_stats: z.record(z.string(), z.number().min(0)).optional(),
  straightlining_stats: z.record(z.string(), z.number().min(0)).optional(),
  sample_sizes: z.record(z.string(), z.number().min(0)).optional(),
  waterfall_steps: z.array(
    z.object({
      step: z.number().min(0),
      name: z.string(),
      count: z.number().min(0),
      cumulative_excluded: z.number().min(0),
    })
  ),
})

// Main validation function
export function validateDataFiles(dataDir: string) {
  let hasErrors = false

  const filesToValidate = [
    {
      filename: 'disposition-summary.json',
      schema: DispositionSummarySchema,
    },
    {
      filename: 'sensitivity-analysis.json',
      schema: SensitivityAnalysisSchema,
    },
    {
      filename: 'data-audit.json',
      schema: DataAuditSchema,
    },
  ]

  for (const { filename, schema } of filesToValidate) {
    const filePath = path.join(dataDir, filename)

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Validation failed for ${filename}: File not found at ${filePath}`)
      hasErrors = true
      continue
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const jsonData = JSON.parse(fileContent)
      schema.parse(jsonData)
      console.log(`✅ ${filename} passed validation.`)
    } catch (error) {
      hasErrors = true
      console.error(`❌ Validation failed for ${filename}:`)
      if (error instanceof z.ZodError) {
        ;(error as any).errors.forEach((e: any) => {
          console.error(`  - Path [${e.path.join('.')}] : ${e.message}`)
        })
      } else {
        console.error(error)
      }
    }
  }

  return !hasErrors
}

// Run validation when called directly via tsx/node
function main() {
  const dataDir = path.join(process.cwd(), 'src', 'data')
  console.log(`Validating data files in ${dataDir}...`)

  const isValid = validateDataFiles(dataDir)

  if (!isValid) {
    console.error('Data validation failed. Exiting with error.')
    process.exit(1)
  } else {
    console.log('All data files validated successfully.')
    process.exit(0)
  }
}

// ESM-safe entrypoint guard (tsx uses CJS for .ts files; typeof check prevents
// ReferenceError if the module is ever loaded in a pure-ESM context)
if (typeof require !== 'undefined' && require.main === module) {
  main()
}
