import { searchconsole, auth, searchconsole_v1 } from '@googleapis/searchconsole'

type SearchAnalyticsQueryRequest = searchconsole_v1.Schema$SearchAnalyticsQueryRequest
type ApiDataRow = searchconsole_v1.Schema$ApiDataRow

export interface SearchAnalyticsOptions {
  /** Start date in YYYY-MM-DD format (required) */
  startDate: string
  /** End date in YYYY-MM-DD format (required) */
  endDate: string
  /** Dimensions to group results by (e.g. 'query', 'page', 'country', 'device', 'date') */
  dimensions?: string[]
  /** Maximum number of rows to return (1–25000, default 1000) */
  rowLimit?: number
  /** Zero-based index of the first row to return (default 0) */
  startRow?: number
  /** Search type filter: 'web', 'image', 'video', 'news', 'discover', 'googleNews' */
  searchType?: string
  /** Dimension filter groups for narrowing results */
  dimensionFilterGroups?: SearchAnalyticsQueryRequest['dimensionFilterGroups']
  /** Aggregation type: 'auto', 'byProperty', 'byPage' */
  aggregationType?: string
}

export interface SearchAnalyticsRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export class SearchConsoleClient {
  private client: searchconsole_v1.Searchconsole
  private siteUrl: string

  constructor() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined
    const siteUrl = process.env.GSC_SITE_URL

    if (!email || !privateKey || !siteUrl) {
      console.warn('Google Search Console credentials not fully configured. API calls will fail.')
    }

    this.siteUrl = siteUrl || ''

    const googleAuth = new auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })

    this.client = searchconsole({ version: 'v1', auth: googleAuth })
  }

  /**
   * Query search analytics data from Google Search Console.
   * Returns keyword/page performance data including clicks, impressions, CTR, and position.
   */
  async querySearchAnalytics(options: SearchAnalyticsOptions): Promise<SearchAnalyticsRow[]> {
    if (!this.siteUrl) {
      throw new Error('GSC_SITE_URL is not configured')
    }

    const {
      startDate,
      endDate,
      dimensions = ['query'],
      rowLimit = 1000,
      startRow,
      searchType,
      dimensionFilterGroups,
      aggregationType,
    } = options

    try {
      const response = await this.client.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions,
          rowLimit,
          startRow,
          searchType,
          dimensionFilterGroups,
          aggregationType,
        },
      })

      return (response.data.rows || []).map((row: ApiDataRow) => ({
        keys: row.keys || [],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      }))
    } catch (error) {
      console.error('Failed to fetch Search Console data:', error)
      throw error
    }
  }

  /**
   * List all sites the authenticated service account has access to in Search Console.
   */
  async listSites(): Promise<Array<{ siteUrl: string; permissionLevel: string }>> {
    try {
      const response = await this.client.sites.list()
      return (response.data.siteEntry || []).map((site) => ({
        siteUrl: site.siteUrl || '',
        permissionLevel: site.permissionLevel || '',
      }))
    } catch (error) {
      console.error('Failed to list Search Console sites:', error)
      throw error
    }
  }
}

export const gscClient = new SearchConsoleClient()
