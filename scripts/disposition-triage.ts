/**
 * TABS V2 Disposition Triage Engine
 *
 * Reads a Qualtrics CSV export, computes a privacy-safe disposition for
 * each response using the IRI / speed / quality waterfall, and writes
 * a disposition CSV with only computed flags and identifiers.
 *
 * Environment variables:
 *   INPUT_PATH   – Path to the raw Qualtrics CSV export (required)
 *   OUTPUT_PATH  – Path to write the disposition CSV (required)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { appendGithubStepSummary } from '../src/lib/github-utils'

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface DispositionRow {
  PROLIFIC_PID: string
  Finished: string
  Duration_Seconds: number
  IRI_Barrier_Pass: 0 | 1
  IRI_Readiness_Pass: 0 | 1
  IRI_Maturity_Pass: 0 | 1
  IRI_Pass_Count: number
  IRI_Fail_Count: number
  Speed_Flag: 0 | 1
  Smeal_Benchmark_Flag: 0 | 1
  reCAPTCHA_Score: number
  reCAPTCHA_Flag: 0 | 1
  Straightlining_Count: number
  Straightlining_Flag: 0 | 1
  Disposition: string
}

/* ------------------------------------------------------------------ */
/*  CSV helpers                                                       */
/* ------------------------------------------------------------------ */

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function colIndex(headers: string[], name: string): number {
  const idx = headers.findIndex((h) => h === name)
  if (idx === -1) throw new Error(`Required column "${name}" not found in CSV headers`)
  return idx
}

/* ------------------------------------------------------------------ */
/*  Disposition waterfall                                             */
/* ------------------------------------------------------------------ */

export function computeDisposition(row: Omit<DispositionRow, 'Disposition'>): string {
  // Step 0: Incomplete
  if (row.Finished !== 'TRUE') return 'INCOMPLETE'

  // Step 1: Auto-exclude (hard fail)
  if (row.IRI_Fail_Count >= 2) return 'AUTO-EXCLUDE'
  if (row.Speed_Flag === 1 && row.IRI_Fail_Count >= 1) return 'AUTO-EXCLUDE'

  // Step 2: Flag speed (fast but IRIs all pass)
  if (row.Speed_Flag === 1 && row.IRI_Fail_Count === 0) return 'FLAG-SPEED'

  // Step 3: Single IRI fail at normal speed
  if (row.IRI_Fail_Count === 1 && row.Speed_Flag === 0) return 'FLAG-SINGLE-IRI'

  // Step 4: Below Smeal benchmark
  if (row.Smeal_Benchmark_Flag === 1) return 'FLAG-SMEAL'

  // Step 5: reCAPTCHA flag
  if (row.reCAPTCHA_Flag === 1) return 'FLAG-RECAPTCHA'

  // Step 6: Straightlining
  if (row.Straightlining_Flag === 1) return 'FLAG-STRAIGHTLINING'

  // Step 7: Clean
  return 'CLEAN'
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

export function triageCsv(inputCsv: string): DispositionRow[] {
  const lines = inputCsv
    .trimEnd()
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')

  if (lines.length < 4) {
    throw new Error('Qualtrics CSV must have 3 header rows + at least 1 data row')
  }

  // Row 1 = column names, rows 2-3 = question text + ImportId (skip)
  const headers = parseCsvLine(lines[0])

  const pidIdx = colIndex(headers, 'PROLIFIC_PID')
  const finishedIdx = colIndex(headers, 'Finished')
  const durationIdx = colIndex(headers, 'Duration (in seconds)')
  const iriBarrierIdx = colIndex(headers, 'Q10-28_Barriers_19')
  const iriReadinessIdx = colIndex(headers, 'Q47-64_Readiness_18')
  const iriMaturityIdx = colIndex(headers, 'Q65-73_Maturity_9')
  const recaptchaIdx = colIndex(headers, 'Q_RecaptchaScore')
  const straightliningIdx = colIndex(headers, 'Q_StraightliningCount')

  const results: DispositionRow[] = []

  // Data starts at row 4 (index 3)
  for (let i = 3; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])

    const pid = fields[pidIdx] ?? ''
    if (!pid) continue // Skip rows without a PID

    const finished = (fields[finishedIdx] ?? '').toUpperCase()
    const duration = parseInt(fields[durationIdx] ?? '0', 10) || 0
    const iriBarrier: 0 | 1 = fields[iriBarrierIdx] === 'Major Barrier' ? 1 : 0
    const iriReadiness: 0 | 1 = fields[iriReadinessIdx] === 'Low Readiness/Capability' ? 1 : 0
    const iriMaturity: 0 | 1 = fields[iriMaturityIdx] === 'Level 2: Developing/Repeatable' ? 1 : 0
    const iriPassCount = iriBarrier + iriReadiness + iriMaturity
    const iriFailCount = 3 - iriPassCount
    const speedFlag: 0 | 1 = duration < 300 ? 1 : 0
    const smealFlag: 0 | 1 = duration >= 300 && duration < 540 ? 1 : 0
    const rawRecaptcha = (fields[recaptchaIdx] ?? '').trim()
    const recaptchaScore = rawRecaptcha === '' ? 1.0 : parseFloat(rawRecaptcha) || 1.0
    const recaptchaFlag: 0 | 1 = recaptchaScore < 0.5 ? 1 : 0
    const straightliningCount = parseInt(fields[straightliningIdx] ?? '0', 10) || 0
    const straightliningFlag: 0 | 1 = straightliningCount > 0 ? 1 : 0

    const partial: Omit<DispositionRow, 'Disposition'> = {
      PROLIFIC_PID: pid,
      Finished: finished,
      Duration_Seconds: duration,
      IRI_Barrier_Pass: iriBarrier,
      IRI_Readiness_Pass: iriReadiness,
      IRI_Maturity_Pass: iriMaturity,
      IRI_Pass_Count: iriPassCount,
      IRI_Fail_Count: iriFailCount,
      Speed_Flag: speedFlag,
      Smeal_Benchmark_Flag: smealFlag,
      reCAPTCHA_Score: recaptchaScore,
      reCAPTCHA_Flag: recaptchaFlag,
      Straightlining_Count: straightliningCount,
      Straightlining_Flag: straightliningFlag,
    }

    results.push({ ...partial, Disposition: computeDisposition(partial) })
  }

  return results
}

function toCsv(rows: DispositionRow[]): string {
  const headers = [
    'PROLIFIC_PID',
    'Finished',
    'Duration_Seconds',
    'IRI_Barrier_Pass',
    'IRI_Readiness_Pass',
    'IRI_Maturity_Pass',
    'IRI_Pass_Count',
    'IRI_Fail_Count',
    'Speed_Flag',
    'Smeal_Benchmark_Flag',
    'reCAPTCHA_Score',
    'reCAPTCHA_Flag',
    'Straightlining_Count',
    'Straightlining_Flag',
    'Disposition',
  ]

  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => String(row[h as keyof DispositionRow])).join(','))
  }
  return lines.join('\n') + '\n'
}

function generateSummary(rows: DispositionRow[]): string {
  const counts: Record<string, number> = {}
  for (const row of rows) {
    counts[row.Disposition] = (counts[row.Disposition] || 0) + 1
  }

  const order = [
    'CLEAN',
    'AUTO-EXCLUDE',
    'FLAG-SPEED',
    'FLAG-SINGLE-IRI',
    'FLAG-SMEAL',
    'FLAG-RECAPTCHA',
    'FLAG-STRAIGHTLINING',
    'INCOMPLETE',
  ]

  const tableRows = order
    .filter((d) => counts[d])
    .map((d) => `| ${d} | ${counts[d]} | ${((counts[d] / rows.length) * 100).toFixed(1)}% |`)
    .join('\n')

  return [
    '## TABS V2 Disposition Triage',
    '',
    `**Total responses:** ${rows.length}`,
    '',
    '| Disposition | Count | % |',
    '|---|---:|---:|',
    tableRows,
    '',
  ].join('\n')
}

async function main() {
  const inputPath = process.env.INPUT_PATH
  const outputPath = process.env.OUTPUT_PATH

  if (!inputPath || !outputPath) {
    console.error('Error: INPUT_PATH and OUTPUT_PATH are required')
    process.exit(1)
  }

  console.log(`📄 Reading Qualtrics export from ${inputPath}`)
  const inputCsv = readFileSync(inputPath, 'utf-8')

  const rows = triageCsv(inputCsv)
  console.log(`📊 Triaged ${rows.length} responses`)

  const csv = toCsv(rows)
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, csv, 'utf-8')
  console.log(`✅ Wrote disposition CSV to ${outputPath}`)

  const summary = generateSummary(rows)
  console.log(summary)
  appendGithubStepSummary(summary)
}

// Only run main when executed directly, not when imported by tests.
// require.main / import.meta.url checks don't work reliably with tsx,
// so we check for the JEST_WORKER_ID env var that Jest always sets.
if (!process.env.JEST_WORKER_ID) {
  main().catch((error) => {
    console.error('Triage failed:', error)
    process.exit(1)
  })
}
