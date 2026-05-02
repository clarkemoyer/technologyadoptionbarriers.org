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
import liveValidationData from '@/data/live-validation.json'
import LastUpdated from '@/components/last-updated'
import Term from '@/components/glossary-term'
import {
  ExtendedReliabilitySections,
  type ExtendedReliabilityProps,
} from '@/components/results/reliability/ExtendedReliabilitySections'

export const metadata: Metadata = {
  title: 'Scale Reliability - TABS Results',
  description:
    "Cronbach's alpha reliability coefficients for the Technology Adoption Barriers Survey scales across five sample definitions, demonstrating excellent internal consistency.",
  alternates: {
    canonical: '/results/reliability',
  },
}

const getMetricValue = (key: string, sample: string): number | null => {
  const metric = sensitivityData.metrics.find((m) => m.key === key)
  if (!metric) return null
  return (metric.values as Record<string, number | null>)[sample] ?? null
}

const fmt = (val: number | null): string => {
  if (val === null) return '-'
  return val.toFixed(4)
}

type ValidationLike = {
  samples?: Array<Record<string, unknown>>
  primary_sample?: string
}

const findPrimarySample = (data: ValidationLike): Record<string, unknown> | null => {
  if (!data || !Array.isArray(data.samples) || data.samples.length === 0) return null
  if (data.primary_sample) {
    const match = data.samples.find((s) => s.key === data.primary_sample)
    if (match) return match
  }
  return data.samples[0] ?? null
}

const ReliabilityPage = () => {
  const samples = sensitivityData.samples
  const alphaConstructs = [
    { name: 'Barriers', key: 'alpha_barriers' },
    { name: 'Readiness', key: 'alpha_readiness' },
    { name: 'Maturity', key: 'alpha_maturity' },
  ]

  // Pull the new keys (PR #1837) from live-validation.json's primary sample
  const primarySample = findPrimarySample(liveValidationData as unknown as ValidationLike)
  const extendedProps: ExtendedReliabilityProps = primarySample
    ? {
        bootstrap: primarySample.bootstrap_alpha_ci as ExtendedReliabilityProps['bootstrap'],
        alphaIfDeleted:
          primarySample.alpha_if_deleted_summary as ExtendedReliabilityProps['alphaIfDeleted'],
        reliabilityByDemo:
          primarySample.reliability_by_demo as ExtendedReliabilityProps['reliabilityByDemo'],
      }
    : {}

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Scale Reliability</h1>
        <LastUpdated
          utcTimestamp={(sensitivityData as Record<string, unknown>).last_updated as string}
        />

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            Scale reliability is assessed using{' '}
            <Term termId="cronbach-alpha">Cronbach&rsquo;s alpha</Term> (&alpha;), the most widely
            used measure of internal consistency. A coefficient of &alpha; &ge; 0.70 is generally
            considered acceptable for research purposes (Nunnally &amp; Bernstein, 1994), while
            values above 0.80 indicate good to excellent reliability.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            All three TABS constructs demonstrate excellent internal consistency, with every
            Cronbach&rsquo;s alpha exceeding 0.84 across all five sample definitions. This indicates
            that the survey items within each construct are measuring the same underlying factor
            reliably, regardless of which inclusion criteria are applied.
          </p>
        </section>

        {/* ── Alpha Table ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Cronbach&rsquo;s Alpha by Construct and Sample</h2>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Construct
                  </th>
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
                {alphaConstructs.map((construct, i) => (
                  <tr key={construct.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {construct.name}
                    </td>
                    {samples.map((s) => (
                      <td
                        key={s.key}
                        className="border border-gray-300 px-4 py-2 text-right font-mono"
                      >
                        {fmt(getMetricValue(construct.key, s.key))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Extended Reliability (PR #1837 / issue #1839) ── */}
        <ExtendedReliabilitySections {...extendedProps} />

        {/* ── Interpretation ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Interpretation</h2>
          <p className={PARAGRAPH_CLASSES}>
            Several key observations emerge from the reliability analysis:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              All alphas exceed <strong>0.84</strong>, well above the commonly cited 0.70 threshold,
              indicating excellent internal consistency across all constructs and samples.
            </li>
            <li>
              Reliability coefficients are <strong>stable across sample definitions</strong>,
              meaning the scales perform consistently whether computed on the strictest clean sample
              or the full dataset.
            </li>
            <li>
              Alpha values tend to increase slightly with larger sample sizes, which is expected
              behavior and does not indicate measurement problems.
            </li>
            <li>
              The <strong>Readiness</strong> construct shows the highest alphas (up to{' '}
              {fmt(getMetricValue('alpha_readiness', 'v2_finished'))}), while{' '}
              <strong>Maturity</strong> shows the lowest (still above{' '}
              {fmt(getMetricValue('alpha_maturity', 'conservative_clean'))}), which may reflect the
              smaller number of items in the Maturity scale (9 vs. 18-19).
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            The consistency of these results across five sample definitions demonstrates that the
            TABS scales are reliable instruments regardless of the inclusion criteria applied. This
            robustness is critical for supporting any downstream inferential analyses.
          </p>
        </section>

        {/* ── References ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>References</h2>
          <ol className="list-decimal pl-5 text-sm sm:text-base text-gray-600 space-y-3 font-sans">
            <li>
              Cronbach, L. J. (1951). Coefficient alpha and the internal structure of tests.{' '}
              <em>Psychometrika</em>, 16(3), 297-334.
            </li>
            <li>
              Nunnally, J. C., &amp; Bernstein, I. H. (1994). <em>Psychometric theory</em> (3rd
              ed.). McGraw-Hill.
            </li>
          </ol>
        </section>

        {/* ── Related Pages ── */}
        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Related</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <Link href="/results/descriptive" className="text-blue-600 hover:underline">
                Descriptive Statistics
              </Link>{' '}
              - means, SDs, and correlations for each construct
            </li>
            <li>
              <Link href="/results/sensitivity" className="text-blue-600 hover:underline">
                Sensitivity Analysis
              </Link>{' '}
              - all metrics across five sample definitions
            </li>
            <li>
              <Link href="/results/data-quality" className="text-blue-600 hover:underline">
                Data Quality Pipeline
              </Link>{' '}
              - how the samples are defined and validated
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

export default ReliabilityPage
