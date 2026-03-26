/**
 * Check messages for a specific participant.
 * Usage: PROLIFIC_API_TOKEN=... STUDY_ID=... PID=... npx tsx scripts/check-participant-messages.ts
 */
import { listUserMessages } from '../src/lib/prolific-api'

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

  console.log(`Fetching messages for PID ${pid}...\n`)
  const msgs = await listUserMessages(pid, token)
  const all = msgs.results || []

  if (all.length === 0) {
    console.log('No messages found for this participant.')
  } else {
    console.log(`Found ${all.length} message(s):\n`)
    for (const m of all) {
      console.log(`--- Message ${m.id} ---`)
      console.log(`  From: ${m.sender_id}`)
      console.log(`  Sent: ${m.sent_at}`)
      console.log(`  Study: ${m.data?.study_id ?? 'N/A'}`)
      console.log(`  Category: ${m.data?.category ?? 'N/A'}`)
      console.log(`  Body: ${m.body}`)
      console.log('')
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
