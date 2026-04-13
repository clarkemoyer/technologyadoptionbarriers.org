/**
 * Unreject previously rejected submissions (transition REJECTED → AWAITING REVIEW).
 *
 * Used when a rejection should be reversed so the participant can be offered
 * a voluntary return instead.
 *
 * Environment:
 *   PROLIFIC_API_TOKEN  – Prolific API token (required)
 *   STUDY_ID            – Prolific study ID (required)
 *   PID_LIST            – Comma-separated PIDs to unreject (required)
 *   DRY_RUN             – When "false", unreject live (default: true)
 */

import { getCurrentUser, listStudySubmissions, unrejectSubmission } from '../src/lib/prolific-api'

async function main() {
  const token = process.env.PROLIFIC_API_TOKEN
  if (!token) {
    console.error('PROLIFIC_API_TOKEN required')
    process.exit(1)
  }
  const studyId = process.env.STUDY_ID
  if (!studyId) {
    console.error('STUDY_ID required')
    process.exit(1)
  }
  const pidListRaw = process.env.PID_LIST
  if (!pidListRaw) {
    console.error('PID_LIST required')
    process.exit(1)
  }
  const dryRun = (process.env.DRY_RUN ?? 'true').toLowerCase() !== 'false'

  const pids = pidListRaw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  console.log('================================================================')
  console.log('  Unreject Submissions (REJECTED → AWAITING REVIEW)')
  console.log(`  Study: ${studyId}`)
  console.log(`  PIDs: ${pids.length}`)
  console.log(`  Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('================================================================')
  console.log('')

  const user = await getCurrentUser(token)
  console.log(`Connected as: ${user.name} (${user.email})`)
  console.log('')

  // Look up submission IDs
  const subs = await listStudySubmissions(studyId, token)
  const pidToSub = new Map<string, { id: string; status: string }>()
  for (const s of subs.results || []) {
    pidToSub.set(s.participant_id, { id: s.id, status: s.status })
  }

  let unrejected = 0
  let skipped = 0
  let notFound = 0
  let failed = 0

  for (const pid of pids) {
    const sub = pidToSub.get(pid)
    if (!sub) {
      console.log(`  NOT FOUND: ${pid}`)
      notFound++
      continue
    }
    if (sub.status !== 'REJECTED') {
      console.log(`  SKIP: ${pid} - status is ${sub.status} (not REJECTED)`)
      skipped++
      continue
    }

    if (dryRun) {
      console.log(`  DRY RUN: would unreject ${pid} (submission ${sub.id})`)
      unrejected++
    } else {
      try {
        await unrejectSubmission(sub.id, token)
        unrejected++
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error(`  FAILED: ${pid} - ${msg}`)
        failed++
      }
    }
  }

  console.log('')
  console.log(
    `UNREJECTED: ${unrejected} | SKIPPED: ${skipped} | NOT FOUND: ${notFound} | FAILED: ${failed}`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
