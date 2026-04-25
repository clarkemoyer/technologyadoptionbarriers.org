import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'
import sensitivityData from '@/data/crp-sensitivity-analysis.json'
import Term from '@/components/glossary-term'
export const metadata: Metadata = {
  title: 'CRP 2026 Scale Reliability - TABS',
  description:
    "Cronbach's alpha reliability coefficients for the Technology Adoption Barriers Survey CRP 2026 frozen dataset across three sample definitions, demonstrating excellent internal consistency.",
  alternates: {
    canonical: '/results/crp-2026/reliability',
  },
}

const CRP_PRIMARY_GROUPS = ['conservative_clean', 'flexible_clean', 'prolific_accepted'] as const

const getMetricValue = (key: string, sample: string): number | null => {
  const metric = sensitivityData.metrics.find((m) => m.key === key)
  if (!metric) return null
  return (metric.values as Record<string, number | null>)[sample] ?? null
}

const fmt = (val: number | null): string => {
  if (val === null) return '-'
  return val.toFixed(4)
}

const CrpReliabilityPage = () => {
  const samples = sensitivityData.samples.filter((s) =>
    (CRP_PRIMARY_GROUPS as readonly string[]).includes(s.key)
  )
  const alphaConstructs = [
    { name: 'Barriers', key: 'alpha_barriers' },
    { name: 'Readiness', key: 'alpha_readiness' },
    { name: 'Maturity', key: 'alpha_maturity' },
  ]

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>CRP 2026: Scale Reliability</h1>

        {/* ── Published Badge ── */}
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            Published: April 2026
          </span>
        </div>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            Scale reliability is assessed using{' '}
            <Term termId="cronbach-alpha">Cronbach&rsquo;s alpha</Term> (&alpha;), the most widely
            used measure of internal consistency. A coefficient of &alpha; &ge; 0.70 is generally
            considered acceptable for research purposes (Nunnally &amp; Bernstein, 1994), while
            values above 0.80 indicate good to excellent reliability.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            All three TABS constructs demonstrate excellent internal consistency across the CRP 2026
            frozen dataset, with every Cronbach&rsquo;s alpha exceeding 0.84 across all three sample
            definitions. This indicates that the survey items within each construct are measuring
            the same underlying factor reliably, regardless of which inclusion criteria are applied.
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
              or the full CRP dataset.
            </li>
            <li>
              Alpha values tend to increase slightly with larger sample sizes, which is expected
              behavior and does not indicate measurement problems.
            </li>
            <li>
              The <strong>Readiness</strong> construct shows the highest alphas (up to{' '}
              {fmt(getMetricValue('alpha_readiness', 'prolific_accepted'))}), while{' '}
              <strong>Maturity</strong> shows the lowest (still above{' '}
              {fmt(getMetricValue('alpha_maturity', 'conservative_clean'))}), which may reflect the
              smaller number of items in the Maturity scale (9 vs. 18-19).
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            The consistency of these results across three sample definitions demonstrates that the
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
              <Link href="/results/crp-2026/descriptive" className="text-blue-600 hover:underline">
                Descriptive Statistics
              </Link>{' '}
              - means, SDs, and correlations for each construct
            </li>
            <li>
              <Link href="/results/crp-2026" className="text-blue-600 hover:underline">
                CRP 2026 Overview
              </Link>{' '}
              - frozen dataset methodology and download
            </li>
            <li>
              <Link href="/results/crp-2026/data-quality" className="text-blue-600 hover:underline">
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

export default CrpReliabilityPage
