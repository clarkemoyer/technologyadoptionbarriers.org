import { BetaAnalyticsDataClient, protos } from '@google-analytics/data'

type MetricAggregation = protos.google.analytics.data.v1beta.MetricAggregation

interface GAReportOptions {
  startDate?: string
  endDate?: string
  dimensions?: string[]
  metrics?: string[]
  limit?: number
  orderBys?: Array<{ metric?: { metricName: string }; desc?: boolean }>
  metricAggregations?: MetricAggregation[]
}

export class GoogleAnalyticsClient {
  private client: BetaAnalyticsDataClient
  private propertyId: string

  constructor() {
    const propertyId = process.env.GA_PROPERTY_ID
    // Prefer OIDC / Application Default Credentials when GOOGLE_APPLICATION_CREDENTIALS is set
    // (injected by the google-github-actions/auth action in CI).
    // Fall back to explicit service-account key for local development.
    const useADC = !!process.env.GOOGLE_APPLICATION_CREDENTIALS
    const email = useADC ? undefined : process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey =
      useADC || !process.env.GOOGLE_PRIVATE_KEY
        ? undefined
        : process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')

    if (!propertyId) {
      console.warn('GA_PROPERTY_ID not configured. API calls will fail.')
    }
    if (!useADC && (!email || !privateKey)) {
      console.warn('Google Analytics credentials not fully configured. API calls will fail.')
    }

    this.propertyId = propertyId || ''
    this.client = useADC
      ? new BetaAnalyticsDataClient()
      : new BetaAnalyticsDataClient({
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
      limit,
      orderBys,
      metricAggregations,
    } = options

    try {
      const response = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate,
            endDate,
          },
        ],
        dimensions: dimensions.map((d) => ({ name: d })),
        metrics: metrics.map((m) => ({ name: m })),
        limit,
        orderBys,
        metricAggregations,
      } as any)
      return response[0]
    } catch (error) {
      console.error('Failed to fetch GA data:', error)
      throw error
    }
  }
}

export const gaClient = new GoogleAnalyticsClient()
