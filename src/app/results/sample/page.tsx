import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'
import sensitivityData from '@/data/sensitivity-analysis.json'

export const metadata: Metadata = {
  title: 'Sample & Demographics — TABS Results',
  description:
    'Participant demographics for the Technology Adoption Barriers Survey: roles, industries, organization sizes, and geographic distribution.',
  alternates: {
    canonical: '/results/sample',
  },
}

const SamplePage = () => {
  const conservativeSample = sensitivityData.samples.find((s) => s.key === 'conservative_clean')
  const flexibleSample = sensitivityData.samples.find((s) => s.key === 'flexible_clean')
  const prolificSample = sensitivityData.samples.find((s) => s.key === 'prolific_accepted')
  const v2FinishedSample = sensitivityData.samples.find((s) => s.key === 'v2_finished')
  const v2AllSample = sensitivityData.samples.find((s) => s.key === 'v2_all')

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
              Sample &amp; Demographics
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Sample &amp; Demographics</h1>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This page will present a detailed breakdown of participant demographics once the
            demographics pipeline is ready. The TABS survey collects information about
            respondents&rsquo; roles, industries, organization sizes, and geographic distribution to
            contextualize findings and assess generalizability.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Demographic breakdowns &mdash; including job function, industry sector, organization
            size, and country &mdash; are currently being processed and will be displayed here when
            the automated pipeline is complete.
          </p>
        </section>

        {/* ── Sample Size Summary ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sample Size Summary</h2>
          <p className={PARAGRAPH_CLASSES}>
            The table below shows the number of respondents in each of the five sample definitions
            used throughout the analysis. Sample definitions range from the most restrictive
            (Conservative Clean) to the least restrictive (All V2).
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Sample</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">N</th>
                </tr>
              </thead>
              <tbody>
                {sensitivityData.samples.map((sample, i) => (
                  <tr key={sample.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{sample.label}</td>
                    <td className="border border-gray-300 px-4 py-2">{sample.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {sample.n ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Key Numbers ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Key Numbers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
            {[
              { label: 'Total Responses', value: String(v2AllSample?.n ?? '—') },
              { label: 'Finished Responses', value: String(v2FinishedSample?.n ?? '—') },
              { label: 'Prolific Approved', value: String(prolificSample?.n ?? '—') },
              { label: 'Flexible Clean', value: String(flexibleSample?.n ?? '—') },
              { label: 'Conservative Clean', value: String(conservativeSample?.n ?? '—') },
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

        {/* ── Privacy Note ── */}
        <section className="mb-12 text-gray-800">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-900">
              <strong>Privacy Note:</strong> Demographics data is collected via Prolific and
              aggregated to protect participant privacy. No individual-level data is displayed. All
              demographic breakdowns use category-level counts and percentages only.
            </p>
          </div>
        </section>

        {/* ── Related Pages ── */}
        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Related</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <Link href="/results/descriptive" className="text-blue-600 hover:underline">
                Descriptive Statistics
              </Link>{' '}
              &mdash; what participants reported across all three constructs
            </li>
            <li>
              <Link href="/results/data-quality" className="text-blue-600 hover:underline">
                Data Quality Pipeline
              </Link>{' '}
              &mdash; how responses are validated and samples defined
            </li>
            <li>
              <Link href="/results" className="text-blue-600 hover:underline">
                &larr; Back to Results Overview
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </main>
  )
}

export default SamplePage
