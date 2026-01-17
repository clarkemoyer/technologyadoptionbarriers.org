import { GoogleAnalyticsClient } from '../../src/lib/google-analytics'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

// Mock the dependency
jest.mock('@google-analytics/data')

describe('GoogleAnalyticsClient', () => {
  const mockRunReport = jest.fn()
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: 'test@example.com',
      GOOGLE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
      GA_PROPERTY_ID: '123456789',
    }
    ;(BetaAnalyticsDataClient as unknown as jest.Mock).mockImplementation(() => ({
      runReport: mockRunReport,
    }))
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  it('should initialize with correct credentials', () => {
    new GoogleAnalyticsClient()
    expect(BetaAnalyticsDataClient).toHaveBeenCalledWith({
      credentials: {
        client_email: 'test@example.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
      },
    })
  })

  it('should run a report with default options', async () => {
    mockRunReport.mockResolvedValueOnce([{}])
    const client = new GoogleAnalyticsClient()
    await client.runReport()

    expect(mockRunReport).toHaveBeenCalledWith({
      property: 'properties/123456789',
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [],
      metrics: [{ name: 'activeUsers' }],
    })
  })

  it('should throw an error if property ID is missing', async () => {
    process.env.GA_PROPERTY_ID = ''
    const client = new GoogleAnalyticsClient()

    // We expect the error to happen when RUNNING the report, because the constructor only warns.
    await expect(client.runReport()).rejects.toThrow('GA_PROPERTY_ID is not configured')
  })
})
