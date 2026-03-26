/**
 * Fetch all recent messages and show conversations grouped by participant.
 */
import { listRecentMessages, listStudySubmissions } from '../src/lib/prolific-api'

async function main() {
  const token = process.env.PROLIFIC_API_TOKEN!
  const studyId = process.env.STUDY_ID!
  const researcherId = '68264cbfdeb62546fe6060fe'

  // Get all messages from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const msgs = await listRecentMessages(sevenDaysAgo, token)
  const all = (msgs.results || []).filter((m: any) => m.data?.study_id === studyId)

  // Get all submissions to know statuses
  const subs = await listStudySubmissions(studyId, token)
  const subMap = new Map<string, any>()
  for (const s of subs.results || []) {
    subMap.set(s.participant_id, s)
  }

  // Group messages by channel (conversation thread)
  const channels = new Map<string, any[]>()
  for (const m of all) {
    const ch = (m as any).channel_id
    if (!channels.has(ch)) channels.set(ch, [])
    channels.get(ch)!.push(m)
  }

  // Find channels where a participant replied (not just researcher messages)
  for (const [channelId, messages] of channels) {
    const participantMsgs = messages.filter((m: any) => m.sender_id !== researcherId)
    if (participantMsgs.length === 0) continue // No reply from participant

    // Find the participant ID from replies
    const pid = participantMsgs[0].sender_id
    const sub = subMap.get(pid)
    const status = sub?.status || 'UNKNOWN'

    console.log(`========================================`)
    console.log(`PID: ${pid}`)
    console.log(`Status: ${status}`)
    console.log(
      `Time taken: ${sub?.time_taken ? (sub.time_taken / 60).toFixed(1) + ' min' : 'N/A'}`
    )
    console.log(`Messages: ${messages.length} (${participantMsgs.length} from participant)`)
    console.log(``)

    // Sort by message ID (roughly chronological)
    messages.sort((a: any, b: any) => (a.id > b.id ? 1 : -1))

    for (const m of messages) {
      const who = m.sender_id === researcherId ? 'RESEARCHER' : 'PARTICIPANT'
      const body = (m.body as string).replace(/\n/g, ' ').substring(0, 300)
      console.log(`  [${who}] ${body}`)
    }
    console.log(``)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
