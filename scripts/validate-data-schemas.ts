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
    totalAvailablePlaces: z.number(),
    placesTaken: z.number(),
    averageRewardPerHour: z.number(),
    averageTimeTaken: z.number(),
    reward: z.number(),
    publishedAt: z.string(),
  }),
  completionProgress: z.object({
    target: z.number(),
    completed: z.number(),
    approved: z.number(),
    awaitingReview: z.number(),
    percentComplete: z.number(),
  }),
  totalResponses: z.number().optional(),
  uniqueParticipants: z.number().optional(),
  duplicatesRemoved: z.number().optional(),
  dispositions: z.record(z.string(), z.number()),
  dispositionByStatus: z.record(z.string(), z.record(z.string(), z.number())).optional(),
  autoExcludeBreakdown: z.record(z.string(), z.number()).optional(),
  actions: z.object({
    approved: z.number(),
    rejected: z.number(),
    returned: z.number(),
    timedOut: z.number(),
    awaitingReview: z.number(),
    active: z.number(),
    messaged: z.number(),
  }),
  iriPassRates: z.object({
    barrier: z.number(),
    readiness: z.number(),
    maturity: z.number(),
    denominator: z.number(),
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
        n: z.number(),
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
  disposition_counts: z.record(z.string(), z.number()).optional(),
  iri_pass_rates: z.record(z.string(), z.number()).optional(),
  duration_stats: z.record(z.string(), z.number()).optional(),
  straightlining_stats: z.record(z.string(), z.number()).optional(),
  sample_sizes: z.record(z.string(), z.number()).optional(),
  waterfall_steps: z.array(
    z.object({
      step: z.number(),
      name: z.string(),
      count: z.number(),
      cumulative_excluded: z.number(),
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
      console.warn(`Warning: File not found: ${filePath}`)
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

// Run validation if called directly
if (require.main === module) {
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
