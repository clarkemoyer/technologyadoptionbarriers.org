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
import demographicsData from '@/data/demographics.json'

export const metadata: Metadata = {
  title: 'Sample & Demographics — TABS Results',
  description:
    'Participant demographics for the Technology Adoption Barriers Survey: age, gender, country, and employment breakdown of Prolific participants.',
  alternates: {
    canonical: '/results/sample',
  },
}

type DemoCategory = { label: string; count: number; pct: number }
type AgeRange = { range: string; count: number | null; pct: number | null }

const fmt = (n: number | null | undefined): string =>
  n === null || n === undefined ? '—' : n.toLocaleString()

const fmtPct = (p: number | null | undefined): string =>
  p === null || p === undefined ? '—' : `${p.toFixed(1)}%`

/** Horizontal bar chart rendered with pure CSS/Tailwind. */
const BarChart = ({ categories }: { categories: DemoCategory[] }) => {
  if (!categories || categories.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">Data will appear after the next pipeline run.</p>
    )
  }
  const max = Math.max(...categories.map((c) => c.count))
  return (
    <div className="space-y-2 my-4">
      {categories.map((cat) => (
        <div key={cat.label} className="flex items-center gap-3 text-sm">
          <div
            className="w-36 sm:w-48 shrink-0 text-right text-gray-700 truncate"
            title={cat.label}
          >
            {cat.label}
          </div>
          <div className="flex-1 bg-gray-100 rounded h-5 overflow-hidden">
            <div
              className="h-5 bg-tabs-teal-deep rounded"
              style={{ width: max > 0 ? `${(cat.count / max) * 100}%` : '0%' }}
              aria-label={`${cat.label}: ${cat.count} (${fmtPct(cat.pct)})`}
            />
          </div>
          <div className="w-20 shrink-0 text-gray-600 font-mono text-xs">
            {fmt(cat.count)} <span className="text-gray-400">({fmtPct(cat.pct)})</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const SamplePage = () => {
  const conservativeSample = sensitivityData.samples.find((s) => s.key === 'conservative_clean')
  const flexibleSample = sensitivityData.samples.find((s) => s.key === 'flexible_clean')
  const prolificSample = sensitivityData.samples.find((s) => s.key === 'prolific_accepted')
  const v2FinishedSample = sensitivityData.samples.find((s) => s.key === 'v2_finished')
  const v2AllSample = sensitivityData.samples.find((s) => s.key === 'v2_all')

  const demo = demographicsData
  const hasDemo = !!demo.totalParticipants
  const ageRanges: AgeRange[] = Array.isArray(demo.age?.ranges)
    ? (demo.age.ranges as AgeRange[])
    : []
  const genderCats: DemoCategory[] = Array.isArray(demo.gender?.categories)
    ? (demo.gender.categories as DemoCategory[])
    : []
  const countryCats: DemoCategory[] = Array.isArray(demo.country?.categories)
    ? (demo.country.categories as DemoCategory[])
    : []
  const employmentCats: DemoCategory[] = Array.isArray(demo.employmentStatus?.categories)
    ? (demo.employmentStatus.categories as DemoCategory[])
    : []

  // Compute age bar max once (not inside the render loop)
  const validAgeRanges = ageRanges.filter((x) => x.count !== null)
  const ageBarMax =
    validAgeRanges.length > 0 ? Math.max(...validAgeRanges.map((x) => x.count as number)) : 0

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
            This page documents who participated in the TABS survey. Sample sizes are reported
            across five inclusion-criteria definitions. Prolific platform demographics (age, gender,
            country, employment) are aggregated from the Prolific bulk export — no individual-level
            data is stored or displayed.
          </p>
          {!hasDemo && (
            <p className={PARAGRAPH_CLASSES}>
              Prolific platform demographics will be displayed here once the demographics pipeline
              has run. Survey demographics (role, industry, org size) appear in the{' '}
              <Link href="/results/data-quality" className="text-blue-600 hover:underline">
                Data Quality
              </Link>{' '}
              page.
            </p>
          )}
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
              ...(hasDemo
                ? [
                    {
                      label: 'Mean Age (Prolific)',
                      value: demo.age?.mean != null ? String(demo.age.mean) : '—',
                    },
                  ]
                : []),
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

        {/* ── Sample Size Summary ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sample Size Summary</h2>
          <p className={PARAGRAPH_CLASSES}>
            The table below shows the number of respondents in each of the five sample definitions
            used throughout the analysis. Definitions range from the most restrictive (Conservative
            Clean) to the least restrictive (All V2).
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

        {/* ── Prolific Platform Demographics ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Prolific Platform Demographics</h2>
          <p className={PARAGRAPH_CLASSES}>
            Demographics below are sourced from Prolific participant profiles (<em>not</em> from
            survey responses). They describe the platform-level characteristics of approved
            participants (N&nbsp;=&nbsp;{fmt(demo.totalParticipants ?? prolificSample?.n)}). All
            counts are aggregated; cells with fewer than 5 participants are merged into &ldquo;Other
            / Prefer not to say&rdquo;.
          </p>

          {/* Age distribution */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Age Distribution
              {demo.age?.mean != null && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  Mean: {demo.age.mean}, Median: {demo.age.median ?? '—'}
                </span>
              )}
            </h3>
            {ageRanges.length > 0 ? (
              <div className="space-y-2 my-4">
                {ageRanges.map((r) => (
                  <div key={r.range} className="flex items-center gap-3 text-sm">
                    <div className="w-16 shrink-0 text-right text-gray-700 font-mono">
                      {r.range}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded h-5 overflow-hidden">
                      {r.count !== null && ageBarMax > 0 ? (
                        <div
                          className="h-5 bg-tabs-teal-deep rounded"
                          style={{ width: `${(r.count / ageBarMax) * 100}%` }}
                          aria-label={`${r.range}: ${r.count} (${fmtPct(r.pct)})`}
                        />
                      ) : (
                        <div
                          className="h-5 bg-gray-200 rounded"
                          title="Suppressed: fewer than 5 participants"
                        />
                      )}
                    </div>
                    <div className="w-28 shrink-0 text-gray-600 font-mono text-xs">
                      {r.count !== null ? (
                        <>
                          {fmt(r.count)} <span className="text-gray-400">({fmtPct(r.pct)})</span>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">suppressed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic my-4">
                Age data will appear after the next pipeline run.
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Gender</h3>
            <BarChart categories={genderCats} />
          </div>

          {/* Country */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Country of Residence{' '}
              <span className="text-sm font-normal text-gray-500">(top 10)</span>
            </h3>
            <BarChart categories={countryCats} />
          </div>

          {/* Employment status */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Employment Status</h3>
            <BarChart categories={employmentCats} />
          </div>
        </section>

        {/* ── Privacy Note ── */}
        <section className="mb-12 text-gray-800">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-900">
              <strong>Privacy Note:</strong>{' '}
              {demo.privacyNote ??
                'Demographics data is collected via Prolific and aggregated to protect participant privacy. No individual-level data is displayed. All demographic breakdowns use category-level counts and percentages only.'}
            </p>
            {hasDemo && demo.generatedAt && (
              <p className="text-xs text-blue-700 mt-2">
                Last updated:{' '}
                {new Date(demo.generatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
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
