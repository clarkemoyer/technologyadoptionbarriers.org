/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  DESTRUCTIVE OPERATION: Reject Prolific Submissions             ║
 * ║                                                                  ║
 * ║  This script REJECTS participants who failed ALL THREE IRI       ║
 * ║  attention checks. Rejected participants will NOT be paid.       ║
 * ║  This action cannot be easily undone.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Reads a disposition CSV (from the triage pipeline), filters for
 * participants with IRI_Fail_Count == 3, and calls the Prolific API
 * to reject their submissions.
 *
 * Safety guards:
 *   1. Requires CONFIRM_REJECT=REJECT to proceed (exact string match)
 *   2. Defaults to dry-run mode
 *   3. Always logs every PID that would be / is rejected
 *   4. Produces a GitHub Step Summary with full audit trail
 *   5. Only targets IRI_Fail_Count == 3 (all three failed)
 *
 * Environment variables:
 *   PROLIFIC_API_TOKEN  – Prolific API token (required)
 *   STUDY_ID            – Prolific study ID (required)
 *   CSV_FILE_PATH       – Path to disposition CSV (required)
 *   CONFIRM_REJECT      – Must be exactly "REJECT" to execute live (required for live)
 *   DRY_RUN             – When "false" AND CONFIRM_REJECT=="REJECT", reject live (default: true)
 */

import { getCurrentUser, bulkRejectSubmissions } from '../src/lib/prolific-api'
import { appendGithubStepSummary, mdEscape } from '../src/lib/github-utils'
import { readFileSync } from 'node:fs'
import { parseCsvLine } from '../src/lib/disposition'

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

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  console.log('================================================================')
  console.log('  DESTRUCTIVE OPERATION: Prolific Submission Rejection')
  console.log('  Participants who failed ALL 3 IRI attention checks')
  console.log('  Rejected participants will NOT be paid.')
  console.log('================================================================')
  console.log('')

  const apiToken = process.env.PROLIFIC_API_TOKEN
  if (!apiToken) {
    console.error('Error: PROLIFIC_API_TOKEN is required')
    process.exit(1)
  }

  const studyId = process.env.STUDY_ID
  if (!studyId) {
    console.error('Error: STUDY_ID is required')
    process.exit(1)
  }

  const csvFilePath = process.env.CSV_FILE_PATH
  if (!csvFilePath) {
    console.error('Error: CSV_FILE_PATH is required')
    process.exit(1)
  }

  const dryRun = envFlag('DRY_RUN', true)
  const confirmReject = (process.env.CONFIRM_REJECT ?? '').trim()

  // Safety check: require explicit confirmation for live rejection
  if (!dryRun && confirmReject !== 'REJECT') {
    console.error('================================================================')
    console.error('  SAFETY STOP: CONFIRM_REJECT must be exactly "REJECT"')
    console.error('  to execute a live rejection. This is a destructive action.')
    console.error(`  Received: "${confirmReject}"`)
    console.error('================================================================')
    process.exit(1)
  }

  /* ---------- Load and filter CSV ------------------------------------- */
  console.log(`Reading disposition CSV from ${csvFilePath}`)
  const rawCsv = readFileSync(csvFilePath, 'utf-8')

  const lines = rawCsv
    .trimEnd()
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')
  if (lines.length < 2) {
    console.error('Error: CSV must have a header row and at least one data row')
    process.exit(1)
  }

  const headers = parseCsvLine(lines[0])
  const pidIdx = headers.indexOf('PROLIFIC_PID')
  const iriFailIdx = headers.indexOf('IRI_Fail_Count')
  const dispositionIdx = headers.indexOf('Disposition')

  if (pidIdx === -1 || iriFailIdx === -1) {
    console.error('Error: CSV must have PROLIFIC_PID and IRI_Fail_Count columns')
    process.exit(1)
  }

  // Only reject participants who failed ALL THREE IRI checks
  const rejectPids: string[] = []
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    const pid = (fields[pidIdx] ?? '').trim()
    const iriFailCount = parseInt(fields[iriFailIdx] ?? '0', 10) || 0
    const disposition = (fields[dispositionIdx] ?? '').trim()

    if (pid && iriFailCount === 3) {
      rejectPids.push(pid)
    }
  }

  const totalRows = lines.length - 1
  console.log(`Parsed ${totalRows} data rows`)
  console.log(`Participants with IRI_Fail_Count == 3: ${rejectPids.length}`)
  console.log('')

  if (rejectPids.length === 0) {
    console.log('No participants to reject.')
    appendGithubStepSummary(
      [
        '## Prolific Submission Rejection',
        '',
        '> **DESTRUCTIVE OPERATION** — rejects participants who failed all 3 IRI attention checks',
        '',
        `- **Study ID:** ${mdEscape(studyId)}`,
        `- **CSV rows parsed:** ${totalRows}`,
        `- **IRI_Fail_Count == 3:** 0`,
        '',
        'No participants to reject.',
        '',
      ].join('\n')
    )
    return
  }

  /* ---------- Log every PID ------------------------------------------- */
  console.log('Participants to reject (IRI_Fail_Count == 3):')
  for (const pid of rejectPids) {
    console.log(`  - ${pid}`)
  }
  console.log('')

  /* ---------- Verify API connection ----------------------------------- */
  console.log('Verifying Prolific API connection...')
  const user = await getCurrentUser(apiToken)
  console.log(`Connected as: ${user.name} (${user.email})`)
  console.log('')

  /* ---------- Execute or dry run -------------------------------------- */
  if (dryRun) {
    console.log('================================================================')
    console.log('  DRY RUN — no submissions will be rejected')
    console.log(`  Would reject: ${rejectPids.length} participants`)
    console.log('  Set DRY_RUN=false and CONFIRM_REJECT=REJECT to execute')
    console.log('================================================================')
  } else {
    console.log('================================================================')
    console.log(`  LIVE REJECTION: Rejecting ${rejectPids.length} submissions`)
    console.log(`  Study: ${studyId}`)
    console.log(`  Operator: ${user.name} (${user.email})`)
    console.log('================================================================')
    console.log('')

    await bulkRejectSubmissions(studyId, rejectPids, apiToken)
    console.log(`REJECTED ${rejectPids.length} submissions`)
  }

  /* ---------- Step summary -------------------------------------------- */
  appendGithubStepSummary(
    [
      '## Prolific Submission Rejection',
      '',
      '> **DESTRUCTIVE OPERATION** — rejects participants who failed all 3 IRI attention checks.',
      '> Rejected participants will NOT be paid.',
      '',
      `- **Run time (UTC):** ${new Date().toISOString()}`,
      `- **Operator:** ${mdEscape(user.name)} (id: ${mdEscape(user.id)})`,
      `- **Study ID:** ${mdEscape(studyId)}`,
      `- **Mode:** ${dryRun ? 'DRY RUN' : 'LIVE REJECTION'}`,
      '',
      '### Results',
      '',
      '| Metric | Value |',
      '|---|---:|',
      `| CSV rows parsed | ${totalRows} |`,
      `| IRI\\_Fail\\_Count == 3 | ${rejectPids.length} |`,
      `| Rejected | ${dryRun ? '0 (dry run)' : String(rejectPids.length)} |`,
      '',
      '### Rejected PIDs',
      '',
      ...rejectPids.map((pid) => `- \`${pid}\``),
      '',
      dryRun
        ? '> **Dry run** — set `DRY_RUN=false` and `CONFIRM_REJECT=REJECT` to execute.'
        : '> **All listed participants have been rejected and will not be paid.**',
      '',
    ].join('\n')
  )

  console.log('')
  console.log('Done')
}

main().catch((error: unknown) => {
  console.error('REJECTION SCRIPT FAILED:', error)

  appendGithubStepSummary(
    [
      '---',
      '',
      '## REJECTION FAILED',
      '',
      'The rejection script encountered an error. **No submissions were rejected** if the error',
      'occurred before the API call. Check logs for details.',
      '',
    ].join('\n')
  )
  process.exit(1)
})
