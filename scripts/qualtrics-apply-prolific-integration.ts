type HttpResult = {
  url: string
  status: number
  bodyText: string
  json: unknown | null
}

type FlowElement = Record<string, unknown>

import fs from 'node:fs'
import path from 'node:path'

type QualtricsAuth =
  | { kind: 'api-token'; apiToken: string }
  | { kind: 'oauth-bearer'; accessToken: string }

function parseBoolEnv(name: string): boolean {
  const raw = (process.env[name] || '').trim().toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on'
}

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

type BranchLogicStyle =
  | 'tenant-array'
  | 'tenant-boolean-list'
  | 'boolean-expression'
  | 'single-numeric'
  | 'double-numeric'
  | 'typed-double-numeric'

function parseBranchLogicStyle(): BranchLogicStyle {
  const raw = envString('QUALTRICS_PROLIFIC_BRANCHLOGIC_STYLE').toLowerCase()
  if (raw === 'tenant-array' || raw === 'array' || raw === 'tabs-tenant-array') {
    return 'tenant-array'
  }
  if (raw === 'tenant' || raw === 'tenant-boolean-list' || raw === 'tabs-tenant') {
    return 'tenant-boolean-list'
  }
  if (raw === 'boolean' || raw === 'boolean-expression' || raw === 'expr')
    return 'boolean-expression'
  if (raw === 'single' || raw === 'single-numeric') return 'single-numeric'
  if (raw === 'double' || raw === 'double-numeric') return 'double-numeric'
  if (raw === 'typed-double' || raw === 'typed-double-numeric') return 'typed-double-numeric'
  // Default to the known-good schema for this tenant (observed via flow dump).
  return 'tenant-array'
}

function buildProlificPresentBranchLogic(style: BranchLogicStyle): Record<string, unknown> {
  const tenantAtom = {
    Type: 'Expression',
    LogicType: 'EmbeddedField',
    LeftOperand: 'e://Field/PROLIFIC_PID',
    Operator: 'NotEmpty',
    RightOperand: '',
  }

  const legacyAtom = {
    LogicType: 'EmbeddedData',
    LeftOperand: 'e://Field/PROLIFIC_PID',
    Operator: 'IsNotEmpty',
    RightOperand: '',
  }

  if (style === 'tenant-array') {
    return {
      Type: 'BooleanExpression',
      '0': [tenantAtom],
    }
  }

  if (style === 'tenant-boolean-list') {
    return {
      // Some tenants model this as a BooleanExpression container.
      Type: 'BooleanExpression',
      // Keep this as an object-of-objects (no arrays) for broader compatibility.
      '0': { '0': legacyAtom },
    }
  }

  if (style === 'boolean-expression') {
    return {
      Type: 'BooleanExpression',
      LeftOperand: { Type: 'EmbeddedData', Field: 'PROLIFIC_PID' },
      Operator: 'IsNotEmpty',
    }
  }

  if (style === 'single-numeric') {
    return { '0': legacyAtom }
  }

  if (style === 'double-numeric') {
    return { '0': { '0': legacyAtom } }
  }

  if (style === 'typed-double-numeric') {
    const branchLogicType = envString('QUALTRICS_PROLIFIC_BRANCHLOGIC_TYPE') || 'If'
    return { Type: branchLogicType, '0': { '0': legacyAtom } }
  }

  // Fallback: return the atom, though most tenants reject this.
  return legacyAtom
}

function createFlowIdAllocator(rootFlow: unknown): () => string {
  let maxNumeric = 0
  iterFlowElements(rootFlow, (el) => {
    const id = typeof el.FlowID === 'string' ? el.FlowID : ''
    const m = /^FL_(\d+)$/.exec(id)
    if (!m) return
    const n = Number(m[1])
    if (Number.isFinite(n) && n > maxNumeric) maxNumeric = n
  })
  return () => {
    maxNumeric += 1
    return `FL_${maxNumeric}`
  }
}

function summarizeHttpError(result: HttpResult): string {
  const maxLen = 2000
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
        const snippet = text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
        return `${msg} ${snippet}`
      }
      return msg
    }
  }

  const text = (result.bodyText || '').trim()
  if (!text) return ''
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
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
  auth: QualtricsAuth,
  body?: unknown
): Promise<HttpResult> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (auth.kind === 'api-token') {
    headers['X-API-TOKEN'] = auth.apiToken
  } else {
    headers.Authorization = `Bearer ${auth.accessToken}`
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

async function getFirstOk(urls: string[], auth: QualtricsAuth): Promise<HttpResult> {
  const attempts: Array<{ url: string; status: number; error?: string }> = []
  let last: HttpResult | null = null
  for (const url of urls) {
    const result = await httpJson('GET', url, auth)
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

async function putFirstOk(urls: string[], auth: QualtricsAuth, body: unknown): Promise<HttpResult> {
  const attempts: Array<{ url: string; status: number; error?: string }> = []
  let last: HttpResult | null = null
  for (const url of urls) {
    const result = await httpJson('PUT', url, auth, body)
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

async function postFirstOk(
  urls: string[],
  auth: QualtricsAuth,
  body: unknown
): Promise<HttpResult> {
  const attempts: Array<{ url: string; status: number; error?: string }> = []
  let last: HttpResult | null = null
  for (const url of urls) {
    const result = await httpJson('POST', url, auth, body)
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

function getProlificCompletionUrlFromFlow(flowObj: unknown): string | null {
  const unwrapped = unwrapResult(flowObj)
  if (!unwrapped || typeof unwrapped !== 'object') return null

  const root = unwrapped as Record<string, unknown>
  const flow = root.Flow
  if (!Array.isArray(flow)) return null

  let found: string | null = null
  iterFlowElements(flow, (el) => {
    if (found) return
    if (el.Type !== 'EmbeddedData') return
    const embedded = el.EmbeddedData
    if (!Array.isArray(embedded)) return
    for (const item of embedded) {
      if (!item || typeof item !== 'object') continue
      const rec = item as Record<string, unknown>
      if (rec.Field !== 'COMPLETE_URL') continue
      const value = typeof rec.Value === 'string' ? rec.Value.trim() : ''
      if (value.includes('app.prolific.com/submissions/complete?cc=')) {
        found = value
        return
      }
    }
  })

  return found
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

function findFirstEmbeddedDataElement(flow: unknown): FlowElement | null {
  let found: FlowElement | null = null
  iterFlowElements(flow, (el) => {
    if (found) return
    if (el.Type === 'EmbeddedData') found = el
  })
  return found
}

function findEmbeddedDataItem(
  embeddedDataElement: FlowElement,
  field: string
): Record<string, unknown> | null {
  const embedded = embeddedDataElement.EmbeddedData
  if (!Array.isArray(embedded)) return null
  for (const item of embedded) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const f = typeof rec.Field === 'string' ? rec.Field : ''
    if (f === field) return rec
  }
  return null
}

function looksLikeEmbeddedDataValue(
  embeddedDataElement: FlowElement,
  field: string,
  predicate: (value: string) => boolean
): boolean {
  const item = findEmbeddedDataItem(embeddedDataElement, field)
  if (!item) return false
  const value = typeof item.Value === 'string' ? item.Value : ''
  return predicate(value)
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

  const allocFlowId = createFlowIdAllocator(flow)

  const existingEmbeddedDataEl = findFirstEmbeddedDataElement(flow)
  if (!existingEmbeddedDataEl) {
    throw new Error('Could not find an EmbeddedData element in Survey Flow')
  }

  const completeUrlTemplate = findEmbeddedDataItem(existingEmbeddedDataEl, 'COMPLETE_URL')
  if (!completeUrlTemplate) {
    throw new Error('Could not find COMPLETE_URL in existing Survey Flow EmbeddedData element')
  }

  const optionsTemplate =
    existingEmbeddedDataEl.Options && typeof existingEmbeddedDataEl.Options === 'object'
      ? existingEmbeddedDataEl.Options
      : { VarTypes: 'Yes' }

  // Idempotency check: ensure the *top-level* Flow contains exactly one COMPLETE_URL assignment,
  // and that it is the website completion URL.
  const alreadyHasOnlyWebsiteDefaultsInTopLevelFlow = (() => {
    const values: string[] = []
    for (const item of flow) {
      if (!item || typeof item !== 'object') continue
      const el = item as FlowElement
      if (el.Type !== 'EmbeddedData') continue
      const embedded = el.EmbeddedData
      if (!Array.isArray(embedded)) continue
      for (const row of embedded) {
        if (!row || typeof row !== 'object') continue
        const rec = row as Record<string, unknown>
        if (rec.Field !== 'COMPLETE_URL') continue
        const v = typeof rec.Value === 'string' ? rec.Value.trim() : ''
        if (v) values.push(v)
      }
    }
    return values.length >= 1 && values.every((v) => v === websiteCompletionUrl)
  })()

  const alreadyHasProlificBranchSetter = (() => {
    let found = false
    iterFlowElements(flow, (el) => {
      if (found) return
      if (el.Type !== 'Branch') return
      const branchFlow = (el as Record<string, unknown>).Flow
      if (!Array.isArray(branchFlow)) return
      for (const child of branchFlow) {
        if (!child || typeof child !== 'object') continue
        const childEl = child as FlowElement
        if (childEl.Type !== 'EmbeddedData') continue
        if (
          looksLikeEmbeddedDataValue(childEl, 'COMPLETE_URL', (v) =>
            v.includes('app.prolific.com/submissions/complete?cc=')
          )
        ) {
          found = true
          return
        }
      }
    })
    return found
  })()

  const newElements: Array<unknown> = []
  const debugAddedElements: Array<Record<string, unknown>> = []
  let updated = false

  if (!alreadyHasOnlyWebsiteDefaultsInTopLevelFlow) {
    let firstEmbeddedData = true
    for (const item of flow) {
      if (!item || typeof item !== 'object') continue
      const el = item as FlowElement
      if (el.Type !== 'EmbeddedData') continue

      const embedded = el.EmbeddedData
      if (!Array.isArray(embedded)) continue

      const filtered = embedded.filter((row) => {
        if (!row || typeof row !== 'object') return true
        const rec = row as Record<string, unknown>
        return rec.Field !== 'COMPLETE_URL'
      })

      if (filtered.length !== embedded.length) {
        el.EmbeddedData = filtered
        updated = true
      }

      if (firstEmbeddedData) {
        firstEmbeddedData = false
        const websiteRow = {
          ...completeUrlTemplate,
          Field: 'COMPLETE_URL',
          Value: websiteCompletionUrl,
        }
        el.EmbeddedData = [websiteRow, ...(el.EmbeddedData as Array<unknown>)]
        updated = true
        debugAddedElements.push({
          Type: el.Type,
          FlowID: el.FlowID,
          Description: 'TABS: normalized top-level COMPLETE_URL default',
          EmbeddedData: el.EmbeddedData,
        })
      }
    }
  }

  if (!alreadyHasProlificBranchSetter) {
    const prolificSetter: FlowElement = {
      Type: 'EmbeddedData',
      FlowID: allocFlowId(),
      Options: optionsTemplate,
      EmbeddedData: [
        {
          ...completeUrlTemplate,
          Field: 'COMPLETE_URL',
          Value: prolificCompletionUrl,
        },
      ],
    }

    // Qualtrics tenants differ in how they represent BranchLogic. Default to a flat
    // object (LogicType/LeftOperand/Operator/RightOperand) and allow override via
    // QUALTRICS_PROLIFIC_BRANCHLOGIC_STYLE.
    const branchLogicStyle = parseBranchLogicStyle()
    const branch: FlowElement = {
      Type: 'Branch',
      FlowID: allocFlowId(),
      Description: 'TABS: lock down COMPLETE_URL for Prolific',
      BranchLogic: buildProlificPresentBranchLogic(branchLogicStyle),
      Flow: [prolificSetter],
    }

    newElements.push(branch)
    debugAddedElements.push({
      Type: branch.Type,
      FlowID: branch.FlowID,
      Description: branch.Description,
      BranchLogic: branch.BranchLogic,
      Flow: branch.Flow,
    })
    updated = true
  }

  if (updated) {
    root.Flow = [...newElements, ...flow]
  }

  const debug = parseBoolEnv('QUALTRICS_PROLIFIC_DEBUG_FLOW_PUT')
  if (debug && debugAddedElements.length > 0) {
    // Keep output minimal; this is only the new elements we are prepending.
    console.log('Debug (Flow PUT) - new elements:')
    console.log(JSON.stringify(debugAddedElements, null, 2))
  }

  return { updated, flowObj: unwrapped }
}

async function main() {
  const confirm = process.env.QUALTRICS_PROLIFIC_CONFIRM || ''
  if (confirm !== 'APPLY') {
    throw new Error('Confirmation missing. Set QUALTRICS_PROLIFIC_CONFIRM=APPLY to proceed.')
  }

  const publishConfirm = (process.env.QUALTRICS_PROLIFIC_PUBLISH || '').trim()

  const auth = resolveQualtricsAuth()

  const fallback = getDefaultSurveyInfoFromRepo() || {
    baseUrl: 'https://smeal.qualtrics.com',
    surveyId: 'SV_bkMopd73A8fzfwO',
  }

  const baseUrl = (envString('QUALTRICS_BASE_URL') || fallback.baseUrl).replace(/\/$/, '')
  const surveyId = envString('QUALTRICS_SURVEY_ID') || fallback.surveyId

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

  const optionsGet = await getFirstOk(optionsGetUrls, auth)
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
    const surveyGet = await getFirstOk(surveyGetUrls, auth)
    console.log(`Survey GET: ${surveyGet.status} ${surveyGet.url}`)
    prolificCompletionUrl = getProlificCompletionUrlFromSurvey(surveyGet.json)
  }

  // If the default COMPLETE_URL is no longer the Prolific URL (by design), fall back to
  // scanning the Survey Flow for the Branch setter value.
  if (!prolificCompletionUrl) {
    const flowGet = await getFirstOk(flowGetUrls, auth)
    console.log(`Flow GET (Prolific URL fallback): ${flowGet.status} ${flowGet.url}`)
    prolificCompletionUrl = getProlificCompletionUrlFromFlow(flowGet.json)
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
    const flowGet = await getFirstOk(flowGetUrls, auth)
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
      const flowPut = await putFirstOk(flowPutUrls, auth, unwrapResult(flowUpdate.flowObj))
      console.log(`Flow PUT: ${flowPut.status} ${flowPut.url}`)
    }
  }

  // 1) Ensure Embedded Data fields exist (supported endpoint)
  {
    const postUrls = [`${baseUrl}/API/v3/surveys/${surveyId}/embeddeddatafields`]
    const body = embedFieldsBody()
    const completeField = body.embeddedDataFields.find((f) => f.key === 'COMPLETE_URL')
    if (completeField) completeField.value = websiteCompletionUrl
    const res = await postFirstOk(postUrls, auth, body)
    console.log(`EmbeddedDataFields POST: ${res.status} ${res.url}`)
  }

  // 2) Update survey options: completion redirect + optional header script (supported endpoint)
  {
    const redirectUpdate = ensureCompletionRedirectInOptions(optionsJson, redirectUrlTemplate)
    const headerUpdate = ensureHeaderScriptInOptions(redirectUpdate.optionsObj, authenticityScript)

    if (redirectUpdate.updated || headerUpdate.updated) {
      const optionsPut = await putFirstOk(
        optionsPutUrls,
        auth,
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
      const result = await httpJson('POST', url, auth, publishBody)
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
