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
  created_at: string
  published_at?: string
  completed_at?: string
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
  return makeApiRequest('/studies/', apiToken)
}

/**
 * Get details of a specific study
 *
 * @param studyId - The unique identifier of the study
 * @param apiToken - Prolific API token
 * @returns Promise resolving to study details
 */
export async function getStudy(studyId: string, apiToken: string): Promise<Study> {
  return makeApiRequest(`/studies/${studyId}/`, apiToken)
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

  const completedSubmissions = submissions.filter(
    (s) => s.status === 'APPROVED' || s.status === 'REJECTED'
  ).length

  const approvedSubmissions = submissions.filter((s) => s.status === 'APPROVED').length

  const rejectedSubmissions = submissions.filter((s) => s.status === 'REJECTED').length

  const awaitingReviewSubmissions = submissions.filter((s) => s.status === 'AWAITING REVIEW').length

  // Calculate average time from submissions with time_taken data
  const submissionsWithTime = submissions.filter((s) => s.time_taken != null)
  const averageTimeMinutes =
    submissionsWithTime.length > 0
      ? submissionsWithTime.reduce((sum, s) => sum + (s.time_taken || 0), 0) /
        submissionsWithTime.length /
        60 // Convert seconds to minutes
      : null

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

  // CSV rows
  for (const submission of submissions) {
    const row = [
      submission.id,
      submission.participant_id,
      submission.status,
      submission.started_at,
      submission.completed_at || '',
      submission.time_taken?.toString() || '',
    ]
    csvLines.push(row.join(','))
  }

  return csvLines.join('\n')
}
