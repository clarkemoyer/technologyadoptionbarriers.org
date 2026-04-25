import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
import seoMetrics from '@/data/seo-metrics.json'
import seoTimeSeries from '@/data/seo-time-series.json'
import dynamic from 'next/dynamic'
const SEOHistoryChart = dynamic(() => import('@/components/tabs/seo-history-chart'))

export const metadata: Metadata = {
  title: 'SEO Transparency & Dashboard - Making of TABS',
  description:
    'SEO metrics, baseline audit, and strategic roadmap for the Technology Adoption Barriers project - a transparent, build-time snapshot.',
  alternates: {
    canonical: '/making-of-tabs/seo',
  },
}

const SEOTransparencyPage = () => {
  // The dashboardSyncedAt field is written by the daily CI sync workflow before
  // the Next.js build runs, so it reflects the last time the pipeline executed.
  // generatedAt tracks when the underlying metrics data was collected.
  const syncDateObj = new Date(seoMetrics.dashboardSyncedAt)
  const utcDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  const formattedSnapshotDate = utcDateFormatter.format(syncDateObj)

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>SEO Benchmarking & Transparency</h1>

        <section className="mb-10 text-gray-800">
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span aria-hidden="true">ℹ️</span> Note on Static Deployment Architecture
            </h3>
            <p className="text-sm text-blue-800 mb-2">
              The TABS website is generated entirely as a static export (
              <code>output: &apos;export&apos;</code>) and hosted on GitHub Pages for security and
              performance. Because of this architectural limitation, this dashboard cannot query
              live-polling React APIs such as Google Search Console or Google Analytics natively on
              the client without exposing private API keys. Instead, this dashboard represents a
              statically generated snapshot rendered directly from our internal data pipelines at
              build time.
            </p>
            <p className="text-sm flex flex-col gap-1 mt-2">
              <span className="text-blue-800 font-semibold">
                Dashboard Snapshot Sync: {formattedSnapshotDate}
              </span>
              <span className="text-gray-600 font-medium">
                Data Collection Window: {seoMetrics.dateRange.startDate} to{' '}
                {seoMetrics.dateRange.endDate}
              </span>
            </p>
          </div>

          <p className="mb-6">
            Search Engine Optimization (SEO) is often treated as a secretive marketing discipline.
            However, in alignment with our open-source and open-data philosophy, we treat SEO as an
            infrastructural transparency issue. Below is a unified snapshot of our performance
            metrics, baseline audit, and strategic algorithmic architecture as of the build time
            noted above.
          </p>

          {/* In-page navigation */}
          <nav
            className="mb-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            aria-label="Page sections"
          >
            <p className="font-semibold text-gray-700 mb-2">Jump to:</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-1 list-disc pl-5 text-blue-600">
              <li>
                <a href="#dashboard" className="hover:underline">
                  Performance Dashboard
                </a>
              </li>
              <li>
                <a href="#health" className="hover:underline">
                  Content Integrity &amp; Health
                </a>
              </li>
              <li>
                <a href="#keywords" className="hover:underline">
                  Keyword Visibility
                </a>
              </li>
              <li>
                <a href="#audit" className="hover:underline">
                  Part 1: Baseline Audit
                </a>
              </li>
              <li>
                <a href="#strategy" className="hover:underline">
                  Part 2: Strategy Roadmap
                </a>
              </li>
            </ul>
          </nav>
        </section>

        {/* ── Key Performance Indicators ── */}
        <section className="mb-12" id="dashboard">
          <h2 className={H2_CLASSES}>Performance Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded bg-white shadow-sm flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Organic Sessions
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {seoMetrics.overview.organicSessions.toLocaleString()}
              </span>
              <span
                className={`text-sm mt-1 font-medium ${seoMetrics.overview.organicSessionsChange > 0 ? 'text-green-600' : seoMetrics.overview.organicSessionsChange < 0 ? 'text-red-600' : 'text-gray-400'}`}
              >
                {seoMetrics.overview.organicSessionsChange > 0
                  ? '↑'
                  : seoMetrics.overview.organicSessionsChange < 0
                    ? '↓'
                    : '0%'}{' '}
                {seoMetrics.overview.organicSessionsChange !== 0 &&
                  `${Math.abs(seoMetrics.overview.organicSessionsChange)}%`}
              </span>
            </div>

            <div className="p-4 border border-gray-200 rounded bg-white shadow-sm flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Total Impressions
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {seoMetrics.overview.totalImpressions.toLocaleString()}
              </span>
              <span
                className={`text-sm mt-1 font-medium ${seoMetrics.overview.totalImpressionsChange > 0 ? 'text-green-600' : seoMetrics.overview.totalImpressionsChange < 0 ? 'text-red-600' : 'text-gray-400'}`}
              >
                {seoMetrics.overview.totalImpressionsChange > 0
                  ? '↑'
                  : seoMetrics.overview.totalImpressionsChange < 0
                    ? '↓'
                    : '0%'}{' '}
                {seoMetrics.overview.totalImpressionsChange !== 0 &&
                  `${Math.abs(seoMetrics.overview.totalImpressionsChange)}%`}
              </span>
            </div>

            <div className="p-4 border border-gray-200 rounded bg-white shadow-sm flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Avg Position
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {seoMetrics.overview.averagePosition}
              </span>
              <span
                className={`text-sm mt-1 font-medium ${seoMetrics.overview.averagePositionChange < 0 ? 'text-green-600' : seoMetrics.overview.averagePositionChange > 0 ? 'text-red-600' : 'text-gray-400'}`}
              >
                {seoMetrics.overview.averagePositionChange < 0
                  ? '↑'
                  : seoMetrics.overview.averagePositionChange > 0
                    ? '↓'
                    : 'no change'}{' '}
                {seoMetrics.overview.averagePositionChange !== 0 &&
                  `${Math.abs(seoMetrics.overview.averagePositionChange)} spots`}
              </span>
            </div>

            <div className="p-4 border border-gray-200 rounded bg-white shadow-sm flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Domain Authority
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {seoMetrics.overview.domainAuthority}
              </span>
              <span
                className={`text-sm mt-1 font-medium ${seoMetrics.overview.domainAuthorityChange > 0 ? 'text-green-600' : seoMetrics.overview.domainAuthorityChange < 0 ? 'text-red-600' : 'text-gray-400'}`}
              >
                {seoMetrics.overview.domainAuthorityChange > 0
                  ? '↑'
                  : seoMetrics.overview.domainAuthorityChange < 0
                    ? '↓'
                    : '0'}{' '}
                {seoMetrics.overview.domainAuthorityChange !== 0 &&
                  `${Math.abs(seoMetrics.overview.domainAuthorityChange)} points`}
              </span>
            </div>
          </div>

          <SEOHistoryChart data={seoTimeSeries} />
        </section>

        {/* ── Content Integrity ── */}
        <section className="mb-12" id="health">
          <h2 className={H2_CLASSES}>Content Integrity & Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ul className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <li className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Total Pages Indexed</span>
                <span className="font-bold text-gray-900">
                  {seoMetrics.contentHealth.totalPages}
                </span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Pages w/ Meta Description</span>
                <span className="font-bold text-gray-900">
                  {seoMetrics.contentHealth.pagesWithMetaDescription}
                </span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Pages w/ H1</span>
                <span className="font-bold text-gray-900">
                  {seoMetrics.contentHealth.pagesWithH1}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Pages w/ Structured Data</span>
                <span className="font-bold text-gray-900">
                  {seoMetrics.contentHealth.pagesWithStructuredData}
                </span>
              </li>
            </ul>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col justify-center">
              <h3 className="font-bold text-gray-900 mb-4 text-center">
                Calculated Reliability Scores
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Content Coverage</span>
                    <span className="font-bold">
                      {seoMetrics.contentHealth.contentCoverageScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-tabs-teal h-2 rounded-full"
                      style={{ width: `${seoMetrics.contentHealth.contentCoverageScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Technical SEO Quality</span>
                    <span className="font-bold">
                      {seoMetrics.contentHealth.technicalSeoScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${seoMetrics.contentHealth.technicalSeoScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Top Keywords ── */}
        <section className="mb-12 text-gray-800" id="keywords">
          <h2 className={H2_CLASSES}>Keyword Visibility Search Volumes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Target Keyword
                  </th>
                  <th className="text-center p-3 font-semibold border-b border-gray-200">
                    Position
                  </th>
                  <th className="text-right p-3 font-semibold border-b border-gray-200">
                    Monthly Vol.
                  </th>
                  <th className="text-right p-3 font-semibold border-b border-gray-200">
                    Impressions
                  </th>
                  <th className="text-right p-3 font-semibold border-b border-gray-200">Clicks</th>
                  <th className="text-right p-3 font-semibold border-b border-gray-200">CTR</th>
                </tr>
              </thead>
              <tbody>
                {seoMetrics.topKeywords.map((kw) => {
                  const positionDifference =
                    kw.previousPosition !== null ? kw.previousPosition - kw.position : 0
                  return (
                    <tr key={kw.keyword} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-800">{kw.keyword}</td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-700">
                          {kw.position}
                          {positionDifference > 0 ? (
                            <span
                              className="text-xs text-green-600 font-bold ml-1"
                              title={`Was ${kw.previousPosition}`}
                            >
                              ↑
                            </span>
                          ) : positionDifference < 0 ? (
                            <span
                              className="text-xs text-red-600 font-bold ml-1"
                              title={`Was ${kw.previousPosition}`}
                            >
                              ↓
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-600">{kw.volume.toLocaleString()}</td>
                      <td className="p-3 text-right text-gray-600">
                        {kw.impressions.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-600">{kw.clicks.toLocaleString()}</td>
                      <td className="p-3 text-right font-medium text-blue-600">{kw.ctr}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* ── Part 1: Baseline Audit ── */}
        <section className="mb-12 text-gray-800" id="audit">
          <h2 className={H2_CLASSES}>Part 1: Baseline SEO Audit (Q1 2026)</h2>
          <p className="mb-6">
            Before we can chart a course to maximum organic reach, we first must understand our
            starting line. In early 2026, we conducted a comprehensive review of our technical
            infrastructure, on-page SEO, and existing content gaps. The findings establish a
            baseline that is fully factual and transparent.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">
            Technical & On-Page SEO Foundations
          </h3>
          <p className="mb-6">
            The foundation of our platform (built on Next.js) provides a solid starting point for
            performance and accessibility, but several organic optimization gaps remain.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <h4 className="font-bold text-gray-900 mb-2">Strengths</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                <li>
                  Core Web Vitals scores consistently rate above 90+ in Performance and
                  Accessibility.
                </li>
                <li>Static generation (GitHub Pages) ensures extremely fast initial page loads.</li>
                <li>
                  Valid XML sitemaps and proper canonical tagging are successfully implemented
                  across the primary application hierarchy.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
              <h4 className="font-bold text-gray-900 mb-2">Identified Gaps</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                <li>
                  Missing Schema.org structured data (e.g., <code>Organization</code>,{' '}
                  <code>Article</code>, <code>FAQPage</code>) severely limits rich snippet potential
                  in search engine results pages (SERPs).
                </li>
                <li>
                  Inconsistent metadata lengths: Actionable <code>description</code> tags are often
                  truncated or missing in secondary component pages.
                </li>
                <li>
                  Suboptimal Heading Hierarchy: While <code>&lt;h1&gt;</code> tags exist on most
                  pages, semantic nesting of <code>&lt;h2&gt;</code> and <code>&lt;h3&gt;</code>{' '}
                  headings needs restructuring for crawler clarity.
                </li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">
            Content Competitiveness & Keyword Disconnects
          </h3>
          <p className="mb-6">
            Our keyword gap analysis revealed that while our foundational research targets
            high-value academic and enterprise keywords, our public-facing content currently
            operates in a vacuum, completely isolated from high-volume, long-tail search behavior.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Content Category
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Current State (Baseline)
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    The Disconnect
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">Change Management</td>
                  <td className="p-3">
                    Mentions abstract &quot;sociological barriers&quot; deep within survey
                    methodologies.
                  </td>
                  <td className="p-3">
                    Zero visibility for highly searched &quot;change management strategies&quot;
                    queries.
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">C-Suite Pain Points</td>
                  <td className="p-3">
                    Strong demographic-specific breakdowns available within our persona guides.
                  </td>
                  <td className="p-3">
                    No distinct landing pages answering semantic queries like &quot;Why do
                    enterprise software rollouts fail?&quot;
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">Academic Citations</td>
                  <td className="p-3">
                    Rigorous bibliography provided via PDF and isolated `/making-of-tabs` pages.
                  </td>
                  <td className="p-3">
                    Lack of deep-linked, semantically clustered &quot;hub&quot; articles to capture
                    academic intent.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <hr className="my-16 border-gray-200" />

        {/* ── Part 2: Strategy Roadmap ── */}
        <section className="mb-12 text-gray-800" id="strategy">
          <h2 className={H2_CLASSES}>Part 2: Strategy Roadmap</h2>
          <p className="mb-6">
            Drawing directly from our baseline audit, we have formulated a strict, phased roadmap
            designed to establish the TABS project as the preeminent, authoritative resource on
            enterprise technology resistance.
          </p>
          <p className="mb-6">
            In a post-search generative AI landscape, discoverability relies equally on structured
            data (helping language models understand context) and topical clusters (earning
            traditional algorithmic trust).
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">
            1. Establishing Topical Authority Clusters
          </h3>
          <p className="mb-6">
            Currently, our extensive research sits in large, monolithic structures. To capture
            targeted organic queries, we need semantic <em>hub-and-spoke</em> clusters:
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-1">Hub: Change Management Resistance</h4>
              <p className="text-sm text-gray-700">
                Create dedicated pages dissecting <em>why</em> end-users reject software
                (Psychological vs. Workflow disruption), linking directly into the deeper
                socio-technical models.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-1">Hub: Executive SaaS Purchasing Flaws</h4>
              <p className="text-sm text-gray-700">
                Spin off executive-focused briefs discussing vendor over-promising and the
                &quot;Silver Bullet Fallacy,&quot; anchoring these to our CMO data.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">
            2. Conversational AI Optimization (AIO)
          </h3>
          <p className="mb-6">
            As LLMs increasingly mediate search, raw keyword density matters less than semantic
            context and factual formatting:
          </p>
          <ul className="list-disc pl-6 space-y-3 mb-6 text-gray-700">
            <li>
              <strong>Schema.org Implementation:</strong> Widespread deployment of{' '}
              <code>Article</code>, <code>FAQPage</code>, and <code>Organization</code> structured
              data.
            </li>
            <li>
              <strong>Q&amp;A Formatting:</strong> Structuring page sub-headers explicitly as the
              conversational questions researchers ask.
            </li>
            <li>
              <strong>Factual Density:</strong> Prioritizing quantitative lists, markdown tables,
              and unambiguous statistics.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">
            3. Technical Polish Implementation
          </h3>
          <p className="mb-6">
            While Next.js provides excellent foundational speed, we will implement the following
            optimizations throughout Q3 and Q4 2026:
          </p>
          <ul className="list-disc pl-6 space-y-3 mb-6 text-gray-700">
            <li>
              Rewrite and standardize all static meta descriptions to exactly 150-160 characters.
            </li>
            <li>Establish strict canonical URL enforcement across trailing slashes.</li>
            <li>
              Generate dynamic internal reference linking between persona guides and exact survey
              findings.
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}

export default SEOTransparencyPage
