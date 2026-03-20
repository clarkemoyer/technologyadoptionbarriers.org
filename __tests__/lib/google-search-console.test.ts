import { SearchConsoleClient } from '../../src/lib/google-search-console'
import { searchconsole, auth } from '@googleapis/searchconsole'

// Mock the dependency
jest.mock('@googleapis/searchconsole')

describe('SearchConsoleClient', () => {
  const mockQuery = jest.fn()
  const mockListSites = jest.fn()
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: 'test@example.com',
      GOOGLE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
      GSC_SITE_URL: 'https://example.com',
    }
    ;(auth.GoogleAuth as unknown as jest.Mock).mockImplementation(() => ({}))
    ;(searchconsole as unknown as jest.Mock).mockReturnValue({
      searchanalytics: { query: mockQuery },
      sites: { list: mockListSites },
    })
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  it('should initialize with correct credentials and scopes', () => {
    new SearchConsoleClient()
    expect(auth.GoogleAuth).toHaveBeenCalledWith({
      credentials: {
        client_email: 'test@example.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
      },
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })
    expect(searchconsole).toHaveBeenCalledWith({
      version: 'v1',
      auth: expect.any(Object),
    })
  })

  it('should query search analytics with provided options', async () => {
    mockQuery.mockResolvedValueOnce({
      data: {
        rows: [
          { keys: ['test query'], clicks: 10, impressions: 100, ctr: 0.1, position: 5.2 },
          { keys: ['another query'], clicks: 5, impressions: 50, ctr: 0.1, position: 3.1 },
        ],
      },
    })

    const client = new SearchConsoleClient()
    const result = await client.querySearchAnalytics({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      dimensions: ['query'],
      rowLimit: 100,
    })

    expect(mockQuery).toHaveBeenCalledWith({
      siteUrl: 'https://example.com',
      requestBody: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        dimensions: ['query'],
        rowLimit: 100,
        startRow: undefined,
        searchType: undefined,
        dimensionFilterGroups: undefined,
        aggregationType: undefined,
      },
    })
    expect(result).toEqual([
      { keys: ['test query'], clicks: 10, impressions: 100, ctr: 0.1, position: 5.2 },
      { keys: ['another query'], clicks: 5, impressions: 50, ctr: 0.1, position: 3.1 },
    ])
  })

  it('should use default dimensions and rowLimit', async () => {
    mockQuery.mockResolvedValueOnce({ data: { rows: [] } })

    const client = new SearchConsoleClient()
    await client.querySearchAnalytics({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })

    expect(mockQuery).toHaveBeenCalledWith({
      siteUrl: 'https://example.com',
      requestBody: expect.objectContaining({
        dimensions: ['query'],
        rowLimit: 1000,
      }),
    })
  })

  it('should handle empty response rows', async () => {
    mockQuery.mockResolvedValueOnce({ data: {} })

    const client = new SearchConsoleClient()
    const result = await client.querySearchAnalytics({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })

    expect(result).toEqual([])
  })

  it('should handle rows with null/undefined fields', async () => {
    mockQuery.mockResolvedValueOnce({
      data: {
        rows: [{ keys: null, clicks: null, impressions: null, ctr: null, position: null }],
      },
    })

    const client = new SearchConsoleClient()
    const result = await client.querySearchAnalytics({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })

    expect(result).toEqual([{ keys: [], clicks: 0, impressions: 0, ctr: 0, position: 0 }])
  })

  it('should throw an error if GSC_SITE_URL is missing', async () => {
    process.env.GSC_SITE_URL = ''
    const client = new SearchConsoleClient()

    await expect(
      client.querySearchAnalytics({ startDate: '2024-01-01', endDate: '2024-01-31' })
    ).rejects.toThrow('GSC_SITE_URL is not configured')
  })

  it('should list sites', async () => {
    mockListSites.mockResolvedValueOnce({
      data: {
        siteEntry: [
          { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' },
          { siteUrl: 'https://other.com', permissionLevel: 'siteFullUser' },
        ],
      },
    })

    const client = new SearchConsoleClient()
    const sites = await client.listSites()

    expect(sites).toEqual([
      { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' },
      { siteUrl: 'https://other.com', permissionLevel: 'siteFullUser' },
    ])
  })

  it('should handle empty sites list', async () => {
    mockListSites.mockResolvedValueOnce({ data: {} })

    const client = new SearchConsoleClient()
    const sites = await client.listSites()

    expect(sites).toEqual([])
  })

  it('should propagate API errors from querySearchAnalytics', async () => {
    mockQuery.mockRejectedValueOnce(new Error('API error'))

    const client = new SearchConsoleClient()
    await expect(
      client.querySearchAnalytics({ startDate: '2024-01-01', endDate: '2024-01-31' })
    ).rejects.toThrow('API error')
  })

  it('should propagate API errors from listSites', async () => {
    mockListSites.mockRejectedValueOnce(new Error('API error'))

    const client = new SearchConsoleClient()
    await expect(client.listSites()).rejects.toThrow('API error')
  })
})
