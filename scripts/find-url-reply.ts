import { listStudySubmissions } from '../src/lib/prolific-api'

const RESEARCHER_ID = '68264cbfdeb62546fe6060fe'

async function main() {
  const token = process.env.PROLIFIC_API_TOKEN!
  const studyId = process.env.STUDY_ID!

  const subs = await listStudySubmissions(studyId, token)
  
  for (const sub of subs.results || []) {
    try {
      const resp = await fetch(
        'https://api.prolific.com/api/v1/messages/?user_id=' + sub.participant_id,
        { headers: { 'Authorization': 'Token ' + token } }
      )
      if (!resp.ok) continue
      const data = await resp.json() as any
      const msgs = data.results || []
      
      // Check if any researcher message contains the URL
      const hasUrl = msgs.some((m: any) => 
        m.sender_id === RESEARCHER_ID && 
        m.body && 
        m.body.includes('technologyadoptionbarriers.org')
      )
      if (!hasUrl) continue
      
      // Check if participant replied AFTER the URL message
      const participantMsgs = msgs.filter((m: any) => m.sender_id !== RESEARCHER_ID)
      if (participantMsgs.length === 0) continue
      
      // Show participants who replied after getting URL
      console.log('=== ' + sub.participant_id + ' | ' + sub.status + ' | ' + ((sub.time_taken || 0) / 60).toFixed(1) + ' min ===')
      for (const m of participantMsgs) {
        console.log('  [PARTICIPANT] ' + (m.body || '').substring(0, 250))
      }
      console.log('')
    } catch {}
  }
}
main().catch(e => { console.error(e); process.exit(1) })
