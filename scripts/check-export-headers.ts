/**
 * Diagnostic: dump raw Qualtrics export headers and Q_StraightliningCount values.
 *
 * Environment variables:
 *   INPUT_PATH – Path to the raw Qualtrics CSV export (required)
 */

import { readFileSync } from 'node:fs'

const inputPath = process.env.INPUT_PATH
if (!inputPath) {
  console.error('INPUT_PATH required')
  process.exit(1)
}

const csv = readFileSync(inputPath, 'utf-8')
const lines = csv.split(/\r?\n/).filter((l) => l.trim())

// Row 1 = headers
const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim())

console.log(`Total columns: ${headers.length}`)
console.log('')

// Find all Q_ columns
console.log('=== All Q_ columns ===')
headers.forEach((h, i) => {
  if (h.startsWith('Q_')) console.log(`  [${i}] ${h}`)
})

// Find straightlining
const straightIdx = headers.findIndex(
  (h) => h.includes('StraightliningCount') || h.includes('Straightlining')
)

console.log('')
if (straightIdx === -1) {
  console.log('*** Q_StraightliningCount COLUMN NOT FOUND ***')
  console.log('This means the v2 survey may not have straightlining detection enabled.')
} else {
  console.log(
    `Q_StraightliningCount found at column index ${straightIdx}: "${headers[straightIdx]}"`
  )
  console.log('')

  // Count values
  let nonZero = 0
  let empty = 0
  let total = 0
  for (let i = 3; i < lines.length; i++) {
    total++
    const val = lines[i].split(',')[straightIdx]?.replace(/"/g, '').trim() ?? ''
    if (val === '') empty++
    else if (val !== '0') nonZero++
  }
  console.log(`Data rows: ${total}`)
  console.log(`Zero: ${total - empty - nonZero}`)
  console.log(`Non-zero: ${nonZero}`)
  console.log(`Empty/blank: ${empty}`)
}

// Also check the IRI columns and reCAPTCHA
for (const col of [
  'Q10-28_Barriers_19',
  'Q47-64_Readiness_18',
  'Q65-73_Maturity_9',
  'Q_RecaptchaScore',
  'PROLIFIC_PID',
]) {
  const idx = headers.findIndex((h) => h === col)
  if (idx === -1) {
    console.log(`\n*** ${col} COLUMN NOT FOUND ***`)
  } else {
    // Show 3 sample values
    const samples = []
    for (let i = 3; i < Math.min(lines.length, 8); i++) {
      samples.push(lines[i].split(',')[idx]?.replace(/"/g, '').trim() ?? '(empty)')
    }
    console.log(`\n${col} [${idx}] samples: ${samples.join(' | ')}`)
  }
}
