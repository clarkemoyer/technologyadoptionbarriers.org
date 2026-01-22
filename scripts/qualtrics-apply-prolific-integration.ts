type Json = Record<string, unknown>

type HttpResult = {
  url: string
  status: number
  bodyText: string
  json: unknown | null
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function unwrapResult(value: unknown): unknown {
  if (value && typeof value === 'object' && 'result' in value) {
    const result = (value as { result?: unknown }).result
    if (result !== undefined) return result
  }
  return value
}

function deepFindKey(obj: unknown, key: string): unknown | undefined {
  if (!obj || typeof obj !== 'object') return undefined

  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return (obj as Record<string, unknown>)[key]
  }

  for (const value of Object.values(obj as Record<string, unknown>)) {
    const found = deepFindKey(value, key)
    if (found !== undefined) return found
  }

  return undefined
}

function deepFindFirstStringKey(
  obj: unknown,
  keys: string[]
): { key: string; parent: Json } | null {
  if (!obj || typeof obj !== 'object') return null

  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (keys.includes(k) && typeof v === 'string') {
      return { key: k, parent: obj as Json }
    }
    const child = deepFindFirstStringKey(v, keys)
    if (child) return child
  }

  return null
}

function containsString(obj: unknown, needle: string): boolean {
  if (typeof obj === 'string') return obj.includes(needle)
  if (!obj || typeof obj !== 'object') return false
  for (const value of Object.values(obj as Record<string, unknown>)) {
    if (containsString(value, needle)) return true
  }
  return false
}

function ensureArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  return []
}

function randomFlowId(prefix: string): string {
  const rand = Math.random().toString(16).slice(2)
  return `${prefix}_${rand}`
}

async function httpJson(
  method: 'GET' | 'PUT',
  url: string,
  apiToken: string,
  body?: unknown
): Promise<HttpResult> {
  const headers: Record<string, string> = {
    'X-API-TOKEN': apiToken,
    Accept: 'application/json',
  }

  let bodyString: string | undefined

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    bodyString = JSON.stringify(body)
  }

  const res = await fetch(url, {
    method,
    headers,
    body: bodyString,
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

async function getFirstOk(urls: string[], apiToken: string): Promise<HttpResult> {
  let last: HttpResult | null = null
  for (const url of urls) {
    const result = await httpJson('GET', url, apiToken)
    last = result
    if (result.status >= 200 && result.status < 300) return result
  }
  if (!last) {
    throw new Error('No URLs provided')
  }
  throw new Error(`All GET attempts failed. Last: ${last.url} (HTTP ${last.status})`)
}

async function putFirstOk(urls: string[], apiToken: string, body: unknown): Promise<HttpResult> {
  let last: HttpResult | null = null
  for (const url of urls) {
    const result = await httpJson('PUT', url, apiToken, body)
    last = result
    if (result.status >= 200 && result.status < 300) return result
  }
  if (!last) {
    throw new Error('No URLs provided')
  }
  throw new Error(`All PUT attempts failed. Last: ${last.url} (HTTP ${last.status})`)
}

function ensureEmbeddedDataInFlow(flowObj: unknown): { updated: boolean; flowObj: unknown } {
  const unwrapped = unwrapResult(flowObj)
  if (!unwrapped || typeof unwrapped !== 'object') {
    throw new Error('Survey flow response was not an object')
  }

  const flowKey = (unwrapped as Record<string, unknown>).Flow
    ? 'Flow'
    : (unwrapped as Record<string, unknown>).flow
      ? 'flow'
      : null
  if (!flowKey) {
    throw new Error('Could not find Flow array in survey flow payload')
  }

  const flowArr = ensureArray((unwrapped as Record<string, unknown>)[flowKey])

  const alreadyHasFields = ['PROLIFIC_PID', 'STUDY_ID', 'SESSION_ID'].every((k) =>
    containsString(flowArr, k)
  )
  if (alreadyHasFields) {
    return { updated: false, flowObj }
  }

  const embeddedDataElement: Record<string, unknown> = {
    Type: 'EmbeddedData',
    FlowID: randomFlowId('FL'),
    EmbeddedData: [
      { Field: 'PROLIFIC_PID', Value: '' },
      { Field: 'STUDY_ID', Value: '' },
      { Field: 'SESSION_ID', Value: '' },
    ],
    Description: 'Prolific identifiers (capture from URL params)',
  }

  const newFlow = [embeddedDataElement, ...flowArr]

  ;(unwrapped as Record<string, unknown>)[flowKey] = newFlow

  return { updated: true, flowObj: flowObj }
}

function ensureProlificCompletionRedirectInFlow(
  flowObj: unknown,
  completionUrl: string
): { updated: boolean; flowObj: unknown } {
  const unwrapped = unwrapResult(flowObj)
  if (!unwrapped || typeof unwrapped !== 'object') {
    throw new Error('Survey flow response was not an object')
  }

  const flowKey = (unwrapped as Record<string, unknown>).Flow
    ? 'Flow'
    : (unwrapped as Record<string, unknown>).flow
      ? 'flow'
      : null
  if (!flowKey) {
    throw new Error('Could not find Flow array in survey flow payload')
  }

  const flowArr = ensureArray((unwrapped as Record<string, unknown>)[flowKey])

  // If a redirect marker already exists anywhere, do not mutate.
  if (containsString(flowArr, 'app.prolific.com/submissions/complete?cc=')) {
    return { updated: false, flowObj }
  }

  // Prefer modifying an existing EndSurvey element if present.
  let updated = false
  for (const element of flowArr) {
    if (!element || typeof element !== 'object') continue
    const rec = element as Record<string, unknown>
    if (rec.Type === 'EndSurvey' || rec.Type === 'End of Survey') {
      rec.Options = rec.Options && typeof rec.Options === 'object' ? rec.Options : {}
      const options = rec.Options as Record<string, unknown>
      options.EndSurveyOptions =
        options.EndSurveyOptions && typeof options.EndSurveyOptions === 'object'
          ? options.EndSurveyOptions
          : {}

      const endOpts = options.EndSurveyOptions as Record<string, unknown>
      endOpts.NextAction = 'RedirectToURL'
      // Set multiple likely key spellings; tenant schemas vary.
      endOpts.RedirectURL = completionUrl
      endOpts.RedirectUrl = completionUrl
      endOpts.RedirectToURL = completionUrl

      updated = true
      break
    }

    if (rec.Type === 'RedirectToURL') {
      rec.URL = completionUrl
      updated = true
      break
    }
  }

  if (!updated) {
    flowArr.push({
      Type: 'EndSurvey',
      FlowID: randomFlowId('FL'),
      Options: {
        EndSurveyOptions: {
          NextAction: 'RedirectToURL',
          RedirectURL: completionUrl,
        },
      },
      Description: 'Prolific completion redirect',
    })
    ;(unwrapped as Record<string, unknown>)[flowKey] = flowArr
    updated = true
  }

  return { updated, flowObj }
}

function ensureAuthenticityScriptInDefinition(
  defObj: unknown,
  script: string
): { updated: boolean; defObj: unknown } {
  if (!script.trim()) return { updated: false, defObj }

  if (containsString(defObj, 'assets.prolific.com/assets/js/qualtrics/qualtrics.min.js')) {
    return { updated: false, defObj }
  }

  const unwrapped = unwrapResult(defObj)
  if (!unwrapped || typeof unwrapped !== 'object') {
    throw new Error('Survey definition response was not an object')
  }

  // Try to find a likely header field.
  const headerField = deepFindFirstStringKey(unwrapped, [
    'SurveyHeader',
    'Header',
    'SurveyHeaderText',
    'SurveyHeaderHTML',
  ])
  if (!headerField) {
    throw new Error(
      'Could not find a SurveyHeader-like string field in definition JSON; refusing to guess.'
    )
  }

  const existing = String(headerField.parent[headerField.key] || '')
  const appended = existing.trim() === '' ? script : `${existing}\n${script}`
  headerField.parent[headerField.key] = appended

  return { updated: true, defObj }
}

async function main() {
  const confirm = process.env.QUALTRICS_PROLIFIC_CONFIRM || ''
  if (confirm !== 'APPLY') {
    throw new Error('Confirmation missing. Set QUALTRICS_PROLIFIC_CONFIRM=APPLY to proceed.')
  }

  const apiToken = requiredEnv('QUALTRICS_API_TOKEN')
  const baseUrl = requiredEnv('QUALTRICS_BASE_URL').replace(/\/$/, '')
  const surveyId = requiredEnv('QUALTRICS_SURVEY_ID')

  const completionCode = process.env.PROLIFIC_COMPLETION_CODE_SUCCESS || ''
  if (!completionCode) {
    throw new Error(
      'Missing PROLIFIC_COMPLETION_CODE_SUCCESS. Add it as a secret in the job environment running this workflow.'
    )
  }

  const authenticityScript = process.env.PROLIFIC_QUALTRICS_AUTHENTICITY_SCRIPT || ''
  const completionUrl = `https://app.prolific.com/submissions/complete?cc=${completionCode}`

  // 1) Update Survey Flow (Embedded Data + End-of-Survey redirect)
  const flowGetUrls = [
    `${baseUrl}/API/v3/survey-definitions/${surveyId}/flow`,
    `${baseUrl}/API/v3/surveys/${surveyId}/flow`,
  ]

  const flowPutUrls = [
    `${baseUrl}/API/v3/survey-definitions/${surveyId}/flow`,
    `${baseUrl}/API/v3/surveys/${surveyId}/flow`,
  ]

  const flowGet = await getFirstOk(flowGetUrls, apiToken)
  const flowJson = flowGet.json
  if (!flowJson) {
    throw new Error(`Flow GET did not return JSON: ${flowGet.url} (HTTP ${flowGet.status})`)
  }

  const embeddedUpdate = ensureEmbeddedDataInFlow(flowJson)
  const redirectUpdate = ensureProlificCompletionRedirectInFlow(
    embeddedUpdate.flowObj,
    completionUrl
  )

  if (embeddedUpdate.updated || redirectUpdate.updated) {
    await putFirstOk(flowPutUrls, apiToken, unwrapResult(redirectUpdate.flowObj))
  }

  // 2) Optional: update Survey Header script (Authenticity checks)
  if (authenticityScript.trim()) {
    const defGetUrls = [
      `${baseUrl}/API/v3/survey-definitions/${surveyId}`,
      `${baseUrl}/API/v3/surveys/${surveyId}/definition`,
    ]

    const defPutUrls = [
      `${baseUrl}/API/v3/survey-definitions/${surveyId}`,
      `${baseUrl}/API/v3/surveys/${surveyId}/definition`,
    ]

    const defGet = await getFirstOk(defGetUrls, apiToken)
    const defJson = defGet.json
    if (!defJson) {
      throw new Error(`Definition GET did not return JSON: ${defGet.url} (HTTP ${defGet.status})`)
    }

    const defUpdate = ensureAuthenticityScriptInDefinition(defJson, authenticityScript)
    if (defUpdate.updated) {
      await putFirstOk(defPutUrls, apiToken, unwrapResult(defUpdate.defObj))
    }
  }

  // Keep output minimal (no secrets).
  console.log('✅ Qualtrics ↔ Prolific apply completed (flow updated; header script optional).')
  console.log(`Survey ID: ${surveyId}`)
}

main().catch((err) => {
  console.error('❌ Apply failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
