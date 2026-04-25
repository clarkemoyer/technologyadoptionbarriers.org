/**
 * Send personalized messages to FLAG-disposition participants via Prolific.
 *
 * This script reads a disposition CSV, filters by the specified disposition
 * type, generates a personalized message for each participant based on their
 * flag reason, and sends the message through the Prolific messaging API.
 *
 * Supports all five FLAG dispositions:
 *   FLAG-SPEED, FLAG-SINGLE-IRI, FLAG-SMEAL,
 *   FLAG-RECAPTCHA, FLAG-PARTIAL-STRAIGHTLINING
 *
 * Environment variables:
 *   PROLIFIC_API_TOKEN    – Prolific API token (required)
 *   STUDY_ID              – Prolific study ID (required)
 *   CSV_FILE_PATH         – Path to disposition CSV (required)
 *   DISPOSITION_FILTER    – Which FLAG disposition to process (required)
 *   DRY_RUN               – When "false", send messages live (default: true)
 *   PID_LIST              – Optional comma-separated list of PIDs to process (default: all matching)
 *                           Supports: single PID, comma-separated batch, or empty for all
 */

import {
  getCurrentUser,
  sendMessage,
  listUserMessages,
  listStudySubmissions,
} from '../src/lib/prolific-api'
import { appendGithubStepSummary, mdEscape } from '../src/lib/github-utils'
import { readFileSync } from 'node:fs'
import { parseCsvLine } from '../src/lib/disposition'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VALID_DISPOSITIONS = [
  'FLAG-SPEED',
  'FLAG-SINGLE-IRI',
  'FLAG-SMEAL',
  'FLAG-RECAPTCHA',
  'FLAG-PARTIAL-STRAIGHTLINING',
  'AUTO-EXCLUDE:SPEED_IRI',
  'AUTO-EXCLUDE:IRI2_RETURN',
  'AUTO-EXCLUDE:IRI3_RETURN',
  'AUTO-EXCLUDE:IRI3_SPEED_RETURN',
  'AUTO-EXCLUDE:IRI2_SPEED_RETURN',
] as const

type FlagDisposition = (typeof VALID_DISPOSITIONS)[number]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FlaggedRecord {
  pid: string
  disposition: FlagDisposition
  duration: number
  partialStraightliningBlocks: string
  iriBarrierPass: number
  iriReadinessPass: number
  iriMaturityPass: number
  message: string
}

/* ------------------------------------------------------------------ */
/*  IRI failure details                                                */
/* ------------------------------------------------------------------ */

const IRI_DETAILS = {
  barrier: {
    label: 'Barrier attention check',
    expected: 'Major Barrier',
  },
  readiness: {
    label: 'Readiness attention check',
    expected: 'Low Readiness/Capability',
  },
  maturity: {
    label: 'Maturity attention check',
    expected: 'Level 2: Developing/Repeatable',
  },
}

function buildIriFailureList(record: Omit<FlaggedRecord, 'message'>): string {
  const failures: string[] = []
  if (record.iriBarrierPass === 0) {
    failures.push(
      `(${failures.length + 1}) ${IRI_DETAILS.barrier.label}: the item asked you to select "${IRI_DETAILS.barrier.expected}" but a different answer was recorded`
    )
  }
  if (record.iriReadinessPass === 0) {
    failures.push(
      `(${failures.length + 1}) ${IRI_DETAILS.readiness.label}: the item asked you to select "${IRI_DETAILS.readiness.expected}" but a different answer was recorded`
    )
  }
  if (record.iriMaturityPass === 0) {
    failures.push(
      `(${failures.length + 1}) ${IRI_DETAILS.maturity.label}: the item asked you to select "${IRI_DETAILS.maturity.expected}" but a different answer was recorded`
    )
  }
  return failures.join('. ') + '.'
}

/* ------------------------------------------------------------------ */
/*  Message templates                                                  */
/* ------------------------------------------------------------------ */

function buildFlagMessage(record: Omit<FlaggedRecord, 'message'>): string {
  const minutes = (record.duration / 60).toFixed(1)
  const iriDetails = buildIriFailureList(record)

  switch (record.disposition) {
    case 'FLAG-SPEED':
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        `We are reviewing your submission because it was completed in ${minutes} minutes,`,
        'which is faster than expected for a survey of this length.',
        'However, we note that you answered all attention checks correctly.',
        'Could you briefly explain how you were able to complete the survey so quickly?',
        'We want to treat all participants fairly.',
        'Please reply within 48 hours.',
      ].join(' ')

    case 'FLAG-SINGLE-IRI':
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        'We are reviewing your submission because 1 of 3 embedded attention checks',
        'was answered differently than expected.',
        `Specifically: ${iriDetails}`,
        'This may have been an oversight.',
        'Could you confirm that you read each question carefully?',
        'We want to treat all participants fairly.',
        'Please reply within 48 hours.',
      ].join(' ')

    case 'FLAG-SMEAL':
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        `We are reviewing your submission because your completion time of ${minutes} minutes`,
        'is below our benchmark of 9 minutes, based on the fastest subject matter expert',
        'completion during beta testing.',
        'However, we note that you answered all attention checks correctly.',
        'Could you briefly share your experience completing the survey?',
        'We want to treat all participants fairly.',
        'Please reply within 48 hours.',
      ].join(' ')

    case 'FLAG-RECAPTCHA':
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        'Our automated authenticity checks flagged your submission for additional review.',
        'This does not necessarily mean there is an issue \u2014 false positives can occur.',
        'Could you confirm that you personally completed this survey?',
        'We want to treat all participants fairly.',
        'Please reply within 48 hours.',
      ].join(' ')

    case 'FLAG-PARTIAL-STRAIGHTLINING': {
      const blockNames = record.partialStraightliningBlocks
        ? record.partialStraightliningBlocks.replace(/;/g, ', ')
        : 'flagged'
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        `We are reviewing your submission because your responses in the ${blockNames}`,
        'section(s) showed very little variation, which our quality checks flag for review.',
        'This may reflect your genuine experience \u2014 some respondents do have consistent',
        'views across items.',
        'Could you briefly confirm that you considered each item individually?',
        'We want to treat all participants fairly.',
        'Please reply within 48 hours.',
      ].join(' ')
    }

    case 'AUTO-EXCLUDE:SPEED_IRI':
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        `We are reviewing your submission because it was completed in ${minutes} minutes`,
        'and one of three embedded attention checks was answered differently than expected.',
        'We would like to learn more before making a final decision on your submission.',
        'Could you please share: (1) What is your professional background and role?',
        '(2) What were your overall thoughts on the survey and its topics?',
        '(3) How were you able to complete the survey so quickly?',
        'We want to treat all participants fairly and appreciate your time.',
        'Please reply within 48 hours.',
      ].join(' ')

    case 'AUTO-EXCLUDE:IRI2_RETURN':
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        'After reviewing your submission, we found that 2 of 3 embedded attention check',
        'questions were answered differently than the instructions specified.',
        `Specifically: ${iriDetails}`,
        'These items are designed to confirm that respondents are reading each question carefully,',
        'and are critical to ensuring the highest quality data for our research.',
        'Rather than rejecting your submission (which would negatively impact your Prolific record),',
        'we would like to offer you the option to return it voluntarily.',
        'To return your submission, go to your Prolific Submissions page and click the',
        'circular arrow icon next to this study to "Return and cancel reward".',
        'If you believe you did answer the attention checks correctly and would like to discuss,',
        'please reply to this message within 48 hours and we will review further.',
        'We appreciate your participation and want to treat all participants fairly.',
      ].join(' ')

    case 'AUTO-EXCLUDE:IRI3_RETURN':
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        'After reviewing your submission, we found that all 3 of the embedded attention check',
        'questions were answered differently than the instructions specified.',
        `Specifically: ${iriDetails}`,
        'These items are designed to confirm that respondents are reading each question carefully,',
        'and are critical to ensuring the highest quality data for our research.',
        'Rather than rejecting your submission (which would negatively impact your Prolific record),',
        'we would like to offer you the option to return it voluntarily.',
        'To return your submission, go to your Prolific Submissions page and click the',
        'circular arrow icon next to this study to "Return and cancel reward".',
        'If you believe you did answer the attention checks correctly and would like to discuss,',
        'please reply to this message within 48 hours and we will review further.',
        'We appreciate your participation and want to treat all participants fairly.',
      ].join(' ')

    case 'AUTO-EXCLUDE:IRI3_SPEED_RETURN':
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        `After reviewing your submission, we found that it was completed in ${minutes} minutes`,
        '(below our 5-minute minimum) and all 3 of the embedded attention check questions',
        'were answered differently than the instructions specified.',
        `Specifically: ${iriDetails}`,
        'Both completion speed and attention checks are critical to ensuring the highest',
        'quality data for our research.',
        'Rather than rejecting your submission (which would negatively impact your Prolific record),',
        'we would like to offer you the option to return it voluntarily.',
        'To return your submission, go to your Prolific Submissions page and click the',
        'circular arrow icon next to this study to "Return and cancel reward".',
        'If you believe this is an error and would like to discuss,',
        'please reply to this message within 48 hours and we will review further.',
        'We appreciate your participation and want to treat all participants fairly.',
      ].join(' ')

    case 'AUTO-EXCLUDE:IRI2_SPEED_RETURN':
      return [
        'Hi, thank you for participating in our Technology Adoption Barriers Survey.',
        `After reviewing your submission, we found that it was completed in ${minutes} minutes`,
        '(below our 5-minute minimum) and 2 of 3 embedded attention check questions',
        'were answered differently than the instructions specified.',
        `Specifically: ${iriDetails}`,
        'Both completion speed and attention checks are critical to ensuring the highest',
        'quality data for our research.',
        'Rather than rejecting your submission (which would negatively impact your Prolific record),',
        'we would like to offer you the option to return it voluntarily.',
        'To return your submission, go to your Prolific Submissions page and click the',
        'circular arrow icon next to this study to "Return and cancel reward".',
        'If you believe this is an error and would like to discuss,',
        'please reply to this message within 48 hours and we will review further.',
        'We appreciate your participation and want to treat all participants fairly.',
      ].join(' ')
  }
}

/**
 * Return a unique phrase from each disposition type's message template.
 * Used to detect if a participant already received this specific type of message,
 * without false-matching messages sent for a different flag reason.
 */
function getMessageSignature(disposition: FlagDisposition): string {
  switch (disposition) {
    case 'FLAG-SPEED':
      return 'which is faster than expected for a survey of this length'
    case 'FLAG-SINGLE-IRI':
      return '1 of 3 embedded attention checks was answered differently'
    case 'FLAG-SMEAL':
      return 'below our benchmark of 9 minutes'
    case 'FLAG-RECAPTCHA':
      return 'automated authenticity checks flagged your submission'
    case 'FLAG-PARTIAL-STRAIGHTLINING':
      return 'showed very little variation, which our quality checks flag'
    case 'AUTO-EXCLUDE:SPEED_IRI':
      return 'What is your professional background and role'
    case 'AUTO-EXCLUDE:IRI2_RETURN':
      return '2 of 3 embedded attention check questions were answered differently'
    case 'AUTO-EXCLUDE:IRI3_RETURN':
      return 'all 3 of the embedded attention check questions were answered differently'
    case 'AUTO-EXCLUDE:IRI3_SPEED_RETURN':
      return 'all 3 of the embedded attention check questions were answered differently'
    case 'AUTO-EXCLUDE:IRI2_SPEED_RETURN':
      return '2 of 3 embedded attention check questions were answered differently'
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function envFlag(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name]
  if (value === undefined) return defaultValue
  const normalized = value.trim().toLowerCase()
  if (normalized === '') return defaultValue
  return ['1', 'true', 'yes', 'y', 'on'].includes(normalized)
}

function isValidDisposition(value: string): value is FlagDisposition {
  return (VALID_DISPOSITIONS as readonly string[]).includes(value)
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log('================================================================')
  console.log('  Prolific Flagged Submission Messaging')
  console.log('  Send personalized review messages to flagged participants')
  console.log('================================================================')
  console.log('')

  /* ---------- Validate environment ---------------------------------- */

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

  const dispositionFilter = (process.env.DISPOSITION_FILTER ?? '').trim()
  if (!dispositionFilter) {
    console.error('Error: DISPOSITION_FILTER is required')
    console.error(`  Valid values: ${VALID_DISPOSITIONS.join(', ')}`)
    process.exit(1)
  }
  if (!isValidDisposition(dispositionFilter)) {
    console.error(`Error: Invalid DISPOSITION_FILTER: "${dispositionFilter}"`)
    console.error(`  Valid values: ${VALID_DISPOSITIONS.join(', ')}`)
    process.exit(1)
  }

  const dryRun = envFlag('DRY_RUN', true)

  console.log(`Disposition filter: ${dispositionFilter}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('')

  /* ---------- Load CSV and build flagged records ---------------------- */

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
  const durationIdx = col('Duration_Seconds')
  const partialBlocksIdx = col('Partial_Straightlining_Blocks')
  const iriFailIdx = col('IRI_Fail_Count')
  const speedIdx = col('Speed_Flag')
  const iriBarrierIdx = col('IRI_Barrier_Pass')
  const iriReadinessIdx = col('IRI_Readiness_Pass')
  const iriMaturityIdx = col('IRI_Maturity_Pass')

  const records: FlaggedRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    const pid = (fields[pidIdx] ?? '').trim()
    const disposition = (fields[dispositionIdx] ?? '').trim()

    // For compound filters like AUTO-EXCLUDE:SPEED_IRI, match disposition + sub-type
    let matches = false
    if (dispositionFilter === 'AUTO-EXCLUDE:SPEED_IRI') {
      const iriFail = parseInt(fields[iriFailIdx] ?? '0', 10)
      const speed = parseInt(fields[speedIdx] ?? '0', 10)
      matches = disposition === 'AUTO-EXCLUDE' && speed === 1 && iriFail === 1
    } else if (dispositionFilter === 'AUTO-EXCLUDE:IRI2_RETURN') {
      const iriFail = parseInt(fields[iriFailIdx] ?? '0', 10)
      const speed = parseInt(fields[speedIdx] ?? '0', 10)
      matches = disposition === 'AUTO-EXCLUDE' && iriFail === 2 && speed === 0
    } else if (dispositionFilter === 'AUTO-EXCLUDE:IRI3_RETURN') {
      const iriFail = parseInt(fields[iriFailIdx] ?? '0', 10)
      const speed = parseInt(fields[speedIdx] ?? '0', 10)
      matches = disposition === 'AUTO-EXCLUDE' && iriFail >= 3 && speed === 0
    } else if (dispositionFilter === 'AUTO-EXCLUDE:IRI3_SPEED_RETURN') {
      const iriFail = parseInt(fields[iriFailIdx] ?? '0', 10)
      const speed = parseInt(fields[speedIdx] ?? '0', 10)
      matches = disposition === 'AUTO-EXCLUDE' && iriFail >= 3 && speed === 1
    } else if (dispositionFilter === 'AUTO-EXCLUDE:IRI2_SPEED_RETURN') {
      const iriFail = parseInt(fields[iriFailIdx] ?? '0', 10)
      const speed = parseInt(fields[speedIdx] ?? '0', 10)
      matches = disposition === 'AUTO-EXCLUDE' && iriFail === 2 && speed === 1
    } else {
      matches = disposition === dispositionFilter
    }

    if (!pid || !matches) continue

    const partial: Omit<FlaggedRecord, 'message'> = {
      pid,
      disposition: dispositionFilter,
      duration: parseInt(fields[durationIdx] ?? '0', 10) || 0,
      partialStraightliningBlocks: (fields[partialBlocksIdx] ?? '').trim(),
      iriBarrierPass: parseInt(fields[iriBarrierIdx] ?? '0', 10),
      iriReadinessPass: parseInt(fields[iriReadinessIdx] ?? '0', 10),
      iriMaturityPass: parseInt(fields[iriMaturityIdx] ?? '0', 10),
    }

    records.push({
      ...partial,
      message: buildFlagMessage(partial),
    })
  }

  /* ---------- Apply PID filter ---------------------------------------- */
  const pidListRaw = (process.env.PID_LIST ?? '').trim()
  const pidFilter = pidListRaw
    ? new Set(
        pidListRaw
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
      )
    : null

  const filtered = pidFilter ? records.filter((r) => pidFilter.has(r.pid)) : records

  console.log(`Parsed ${lines.length - 1} data rows`)
  console.log(`Participants matching ${dispositionFilter}: ${records.length}`)
  if (pidFilter) {
    console.log(`PID filter: ${pidFilter.size} PID(s) specified, matched: ${filtered.length}`)
    const missing = [...pidFilter].filter((p) => !filtered.find((r) => r.pid === p))
    if (missing.length > 0) console.log(`Not found in ${dispositionFilter}: ${missing.join(', ')}`)
  }
  console.log('')

  if (filtered.length === 0) {
    console.log(`No participants with disposition ${dispositionFilter}.`)
    appendGithubStepSummary(
      `## Prolific Flagged Submission Messaging\n\nNo participants with disposition ${dispositionFilter}.\n`
    )
    return
  }

  /* ---------- Log every message -------------------------------------- */

  console.log('Message details:')
  console.log('')
  for (const r of filtered) {
    const minutes = (r.duration / 60).toFixed(1)
    console.log(`  PID: ${r.pid}`)
    console.log(`    Duration: ${minutes} min | Disposition: ${r.disposition}`)
    if (r.partialStraightliningBlocks) {
      console.log(`    Flagged blocks: ${r.partialStraightliningBlocks}`)
    }
    console.log(`    Message: ${r.message}`)
    console.log('')
  }

  /* ---------- Verify API connection + build submission ID map ---------- */

  console.log('Verifying Prolific API connection...')
  const user = await getCurrentUser(apiToken)
  console.log(`Connected as: ${user.name} (${user.email})`)

  const SKIP_STATUSES = new Set(['APPROVED', 'REJECTED', 'RETURNED', 'TIMED-OUT'])

  /* ---------- Execute or dry run ------------------------------------- */

  if (dryRun) {
    console.log('================================================================')
    console.log('  DRY RUN \u2014 no messages will be sent')
    console.log(`  Would message: ${filtered.length} participants`)
    console.log(`  Disposition: ${dispositionFilter}`)
    console.log('  Set DRY_RUN=false to send messages')
    console.log('================================================================')
  } else {
    console.log('================================================================')
    console.log(`  SENDING MESSAGES: ${filtered.length} participants`)
    console.log(`  Study: ${studyId}`)
    console.log(`  Disposition: ${dispositionFilter}`)
    console.log(`  Operator: ${user.name} (${user.email})`)
    console.log('================================================================')
    console.log('')

    // Fetch fresh submission statuses right before sending (minimizes race window)
    console.log('Fetching fresh submission statuses...')
    const freshSubs = await listStudySubmissions(studyId, apiToken)
    const statusMap = new Map<string, string>()
    for (const s of freshSubs.results || []) {
      statusMap.set(s.participant_id, s.status)
    }
    console.log(`Loaded ${statusMap.size} statuses`)
    console.log('')

    let sent = 0
    let failed = 0
    let skippedAlreadyMessaged = 0
    let skippedAlreadyActioned = 0

    for (const r of filtered) {
      try {
        // Check submission status (fresh batch fetched right before this loop)
        const submissionStatus = statusMap.get(r.pid)
        if (submissionStatus && SKIP_STATUSES.has(submissionStatus)) {
          skippedAlreadyActioned++
          console.log(`  SKIPPED ${r.pid} - submission is ${submissionStatus}`)
          continue
        }

        // Check if participant already received this same message
        const existingMsgs = await listUserMessages(r.pid, apiToken)
        const studyMessages = (existingMsgs.results || []).filter(
          (m) => m.data?.study_id === studyId
        )
        // Extract a key phrase from the new message to match against existing ones.
        // Each disposition type has a unique phrase in its template.
        const messageSignature = getMessageSignature(r.disposition)
        const alreadySent = studyMessages.some((m) => m.body.includes(messageSignature))
        if (alreadySent) {
          skippedAlreadyMessaged++
          console.log(`  SKIPPED ${r.pid} - already received this ${r.disposition} message`)
          continue
        }
        if (studyMessages.length > 0) {
          console.log(
            `  NOTE: ${r.pid} has ${studyMessages.length} existing message(s) but none match this disposition type - sending new message`
          )
        }

        console.log(`  Sending message to ${r.pid}...`)
        await sendMessage(studyId, r.pid, r.message, apiToken)
        sent++
        console.log(`    Sent successfully`)
      } catch (error: unknown) {
        failed++
        const errMsg =
          error instanceof Error
            ? `${error.message}${(error as Record<string, unknown>).statusCode ? ` (HTTP ${(error as Record<string, unknown>).statusCode})` : ''}${(error as Record<string, unknown>).response ? ` Response: ${JSON.stringify((error as Record<string, unknown>).response)}` : ''}`
            : JSON.stringify(error)
        console.error(`    FAILED to send to ${r.pid}: ${errMsg}`)
      }
    }

    console.log('')
    console.log(
      `SENT: ${sent} | SKIPPED (already actioned): ${skippedAlreadyActioned} | SKIPPED (already messaged): ${skippedAlreadyMessaged} | FAILED: ${failed}`
    )
  }

  /* ---------- Step summary ------------------------------------------- */

  const summaryRows = filtered.map((r) => {
    const minutes = (r.duration / 60).toFixed(1)
    return `| \`${r.pid}\` | ${minutes} min | ${r.disposition} |`
  })

  appendGithubStepSummary(
    [
      '## Prolific Flagged Submission Messaging',
      '',
      `- **Run time (UTC):** ${new Date().toISOString()}`,
      `- **Operator:** ${mdEscape(user.name)}`,
      `- **Study ID:** ${mdEscape(studyId)}`,
      `- **Disposition filter:** ${dispositionFilter}`,
      `- **Mode:** ${dryRun ? 'DRY RUN' : 'LIVE'}`,
      '',
      '### Participants',
      '',
      '| PID | Duration | Disposition |',
      '|---|---|---|',
      ...summaryRows,
      '',
      `**Total:** ${filtered.length}`,
      '',
      '### Sample Message',
      '',
      '> ' + filtered[0].message,
      '',
      dryRun
        ? '> **Dry run** \u2014 no messages sent.'
        : '> **All listed participants have been messaged.**',
      '',
    ].join('\n')
  )

  console.log('')
  console.log('Done')
}

main().catch((error: unknown) => {
  console.error('MESSAGING SCRIPT FAILED:', error)
  appendGithubStepSummary('---\n\n## MESSAGING FAILED\n\nCheck the job logs for error details.\n')
  process.exit(1)
})
