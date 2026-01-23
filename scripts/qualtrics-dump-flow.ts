type HttpResult = {
  url: string
  status: number
  bodyText: string
  json: unknown | null
}

import fs from 'node:fs'
import path from 'node:path'

type QualtricsAuth =
  | { kind: 'api-token'; apiToken: string }
  | { kind: 'oauth-bearer'; accessToken: string }

function envString(name: string): string {
  return (process.env[name] || '').trim()
}

function findAccessTokenFromCacheFile(cacheFile: string): string | null {
  if (!fs.existsSync(cacheFile)) return null

  let raw: string
  try {
    raw = fs.readFileSync(cacheFile, { encoding: 'utf8' })
  } catch {
    return null
  }

  let parsed: unknown
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object') return null
  const rec = parsed as Record<string, unknown>

  const topLevel = rec.access_token
  if (typeof topLevel === 'string' && topLevel.trim()) return topLevel.trim()

  const tokenObj = rec.token
  if (typeof tokenObj === 'string' && tokenObj.trim()) return tokenObj.trim()
  if (tokenObj && typeof tokenObj === 'object') {
    const nested = (tokenObj as Record<string, unknown>).access_token
    if (typeof nested === 'string' && nested.trim()) return nested.trim()
  }

  return null
}

function resolveQualtricsAuth(): QualtricsAuth {
  const apiToken = envString('QUALTRICS_API_TOKEN')
  if (apiToken) return { kind: 'api-token', apiToken }

  const bearer = envString('QUALTRICS_OAUTH_TOKEN')
  if (bearer) return { kind: 'oauth-bearer', accessToken: bearer }

  const cacheFile =
    envString('QUALTRICS_OAUTH_TOKEN_FILE') ||
    path.join(process.cwd(), '.vscode', 'qualtrics-oauth-token.local.json')
  const cached = findAccessTokenFromCacheFile(cacheFile)
  if (cached) return { kind: 'oauth-bearer', accessToken: cached }

  throw new Error(
    'Missing Qualtrics auth. Provide QUALTRICS_API_TOKEN (X-API-TOKEN) or QUALTRICS_OAUTH_TOKEN (Bearer), or mint a token into .vscode/qualtrics-oauth-token.local.json'
  )
}

function parseSurveyInfoFromUrl(surveyUrl: string): { baseUrl: string; surveyId: string } {
  const u = new URL(surveyUrl)
  const m = /\/jfe\/form\/(SV_[A-Za-z0-9]+)/.exec(u.pathname)
  if (!m) throw new Error(`Could not parse survey id from URL: ${surveyUrl}`)
  return { baseUrl: u.origin, surveyId: m[1] }
}

function getDefaultSurveyInfoFromRepo(): { baseUrl: string; surveyId: string } | null {
  // Avoid importing TS modules into scripts; just parse the literal survey URL.
  const candidateFile = path.join(process.cwd(), 'src', 'lib', 'tabs-survey.ts')
  if (!fs.existsSync(candidateFile)) return null
  const content = fs.readFileSync(candidateFile, { encoding: 'utf8' })
  const m = /TABS_QUALTRICS_ANONYMOUS_SURVEY_URL\s*=\s*['"]([^'"]+)['"]/m.exec(content)
  if (!m) return null
  try {
    return parseSurveyInfoFromUrl(m[1])
  } catch {
    return null
  }
}

async function httpJson(method: 'GET', url: string, auth: QualtricsAuth): Promise<HttpResult> {
  const res = await fetch(url, {
    method,
    headers: {
      ...(auth.kind === 'api-token'
        ? { 'X-API-TOKEN': auth.apiToken }
        : { Authorization: `Bearer ${auth.accessToken}` }),
      Accept: 'application/json',
    },
  })

  const bodyText = await res.text()
  let json: unknown | null = null
  try {
    json = bodyText ? JSON.parse(bodyText) : null
  } catch {
    json = null
  }

  return { url, status: res.status, bodyText, json }
}

function unwrapResult(value: unknown): unknown {
  if (value && typeof value === 'object' && 'result' in value) {
    const result = (value as { result?: unknown }).result
    if (result !== undefined) return result
  }
  return value
}

async function main() {
  const auth = resolveQualtricsAuth()

  const fallback = getDefaultSurveyInfoFromRepo() || {
    baseUrl: 'https://smeal.qualtrics.com',
    surveyId: 'SV_bkMopd73A8fzfwO',
  }

  const baseUrl = (envString('QUALTRICS_BASE_URL') || fallback.baseUrl).replace(/\/$/, '')
  const surveyId = envString('QUALTRICS_SURVEY_ID') || fallback.surveyId

  const url = `${baseUrl}/API/v3/survey-definitions/${surveyId}/flow`
  const res = await httpJson('GET', url, auth)

  if (res.status < 200 || res.status >= 300) {
    throw new Error(
      `Flow GET failed: ${res.status} ${res.url} ${(res.bodyText || '').slice(0, 500)}`
    )
  }

  const unwrapped = unwrapResult(res.json)
  if (!unwrapped) {
    throw new Error('Flow GET returned empty JSON')
  }

  const fileName = path.join(process.cwd(), '.vscode', `qualtrics-flow.${surveyId}.json`)
  fs.mkdirSync(path.dirname(fileName), { recursive: true })
  fs.writeFileSync(fileName, JSON.stringify(unwrapped, null, 2), { encoding: 'utf8' })

  console.log(`✅ Wrote: ${fileName}`)
  console.log(
    'Tip: if you add a dummy Branch in the Qualtrics UI Flow, re-run this to capture the tenant-specific Branch schema.'
  )
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
