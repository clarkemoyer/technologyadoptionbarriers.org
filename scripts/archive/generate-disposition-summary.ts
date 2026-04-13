/**
 * Generate disposition-summary.json from live Prolific API data + disposition CSV.
 *
 * This script combines:
 *   1. Prolific API - real submission statuses (approved, rejected, returned, etc.)
 *   2. Disposition CSV - triage results (CLEAN, AUTO-EXCLUDE, FLAG-*, etc.)
 *
 * Output: src/data/disposition-summary.json (committed to repo, drives the dashboard page)
 *
 * Environment variables:
 *   PROLIFIC_API_TOKEN  – Prolific API token (required)
 *   STUDY_ID            – Prolific study ID (required)
 *   CSV_FILE_PATH       – Path to disposition CSV from pipeline (required)
 */

import {
  getStudy,
  listStudySubmissions,
  listRecentMessages,
  type Submission,
} from '../src/lib/prolific-api'
import { parseCsvLine } from '../src/lib/disposition'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

async function main() {
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

  console.log('Generating disposition summary from live data...')
  console.log('')

  /* ---------- 1. Fetch live Prolific data ------------------------------ */
  console.log('Fetching Prolific study data...')
  const [study, submissionsResponse, messagesResponse] = await Promise.all([
    getStudy(studyId, apiToken),
    listStudySubmissions(studyId, apiToken),
    listRecentMessages(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      apiToken
    ).catch(() => ({ results: [] })),
  ])

  const submissions: Submission[] = submissionsResponse.results || []
  const messages = messagesResponse.results || []

  // Build PID → Prolific status map for cross-reference
  const statusByPid = new Map<string, string>()
  const statusCounts: Record<string, number> = {}
  for (const sub of submissions) {
    const status = sub.status || 'UNKNOWN'
    statusCounts[status] = (statusCounts[status] || 0) + 1
    statusByPid.set(sub.participant_id, status)
  }

  console.log(`Study: ${study.name}`)
  console.log(`Total submissions: ${submissions.length}`)
  for (const [status, count] of Object.entries(statusCounts).sort(([, a], [, b]) => b - a)) {
    console.log(`  ${status}: ${count}`)
  }

  // Count unique participants messaged (filter to this study)
  const messagedPids = new Set<string>()
  for (const msg of messages) {
    if (msg.data?.study_id === studyId) {
      // The sender_id on outgoing messages is the researcher; channel_id links to participant
      messagedPids.add(msg.channel_id)
    }
  }
  console.log(`Unique participants messaged: ${messagedPids.size}`)
  console.log('')

  /* ---------- 2. Parse disposition CSV --------------------------------- */
  console.log('Parsing disposition CSV...')
  const rawCsv = readFileSync(csvFilePath, 'utf-8')
  const lines = rawCsv
    .trimEnd()
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')

  const headers = parseCsvLine(lines[0])
  const col = (name: string): number => {
    const idx = headers.indexOf(name)
    if (idx === -1) {
      console.error(`Error: Required column "${name}" not found in CSV headers`)
      console.error(`Available columns: ${headers.join(', ')}`)
      process.exit(1)
    }
    return idx
  }

  const pidIdx = col('PROLIFIC_PID')
  const dispositionIdx = col('Disposition')
  const iriFailIdx = col('IRI_Fail_Count')
  const speedIdx = col('Speed_Flag')
  const iriBarrierIdx = col('IRI_Barrier_Pass')
  const iriReadinessIdx = col('IRI_Readiness_Pass')
  const iriMaturityIdx = col('IRI_Maturity_Pass')

  // Count dispositions
  const dispositions: Record<string, number> = {}
  const autoExcludeBreakdown: Record<string, number> = {
    IRI3_SPEED: 0,
    IRI3: 0,
    IRI2_SPEED: 0,
    IRI2: 0,
    SPEED_IRI: 0,
  }

  // dispositionByStatus[disposition][prolificStatus] = count
  const dispositionByStatus: Record<string, Record<string, number>> = {}

  let totalParticipants = 0
  let finishedParticipants = 0
  let iriBarrierPass = 0
  let iriReadinessPass = 0
  let iriMaturityPass = 0

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    const disposition = (fields[dispositionIdx] ?? '').trim()
    if (!disposition) continue

    totalParticipants++
    dispositions[disposition] = (dispositions[disposition] || 0) + 1

    // Cross-reference with Prolific status
    const pid = (fields[pidIdx] ?? '').trim()
    const prolificStatus = pid ? (statusByPid.get(pid) ?? 'NO_SUBMISSION') : 'NO_SUBMISSION'
    if (!dispositionByStatus[disposition]) dispositionByStatus[disposition] = {}
    dispositionByStatus[disposition][prolificStatus] =
      (dispositionByStatus[disposition][prolificStatus] || 0) + 1

    // Flag anomalies: AUTO-EXCLUDE should never be APPROVED
    if (disposition === 'AUTO-EXCLUDE' && prolificStatus === 'APPROVED') {
      console.warn(`⚠️  ANOMALY: AUTO-EXCLUDE PID ${pid} is APPROVED on Prolific`)
    }

    // IRI pass rates - count only finished responses (exclude INCOMPLETE)
    // This aligns with CRP analysis which uses V2 finished as denominator.
    // See: https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/675
    if (disposition !== 'INCOMPLETE') {
      finishedParticipants++
      if (iriBarrierIdx >= 0) iriBarrierPass += parseInt(fields[iriBarrierIdx] ?? '0', 10) || 0
      if (iriReadinessIdx >= 0)
        iriReadinessPass += parseInt(fields[iriReadinessIdx] ?? '0', 10) || 0
      if (iriMaturityIdx >= 0) iriMaturityPass += parseInt(fields[iriMaturityIdx] ?? '0', 10) || 0
    }

    // AUTO-EXCLUDE sub-types
    if (disposition === 'AUTO-EXCLUDE') {
      const iriFail = parseInt(fields[iriFailIdx] ?? '0', 10) || 0
      const speed = parseInt(fields[speedIdx] ?? '0', 10)

      if (iriFail >= 3 && speed === 1) autoExcludeBreakdown.IRI3_SPEED++
      else if (iriFail >= 3) autoExcludeBreakdown.IRI3++
      else if (iriFail === 2 && speed === 1) autoExcludeBreakdown.IRI2_SPEED++
      else if (iriFail === 2) autoExcludeBreakdown.IRI2++
      else if (speed === 1 && iriFail >= 1) autoExcludeBreakdown.SPEED_IRI++
    }
  }

  console.log(`Disposition CSV: ${totalParticipants} participants`)
  for (const [d, c] of Object.entries(dispositions).sort(([, a], [, b]) => b - a)) {
    console.log(`  ${d}: ${c}`)
  }
  console.log('')

  console.log('Disposition x Prolific Status cross-reference:')
  for (const [disp, statuses] of Object.entries(dispositionByStatus).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const parts = Object.entries(statuses)
      .sort(([, a], [, b]) => b - a)
      .map(([s, c]) => `${s}:${c}`)
      .join(', ')
    console.log(`  ${disp}: ${parts}`)
  }
  console.log('')

  /* ---------- 3. Build summary JSON ------------------------------------ */
  const summary = {
    updatedAt: new Date().toISOString(),
    totalResponses: submissions.length,
    uniqueParticipants: totalParticipants,
    duplicatesRemoved: 0,
    dispositions,
    dispositionByStatus,
    autoExcludeBreakdown,
    actions: {
      approved: statusCounts['APPROVED'] || 0,
      rejected: statusCounts['REJECTED'] || 0,
      returned: statusCounts['RETURNED'] || 0,
      timedOut: statusCounts['TIMED-OUT'] || 0,
      awaitingReview: statusCounts['AWAITING REVIEW'] || 0,
      active: statusCounts['ACTIVE'] || 0,
      messaged: messagedPids.size,
    },
    // IRI pass rates use finished (non-INCOMPLETE) responses as denominator,
    // matching the CRP analysis convention. Fixes #675.
    iriPassRates: {
      barrier:
        finishedParticipants > 0
          ? parseFloat(((iriBarrierPass / finishedParticipants) * 100).toFixed(1))
          : 0,
      readiness:
        finishedParticipants > 0
          ? parseFloat(((iriReadinessPass / finishedParticipants) * 100).toFixed(1))
          : 0,
      maturity:
        finishedParticipants > 0
          ? parseFloat(((iriMaturityPass / finishedParticipants) * 100).toFixed(1))
          : 0,
      denominator: finishedParticipants,
    },
    studyId,
    studyName: study.name || 'Technology Adoption Barriers Survey (2026 v2)',
  }

  /* ---------- 4. Write to file ----------------------------------------- */
  const outputPath =
    process.env.OUTPUT_PATH || join(process.cwd(), 'src', 'data', 'disposition-summary.json')
  writeFileSync(outputPath, JSON.stringify(summary, null, 2) + '\n', 'utf-8')
  console.log(`Wrote disposition summary to ${outputPath}`)
  console.log('')
  console.log('Actions (from live Prolific API):')
  for (const [action, count] of Object.entries(summary.actions)) {
    console.log(`  ${action}: ${count}`)
  }
}

main().catch((error: unknown) => {
  console.error('Error generating disposition summary:', error)
  process.exit(1)
})
