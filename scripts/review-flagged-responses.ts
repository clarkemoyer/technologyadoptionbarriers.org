/**
 * TABS V2 Flagged Response Review Dashboard
 *
 * Reads a disposition CSV, identifies all FLAG-* participants,
 * checks their messaging status (placeholder - messaging API WIP),
 * and generates a RECOMMENDATION report.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  THIS SCRIPT DOES NOT APPROVE OR REJECT ANYONE.                ║
 * ║  It only produces RECOMMENDATIONS for human review.             ║
 * ║  The human makes the final decision using the existing          ║
 * ║  approve/reject workflows.                                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Environment variables:
 *   CSV_FILE_PATH  – Path to the disposition CSV (required)
 *   OUTPUT_PATH    – Path to write the review CSV (required)
 *   STUDY_ID       – Prolific study ID (required for messaging lookup)
 *   DRY_RUN        – When "true", skip API calls and use placeholder data (default: true)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { appendGithubStepSummary, mdEscape } from '../src/lib/github-utils'
import { parseCsvLine } from '../src/lib/disposition'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Possible message statuses for a flagged participant */
type MessageStatus = 'REPLIED' | 'NO_REPLY' | 'NOT_MESSAGED' | 'PENDING'

/** Possible recommendations (for human review only) */
type Recommendation = 'APPROVE' | 'REJECT' | 'WAIT'

interface FlaggedParticipant {
  pid: string
  disposition: string
  messageStatus: MessageStatus
  recommendation: Recommendation
  messageSentAt: string
  replyReceivedAt: string
  notes: string
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

/* ------------------------------------------------------------------ */
/*  Message status checking (placeholder)                              */
/* ------------------------------------------------------------------ */

// TODO: Replace these placeholder functions with real Prolific messaging
// API calls once the messaging workflow (issue #544) is complete.
// The messaging API client is being built in parallel by another agent.
// When ready, import { listStudyMessages, getMessageThread } from
// '../src/lib/prolific-api' and use them to check actual message status.

/**
 * PLACEHOLDER: Check the messaging status for a flagged participant.
 *
 * In production, this will:
 * 1. Look up messages sent to this PID via listStudyMessages()
 * 2. If a message exists, check getMessageThread() for replies
 * 3. If a reply exists, return 'REPLIED'
 * 4. If no reply and message was sent > 48h ago, return 'NO_REPLY'
 * 5. If no reply and message was sent < 48h ago, return 'PENDING'
 * 6. If no message was sent, return 'NOT_MESSAGED'
 *
 * TODO: Replace with real API calls when messaging workflow is ready.
 *
 * @param _pid - Participant ID (unused in placeholder)
 * @param _studyId - Prolific study ID (unused in placeholder)
 * @param _apiToken - Prolific API token (unused in placeholder)
 * @returns Placeholder message status info
 */
async function checkMessageStatus(
  _pid: string,
  _studyId: string,
  _apiToken: string
): Promise<{
  status: MessageStatus
  messageSentAt: string
  replyReceivedAt: string
}> {
  // TODO: Replace with real Prolific messaging API calls.
  // For now, all flagged participants are reported as NOT_MESSAGED
  // since the messaging workflow is being built in parallel.
  return {
    status: 'NOT_MESSAGED',
    messageSentAt: '',
    replyReceivedAt: '',
  }
}

/* ------------------------------------------------------------------ */
/*  Recommendation logic                                               */
/* ------------------------------------------------------------------ */

/**
 * Determine a recommendation based on message status.
 *
 * IMPORTANT: These are RECOMMENDATIONS only. A human must review
 * each case and make the final approve/reject decision using the
 * existing workflows.
 *
 * Logic:
 *   REPLIED     → APPROVE (human should review the reply content first)
 *   NO_REPLY    → REJECT  (48h elapsed with no response)
 *   PENDING     → WAIT    (message sent < 48h ago, still waiting)
 *   NOT_MESSAGED → WAIT   (need to send a message first)
 */
function getRecommendation(messageStatus: MessageStatus): Recommendation {
  switch (messageStatus) {
    case 'REPLIED':
      return 'APPROVE'
    case 'NO_REPLY':
      return 'REJECT'
    case 'PENDING':
      return 'WAIT'
    case 'NOT_MESSAGED':
      return 'WAIT'
  }
}

/**
 * Human-readable explanation of the recommendation.
 */
function getRecommendationNotes(messageStatus: MessageStatus, disposition: string): string {
  switch (messageStatus) {
    case 'REPLIED':
      return `Participant replied to ${disposition} message - human should review reply content before approving`
    case 'NO_REPLY':
      return `No reply after 48h to ${disposition} message - recommend rejection`
    case 'PENDING':
      return `Message sent < 48h ago for ${disposition} - waiting for reply`
    case 'NOT_MESSAGED':
      return `No message sent yet for ${disposition} - send FLAG message first`
  }
}

/* ------------------------------------------------------------------ */
/*  CSV output                                                         */
/* ------------------------------------------------------------------ */

function toReviewCsv(rows: FlaggedParticipant[]): string {
  const headers = [
    'PROLIFIC_PID',
    'Disposition',
    'Message_Status',
    'Recommendation',
    'Message_Sent_At',
    'Reply_Received_At',
    'Notes',
  ]

  const lines = [headers.join(',')]
  for (const row of rows) {
    const fields = [
      row.pid,
      row.disposition,
      row.messageStatus,
      row.recommendation,
      row.messageSentAt,
      row.replyReceivedAt,
      // Quote notes field since it may contain commas
      `"${row.notes.replace(/"/g, '""')}"`,
    ]
    lines.push(fields.join(','))
  }
  return lines.join('\n') + '\n'
}

/* ------------------------------------------------------------------ */
/*  Summary generation                                                 */
/* ------------------------------------------------------------------ */

function generateSummary(rows: FlaggedParticipant[], studyId: string, dryRun: boolean): string {
  if (rows.length === 0) {
    return [
      '## Flagged Response Review (Recommendations Only)',
      '',
      '> This report contains **recommendations only**. No participants are approved or rejected by this workflow.',
      '',
      `**Study ID:** ${mdEscape(studyId)}`,
      '',
      'No flagged participants found in the disposition data.',
      '',
    ].join('\n')
  }

  // Count by disposition
  const dispCounts: Record<string, number> = {}
  for (const row of rows) {
    dispCounts[row.disposition] = (dispCounts[row.disposition] || 0) + 1
  }

  // Count by message status
  const statusCounts: Record<string, number> = {}
  for (const row of rows) {
    statusCounts[row.messageStatus] = (statusCounts[row.messageStatus] || 0) + 1
  }

  // Count by recommendation
  const recCounts: Record<string, number> = {}
  for (const row of rows) {
    recCounts[row.recommendation] = (recCounts[row.recommendation] || 0) + 1
  }

  const dispRows = Object.entries(dispCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([disp, count]) => `| ${disp} | ${count} |`)
    .join('\n')

  const statusRows = Object.entries(statusCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([status, count]) => `| ${status} | ${count} |`)
    .join('\n')

  const recRows = Object.entries(recCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([rec, count]) => `| ${rec} | ${count} |`)
    .join('\n')

  // Detail table (up to 50 rows to avoid enormous summaries)
  const detailRows = rows
    .slice(0, 50)
    .map(
      (r) => `| \`${r.pid}\` | ${r.disposition} | ${r.messageStatus} | **${r.recommendation}** |`
    )
    .join('\n')

  const truncationNote =
    rows.length > 50
      ? `\n> Showing first 50 of ${rows.length} flagged participants. See the full CSV artifact for all rows.\n`
      : ''

  return [
    '## Flagged Response Review (Recommendations Only)',
    '',
    '> **IMPORTANT:** This report contains **recommendations only**.',
    '> No participants are approved or rejected by this workflow.',
    '> A human must review each case and use the existing approve/reject workflows to take action.',
    '',
    `- **Run time (UTC):** ${new Date().toISOString()}`,
    `- **Study ID:** ${mdEscape(studyId)}`,
    `- **Mode:** ${dryRun ? 'Dry run (placeholder data)' : 'Live'}`,
    `- **Total flagged:** ${rows.length}`,
    '',
    '### Disposition Breakdown',
    '',
    '| Disposition | Count |',
    '|---|---:|',
    dispRows,
    '',
    '### Message Status',
    '',
    '| Status | Count |',
    '|---|---:|',
    statusRows,
    '',
    '### Recommendations',
    '',
    '| Recommendation | Count |',
    '|---|---:|',
    recRows,
    '',
    '### Detail',
    '',
    '| PID | Disposition | Message Status | Recommendation |',
    '|---|---|---|---|',
    detailRows,
    truncationNote,
    '',
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log('================================================================')
  console.log('  Flagged Response Review Dashboard')
  console.log('  RECOMMENDATIONS ONLY - does NOT approve or reject anyone')
  console.log('================================================================')
  console.log('')

  const csvFilePath = process.env.CSV_FILE_PATH
  if (!csvFilePath) {
    console.error('Error: CSV_FILE_PATH is required')
    process.exit(1)
  }

  const outputPath = process.env.OUTPUT_PATH
  if (!outputPath) {
    console.error('Error: OUTPUT_PATH is required')
    process.exit(1)
  }

  const studyId = process.env.STUDY_ID
  if (!studyId) {
    console.error('Error: STUDY_ID is required')
    process.exit(1)
  }

  const dryRun = envFlag('DRY_RUN', true)
  const apiToken = process.env.PROLIFIC_API_TOKEN ?? ''

  /* ---------- Load disposition CSV ----------------------------------- */
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
  const dispIdx = headers.indexOf('Disposition')

  if (pidIdx === -1) {
    console.error('Error: PROLIFIC_PID column not found in CSV')
    process.exit(1)
  }
  if (dispIdx === -1) {
    console.error('Error: Disposition column not found in CSV')
    process.exit(1)
  }

  /* ---------- Extract flagged participants --------------------------- */
  const flaggedRows: Array<{ pid: string; disposition: string }> = []

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    const pid = (fields[pidIdx] ?? '').trim()
    const disposition = (fields[dispIdx] ?? '').trim()

    if (!pid) continue

    // Include all FLAG-* dispositions (not CLEAN, AUTO-EXCLUDE, or INCOMPLETE)
    if (disposition.startsWith('FLAG-')) {
      flaggedRows.push({ pid, disposition })
    }
  }

  console.log(`Parsed ${lines.length - 1} data rows`)
  console.log(`Flagged participants: ${flaggedRows.length}`)
  console.log('')

  if (flaggedRows.length === 0) {
    console.log('No flagged participants found. Nothing to review.')
    const summary = generateSummary([], studyId, dryRun)
    console.log(summary)
    appendGithubStepSummary(summary)

    // Write empty CSV with headers only
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(
      outputPath,
      'PROLIFIC_PID,Disposition,Message_Status,Recommendation,Message_Sent_At,Reply_Received_At,Notes\n',
      'utf-8'
    )
    console.log(`Wrote empty review CSV to ${outputPath}`)
    return
  }

  /* ---------- Check message status for each flagged PID -------------- */
  console.log('Checking message status for flagged participants...')
  if (dryRun) {
    console.log('  (Dry run: using placeholder data - no API calls)')
  }
  console.log('')

  const results: FlaggedParticipant[] = []

  for (const { pid, disposition } of flaggedRows) {
    // TODO: When messaging API is ready, pass real apiToken and studyId
    // to get actual message status from Prolific.
    const { status, messageSentAt, replyReceivedAt } = await checkMessageStatus(
      pid,
      studyId,
      apiToken
    )

    const recommendation = getRecommendation(status)
    const notes = getRecommendationNotes(status, disposition)

    results.push({
      pid,
      disposition,
      messageStatus: status,
      recommendation,
      messageSentAt,
      replyReceivedAt,
      notes,
    })
  }

  /* ---------- Output results ----------------------------------------- */
  // Log individual results
  for (const r of results) {
    console.log(`  ${r.pid}: ${r.disposition} | ${r.messageStatus} | ${r.recommendation}`)
  }
  console.log('')

  // Write review CSV
  const csv = toReviewCsv(results)
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, csv, 'utf-8')
  console.log(`Wrote review CSV to ${outputPath} (${results.length} rows)`)

  // Generate and write step summary
  const summary = generateSummary(results, studyId, dryRun)
  console.log('')
  console.log(summary)
  appendGithubStepSummary(summary)

  console.log('')
  console.log('REMINDER: This report contains RECOMMENDATIONS only.')
  console.log('A human must review each case and take action via the')
  console.log('existing approve/reject workflows.')
  console.log('')
  console.log('Done')
}

main().catch((error: unknown) => {
  console.error('Review script failed:', error)
  appendGithubStepSummary(
    '---\n\n## Flagged Response Review FAILED\n\nCheck the job logs for error details.\n'
  )
  process.exit(1)
})
