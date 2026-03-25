import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
import seoMetrics from '@/data/seo-metrics.json'

export const metadata: Metadata = {
  title: 'SEO Performance Dashboard — Making of TABS',
  description:
    'A static snapshot of our ongoing SEO metrics, keyword performance, and technical health benchmarks.',
  alternates: {
    canonical: '/making-of-tabs/seo/dashboard',
  },
}

const SEODashboardPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/making-of-tabs" className="hover:text-blue-600 hover:underline">
                Making of TABS
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li>
              <Link href="/making-of-tabs/seo" className="hover:text-blue-600 hover:underline">
                SEO Benchmarking
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Performance Dashboard
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>SEO Performance Dashboard</h1>

        <section className="mb-10 text-gray-800">
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span>ℹ️</span> Note on Static Deployment Architecture
            </h3>
            <p className="text-sm text-blue-800">
              The TABS website is generated entirely as a static export (`output:
              &apos;export&apos;`) and hosted on GitHub Pages for security and performance. Because
              of this architectural limitation, this dashboard cannot query live-polling React APIs
              such as Google Search Console or Google Analytics natively on the client without
              exposing private API keys. Instead, this dashboard represents a statically generated
              snapshot rendered directly from our internal data pipelines at build time.
            </p>
            <p className="text-sm text-blue-800 font-semibold mt-2">
              Snapshot Date: {new Date(seoMetrics.generatedAt).toLocaleDateString()}
            </p>
          </div>

          <p className="mb-6">
            Transparency requires hard numbers. Below is a snapshot of our baseline organic metrics,
            serving as a public ledger to hold us accountable to our{' '}
            <Link href="/making-of-tabs/seo/strategy" className="text-blue-600 hover:underline">
              SEO roadmap goals
            </Link>
            .
          </p>
        </section>

        {/* ── Key Performance Indicators ── */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Overview Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded bg-white shadow-sm flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Organic Sessions
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {seoMetrics.overview.organicSessions.toLocaleString()}
              </span>
              <span
                className={`text-sm mt-1 font-medium ${seoMetrics.overview.organicSessionsChange > 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {seoMetrics.overview.organicSessionsChange > 0 ? '↑' : '↓'}{' '}
                {Math.abs(seoMetrics.overview.organicSessionsChange)}%
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
                className={`text-sm mt-1 font-medium ${seoMetrics.overview.totalImpressionsChange > 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {seoMetrics.overview.totalImpressionsChange > 0 ? '↑' : '↓'}{' '}
                {Math.abs(seoMetrics.overview.totalImpressionsChange)}%
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
                className={`text-sm mt-1 font-medium ${seoMetrics.overview.averagePositionChange < 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {seoMetrics.overview.averagePositionChange < 0 ? '↑' : '↓'}{' '}
                {Math.abs(seoMetrics.overview.averagePositionChange)} spots
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
                className={`text-sm mt-1 font-medium ${seoMetrics.overview.domainAuthorityChange > 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {seoMetrics.overview.domainAuthorityChange > 0 ? '↑' : '↓'}{' '}
                {Math.abs(seoMetrics.overview.domainAuthorityChange)} points
              </span>
            </div>
          </div>
        </section>

        {/* ── Content Integrity ── */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Technical & Content Health</h2>
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
              <h3 className="font-bold text-gray-900 mb-4 text-center">Calculated Health Scores</h3>
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
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Keyword Visibility</h2>
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
                  <th className="text-right p-3 font-semibold border-b border-gray-200">CTR</th>
                </tr>
              </thead>
              <tbody>
                {seoMetrics.topKeywords.slice(0, 8).map((kw, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{kw.keyword}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-700">
                        {kw.position}
                      </span>
                    </td>
                    <td className="p-3 text-right text-gray-600">{kw.volume}</td>
                    <td className="p-3 text-right font-medium text-blue-600">{kw.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Footer Nav ── */}
        <section className="pt-8 border-t border-gray-200 flex justify-start">
          <Link
            href="/making-of-tabs/seo/strategy"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            <span className="mr-2">←</span>
            Prev: Strategy Roadmap
          </Link>
        </section>
      </article>
    </main>
  )
}

export default SEODashboardPage
