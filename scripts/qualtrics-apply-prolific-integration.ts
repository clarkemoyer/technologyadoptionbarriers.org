type HttpResult = {
  url: string
  status: number
  bodyText: string
  json: unknown | null
}

type FlowElement = Record<string, unknown>

function parseBoolEnv(name: string): boolean {
  const raw = (process.env[name] || '').trim().toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on'
}

function summarizeHttpError(result: HttpResult): string {
  const json = result.json
  const metaError =
    json && typeof json === 'object'
      ? (json as Record<string, unknown>).meta &&
        typeof (json as Record<string, unknown>).meta === 'object'
        ? ((json as Record<string, unknown>).meta as Record<string, unknown>).error
        : undefined
      : undefined

  if (metaError && typeof metaError === 'object') {
    const rec = metaError as Record<string, unknown>
    const msg =
      (typeof rec.errorMessage === 'string' && rec.errorMessage) ||
      (typeof rec.message === 'string' && rec.message) ||
      (typeof rec.errorCode === 'string' && rec.errorCode)
    const text = (result.bodyText || '').trim()
    if (msg) {
      // If the meta error is generic, include a short body snippet too.
      if (msg === 'The request was invalid.' && text && text !== msg) {
        const snippet = text.length > 240 ? `${text.slice(0, 240)}…` : text
        return `${msg} ${snippet}`
      }
      return msg
    }
  }

  const text = (result.bodyText || '').trim()
  if (!text) return ''
  return text.length > 240 ? `${text.slice(0, 240)}…` : text
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

function containsString(obj: unknown, needle: string): boolean {
  if (typeof obj === 'string') return obj.includes(needle)
  if (!obj || typeof obj !== 'object') return false
  for (const value of Object.values(obj as Record<string, unknown>)) {
    if (containsString(value, needle)) return true
  }
  return false
}

async function httpJson(
  method: 'GET' | 'PUT' | 'POST',
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
  const attempts: Array<{ url: string; status: number; error?: string }> = []
  let last: HttpResult | null = null
  for (const url of urls) {
    const result = await httpJson('GET', url, apiToken)
    attempts.push({ url: result.url, status: result.status, error: summarizeHttpError(result) })
    last = result
    if (result.status >= 200 && result.status < 300) return result
  }
  if (!last) {
    throw new Error('No URLs provided')
  }
  throw new Error(
    `All GET attempts failed: ${attempts
      .map((a) => `${a.status} ${a.url}${a.error ? ` (${a.error})` : ''}`)
      .join(' | ')}`
  )
}

async function putFirstOk(urls: string[], apiToken: string, body: unknown): Promise<HttpResult> {
  const attempts: Array<{ url: string; status: number; error?: string }> = []
  let last: HttpResult | null = null
  for (const url of urls) {
    const result = await httpJson('PUT', url, apiToken, body)
    attempts.push({ url: result.url, status: result.status, error: summarizeHttpError(result) })
    last = result
    if (result.status >= 200 && result.status < 300) return result
  }
  if (!last) {
    throw new Error('No URLs provided')
  }
  throw new Error(
    `All PUT attempts failed: ${attempts
      .map((a) => `${a.status} ${a.url}${a.error ? ` (${a.error})` : ''}`)
      .join(' | ')}`
  )
}

async function postFirstOk(urls: string[], apiToken: string, body: unknown): Promise<HttpResult> {
  const attempts: Array<{ url: string; status: number; error?: string }> = []
  let last: HttpResult | null = null
  for (const url of urls) {
    const result = await httpJson('POST', url, apiToken, body)
    attempts.push({ url: result.url, status: result.status, error: summarizeHttpError(result) })
    last = result
    if (result.status >= 200 && result.status < 300) return result
  }
  if (!last) {
    throw new Error('No URLs provided')
  }
  throw new Error(
    `All POST attempts failed: ${attempts
      .map((a) => `${a.status} ${a.url}${a.error ? ` (${a.error})` : ''}`)
      .join(' | ')}`
  )
}

function embedFieldsBody(): {
  embeddedDataFields: Array<{ key: string; value?: string; type?: string }>
} {
  return {
    embeddedDataFields: [
      { key: 'PROLIFIC_PID', value: '', type: 'textSet' },
      { key: 'STUDY_ID', value: '', type: 'textSet' },
      { key: 'SESSION_ID', value: '', type: 'textSet' },
      { key: 'SOURCE', value: 'unknown', type: 'textSet' },
      {
        key: 'COMPLETE_URL',
        // Placeholder; populated in main() once we determine the correct default completion URL.
        value: '',
        type: 'textSet',
      },
    ],
  }
}

function getProlificCompletionUrlFromEnv(): string | null {
  const explicitUrl = (process.env.PROLIFIC_COMPLETION_URL || '').trim()
  if (explicitUrl) return explicitUrl

  const code = (process.env.PROLIFIC_COMPLETION_CODE_SUCCESS || '').trim()
  if (code) return `https://app.prolific.com/submissions/complete?cc=${code}`

  return null
}

function getProlificCompletionUrlFromOptions(optionsObj: unknown): string | null {
  const unwrapped = unwrapResult(optionsObj)
  if (!unwrapped || typeof unwrapped !== 'object') return null
  const opts = unwrapped as Record<string, unknown>
  const eos = typeof opts.EOSRedirectURL === 'string' ? opts.EOSRedirectURL : ''
  return eos.includes('app.prolific.com/submissions/complete?cc=') ? eos : null
}

function getProlificCompletionUrlFromSurvey(surveyObj: unknown): string | null {
  const unwrapped = unwrapResult(surveyObj)
  if (!unwrapped || typeof unwrapped !== 'object') return null

  const root = unwrapped as Record<string, unknown>
  const embeddedData = root.embeddedData
  if (!Array.isArray(embeddedData)) return null

  for (const item of embeddedData) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const name = typeof row.name === 'string' ? row.name : ''
    if (name !== 'COMPLETE_URL') continue
    const defaultValue = typeof row.defaultValue === 'string' ? row.defaultValue.trim() : ''
    return defaultValue || null
  }

  return null
}

function ensureCompletionRedirectInOptions(
  optionsObj: unknown,
  redirectUrlTemplate: string
): { updated: boolean; optionsObj: unknown } {
  const unwrapped = unwrapResult(optionsObj)
  if (!unwrapped || typeof unwrapped !== 'object') {
    throw new Error('Survey options response was not an object')
  }

  const opts = unwrapped as Record<string, unknown>
  const prevTermination = typeof opts.SurveyTermination === 'string' ? opts.SurveyTermination : ''
  const prevUrl = typeof opts.EOSRedirectURL === 'string' ? opts.EOSRedirectURL : ''

  // Tenant-validated schema: SurveyTermination='Redirect' + EOSRedirectURL
  opts.EOSRedirectURL = redirectUrlTemplate
  opts.SurveyTermination = 'Redirect'

  return {
    updated: prevTermination !== 'Redirect' || prevUrl !== redirectUrlTemplate,
    optionsObj: unwrapped,
  }
}

function ensureHeaderScriptInOptions(
  optionsObj: unknown,
  script: string
): { updated: boolean; optionsObj: unknown } {
  if (!script.trim()) return { updated: false, optionsObj }
  if (containsString(optionsObj, 'assets.prolific.com/assets/js/qualtrics/qualtrics.min.js')) {
    return { updated: false, optionsObj }
  }

  const unwrapped = unwrapResult(optionsObj)
  if (!unwrapped || typeof unwrapped !== 'object') {
    throw new Error('Survey options response was not an object')
  }

  const opts = unwrapped as Record<string, unknown>
  const existing = typeof opts.Header === 'string' ? opts.Header : ''
  opts.Header = existing.trim() === '' ? script : `${existing}\n${script}`
  return { updated: true, optionsObj }
}

function iterFlowElements(elements: unknown, visit: (el: FlowElement) => void) {
  if (!Array.isArray(elements)) return
  for (const item of elements) {
    if (!item || typeof item !== 'object') continue
    const el = item as FlowElement
    visit(el)
    if ('Flow' in el) iterFlowElements(el.Flow, visit)
  }
}

function getNextFlowId(rootFlow: unknown): string {
  let maxNumeric = 0
  iterFlowElements(rootFlow, (el) => {
    const id = typeof el.FlowID === 'string' ? el.FlowID : ''
    const m = /^FL_(\d+)$/.exec(id)
    if (!m) return
    const n = Number(m[1])
    if (Number.isFinite(n) && n > maxNumeric) maxNumeric = n
  })
  return `FL_${maxNumeric + 1}`
}

function detectBranchLogicShape(rootFlow: unknown): 'numericKeys' | 'booleanExpression' {
  let found: 'numericKeys' | 'booleanExpression' | null = null
  iterFlowElements(rootFlow, (el) => {
    if (found) return
    if (typeof el.Type !== 'string' || el.Type !== 'Branch') return
    const logic = el.BranchLogic
    if (!logic || typeof logic !== 'object') return
    const rec = logic as Record<string, unknown>
    if (typeof rec.Type === 'string') {
      found = 'booleanExpression'
      return
    }
    if (Object.keys(rec).some((k) => /^\d+$/.test(k))) {
      found = 'numericKeys'
      return
    }
  })
  return found || 'numericKeys'
}

function isEmbeddedDataSet(el: FlowElement, field: string, value: string): boolean {
  if (el.Type !== 'EmbeddedData') return false
  const embedded = el.EmbeddedData
  if (!Array.isArray(embedded)) return false
  for (const item of embedded) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const f =
      typeof rec.Field === 'string' ? rec.Field : typeof rec.Name === 'string' ? rec.Name : ''
    const v = typeof rec.Value === 'string' ? rec.Value : ''
    if (f === field && v === value) return true
  }
  return false
}

function ensureRedirectLockdownInFlow(
  flowObj: unknown,
  params: { prolificCompletionUrl: string; websiteCompletionUrl: string }
): { updated: boolean; flowObj: unknown } {
  const unwrapped = unwrapResult(flowObj)
  if (!unwrapped || typeof unwrapped !== 'object') {
    throw new Error('Survey flow response was not an object')
  }

  const root = unwrapped as Record<string, unknown>
  const flow = root.Flow
  if (!Array.isArray(flow)) {
    throw new Error('Survey flow response did not contain a Flow array')
  }

  const { prolificCompletionUrl, websiteCompletionUrl } = params
  const branchLogicShape = detectBranchLogicShape(flow)

  let hasWebsiteSetter = false
  let hasProlificBranchSetter = false

  iterFlowElements(flow, (el) => {
    if (!hasWebsiteSetter && isEmbeddedDataSet(el, 'COMPLETE_URL', websiteCompletionUrl)) {
      hasWebsiteSetter = true
    }
    if (!hasProlificBranchSetter && isEmbeddedDataSet(el, 'COMPLETE_URL', prolificCompletionUrl)) {
      // This might be anywhere; we only use it as a heuristic for idempotency.
      hasProlificBranchSetter = true
    }
  })

  const newElements: Array<unknown> = []
  let updated = false

  if (!hasWebsiteSetter) {
    newElements.push({
      Type: 'EmbeddedData',
      FlowID: getNextFlowId(flow),
      EmbeddedData: [
        {
          Field: 'COMPLETE_URL',
          Value: websiteCompletionUrl,
          SetEmbeddedDataFromPanel: false,
        },
      ],
    })
    updated = true
  }

  if (!hasProlificBranchSetter) {
    const branchLogic =
      branchLogicShape === 'booleanExpression'
        ? {
            Type: 'BooleanExpression',
            LeftOperand: { Type: 'EmbeddedData', Field: 'PROLIFIC_PID' },
            Operator: 'IsNotEmpty',
          }
        : {
            '0': {
              '0': {
                LogicType: 'EmbeddedData',
                LeftOperand: 'e://Field/PROLIFIC_PID',
                Operator: 'IsNotEmpty',
              },
            },
          }

    newElements.push({
      Type: 'Branch',
      FlowID: getNextFlowId(flow),
      Description: 'TABS: lock down COMPLETE_URL for Prolific',
      BranchLogic: branchLogic,
      Flow: [
        {
          Type: 'EmbeddedData',
          FlowID: getNextFlowId(flow),
          EmbeddedData: [
            {
              Field: 'COMPLETE_URL',
              Value: prolificCompletionUrl,
              SetEmbeddedDataFromPanel: false,
            },
          ],
        },
      ],
    })
    updated = true
  }

  if (updated) {
    root.Flow = [...newElements, ...flow]
  }

  return { updated, flowObj: unwrapped }
}

async function main() {
  const confirm = process.env.QUALTRICS_PROLIFIC_CONFIRM || ''
  if (confirm !== 'APPLY') {
    throw new Error('Confirmation missing. Set QUALTRICS_PROLIFIC_CONFIRM=APPLY to proceed.')
  }

  const publishConfirm = (process.env.QUALTRICS_PROLIFIC_PUBLISH || '').trim()

  const apiToken = requiredEnv('QUALTRICS_API_TOKEN')
  const baseUrl = requiredEnv('QUALTRICS_BASE_URL').replace(/\/$/, '')
  const surveyId = requiredEnv('QUALTRICS_SURVEY_ID')

  const authenticityScript = process.env.PROLIFIC_QUALTRICS_AUTHENTICITY_SCRIPT || ''

  const lockDownRedirect = parseBoolEnv('QUALTRICS_PROLIFIC_LOCK_DOWN_REDIRECT')
  const websiteCompletionUrl =
    (process.env.TABS_WEBSITE_COMPLETE_URL || '').trim() ||
    'https://technologyadoptionbarriers.org/survey-complete'

  const redirectUrlTemplate = '${e://Field/COMPLETE_URL}'

  // Fetch options early so we can preserve existing Prolific completion behavior even when
  // PROLIFIC_COMPLETION_URL/PROLIFIC_COMPLETION_CODE_SUCCESS are not available locally.
  const optionsGetUrls = [`${baseUrl}/API/v3/survey-definitions/${surveyId}/options`]
  const optionsPutUrls = [`${baseUrl}/API/v3/survey-definitions/${surveyId}/options`]

  const flowGetUrls = [`${baseUrl}/API/v3/survey-definitions/${surveyId}/flow`]
  const flowPutUrls = [`${baseUrl}/API/v3/survey-definitions/${surveyId}/flow`]

  const optionsGet = await getFirstOk(optionsGetUrls, apiToken)
  console.log(`Options GET: ${optionsGet.status} ${optionsGet.url}`)
  const optionsJson = optionsGet.json
  if (!optionsJson) {
    throw new Error(
      `Options GET did not return JSON: ${optionsGet.url} (HTTP ${optionsGet.status})`
    )
  }

  let prolificCompletionUrl =
    getProlificCompletionUrlFromEnv() || getProlificCompletionUrlFromOptions(optionsJson)

  // Once we switch EOSRedirectURL to piped text (${e://Field/COMPLETE_URL}), the previous
  // “infer it from options” trick stops working. As a fallback, fetch the survey definition
  // and read the default value of the COMPLETE_URL embedded data field.
  if (!prolificCompletionUrl) {
    const surveyGetUrls = [`${baseUrl}/API/v3/surveys/${surveyId}`]
    const surveyGet = await getFirstOk(surveyGetUrls, apiToken)
    console.log(`Survey GET: ${surveyGet.status} ${surveyGet.url}`)
    prolificCompletionUrl = getProlificCompletionUrlFromSurvey(surveyGet.json)
  }

  if (!prolificCompletionUrl) {
    throw new Error(
      'Missing Prolific completion redirect configuration. Provide PROLIFIC_COMPLETION_URL/PROLIFIC_COMPLETION_CODE_SUCCESS in the GitHub Actions environment qualtrics-prod, or ensure the current survey options EOSRedirectURL already contains the Prolific completion URL.'
    )
  }

  // 0) Optional: lock down COMPLETE_URL inside Survey Flow so inbound links cannot force arbitrary redirects.
  // This makes the redirect effectively allowlisted to two destinations:
  // - Prolific completion URL (when PROLIFIC_PID is present)
  // - Website completion URL (default)
  if (lockDownRedirect) {
    const flowGet = await getFirstOk(flowGetUrls, apiToken)
    console.log(`Flow GET: ${flowGet.status} ${flowGet.url}`)
    const flowJson = flowGet.json
    if (!flowJson) {
      throw new Error(`Flow GET did not return JSON: ${flowGet.url} (HTTP ${flowGet.status})`)
    }

    const flowUpdate = ensureRedirectLockdownInFlow(flowJson, {
      prolificCompletionUrl,
      websiteCompletionUrl,
    })

    if (flowUpdate.updated) {
      const flowPut = await putFirstOk(flowPutUrls, apiToken, unwrapResult(flowUpdate.flowObj))
      console.log(`Flow PUT: ${flowPut.status} ${flowPut.url}`)
    }
  }

  // 1) Ensure Embedded Data fields exist (supported endpoint)
  {
    const postUrls = [`${baseUrl}/API/v3/surveys/${surveyId}/embeddeddatafields`]
    const body = embedFieldsBody()
    const completeField = body.embeddedDataFields.find((f) => f.key === 'COMPLETE_URL')
    if (completeField) completeField.value = prolificCompletionUrl
    const res = await postFirstOk(postUrls, apiToken, body)
    console.log(`EmbeddedDataFields POST: ${res.status} ${res.url}`)
  }

  // 2) Update survey options: completion redirect + optional header script (supported endpoint)
  {
    const redirectUpdate = ensureCompletionRedirectInOptions(optionsJson, redirectUrlTemplate)
    const headerUpdate = ensureHeaderScriptInOptions(redirectUpdate.optionsObj, authenticityScript)

    if (redirectUpdate.updated || headerUpdate.updated) {
      const optionsPut = await putFirstOk(
        optionsPutUrls,
        apiToken,
        unwrapResult(headerUpdate.optionsObj)
      )
      console.log(`Options PUT: ${optionsPut.status} ${optionsPut.url}`)
    }
  }

  // 3) Optional: publish a new survey definition version (tenant-dependent)
  if (publishConfirm === 'PUBLISH') {
    const publishUrls = [`${baseUrl}/API/v3/survey-definitions/${surveyId}/versions`]

    // This tenant requires a JSON body with these exact fields.
    const publishBody = {
      Description:
        (process.env.QUALTRICS_PROLIFIC_PUBLISH_DESCRIPTION || '').trim() ||
        `TABS publish ${new Date().toISOString()}`,
      Published: true,
    }

    const publishAttempts: Array<{ url: string; status: number; error?: string | null }> = []
    let last: HttpResult | null = null
    for (const url of publishUrls) {
      const result = await httpJson('POST', url, apiToken, publishBody)
      publishAttempts.push({
        url: result.url,
        status: result.status,
        error: summarizeHttpError(result),
      })
      last = result
      if (result.status >= 200 && result.status < 300) {
        console.log(`Publish POST: ${result.status} ${result.url}`)
        last = null
        break
      }
    }
    if (last) {
      throw new Error(
        `All publish POST attempts failed: ${publishAttempts
          .map((a) => `${a.status} ${a.url}${a.error ? ` (${a.error})` : ''}`)
          .join(' | ')}`
      )
    }
  }

  // Keep output minimal (no secrets).
  console.log(
    '✅ Qualtrics ↔ Prolific apply completed (Embedded Data + redirect; header script optional).'
  )
  console.log(`Survey ID: ${surveyId}`)
  console.log(
    "Reminder: some Qualtrics tenants require a manual 'Publish' in the Qualtrics UI before changes affect the anonymous link respondent experience."
  )
  console.log(
    lockDownRedirect
      ? `Redirect mode: SurveyTermination=Redirect and EOSRedirectURL=${redirectUrlTemplate} (Survey Flow locks COMPLETE_URL to either Prolific completion or ${websiteCompletionUrl}).`
      : 'Redirect mode: SurveyTermination=Redirect and EOSRedirectURL=${e://Field/COMPLETE_URL} (default COMPLETE_URL points to Prolific completion; website links override COMPLETE_URL to point at the site completion page).'
  )
}

main().catch((err) => {
  console.error('❌ Apply failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
