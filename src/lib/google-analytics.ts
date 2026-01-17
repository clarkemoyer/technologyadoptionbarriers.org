import { BetaAnalyticsDataClient } from '@google-analytics/data'

interface GAReportOptions {
  startDate?: string
  endDate?: string
  dimensions?: string[]
  metrics?: string[]
}

export class GoogleAnalyticsClient {
  private client: BetaAnalyticsDataClient
  private propertyId: string

  constructor() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined
    const propertyId = process.env.GA_PROPERTY_ID

    if (!email || !privateKey || !propertyId) {
      console.warn('Google Analytics credentials not fully configured. API calls will fail.')
    }

    this.propertyId = propertyId || ''
    this.client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: email,
        private_key: privateKey,
      },
    })
  }

  /**
   * Run a basic report against the GA4 property
   */
  async runReport(options: GAReportOptions = {}) {
    if (!this.propertyId) {
      throw new Error('GA_PROPERTY_ID is not configured')
    }

    const {
      startDate = '28daysAgo',
      endDate = 'today',
      dimensions = [],
      metrics = ['activeUsers'],
    } = options

    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate,
            endDate,
          },
        ],
        dimensions: dimensions.map((d) => ({ name: d })),
        metrics: metrics.map((m) => ({ name: m })),
      })

      return response
    } catch (error) {
      console.error('Failed to fetch GA data:', error)
      throw error
    }
  }
}

export const gaClient = new GoogleAnalyticsClient()
