import { gscClient, GSCRow } from '../src/lib/google-search-console'
import { gaClient } from '../src/lib/google-analytics'
import fs from 'fs'
import path from 'path'

interface PageMetrics {
  page: string
  gsc: { clicks: number; impressions: number; ctr: number; position: number }
  ga: { sessions: string; activeUsers: string; engagementRate: string } | null
  topKeywords: Array<{ query: string; clicks: number; impressions: number; position: number }>
}

interface PageSeoReport {
  generatedAt: string
  dateRange: { startDate: string; endDate: string }
  pages: PageMetrics[]
  summary: string
}

async function collectPageSeoMetrics() {
  const startDate = process.env.SEO_START_DATE || formatDate(daysAgo(28))
  const endDate = process.env.SEO_END_DATE || formatDate(new Date())

  console.log(`Collecting page SEO metrics for ${startDate} to ${endDate}...`)

  const reportsDir = path.join(process.cwd(), 'reports', 'seo')
  fs.mkdirSync(reportsDir, { recursive: true })

  // --- GSC: Top pages by clicks ---
  console.log('Fetching top pages from Google Search Console...')
  const pagesResponse = await gscClient.getTopPages({
    startDate,
    endDate,
    rowLimit: 50,
  })
  const gscPages = pagesResponse.rows.sort((a, b) => b.clicks - a.clicks)
  console.log(`  Found ${gscPages.length} pages in GSC`)

  // --- GSC: Query-page pairs for keyword mapping ---
  console.log('Fetching query-page pairs for keyword mapping...')
  const pairsResponse = await gscClient.getQueryPagePairs({
    startDate,
    endDate,
    rowLimit: 1000,
  })
  console.log(`  Found ${pairsResponse.rows.length} query-page pairs`)

  // Build keyword map: page -> keywords[]
  const keywordsByPage = new Map<string, GSCRow[]>()
  for (const row of pairsResponse.rows) {
    const page = row.keys[1] // [query, page]
    if (!keywordsByPage.has(page)) {
      keywordsByPage.set(page, [])
    }
    keywordsByPage.get(page)!.push({
      ...row,
      keys: [row.keys[0]], // just query
    })
  }

  // --- GA4: Organic page performance ---
  console.log('Fetching organic page data from GA4...')
  const gaResponse = await gaClient.runReport({
    startDate,
    endDate,
    dimensions: ['pagePath'],
    metrics: ['sessions', 'activeUsers', 'engagementRate'],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 100,
  })

  const gaByPath = new Map<
    string,
    { sessions: string; activeUsers: string; engagementRate: string }
  >()
  for (const row of gaResponse.rows || []) {
    const pagePath = (row as any).dimensionValues?.[0]?.value || '/'
    gaByPath.set(pagePath, {
      sessions: (row as any).metricValues?.[0]?.value || '0',
      activeUsers: (row as any).metricValues?.[1]?.value || '0',
      engagementRate: (row as any).metricValues?.[2]?.value || '0',
    })
  }

  // --- Merge data ---
  const pages: PageMetrics[] = gscPages.map((gscRow) => {
    const fullUrl = gscRow.keys[0]
    // Extract path from full URL for GA matching
    let pagePath = '/'
    try {
      pagePath = new URL(fullUrl).pathname
    } catch {
      pagePath = fullUrl
    }

    const pageKeywords = (keywordsByPage.get(fullUrl) || [])
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((k) => ({
        query: k.keys[0],
        clicks: k.clicks,
        impressions: k.impressions,
        position: k.position,
      }))

    return {
      page: pagePath,
      gsc: {
        clicks: gscRow.clicks,
        impressions: gscRow.impressions,
        ctr: gscRow.ctr,
        position: gscRow.position,
      },
      ga: gaByPath.get(pagePath) || null,
      topKeywords: pageKeywords,
    }
  })

  // --- Identify best/worst performers ---
  const bestPages = pages.slice(0, 10)
  const worstPages = pages
    .filter((p) => p.gsc.impressions > 10)
    .sort((a, b) => a.gsc.clicks - b.gsc.clicks)
    .slice(0, 10)

  // --- Build summary ---
  const summaryLines = [
    `# Page SEO Metrics Report (${startDate} to ${endDate})`,
    '',
    '## Top 10 Pages by Organic Clicks',
    '| Page | Clicks | Impressions | CTR | Avg Position | GA Sessions |',
    '| :--- | ---: | ---: | ---: | ---: | ---: |',
    ...bestPages.map(
      (p) =>
        `| ${p.page} | ${p.gsc.clicks} | ${p.gsc.impressions} | ${(p.gsc.ctr * 100).toFixed(1)}% | ${p.gsc.position.toFixed(1)} | ${p.ga?.sessions || '-'} |`
    ),
    '',
    '## Lowest Performing Pages (with >10 impressions)',
    '| Page | Clicks | Impressions | CTR | Avg Position |',
    '| :--- | ---: | ---: | ---: | ---: |',
    ...worstPages.map(
      (p) =>
        `| ${p.page} | ${p.gsc.clicks} | ${p.gsc.impressions} | ${(p.gsc.ctr * 100).toFixed(1)}% | ${p.gsc.position.toFixed(1)} |`
    ),
  ]
  const summary = summaryLines.join('\n')

  // --- Write outputs ---
  const date = new Date().toISOString().split('T')[0]
  const report: PageSeoReport = {
    generatedAt: new Date().toISOString(),
    dateRange: { startDate, endDate },
    pages,
    summary,
  }

  const jsonPath = path.join(reportsDir, `page-metrics-${date}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  console.log(`Page metrics report saved to: ${jsonPath}`)

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

collectPageSeoMetrics().catch((err) => {
  console.error('Error collecting page SEO metrics:', err)
  process.exit(1)
})
