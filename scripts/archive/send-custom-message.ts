/**
 * Send a custom message to a specific participant.
 *
 * Environment:
 *   PROLIFIC_API_TOKEN  – Prolific API token (required)
 *   STUDY_ID            – Prolific study ID (required)
 *   PID                 – Participant ID to message (required)
 *   MESSAGE             – Message body to send (required)
 *   DRY_RUN             – When "false", send live (default: true)
 */

import { sendMessage } from '../src/lib/prolific-api'

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
  const pid = process.env.PID
  if (!pid) {
    console.error('PID required')
    process.exit(1)
  }
  const message = process.env.MESSAGE
  if (!message) {
    console.error('MESSAGE required')
    process.exit(1)
  }
  const dryRun = (process.env.DRY_RUN ?? 'true').toLowerCase() !== 'false'

  console.log(`PID: ${pid}`)
  console.log(`Message length: ${message.length} chars`)
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('')
  console.log(`Message: ${message}`)
  console.log('')

  if (dryRun) {
    console.log('DRY RUN - message not sent')
  } else {
    await sendMessage(studyId, pid, message, token)
    console.log('Message sent successfully')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
