/**
 * TABS V2 Disposition Triage CLI
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
import { appendGithubStepSummary } from '../../src/lib/github-utils'
import { triageCsv, type DispositionRow } from '../../src/lib/disposition'

// Re-export for backward compatibility with tests
export { computeDisposition, triageCsv, type DispositionRow } from '../../src/lib/disposition'

function toCsv(rows: DispositionRow[]): string {
  const headers = [
    'PROLIFIC_PID',
    'Finished',
    'Duration_Seconds',
    'Auth_LLM',
    'Auth_Bots',
    'Auth_Flag',
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
    'Partial_Straightlining_Flag',
    'Partial_Straightlining_Blocks',
    'Disposition',
  ]

  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => String(row[h as keyof DispositionRow])).join(','))
  }
  return lines.join('\n') + '\n'
}

function generateSummary(rows: DispositionRow[]): string {
  if (rows.length === 0) {
    return '## TABS V2 Disposition Triage\n\n**No responses to triage.**\n'
  }

  const counts: Record<string, number> = {}
  for (const row of rows) {
    counts[row.Disposition] = (counts[row.Disposition] || 0) + 1
  }

  const order = [
    'CLEAN',
    'FLAG-AUTH-FAIL',
    'FLAG-AUTH-MIXED',
    'AUTO-EXCLUDE',
    'FLAG-SPEED',
    'FLAG-SINGLE-IRI',
    'FLAG-SMEAL',
    'FLAG-RECAPTCHA',
    'FLAG-STRAIGHTLINING',
    'FLAG-PARTIAL-STRAIGHTLINING',
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

  console.log(`Reading Qualtrics export from ${inputPath}`)
  const inputCsv = readFileSync(inputPath, 'utf-8')

  const rows = triageCsv(inputCsv)
  console.log(`Triaged ${rows.length} responses`)

  const csv = toCsv(rows)
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, csv, 'utf-8')
  console.log(`Wrote disposition CSV to ${outputPath}`)

  const summary = generateSummary(rows)
  console.log(summary)
  appendGithubStepSummary(summary)
}

main().catch((error) => {
  console.error('Triage failed:', error)
  process.exit(1)
})
