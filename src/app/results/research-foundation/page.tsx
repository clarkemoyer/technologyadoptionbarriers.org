import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  PARAGRAPH_CLASSES,
  SECTION_CLASSES,
} from '@/lib/articleStyles'
import LastUpdated from '@/components/last-updated'
import citationMetricsRaw from '@/data/citation-metrics.json'

export const metadata: Metadata = {
  title: 'Research Foundation — TABS Results',
  description:
    'Citation metrics and literature scope for the Technology Adoption Barriers Survey: total references, unique journals, date range, item types, and top collections from the Zotero library.',
  alternates: {
    canonical: '/results/research-foundation',
  },
}

interface ItemType {
  type: string
  count: number
}

interface Collection {
  name: string
  count: number
}

interface CitationMetrics {
  updatedAt: string
  totalReferences: number
  uniqueJournals: number
  dateRange: { earliest: number | null; latest: number | null }
  itemTypes: ItemType[]
  topCollections: Collection[]
}

const data = citationMetricsRaw as CitationMetrics

const fmt = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString()
}

const ResearchFoundationPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/results" className="hover:text-blue-600 hover:underline">
                Results
              </Link>
              <span className="mx-2" aria-hidden="true">
                &rsaquo;
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Research Foundation
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Research Foundation</h1>
        <LastUpdated utcTimestamp={data.updatedAt} />

        <section className={`${SECTION_CLASSES} mt-6`}>
          <p className={PARAGRAPH_CLASSES}>
            The Technology Adoption Barriers Survey draws on a curated Zotero library of academic
            references spanning decades of technology adoption research. The metrics below reflect
            the breadth and depth of that literature base and are refreshed automatically whenever
            the library is updated.
          </p>
        </section>

        {/* ── Hero Stats ── */}
        <section className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total References', value: fmt(data.totalReferences) },
              { label: 'Unique Journals', value: fmt(data.uniqueJournals) },
              {
                label: 'Earliest Publication',
                value: data.dateRange?.earliest ? String(data.dateRange.earliest) : '—',
              },
              {
                label: 'Most Recent Publication',
                value: data.dateRange?.latest ? String(data.dateRange.latest) : '—',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-tabs-teal-deep font-mono">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Item Types ── */}
        {data.itemTypes && data.itemTypes.length > 0 && (
          <section className={SECTION_CLASSES}>
            <h2 className={H2_CLASSES}>Reference Types</h2>
            <p className={PARAGRAPH_CLASSES}>
              Breakdown of reference types across the Zotero library.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm font-sans rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b">Type</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b text-right">
                      Count
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b text-right">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.itemTypes.map((row, i) => {
                    const share =
                      data.totalReferences > 0
                        ? ((row.count / data.totalReferences) * 100).toFixed(1)
                        : '—'
                    return (
                      <tr key={row.type} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 border-b text-gray-800">{row.type}</td>
                        <td className="px-4 py-2 border-b text-right font-mono text-gray-800">
                          {fmt(row.count)}
                        </td>
                        <td className="px-4 py-2 border-b text-right text-gray-500">{share}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Top Collections ── */}
        {data.topCollections && data.topCollections.length > 0 && (
          <section className={SECTION_CLASSES}>
            <h2 className={H2_CLASSES}>Top Collections</h2>
            <p className={PARAGRAPH_CLASSES}>
              The largest subcollections in the library by item count.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm font-sans rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b">Collection</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b text-right">
                      Items
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCollections.map((col, i) => (
                    <tr key={col.name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 border-b text-gray-800">{col.name}</td>
                      <td className="px-4 py-2 border-b text-right font-mono text-gray-800">
                        {fmt(col.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {data.totalReferences === 0 && (
          <section className={SECTION_CLASSES}>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-6 text-sm text-amber-900">
              <p className="font-semibold mb-1">Data not yet available</p>
              <p>
                Citation metrics are generated automatically from the Zotero library. Data will
                appear here after the first scheduled workflow run.
              </p>
            </div>
          </section>
        )}

        {/* ── Methodology note ── */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>About This Data</h2>
          <p className={PARAGRAPH_CLASSES}>
            These metrics are generated automatically by the{' '}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
              fetch-zotero-citations.py
            </code>{' '}
            script, which connects to the TABS Zotero group library via the{' '}
            <a
              href="https://pyzotero.readthedocs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              pyzotero
            </a>{' '}
            API client. The workflow runs on a weekly schedule and on every manual dispatch.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Counts reflect top-level reference items only — attachments, notes, and annotations are
            excluded. The &ldquo;Unique Journals&rdquo; figure counts distinct{' '}
            <em>Publication Title</em> values across all journal articles in the library.
          </p>
        </section>

        {/* ── Navigation ── */}
        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <Link href="/results" className="text-blue-600 hover:underline">
              &larr; Back to Results Overview
            </Link>
          </p>
        </section>
      </article>
    </main>
  )
}

export default ResearchFoundationPage
