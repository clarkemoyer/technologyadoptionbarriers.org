import { listRecentMessages, listStudySubmissions } from '../src/lib/prolific-api'

async function main() {
  const token = process.env.PROLIFIC_API_TOKEN!
  const studyId = process.env.STUDY_ID!
  const researcherId = '68264cbfdeb62546fe6060fe'

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const msgs = await listRecentMessages(sevenDaysAgo, token)
  const all = (msgs.results || []).filter((m: any) => m.data?.study_id === studyId)

  // Get submission statuses
  const subs = await listStudySubmissions(studyId, token)
  const subMap = new Map<string, any>()
  for (const s of subs.results || []) subMap.set(s.participant_id, s)

  // Find unique PIDs who replied (sender != researcher)
  const repliedPids = new Set<string>()
  for (const m of all) {
    if (m.sender_id !== researcherId) repliedPids.add(m.sender_id)
  }

  // Filter to AWAITING REVIEW only
  const awaitingReview: string[] = []
  const otherStatus: string[] = []
  for (const pid of repliedPids) {
    const sub = subMap.get(pid)
    const status = sub?.status || 'UNKNOWN'
    if (status === 'AWAITING REVIEW') {
      awaitingReview.push(pid)
      console.log(`APPROVE: ${pid} (${(sub?.time_taken / 60).toFixed(1)} min)`)
    } else {
      otherStatus.push(pid)
      console.log(`SKIP: ${pid} - already ${status}`)
    }
  }

  console.log('')
  console.log(`Total replied: ${repliedPids.size}`)
  console.log(`Awaiting review (to approve): ${awaitingReview.length}`)
  console.log(`Already actioned: ${otherStatus.length}`)
  console.log('')
  console.log('PID_LIST=' + awaitingReview.join(','))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
