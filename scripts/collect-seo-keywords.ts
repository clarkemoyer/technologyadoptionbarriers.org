import { gscClient, GSCRow } from '../src/lib/google-search-console'
import { gaClient } from '../src/lib/google-analytics'
import fs from 'fs'
import path from 'path'

interface KeywordReport {
  generatedAt: string
  dateRange: { startDate: string; endDate: string }
  gscKeywords: GSCRow[]
  gaOrganicLandingPages: Array<{
    pagePath: string
    sessions: string
    activeUsers: string
    engagementRate: string
  }>
  summary: string
}

async function collectSeoKeywords() {
  const startDate = process.env.SEO_START_DATE || formatDate(daysAgo(28))
  const endDate = process.env.SEO_END_DATE || formatDate(new Date())

  console.log(`Collecting SEO keyword data for ${startDate} to ${endDate}...`)

  const reportsDir = path.join(process.cwd(), 'reports', 'seo')
  fs.mkdirSync(reportsDir, { recursive: true })

  // --- GSC: Top keywords by clicks ---
  console.log('Fetching top keywords from Google Search Console...')
  const keywordsResponse = await gscClient.getTopQueries({
    startDate,
    endDate,
    rowLimit: 100,
  })

  const sortedKeywords = keywordsResponse.rows.sort((a, b) => b.clicks - a.clicks)
  console.log(`  Found ${sortedKeywords.length} keywords`)

  // --- GA4: Organic landing page performance ---
  console.log('Fetching organic landing page data from GA4...')
  const gaResponse = await gaClient.runReport({
    startDate,
    endDate,
    dimensions: ['pagePath'],
    metrics: ['sessions', 'activeUsers', 'engagementRate'],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50,
  })

  const gaLandingPages = (gaResponse.rows || []).map((row: any) => ({
    pagePath: row.dimensionValues?.[0]?.value || '/',
    sessions: row.metricValues?.[0]?.value || '0',
    activeUsers: row.metricValues?.[1]?.value || '0',
    engagementRate: row.metricValues?.[2]?.value || '0',
  }))
  console.log(`  Found ${gaLandingPages.length} landing pages`)

  // --- Build summary markdown ---
  const summaryLines = [
    `# SEO Keyword Report (${startDate} to ${endDate})`,
    '',
    '## Top 20 Keywords by Clicks',
    '| Keyword | Clicks | Impressions | CTR | Avg Position |',
    '| :--- | ---: | ---: | ---: | ---: |',
    ...sortedKeywords
      .slice(0, 20)
      .map(
        (row) =>
          `| ${row.keys[0]} | ${row.clicks} | ${row.impressions} | ${(row.ctr * 100).toFixed(1)}% | ${row.position.toFixed(1)} |`
      ),
    '',
    '## Top 10 Organic Landing Pages (GA4)',
    '| Page | Sessions | Users | Engagement Rate |',
    '| :--- | ---: | ---: | ---: |',
    ...gaLandingPages
      .slice(0, 10)
      .map(
        (p) =>
          `| ${p.pagePath} | ${p.sessions} | ${p.activeUsers} | ${(parseFloat(p.engagementRate) * 100).toFixed(1)}% |`
      ),
  ]
  const summary = summaryLines.join('\n')

  // --- Write outputs ---
  const date = new Date().toISOString().split('T')[0]
  const report: KeywordReport = {
    generatedAt: new Date().toISOString(),
    dateRange: { startDate, endDate },
    gscKeywords: sortedKeywords,
    gaOrganicLandingPages: gaLandingPages,
    summary,
  }

  const jsonPath = path.join(reportsDir, `keyword-rankings-${date}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  console.log(`Keyword report saved to: ${jsonPath}`)

  // --- GitHub Step Summary ---
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n')
    console.log('Summary attached to workflow.')
  }

  return report
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

collectSeoKeywords().catch((err) => {
  console.error('Error collecting SEO keywords:', err)
  process.exit(1)
})
