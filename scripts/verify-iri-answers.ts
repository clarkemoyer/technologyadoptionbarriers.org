/**
 * Verify a participant's actual IRI answers from the raw Qualtrics export.
 * Shows what they answered vs what was expected, for dispute resolution.
 *
 * Environment:
 *   QUALTRICS_API_TOKEN, QUALTRICS_BASE_URL, QUALTRICS_SURVEY_ID
 *   PID - Prolific Participant ID to look up
 */
import { exportSurveyResponses } from '../src/lib/qualtrics-api'
import { parseCsvLine } from '../src/lib/disposition'
import { inflateRawSync } from 'node:zlib'
import { basename } from 'node:path'

function extractCsvFromZip(zipBuffer: Buffer): string {
  let offset = 0
  while (offset < zipBuffer.length - 4) {
    const sig = zipBuffer.readUInt32LE(offset)
    if (sig !== 0x04034b50) break
    const gpFlag = zipBuffer.readUInt16LE(offset + 6)
    const method = zipBuffer.readUInt16LE(offset + 8)
    let compressedSize = zipBuffer.readUInt32LE(offset + 18)
    const nameLen = zipBuffer.readUInt16LE(offset + 26)
    const extraLen = zipBuffer.readUInt16LE(offset + 28)
    const name = zipBuffer.subarray(offset + 30, offset + 30 + nameLen).toString('utf-8')
    const dataStart = offset + 30 + nameLen + extraLen
    if (gpFlag & 0x08 && compressedSize === 0) {
      let scan = dataStart
      while (scan < zipBuffer.length - 16) {
        if (zipBuffer.readUInt32LE(scan) === 0x08074b50) {
          compressedSize = zipBuffer.readUInt32LE(scan + 8)
          break
        }
        scan++
      }
    }
    if (basename(name).endsWith('.csv')) {
      const data = zipBuffer.subarray(dataStart, dataStart + compressedSize)
      if (method === 0) return data.toString('utf-8')
      if (method === 8) return inflateRawSync(data).toString('utf-8')
    }
    offset = dataStart + compressedSize
    if (gpFlag & 0x08 && offset < zipBuffer.length - 4) {
      if (zipBuffer.readUInt32LE(offset) === 0x08074b50) offset += 16
    }
  }
  throw new Error('No CSV found in ZIP')
}

const IRI_CHECKS = [
  { column: 'Q10-28_Barriers_19', label: 'Barrier IRI', expected: 'Major Barrier' },
  { column: 'Q47-64_Readiness_18', label: 'Readiness IRI', expected: 'Low Readiness/Capability' },
  {
    column: 'Q65-73_Maturity_9',
    label: 'Maturity IRI',
    expected: 'Level 2: Developing/Repeatable',
  },
]

async function main() {
  const token = process.env.QUALTRICS_API_TOKEN!
  const baseUrl = process.env.QUALTRICS_BASE_URL!
  const surveyId = process.env.QUALTRICS_SURVEY_ID!
  const pid = process.env.PID!

  console.log(`Exporting Qualtrics responses to verify IRI for PID ${pid}...`)
  const zip = await exportSurveyResponses(surveyId, token, baseUrl)
  const csv = extractCsvFromZip(zip)
  const lines = csv.split('\n')

  // Row 1 = headers, rows 2-3 = Qualtrics metadata, row 4+ = data
  const headers = parseCsvLine(lines[0])

  // Find column indices
  const pidIdx = headers.findIndex((h) => h.includes('PROLIFIC_PID') || h === 'PROLIFIC_PID')
  const iriIndices = IRI_CHECKS.map((check) => ({
    ...check,
    idx: headers.findIndex((h) => h === check.column),
  }))

  console.log(`\nPID column index: ${pidIdx}`)
  for (const iri of iriIndices) {
    console.log(`${iri.label} column "${iri.column}" index: ${iri.idx}`)
  }

  // Find this participant's row(s) - skip header rows (0-2), start at row 3
  let found = false
  for (let i = 3; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const fields = parseCsvLine(lines[i])
    const rowPid = (fields[pidIdx] ?? '').trim()
    if (rowPid !== pid) continue

    found = true
    const duration = fields[headers.indexOf('Duration (in seconds)')] || 'N/A'
    const finished = fields[headers.indexOf('Finished')] || 'N/A'

    console.log(`\n========================================`)
    console.log(`PARTICIPANT: ${pid}`)
    console.log(`Row: ${i + 1}`)
    console.log(`Finished: ${finished}`)
    console.log(`Duration: ${duration}s`)
    console.log(`========================================\n`)

    console.log('IRI VERIFICATION:')
    console.log('')
    for (const iri of iriIndices) {
      const actual = (fields[iri.idx] ?? '(empty)').trim()
      const pass = actual === iri.expected
      console.log(`  ${iri.label}:`)
      console.log(`    Expected: "${iri.expected}"`)
      console.log(`    Actual:   "${actual}"`)
      console.log(`    Result:   ${pass ? 'PASS ✓' : 'FAIL ✗'}`)
      console.log('')
    }
  }

  if (!found) {
    console.log(`\nPID ${pid} not found in Qualtrics export.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
