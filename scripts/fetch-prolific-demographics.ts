/**
 * Fetch Prolific demographics for study participants.
 *
 * Tries the bulk export endpoint first (equivalent to the UI "Download demographic data"
 * button). Falls back to per-submission demographics if bulk export fails.
 *
 * Usage:
 *   PROLIFIC_API_TOKEN=... STUDY_ID=... npx tsx scripts/fetch-prolific-demographics.ts
 *   PROLIFIC_API_TOKEN=... STUDY_ID=... npx tsx scripts/fetch-prolific-demographics.ts --output demographics.csv
 *   PROLIFIC_API_TOKEN=... STUDY_ID=... npx tsx scripts/fetch-prolific-demographics.ts --per-submission --sample 5
 */

import {
  listStudySubmissions,
  getSubmissionDemographics,
  exportStudyDemographics,
  type SubmissionDemographics,
} from '../src/lib/prolific-api'
import { writeFileSync } from 'node:fs'

async function main() {
  const apiToken = process.env.PROLIFIC_API_TOKEN
  const studyId = process.env.STUDY_ID
  if (!apiToken || !studyId) {
    console.error('Required: PROLIFIC_API_TOKEN and STUDY_ID')
    process.exit(1)
  }

  const args = process.argv.slice(2)
  const outputPath = args.includes('--output') ? args[args.indexOf('--output') + 1] : null
  const perSubmission = args.includes('--per-submission')
  const sampleSize = args.includes('--sample')
    ? parseInt(args[args.indexOf('--sample') + 1] || '5', 10)
    : perSubmission
      ? 5
      : Infinity

  if (!perSubmission) {
    // Try bulk export first
    console.log('Attempting bulk demographic export (POST /studies/{id}/demographic-export/)...')
    try {
      const csvData = await exportStudyDemographics(studyId, apiToken)
      if (csvData && csvData.trim()) {
        console.log(`Bulk export succeeded (${csvData.length} bytes)`)
        const lines = csvData.trim().split('\n')
        console.log(`  Headers: ${lines[0]}`)
        console.log(`  Rows: ${lines.length - 1}`)

        if (outputPath) {
          writeFileSync(outputPath, csvData, 'utf-8')
          console.log(`\nSaved to: ${outputPath}`)
        } else {
          // Print first 5 rows
          console.log('\nFirst 5 rows:')
          for (const line of lines.slice(0, 6)) {
            console.log(`  ${line}`)
          }
        }
        return
      }
      console.log('Bulk export returned empty response. Trying per-submission fallback...\n')
    } catch (error) {
      console.log(`Bulk export failed: ${error}`)
      console.log('Trying per-submission fallback...\n')
    }
  }

  // Per-submission fallback
  console.log('Fetching submissions...')
  const subs = await listStudySubmissions(studyId, apiToken)
  console.log(`Total submissions: ${subs.results.length}`)

  const toFetch = subs.results.slice(0, sampleSize)
  console.log(`Fetching demographics for ${toFetch.length} submission(s)...\n`)

  const allDemos: SubmissionDemographics[] = []
  const allDemoKeys = new Set<string>()

  for (const sub of toFetch) {
    console.log(`--- ${sub.participant_id} (${sub.status}) ---`)
    const demo = await getSubmissionDemographics(sub.id, apiToken)
    if (!demo) {
      console.log('  No demographics archived\n')
      continue
    }

    allDemos.push(demo)
    console.log(`  total_approvals: ${demo.total_approvals}`)
    console.log('  demographics:')
    for (const [key, value] of Object.entries(demo.demographics).sort(([a], [b]) =>
      a.localeCompare(b)
    )) {
      allDemoKeys.add(key)
      console.log(`    ${key}: ${value}`)
    }
    console.log()
  }

  console.log('='.repeat(60))
  console.log(`DEMOGRAPHIC FIELDS FOUND (${allDemoKeys.size} unique):`)
  for (const key of [...allDemoKeys].sort()) {
    console.log(`  - ${key}`)
  }

  if (outputPath && allDemos.length > 0) {
    const demoKeys = [...allDemoKeys].sort()
    const csvHeaders = ['participant_id', 'submission_id', 'total_approvals', ...demoKeys]
    const csvRows = allDemos.map((d) => {
      const row: Record<string, string> = {
        participant_id: d.participant_id,
        submission_id: d.submission_id,
        total_approvals: String(d.total_approvals),
      }
      for (const key of demoKeys) {
        row[key] = String(d.demographics[key] ?? '')
      }
      return csvHeaders.map((h) => `"${(row[h] || '').replace(/"/g, '""')}"`).join(',')
    })

    const csv = [csvHeaders.map((h) => `"${h}"`).join(','), ...csvRows].join('\n')
    writeFileSync(outputPath, csv, 'utf-8')
    console.log(
      `\nCSV written: ${outputPath} (${allDemos.length} rows, ${csvHeaders.length} columns)`
    )
  }
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
