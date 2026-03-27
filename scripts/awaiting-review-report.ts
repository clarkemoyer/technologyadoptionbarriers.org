/**
 * Full report of all AWAITING REVIEW submissions with disposition + message state.
 *
 * Environment:
 *   PROLIFIC_API_TOKEN, STUDY_ID, CSV_FILE_PATH
 */
import { listStudySubmissions, listRecentMessages } from '../src/lib/prolific-api'
import { parseCsvLine } from '../src/lib/disposition'
import { readFileSync } from 'node:fs'

async function main() {
  const token = process.env.PROLIFIC_API_TOKEN!
  const studyId = process.env.STUDY_ID!
  const csvPath = process.env.CSV_FILE_PATH!
  const researcherId = '68264cbfdeb62546fe6060fe'

  // Prolific submissions
  const subs = await listStudySubmissions(studyId, token)
  const awaiting = (subs.results || []).filter((s: any) => s.status === 'AWAITING REVIEW')
  const awaitingPids = new Set(awaiting.map((s: any) => s.participant_id))

  // Messages
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const msgs = await listRecentMessages(sevenDaysAgo, token)
  const allMsgs = (msgs.results || []).filter((m: any) => m.data?.study_id === studyId)

  const messagedPids = new Set<string>()
  const repliedPids = new Set<string>()
  for (const m of allMsgs) {
    if (m.sender_id === researcherId) {
      messagedPids.add(m.channel_id)
    } else {
      repliedPids.add(m.sender_id)
    }
  }

  // Disposition CSV
  const csv = readFileSync(csvPath, 'utf-8')
  const lines = csv
    .trimEnd()
    .split(/\r?\n/)
    .filter((l) => l.trim())
  const headers = parseCsvLine(lines[0])
  const pidIdx = headers.indexOf('PROLIFIC_PID')
  const dispIdx = headers.indexOf('Disposition')
  const durIdx = headers.indexOf('Duration_Seconds')
  const iriFailIdx = headers.indexOf('IRI_Fail_Count')
  const speedIdx = headers.indexOf('Speed_Flag')

  const dispMap = new Map<string, any>()
  for (let i = 1; i < lines.length; i++) {
    const f = parseCsvLine(lines[i])
    const pid = f[pidIdx]?.trim()
    if (pid)
      dispMap.set(pid, {
        disp: f[dispIdx]?.trim(),
        dur: parseInt(f[durIdx] ?? '0', 10),
        iriFail: parseInt(f[iriFailIdx] ?? '0', 10),
        speed: parseInt(f[speedIdx] ?? '0', 10),
      })
  }

  // Classify each awaiting PID
  const groups: Record<string, any[]> = {}

  for (const sub of awaiting) {
    const pid = sub.participant_id
    const d = dispMap.get(pid)
    const disp = d?.disp ?? 'NO_DATA'
    const dur = d?.dur ?? sub.time_taken ?? 0
    const replied = repliedPids.has(pid)

    let subType = disp
    if (disp === 'AUTO-EXCLUDE') {
      if (d?.iriFail >= 3 && d?.speed === 1) subType = 'AUTO-EXCLUDE:IRI3_SPEED'
      else if (d?.iriFail >= 3) subType = 'AUTO-EXCLUDE:IRI3'
      else if (d?.iriFail === 2 && d?.speed === 1) subType = 'AUTO-EXCLUDE:IRI2_SPEED'
      else if (d?.iriFail === 2) subType = 'AUTO-EXCLUDE:IRI2'
      else if (d?.speed === 1) subType = 'AUTO-EXCLUDE:SPEED_IRI'
    }

    let state = 'NOT_MESSAGED'
    if (replied) state = 'REPLIED'
    else if (messagedPids.has(pid)) state = 'MESSAGED_NO_REPLY'
    // Note: channel-based messaged check may not be accurate for all cases

    if (!groups[subType]) groups[subType] = []
    groups[subType].push({ pid, dur, state, replied, iriFail: d?.iriFail, speed: d?.speed })
  }

  console.log(`=== ${awaiting.length} AWAITING REVIEW ===`)
  console.log('')

  const order = [
    'CLEAN',
    'AUTO-EXCLUDE:IRI3_SPEED',
    'AUTO-EXCLUDE:IRI3',
    'AUTO-EXCLUDE:IRI2_SPEED',
    'AUTO-EXCLUDE:IRI2',
    'AUTO-EXCLUDE:SPEED_IRI',
    'FLAG-SPEED',
    'FLAG-SINGLE-IRI',
    'FLAG-SMEAL',
    'FLAG-RECAPTCHA',
    'FLAG-PARTIAL-STRAIGHTLINING',
    'NO_DATA',
  ]

  for (const disp of order) {
    const items = groups[disp]
    if (!items || items.length === 0) continue
    const replied = items.filter((i) => i.state === 'REPLIED').length
    const messaged = items.filter((i) => i.state === 'MESSAGED_NO_REPLY').length
    const notMessaged = items.filter((i) => i.state === 'NOT_MESSAGED').length
    console.log(
      `--- ${disp}: ${items.length} (replied: ${replied}, messaged: ${messaged}, not messaged: ${notMessaged}) ---`
    )
    for (const item of items) {
      console.log(`  ${item.pid} | ${(item.dur / 60).toFixed(1)} min | ${item.state}`)
    }
    console.log('')
  }

  // Also check for any not in disposition CSV
  for (const disp of Object.keys(groups)) {
    if (!order.includes(disp)) {
      console.log(`--- ${disp}: ${groups[disp].length} ---`)
      for (const item of groups[disp]) {
        console.log(`  ${item.pid} | ${(item.dur / 60).toFixed(1)} min | ${item.state}`)
      }
      console.log('')
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
