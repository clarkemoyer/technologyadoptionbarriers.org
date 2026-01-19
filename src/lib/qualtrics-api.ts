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

    const responseText = await response.text()

    if (!response.ok) {
      let errorBody: unknown = responseText
      try {
        // Attempt to parse error body as JSON, but fall back to plain text if it fails
        errorBody = responseText ? JSON.parse(responseText) : {}
      } catch {
        // Keep errorBody as plain text
      }

      let errorBodyStr: string
      if (typeof errorBody === 'string') {
        errorBodyStr = errorBody
      } else {
        try {
          errorBodyStr = JSON.stringify(errorBody)
        } catch {
          errorBodyStr = '[unserializable error body]'
        }
      }
      if (errorBodyStr.length > 500) {
        errorBodyStr = `${errorBodyStr.slice(0, 500)}...`
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorBodyStr}`
      )
    }

    if (!responseText) {
      // Successful response with no body is unexpected when a result is required
      throw new Error('Qualtrics API returned an empty response body for a successful request')
    }

    let data: unknown
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      // Surface JSON parsing issues clearly for successful responses with context
      const errorMessage =
        parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      const preview = responseText.slice(0, 200)
      throw new Error(
        `Failed to parse successful API response as JSON: ${errorMessage}. Response text: ${preview}${responseText.length > 200 ? '...' : ''}`
      )
    }

    const typedData = data as { result?: T }
    if (typedData.result === undefined || typedData.result === null) {
      throw new Error('Qualtrics API response is missing the expected "result" property')
    }

    return typedData.result
  } catch (error) {
    if (error instanceof Error) {
      // Preserve original error and stack trace
      throw error
    }
    throw new Error('Unknown error occurred while making Qualtrics API request')
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
