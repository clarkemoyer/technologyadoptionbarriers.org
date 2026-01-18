/**
 * Qualtrics API Client
 *
 * This module provides functions to interact with the Qualtrics API
 * for collecting survey definitions and questions.
 *
 * API Documentation: https://api.qualtrics.com/
 */

export interface QualtricsQuestion {
  QuestionID: string
  QuestionText: string
  QuestionType: string
  Selector: string
  SubSelector?: string
  Choices?: Record<string, { Display: string }>
  QuestionDescription?: string
}

export interface QualtricsSurveyDefinition {
  Questions: Record<string, QualtricsQuestion>
}

/**
 * Make an authenticated request to the Qualtrics API
 */
async function makeApiRequest<T>(
  endpoint: string,
  apiToken: string,
  baseUrl: string,
  options: RequestInit = {}
): Promise<T> {
  // Ensure base URL doesn't have trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const url = `${cleanBaseUrl}${endpoint}`

  const headers = new Headers(options.headers || {})
  headers.set('X-API-TOKEN', apiToken)
  headers.set('Content-Type', 'application/json')

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`
      )
    }

    return data.result as T
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred')
  }
}

/**
 * Get questions for a specific survey
 * Endpoint: /API/v3/survey-definitions/{surveyId}/questions
 */
export async function getSurveyQuestions(
  surveyId: string,
  apiToken: string,
  baseUrl: string
): Promise<QualtricsSurveyDefinition> {
  return makeApiRequest<QualtricsSurveyDefinition>(
    `/API/v3/survey-definitions/${surveyId}/questions`,
    apiToken,
    baseUrl
  )
}
