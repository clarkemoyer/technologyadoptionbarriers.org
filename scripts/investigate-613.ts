import { exportSurveyResponses } from '../src/lib/qualtrics-api'
import AdmZip from 'adm-zip'
import { parse } from 'csv-parse/sync'
import { listStudySubmissions } from '../src/lib/prolific-api'

const PIDS = [
  '6978def73c6b4d708159c4fc',
  '694d28664d27fd5bf031f07a',
  '66d965ce6e3feb147144e675',
  '633b7b6e5d73a6fb05e2e003',
]

async function main() {
  const qToken = process.env.QUALTRICS_API_TOKEN!
  const qUrl = process.env.QUALTRICS_BASE_URL!
  const qId = process.env.QUALTRICS_SURVEY_ID!
  const pToken = process.env.PROLIFIC_API_TOKEN!
  const pStudyId = process.env.STUDY_ID!

  console.log('1. Checking Prolific API for PIDs...')
  try {
    const subs = await listStudySubmissions(pStudyId, pToken)
    const matchingSubs = subs.results?.filter((s) => PIDS.includes(s.participant_id)) || []

    console.log(`Found ${matchingSubs.length} matching submissions in Prolific:`)
    for (const sub of matchingSubs) {
      console.log(
        `  - PID: ${sub.participant_id} | Status: ${sub.status} | Started: ${sub.started_at} | Time: ${sub.time_taken}s | SessionID: ${sub.session_id}`
      )
    }
  } catch (error) {
    console.error('Error fetching Prolific data:', error)
  }

  console.log('\n2. Exporting Qualtrics Data and checking for partial matches...')
  try {
    const zipBuffer = await exportSurveyResponses(qId, qToken, qUrl)
    const zip = new AdmZip(zipBuffer)
    const csvEntry = zip.getEntries().find((e) => e.name.endsWith('.csv'))

    if (!csvEntry) {
      throw new Error('No CSV file found in Qualtrics export')
    }

    const csvData = csvEntry.getData().toString('utf8')
    const records = parse(csvData, { columns: true, relax_quotes: true, skip_empty_lines: true })

    console.log(`Exported ${records.length} total Responses.`)

    // Check for exact matches
    const exactMatches = records.filter((r: any) => PIDS.includes(r.PROLIFIC_PID))
    console.log(`Exact Matches on PROLIFIC_PID: ${exactMatches.length}`)
    for (const r of exactMatches) {
      console.log(
        `  - Match: PID=${r.PROLIFIC_PID}, Progress=${r.Progress}, Finished=${r.Finished}, Duration=${r['Duration (in seconds)']}`
      )
    }

    // Check for partial matches or similar strings inside *any* column
    console.log(`\nSearching entire dataset for partial PID matches (any column)...`)

    for (const pid of PIDS) {
      const p1 = pid.substring(0, 5)
      const p2 = pid.substring(uidLength(pid) - 5) // Last 5 chars

      const partials = records.filter((r: any) => {
        const rowStr = JSON.stringify(r).toLowerCase()
        return rowStr.includes(p1) || rowStr.includes(p2.toLowerCase())
      })

      console.log(`\nPID: ${pid}`)
      console.log(`  Found ${partials.length} rows with partial string matches...`)

      for (const r of partials) {
        console.log(
          `  => ResponseID: ${r.ResponseId} | PROLIFIC_PID: ${r.PROLIFIC_PID || 'N/A'} | StartDate: ${r.StartDate} | M_Email: ${r.M_Email || 'N/A'}`
        )

        // Find exactly which column matched!
        for (const key of Object.keys(r)) {
          if (
            r[key]?.toLowerCase().includes(p1) ||
            r[key]?.toLowerCase().includes(p2.toLowerCase())
          ) {
            console.log(`      * Match in column [${key}]: ${r[key]}`)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in Qualtrics export process:', error)
  }
}

function uidLength(s: string) {
  return s.length
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
