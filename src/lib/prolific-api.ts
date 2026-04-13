/**
 * Prolific API Client
 *
 * This module provides functions to interact with the Prolific API
 * for collecting survey results and participant data.
 *
 * API Documentation: https://docs.prolific.com/api-reference/introduction/basic
 * Base URL: https://api.prolific.com/api/v1/
 *
 * @module prolific-api
 */

const PROLIFIC_API_BASE_URL = 'https://api.prolific.com/api/v1'

// ---------------------------------------------------------------------------
// Messaging types
// ---------------------------------------------------------------------------

/**
 * Represents a message sent to or from a participant via Prolific.
 */
export interface Message {
  id: string
  sender_id: string
  body: string
  sent_at: string
  type?: string
  channel_id: string
  data?: {
    study_id?: string
    category?: string
  }
}

/**
 * Study status types
 */
export type StudyStatus = 'UNPUBLISHED' | 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'AWAITING REVIEW'

/**
 * Submission status types
 */
export type SubmissionStatus =
  | 'RESERVED'
  | 'ACTIVE'
  | 'AWAITING REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'TIMED-OUT'

/**
 * Represents a Prolific study
 */
export interface Study {
  id: string
  name: string
  internal_name: string
  description: string
  external_study_url: string
  status: StudyStatus
  total_available_places: number
  places_taken: number
  average_reward_per_hour: number
  average_time_taken: number
  maximum_allowed_time: number
  reward: number
  device_compatibility: string[]
  peripheral_requirements: string[]
  created_at?: string
  published_at?: string
  completed_at?: string
  filters?: Array<{
    filter_id: string
    selected_values?: unknown[]
    selected_range?: { min?: number; max?: number }
  }>
  eligibility_requirements?: unknown[]
}

function normalizeStudy(study: Study & Record<string, unknown>): Study {
  const createdCandidate =
    (typeof study.created_at === 'string' && study.created_at) ||
    (typeof (study as Record<string, unknown>).date_created === 'string' &&
      ((study as Record<string, unknown>).date_created as string)) ||
    (typeof (study as Record<string, unknown>).datetime_created === 'string' &&
      ((study as Record<string, unknown>).datetime_created as string)) ||
    (typeof (study as Record<string, unknown>).created === 'string' &&
      ((study as Record<string, unknown>).created as string)) ||
    (typeof (study as Record<string, unknown>).createdAt === 'string' &&
      ((study as Record<string, unknown>).createdAt as string))

  return {
    ...study,
    created_at: createdCandidate || study.created_at,
    filters: study.filters || [],
  }
}

/**
 * Represents a study submission from a participant
 */
export interface Submission {
  id: string
  participant_id: string
  study_id: string
  status: SubmissionStatus
  started_at: string
  completed_at?: string
  time_taken?: number
  participant_code?: string
  study_code?: string

  /**
   * Prolific AUTH CHECK fields (LLM + Bots).
   *
   * These are returned by the Prolific API as part of the submission object
   * when the study has authenticity checks enabled. Possible values include
   * "High", "Mixed", "Low", or undefined if the check was not run.
   *
   * TODO: Verify exact field names and value enums against the live API.
   *       The Prolific docs may use different casing or naming conventions.
   */
  is_legitimate?: boolean
  authenticity_score_llm?: string
  authenticity_score_bots?: string
}

/**
 * Demographics archived at submission completion.
 * Fields vary per participant - values are strings or DATA_EXPIRED if not answered.
 * @see https://docs.prolific.com/api-reference/submissions/get-submission-demographics
 */
export interface SubmissionDemographics {
  submission_id: string
  participant_id: string
  started_at: string
  completed_at: string
  time_taken: number
  total_approvals: number
  demographics: Record<string, string | number | null>
}

/**
 * Represents a participant
 */
export interface Participant {
  id: string
  status: string
  datetime_created: string
}

/**
 * API response wrapper for paginated results
 */
export interface PaginatedResponse<T> {
  results: T[]
  meta?: {
    count: number
    next?: string | null
    previous?: string | null
  }
}

/**
 * API error response
 */
export interface ProlificApiError {
  detail?: string
  error?: string
  message?: string
}

/**
 * Custom error class for Prolific API errors
 */
export class ProlificApiErrorClass extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: ProlificApiError
  ) {
    super(message)
    this.name = 'ProlificApiError'
  }
}

/**
 * Make an authenticated request to the Prolific API
 *
 * @param endpoint - API endpoint path (without base URL)
 * @param apiToken - Prolific API token
 * @param options - Additional fetch options
 * @returns Promise resolving to the API response
 * @throws {ProlificApiErrorClass} When the API request fails
 */
async function makeApiRequest<T>(
  endpoint: string,
  apiToken: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${PROLIFIC_API_BASE_URL}${endpoint}`

  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Token ${apiToken}`)
  headers.set('Content-Type', 'application/json')

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Parse response body
    const data = await response.json()

    if (!response.ok) {
      const errorData = data as ProlificApiError
      const detail = errorData.detail || errorData.error || errorData.message
      const errorMsg =
        typeof detail === 'string'
          ? detail
          : detail
            ? JSON.stringify(detail)
            : `API request failed with status ${response.status}`
      throw new ProlificApiErrorClass(errorMsg, response.status, errorData)
    }

    return data as T
  } catch (error) {
    if (error instanceof ProlificApiErrorClass) {
      throw error
    }
    // Handle network errors or JSON parsing errors
    throw new ProlificApiErrorClass(
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

/**
 * Fetch all pages of a paginated Prolific API endpoint.
 * Follows `meta.next` links until exhausted.
 */
async function fetchAllPages<T>(endpoint: string, apiToken: string): Promise<PaginatedResponse<T>> {
  const firstPage = await makeApiRequest<PaginatedResponse<T>>(endpoint, apiToken)
  const allResults: T[] = [...firstPage.results]

  let nextUrl = firstPage.meta?.next
  while (nextUrl) {
    // meta.next may be absolute or relative - normalize to API path
    let path: string
    try {
      const url = new URL(nextUrl)
      path = url.pathname.replace(/^\/api\/v1/, '') + url.search
    } catch {
      // Relative URL - use as-is
      path = nextUrl
    }
    const page = await makeApiRequest<PaginatedResponse<T>>(path, apiToken)
    allResults.push(...page.results)
    nextUrl = page.meta?.next
  }

  return {
    results: allResults,
    meta: { count: allResults.length, next: null, previous: null },
  }
}

/**
 * Get information about the current user
 *
 * @param apiToken - Prolific API token
 * @returns Promise resolving to user information
 */
export async function getCurrentUser(apiToken: string): Promise<{
  id: string
  name: string
  email: string
  username: string
}> {
  return makeApiRequest('/users/me/', apiToken)
}

/**
 * List all studies for the current user
 *
 * @param apiToken - Prolific API token
 * @returns Promise resolving to a list of studies
 */
export async function listStudies(apiToken: string): Promise<PaginatedResponse<Study>> {
  const data = await makeApiRequest<PaginatedResponse<Study & Record<string, unknown>>>(
    '/studies/',
    apiToken
  )

  return {
    ...data,
    results: data.results.map(normalizeStudy),
  }
}

/**
 * Get details of a specific study
 *
 * @param studyId - The unique identifier of the study
 * @param apiToken - Prolific API token
 * @returns Promise resolving to study details
 */
export async function getStudy(studyId: string, apiToken: string): Promise<Study> {
  const data = await makeApiRequest<Study & Record<string, unknown>>(
    `/studies/${studyId}/`,
    apiToken
  )
  return normalizeStudy(data)
}

/**
 * List all submissions for a specific study.
 * Automatically follows pagination to return every submission.
 *
 * @param studyId - The unique identifier of the study
 * @param apiToken - Prolific API token
 * @returns Promise resolving to a list of all submissions
 */
export async function listStudySubmissions(
  studyId: string,
  apiToken: string
): Promise<PaginatedResponse<Submission>> {
  return fetchAllPages<Submission>(`/studies/${studyId}/submissions/`, apiToken)
}

/**
 * Get details of a specific submission
 *
 * @param studyId - The unique identifier of the study
 * @param submissionId - The unique identifier of the submission
 * @param apiToken - Prolific API token
 * @returns Promise resolving to submission details
 */
export async function getSubmission(
  studyId: string,
  submissionId: string,
  apiToken: string
): Promise<Submission> {
  return makeApiRequest(`/studies/${studyId}/submissions/${submissionId}/`, apiToken)
}

/**
 * Get demographics archived at submission completion.
 *
 * @param submissionId - The Prolific submission ID
 * @param apiToken - Prolific API token
 * @returns Promise resolving to submission demographics (or null if not found)
 * @see https://docs.prolific.com/api-reference/submissions/get-submission-demographics
 */
export async function getSubmissionDemographics(
  submissionId: string,
  apiToken: string
): Promise<SubmissionDemographics | null> {
  const url = `${PROLIFIC_API_BASE_URL}/submissions/${submissionId}/demographics/`
  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${apiToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 404) return null
  if (!response.ok) {
    throw new ProlificApiErrorClass(
      `Demographics request failed with status ${response.status}`,
      response.status
    )
  }

  const text = await response.text()
  if (!text || text.trim() === '') return null

  try {
    return JSON.parse(text) as SubmissionDemographics
  } catch {
    return null
  }
}

/**
 * Fetch demographics for all submissions in a study.
 * Makes one API call per submission - use sparingly.
 */
export async function getStudyDemographics(
  studyId: string,
  apiToken: string
): Promise<Map<string, SubmissionDemographics>> {
  const subs = await listStudySubmissions(studyId, apiToken)
  const results = new Map<string, SubmissionDemographics>()

  const demoPromises = subs.results.map(async (sub) => {
    const demo = await getSubmissionDemographics(sub.id, apiToken)
    if (demo) {
      return { participant_id: sub.participant_id, demo }
    }
    return null
  })

  const demos = await Promise.all(demoPromises)

  for (const item of demos) {
    if (item) {
      results.set(item.participant_id, item.demo)
    }
  }

  return results
}

/**
 * Prolific prescreener filter_ids that correspond to Qualtrics survey demographics (Q1–Q9).
 * Used for cross-validation of self-reported survey data against Prolific profile data.
 *
 * Pass these to `exportStudyDemographics(studyId, apiToken, filterIds)` to include
 * prescreener responses alongside base demographics in the export.
 *
 * Privacy: Prescreener data contains PII and must be handled ephemerally - never
 * committed to the repository or displayed on public pages.
 *
 * @see https://docs.prolific.com/api-reference/filters/get-filters
 * @see https://docs.prolific.com/api-reference/studies/export-demographic-data
 */
export const QUALTRICS_PROLIFIC_FILTER_MAP: Record<
  string,
  { filter_id: string; description: string }
> = {
  Q1_Role: { filter_id: 'occupation', description: 'Occupation/job title category' },
  Q3_Industry: { filter_id: 'industry', description: 'Industry classification' },
  Q4_OrgSize: { filter_id: 'company_size', description: 'Company/organization size' },
  Q5_ProfitModel: {
    filter_id: 'employment_sector',
    description: 'Employment sector (Private, Public, Non-profit)',
  },
}

/** Additional Prolific prescreener filter_ids that augment (not overlap) survey data. */
export const PROLIFIC_AUGMENTATION_FILTERS: Record<string, string> = {
  education_level: 'Highest level of education completed',
  household_income: 'Household income bracket',
  fluent_languages: 'Languages spoken fluently',
}

/** All enrichment filter_ids (cross-validation + augmentation). */
export const PROLIFIC_ENRICHMENT_FILTER_IDS: string[] = [
  ...Object.values(QUALTRICS_PROLIFIC_FILTER_MAP).map((v) => v.filter_id),
  ...Object.keys(PROLIFIC_AUGMENTATION_FILTERS),
]

/**
 * Exact Prolific prescreening criteria configured on the live study.
 * Participants must match ALL of these criteria to be eligible.
 *
 * "Current Country of Residence" and "Employment Status" are also base
 * fields in every Prolific demographic export (always included).
 */
export const PROLIFIC_STUDY_SCREENERS = [
  {
    filter_id: 'current_country_of_residence',
    label: 'Current Country of Residence',
    selected_values: ['United States'],
    base_field: true,
  },
  {
    filter_id: 'employment_status',
    label: 'Employment Status',
    selected_values: ['Full-Time'],
    base_field: true,
  },
  {
    filter_id: 'employment_sector',
    label: 'Employer Type',
    selected_values: [
      'Employee of a for-profit company or business or of an individual, for wages, salary, or commissions',
      'Employee of a not-for-profit, tax-exempt, or charitable organization',
      'Local government employee (city, county, etc.)',
      'State government employee',
      'Federal government employee',
      'Self-employed in own not-incorporated business, professional practice, or farm',
      'Self-employed in own incorporated business, professional practice, or farm',
      'Working without pay in family business or farm',
    ],
    base_field: false,
  },
  {
    filter_id: 'company_size',
    label: 'Company Size',
    selected_values: ['50-249', '250-999', '1000+'],
    base_field: false,
  },
  {
    filter_id: 'occupation',
    label: 'Job Position',
    selected_values: [
      'C-Level (e.g. CEO, CFO), Owner, Partner, President',
      'Vice President (EVP, SVP, AVP, VP)',
      'Director (Group Director, Sr. Director, Director)',
      'Manager (Group Manager, Sr. Manager, Manager, Program Manager)',
    ],
    base_field: false,
  },
] as const

/**
 * Export demographic data for all participants in a study (bulk).
 * This is the API equivalent of the "Download demographic data" button in the Prolific UI.
 *
 * Base fields always included: age, sex, ethnicity, language, residency, nationality,
 * birth country, student status, employment status, and submission metadata.
 *
 * When filterIds are provided, the export also includes responses to those prescreener
 * filters (up to 15 per export). Use PROLIFIC_ENRICHMENT_FILTER_IDS for cross-validation.
 *
 * Privacy: Demographic exports contain PII and must be handled ephemerally.
 *
 * @param studyId - The Prolific study ID
 * @param apiToken - Prolific API token
 * @param filterIds - Optional array of Prolific prescreener filter_ids to include
 * @returns CSV string with demographic data, or null on error
 * @see https://docs.prolific.com/api-reference/studies/export-demographic-data
 */
export async function exportStudyDemographics(
  studyId: string,
  apiToken: string,
  filterIds?: string[]
): Promise<string | null> {
  const filters = (filterIds ?? []).map((id) => ({ filter_id: id }))
  const url = `${PROLIFIC_API_BASE_URL}/studies/${studyId}/demographic-export/`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filters }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new ProlificApiErrorClass(
      `Demographic export failed: ${response.status} ${text}`,
      response.status
    )
  }

  return await response.text()
}

/**
 * Get summary statistics for a study
 *
 * This is a convenience function that calculates useful metrics
 * from study and submission data.
 *
 * @param studyId - The unique identifier of the study
 * @param apiToken - Prolific API token
 * @returns Promise resolving to study statistics
 */
export async function getStudyStatistics(
  studyId: string,
  apiToken: string
): Promise<{
  study: Study
  totalSubmissions: number
  completedSubmissions: number
  approvedSubmissions: number
  rejectedSubmissions: number
  awaitingReviewSubmissions: number
  averageTimeMinutes: number | null
}> {
  const [study, submissionsResponse] = await Promise.all([
    getStudy(studyId, apiToken),
    listStudySubmissions(studyId, apiToken),
  ])

  const submissions = submissionsResponse.results

  const {
    completedSubmissions,
    approvedSubmissions,
    rejectedSubmissions,
    awaitingReviewSubmissions,
    timeSumSeconds,
    timeCount,
  } = submissions.reduce(
    (acc, s) => {
      if (s.status === 'APPROVED') {
        acc.approvedSubmissions += 1
        acc.completedSubmissions += 1
      } else if (s.status === 'REJECTED') {
        acc.rejectedSubmissions += 1
        acc.completedSubmissions += 1
      } else if (s.status === 'AWAITING REVIEW') {
        acc.awaitingReviewSubmissions += 1
      }

      if (s.time_taken != null) {
        acc.timeSumSeconds += s.time_taken
        acc.timeCount += 1
      }

      return acc
    },
    {
      completedSubmissions: 0,
      approvedSubmissions: 0,
      rejectedSubmissions: 0,
      awaitingReviewSubmissions: 0,
      timeSumSeconds: 0,
      timeCount: 0,
    }
  )

  const averageTimeMinutes = timeCount > 0 ? timeSumSeconds / timeCount / 60 : null

  return {
    study,
    totalSubmissions: submissions.length,
    completedSubmissions,
    approvedSubmissions,
    rejectedSubmissions,
    awaitingReviewSubmissions,
    averageTimeMinutes,
  }
}

/**
 * Escape a CSV field value by wrapping it in quotes if it contains special characters
 * and escaping existing quotes by doubling them.
 *
 * @param value - The value to escape
 * @returns The escaped value, quoted if necessary
 */
function escapeCsvField(value: string): string {
  if (value == null || value === '') {
    return ''
  }

  const stringValue = String(value)

  // Check if the value contains special characters that require quoting
  const needsQuoting =
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')

  if (!needsQuoting) {
    return stringValue
  }

  // Escape quotes by doubling them and wrap the entire value in quotes
  return `"${stringValue.replace(/"/g, '""')}"`
}

/**
 * Export all submissions for a study as CSV data
 *
 * @param studyId - The unique identifier of the study
 * @param apiToken - Prolific API token
 * @returns Promise resolving to CSV string
 */
export async function exportSubmissionsCSV(studyId: string, apiToken: string): Promise<string> {
  const submissionsResponse = await listStudySubmissions(studyId, apiToken)
  const submissions = submissionsResponse.results

  if (submissions.length === 0) {
    return 'id,participant_id,status,started_at,completed_at,time_taken\n'
  }

  const numSubmissions = submissions.length
  // Pre-allocate array to avoid dynamic resizing for large arrays (performance optimization)
  const csvLines = new Array(numSubmissions + 1)

  // CSV header
  const headers = ['id', 'participant_id', 'status', 'started_at', 'completed_at', 'time_taken']
  csvLines[0] = headers.join(',')

  // CSV rows with proper escaping
  for (let i = 0; i < numSubmissions; i++) {
    const submission = submissions[i]
    csvLines[i + 1] = [
      escapeCsvField(submission.id),
      escapeCsvField(submission.participant_id),
      escapeCsvField(submission.status),
      escapeCsvField(submission.started_at),
      escapeCsvField(submission.completed_at || ''),
      escapeCsvField(submission.time_taken?.toString() || ''),
    ].join(',')
  }

  return csvLines.join('\n')
}

/**
 * Bulk approve submissions for a study by participant IDs.
 *
 * Uses the Prolific bulk-approve endpoint:
 * POST /api/v1/submissions/bulk-approve/
 *
 * @param studyId - The unique identifier of the study
 * @param participantIds - Array of participant IDs to approve
 * @param apiToken - Prolific API token
 * @returns Promise that resolves when the bulk approval request completes
 * @throws {ProlificApiErrorClass} When the API request fails
 *
 * @see https://docs.prolific.com/api-reference/submissions/bulk-approve-submissions
 */
export async function bulkApproveSubmissions(
  studyId: string,
  participantIds: string[],
  apiToken: string
): Promise<void> {
  const url = `${PROLIFIC_API_BASE_URL}/submissions/bulk-approve/`

  const headers = new Headers()
  headers.set('Authorization', `Token ${apiToken}`)
  headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        study_id: studyId,
        participant_ids: participantIds,
      }),
    })
  } catch (error) {
    throw new ProlificApiErrorClass(
      `Network error during bulk approve: ${error instanceof Error ? error.message : String(error)}`,
      0,
      {}
    )
  }

  if (!response.ok) {
    let errorData: ProlificApiError = {}
    try {
      errorData = (await response.json()) as ProlificApiError
    } catch {
      // Empty or non-JSON error body
    }
    throw new ProlificApiErrorClass(
      errorData.detail ||
        errorData.error ||
        errorData.message ||
        `Bulk approve failed with status ${response.status}`,
      response.status,
      errorData
    )
  }
  // Log response body for debugging, then return.
  const responseBody = await response.text()
  if (responseBody) {
    console.log(`Prolific bulk-approve response (${response.status}): ${responseBody}`)
  } else {
    console.log(`Prolific bulk-approve response: ${response.status} (empty body)`)
  }
}

/**
 * Prolific rejection categories matching the UI checkboxes.
 * Used when rejecting individual submissions.
 */
export const REJECTION_CATEGORIES = {
  FAILED_AUTHENTICITY_CHECK: 'FAILED_AUTHENTICITY_CHECK',
  FAILED_ATTENTION_CHECK: 'FAILED_ATTENTION_CHECK',
  LOW_EFFORT: 'LOW_EFFORT',
  DIDNT_ANSWER_ESSENTIAL: 'DIDNT_ANSWER_ESSENTIAL',
  NO_DATA: 'NO_DATA',
  TOO_QUICKLY: 'TOO_QUICKLY',
  OTHER: 'OTHER',
} as const

export type RejectionCategory = (typeof REJECTION_CATEGORIES)[keyof typeof REJECTION_CATEGORIES]

/**
 * Find submission IDs for a list of participant IDs within a study.
 * Returns a map of participant_id -> submission_id.
 */
export async function getSubmissionIdsByParticipant(
  studyId: string,
  participantIds: string[],
  apiToken: string
): Promise<Map<string, string>> {
  const submissions = await listStudySubmissions(studyId, apiToken)
  const pidSet = new Set(participantIds)
  const result = new Map<string, string>()

  for (const sub of submissions.results) {
    if (pidSet.has(sub.participant_id)) {
      result.set(sub.participant_id, sub.id)
    }
  }

  return result
}

/**
 * DESTRUCTIVE: Reject a single submission with categories and a message.
 *
 * WARNING: Rejected participants will NOT be paid for their submission.
 * This action cannot be easily undone.
 *
 * @param submissionId - The Prolific submission ID (not participant ID)
 * @param categories - Array of rejection category strings from REJECTION_CATEGORIES
 * @param message - Personalized rejection message shown to the participant
 * @param apiToken - Prolific API token
 */
export async function rejectSubmission(
  submissionId: string,
  categories: RejectionCategory[],
  message: string,
  apiToken: string
): Promise<void> {
  const url = `${PROLIFIC_API_BASE_URL}/submissions/${submissionId}/transition/`

  const headers = new Headers()
  headers.set('Authorization', `Token ${apiToken}`)
  headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'REJECT',
        rejection_categories: categories,
        message,
      }),
    })
  } catch (error) {
    throw new ProlificApiErrorClass(
      `Network error rejecting submission ${submissionId}: ${error instanceof Error ? error.message : String(error)}`,
      0,
      {}
    )
  }

  if (!response.ok) {
    let errorData: ProlificApiError = {}
    try {
      errorData = (await response.json()) as ProlificApiError
    } catch {
      // Empty or non-JSON error body
    }
    throw new ProlificApiErrorClass(
      errorData.detail ||
        errorData.error ||
        errorData.message ||
        `Reject submission ${submissionId} failed with status ${response.status}`,
      response.status,
      errorData
    )
  }

  const responseBody = await response.text()
  if (responseBody) {
    console.log(`  Rejected ${submissionId}: ${response.status}`)
  }
}

/**
 * Unreject a previously rejected submission.
 * Transitions the submission from REJECTED back to AWAITING REVIEW.
 *
 * POST /api/v1/submissions/{submissionId}/transition/
 * Body: { "action": "UNREJECT" }
 *
 * @see https://docs.prolific.com/api-reference/submissions/transition-submission
 */
export async function unrejectSubmission(submissionId: string, apiToken: string): Promise<void> {
  const url = `${PROLIFIC_API_BASE_URL}/submissions/${submissionId}/transition/`

  const headers = new Headers()
  headers.set('Authorization', `Token ${apiToken}`)
  headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'UNREJECT' }),
    })
  } catch (error) {
    throw new ProlificApiErrorClass(
      `Network error during unreject: ${error instanceof Error ? error.message : String(error)}`,
      0,
      {}
    )
  }

  if (!response.ok) {
    let errorData: ProlificApiError = {}
    try {
      errorData = (await response.json()) as ProlificApiError
    } catch {
      // Empty or non-JSON error body
    }
    throw new ProlificApiErrorClass(
      errorData.detail ||
        errorData.error ||
        errorData.message ||
        `Unreject submission ${submissionId} failed with status ${response.status}`,
      response.status,
      errorData
    )
  }

  try {
    await response.text()
  } catch {
    // drain
  }
  console.log(`  Unrejected ${submissionId}`)
}

/**
 * DESTRUCTIVE: Bulk reject submissions for a study by participant IDs.
 *
 * WARNING: Rejected participants will NOT be paid for their submission.
 * This action cannot be easily undone. Use with extreme caution.
 *
 * Uses the Prolific bulk-reject endpoint:
 * POST /api/v1/submissions/bulk-reject/
 *
 * @param studyId - The unique identifier of the study
 * @param participantIds - Array of participant IDs to reject
 * @param apiToken - Prolific API token
 * @returns Promise that resolves when the bulk rejection request completes
 * @throws {ProlificApiErrorClass} When the API request fails
 */
export async function bulkRejectSubmissions(
  studyId: string,
  participantIds: string[],
  apiToken: string
): Promise<void> {
  const url = `${PROLIFIC_API_BASE_URL}/submissions/bulk-reject/`

  const headers = new Headers()
  headers.set('Authorization', `Token ${apiToken}`)
  headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        study_id: studyId,
        participant_ids: participantIds,
      }),
    })
  } catch (error) {
    throw new ProlificApiErrorClass(
      `Network error during bulk reject: ${error instanceof Error ? error.message : String(error)}`,
      0,
      {}
    )
  }

  if (!response.ok) {
    let errorData: ProlificApiError = {}
    try {
      errorData = (await response.json()) as ProlificApiError
    } catch {
      // Empty or non-JSON error body
    }
    throw new ProlificApiErrorClass(
      errorData.detail ||
        errorData.error ||
        errorData.message ||
        `Bulk reject failed with status ${response.status}`,
      response.status,
      errorData
    )
  }

  const responseBody = await response.text()
  if (responseBody) {
    console.log(`Prolific bulk-reject response (${response.status}): ${responseBody}`)
  } else {
    console.log(`Prolific bulk-reject response: ${response.status} (empty body)`)
  }
}

// ---------------------------------------------------------------------------
// Messaging functions
// ---------------------------------------------------------------------------

/**
 * Send a message to a participant for a given study.
 *
 * Uses the Prolific messaging endpoint:
 * POST /api/v1/messages/
 *
 * @param studyId - The unique identifier of the study
 * @param participantId - The unique identifier of the participant
 * @param body - The message body text
 * @param apiToken - Prolific API token
 * @returns Promise resolving to the created Message
 * @throws {ProlificApiErrorClass} When the API request fails
 *
 * @see https://docs.prolific.com/api-reference/messages/send-message
 */
export async function sendMessage(
  studyId: string,
  participantId: string,
  messageBody: string,
  apiToken: string
): Promise<void> {
  const url = `${PROLIFIC_API_BASE_URL}/messages/`

  const headers = new Headers()
  headers.set('Authorization', `Token ${apiToken}`)
  headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        recipient_id: participantId,
        body: messageBody,
        study_id: studyId,
      }),
    })
  } catch (error) {
    throw new ProlificApiErrorClass(
      `Network error sending message: ${error instanceof Error ? error.message : String(error)}`,
      0,
      {}
    )
  }

  if (!response.ok) {
    let errorDetail = ''
    try {
      const errorBody = await response.text()
      errorDetail = errorBody.slice(0, 500)
    } catch {
      // ignore
    }
    throw new ProlificApiErrorClass(
      `Send message failed (${response.status}): ${errorDetail}`,
      response.status,
      {}
    )
  }

  // Drain response body
  try {
    await response.text()
  } catch {
    // ignore
  }
}

/**
 * List messages for a specific user (participant).
 *
 * Uses the Prolific messaging endpoint:
 * GET /api/v1/messages/?user_id={userId}
 *
 * Either user_id or created_after is required.
 *
 * @param userId - The user ID to get messages for
 * @param apiToken - Prolific API token
 * @returns Promise resolving to a paginated list of Messages
 * @throws {ProlificApiErrorClass} When the API request fails
 *
 * @see https://docs.prolific.com/api-reference/messages/get-messages
 */
export async function listUserMessages(
  userId: string,
  apiToken: string
): Promise<PaginatedResponse<Message>> {
  return makeApiRequest<PaginatedResponse<Message>>(
    `/messages/?user_id=${encodeURIComponent(userId)}`,
    apiToken
  )
}

/**
 * List recent messages (last 30 days).
 *
 * @param createdAfter - ISO8601 timestamp (messages after this date, max 30 days)
 * @param apiToken - Prolific API token
 * @returns Promise resolving to a paginated list of Messages
 *
 * @see https://docs.prolific.com/api-reference/messages/get-messages
 */
export async function listRecentMessages(
  createdAfter: string,
  apiToken: string
): Promise<PaginatedResponse<Message>> {
  return makeApiRequest<PaginatedResponse<Message>>(
    `/messages/?created_after=${encodeURIComponent(createdAfter)}`,
    apiToken
  )
}
