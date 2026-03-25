/**
 * Fetch Prolific AUTH CHECK scores (LLM + Bots) for all submissions in a study.
 *
 * Outputs a CSV with PROLIFIC_PID, Auth_LLM, Auth_Bots columns that can be
 * joined with the Qualtrics disposition CSV to enrich the triage pipeline.
 *
 * Environment variables:
 *   PROLIFIC_API_TOKEN  – Prolific API token (required)
 *   STUDY_ID            – Prolific study ID (required)
 *   OUTPUT_PATH         – Path to write the auth-checks CSV (optional, defaults to stdout)
 *
 * Usage:
 *   PROLIFIC_API_TOKEN=xxx STUDY_ID=yyy npx tsx scripts/fetch-prolific-auth-checks.ts
 *   PROLIFIC_API_TOKEN=xxx STUDY_ID=yyy OUTPUT_PATH=auth.csv npx tsx scripts/fetch-prolific-auth-checks.ts
 */

import { listStudySubmissions, type Submission } from '../src/lib/prolific-api'
import { appendGithubStepSummary, mdEscape } from '../src/lib/github-utils'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function escapeCsvField(value: string): string {
  if (value == null || value === '') return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  const apiToken = process.env.PROLIFIC_API_TOKEN
  if (!apiToken) {
    console.error('Error: PROLIFIC_API_TOKEN environment variable is required')
    process.exit(1)
  }

  const studyId = process.env.STUDY_ID
  if (!studyId) {
    console.error('Error: STUDY_ID environment variable is required')
    process.exit(1)
  }

  const outputPath = process.env.OUTPUT_PATH

  console.log(`Fetching submissions for study ${studyId}...`)
  const response = await listStudySubmissions(studyId, apiToken)
  const submissions = response.results
  console.log(`Found ${submissions.length} submissions`)

  // Build CSV rows
  const headers = ['PROLIFIC_PID', 'Auth_LLM', 'Auth_Bots']
  const lines = [headers.join(',')]

  let enrichedCount = 0
  let missingCount = 0

  for (const sub of submissions) {
    const pid = sub.participant_id
    // Extract auth check fields from the submission object.
    // These are optional fields that may not be present if the study
    // does not have authenticity checks enabled.
    //
    // TODO: Verify exact field names against the live API response.
    //       Using type assertion since the Submission interface may not
    //       yet have the correct field names from Prolific.
    const raw = sub as Submission & Record<string, unknown>
    const authLlm = String(raw.authenticity_score_llm ?? '')
    const authBots = String(raw.authenticity_score_bots ?? '')

    if (authLlm || authBots) {
      enrichedCount++
    } else {
      missingCount++
    }

    lines.push([escapeCsvField(pid), escapeCsvField(authLlm), escapeCsvField(authBots)].join(','))
  }

  const csv = lines.join('\n') + '\n'

  if (outputPath) {
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, csv, 'utf-8')
    console.log(`Wrote auth-checks CSV to ${outputPath}`)
  } else {
    process.stdout.write(csv)
  }

  console.log(`Enriched: ${enrichedCount}, Missing auth data: ${missingCount}`)

  // GitHub Actions step summary
  appendGithubStepSummary(
    [
      '## Prolific Auth Checks',
      '',
      `- **Study ID:** ${mdEscape(studyId)}`,
      `- **Total submissions:** ${submissions.length}`,
      `- **With auth data:** ${enrichedCount}`,
      `- **Without auth data:** ${missingCount}`,
      outputPath ? `- **Output:** ${mdEscape(outputPath)}` : '- **Output:** stdout',
      '',
    ].join('\n')
  )
}

main().catch((error: unknown) => {
  console.error('Failed to fetch auth checks:', error)
  process.exit(1)
})
