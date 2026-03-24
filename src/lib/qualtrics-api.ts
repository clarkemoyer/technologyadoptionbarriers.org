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
 * Make an authenticated HTTP request to the Qualtrics API.
 *
 * This helper wraps `fetch` to:
 * - Normalize the base URL and endpoint into a full request URL.
 * - Attach the required `X-API-TOKEN` header for Qualtrics authentication.
 * - Enforce JSON responses and provide helpful error messages for common failure modes.
 *
 * @template T - The expected shape of the `result` property in a successful JSON response.
 * @param endpoint - The Qualtrics API endpoint path (for example, `/API/v3/survey-definitions/{surveyId}/questions`).
 * @param apiToken - The Qualtrics API token used for authentication.
 * @param baseUrl - The base URL for the Qualtrics data center (for example, `https://iad1.qualtrics.com`).
 * @param options - Additional `fetch` options, such as HTTP method, body, or extra headers.
 * @returns A promise that resolves with the parsed JSON response typed as {@link T}.
 * @throws {Error} If the network request fails, the response is non-OK, the response body is empty, or the JSON cannot be parsed.
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
      throw new Error(
        `Qualtrics API returned an empty response body for a successful request. Endpoint: ${endpoint}, URL: ${url}`
      )
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
 * Get questions for a specific survey.
 *
 * Endpoint: `/API/v3/survey-definitions/{surveyId}/questions`
 *
 * @param surveyId - The Qualtrics survey ID whose questions should be retrieved.
 * @param apiToken - The Qualtrics API token used for authentication.
 * @param baseUrl - The base URL of the Qualtrics data center API (for example, `https://iad1.qualtrics.com`).
 * @returns A promise that resolves to the survey definition containing all questions keyed by question ID.
 * @throws {Error} If the Qualtrics API request fails, returns a non-2xx response, or the response cannot be parsed.
 */
/* ------------------------------------------------------------------ */
/*  Response Export (3-step async: start → poll → download)           */
/* ------------------------------------------------------------------ */

interface ExportProgress {
  percentComplete: number
  fileId?: string
  status?: string
}

/**
 * Start a CSV response export for a survey.
 * @returns The progressId to poll with {@link checkExportProgress}.
 */
export async function startResponseExport(
  surveyId: string,
  apiToken: string,
  baseUrl: string
): Promise<string> {
  const result = await makeApiRequest<{ progressId: string }>(
    `/API/v3/surveys/${surveyId}/export-responses`,
    apiToken,
    baseUrl,
    {
      method: 'POST',
      body: JSON.stringify({ format: 'csv', useLabels: true }),
    }
  )
  return result.progressId
}

/**
 * Poll the export progress.
 * @returns percentComplete (0-100) and fileId when complete.
 */
export async function checkExportProgress(
  surveyId: string,
  progressId: string,
  apiToken: string,
  baseUrl: string
): Promise<ExportProgress> {
  return makeApiRequest<ExportProgress>(
    `/API/v3/surveys/${surveyId}/export-responses/${progressId}`,
    apiToken,
    baseUrl
  )
}

/**
 * Download the completed export ZIP file.
 * This bypasses the standard JSON response handler since the response is binary.
 */
export async function downloadExportFile(
  surveyId: string,
  fileId: string,
  apiToken: string,
  baseUrl: string
): Promise<Buffer> {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const url = `${cleanBaseUrl}/API/v3/surveys/${surveyId}/export-responses/${fileId}/file`

  const response = await fetch(url, {
    headers: { 'X-API-TOKEN': apiToken },
  })

  if (!response.ok) {
    throw new Error(`Export download failed: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Orchestrate a full response export: start → poll → download → return ZIP buffer.
 * Polls every 2 seconds with a 5-minute timeout.
 */
export async function exportSurveyResponses(
  surveyId: string,
  apiToken: string,
  baseUrl: string
): Promise<Buffer> {
  const progressId = await startResponseExport(surveyId, apiToken, baseUrl)

  const POLL_INTERVAL_MS = 2000
  const TIMEOUT_MS = 5 * 60 * 1000
  const start = Date.now()

  while (Date.now() - start < TIMEOUT_MS) {
    const progress = await checkExportProgress(surveyId, progressId, apiToken, baseUrl)

    if (progress.status === 'failed') {
      throw new Error(`Qualtrics export failed for survey ${surveyId}`)
    }

    if (progress.percentComplete === 100) {
      if (!progress.fileId) {
        throw new Error(`Export completed but no fileId returned for survey ${surveyId}`)
      }
      return downloadExportFile(surveyId, progress.fileId, apiToken, baseUrl)
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  throw new Error(`Export timed out after ${TIMEOUT_MS / 1000}s for survey ${surveyId}`)
}

/* ------------------------------------------------------------------ */
/*  Survey Questions                                                  */
/* ------------------------------------------------------------------ */

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
