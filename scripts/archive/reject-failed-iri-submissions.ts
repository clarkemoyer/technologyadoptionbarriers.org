/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  DESTRUCTIVE OPERATION: Reject Prolific Submissions             ║
 * ║                                                                  ║
 * ║  This script REJECTS participants who failed ALL THREE IRI       ║
 * ║  attention checks. Rejected participants will NOT be paid.       ║
 * ║  This action cannot be easily undone.                            ║
 * ║                                                                  ║
 * ║  Each participant receives a PERSONALIZED rejection message      ║
 * ║  explaining which checks they failed, their completion time,     ║
 * ║  and an invitation to appeal if they believe it's an error.      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Environment variables:
 *   PROLIFIC_API_TOKEN  – Prolific API token (required)
 *   STUDY_ID            – Prolific study ID (required)
 *   CSV_FILE_PATH       – Path to disposition CSV (required)
 *   CONFIRM_REJECT      – Must be exactly "REJECT" to execute live (required for live)
 *   DRY_RUN             – When "false" AND CONFIRM_REJECT=="REJECT", reject live (default: true)
 */

import {
  getCurrentUser,
  rejectSubmission,
  getSubmissionIdsByParticipant,
  REJECTION_CATEGORIES,
  type RejectionCategory,
} from '../src/lib/prolific-api'
import { appendGithubStepSummary, mdEscape } from '../src/lib/github-utils'
import { readFileSync } from 'node:fs'
import { parseCsvLine, type DispositionRow } from '../src/lib/disposition'

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface RejectionRecord {
  pid: string
  iriFailCount: number
  iriBarrierPass: number
  iriReadinessPass: number
  iriMaturityPass: number
  duration: number
  speedFlag: number
  recaptchaScore: number
  recaptchaFlag: number
  straightliningCount: number
  categories: RejectionCategory[]
  message: string
}

/* ------------------------------------------------------------------ */
/*  Message template (matches spreadsheet format)                     */
/* ------------------------------------------------------------------ */

function buildRejectionMessage(r: RejectionRecord): string {
  const minutes = (r.duration / 60).toFixed(1)

  const reasons: string[] = []

  if (r.speedFlag === 1) {
    reasons.push(`it was completed in ${minutes} minutes (below our 5-minute minimum)`)
  }

  reasons.push(`${r.iriFailCount} of 3 embedded attention checks were answered incorrectly`)

  const reasonText = reasons.join(' and ')

  return [
    `Hi, thank you for participating in our Technology Adoption Barriers Survey.`,
    `Unfortunately, your submission has been rejected because ${reasonText}.`,
    `These checks are designed to confirm that respondents are reading each question carefully.`,
    `If you believe this is an error, please reply to this message with any questions.`,
  ].join(' ')
}

function buildRejectionCategories(r: RejectionRecord): RejectionCategory[] {
  const cats: RejectionCategory[] = [REJECTION_CATEGORIES.FAILED_ATTENTION_CHECK]

  if (r.speedFlag === 1) {
    cats.push(REJECTION_CATEGORIES.TOO_QUICKLY)
  }

  cats.push(REJECTION_CATEGORIES.OTHER)

  return cats
}

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
  console.log('  Each participant receives a personalized rejection message.')
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

  if (!dryRun && confirmReject !== 'REJECT') {
    console.error('================================================================')
    console.error('  SAFETY STOP: CONFIRM_REJECT must be exactly "REJECT"')
    console.error(`  Received: "${confirmReject}"`)
    console.error('================================================================')
    process.exit(1)
  }

  /* ---------- Load CSV and build rejection records -------------------- */
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
  const col = (name: string) => {
    const idx = headers.indexOf(name)
    if (idx === -1) throw new Error(`Required column "${name}" not found`)
    return idx
  }

  const pidIdx = col('PROLIFIC_PID')
  const iriFailIdx = col('IRI_Fail_Count')
  const iriBarrierIdx = col('IRI_Barrier_Pass')
  const iriReadinessIdx = col('IRI_Readiness_Pass')
  const iriMaturityIdx = col('IRI_Maturity_Pass')
  const durationIdx = col('Duration_Seconds')
  const speedIdx = col('Speed_Flag')
  const recaptchaScoreIdx = col('reCAPTCHA_Score')
  const recaptchaFlagIdx = col('reCAPTCHA_Flag')
  const straightliningIdx = col('Straightlining_Count')

  const records: RejectionRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    const pid = (fields[pidIdx] ?? '').trim()
    const iriFailCount = parseInt(fields[iriFailIdx] ?? '0', 10) || 0

    if (!pid || iriFailCount !== 3) continue

    const r: RejectionRecord = {
      pid,
      iriFailCount,
      iriBarrierPass: parseInt(fields[iriBarrierIdx] ?? '0', 10),
      iriReadinessPass: parseInt(fields[iriReadinessIdx] ?? '0', 10),
      iriMaturityPass: parseInt(fields[iriMaturityIdx] ?? '0', 10),
      duration: parseInt(fields[durationIdx] ?? '0', 10) || 0,
      speedFlag: parseInt(fields[speedIdx] ?? '0', 10),
      recaptchaScore: parseFloat(fields[recaptchaScoreIdx] ?? '1.0') || 1.0,
      recaptchaFlag: parseInt(fields[recaptchaFlagIdx] ?? '0', 10),
      straightliningCount: parseInt(fields[straightliningIdx] ?? '0', 10),
      categories: [],
      message: '',
    }

    r.categories = buildRejectionCategories(r)
    r.message = buildRejectionMessage(r)
    records.push(r)
  }

  console.log(`Parsed ${lines.length - 1} data rows`)
  console.log(`Participants with IRI_Fail_Count == 3: ${records.length}`)
  console.log('')

  if (records.length === 0) {
    console.log('No participants to reject.')
    appendGithubStepSummary(
      '## Prolific Submission Rejection\n\nNo participants with IRI_Fail_Count == 3.\n'
    )
    return
  }

  /* ---------- Log every rejection with its message -------------------- */
  console.log('Rejection details:')
  console.log('')
  for (const r of records) {
    const minutes = (r.duration / 60).toFixed(1)
    console.log(`  PID: ${r.pid}`)
    console.log(
      `    Duration: ${minutes} min | IRI Failed: ${r.iriFailCount}/3 | Speed: ${r.speedFlag === 1 ? 'TOO FAST' : 'OK'}`
    )
    console.log(`    Categories: ${r.categories.join(', ')}`)
    console.log(`    Message: ${r.message}`)
    console.log('')
  }

  /* ---------- Verify API connection ----------------------------------- */
  console.log('Verifying Prolific API connection...')
  const user = await getCurrentUser(apiToken)
  console.log(`Connected as: ${user.name} (${user.email})`)
  console.log('')

  /* ---------- Execute or dry run -------------------------------------- */
  if (dryRun) {
    console.log('================================================================')
    console.log('  DRY RUN - no submissions will be rejected')
    console.log(`  Would reject: ${records.length} participants`)
    console.log('  Each would receive a personalized message.')
    console.log('  Set DRY_RUN=false and CONFIRM_REJECT=REJECT to execute')
    console.log('================================================================')
  } else {
    console.log('================================================================')
    console.log(`  LIVE REJECTION: ${records.length} submissions`)
    console.log(`  Study: ${studyId}`)
    console.log(`  Operator: ${user.name} (${user.email})`)
    console.log('================================================================')
    console.log('')

    // Look up submission IDs from participant IDs
    console.log('Looking up submission IDs...')
    const pidToSubId = await getSubmissionIdsByParticipant(
      studyId,
      records.map((r) => r.pid),
      apiToken
    )

    const notFound: string[] = []
    let rejected = 0

    for (const r of records) {
      const subId = pidToSubId.get(r.pid)
      if (!subId) {
        console.log(`  WARNING: No submission found for PID ${r.pid} - skipping`)
        notFound.push(r.pid)
        continue
      }

      console.log(`  Rejecting ${r.pid} (submission ${subId})...`)
      await rejectSubmission(subId, r.categories, r.message, apiToken)
      rejected++
    }

    console.log('')
    console.log(`REJECTED: ${rejected} | NOT FOUND: ${notFound.length}`)
    if (notFound.length > 0) {
      console.log(`PIDs not found in study submissions: ${notFound.join(', ')}`)
    }
  }

  /* ---------- Step summary -------------------------------------------- */
  const summaryRows = records.map((r) => {
    const minutes = (r.duration / 60).toFixed(1)
    return `| \`${r.pid}\` | ${minutes} min | ${r.iriFailCount}/3 | ${r.speedFlag === 1 ? 'Yes' : 'No'} |`
  })

  appendGithubStepSummary(
    [
      '## Prolific Submission Rejection',
      '',
      '> **DESTRUCTIVE OPERATION** - rejected participants will NOT be paid.',
      '',
      `- **Run time (UTC):** ${new Date().toISOString()}`,
      `- **Operator:** ${mdEscape(user.name)}`,
      `- **Study ID:** ${mdEscape(studyId)}`,
      `- **Mode:** ${dryRun ? 'DRY RUN' : 'LIVE REJECTION'}`,
      `- **Criteria:** IRI\\_Fail\\_Count == 3 (all three attention checks failed)`,
      '',
      '### Participants',
      '',
      '| PID | Duration | IRI Failed | Speed Flag |',
      '|---|---|---|---|',
      ...summaryRows,
      '',
      `**Total:** ${records.length}`,
      '',
      '### Message Template',
      '',
      '> ' + buildRejectionMessage(records[0]).replace(/\. /g, '. > '),
      '',
      dryRun
        ? '> **Dry run** - no rejections executed.'
        : '> **All listed participants have been rejected with personalized messages.**',
      '',
    ].join('\n')
  )

  console.log('')
  console.log('Done')
}

main().catch((error: unknown) => {
  console.error('REJECTION SCRIPT FAILED:', error)
  appendGithubStepSummary('---\n\n## REJECTION FAILED\n\nCheck the job logs for error details.\n')
  process.exit(1)
})
