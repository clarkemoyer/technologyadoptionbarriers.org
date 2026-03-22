/**
 * Qualtrics Survey Question Management
 *
 * Write operations for managing questions in a live Qualtrics survey:
 *   - Add a new question
 *   - Update an existing question (text, choices, validation)
 *   - Delete a question
 *   - Move a question between blocks
 *
 * Authentication: Reuses the same tri-method auth as qualtrics-dump-flow.ts
 *
 * Usage (via GitHub Actions):
 *   QUALTRICS_MANAGE_ACTION=add       npx tsx scripts/qualtrics-manage-questions.ts
 *   QUALTRICS_MANAGE_ACTION=update    npx tsx scripts/qualtrics-manage-questions.ts
 *   QUALTRICS_MANAGE_ACTION=delete    npx tsx scripts/qualtrics-manage-questions.ts
 *
 * Environment variables:
 *   QUALTRICS_API_TOKEN        - API token (X-API-TOKEN header)
 *   QUALTRICS_BASE_URL         - e.g. https://yul1.qualtrics.com
 *   QUALTRICS_SURVEY_ID        - Survey ID (e.g. SV_bkMopd73A8fzfwO)
 *   QUALTRICS_MANAGE_ACTION    - One of: add, update, delete, list
 *   QUALTRICS_QUESTION_ID      - Target question ID (for update/delete)
 *   QUALTRICS_QUESTION_PAYLOAD - JSON string with question definition (for add/update)
 *   QUALTRICS_BLOCK_ID         - Block ID to add the question to (for add)
 *   QUALTRICS_DRY_RUN          - If "true", preview changes without applying
 */

import * as fs from 'fs'
import * as path from 'path'

// ── Auth (same pattern as qualtrics-dump-flow.ts) ──────────────────────────

type QualtricsAuth =
  | { kind: 'api-token'; apiToken: string }
  | { kind: 'oauth-bearer'; accessToken: string }

function resolveAuth(): QualtricsAuth {
  if (process.env.QUALTRICS_API_TOKEN) {
    return { kind: 'api-token', apiToken: process.env.QUALTRICS_API_TOKEN }
  }
  if (process.env.QUALTRICS_OAUTH_TOKEN) {
    return { kind: 'oauth-bearer', accessToken: process.env.QUALTRICS_OAUTH_TOKEN }
  }
  // Try cache file (local dev)
  const cachePath = path.join(process.cwd(), '.vscode', 'qualtrics-oauth-token.local.json')
  if (fs.existsSync(cachePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
      const token = raw.access_token ?? raw.token?.access_token
      if (token) return { kind: 'oauth-bearer', accessToken: token }
    } catch {
      // fall through
    }
  }
  throw new Error(
    'No Qualtrics auth found. Set QUALTRICS_API_TOKEN, QUALTRICS_OAUTH_TOKEN, or create .vscode/qualtrics-oauth-token.local.json'
  )
}

function authHeaders(auth: QualtricsAuth): Record<string, string> {
  if (auth.kind === 'api-token') {
    return { 'X-API-TOKEN': auth.apiToken }
  }
  return { Authorization: `Bearer ${auth.accessToken}` }
}

// ── HTTP helpers ───────────────────────────────────────────────────────────

interface HttpResult {
  url: string
  status: number
  bodyText: string
  json: unknown | null
}

async function httpJson(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  auth: QualtricsAuth,
  body?: unknown
): Promise<HttpResult> {
  const headers: Record<string, string> = {
    ...authHeaders(auth),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  const init: RequestInit = { method, headers }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
  }

  const res = await fetch(url, init)
  const bodyText = await res.text()
  let json: unknown = null
  try {
    json = JSON.parse(bodyText)
  } catch {
    // not JSON
  }
  return { url, status: res.status, bodyText, json }
}

function unwrapResult(hr: HttpResult): unknown {
  if (hr.status < 200 || hr.status >= 300) {
    const preview = hr.bodyText.slice(0, 1000)
    throw new Error(`HTTP ${hr.status} from ${hr.url}: ${preview}`)
  }
  const obj = hr.json as Record<string, unknown> | null
  return obj?.result ?? obj
}

// ── Config ─────────────────────────────────────────────────────────────────

function getConfig() {
  const baseUrl = (process.env.QUALTRICS_BASE_URL ?? '').replace(/\/$/, '')
  const surveyId = process.env.QUALTRICS_SURVEY_ID ?? ''
  const action = (process.env.QUALTRICS_MANAGE_ACTION ?? 'list').toLowerCase()
  const questionId = process.env.QUALTRICS_QUESTION_ID ?? ''
  const blockId = process.env.QUALTRICS_BLOCK_ID ?? ''
  const dryRun = process.env.QUALTRICS_DRY_RUN === 'true'
  let payload: Record<string, unknown> = {}
  if (process.env.QUALTRICS_QUESTION_PAYLOAD) {
    try {
      payload = JSON.parse(process.env.QUALTRICS_QUESTION_PAYLOAD)
    } catch (err) {
      throw new Error(`Invalid QUALTRICS_QUESTION_PAYLOAD JSON: ${err}`)
    }
  }

  if (!baseUrl) throw new Error('QUALTRICS_BASE_URL is required')
  if (!surveyId) throw new Error('QUALTRICS_SURVEY_ID is required')
  if (!['add', 'update', 'delete', 'list'].includes(action)) {
    throw new Error(
      `Invalid QUALTRICS_MANAGE_ACTION: ${action}. Must be: add, update, delete, list`
    )
  }

  return { baseUrl, surveyId, action, questionId, blockId, payload, dryRun }
}

// ── Question Operations ───────────────────────────────────────────────────

/**
 * List all questions in a survey.
 * GET /API/v3/survey-definitions/{surveyId}/questions
 */
async function listQuestions(
  baseUrl: string,
  surveyId: string,
  auth: QualtricsAuth
): Promise<unknown> {
  const url = `${baseUrl}/API/v3/survey-definitions/${surveyId}/questions`
  const result = unwrapResult(await httpJson('GET', url, auth))
  return result
}

/**
 * Add a new question to a survey.
 * POST /API/v3/survey-definitions/{surveyId}/questions
 *
 * The question is added to the specified block, or the default block if none given.
 * Query param: ?blockId=<blockId> (optional)
 */
async function addQuestion(
  baseUrl: string,
  surveyId: string,
  auth: QualtricsAuth,
  questionPayload: Record<string, unknown>,
  blockId?: string
): Promise<unknown> {
  let url = `${baseUrl}/API/v3/survey-definitions/${surveyId}/questions`
  if (blockId) {
    url += `?blockId=${encodeURIComponent(blockId)}`
  }
  const result = unwrapResult(await httpJson('POST', url, auth, questionPayload))
  return result
}

/**
 * Update an existing question.
 * PUT /API/v3/survey-definitions/{surveyId}/questions/{questionId}
 */
async function updateQuestion(
  baseUrl: string,
  surveyId: string,
  questionId: string,
  auth: QualtricsAuth,
  questionPayload: Record<string, unknown>
): Promise<unknown> {
  const url = `${baseUrl}/API/v3/survey-definitions/${surveyId}/questions/${questionId}`
  const result = unwrapResult(await httpJson('PUT', url, auth, questionPayload))
  return result
}

/**
 * Delete a question from a survey.
 * DELETE /API/v3/survey-definitions/{surveyId}/questions/{questionId}
 */
async function deleteQuestion(
  baseUrl: string,
  surveyId: string,
  questionId: string,
  auth: QualtricsAuth
): Promise<unknown> {
  const url = `${baseUrl}/API/v3/survey-definitions/${surveyId}/questions/${questionId}`
  const result = unwrapResult(await httpJson('DELETE', url, auth))
  return result
}

// ── GitHub Step Summary helpers ───────────────────────────────────────────

function appendSummary(text: string) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (summaryPath) {
    fs.appendFileSync(summaryPath, text + '\n')
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const config = getConfig()
  const auth = resolveAuth()

  console.log(`🔧 Qualtrics Question Manager`)
  console.log(`   Survey: ${config.surveyId}`)
  console.log(`   Action: ${config.action}`)
  console.log(`   Dry run: ${config.dryRun}`)

  appendSummary(`## Qualtrics Question Management`)
  appendSummary(``)
  appendSummary(`- **Survey ID:** \`${config.surveyId}\``)
  appendSummary(`- **Action:** \`${config.action}\``)
  appendSummary(`- **Dry run:** ${config.dryRun}`)
  appendSummary(``)

  switch (config.action) {
    case 'list': {
      const questions = listQuestions(config.baseUrl, config.surveyId, auth)
      const result = await questions
      const qMap = (result as Record<string, unknown>) ?? {}
      const entries = Object.entries(qMap)
      console.log(`\n📋 Found ${entries.length} questions:\n`)
      appendSummary(`### Questions (${entries.length} total)`)
      appendSummary(``)
      appendSummary(`| QID | Type | Text (preview) |`)
      appendSummary(`|-----|------|----------------|`)
      for (const [qid, qdata] of entries) {
        const q = qdata as Record<string, unknown>
        const text = String(q.QuestionText ?? '')
          .replace(/<[^>]*>/g, '')
          .slice(0, 80)
        const type = String(q.QuestionType ?? '')
        console.log(`  ${qid} [${type}] ${text}`)
        appendSummary(`| \`${qid}\` | ${type} | ${text} |`)
      }
      break
    }

    case 'add': {
      if (!config.payload || Object.keys(config.payload).length === 0) {
        throw new Error('QUALTRICS_QUESTION_PAYLOAD is required for add action')
      }
      if (config.dryRun) {
        console.log(`\n🔍 DRY RUN — would add question:`)
        console.log(JSON.stringify(config.payload, null, 2))
        appendSummary(`### Dry Run — Add Question`)
        appendSummary('```json')
        appendSummary(JSON.stringify(config.payload, null, 2))
        appendSummary('```')
      } else {
        console.log(`\n➕ Adding question to survey...`)
        const result = await addQuestion(
          config.baseUrl,
          config.surveyId,
          auth,
          config.payload,
          config.blockId || undefined
        )
        console.log(`✅ Question created:`, JSON.stringify(result, null, 2))
        appendSummary(`### Question Added`)
        appendSummary('```json')
        appendSummary(JSON.stringify(result, null, 2))
        appendSummary('```')
      }
      break
    }

    case 'update': {
      if (!config.questionId) {
        throw new Error('QUALTRICS_QUESTION_ID is required for update action')
      }
      if (!config.payload || Object.keys(config.payload).length === 0) {
        throw new Error('QUALTRICS_QUESTION_PAYLOAD is required for update action')
      }
      if (config.dryRun) {
        console.log(`\n🔍 DRY RUN — would update ${config.questionId}:`)
        console.log(JSON.stringify(config.payload, null, 2))
        appendSummary(`### Dry Run — Update Question \`${config.questionId}\``)
        appendSummary('```json')
        appendSummary(JSON.stringify(config.payload, null, 2))
        appendSummary('```')
      } else {
        console.log(`\n✏️ Updating question ${config.questionId}...`)
        const result = await updateQuestion(
          config.baseUrl,
          config.surveyId,
          config.questionId,
          auth,
          config.payload
        )
        console.log(`✅ Question updated:`, JSON.stringify(result, null, 2))
        appendSummary(`### Question Updated: \`${config.questionId}\``)
        appendSummary('```json')
        appendSummary(JSON.stringify(result, null, 2))
        appendSummary('```')
      }
      break
    }

    case 'delete': {
      if (!config.questionId) {
        throw new Error('QUALTRICS_QUESTION_ID is required for delete action')
      }
      if (config.dryRun) {
        console.log(`\n🔍 DRY RUN — would delete ${config.questionId}`)
        appendSummary(`### Dry Run — Delete Question \`${config.questionId}\``)
        appendSummary(
          `Would delete question \`${config.questionId}\` from survey \`${config.surveyId}\`.`
        )
      } else {
        console.log(`\n🗑️ Deleting question ${config.questionId}...`)
        const result = await deleteQuestion(
          config.baseUrl,
          config.surveyId,
          config.questionId,
          auth
        )
        console.log(`✅ Question deleted:`, JSON.stringify(result, null, 2))
        appendSummary(`### Question Deleted: \`${config.questionId}\``)
        appendSummary('```json')
        appendSummary(JSON.stringify(result, null, 2))
        appendSummary('```')
      }
      break
    }
  }
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`)
  appendSummary(`### ❌ Error`)
  appendSummary(`\`\`\`\n${err instanceof Error ? err.message : err}\n\`\`\``)
  process.exit(1)
})
