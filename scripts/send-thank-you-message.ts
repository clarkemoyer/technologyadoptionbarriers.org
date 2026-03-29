/**
 * Send a thank-you message to approved participants.
 *
 * Environment:
 *   PROLIFIC_API_TOKEN  – Prolific API token (required)
 *   STUDY_ID            – Prolific study ID (required)
 *   PID_LIST            – Comma-separated PIDs to message (required)
 *   DRY_RUN             – When "false", send messages live (default: true)
 */

import {
  sendMessage,
  listUserMessages,
  listStudySubmissions,
  getSubmission,
} from '../src/lib/prolific-api'

const THANK_YOU_MESSAGE =
  'Hi, thank you for participating in our Technology Adoption Barriers Survey and for taking the time to respond to our review message. Your submission has been approved. We appreciate your thoughtful engagement and the insights you shared — they are valuable to our research. Thank you again for your contribution!'

const SIGNATURE = 'Your submission has been approved'

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
  console.log(`Sending thank-you messages to ${pids.length} participants`)
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('')

  // Build PID → submission ID map for per-PID live status checks
  console.log('Fetching submission IDs...')
  const submissions = await listStudySubmissions(studyId, token)
  const pidToSubId = new Map<string, string>()
  for (const s of submissions.results || []) {
    pidToSubId.set(s.participant_id, s.id)
  }
  console.log(`Loaded ${pidToSubId.size} submissions`)
  console.log('')

  let sent = 0
  let skipped = 0
  let skippedNotApproved = 0
  let failed = 0

  for (const pid of pids) {
    try {
      // Fresh per-PID status check right before sending (not cached)
      const subId = pidToSubId.get(pid)
      if (subId) {
        const freshSub = await getSubmission(studyId, subId, token)
        if (freshSub.status !== 'APPROVED') {
          skippedNotApproved++
          console.log(`  SKIP ${pid} — status is ${freshSub.status} (not APPROVED, live check)`)
          continue
        }
      }

      // Check for existing thank-you message
      const existing = await listUserMessages(pid, token)
      const alreadySent = (existing.results || []).some(
        (m) => m.data?.study_id === studyId && m.body.includes(SIGNATURE)
      )
      if (alreadySent) {
        console.log(`  SKIP ${pid} — already received thank-you`)
        skipped++
        continue
      }

      if (dryRun) {
        console.log(`  DRY RUN: would message ${pid}`)
        sent++
      } else {
        await sendMessage(studyId, pid, THANK_YOU_MESSAGE, token)
        console.log(`  SENT ${pid}`)
        sent++
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`  FAILED ${pid}: ${msg}`)
      failed++
    }
  }

  console.log('')
  console.log(
    `SENT: ${sent} | SKIPPED (not approved): ${skippedNotApproved} | SKIPPED (already sent): ${skipped} | FAILED: ${failed}`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
