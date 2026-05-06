import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'
import sensitivityData from '@/data/sensitivity-analysis.json'
import LastUpdated from '@/components/last-updated'

export const metadata: Metadata = {
  title: 'Descriptive Statistics - TABS Results',
  description:
    'Grand means, standard deviations, and inter-construct correlations for the Technology Adoption Barriers Survey across barriers, readiness, and maturity constructs.',
  alternates: {
    canonical: '/results/descriptive',
  },
}

const getMetricValue = (key: string, sample: string): number | null => {
  const metric = sensitivityData.metrics.find((m) => m.key === key)
  if (!metric) return null
  return (metric.values as Record<string, number | null>)[sample] ?? null
}

const fmt = (val: number | null, decimals: number = 4): string => {
  if (val === null) return '-'
  return val.toFixed(decimals)
}

const DescriptivePage = () => {
  const samples = sensitivityData.samples

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Descriptive Statistics</h1>
        <LastUpdated
          utcTimestamp={(sensitivityData as Record<string, unknown>).last_updated as string}
        />

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This page presents the grand means, standard deviations, and inter-construct
            correlations for the three TABS constructs: Barriers, Readiness, and Maturity. All
            values are computed from the daily analysis pipeline using person-level construct means.
          </p>
        </section>

        {/* ── Barriers ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Barriers</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Barriers construct measures the severity of technology adoption obstacles as
            perceived by organizational leaders. Higher values indicate greater perceived barriers.
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Sample</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">
                    Grand Mean
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">SD</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((sample, i) => (
                  <tr key={sample.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {sample.label} (N={sample.n ?? '-'})
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {fmt(getMetricValue('barrier_mean', sample.key))}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {fmt(getMetricValue('barrier_sd', sample.key))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Readiness ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Readiness</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Readiness construct assesses organizational preparedness for technology adoption.
            Higher values indicate greater self-reported readiness and capability.
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Sample</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">
                    Grand Mean
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">SD</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((sample, i) => (
                  <tr key={sample.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {sample.label} (N={sample.n ?? '-'})
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {fmt(getMetricValue('readiness_mean', sample.key))}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {fmt(getMetricValue('readiness_sd', sample.key))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Maturity ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Maturity</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Maturity construct measures the current level of technology process maturity within
            the organization. Higher values indicate more advanced, formalized technology processes.
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Sample</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">
                    Grand Mean
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">SD</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((sample, i) => (
                  <tr key={sample.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {sample.label} (N={sample.n ?? '-'})
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {fmt(getMetricValue('maturity_mean', sample.key))}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {fmt(getMetricValue('maturity_sd', sample.key))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Inter-Construct Correlations ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Inter-Construct Correlations</h2>
          <p className={PARAGRAPH_CLASSES}>
            The correlation matrices below show the Pearson correlations between construct-level
            means, computed independently on each of the four primary result groups. Negative
            correlations between Barriers and the other constructs indicate that organizations
            perceiving higher barriers tend to report lower readiness and maturity.
          </p>

          {/* One correlation matrix per primary result group */}
          {[
            { key: 'conservative_clean', label: 'Conservative Clean' },
            { key: 'flexible_clean', label: 'Flexible Clean' },
            { key: 'prolific_accepted', label: 'Prolific Accepted' },
            { key: 'v2_finished', label: 'All V2 Finished' },
          ].map((group) => {
            const n = samples.find((s) => s.key === group.key)?.n ?? '-'
            const br = getMetricValue('corr_br', group.key)
            const bm = getMetricValue('corr_bm', group.key)
            const rm = getMetricValue('corr_rm', group.key)
            return (
              <div key={group.key} className="mb-6">
                <h3 className={H3_CLASSES}>
                  {group.label} (N={n})
                </h3>
                <div className="overflow-x-auto my-3">
                  <table className="w-full border-collapse font-sans text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                          Construct
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right font-bold">
                          Barriers
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right font-bold">
                          Readiness
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right font-bold">
                          Maturity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">Barriers</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono bg-gray-100">
                          1.0000
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                          {fmt(br)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                          {fmt(bm)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">Readiness</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                          {fmt(br)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono bg-gray-100">
                          1.0000
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                          {fmt(rm)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">Maturity</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                          {fmt(bm)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                          {fmt(rm)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono bg-gray-100">
                          1.0000
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}

          <p className="text-sm text-gray-500">
            Correlations are Pearson product-moment. See the{' '}
            <Link href="/results/sensitivity" className="text-blue-600 hover:underline">
              Sensitivity Analysis
            </Link>{' '}
            page for the full five-sample comparison including All V2.
          </p>
        </section>

        {/* ── Don't Know Note ── */}
        <section className="mb-12 text-gray-800">
          <h3 className={H3_CLASSES}>Note on &ldquo;Don&rsquo;t Know&rdquo; Responses</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <p className="text-sm text-amber-900">
              The Readiness and Maturity constructs include a &ldquo;Don&rsquo;t Know&rdquo;
              response option. These responses are excluded from scoring - they are treated as
              missing data rather than mapped to a numeric value. This prevents artificial deflation
              of construct means. The Barriers construct does not offer a &ldquo;Don&rsquo;t
              Know&rdquo; option.
            </p>
          </div>
        </section>

        {/* ── Related Pages ── */}
        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Related</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <Link href="/results/reliability" className="text-blue-600 hover:underline">
                Scale Reliability
              </Link>{' '}
              - Cronbach&rsquo;s alpha for each construct
            </li>
            <li>
              <Link href="/results/sensitivity" className="text-blue-600 hover:underline">
                Sensitivity Analysis
              </Link>{' '}
              - robustness across all five sample definitions
            </li>
            <li>
              <Link href="/results/data-quality" className="text-blue-600 hover:underline">
                Data Quality Pipeline
              </Link>{' '}
              - how responses are validated before analysis
            </li>
            <li>
              <Link href="/results" className="text-blue-600 hover:underline">
                &larr; Back to Results Overview
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}

export default DescriptivePage
