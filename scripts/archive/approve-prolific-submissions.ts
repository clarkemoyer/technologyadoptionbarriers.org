/**
 * Approve Prolific submissions from a CSV disposition file.
 *
 * Reads a CSV (from a file path or inline content), finds rows where the
 * "Disposition" column (Column D) has the value "CLEAN", extracts the
 * participant IDs, and bulk-approves them via the Prolific API.
 *
 * Environment variables:
 *   PROLIFIC_API_TOKEN   - Prolific API token (required)
 *   STUDY_ID             - Prolific study ID (required)
 *   CSV_FILE_PATH        - Path to the CSV file to parse (one of CSV_FILE_PATH or CSV_CONTENT required)
 *   CSV_CONTENT          - Inline CSV content to parse (one of CSV_FILE_PATH or CSV_CONTENT required)
 *   PID_COLUMN           - Column header for participant IDs (default: auto-detect)
 *   DISPOSITION_COLUMN   - Column header for disposition (default: auto-detect "Disposition" / Column D)
 *   DRY_RUN              - When "false", approve live; otherwise dry run (default: true)
 *   VERBOSE_DRY_RUN      - When "true", log individual PIDs in dry-run mode (default: false)
 */

import { getCurrentUser, bulkApproveSubmissions } from '../src/lib/prolific-api'
import { appendGithubStepSummary, mdEscape } from '../src/lib/github-utils'
import { readFileSync } from 'node:fs'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function envFlag(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name]
  if (value === undefined) return defaultValue
  const normalized = value.trim().toLowerCase()
  if (normalized === '') return defaultValue
  return ['1', 'true', 'yes', 'y', 'on'].includes(normalized)
}

/**
 * Parse a single CSV line respecting quoted fields.
 * Handles embedded commas and doubled-quote escapes for a single physical line.
 * Note: when the CSV content is pre-split on newlines, embedded newlines in quoted
 * fields are not supported by this helper.
 */
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
          i++ // skip escaped quote
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

/**
 * Detect the column index for participant IDs.
 * Priority: explicit override → common header names (participant_id, pid, etc.) → column 0.
 */
function detectPidColumn(headers: string[], override?: string): number {
  if (override) {
    const idx = headers.findIndex((h) => h.toLowerCase() === override.toLowerCase())
    if (idx !== -1) return idx
    console.warn(`⚠️  PID_COLUMN "${override}" not found in headers; using auto-detect`)
  }

  const pidPatterns = ['participant_id', 'participant id', 'prolific_pid', 'prolific pid', 'pid']

  for (const pattern of pidPatterns) {
    const idx = headers.findIndex((h) => h.toLowerCase() === pattern)
    if (idx !== -1) return idx
  }

  // Fallback: first column
  return 0
}

/**
 * Detect the disposition column index.
 * Priority: explicit override → header named "Disposition" → Column D (index 3).
 */
function detectDispositionColumn(headers: string[], override?: string): number {
  if (override) {
    const idx = headers.findIndex((h) => h.toLowerCase() === override.toLowerCase())
    if (idx !== -1) return idx
    console.warn(`⚠️  DISPOSITION_COLUMN "${override}" not found in headers; using auto-detect`)
  }

  const idx = headers.findIndex((h) => h.toLowerCase() === 'disposition')
  if (idx !== -1) return idx

  // Fallback: Column D (index 3)
  if (headers.length > 3) return 3

  throw new Error(
    'Cannot detect disposition column. Provide DISPOSITION_COLUMN or ensure a "Disposition" header exists.'
  )
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  const apiToken = process.env.PROLIFIC_API_TOKEN
  if (!apiToken) {
    console.error('Error: PROLIFIC_API_TOKEN environment variable is required')
    process.exit(1)
  }

  const studyId = process.env.STUDY_ID
  if (!studyId) {
    console.error('Error: STUDY_ID environment variable is required')
    process.exit(1)
  }

  const csvFilePath = process.env.CSV_FILE_PATH
  const csvContent = process.env.CSV_CONTENT
  if (!csvFilePath && !csvContent) {
    console.error('Error: Either CSV_FILE_PATH or CSV_CONTENT must be provided')
    process.exit(1)
  }

  const dryRun = envFlag('DRY_RUN', true)

  /* ---------- load CSV ------------------------------------------------ */
  let rawCsv: string
  if (csvFilePath) {
    console.log(`📄 Reading CSV from file: ${csvFilePath}`)
    rawCsv = readFileSync(csvFilePath, 'utf-8')
  } else {
    console.log('📄 Reading CSV from inline content')
    rawCsv = csvContent!
  }

  const lines = rawCsv
    .trimEnd()
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')
  if (lines.length < 2) {
    console.error('Error: CSV must contain a header row and at least one data row')
    process.exit(1)
  }

  const headers = parseCsvLine(lines[0])
  const pidColIdx = detectPidColumn(headers, process.env.PID_COLUMN)
  const dispColIdx = detectDispositionColumn(headers, process.env.DISPOSITION_COLUMN)

  console.log(`  Headers: ${headers.join(', ')}`)
  console.log(`  PID column: "${headers[pidColIdx]}" (index ${pidColIdx})`)
  console.log(`  Disposition column: "${headers[dispColIdx]}" (index ${dispColIdx})`)
  console.log('')

  /* ---------- parse rows ---------------------------------------------- */
  const cleanPids: string[] = []
  let skippedRows = 0

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    const disposition = (fields[dispColIdx] ?? '').trim().toUpperCase()
    const pid = (fields[pidColIdx] ?? '').trim()

    if (disposition === 'CLEAN') {
      if (pid) {
        cleanPids.push(pid)
      } else {
        console.warn(`⚠️  Row ${i + 1}: Disposition is CLEAN but PID is empty - skipping`)
        skippedRows++
      }
    }
  }

  const totalDataRows = lines.length - 1
  console.log(`📊 Parsed ${totalDataRows} data rows`)
  console.log(`   CLEAN dispositions: ${cleanPids.length}`)
  if (skippedRows > 0) {
    console.log(`   Skipped (empty PID): ${skippedRows}`)
  }
  console.log('')

  if (cleanPids.length === 0) {
    console.log('ℹ️  No participants with CLEAN disposition found. Nothing to approve.')
    appendGithubStepSummary(
      [
        '## Prolific Submission Approval',
        '',
        `- **Study ID:** ${mdEscape(studyId)}`,
        `- **CSV rows parsed:** ${totalDataRows}`,
        `- **CLEAN dispositions:** 0`,
        '',
        'ℹ️ No participants to approve.',
        '',
      ].join('\n')
    )
    return
  }

  /* ---------- verify token -------------------------------------------- */
  console.log('🔍 Verifying Prolific API connection...')
  const user = await getCurrentUser(apiToken)
  console.log(`✅ Connected as: ${user.name} (${user.email})\n`)

  /* ---------- approve ------------------------------------------------- */
  if (dryRun) {
    const verboseDryRun = envFlag('VERBOSE_DRY_RUN', false)
    console.log('🔒 DRY RUN - no submissions will be approved')
    console.log(`   CLEAN submissions that would be approved: ${cleanPids.length}`)
    if (verboseDryRun) {
      console.log('   Participant IDs that would be approved:')
      for (const pid of cleanPids) {
        console.log(`     - ${pid}`)
      }
    } else {
      console.log('   (Set VERBOSE_DRY_RUN=true to log individual participant IDs.)')
    }
  } else {
    console.log(`🚀 Approving ${cleanPids.length} submissions for study ${studyId}...`)
    await bulkApproveSubmissions(studyId, cleanPids, apiToken)
    console.log(`✅ Successfully approved ${cleanPids.length} submissions`)
  }

  /* ---------- summary ------------------------------------------------- */
  appendGithubStepSummary(
    [
      '## Prolific Submission Approval',
      '',
      `- **Run time (UTC):** ${new Date().toISOString()}`,
      `- **Connected user:** ${mdEscape(user.name)} (id: ${mdEscape(user.id)})`,
      `- **Study ID:** ${mdEscape(studyId)}`,
      `- **Mode:** ${dryRun ? '🔒 Dry run' : '🚀 Live'}`,
      '',
      '### Results',
      '',
      '| Metric | Value |',
      '|---|---:|',
      `| CSV rows parsed | ${totalDataRows} |`,
      `| CLEAN dispositions | ${cleanPids.length} |`,
      `| Skipped (empty PID) | ${skippedRows} |`,
      `| Approved | ${dryRun ? '0 (dry run)' : String(cleanPids.length)} |`,
      '',
      dryRun
        ? '> **Dry run** - re-run with `dry_run` unchecked to approve submissions.'
        : '✅ **All CLEAN submissions have been approved.**',
      '',
    ].join('\n')
  )

  console.log('\n✅ Done')
}

main().catch((error: unknown) => {
  console.error('❌ Error approving submissions:', error)

  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response: unknown }).response
    console.error('API Response:', JSON.stringify(response, null, 2))
  }

  appendGithubStepSummary(
    [
      '---',
      '',
      '❌ **Result:** Failure',
      '',
      'Check the job logs for the full error details.',
      '',
    ].join('\n')
  )
  process.exit(1)
})
