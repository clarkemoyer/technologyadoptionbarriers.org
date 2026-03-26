import { listStudySubmissions } from '../src/lib/prolific-api'
import { parseCsvLine } from '../src/lib/disposition'
import { readFileSync } from 'node:fs'

async function main() {
  const token = process.env.PROLIFIC_API_TOKEN!
  const studyId = process.env.STUDY_ID!
  const csvPath = process.env.CSV_FILE_PATH!

  // Get live submission statuses
  const subs = await listStudySubmissions(studyId, token)
  const awaitingReview = new Set<string>()
  for (const s of subs.results || []) {
    if (s.status === 'AWAITING REVIEW') awaitingReview.add(s.participant_id)
  }

  // Read disposition CSV
  const csv = readFileSync(csvPath, 'utf-8')
  const lines = csv
    .trimEnd()
    .split(/\r?\n/)
    .filter((l) => l.trim())
  const headers = parseCsvLine(lines[0])
  const dispIdx = headers.indexOf('Disposition')
  const pidIdx = headers.indexOf('PROLIFIC_PID')
  const durIdx = headers.indexOf('Duration_Seconds')
  const iriFailIdx = headers.indexOf('IRI_Fail_Count')
  const speedIdx = headers.indexOf('Speed_Flag')

  // Cross-reference: who is AWAITING REVIEW and what's their disposition?
  const byDisp: Record<string, string[]> = {}

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    const pid = fields[pidIdx]?.trim()
    const disp = fields[dispIdx]?.trim()
    if (!pid || !disp) continue
    if (!awaitingReview.has(pid)) continue

    if (!byDisp[disp]) byDisp[disp] = []
    byDisp[disp].push(pid)
  }

  console.log(`=== AWAITING REVIEW on Prolific: ${awaitingReview.size} ===`)
  console.log('')
  console.log('Breakdown by disposition:')
  const sorted = Object.entries(byDisp).sort(([, a], [, b]) => b.length - a.length)
  for (const [disp, pids] of sorted) {
    console.log(`  ${disp}: ${pids.length}`)
  }

  // Count how many awaiting review have NO disposition (not in Qualtrics)
  const inCsv = new Set<string>()
  for (let i = 1; i < lines.length; i++) {
    const pid = parseCsvLine(lines[i])[pidIdx]?.trim()
    if (pid) inCsv.add(pid)
  }
  const noDisp = [...awaitingReview].filter((p) => !inCsv.has(p))
  if (noDisp.length > 0) {
    console.log(`  (no Qualtrics data): ${noDisp.length}`)
  }

  console.log('')
  console.log('=== ACTIONABLE: CLEAN awaiting review (approve immediately) ===')
  const cleanAwaiting = byDisp['CLEAN'] || []
  console.log(`${cleanAwaiting.length} participants`)
  if (cleanAwaiting.length > 0) {
    console.log('PID_LIST=' + cleanAwaiting.join(','))
  }

  console.log('')
  console.log('=== ACTIONABLE: FLAG types awaiting review (need message or decision) ===')
  for (const [disp, pids] of sorted) {
    if (disp.startsWith('FLAG-')) {
      console.log(`${disp}: ${pids.length} awaiting review`)
    }
  }

  console.log('')
  console.log('=== AUTO-EXCLUDE still awaiting review (should have been rejected) ===')
  const aeAwaiting = byDisp['AUTO-EXCLUDE'] || []
  console.log(`${aeAwaiting.length} participants still AWAITING REVIEW`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
