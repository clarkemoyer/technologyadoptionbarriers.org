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
  title: 'Website Citation Library — Making of TABS',
  description:
    'The references behind the TABS website: metrics from the "TABS Website Citations" Zotero collection including total items, unique journals, date range, item types, and top subcollections.',
  alternates: {
    canonical: '/making-of-tabs/zotero-citations',
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

const ZoteroCitationsPage = () => {
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
                &rsaquo;
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Website Citation Library
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Website Citation Library</h1>
        <LastUpdated utcTimestamp={data.updatedAt} />

        <section className={`${SECTION_CLASSES} mt-6`}>
          <p className={PARAGRAPH_CLASSES}>
            Every claim on the TABS website is grounded in peer-reviewed literature. We maintain a
            curated Zotero collection called <strong>TABS Website Citations</strong> that holds the
            references behind the site&rsquo;s pages, articles, and methodology descriptions. The
            metrics below reflect the scope of that collection and are refreshed automatically each
            week.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This is distinct from the broader TABS research library. It covers only the literature
            we actively cite on this website &mdash; the works that inform our framing, definitions,
            and interpretive claims.
          </p>
        </section>

        {/* ---- Hero Stats ---- */}
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

        {/* ---- Item Types ---- */}
        {data.itemTypes && data.itemTypes.length > 0 && (
          <section className={SECTION_CLASSES}>
            <h2 className={H2_CLASSES}>Reference Types</h2>
            <p className={PARAGRAPH_CLASSES}>
              Breakdown of reference types in the TABS Website Citations collection.
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

        {/* ---- Top Subcollections ---- */}
        {data.topCollections && data.topCollections.length > 0 && (
          <section className={SECTION_CLASSES}>
            <h2 className={H2_CLASSES}>Top Subcollections</h2>
            <p className={PARAGRAPH_CLASSES}>
              The largest subcollections within TABS Website Citations by item count.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm font-sans rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b">
                      Subcollection
                    </th>
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

        {/* ---- Empty state ---- */}
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

        {/* ---- How This Works ---- */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>How This Works</h2>
          <p className={PARAGRAPH_CLASSES}>
            A weekly GitHub Actions workflow runs{' '}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
              scripts/fetch-zotero-citations.py
            </code>
            , which connects to the TABS Zotero group library via{' '}
            <a
              href="https://pyzotero.readthedocs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              pyzotero
            </a>
            . The script scopes its query to the <strong>TABS Website Citations</strong>{' '}
            subcollection and all items nested within it, then writes the aggregated metrics to{' '}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
              src/data/citation-metrics.json
            </code>
            .
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The workflow runs on a weekly schedule (Mondays at 06:00 UTC) and can also be triggered
            manually. Results are committed as an auto-merged pull request so the update is
            version-controlled and reviewable.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Counts reflect top-level reference items only &mdash; attachments, notes, and
            annotations are excluded. The &ldquo;Unique Journals&rdquo; figure counts distinct{' '}
            <em>Publication Title</em> values across all journal articles in the collection.
          </p>
        </section>

        {/* ---- Navigation ---- */}
        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <Link href="/making-of-tabs" className="text-blue-600 hover:underline">
              &larr; Back to Making of TABS
            </Link>
          </p>
        </section>
      </article>
    </main>
  )
}

export default ZoteroCitationsPage
