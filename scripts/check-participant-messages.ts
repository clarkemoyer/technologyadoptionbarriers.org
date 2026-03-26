/**
 * Check messages for a specific participant.
 * Usage: PROLIFIC_API_TOKEN=... STUDY_ID=... PID=... npx tsx scripts/check-participant-messages.ts
 */
import { listStudyMessages } from '../src/lib/prolific-api'

async function main() {
  const token = process.env.PROLIFIC_API_TOKEN
  if (!token) { console.error('PROLIFIC_API_TOKEN required'); process.exit(1) }
  const studyId = process.env.STUDY_ID
  if (!studyId) { console.error('STUDY_ID required'); process.exit(1) }
  const pid = process.env.PID
  if (!pid) { console.error('PID required'); process.exit(1) }

  console.log(`Fetching messages for PID ${pid} in study ${studyId}...\n`)
  const msgs = await listStudyMessages(studyId, token)
  const all = msgs.results || []
  const filtered = all.filter((m: Record<string, unknown>) => m.participant_id === pid)

  if (filtered.length === 0) {
    console.log('No messages found for this participant.')
    console.log(`Total messages in study: ${all.length}`)
  } else {
    console.log(`Found ${filtered.length} message(s):\n`)
    for (const m of filtered) {
      console.log(`--- Message ${(m as Record<string, unknown>).id} ---`)
      console.log(`  From: ${(m as Record<string, unknown>).sender_id ?? 'unknown'}`)
      console.log(`  Date: ${(m as Record<string, unknown>).created_at}`)
      console.log(`  Body: ${(m as Record<string, unknown>).body}`)
      console.log('')
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
