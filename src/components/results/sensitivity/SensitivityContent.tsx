import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import LastUpdated from '@/components/last-updated'

type Sample = {
  key: string
  label: string
  description: string
  n: number | null
}

type Metric = {
  key: string
  label: string
  values: Record<string, number | null>
}

export type SensitivityData = {
  samples: Sample[]
  metrics: Metric[]
  last_updated?: string
  extended_last_updated?: string
}

export type SensitivityVariant = 'live' | 'crp'

interface SensitivityContentProps {
  variant: SensitivityVariant
  data: SensitivityData
}

const fmt = (val: number | null | undefined, decimals: number = 4): string => {
  if (val === null || val === undefined) return '-'
  return val.toFixed(decimals)
}

const CRP_SAMPLE_KEYS = ['conservative_clean', 'flexible_clean', 'prolific_accepted']

type ComparisonGroup = { key: string; label: string }

type RelatedLink = { href: string; label: string; description: string }

type VariantConfig = {
  title: string
  metaPublishedLabel?: string
  sampleCountWord: string
  secondarySampleKey: string
  secondarySampleDisplayLabel: string
  sampleDefinitionsIntro: string
  constraints: React.ReactNode
  comparisonGroups: ComparisonGroup[]
  interpretationCloserSampleKey: string
  interpretationCloserPhrase: string
  relatedLinks: RelatedLink[]
  backLink: { href: string; label: string }
}

const VARIANT_CONFIG: Record<SensitivityVariant, VariantConfig> = {
  live: {
    title: 'Sensitivity Analysis',
    sampleCountWord: 'five',
    secondarySampleKey: 'v2_all',
    secondarySampleDisplayLabel: 'All V2',
    sampleDefinitionsIntro:
      'The five sample definitions below are used throughout this analysis. They are nested from most restrictive to least restrictive, with the exception of Prolific Accepted and All V2 Finished, which overlap but neither is a strict subset of the other.',
    constraints: (
      <>
        Constraints: Conservative Clean &sube; Flexible Clean &sube; Prolific Accepted &sube; All
        V2, and All V2 Finished &sube; All V2. Prolific Accepted and All V2 Finished overlap but
        neither is guaranteed to be a subset of the other (Prolific Accepted includes
        INCOMPLETE+APPROVED responses; All V2 Finished includes non-APPROVED responses).
      </>
    ),
    comparisonGroups: [
      { key: 'flexible_clean', label: 'Flexible Clean' },
      { key: 'prolific_accepted', label: 'Prolific Accepted' },
      { key: 'v2_finished', label: 'All V2 Finished' },
    ],
    interpretationCloserSampleKey: 'v2_all',
    interpretationCloserPhrase: 'the full dataset (All V2',
    relatedLinks: [
      {
        href: '/results/descriptive',
        label: 'Descriptive Statistics',
        description: 'Detailed means, SDs, and correlations with interpretation',
      },
      {
        href: '/results/reliability',
        label: 'Scale Reliability',
        description: 'Cronbach’s alpha analysis with references',
      },
      {
        href: '/results/data-quality',
        label: 'Data Quality Pipeline',
        description: 'How sample definitions are computed',
      },
    ],
    backLink: { href: '/results', label: '← Back to Results Overview' },
  },
  crp: {
    title: 'CRP 2026: Sensitivity Analysis',
    metaPublishedLabel: 'Published: April 2026',
    sampleCountWord: 'three',
    secondarySampleKey: 'prolific_accepted',
    secondarySampleDisplayLabel: 'Prolific Accepted',
    sampleDefinitionsIntro:
      'The three primary result groups below are used throughout this analysis. They are nested from most restrictive to least restrictive.',
    constraints: (
      <>Constraints: Conservative Clean &sube; Flexible Clean &sube; Prolific Accepted.</>
    ),
    comparisonGroups: [
      { key: 'flexible_clean', label: 'Flexible Clean' },
      { key: 'prolific_accepted', label: 'Prolific Accepted' },
    ],
    interpretationCloserSampleKey: 'prolific_accepted',
    interpretationCloserPhrase: 'the broadest CRP dataset (Prolific Accepted',
    relatedLinks: [
      {
        href: '/results/crp-2026/descriptive',
        label: 'CRP 2026 Descriptive Statistics',
        description: 'Detailed means, SDs, and correlations with interpretation',
      },
      {
        href: '/results/crp-2026/reliability',
        label: 'CRP 2026 Scale Reliability',
        description: 'Cronbach’s alpha analysis with references',
      },
      {
        href: '/results/crp-2026/sample',
        label: 'CRP 2026 Sample & Demographics',
        description: 'Participant demographics for CRP sample groups',
      },
    ],
    backLink: { href: '/results/crp-2026', label: '← Back to CRP 2026 Results' },
  },
}

export const SensitivityContent = ({ variant, data }: SensitivityContentProps) => {
  const config = VARIANT_CONFIG[variant]
  const allSamples = data.samples
  const samples =
    variant === 'crp' ? allSamples.filter((s) => CRP_SAMPLE_KEYS.includes(s.key)) : allSamples
  const metrics = data.metrics

  const conservativeN = samples.find((s) => s.key === 'conservative_clean')?.n ?? '?'
  const secondaryN = samples.find((s) => s.key === config.secondarySampleKey)?.n ?? '?'
  const interpretationN =
    samples.find((s) => s.key === config.interpretationCloserSampleKey)?.n ?? '?'

  const primaryKey = 'conservative_clean'

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>{config.title}</h1>
        {variant === 'crp' ? (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            {config.metaPublishedLabel}
          </span>
        ) : (
          <LastUpdated utcTimestamp={data.last_updated} />
        )}

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            Sensitivity analysis tests whether findings are robust to the choice of inclusion
            criteria. Every key metric - means, standard deviations, inter-construct correlations,
            and reliability coefficients - is computed independently across {config.sampleCountWord}{' '}
            {variant === 'crp' ? 'CRP sample definitions' : 'nested sample definitions'}. If a
            finding holds across Conservative Clean (N=
            {conservativeN}) and {config.secondarySampleDisplayLabel} (N={secondaryN}), it is robust
            to inclusion criteria.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sample Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>{config.sampleDefinitionsIntro}</p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Key
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Label
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Description
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
                    N
                  </th>
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
          <p className="text-sm text-gray-500">{config.constraints}</p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Full Sensitivity Table</h2>
          <p className={PARAGRAPH_CLASSES}>
            The table below shows every metric computed across all {config.sampleCountWord} sample
            definitions. Values are formatted to four decimal places. Means, standard deviations,
            correlations, and Cronbach&rsquo;s alpha coefficients are all included.
          </p>
          {metrics.length > 0 && metrics.some((m) => Object.keys(m.values).length > 0) && (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse font-sans text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      scope="col"
                      className="border border-gray-300 px-4 py-2 text-left font-bold"
                    >
                      Metric
                    </th>
                    {samples.map((s) => (
                      <th
                        key={s.key}
                        scope="col"
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
                      <th
                        scope="row"
                        className="border border-gray-300 px-4 py-2 font-medium text-left"
                      >
                        {metric.label}
                      </th>
                      {samples.map((s) => (
                        <td
                          key={s.key}
                          className="border border-gray-300 px-4 py-2 text-right font-mono"
                        >
                          {fmt(metric.values[s.key] ?? null, 4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Dataset Comparison</h2>
          <p className={PARAGRAPH_CLASSES}>
            The table below shows how each metric changes as inclusion criteria are relaxed. The
            &Delta; columns show the difference from Conservative Clean (the primary analysis
            dataset) to each progressively less restrictive dataset. Small deltas confirm that
            findings are not artifacts of a particular data cleaning strategy.
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Metric
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
                    Conservative
                    <br />
                    <span className="font-normal text-gray-500">
                      N=
                      {samples.find((s) => s.key === primaryKey)?.n ?? '?'}
                    </span>
                  </th>
                  {config.comparisonGroups.map((g) => (
                    <th
                      key={g.key}
                      scope="col"
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
                  const baseVal = metric.values[primaryKey] ?? null
                  return (
                    <tr key={metric.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                      <th
                        scope="row"
                        className="border border-gray-300 px-4 py-2 font-medium text-left"
                      >
                        {metric.label}
                      </th>
                      <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                        {fmt(baseVal, 4)}
                      </td>
                      {config.comparisonGroups.map((g) => {
                        const compVal = metric.values[g.key] ?? null
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
                            {delta !== null ? `${delta >= 0 ? '+' : ''}${delta.toFixed(4)}` : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500">
            Deltas highlighted in amber exceed 0.05 scale points. Correlation and reliability
            differences of this magnitude are expected when adding noisier data but do not change
            substantive conclusions.
          </p>
        </section>

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
            strictest quality filters (Conservative Clean, N={conservativeN}) or{' '}
            {config.interpretationCloserPhrase}, N={interpretationN}), the same substantive
            conclusions hold.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Related Pages</h2>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            {config.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-blue-600 hover:underline">
                  {link.label}
                </Link>{' '}
                - {link.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <Link href="/results/reproducibility" className="text-blue-600 hover:underline">
              Open Data &amp; Reproducibility
            </Link>{' '}
            - download the dataset and reproduce these results yourself.{' '}
            <Link href={config.backLink.href} className="text-blue-600 hover:underline">
              {config.backLink.label}
            </Link>
          </p>
        </section>
      </article>
    </div>
  )
}
