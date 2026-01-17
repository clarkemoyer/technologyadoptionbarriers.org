import { gaClient } from '../src/lib/google-analytics'
import fs from 'fs'
import path from 'path'

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
  } catch (error) {
    console.error('Error generating report:', error)
    process.exit(1)
  }
}

generateReport()
