import { google, searchconsole_v1 } from 'googleapis'

export interface GSCQueryOptions {
  siteUrl?: string
  startDate?: string
  endDate?: string
  dimensions?: string[]
  rowLimit?: number
  startRow?: number
  type?: 'web' | 'image' | 'video' | 'news' | 'discover' | 'googleNews'
}

export interface GSCRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GSCQueryResponse {
  rows: GSCRow[]
  responseAggregationType?: string
}

export class GoogleSearchConsoleClient {
  private client: searchconsole_v1.Searchconsole
  private siteUrl: string

  constructor() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined
    const siteUrl = process.env.GSC_SITE_URL

    if (!email || !privateKey) {
      console.warn('Google Search Console credentials not fully configured. API calls will fail.')
    }

    this.siteUrl = siteUrl || 'https://technologyadoptionbarriers.org'

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })

    this.client = google.searchconsole({ version: 'v1', auth })
  }

  async querySearchAnalytics(options: GSCQueryOptions = {}): Promise<GSCQueryResponse> {
    const {
      siteUrl = this.siteUrl,
      startDate = formatDate(daysAgo(28)),
      endDate = formatDate(new Date()),
      dimensions = ['query'],
      rowLimit = 100,
      startRow = 0,
      type = 'web',
    } = options

    try {
      const response = await this.client.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions,
          rowLimit,
          startRow,
          type,
        },
      })

      return {
        rows: (response.data.rows || []).map((row) => ({
          keys: row.keys || [],
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr || 0,
          position: row.position || 0,
        })),
        responseAggregationType: response.data.responseAggregationType || undefined,
      }
    } catch (error) {
      console.error('Failed to fetch GSC data:', error)
      throw error
    }
  }

  async getTopQueries(
    options: Omit<GSCQueryOptions, 'dimensions'> = {}
  ): Promise<GSCQueryResponse> {
    return this.querySearchAnalytics({
      ...options,
      dimensions: ['query'],
    })
  }

  async getTopPages(options: Omit<GSCQueryOptions, 'dimensions'> = {}): Promise<GSCQueryResponse> {
    return this.querySearchAnalytics({
      ...options,
      dimensions: ['page'],
    })
  }

  async getQueryPagePairs(
    options: Omit<GSCQueryOptions, 'dimensions'> = {}
  ): Promise<GSCQueryResponse> {
    return this.querySearchAnalytics({
      ...options,
      dimensions: ['query', 'page'],
    })
  }

  async listSitemaps(siteUrl?: string) {
    try {
      const response = await this.client.sitemaps.list({
        siteUrl: siteUrl || this.siteUrl,
      })
      return response.data.sitemap || []
    } catch (error) {
      console.error('Failed to list sitemaps:', error)
      throw error
    }
  }
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export const gscClient = new GoogleSearchConsoleClient()
