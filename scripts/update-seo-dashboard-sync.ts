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

    // (Comment 1) Only attempt to fetch new data if credentials are available:
    // either via OIDC Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS,
    // set by google-github-actions/auth in CI) or explicit service-account key env vars.
    if (
      (process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)) &&
      process.env.GA_PROPERTY_ID
    ) {
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

      // (Comment 4) Regression Check with configurable threshold
      const regressionThreshold = Number(process.env.SEO_REGRESSION_THRESHOLD_PERCENT || 15) / 100
      if (timeSeries.length > 0) {
        const lastEntry = timeSeries[timeSeries.length - 1]
        if (lastEntry.impressions > 0 && totalImpressions > 0) {
          const drop = (lastEntry.impressions - totalImpressions) / lastEntry.impressions
          if (drop > regressionThreshold) {
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

      // (Comment 2) Cache the previous overview before modifying the new ones
      const previousOverview = { ...(data.overview || {}) }

      // Update current metrics structure
      data.overview.organicSessions = activeSessions
      data.overview.totalImpressions = totalImpressions
      data.overview.totalClicks = totalClicks
      const newAverageCTR = parseFloat(ctr.toFixed(2))
      const newAveragePosition = parseFloat(avgPosition.toFixed(1))
      data.overview.averageCTR = newAverageCTR
      data.overview.averagePosition = newAveragePosition

      // Systematically compute and update Change fields
      data.overview.organicSessionsChange =
        previousOverview.organicSessions !== undefined
          ? activeSessions - previousOverview.organicSessions
          : 0
      data.overview.totalImpressionsChange =
        previousOverview.totalImpressions !== undefined
          ? totalImpressions - previousOverview.totalImpressions
          : 0
      data.overview.totalClicksChange =
        previousOverview.totalClicks !== undefined ? totalClicks - previousOverview.totalClicks : 0
      data.overview.averageCTRChange =
        previousOverview.averageCTR !== undefined
          ? parseFloat((newAverageCTR - previousOverview.averageCTR).toFixed(2))
          : 0
      data.overview.averagePositionChange =
        previousOverview.averagePosition !== undefined
          ? parseFloat((newAveragePosition - previousOverview.averagePosition).toFixed(1))
          : 0

      // Update metadata to match the current metrics window
      data.generatedAt = now.toISOString()
      data.dateRange = {
        startDate: formatDaysAgo(28),
        endDate: formatDaysAgo(0),
      }

      // 4. Update Time Series
      timeSeries.push({
        date: now.toISOString(),
        sessions: activeSessions,
        impressions: totalImpressions,
        clicks: totalClicks,
        averagePosition: newAveragePosition,
      })

      // (Comment 9) Cap the time series memory footprint to trailing 104 points
      if (timeSeries.length > 104) {
        timeSeries = timeSeries.slice(-104)
      }

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
        // (Comment 3) No fabricated previous position or volume
        previousPosition: null,
        volume: 0,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(1)),
      }))
      data.topKeywords = keywords

      console.log('Successfully fetched and injected GSC and GA4 metrics.')
    } else {
      console.warn('Credentials omitted or partial. Bumped timestamp only.')
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
