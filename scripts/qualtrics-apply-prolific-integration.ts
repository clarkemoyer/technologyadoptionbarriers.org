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
  { kind: 'api-token'; apiToken: string } | { kind: 'oauth-bearer'; accessToken: string }

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
    LeftOperand: 'PROLIFIC_PID',
    Operator: 'NotEmpty',
    _HiddenExpression: false,
  }

  const legacyAtom = {
    LogicType: 'EmbeddedData',
    LeftOperand: 'PROLIFIC_PID',
    Operator: 'NotEmpty',
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

/**
 * Build BranchLogic for: "If SOURCE Is Not Empty".
 * Website buttons explicitly set SOURCE (e.g. TABS_Website), so this branch
 * catches all explicit-source traffic and redirects to the website completion page.
 * Prolific traffic does NOT set SOURCE, so it falls through to the PROLIFIC_PID branch.
 */
function buildSourceIsNotEmptyBranchLogic(style: BranchLogicStyle): Record<string, unknown> {
  const tenantAtom = {
    Type: 'Expression',
    LogicType: 'EmbeddedField',
    LeftOperand: 'SOURCE',
    Operator: 'NotEmpty',
    _HiddenExpression: false,
  }

  const legacyAtom = {
    LogicType: 'EmbeddedData',
    LeftOperand: 'SOURCE',
    Operator: 'NotEmpty',
  }

  if (style === 'tenant-array') {
    return { Type: 'BooleanExpression', '0': [tenantAtom] }
  }

  if (style === 'tenant-boolean-list') {
    return { Type: 'BooleanExpression', '0': { '0': legacyAtom, Type: 'If' } }
  }

  if (style === 'boolean-expression') {
    return {
      Type: 'BooleanExpression',
      LeftOperand: { Type: 'EmbeddedData', Field: 'SOURCE' },
      Operator: 'NotEmpty',
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
      // Default to website; Prolific traffic is detected in Survey Flow and overrides to `prolific`.
      { key: 'SOURCE', value: 'TABS_Website', type: 'textSet' },
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

function appendRawQueryParam(url: string, rawParam: string): string {
  const trimmed = rawParam.trim()
  if (!trimmed) return url
  return url.includes('?') ? `${url}&${trimmed}` : `${url}?${trimmed}`
}

function ensureResponseIdInCompletionUrl(url: string): string {
  // Don't double-add.
  if (url.includes('rid=${e://Field/ResponseID}')) return url
  if (/[?&]rid=/.test(url)) return url
  // IMPORTANT: do not URL-encode Qualtrics piped text.
  return appendRawQueryParam(url, 'rid=${e://Field/ResponseID}')
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
  const target = normalizeEmbeddedFieldName(field)
  const embedded = embeddedDataElement.EmbeddedData
  if (!Array.isArray(embedded)) return null
  for (const item of embedded) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const fRaw = typeof rec.Field === 'string' ? rec.Field : ''
    const f = fRaw ? normalizeEmbeddedFieldName(fRaw) : ''
    if (f && f === target) return rec
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

function normalizeEmbeddedFieldName(raw: string): string {
  // Qualtrics Flow JSON sometimes ends up with invisible whitespace characters (e.g. zero-width)
  // which makes naive string comparisons fail while the UI looks identical.
  return raw
    .replace(/[\s\u200B\u200C\u200D\uFEFF]/g, '')
    .trim()
    .toUpperCase()
}

function dedupeEmbeddedDataRows(embeddedDataElement: FlowElement): boolean {
  const embedded = embeddedDataElement.EmbeddedData
  if (!Array.isArray(embedded)) return false

  const seen = new Set<string>()
  const deduped: Array<unknown> = []
  let changed = false

  for (const row of embedded) {
    if (!row || typeof row !== 'object') {
      deduped.push(row)
      continue
    }

    const rec = row as Record<string, unknown>
    const fieldRaw = typeof rec.Field === 'string' ? rec.Field : ''
    const field = fieldRaw ? normalizeEmbeddedFieldName(fieldRaw) : ''
    if (!field) {
      deduped.push(row)
      continue
    }

    if (seen.has(field)) {
      changed = true
      continue
    }

    seen.add(field)
    deduped.push(row)
  }

  if (changed) {
    embeddedDataElement.EmbeddedData = deduped
  }

  return changed
}

function removeFieldsFromEmbeddedDataRows(
  embeddedDataElement: FlowElement,
  fieldsToRemove: ReadonlySet<string>
): { changed: boolean; isEmpty: boolean } {
  const embedded = embeddedDataElement.EmbeddedData
  if (!Array.isArray(embedded)) return { changed: false, isEmpty: false }

  const filtered: Array<unknown> = []
  let changed = false

  for (const row of embedded) {
    if (!row || typeof row !== 'object') {
      filtered.push(row)
      continue
    }

    const rec = row as Record<string, unknown>
    const fieldRaw = typeof rec.Field === 'string' ? rec.Field : ''
    const field = fieldRaw ? normalizeEmbeddedFieldName(fieldRaw) : ''

    if (field && fieldsToRemove.has(field)) {
      changed = true
      continue
    }

    filtered.push(row)
  }

  if (changed) {
    embeddedDataElement.EmbeddedData = filtered
  }

  return { changed, isEmpty: filtered.length === 0 }
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

  const websiteSourceValue = 'TABS_Website'
  const prolificSourceValue = 'prolific'

  const makeEmbeddedRow = (field: string, value: string): Record<string, unknown> => {
    // Some Qualtrics tenants require each EmbeddedData row to include Type + Description.
    // Keep this minimal but valid.
    return {
      Description: field,
      Type: 'EmbeddedData',
      Field: field,
      Value: value,
    }
  }

  let firstTopLevelEmbeddedDataEl: FlowElement | null = (() => {
    for (const item of flow) {
      if (!item || typeof item !== 'object') continue
      const el = item as FlowElement
      if (el.Type === 'EmbeddedData') return el
    }
    return null
  })()

  const allocFlowId = createFlowIdAllocator(flow)

  let existingEmbeddedDataEl = findFirstEmbeddedDataElement(flow)

  // If the survey flow is empty (common after manual cleanup), recreate the minimal elements.
  // We need at least one EmbeddedData element so Qualtrics reliably populates querystring
  // parameters into embedded data (tenant-dependent behavior).
  if (!firstTopLevelEmbeddedDataEl) {
    const embeddedDataEl: FlowElement = {
      Type: 'EmbeddedData',
      FlowID: allocFlowId(),
      Options: { VarTypes: 'Yes' },
      EmbeddedData: [
        // These are intentionally blank so they can be set from Panel or URL.
        makeEmbeddedRow('PROLIFIC_PID', ''),
        makeEmbeddedRow('STUDY_ID', ''),
        makeEmbeddedRow('SESSION_ID', ''),
        // Default to website; Prolific branch overrides.
        makeEmbeddedRow('SOURCE', websiteSourceValue),
        makeEmbeddedRow('COMPLETE_URL', websiteCompletionUrl),
      ],
    }
    flow.unshift(embeddedDataEl)
    firstTopLevelEmbeddedDataEl = embeddedDataEl
    existingEmbeddedDataEl = embeddedDataEl
  }

  if (!existingEmbeddedDataEl) {
    existingEmbeddedDataEl = firstTopLevelEmbeddedDataEl
  }

  const debugAddedElements: Array<Record<string, unknown>> = []
  let updated = false

  // Remove redundant Prolific-related branches that set SOURCE/COMPLETE_URL.
  // These can accumulate due to repeated apply runs or manual edits, and they confuse debugging.
  const branchSetsFieldNonEmpty = (branchEl: FlowElement, field: string): boolean => {
    const branchFlow = (branchEl as Record<string, unknown>).Flow
    if (!Array.isArray(branchFlow)) return false

    let found = false
    iterFlowElements(branchFlow, (el) => {
      if (found) return
      if (el.Type !== 'EmbeddedData') return
      const item = findEmbeddedDataItem(el, field)
      const value = item && typeof item.Value === 'string' ? item.Value.trim() : ''
      if (value) found = true
    })
    return found
  }

  const tabsBranchDescriptions = new Set([
    'TABS: lock down COMPLETE_URL for Prolific', // both branches use this description
    'TABS: If SOURCE is not empty', // legacy variant
    'TABS: If SOURCE is prolific', // legacy variant
    'TABS: If PROLIFIC_PID is not empty', // legacy variant
  ])

  for (let i = 0; i < flow.length; i++) {
    const item = flow[i]
    if (!item || typeof item !== 'object') continue
    const el = item as FlowElement
    if (el.Type !== 'Branch') continue

    const shouldRemove =
      typeof el.Description === 'string' && tabsBranchDescriptions.has(el.Description.trim())
        ? true
        : branchSetsFieldNonEmpty(el, 'SOURCE') || branchSetsFieldNonEmpty(el, 'COMPLETE_URL')

    if (shouldRemove) {
      flow.splice(i, 1)
      i -= 1
      updated = true
    }
  }

  // Clean up accidental duplicates inside EmbeddedData elements.
  // This prevents the Qualtrics UI from showing long repeated lists of the same fields.
  iterFlowElements(flow, (el) => {
    if (el.Type !== 'EmbeddedData') return
    if (dedupeEmbeddedDataRows(el)) updated = true
  })

  // Consolidate Prolific tracking fields into the first *top-level* EmbeddedData element.
  // Qualtrics shows each top-level EmbeddedData element as a separate "Set Embedded Data" block.
  // Over time, repeated apply/manual edits can accumulate extra blocks that only repeat these fields.
  // Keeping just one avoids UI clutter and prevents accidental later overwrites.
  const prolificTrackingFields = new Set<string>([
    'PROLIFIC_PID',
    'STUDY_ID',
    'SESSION_ID',
    'SOURCE',
    'COMPLETE_URL',
  ])

  let firstTopLevelEmbeddedSeen = false
  for (let i = 0; i < flow.length; i++) {
    const item = flow[i]
    if (!item || typeof item !== 'object') continue
    const el = item as FlowElement
    if (el.Type !== 'EmbeddedData') continue

    if (!firstTopLevelEmbeddedSeen) {
      firstTopLevelEmbeddedSeen = true
      continue
    }

    const { changed, isEmpty } = removeFieldsFromEmbeddedDataRows(el, prolificTrackingFields)
    if (changed) updated = true

    // If this element became empty (meaning it only contained duplicated Prolific fields), remove it.
    if (isEmpty) {
      flow.splice(i, 1)
      i -= 1
      updated = true
    }
  }

  const completeUrlTemplate =
    findEmbeddedDataItem(firstTopLevelEmbeddedDataEl, 'COMPLETE_URL') ||
    makeEmbeddedRow('COMPLETE_URL', '')

  const sourceTemplate =
    findEmbeddedDataItem(firstTopLevelEmbeddedDataEl, 'SOURCE') ||
    findEmbeddedDataItem(existingEmbeddedDataEl, 'SOURCE') ||
    ({ ...makeEmbeddedRow('SOURCE', ''), ...(completeUrlTemplate || {}) } as Record<
      string,
      unknown
    >)

  const optionsTemplate =
    existingEmbeddedDataEl.Options && typeof existingEmbeddedDataEl.Options === 'object'
      ? existingEmbeddedDataEl.Options
      : { VarTypes: 'Yes' }

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

  const findFirstProlificSetterEmbeddedDataEl = (): FlowElement | null => {
    let found: FlowElement | null = null
    iterFlowElements(flow, (el) => {
      if (found) return
      if (el.Type !== 'EmbeddedData') return
      if (
        looksLikeEmbeddedDataValue(el, 'COMPLETE_URL', (v) =>
          v.includes('app.prolific.com/submissions/complete?cc=')
        )
      ) {
        found = el
      }
    })
    return found
  }

  const prolificSetterEl = findFirstProlificSetterEmbeddedDataEl()

  // Enforce two-source model:
  // - Website traffic defaults: SOURCE=TABS_Website, COMPLETE_URL=<website>
  // - Prolific traffic (PROLIFIC_PID present): SOURCE=prolific, COMPLETE_URL=<prolific>
  // Remove SOURCE/COMPLETE_URL assignments everywhere except:
  // - the first top-level EmbeddedData (website defaults)
  // - the Prolific branch setter EmbeddedData (prolific overrides)
  const controlledFields = new Set<string>(['SOURCE', 'COMPLETE_URL'])
  iterFlowElements(flow, (el) => {
    if (el.Type !== 'EmbeddedData') return
    if (el === prolificSetterEl) return
    const { changed } = removeFieldsFromEmbeddedDataRows(el, controlledFields)
    if (changed) updated = true
  })

  // Ensure website defaults exist on the first top-level EmbeddedData element.
  // Working config order: tracking fields (blank) → SOURCE → COMPLETE_URL.
  {
    // Capture templates from existing rows before removal to preserve tenant-specific
    // metadata (e.g. AnalyzeText, DataVisibility).
    const templateFor = (field: string): Record<string, unknown> => {
      return (
        findEmbeddedDataItem(firstTopLevelEmbeddedDataEl, field) ||
        findEmbeddedDataItem(existingEmbeddedDataEl, field) ||
        makeEmbeddedRow(field, '')
      )
    }
    const pidTmpl = templateFor('PROLIFIC_PID')
    const studyTmpl = templateFor('STUDY_ID')
    const sessionTmpl = templateFor('SESSION_ID')
    const srcTmpl = templateFor('SOURCE')
    const curlTmpl = templateFor('COMPLETE_URL')

    // Remove all managed fields so we can rebuild in the correct order.
    const managedFields = new Set([
      'PROLIFIC_PID',
      'STUDY_ID',
      'SESSION_ID',
      'SOURCE',
      'COMPLETE_URL',
    ])

    // Rebuild: tracking fields (blank) → SOURCE=TABS_Website → COMPLETE_URL → remaining.
    const desiredRows = [
      { ...pidTmpl, Field: 'PROLIFIC_PID', Value: '' },
      { ...studyTmpl, Field: 'STUDY_ID', Value: '' },
      { ...sessionTmpl, Field: 'SESSION_ID', Value: '' },
      { ...srcTmpl, Field: 'SOURCE', Value: websiteSourceValue },
      { ...curlTmpl, Field: 'COMPLETE_URL', Value: websiteCompletionUrl },
    ]
    const existingRows = Array.isArray(firstTopLevelEmbeddedDataEl.EmbeddedData)
      ? firstTopLevelEmbeddedDataEl.EmbeddedData
      : []

    // Capture managed rows BEFORE removal so the comparison reflects the actual state.
    const managedExisting = existingRows.filter((r: Record<string, unknown>) => {
      const f = typeof r.Field === 'string' ? normalizeEmbeddedFieldName(r.Field) : ''
      return managedFields.has(f)
    })
    const rowsMatch =
      managedExisting.length === desiredRows.length &&
      desiredRows.every((desired, idx) => {
        const existing = managedExisting[idx] as Record<string, unknown> | undefined
        return (
          existing &&
          normalizeEmbeddedFieldName(String(existing.Field ?? '')) ===
            normalizeEmbeddedFieldName(desired.Field) &&
          String(existing.Value ?? '') === desired.Value
        )
      })

    const { changed } = removeFieldsFromEmbeddedDataRows(firstTopLevelEmbeddedDataEl, managedFields)
    if (changed) updated = true

    firstTopLevelEmbeddedDataEl.EmbeddedData = [
      ...desiredRows,
      ...existingRows.filter((r: Record<string, unknown>) => {
        const f = typeof r.Field === 'string' ? normalizeEmbeddedFieldName(r.Field) : ''
        return !managedFields.has(f)
      }),
    ]
    if (dedupeEmbeddedDataRows(firstTopLevelEmbeddedDataEl)) updated = true
    if (!rowsMatch) updated = true

    debugAddedElements.push({
      Type: firstTopLevelEmbeddedDataEl.Type,
      FlowID: firstTopLevelEmbeddedDataEl.FlowID,
      Description: 'TABS: enforced website SOURCE/COMPLETE_URL defaults',
    })
  }

  type FlowRef = { parent: Array<unknown>; index: number; el: FlowElement }

  const findFirstWithParent = (
    elements: unknown,
    predicate: (el: FlowElement) => boolean
  ): FlowRef | null => {
    if (!Array.isArray(elements)) return null
    for (let i = 0; i < elements.length; i++) {
      const item = elements[i]
      if (!item || typeof item !== 'object') continue
      const el = item as FlowElement
      if (predicate(el)) return { parent: elements, index: i, el }
      if ('Flow' in el) {
        const nested = findFirstWithParent(el.Flow, predicate)
        if (nested) return nested
      }
    }
    return null
  }

  const branchSetsCompleteUrlToProlific = (branchEl: FlowElement): boolean => {
    const branchFlow = (branchEl as Record<string, unknown>).Flow
    if (!Array.isArray(branchFlow)) return false
    for (const child of branchFlow) {
      if (!child || typeof child !== 'object') continue
      const childEl = child as FlowElement
      if (childEl.Type !== 'EmbeddedData') continue
      if (
        looksLikeEmbeddedDataValue(childEl, 'COMPLETE_URL', (v) =>
          v.includes('app.prolific.com/submissions/complete?cc=')
        )
      ) {
        return true
      }
    }
    return false
  }

  // If a Prolific lockdown Branch already exists but is placed *before* the first EmbeddedData
  // element, it may evaluate before PROLIFIC_PID is populated from the querystring.
  // Fix by moving the existing Branch to immediately after the first top-level EmbeddedData.
  if (alreadyHasProlificBranchSetter) {
    const embeddedRef = findFirstWithParent(flow, (el) => el.Type === 'EmbeddedData')
    const branchRef = findFirstWithParent(flow, (el) => {
      if (el.Type !== 'Branch') return false
      if (el.Description === 'TABS: lock down COMPLETE_URL for Prolific') return true
      return branchSetsCompleteUrlToProlific(el)
    })

    if (embeddedRef && branchRef) {
      const sameParent = embeddedRef.parent === branchRef.parent
      const branchBeforeEmbedded = sameParent && branchRef.index < embeddedRef.index

      // Move branch into the embedded-data container if needed, immediately after EmbeddedData.
      if (!sameParent || branchBeforeEmbedded) {
        const [branchEl] = (branchRef.parent as Array<unknown>).splice(branchRef.index, 1)
        // Re-find embedded ref since indices may have shifted.
        const embeddedRefAfter = findFirstWithParent(flow, (el) => el.Type === 'EmbeddedData')
        if (embeddedRefAfter) {
          ;(embeddedRefAfter.parent as Array<unknown>).splice(
            embeddedRefAfter.index + 1,
            0,
            branchEl
          )
          updated = true
          debugAddedElements.push({
            Type: 'Branch',
            FlowID: (branchEl as FlowElement).FlowID,
            Description: 'TABS: moved Prolific COMPLETE_URL lockdown branch after EmbeddedData',
          })
        } else {
          // If we somehow can't find EmbeddedData anymore, put the branch back at the start.
          flow.unshift(branchEl)
          updated = true
        }
      }
    }
  }

  // If a Prolific setter already exists, ensure it also sets SOURCE=prolific.
  if (prolificSetterEl) {
    // Capture existing rows before removal to detect actual changes.
    const prolificExistingRows = Array.isArray(prolificSetterEl.EmbeddedData)
      ? prolificSetterEl.EmbeddedData
      : []
    const prolificDesired = [
      { Field: 'SOURCE', Value: prolificSourceValue },
      { Field: 'COMPLETE_URL', Value: prolificCompletionUrl },
    ]
    const prolificManagedExisting = prolificExistingRows.filter((r: Record<string, unknown>) => {
      const f = typeof r.Field === 'string' ? normalizeEmbeddedFieldName(r.Field) : ''
      return controlledFields.has(f)
    })
    const prolificRowsMatch =
      prolificManagedExisting.length === prolificDesired.length &&
      prolificDesired.every((desired, idx) => {
        const existing = prolificManagedExisting[idx] as Record<string, unknown> | undefined
        return (
          existing &&
          normalizeEmbeddedFieldName(String(existing.Field ?? '')) ===
            normalizeEmbeddedFieldName(desired.Field) &&
          String(existing.Value ?? '') === desired.Value
        )
      })

    const { changed } = removeFieldsFromEmbeddedDataRows(prolificSetterEl, controlledFields)
    if (changed) updated = true

    prolificSetterEl.EmbeddedData = [
      {
        ...sourceTemplate,
        Field: 'SOURCE',
        Value: prolificSourceValue,
      },
      {
        ...completeUrlTemplate,
        Field: 'COMPLETE_URL',
        Value: prolificCompletionUrl,
      },
    ]
    if (dedupeEmbeddedDataRows(prolificSetterEl)) updated = true
    if (!prolificRowsMatch) updated = true
  }

  if (!alreadyHasProlificBranchSetter) {
    const branchLogicStyle = parseBranchLogicStyle()

    // --- Branch 1: If SOURCE is not empty ---
    // Website buttons explicitly set SOURCE (e.g. TABS_Website). This branch
    // catches that traffic and locks COMPLETE_URL to the website completion page,
    // then ends the survey with a redirect there. Prolific traffic does NOT
    // set SOURCE, so it falls through to Branch 2.
    const sourceBranchSetter: FlowElement = {
      Type: 'EmbeddedData',
      FlowID: allocFlowId(),
      Options: optionsTemplate,
      EmbeddedData: [
        {
          ...completeUrlTemplate,
          Type: 'Custom',
          Field: 'COMPLETE_URL',
          Value: websiteCompletionUrl,
        },
      ],
    }
    const sourceBranchEndSurvey: FlowElement = {
      Type: 'EndSurvey',
      FlowID: allocFlowId(),
      EndingType: 'Advanced',
      Options: {
        Advanced: 'true',
        SurveyTermination: 'Redirect',
        EOSRedirectURL: websiteCompletionUrl,
      },
    }
    const sourceBranch: FlowElement = {
      Type: 'Branch',
      FlowID: allocFlowId(),
      Description: 'TABS: lock down COMPLETE_URL for Prolific',
      BranchLogic: buildSourceIsNotEmptyBranchLogic(branchLogicStyle),
      Flow: [sourceBranchSetter, sourceBranchEndSurvey],
    }

    // --- Branch 2: If PROLIFIC_PID is not empty ---
    // Handles Prolific traffic that arrives with PROLIFIC_PID in the query string.
    // Sets both SOURCE=prolific and COMPLETE_URL to the Prolific completion URL.
    const pidBranchSetter: FlowElement = {
      Type: 'EmbeddedData',
      FlowID: allocFlowId(),
      Options: optionsTemplate,
      EmbeddedData: [
        {
          ...sourceTemplate,
          Type: 'Custom',
          Field: 'SOURCE',
          Value: prolificSourceValue,
        },
        {
          ...completeUrlTemplate,
          Type: 'Custom',
          Field: 'COMPLETE_URL',
          Value: prolificCompletionUrl,
        },
      ],
    }
    const pidBranchEndSurvey: FlowElement = {
      Type: 'EndSurvey',
      FlowID: allocFlowId(),
      EndingType: 'Advanced',
      Options: {
        Advanced: 'true',
        SurveyTermination: 'Redirect',
        EOSRedirectURL: prolificCompletionUrl,
      },
    }
    const pidBranch: FlowElement = {
      Type: 'Branch',
      FlowID: allocFlowId(),
      Description: 'TABS: lock down COMPLETE_URL for Prolific',
      BranchLogic: buildProlificPresentBranchLogic(branchLogicStyle),
      Flow: [pidBranchSetter, pidBranchEndSurvey],
    }

    // IMPORTANT: Insert both branches *after* the first top-level EmbeddedData element.
    // Many Qualtrics tenants only populate querystring → embedded data during the
    // EmbeddedData Flow element. If we put branches first, SOURCE/PROLIFIC_PID may not
    // be available yet, and conditions will always evaluate false.
    const embeddedRef = findFirstWithParent(flow, (el) => el.Type === 'EmbeddedData')
    if (embeddedRef) {
      ;(embeddedRef.parent as Array<unknown>).splice(
        embeddedRef.index + 1,
        0,
        sourceBranch,
        pidBranch
      )
    } else {
      // Fallback: if no EmbeddedData exists (unexpected), prepend to root.
      flow.unshift(sourceBranch, pidBranch)
    }

    debugAddedElements.push(
      {
        Type: sourceBranch.Type,
        FlowID: sourceBranch.FlowID,
        Description: sourceBranch.Description,
        BranchLogic: sourceBranch.BranchLogic,
        Flow: sourceBranch.Flow,
      },
      {
        Type: pidBranch.Type,
        FlowID: pidBranch.FlowID,
        Description: pidBranch.Description,
        BranchLogic: pidBranch.BranchLogic,
        Flow: pidBranch.Flow,
      }
    )
    updated = true
  }

  if (updated) {
    root.Flow = flow
  }

  const debug = parseBoolEnv('QUALTRICS_PROLIFIC_DEBUG_FLOW_PUT')
  if (debug && debugAddedElements.length > 0) {
    // Keep output minimal; this only includes elements we added or moved.
    console.log('Debug (Flow PUT) - added/moved elements:')
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
    baseUrl: 'https://smeal.yul1.qualtrics.com',
    surveyId: 'SV_bkMopd73A8fzfwO',
  }

  const baseUrl = (envString('QUALTRICS_BASE_URL') || fallback.baseUrl).replace(/\/$/, '')
  const surveyId = envString('QUALTRICS_SURVEY_ID') || fallback.surveyId

  const authenticityScript = process.env.PROLIFIC_QUALTRICS_AUTHENTICITY_SCRIPT || ''

  const lockDownRedirect = parseBoolEnv('QUALTRICS_PROLIFIC_LOCK_DOWN_REDIRECT')
  const websiteCompletionUrlBase =
    (process.env.TABS_WEBSITE_COMPLETE_URL || '').trim() ||
    'https://technologyadoptionbarriers.org/survey-complete'
  const websiteCompletionUrl = ensureResponseIdInCompletionUrl(websiteCompletionUrlBase)

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

  prolificCompletionUrl = ensureResponseIdInCompletionUrl(prolificCompletionUrl)

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
      : `Redirect mode: SurveyTermination=Redirect and EOSRedirectURL=${redirectUrlTemplate} (default COMPLETE_URL points to ${websiteCompletionUrl}; Prolific links should provide COMPLETE_URL pointing to the Prolific completion URL).`
  )
}

main().catch((err) => {
  console.error('❌ Apply failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
