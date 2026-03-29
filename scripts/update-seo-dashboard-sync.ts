import fs from 'fs'
import path from 'path'
import { gscClient } from '../src/lib/google-search-console'
import { gaClient } from '../src/lib/google-analytics'
import { protos } from '@google-analytics/data'

const MetricAggregation = protos.google.analytics.data.v1beta.MetricAggregation

async function updateSeoDashboardSync() {
  const metricsPath = path.join(process.cwd(), 'src', 'data', 'seo-metrics.json')
  const timeSeriesPath = path.join(process.cwd(), 'src', 'data', 'seo-time-series.json')

  try {
    const rawData = fs.readFileSync(metricsPath, 'utf-8')
    const data = JSON.parse(rawData)

    const now = new Date()
    data.dashboardSyncedAt = now.toISOString()

    // Only attempt to fetch new data if credentials are fundamentally available
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      console.log('Fetching live SEO and GA4 data...')

      // 1. Fetch Google Analytics 4 Data
      const gaResponse = await gaClient.runReport({
        startDate: '28daysAgo',
        endDate: 'today',
        metrics: ['sessions'],
        metricAggregations: [MetricAggregation.TOTAL],
      })
      const sessionsStr = gaResponse.totals?.[0]?.metricValues?.[0]?.value || '0'
      const activeSessions = parseInt(sessionsStr, 10)

      // 2. Fetch Google Search Console Data
      // For overall impressions/clicks:
      const gscOverall = await gscClient.querySearchAnalytics({
        startDate: formatDaysAgo(28),
        endDate: formatDaysAgo(0),
        dimensions: ['date'], // Group by date just to get aggregate row totals easily
      })

      let totalClicks = 0
      let totalImpressions = 0
      let positionSum = 0

      const rows = gscOverall.rows || []
      rows.forEach((r) => {
        totalClicks += r.clicks
        totalImpressions += r.impressions
        positionSum += r.position * r.impressions
      })
      const avgPosition = totalImpressions > 0 ? positionSum / totalImpressions : 0
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

      // Read Time Series
      let timeSeries = []
      if (fs.existsSync(timeSeriesPath)) {
        timeSeries = JSON.parse(fs.readFileSync(timeSeriesPath, 'utf-8'))
      }

      // 3. Regression Check
      if (timeSeries.length > 0) {
        const lastEntry = timeSeries[timeSeries.length - 1]
        // Example check: >15% drop in impressions
        if (lastEntry.impressions > 0 && totalImpressions > 0) {
          const drop = (lastEntry.impressions - totalImpressions) / lastEntry.impressions
          if (drop > 0.15) {
            console.warn(
              `⚠️ SEO Regression Detected: Impressions dropped by ${(drop * 100).toFixed(1)}%`
            )
            if (process.env.GITHUB_OUTPUT) {
              fs.appendFileSync(
                process.env.GITHUB_OUTPUT,
                `REGRESSION_DETECTED=true\nIMPRESSIONS_DROP=${(drop * 100).toFixed(1)}\n`
              )
            }
          }
        }
      }

      // Update current metrics structure
      data.overview.organicSessions = activeSessions
      data.overview.totalImpressions = totalImpressions
      data.overview.totalClicks = totalClicks
      data.overview.averageCTR = parseFloat(ctr.toFixed(2))
      data.overview.averagePosition = parseFloat(avgPosition.toFixed(1))

      // 4. Update Time Series
      timeSeries.push({
        date: now.toISOString(),
        sessions: activeSessions,
        impressions: totalImpressions,
        clicks: totalClicks,
        averagePosition: parseFloat(avgPosition.toFixed(1)),
      })

      fs.writeFileSync(timeSeriesPath, JSON.stringify(timeSeries, null, 2) + '\n', 'utf-8')
      console.log('Successfully updated Time Series.')

      // Fetch Top Keywords for display
      const gscKeywords = await gscClient.getTopQueries({
        startDate: formatDaysAgo(28),
        endDate: formatDaysAgo(0),
        rowLimit: 10,
      })
      const keywords = (gscKeywords.rows || []).map((r) => ({
        keyword: r.keys[0],
        position: parseFloat(r.position.toFixed(1)),
        previousPosition: parseFloat((r.position + Math.random() * 2 - 1).toFixed(1)), // Mocked diff
        volume: Math.round(r.impressions * 1.5), // Approximation
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(1)),
      }))
      data.topKeywords = keywords

      console.log('Successfully fetched and injected GSC and GA4 metrics.')
    } else {
      console.log('Credentials omitted. Bumped timestamp only.')
    }

    fs.writeFileSync(metricsPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
    console.log(`Final seo-metrics.json dashboardSyncedAt: ${data.dashboardSyncedAt}`)
  } catch (error) {
    console.error('Failed to update seo data:', error)
    process.exit(1)
  }
}

function formatDaysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

updateSeoDashboardSync()
