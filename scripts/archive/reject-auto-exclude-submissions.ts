/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  DESTRUCTIVE OPERATION: Reject AUTO-EXCLUDE Submissions         ║
 * ║                                                                  ║
 * ║  This script REJECTS participants whose disposition is           ║
 * ║  AUTO-EXCLUDE. This covers ALL auto-exclude sub-types:          ║
 * ║                                                                  ║
 * ║    - IRI_Fail_Count == 3  (all 3 attention checks failed)       ║
 * ║    - IRI_Fail_Count == 2  (2 of 3 attention checks failed)     ║
 * ║    - Speed_Flag + IRI_Fail_Count >= 1  (fast + any IRI fail)   ║
 * ║                                                                  ║
 * ║  Rejected participants will NOT be paid.                         ║
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
 *   PID_LIST            – Optional comma-separated list of PIDs to process (default: all matching)
 *                         Supports: single PID, comma-separated batch, or empty for all
 *   SUB_TYPE            – Optional sub-type filter: IRI3_SPEED, IRI3, IRI2_SPEED, IRI2, SPEED_IRI, ALL
 *                         Defaults to ALL (process all AUTO-EXCLUDE sub-types)
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
import { parseCsvLine } from '../src/lib/disposition'

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
  subType: string
  categories: RejectionCategory[]
  message: string
}

/* ------------------------------------------------------------------ */
/*  Sub-type classification                                           */
/* ------------------------------------------------------------------ */

/**
 * Classify the AUTO-EXCLUDE sub-type based on Speed_Flag and IRI_Fail_Count.
 *
 * The disposition waterfall in disposition.ts assigns AUTO-EXCLUDE when:
 *   - IRI_Fail_Count >= 2, OR
 *   - Speed_Flag == 1 AND IRI_Fail_Count >= 1
 *
 * Sub-types (in severity order):
 *   1. "IRI3_SPEED"  – All 3 IRI checks failed AND under 5 minutes (worst)
 *   2. "IRI3"        – All 3 IRI checks failed, normal speed
 *   3. "IRI2_SPEED"  – 2 of 3 IRI failed AND under 5 minutes
 *   4. "IRI2"        – 2 of 3 IRI checks failed, normal speed
 *   5. "SPEED_IRI"   – Speed flag + 1 IRI failure (compound signal)
 */
function classifySubType(speedFlag: number, iriFailCount: number): string {
  if (iriFailCount >= 3 && speedFlag === 1) return 'IRI3_SPEED'
  if (iriFailCount >= 3) return 'IRI3'
  if (iriFailCount === 2 && speedFlag === 1) return 'IRI2_SPEED'
  if (iriFailCount === 2) return 'IRI2'
  // Speed_Flag == 1 and IRI_Fail_Count == 1
  return 'SPEED_IRI'
}

/** Valid SUB_TYPE filter values */
const VALID_SUB_TYPES = new Set(['ALL', 'IRI3_SPEED', 'IRI3', 'IRI2_SPEED', 'IRI2', 'SPEED_IRI'])

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
  console.log('  Participants with Disposition == AUTO-EXCLUDE')
  console.log('  Sub-types: IRI_Fail >= 2 or Speed_Flag + IRI_Fail >= 1')
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
  const dispositionIdx = col('Disposition')
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
    const disposition = (fields[dispositionIdx] ?? '').trim()

    if (!pid || disposition !== 'AUTO-EXCLUDE') continue

    const iriFailCount = parseInt(fields[iriFailIdx] ?? '0', 10) || 0
    const speedFlag = parseInt(fields[speedIdx] ?? '0', 10)

    const r: RejectionRecord = {
      pid,
      iriFailCount,
      iriBarrierPass: parseInt(fields[iriBarrierIdx] ?? '0', 10),
      iriReadinessPass: parseInt(fields[iriReadinessIdx] ?? '0', 10),
      iriMaturityPass: parseInt(fields[iriMaturityIdx] ?? '0', 10),
      duration: parseInt(fields[durationIdx] ?? '0', 10) || 0,
      speedFlag,
      recaptchaScore: parseFloat(fields[recaptchaScoreIdx] ?? '1.0') || 1.0,
      recaptchaFlag: parseInt(fields[recaptchaFlagIdx] ?? '0', 10),
      straightliningCount: parseInt(fields[straightliningIdx] ?? '0', 10),
      subType: classifySubType(speedFlag, iriFailCount),
      categories: [],
      message: '',
    }

    r.categories = buildRejectionCategories(r)
    r.message = buildRejectionMessage(r)
    records.push(r)
  }

  /* ---------- Apply SUB_TYPE filter ------------------------------------ */
  const subTypeFilter = (process.env.SUB_TYPE ?? 'ALL').trim().toUpperCase()
  if (subTypeFilter && !VALID_SUB_TYPES.has(subTypeFilter)) {
    console.error(
      `Error: Invalid SUB_TYPE "${subTypeFilter}". Valid: ${[...VALID_SUB_TYPES].join(', ')}`
    )
    process.exit(1)
  }

  let afterSubTypeFilter =
    subTypeFilter === 'ALL' || !subTypeFilter
      ? records
      : records.filter((r) => r.subType === subTypeFilter)

  if (subTypeFilter && subTypeFilter !== 'ALL') {
    console.log(`Sub-type filter: ${subTypeFilter}`)
    console.log(
      `Matched: ${afterSubTypeFilter.length} of ${records.length} AUTO-EXCLUDE participants`
    )
    console.log('')
  }

  /* ---------- Apply PID filter ----------------------------------------- */
  const pidListRaw = (process.env.PID_LIST ?? '').trim()
  const pidFilter = pidListRaw
    ? new Set(
        pidListRaw
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
      )
    : null

  const filtered = pidFilter
    ? afterSubTypeFilter.filter((r) => pidFilter.has(r.pid))
    : afterSubTypeFilter

  if (pidFilter) {
    console.log(`PID filter: ${pidFilter.size} PID(s) specified`)
    console.log(`Matched: ${filtered.length} of ${afterSubTypeFilter.length} participants`)
    const missing = [...pidFilter].filter((p) => !filtered.find((r) => r.pid === p))
    if (missing.length > 0) {
      console.log(`Not found: ${missing.join(', ')}`)
    }
    console.log('')
  }

  /* ---------- Summary by sub-type -------------------------------------- */
  const bySubType = new Map<string, RejectionRecord[]>()
  for (const r of filtered) {
    const list = bySubType.get(r.subType) ?? []
    list.push(r)
    bySubType.set(r.subType, list)
  }

  console.log(`Parsed ${lines.length - 1} data rows`)
  console.log(`Participants with Disposition == AUTO-EXCLUDE: ${records.length}`)
  if (pidFilter) console.log(`Filtered to: ${filtered.length}`)
  for (const [subType, list] of bySubType) {
    console.log(`  ${subType}: ${list.length}`)
  }
  console.log('')

  if (filtered.length === 0) {
    console.log('No participants to reject.')
    appendGithubStepSummary(
      '## Prolific AUTO-EXCLUDE Rejection\n\nNo participants with Disposition == AUTO-EXCLUDE.\n'
    )
    return
  }

  /* ---------- Log every rejection with its message -------------------- */
  console.log('Rejection details:')
  console.log('')
  for (const r of filtered) {
    const minutes = (r.duration / 60).toFixed(1)
    console.log(`  PID: ${r.pid}`)
    console.log(
      `    Duration: ${minutes} min | IRI Failed: ${r.iriFailCount}/3 | Speed: ${r.speedFlag === 1 ? 'TOO FAST' : 'OK'} | Sub-type: ${r.subType}`
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
    console.log(`  Would reject: ${filtered.length} participants`)
    console.log('  Each would receive a personalized message.')
    console.log('  Set DRY_RUN=false and CONFIRM_REJECT=REJECT to execute')
    console.log('================================================================')
  } else {
    console.log('================================================================')
    console.log(`  LIVE REJECTION: ${filtered.length} submissions`)
    console.log(`  Study: ${studyId}`)
    console.log(`  Operator: ${user.name} (${user.email})`)
    console.log('================================================================')
    console.log('')

    // Look up submission IDs from participant IDs
    console.log('Looking up submission IDs...')
    const pidToSubId = await getSubmissionIdsByParticipant(
      studyId,
      filtered.map((r) => r.pid),
      apiToken
    )

    const notFound: string[] = []
    let rejected = 0

    for (const r of filtered) {
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
  const summaryRows = filtered.map((r) => {
    const minutes = (r.duration / 60).toFixed(1)
    return `| \`${r.pid}\` | ${minutes} min | ${r.iriFailCount}/3 | ${r.speedFlag === 1 ? 'Yes' : 'No'} | ${r.subType} |`
  })

  const subTypeCounts = [...bySubType.entries()]
    .map(([subType, list]) => `  - **${subType}:** ${list.length}`)
    .join('\n')

  appendGithubStepSummary(
    [
      '## Prolific AUTO-EXCLUDE Rejection',
      '',
      '> **DESTRUCTIVE OPERATION** - rejected participants will NOT be paid.',
      '',
      `- **Run time (UTC):** ${new Date().toISOString()}`,
      `- **Operator:** ${mdEscape(user.name)}`,
      `- **Study ID:** ${mdEscape(studyId)}`,
      `- **Mode:** ${dryRun ? 'DRY RUN' : 'LIVE REJECTION'}`,
      `- **Criteria:** Disposition == AUTO-EXCLUDE (IRI\\_Fail >= 2 or Speed\\_Flag + IRI\\_Fail >= 1)`,
      '',
      '### Sub-type Breakdown',
      '',
      subTypeCounts,
      '',
      '### Participants',
      '',
      '| PID | Duration | IRI Failed | Speed Flag | Sub-type |',
      '|---|---|---|---|---|',
      ...summaryRows,
      '',
      `**Total:** ${filtered.length}`,
      '',
      '### Message Examples',
      '',
      ...buildMessageExamples(bySubType),
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

/**
 * Build example messages for each sub-type for the step summary.
 */
function buildMessageExamples(bySubType: Map<string, RejectionRecord[]>): string[] {
  const examples: string[] = []
  for (const [subType, list] of bySubType) {
    if (list.length > 0) {
      examples.push(`**${subType}:**`)
      examples.push(`> ${list[0].message}`)
      examples.push('')
    }
  }
  return examples
}

main().catch((error: unknown) => {
  console.error('REJECTION SCRIPT FAILED:', error)
  appendGithubStepSummary('---\n\n## REJECTION FAILED\n\nCheck the job logs for error details.\n')
  process.exit(1)
})
