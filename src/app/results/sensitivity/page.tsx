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
import LastUpdated from '@/components/last-updated'
export const metadata: Metadata = {
  title: 'Sensitivity Analysis - TABS Results',
  description:
    'Full sensitivity analysis for the Technology Adoption Barriers Survey: every metric computed across five sample definitions to demonstrate robustness to inclusion criteria.',
  alternates: {
    canonical: '/results/sensitivity',
  },
}

const fmt = (val: number | null | undefined, decimals: number = 4): string => {
  if (val === null || val === undefined) return '-'
  return val.toFixed(decimals)
}

const SensitivityPage = () => {
  const samples = sensitivityData.samples
  const metrics = sensitivityData.metrics

  const conservativeN = samples.find((s) => s.key === 'conservative_clean')?.n ?? '?'
  const v2AllN = samples.find((s) => s.key === 'v2_all')?.n ?? '?'

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Sensitivity Analysis</h1>
        <LastUpdated
          utcTimestamp={(sensitivityData as Record<string, unknown>).last_updated as string}
        />

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            Sensitivity analysis tests whether findings are robust to the choice of inclusion
            criteria. Every key metric - means, standard deviations, inter-construct correlations,
            and reliability coefficients - is computed independently across five nested sample
            definitions. If a finding holds across Conservative Clean (N=
            {conservativeN}) and All V2 (N={v2AllN}), it is robust to inclusion criteria.
          </p>
        </section>

        {/* ── Sample Definitions ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sample Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The five sample definitions below are used throughout this analysis. They are nested
            from most restrictive to least restrictive, with the exception of Prolific Accepted and
            All V2 Finished, which overlap but neither is a strict subset of the other.
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Key</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Label</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">N</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((sample, i) => (
                  <tr key={sample.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-mono text-xs">
                      {sample.key}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{sample.label}</td>
                    <td className="border border-gray-300 px-4 py-2">{sample.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {sample.n ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500">
            Constraints: Conservative Clean &sube; Flexible Clean &sube; Prolific Accepted &sube;
            All V2, and All V2 Finished &sube; All V2. Prolific Accepted and All V2 Finished overlap
            but neither is guaranteed to be a subset of the other (Prolific Accepted includes
            INCOMPLETE+APPROVED responses; All V2 Finished includes non-APPROVED responses).
          </p>
        </section>

        {/* ── Full Sensitivity Table ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Full Sensitivity Table</h2>
          <p className={PARAGRAPH_CLASSES}>
            The table below shows every metric computed across all five sample definitions. Values
            are formatted to four decimal places. Means, standard deviations, correlations, and
            Cronbach&rsquo;s alpha coefficients are all included.
          </p>
          {metrics.length > 0 && metrics.some((m) => Object.keys(m.values).length > 0) && (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse font-sans text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left font-bold">Metric</th>
                    {samples.map((s) => (
                      <th
                        key={s.key}
                        className="border border-gray-300 px-4 py-2 text-right font-bold"
                      >
                        {s.label}
                        <br />
                        <span className="font-normal text-gray-500">N={s.n ?? '?'}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, i) => (
                    <tr key={metric.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {metric.label}
                      </td>
                      {samples.map((s) => (
                        <td
                          key={s.key}
                          className="border border-gray-300 px-4 py-2 text-right font-mono"
                        >
                          {fmt((metric.values as Record<string, number | null>)[s.key] ?? null, 4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Dataset Comparison (Deltas) ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Dataset Comparison</h2>
          <p className={PARAGRAPH_CLASSES}>
            The table below shows how each metric changes as inclusion criteria are relaxed. The
            &Delta; columns show the difference from Conservative Clean (the primary analysis
            dataset) to each progressively less restrictive dataset. Small deltas confirm that
            findings are not artifacts of a particular data cleaning strategy.
          </p>
          {(() => {
            const primaryKey = 'conservative_clean'
            const comparisonGroups = [
              { key: 'flexible_clean', label: 'Flexible Clean' },
              { key: 'prolific_accepted', label: 'Prolific Accepted' },
              { key: 'v2_finished', label: 'All V2 Finished' },
            ]
            return (
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                        Metric
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-bold">
                        Conservative
                        <br />
                        <span className="font-normal text-gray-500">
                          N=
                          {samples.find((s) => s.key === primaryKey)?.n ?? '?'}
                        </span>
                      </th>
                      {comparisonGroups.map((g) => (
                        <th
                          key={g.key}
                          className="border border-gray-300 px-4 py-2 text-right font-bold"
                        >
                          &Delta; {g.label}
                          <br />
                          <span className="font-normal text-gray-500">
                            N={samples.find((s) => s.key === g.key)?.n ?? '?'}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric, i) => {
                      const baseVal = (metric.values as Record<string, number | null>)[
                        primaryKey
                      ] as number | null
                      return (
                        <tr key={metric.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {metric.label}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                            {fmt(baseVal, 4)}
                          </td>
                          {comparisonGroups.map((g) => {
                            const compVal = (metric.values as Record<string, number | null>)[
                              g.key
                            ] as number | null
                            const delta =
                              baseVal !== null && compVal !== null ? compVal - baseVal : null
                            return (
                              <td
                                key={g.key}
                                className={`border border-gray-300 px-4 py-2 text-right font-mono ${
                                  delta !== null && Math.abs(delta) > 0.05
                                    ? 'text-amber-700 font-semibold'
                                    : 'text-gray-600'
                                }`}
                              >
                                {delta !== null
                                  ? `${delta >= 0 ? '+' : ''}${delta.toFixed(4)}`
                                  : '-'}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })()}
          <p className="text-sm text-gray-500">
            Deltas highlighted in amber exceed 0.05 scale points. Correlation and reliability
            differences of this magnitude are expected when adding noisier data but do not change
            substantive conclusions.
          </p>
        </section>

        {/* ── Narrative ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Interpretation</h2>
          <p className={PARAGRAPH_CLASSES}>
            The sensitivity analysis reveals remarkable stability across inclusion criteria. Key
            observations:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Construct means</strong> are highly stable, with differences of less than 0.10
              scale points between the most and least restrictive samples.
            </li>
            <li>
              <strong>Standard deviations</strong> increase slightly with less restrictive samples,
              as expected when including noisier data.
            </li>
            <li>
              <strong>Correlations</strong> between constructs are directionally consistent across
              all samples (Barriers negatively correlated with Readiness and Maturity; Readiness and
              Maturity positively correlated).
            </li>
            <li>
              <strong>Cronbach&rsquo;s alpha</strong> values remain excellent (&gt; 0.84) across all
              samples, indicating robust internal consistency regardless of inclusion criteria.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            These findings demonstrate that the core results of the Technology Adoption Barriers
            Survey are not artifacts of a particular data cleaning strategy. Whether using the
            strictest quality filters (Conservative Clean, N={conservativeN}) or the full dataset
            (All V2, N={v2AllN}), the same substantive conclusions hold.
          </p>
        </section>

        {/* ── Related Pages ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Related Pages</h2>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <Link href="/results/descriptive" className="text-blue-600 hover:underline">
                Descriptive Statistics
              </Link>{' '}
              - Detailed means, SDs, and correlations with interpretation
            </li>
            <li>
              <Link href="/results/reliability" className="text-blue-600 hover:underline">
                Scale Reliability
              </Link>{' '}
              - Cronbach&rsquo;s alpha analysis with references
            </li>
            <li>
              <Link href="/results/data-quality" className="text-blue-600 hover:underline">
                Data Quality Pipeline
              </Link>{' '}
              - How sample definitions are computed
            </li>
          </ul>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <Link href="/results/reproducibility" className="text-blue-600 hover:underline">
              Open Data &amp; Reproducibility
            </Link>{' '}
            - download the dataset and reproduce these results yourself.{' '}
            <Link href="/results" className="text-blue-600 hover:underline">
              &larr; Back to Results Overview
            </Link>
          </p>
        </section>
      </article>
    </div>
  )
}

export default SensitivityPage
