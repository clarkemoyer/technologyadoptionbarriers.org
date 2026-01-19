import { gaClient } from '../src/lib/google-analytics'
import { protos } from '@google-analytics/data'
import fs from 'fs'
import path from 'path'

const MetricAggregation = protos.google.analytics.data.v1beta.MetricAggregation

interface MetricValue {
  value?: string
}

interface DimensionValue {
  value?: string
}

interface ReportRow {
  metricValues?: MetricValue[]
  dimensionValues?: DimensionValue[]
}

async function generateReport() {
  try {
    console.log('Fetching Google Analytics Report...')

    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir)
    }

    const response = await gaClient.runReport({
      startDate: '28daysAgo',
      endDate: 'today',
      metrics: [
        'activeUsers',
        'newUsers',
        'sessions',
        'engagementRate',
        'screenPageViews',
        'eventCount',
      ],
      metricAggregations: [MetricAggregation.TOTAL],
      dimensions: ['date', 'pagePath'],
    })

    const date = new Date().toISOString().split('T')[0]
    const filename = `ga-report-${date}.json`
    const filepath = path.join(reportsDir, filename)

    const reportData = {
      generatedAt: new Date().toISOString(),
      rowCount: response.rowCount,
      rows: response.rows,
      totals: response.totals,
    }

    fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2))
    console.log(`Report generated successfully: ${filepath}`)
    console.log(`Rows fetched: ${response.rowCount || 0}`)

    // --- Generate Public Impact Stats ---
    const publicStatsPath = path.join(process.cwd(), 'src', 'data', 'impact.json')
    const t = response.totals?.[0]
    const publicStats = {
      updatedAt: new Date().toISOString(),
      activeUsers: t?.metricValues?.[0]?.value || '0',
      pageViews: t?.metricValues?.[4]?.value || '0',
    }
    // Ensure directory exists
    const dataDir = path.join(process.cwd(), 'src', 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(publicStatsPath, JSON.stringify(publicStats, null, 2))
    console.log(`Public impact stats saved to: ${publicStatsPath}`)

    // --- Generate GitHub Step Summary ---
    if (process.env.GITHUB_STEP_SUMMARY) {
      console.log('Generating GitHub Step Summary...')

      // Fetch aggregations for the summary table (Top pages by views)
      const summaryResponse = await gaClient.runReport({
        startDate: '28daysAgo',
        endDate: 'today',
        metrics: ['activeUsers', 'newUsers', 'sessions', 'screenPageViews'],
        dimensions: ['pagePath'],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      })

      const t = response.totals?.[0] // Use totals from the main broad query for high-level stats
      const rows = summaryResponse.rows || []

      if (t && t.metricValues) {
        const mk = `
# 📊 Google Analytics Report (Last 28 Days)

### 📈 Overview
| Metric | Total |
| :--- | :--- |
| **Active Users** | ${t.metricValues[0]?.value || '0'} |
| **New Users** | ${t.metricValues[1]?.value || '0'} |
| **Sessions** | ${t.metricValues[2]?.value || '0'} |
| **Views** | ${t.metricValues[4]?.value || '0'} |
| **Engagement Rate** | ${t.metricValues[3]?.value ? parseFloat(t.metricValues[3].value).toFixed(2) : '0'} |

### 🏆 Top Pages
| Page | Views | Users | Sessions |
| :--- | :--- | :--- | :--- |
${rows
            .map((row: any) => {
              if (!row.metricValues || !row.dimensionValues) return ''
              const [activeUsers, , sessions, views] = row.metricValues
              const path = row.dimensionValues[0]?.value || '/'
              return `| \`${path}\` | ${views?.value || 0} | ${activeUsers?.value || 0} | ${sessions?.value || 0} |`
            })
            .join('\n')}

> *Full granular data available in the [exported JSON artifact](#).*
      `

        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, mk)
        console.log('Summary attached to workflow.')
      } else {
        console.warn('No totals available for summary.')
      }
    }
  } catch (error) {
    console.error('Error generating report:', error)
    process.exit(1)
  }
}

generateReport()
