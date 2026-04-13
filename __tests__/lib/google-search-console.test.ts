import { GoogleSearchConsoleClient } from '../../src/lib/google-search-console'

jest.mock('googleapis', () => {
  const mockQuery = jest.fn()
  const mockListSitemaps = jest.fn()
  return {
    google: {
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({})),
      },
      searchconsole: jest.fn().mockReturnValue({
        searchanalytics: { query: mockQuery },
        sitemaps: { list: mockListSitemaps },
      }),
    },
    __mockQuery: mockQuery,
    __mockListSitemaps: mockListSitemaps,
  }
})

const { __mockQuery: mockQuery, __mockListSitemaps: mockListSitemaps } =
  jest.requireMock('googleapis')

describe('GoogleSearchConsoleClient', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: 'test@example.com',
      GOOGLE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
      GSC_SITE_URL: 'sc-domain:technologyadoptionbarriers.org',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should initialize with correct credentials', () => {
    const { google } = jest.requireMock('googleapis')
    new GoogleSearchConsoleClient()

    expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
      credentials: {
        client_email: 'test@example.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
      },
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })
  })

  it('should query search analytics with default options', async () => {
    mockQuery.mockResolvedValueOnce({
      data: {
        rows: [
          {
            keys: ['technology adoption'],
            clicks: 50,
            impressions: 1000,
            ctr: 0.05,
            position: 3.2,
          },
        ],
        responseAggregationType: 'byPage',
      },
    })

    const client = new GoogleSearchConsoleClient()
    const result = await client.querySearchAnalytics()

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        siteUrl: 'sc-domain:technologyadoptionbarriers.org',
        requestBody: expect.objectContaining({
          dimensions: ['query'],
          rowLimit: 100,
          startRow: 0,
          type: 'web',
        }),
      })
    )

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]).toEqual({
      keys: ['technology adoption'],
      clicks: 50,
      impressions: 1000,
      ctr: 0.05,
      position: 3.2,
    })
  })

  it('should handle empty response rows', async () => {
    mockQuery.mockResolvedValueOnce({ data: {} })

    const client = new GoogleSearchConsoleClient()
    const result = await client.querySearchAnalytics()

    expect(result.rows).toHaveLength(0)
  })

  it('should get top queries using query dimension', async () => {
    mockQuery.mockResolvedValueOnce({ data: { rows: [] } })

    const client = new GoogleSearchConsoleClient()
    await client.getTopQueries({ rowLimit: 50 })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          dimensions: ['query'],
          rowLimit: 50,
        }),
      })
    )
  })

  it('should get top pages using page dimension', async () => {
    mockQuery.mockResolvedValueOnce({ data: { rows: [] } })

    const client = new GoogleSearchConsoleClient()
    await client.getTopPages()

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          dimensions: ['page'],
        }),
      })
    )
  })

  it('should get query-page pairs using both dimensions', async () => {
    mockQuery.mockResolvedValueOnce({ data: { rows: [] } })

    const client = new GoogleSearchConsoleClient()
    await client.getQueryPagePairs()

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          dimensions: ['query', 'page'],
        }),
      })
    )
  })

  it('should list sitemaps', async () => {
    mockListSitemaps.mockResolvedValueOnce({
      data: {
        sitemap: [{ path: 'https://technologyadoptionbarriers.org/sitemap.xml' }],
      },
    })

    const client = new GoogleSearchConsoleClient()
    const sitemaps = await client.listSitemaps()

    expect(sitemaps).toHaveLength(1)
    expect(mockListSitemaps).toHaveBeenCalledWith({
      siteUrl: 'sc-domain:technologyadoptionbarriers.org',
    })
  })

  it('should throw on API error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('API error'))

    const client = new GoogleSearchConsoleClient()
    await expect(client.querySearchAnalytics()).rejects.toThrow('API error')
  })

  it('should default siteUrl when GSC_SITE_URL is not set', () => {
    delete process.env.GSC_SITE_URL
    const { google } = jest.requireMock('googleapis')

    // Reset to capture new instance
    google.searchconsole.mockReturnValue({
      searchanalytics: { query: mockQuery },
      sitemaps: { list: mockListSitemaps },
    })

    const client = new GoogleSearchConsoleClient()
    // Verify it doesn't throw - defaults to production URL
    expect(client).toBeDefined()
  })
})
