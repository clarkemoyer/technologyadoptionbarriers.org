/**
 * Diagnostic: verify raw Qualtrics export columns using proper CSV parsing.
 *
 * Environment variables:
 *   INPUT_PATH – Path to the raw Qualtrics CSV export (required)
 */

import { readFileSync } from 'node:fs'
import { parseCsvLine } from '../src/lib/disposition'

const inputPath = process.env.INPUT_PATH
if (!inputPath) {
  console.error('INPUT_PATH required')
  process.exit(1)
}

const csv = readFileSync(inputPath, 'utf-8')
const lines = csv.split(/\r?\n/).filter((l) => l.trim())

// Row 1 = headers (use proper CSV parser for quoted fields)
const headers = parseCsvLine(lines[0])

console.log(`Total columns: ${headers.length}`)
console.log('')

// Dump all headers
console.log('=== All column headers ===')
headers.forEach((h, i) => console.log(`  [${i}] ${h}`))

// Find all Q_ columns
console.log('')
console.log('=== Q_ columns ===')
headers.forEach((h, i) => {
  if (h.startsWith('Q_')) console.log(`  [${i}] ${h}`)
})

// Check key columns
const keyColumns = [
  'PROLIFIC_PID',
  'Finished',
  'Duration (in seconds)',
  'Q10-28_Barriers_19',
  'Q47-64_Readiness_18',
  'Q65-73_Maturity_9',
  'Q_RecaptchaScore',
  'Q_StraightliningCount',
]

console.log('')
console.log('=== Key column verification ===')
for (const col of keyColumns) {
  const idx = headers.findIndex((h) => h === col)
  if (idx === -1) {
    console.log(`*** ${col}: NOT FOUND ***`)
    continue
  }

  // Count values from data rows (skip header rows 2-3)
  let nonEmpty = 0
  let total = 0
  const samples: string[] = []

  for (let i = 3; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    total++
    const val = (fields[idx] ?? '').trim()
    if (val !== '') nonEmpty++
    if (samples.length < 3 && val !== '') samples.push(val)
  }

  console.log(`${col} [${idx}]: ${nonEmpty}/${total} non-empty | samples: ${samples.join(' | ')}`)
}

// Detailed straightlining breakdown
const straightIdx = headers.findIndex((h) => h === 'Q_StraightliningCount')
if (straightIdx >= 0) {
  console.log('')
  console.log('=== Q_StraightliningCount breakdown ===')
  const counts: Record<string, number> = {}
  for (let i = 3; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    const val = (fields[straightIdx] ?? '').trim() || '(blank)'
    counts[val] = (counts[val] || 0) + 1
  }
  Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([val, count]) => console.log(`  ${val}: ${count}`))
}
