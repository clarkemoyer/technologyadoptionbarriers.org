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
    selected_values?: any[]
    selected_range?: { min?: number; max?: number }
  }>
  eligibility_requirements?: any[]
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
      throw new ProlificApiErrorClass(
        errorData.detail ||
          errorData.error ||
          errorData.message ||
          `API request failed with status ${response.status}`,
        response.status,
        errorData
      )
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
 * List all submissions for a specific study
 *
 * @param studyId - The unique identifier of the study
 * @param apiToken - Prolific API token
 * @returns Promise resolving to a list of submissions
 */
export async function listStudySubmissions(
  studyId: string,
  apiToken: string
): Promise<PaginatedResponse<Submission>> {
  return makeApiRequest(`/studies/${studyId}/submissions/`, apiToken)
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

  // CSV header
  const headers = ['id', 'participant_id', 'status', 'started_at', 'completed_at', 'time_taken']
  const csvLines = [headers.join(',')]

  // CSV rows with proper escaping
  for (const submission of submissions) {
    const row = [
      escapeCsvField(submission.id),
      escapeCsvField(submission.participant_id),
      escapeCsvField(submission.status),
      escapeCsvField(submission.started_at),
      escapeCsvField(submission.completed_at || ''),
      escapeCsvField(submission.time_taken?.toString() || ''),
    ]
    csvLines.push(row.join(','))
  }

  return csvLines.join('\n')
}
