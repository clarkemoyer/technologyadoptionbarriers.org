/**
 * Full report of all AWAITING REVIEW submissions with disposition + message state.
 *
 * Uses per-PID message lookup (listUserMessages) for accurate message detection,
 * matching the same approach used by the send scripts.
 *
 * Environment:
 *   PROLIFIC_API_TOKEN, STUDY_ID, CSV_FILE_PATH
 */
import { listStudySubmissions, listUserMessages } from '../src/lib/prolific-api'
import { parseCsvLine } from '../src/lib/disposition'
import { readFileSync } from 'node:fs'

const RESEARCHER_ID = '68264cbfdeb62546fe6060fe'

async function main() {
  const token = process.env.PROLIFIC_API_TOKEN!
  const studyId = process.env.STUDY_ID!
  const csvPath = process.env.CSV_FILE_PATH!

  // 1. Get all AWAITING REVIEW submissions from Prolific
  console.log('Fetching Prolific submissions...')
  const subs = await listStudySubmissions(studyId, token)
  const awaiting = (subs.results || []).filter((s: any) => s.status === 'AWAITING REVIEW')
  console.log(`Found ${awaiting.length} AWAITING REVIEW submissions`)

  // 2. Load disposition CSV
  console.log('Loading disposition CSV...')
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

  // 3. Check messages for EACH awaiting PID individually (accurate method)
  console.log(`Checking messages for ${awaiting.length} participants (per-PID lookup)...`)
  console.log('')

  interface AwaitingEntry {
    pid: string
    dur: number
    subType: string
    state: 'REPLIED' | 'MESSAGED_NO_REPLY' | 'NOT_MESSAGED'
    messageCount: number
    iriFail: number
    speed: number
  }

  const entries: AwaitingEntry[] = []

  for (const sub of awaiting) {
    const pid = sub.participant_id
    const d = dispMap.get(pid)
    const dur = d?.dur ?? sub.time_taken ?? 0

    // Classify disposition sub-type
    let subType = d?.disp ?? 'NO_DATA'
    if (subType === 'AUTO-EXCLUDE') {
      if (d?.iriFail >= 3 && d?.speed === 1) subType = 'AUTO-EXCLUDE:IRI3_SPEED'
      else if (d?.iriFail >= 3) subType = 'AUTO-EXCLUDE:IRI3'
      else if (d?.iriFail === 2 && d?.speed === 1) subType = 'AUTO-EXCLUDE:IRI2_SPEED'
      else if (d?.iriFail === 2) subType = 'AUTO-EXCLUDE:IRI2'
      else if (d?.speed === 1) subType = 'AUTO-EXCLUDE:SPEED_IRI'
    }

    // Check messages for this PID directly
    let state: 'REPLIED' | 'MESSAGED_NO_REPLY' | 'NOT_MESSAGED' = 'NOT_MESSAGED'
    let messageCount = 0
    try {
      const msgs = await listUserMessages(pid, token)
      const studyMsgs = (msgs.results || []).filter((m) => m.data?.study_id === studyId)
      messageCount = studyMsgs.length

      if (messageCount > 0) {
        const participantReplied = studyMsgs.some((m) => m.sender_id !== RESEARCHER_ID)
        state = participantReplied ? 'REPLIED' : 'MESSAGED_NO_REPLY'
      }
    } catch {
      // If message lookup fails, mark as unknown
      state = 'NOT_MESSAGED'
    }

    entries.push({
      pid,
      dur,
      subType,
      state,
      messageCount,
      iriFail: d?.iriFail ?? 0,
      speed: d?.speed ?? 0,
    })
  }

  // 4. Group and display
  const groups: Record<string, AwaitingEntry[]> = {}
  for (const e of entries) {
    if (!groups[e.subType]) groups[e.subType] = []
    groups[e.subType].push(e)
  }

  console.log(`=== ${entries.length} AWAITING REVIEW ===`)
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

  let totalReplied = 0
  let totalMessaged = 0
  let totalNotMessaged = 0

  for (const disp of [...order, ...Object.keys(groups).filter((k) => !order.includes(k))]) {
    const items = groups[disp]
    if (!items || items.length === 0) continue
    const replied = items.filter((i) => i.state === 'REPLIED').length
    const messaged = items.filter((i) => i.state === 'MESSAGED_NO_REPLY').length
    const notMessaged = items.filter((i) => i.state === 'NOT_MESSAGED').length
    totalReplied += replied
    totalMessaged += messaged
    totalNotMessaged += notMessaged

    console.log(
      `--- ${disp}: ${items.length} (replied: ${replied}, messaged/no-reply: ${messaged}, not messaged: ${notMessaged}) ---`
    )
    for (const item of items) {
      const durMin = (item.dur / 60).toFixed(1)
      const msgInfo = item.messageCount > 0 ? `${item.messageCount} msgs` : 'no msgs'
      console.log(`  ${item.pid} | ${durMin} min | ${item.state} (${msgInfo})`)
    }
    console.log('')
  }

  console.log('=== SUMMARY ===')
  console.log(`Total awaiting review: ${entries.length}`)
  console.log(`  Replied: ${totalReplied}`)
  console.log(`  Messaged, no reply: ${totalMessaged}`)
  console.log(`  Not messaged: ${totalNotMessaged}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
