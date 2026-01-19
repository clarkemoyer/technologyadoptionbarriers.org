import {
  getCurrentUser,
  listStudies,
  getStudyStatistics,
  exportSubmissionsCSV,
} from '../src/lib/prolific-api'

import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const rawApiToken = process.env.PROLIFIC_API_TOKEN

if (!rawApiToken) {
  console.error('Error: PROLIFIC_API_TOKEN environment variable is required')
  process.exit(1)
}

const API_TOKEN: string = rawApiToken
const STUDY_ID = process.env.STUDY_ID

function envFlag(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name]
  if (value === undefined) return defaultValue
  const normalized = value.trim().toLowerCase()
  if (normalized === '') return defaultValue
  return ['1', 'true', 'yes', 'y', 'on'].includes(normalized)
}

function envInt(name: string, defaultValue: number): number {
  const value = process.env[name]
  if (value === undefined) return defaultValue
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : defaultValue
}

function appendGithubStepSummary(markdown: string) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (!summaryPath) {
    return
  }
  appendFileSync(summaryPath, markdown)
}

function mdEscape(text: string): string {
  return text.replace(/[\\|\n\r]/g, (match) => {
    if (match === '\\') return '\\\\'
    if (match === '|') return '\\|'
    return ' '
  })
}

function formatIsoMaybe(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    return '—'
  }
  return value
}

function percent(numerator: number, denominator: number): string {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return '—'
  }
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

function csvPreview(csv: string, maxLines: number): { preview: string; totalLines: number } {
  const lines = csv.trimEnd().split(/\r?\n/)
  const safeMaxLines = Math.max(0, maxLines)
  return {
    preview: safeMaxLines === 0 ? '' : lines.slice(0, safeMaxLines).join('\n'),
    totalLines: lines.length,
  }
}

async function main() {
  try {
    console.log('🔍 Connecting to Prolific API...\n')

    // Get current user info
    const user = await getCurrentUser(API_TOKEN)
    console.log('✅ Connected as:', user.name, `(${user.email})`)
    console.log('User ID:', user.id)
    console.log('Username:', user.username)
    console.log('')

    appendGithubStepSummary(
      [
        '## Prolific API Report',
        '',
        `- **Run time (UTC):** ${new Date().toISOString()}`,
        `- **Connected user:** ${mdEscape(user.name)} (id: ${mdEscape(user.id)})`,
        `- **Mode:** ${STUDY_ID ? `Study details (${mdEscape(STUDY_ID)})` : 'List studies'}`,
        '',
      ].join('\n')
    )

    if (STUDY_ID) {
      // Query specific study
      console.log(`📊 Fetching data for study: ${STUDY_ID}\n`)
      const stats = await getStudyStatistics(STUDY_ID, API_TOKEN)

      console.log('Study Details:')
      console.log('  Name:', stats.study.name)
      console.log('  Internal Name:', stats.study.internal_name)
      console.log('  Status:', stats.study.status)
      if (stats.study.filters && stats.study.filters.length > 0) {
        console.log('  Filters:')
        stats.study.filters.forEach((f) => {
          console.log(
            `    - ${f.filter_id}: ${JSON.stringify(f.selected_values || f.selected_range)}`
          )
        })
      }
      console.log('  Description:', stats.study.description)
      console.log('  External URL:', stats.study.external_study_url)
      console.log('  Total Places:', stats.study.total_available_places)
      console.log('  Places Taken:', stats.study.places_taken)
      console.log('  Reward:', stats.study.reward, 'pence')
      console.log('  Average Reward/Hour:', stats.study.average_reward_per_hour, 'pence')
      console.log('  Maximum Time Allowed:', stats.study.maximum_allowed_time, 'seconds')
      console.log('  Created At:', stats.study.created_at)
      if (stats.study.published_at) {
        console.log('  Published At:', stats.study.published_at)
      }
      if (stats.study.completed_at) {
        console.log('  Completed At:', stats.study.completed_at)
      }
      console.log('')

      console.log('Submission Statistics:')
      console.log('  Total Submissions:', stats.totalSubmissions)
      console.log('  Completed:', stats.completedSubmissions)
      console.log('  Approved:', stats.approvedSubmissions)
      console.log('  Rejected:', stats.rejectedSubmissions)
      console.log('  Awaiting Review:', stats.awaitingReviewSubmissions)
      if (stats.averageTimeMinutes !== null) {
        console.log('  Average Time:', stats.averageTimeMinutes.toFixed(2), 'minutes')
      }
      console.log('')

      const exportCsv = envFlag('PROLIFIC_EXPORT_CSV', false)
      const csvPreviewLines = envInt('PROLIFIC_CSV_PREVIEW_LINES', 0)
      const csvOutputPath = process.env.PROLIFIC_CSV_OUTPUT_PATH

      let csvInfo: { preview: string; totalLines: number } | null = null
      let csvSavedTo: string | null = null

      if (exportCsv) {
        const csv = await exportSubmissionsCSV(STUDY_ID, API_TOKEN)
        csvInfo = csvPreview(csv, csvPreviewLines)

        const runnerTemp = process.env.RUNNER_TEMP || process.cwd()
        const targetPath =
          csvOutputPath || path.join(runnerTemp, `prolific-${STUDY_ID}-submissions.csv`)

        mkdirSync(path.dirname(targetPath), { recursive: true })
        writeFileSync(targetPath, csv, 'utf8')
        csvSavedTo = targetPath

        console.log('📄 Submissions CSV exported to file (not printed).')
      } else {
        console.log('📄 Submissions CSV export is disabled (CI-safe default).')
      }

      const completion = `${stats.study.places_taken}/${stats.study.total_available_places}`
      const completionPct = percent(stats.study.places_taken, stats.study.total_available_places)
      const createdAt = formatIsoMaybe(stats.study.created_at)
      const publishedAt = formatIsoMaybe(stats.study.published_at)
      const completedAt = formatIsoMaybe(stats.study.completed_at)

      appendGithubStepSummary(
        [
          '### Key Answers',
          '',
          `- **Study name:** ${mdEscape(stats.study.name)}`,
          `- **Status:** ${mdEscape(stats.study.status)}`,
          `- **Places taken:** ${mdEscape(completion)} (${mdEscape(completionPct)})`,
          `- **Total submissions:** ${stats.totalSubmissions}`,
          `- **Completed / approved / rejected / awaiting review:** ${stats.completedSubmissions} / ${stats.approvedSubmissions} / ${stats.rejectedSubmissions} / ${stats.awaitingReviewSubmissions}`,
          '',
          '### Study Details',
          '',
          `- **Study ID:** ${mdEscape(stats.study.id)}`,
          `- **Internal name:** ${mdEscape(stats.study.internal_name)}`,
          `- **Reward:** ${stats.study.reward} pence`,
          `- **Average reward/hour:** ${stats.study.average_reward_per_hour} pence`,
          `- **Max time allowed:** ${stats.study.maximum_allowed_time} seconds`,
          `- **Created:** ${mdEscape(createdAt)}`,
          `- **Published:** ${mdEscape(publishedAt)}`,
          `- **Completed:** ${mdEscape(completedAt)}`,
          `- **External URL:** ${mdEscape(stats.study.external_study_url)}`,
          '',
          '<details>',
          '<summary>Description</summary>',
          '',
          `${stats.study.description || '(none)'}`,
          '',
          '</details>',
          '',
          '### Submission Statistics',
          '',
          '| Metric | Value |',
          '|---|---:|',
          `| Total | ${stats.totalSubmissions} |`,
          `| Completed | ${stats.completedSubmissions} |`,
          `| Approved | ${stats.approvedSubmissions} |`,
          `| Rejected | ${stats.rejectedSubmissions} |`,
          `| Awaiting review | ${stats.awaitingReviewSubmissions} |`,
          `| Average time (minutes) | ${stats.averageTimeMinutes === null ? '—' : stats.averageTimeMinutes.toFixed(2)} |`,
          '',
          '### CSV Export',
          '',
          `- **Enabled:** ${exportCsv ? 'Yes' : 'No'}`,
          exportCsv
            ? `- **Saved to:** ${mdEscape(csvSavedTo || '(unknown)')}`
            : '- **Saved to:** (not generated)',
          exportCsv && csvInfo
            ? `- **Rows (including header):** ${csvInfo.totalLines}`
            : '- **Rows (including header):** —',
          exportCsv && csvInfo && csvPreviewLines > 0
            ? [
                '',
                '<details>',
                `<summary>Preview (first ${csvPreviewLines} lines)</summary>`,
                '',
                '```csv',
                csvInfo.preview,
                '```',
                '',
                '</details>',
              ].join('\n')
            : '',
          '',
        ].join('\n')
      )
    } else {
      // List all studies
      console.log('📋 Fetching all studies...\n')
      const studiesResponse = await listStudies(API_TOKEN)

      console.log(`Found ${studiesResponse.results.length} studies:\n`)

      for (const study of studiesResponse.results) {
        console.log('─'.repeat(80))
        console.log('Study ID:', study.id)
        console.log('Name:', study.name)
        console.log('Internal Name:', study.internal_name)
        console.log('Status:', study.status)
        console.log('Places:', `${study.places_taken}/${study.total_available_places}`)
        console.log('Reward:', study.reward, 'pence')
        console.log('Created:', study.created_at)
        console.log('')
      }

      const rows = studiesResponse.results
        .map((study) => {
          const places = `${study.places_taken}/${study.total_available_places}`
          const created = formatIsoMaybe(study.created_at)
          return `| ${mdEscape(study.id)} | ${mdEscape(study.name)} | ${mdEscape(study.status)} | ${mdEscape(places)} | ${study.reward} | ${mdEscape(created)} |`
        })
        .join('\n')

      appendGithubStepSummary(
        [
          '### Key Answers',
          '',
          `- **Studies found:** ${studiesResponse.results.length}`,
          '',
          '### Studies',
          '',
          '| Study ID | Name | Status | Places (taken/total) | Reward (pence) | Created |',
          '|---|---|---|---:|---:|---|',
          rows || '| (none) |  |  |  |  |  |',
          '',
          '💡 Tip: Re-run this workflow with `study_id` to see submission stats and CSV export.',
          '',
        ].join('\n')
      )

      console.log('─'.repeat(80))
      console.log('')
      console.log('💡 Tip: To get detailed statistics for a specific study, run:')
      console.log('   gh workflow run prolific.yml -f study_id=<STUDY_ID>')
    }

    console.log('\n✅ Data collection completed successfully')

    appendGithubStepSummary(['---', '', '✅ **Result:** Success', ''].join('\n'))
  } catch (error: unknown) {
    console.error('❌ Error collecting Prolific data:', error)
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response: unknown }).response
      console.error('API Response:', JSON.stringify(response, null, 2))
    }

    appendGithubStepSummary(
      [
        '---',
        '',
        '❌ **Result:** Failure',
        '',
        'Check the job logs for the full error details.',
        '',
      ].join('\n')
    )
    process.exit(1)
  }
}

main()
