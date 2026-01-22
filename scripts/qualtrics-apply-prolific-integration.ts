type Json = Record<string, unknown>

type HttpResult = {
  url: string
  status: number
  bodyText: string
  json: unknown | null
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

function getFlowArrayFromPayload(flowPayload: unknown): {
  unwrapped: Record<string, unknown>
  flowKey: 'Flow' | 'flow'
  flowArr: unknown[]
} {
  const unwrapped = unwrapResult(flowPayload)
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
  return { unwrapped: unwrapped as Record<string, unknown>, flowKey, flowArr }
}

function logFlowStructure(flowPayload: unknown): void {
  const { unwrapped, flowArr, flowKey } = getFlowArrayFromPayload(flowPayload)

  console.log(`Flow payload keys: ${Object.keys(unwrapped).join(', ')}`)
  console.log(`Flow key: ${flowKey}`)

  const props = unwrapped.Properties
  if (props && typeof props === 'object') {
    console.log(`Flow Properties keys: ${Object.keys(props as Record<string, unknown>).join(', ')}`)
  }

  const first = flowArr[0]
  if (first && typeof first === 'object') {
    console.log(
      `First flow element keys: ${Object.keys(first as Record<string, unknown>).join(', ')}`
    )
  }

  const tuples = flowArr.slice(0, 12).map((el) => {
    if (!el || typeof el !== 'object') return String(typeof el)
    const rec = el as Record<string, unknown>
    const t = typeof rec.Type === 'string' ? rec.Type : 'object'
    const id = typeof rec.ID === 'string' ? rec.ID : ''
    const fid = typeof rec.FlowID === 'string' ? rec.FlowID : ''
    return `(${t}${id ? `, ID=${id}` : ''}${fid ? `, FlowID=${fid}` : ''})`
  })
  console.log(`Flow elements preview: ${tuples.join(' ')}`)

  const types = flowArr
    .map((el) => {
      if (!el || typeof el !== 'object') return typeof el
      const t = (el as Record<string, unknown>).Type
      return typeof t === 'string' ? t : 'object'
    })
    .slice(0, 30)

  console.log(`Flow element types (first ${types.length}): ${types.join(', ')}`)

  const endEl = flowArr.find((el) => {
    if (!el || typeof el !== 'object') return false
    const t = (el as Record<string, unknown>).Type
    return t === 'EndSurvey' || t === 'End of Survey' || t === 'RedirectToURL'
  })

  if (endEl && typeof endEl === 'object') {
    const endRec = endEl as Record<string, unknown>
    console.log(
      `Sample end element Type=${String(endRec.Type)} keys: ${Object.keys(endRec).join(', ')}`
    )

    const options = endRec.Options
    if (options && typeof options === 'object') {
      console.log(
        `Sample end element Options keys: ${Object.keys(options as Record<string, unknown>).join(', ')}`
      )
      const endSurveyOptions = (options as Record<string, unknown>).EndSurveyOptions
      if (endSurveyOptions && typeof endSurveyOptions === 'object') {
        console.log(
          `Sample EndSurveyOptions keys: ${Object.keys(endSurveyOptions as Record<string, unknown>).join(', ')}`
        )
      }
    }
  }
}

function nextFlowIdFromExisting(flowArr: unknown[]): string {
  let max = 0
  for (const el of flowArr) {
    if (!el || typeof el !== 'object') continue
    const fid = (el as Record<string, unknown>).FlowID
    if (typeof fid !== 'string') continue
    const m = /^FL_(\d+)$/.exec(fid)
    if (!m) continue
    const n = Number(m[1])
    if (Number.isFinite(n) && n > max) max = n
  }
  return `FL_${max + 1}`
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

async function postNoBodyFirstOk(urls: string[], apiToken: string): Promise<HttpResult> {
  const attempts: Array<{ url: string; status: number; error?: string }> = []
  let last: HttpResult | null = null
  for (const url of urls) {
    const result = await httpJson('POST', url, apiToken)
    attempts.push({ url: result.url, status: result.status, error: summarizeHttpError(result) })
    last = result
    if (result.status >= 200 && result.status < 300) return result
  }
  if (!last) {
    throw new Error('No URLs provided')
  }
  throw new Error(
    `All POST (no body) attempts failed: ${attempts
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
    optionsObj,
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

function ensureCompletionRedirectInDefinition(
  defObj: unknown,
  completionUrl: string
): { updated: boolean; defObj: unknown } {
  if (containsString(defObj, 'app.prolific.com/submissions/complete?cc=')) {
    return { updated: false, defObj }
  }

  const unwrapped = unwrapResult(defObj)
  if (!unwrapped || typeof unwrapped !== 'object') {
    throw new Error('Survey definition response was not an object')
  }

  let updated = false

  const candidatePaths: string[] = []

  function recordCandidates(node: unknown, path: string): void {
    if (!node || typeof node !== 'object') return
    const rec = node as Record<string, unknown>
    for (const key of Object.keys(rec)) {
      if (/redirect|end|thank|termination|complete|next/i.test(key)) {
        if (candidatePaths.length < 60) {
          candidatePaths.push(path ? `${path}.${key}` : key)
        }
      }
      const value = rec[key]
      if (value && typeof value === 'object') {
        recordCandidates(value, path ? `${path}.${key}` : key)
      }
    }
  }

  function visit(node: unknown): void {
    if (updated) return
    if (!node || typeof node !== 'object') return

    const rec = node as Record<string, unknown>

    const nextAction = rec.NextAction
    const nextActionStr = typeof nextAction === 'string' ? nextAction : ''
    const looksLikeRedirect = nextActionStr.toLowerCase() === 'redirecttourl'

    if (looksLikeRedirect) {
      // Update the most likely URL keys used by tenants.
      const urlKeys = [
        'RedirectURL',
        'RedirectUrl',
        'RedirectToURL',
        'RedirectToUrl',
        'URL',
        'Url',
        'NextURL',
        'NextUrl',
      ]

      for (const key of urlKeys) {
        if (key in rec && typeof rec[key] === 'string') {
          rec[key] = completionUrl
          updated = true
          return
        }
      }

      // If none exist, add RedirectURL.
      rec.RedirectURL = completionUrl
      updated = true
      return
    }

    for (const value of Object.values(rec)) {
      visit(value)
      if (updated) return
    }
  }

  visit(unwrapped)

  if (!updated) {
    // Common QSF schema: SurveyOptions.EOSRedirectURL + SurveyOptions.SurveyTermination
    const u = unwrapped as Record<string, unknown>
    const surveyOptions = u.SurveyOptions
    if (surveyOptions && typeof surveyOptions === 'object') {
      const opts = surveyOptions as Record<string, unknown>
      const hasEOSKey = Object.prototype.hasOwnProperty.call(opts, 'EOSRedirectURL')
      const hasTerminationKey = Object.prototype.hasOwnProperty.call(opts, 'SurveyTermination')

      if (hasEOSKey || hasTerminationKey) {
        const prevTermination =
          typeof opts.SurveyTermination === 'string' ? opts.SurveyTermination : ''
        if (prevTermination) {
          console.log(`SurveyOptions.SurveyTermination (before): ${prevTermination}`)
        }

        opts.EOSRedirectURL = completionUrl
        opts.SurveyTermination = 'redirect'
        updated = true
        return { updated: true, defObj }
      }
    }

    recordCandidates(unwrapped, '')
    throw new Error(
      `Could not find an existing RedirectToURL configuration in definition JSON; refusing to guess where to set completion redirect. Candidate keys found (paths, no values): ${candidatePaths
        .slice(0, 30)
        .join(', ')}`
    )
  }

  return { updated: true, defObj }
}

function findSurveyFlowObject(defObj: unknown): unknown | null {
  const unwrapped = unwrapResult(defObj)
  if (!unwrapped || typeof unwrapped !== 'object') return null

  function looksLikeFlow(obj: unknown): obj is Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return false
    const rec = obj as Record<string, unknown>
    if (!('Flow' in rec)) return false
    if (!Array.isArray(rec.Flow)) return false
    // Heuristic: matches the /flow payload shape we observed.
    return typeof rec.Type === 'string' && typeof rec.FlowID === 'string'
  }

  function walk(node: unknown): unknown | null {
    if (looksLikeFlow(node)) return node
    if (!node || typeof node !== 'object') return null
    for (const value of Object.values(node as Record<string, unknown>)) {
      const found = walk(value)
      if (found) return found
    }
    return null
  }

  return walk(unwrapped)
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

  const redirectUrlTemplate = '${e://Field/COMPLETE_URL}'

  // Fetch options early so we can preserve existing Prolific completion behavior even when
  // PROLIFIC_COMPLETION_URL/PROLIFIC_COMPLETION_CODE_SUCCESS are not available locally.
  const optionsGetUrls = [`${baseUrl}/API/v3/survey-definitions/${surveyId}/options`]
  const optionsPutUrls = [`${baseUrl}/API/v3/survey-definitions/${surveyId}/options`]

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
      'Missing Prolific completion redirect configuration. Provide PROLIFIC_COMPLETION_URL/PROLIFIC_COMPLETION_CODE_SUCCESS, or ensure the current survey options EOSRedirectURL already contains the Prolific completion URL.'
    )
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
    'Redirect mode: SurveyTermination=Redirect and EOSRedirectURL=${e://Field/COMPLETE_URL} (default COMPLETE_URL points to Prolific completion; website links override COMPLETE_URL to point at the site completion page).'
  )
}

main().catch((err) => {
  console.error('❌ Apply failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
