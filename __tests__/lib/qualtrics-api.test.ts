/**
 * @jest-environment node
 */

import {
  getSurveyQuestions,
  startResponseExport,
  checkExportProgress,
  downloadExportFile,
} from '../../src/lib/qualtrics-api'

// Mock fetch globally
global.fetch = jest.fn()

describe('Qualtrics API Client', () => {
  const mockApiToken = 'test-qualtrics-token'
  const mockBaseUrl = 'https://example.qualtrics.com'
  const mockSurveyId = 'SV_123456'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls the survey questions endpoint with X-API-TOKEN header', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ result: { Questions: {} } }),
    })

    await getSurveyQuestions(mockSurveyId, mockApiToken, `${mockBaseUrl}/`)

    expect(global.fetch).toHaveBeenCalledWith(
      `${mockBaseUrl}/API/v3/survey-definitions/${mockSurveyId}/questions`,
      expect.objectContaining({ headers: expect.any(Headers) })
    )

    const call = (global.fetch as jest.Mock).mock.calls[0]
    const headers = call[1].headers as Headers
    expect(headers.get('X-API-TOKEN')).toBe(mockApiToken)
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('throws a useful error for non-OK responses', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => 'nope',
    })

    await expect(getSurveyQuestions(mockSurveyId, mockApiToken, mockBaseUrl)).rejects.toThrow(
      /403 Forbidden/i
    )
  })

  it('throws if response JSON is missing the expected result property', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ notResult: true }),
    })

    await expect(getSurveyQuestions(mockSurveyId, mockApiToken, mockBaseUrl)).rejects.toThrow(
      /missing the expected "result" property/i
    )
  })

  it('throws with helpful context when a successful response has an empty body', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    })

    try {
      await getSurveyQuestions(mockSurveyId, mockApiToken, mockBaseUrl)
      throw new Error('Expected getSurveyQuestions to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toMatch(/empty response body/i)
      expect((error as Error).message).toMatch(/Endpoint:/i)
      expect((error as Error).message).toMatch(/URL:/i)
    }
  })

  it('throws with a useful error when a successful response returns invalid JSON', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => 'not-json',
    })

    await expect(getSurveyQuestions(mockSurveyId, mockApiToken, mockBaseUrl)).rejects.toThrow(
      /Failed to parse successful API response as JSON/i
    )
  })

  describe('Response Export', () => {
    it('startResponseExport returns progressId', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ result: { progressId: 'prog-123' } }),
      })

      const progressId = await startResponseExport(mockSurveyId, mockApiToken, mockBaseUrl)
      expect(progressId).toBe('prog-123')

      const call = (global.fetch as jest.Mock).mock.calls[0]
      expect(call[1].method).toBe('POST')
    })

    it('checkExportProgress returns progress status', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ result: { percentComplete: 100, fileId: 'file-456' } }),
      })

      const progress = await checkExportProgress(
        mockSurveyId,
        'prog-123',
        mockApiToken,
        mockBaseUrl
      )
      expect(progress.percentComplete).toBe(100)
      expect(progress.fileId).toBe('file-456')
    })

    it('downloadExportFile returns buffer', async () => {
      const testData = Buffer.from('test-zip-content')
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => testData.buffer.slice(0),
      })

      const buffer = await downloadExportFile(mockSurveyId, 'file-456', mockApiToken, mockBaseUrl)
      expect(Buffer.isBuffer(buffer)).toBe(true)
    })

    it('downloadExportFile throws on non-OK response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(
        downloadExportFile(mockSurveyId, 'bad-id', mockApiToken, mockBaseUrl)
      ).rejects.toThrow(/404 Not Found/)
    })
  })
})
