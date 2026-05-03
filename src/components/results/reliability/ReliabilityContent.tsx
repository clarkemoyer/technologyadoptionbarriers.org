import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import LastUpdated from '@/components/last-updated'
import Term from '@/components/glossary-term'
import {
  ExtendedReliabilitySections,
  type ExtendedReliabilityProps,
} from '@/components/results/reliability/ExtendedReliabilitySections'
import { findPrimarySample, type ValidationLike } from '@/lib/results/findPrimarySample'

type Sample = {
  key: string
  label: string
  description?: string
  n: number | null
}

type Metric = {
  key: string
  label?: string
  values: Record<string, number | null>
}

export type ReliabilityData = {
  samples: Sample[]
  metrics: Metric[]
  last_updated?: string
}

export type ReliabilityVariant = 'live' | 'crp'

interface ReliabilityContentProps {
  variant: ReliabilityVariant
  data: ReliabilityData
  validationData: ValidationLike
}

const fmt = (val: number | null): string => {
  if (val === null) return '-'
  return val.toFixed(4)
}

const CRP_SAMPLE_KEYS = ['conservative_clean', 'flexible_clean', 'prolific_accepted']

const ALPHA_CONSTRUCTS = [
  { name: 'Barriers', key: 'alpha_barriers' },
  { name: 'Readiness', key: 'alpha_readiness' },
  { name: 'Maturity', key: 'alpha_maturity' },
]

type RelatedLink = { href: string; label: string; description: string }

type VariantConfig = {
  title: string
  metaPublished?: { wrapperClass: string; badgeClass: string; label: string }
  sampleCountWord: string
  introDatasetClause: string
  interpretationDatasetClause: string
  conclusionCountWord: string
  highReadinessSampleKey: string
  relatedLinks: RelatedLink[]
  backLink: { href: string; label: string }
}

const VARIANT_CONFIG: Record<ReliabilityVariant, VariantConfig> = {
  live: {
    title: 'Scale Reliability',
    sampleCountWord: 'five',
    introDatasetClause: '',
    interpretationDatasetClause: 'the full dataset',
    conclusionCountWord: 'five',
    highReadinessSampleKey: 'v2_finished',
    relatedLinks: [
      {
        href: '/results/descriptive',
        label: 'Descriptive Statistics',
        description: 'means, SDs, and correlations for each construct',
      },
      {
        href: '/results/sensitivity',
        label: 'Sensitivity Analysis',
        description: 'all metrics across five sample definitions',
      },
      {
        href: '/results/data-quality',
        label: 'Data Quality Pipeline',
        description: 'how the samples are defined and validated',
      },
    ],
    backLink: { href: '/results', label: '← Back to Results Overview' },
  },
  crp: {
    title: 'CRP 2026: Scale Reliability',
    metaPublished: {
      wrapperClass: 'mb-6',
      badgeClass:
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200',
      label: 'Published: April 2026',
    },
    sampleCountWord: 'three',
    introDatasetClause: 'across the CRP 2026 frozen dataset',
    interpretationDatasetClause: 'the full CRP dataset',
    conclusionCountWord: 'three',
    highReadinessSampleKey: 'prolific_accepted',
    relatedLinks: [
      {
        href: '/results/crp-2026/descriptive',
        label: 'Descriptive Statistics',
        description: 'means, SDs, and correlations for each construct',
      },
      {
        href: '/results/crp-2026',
        label: 'CRP 2026 Overview',
        description: 'frozen dataset methodology and download',
      },
      {
        href: '/results/crp-2026/data-quality',
        label: 'Data Quality Pipeline',
        description: 'how the samples are defined and validated',
      },
    ],
    backLink: { href: '/results/crp-2026', label: '← Back to CRP 2026 Overview' },
  },
}

export const ReliabilityContent = ({ variant, data, validationData }: ReliabilityContentProps) => {
  const config = VARIANT_CONFIG[variant]
  const allSamples = data.samples
  const samples =
    variant === 'crp' ? allSamples.filter((s) => CRP_SAMPLE_KEYS.includes(s.key)) : allSamples

  const getMetricValue = (key: string, sample: string): number | null => {
    const metric = data.metrics.find((m) => m.key === key)
    if (!metric) return null
    return metric.values[sample] ?? null
  }

  const primarySample = findPrimarySample(validationData)
  const extendedProps: ExtendedReliabilityProps = primarySample
    ? {
        bootstrap: primarySample['bootstrap_alpha_ci'] as ExtendedReliabilityProps['bootstrap'],
        alphaIfDeleted: primarySample[
          'alpha_if_deleted_summary'
        ] as ExtendedReliabilityProps['alphaIfDeleted'],
        reliabilityByDemo: primarySample[
          'reliability_by_demo'
        ] as ExtendedReliabilityProps['reliabilityByDemo'],
      }
    : {}

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>{config.title}</h1>

        {variant === 'crp' && config.metaPublished ? (
          <div className={config.metaPublished.wrapperClass}>
            <span className={config.metaPublished.badgeClass}>{config.metaPublished.label}</span>
          </div>
        ) : (
          <LastUpdated utcTimestamp={data.last_updated} />
        )}

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            Scale reliability is assessed using{' '}
            <Term termId="cronbach-alpha">Cronbach&rsquo;s alpha</Term> (&alpha;), the most widely
            used measure of internal consistency. A coefficient of &alpha; &ge; 0.70 is generally
            considered acceptable for research purposes (Nunnally &amp; Bernstein, 1994), while
            values above 0.80 indicate good to excellent reliability.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            All three TABS constructs demonstrate excellent internal consistency
            {config.introDatasetClause ? ` ${config.introDatasetClause}` : ''}, with every
            Cronbach&rsquo;s alpha exceeding 0.82 across all {config.sampleCountWord} sample
            definitions. This indicates that the survey items within each construct are measuring
            the same underlying factor reliably, regardless of which inclusion criteria are applied.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Cronbach&rsquo;s Alpha by Construct and Sample</h2>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Construct
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
                {ALPHA_CONSTRUCTS.map((construct, i) => (
                  <tr key={construct.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <th
                      scope="row"
                      className="border border-gray-300 px-4 py-2 font-medium text-left"
                    >
                      {construct.name}
                    </th>
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

        <ExtendedReliabilitySections {...extendedProps} />

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Interpretation</h2>
          <p className={PARAGRAPH_CLASSES}>
            Several key observations emerge from the reliability analysis:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              All alphas exceed <strong>0.82</strong>, well above the commonly cited 0.70 threshold,
              indicating excellent internal consistency across all constructs and samples.
            </li>
            <li>
              Reliability coefficients are <strong>stable across sample definitions</strong>,
              meaning the scales perform consistently whether computed on the strictest clean sample
              or {config.interpretationDatasetClause}.
            </li>
            <li>
              Alpha values tend to increase slightly with larger sample sizes, which is expected
              behavior and does not indicate measurement problems.
            </li>
            <li>
              The <strong>Readiness</strong> construct shows the highest alphas (up to{' '}
              {fmt(getMetricValue('alpha_readiness', config.highReadinessSampleKey))}), while{' '}
              <strong>Maturity</strong> shows the lowest (still above{' '}
              {fmt(getMetricValue('alpha_maturity', 'conservative_clean'))}), which may reflect the
              smaller number of items in the Maturity scale (9 vs. 18-19).
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            The consistency of these results across {config.conclusionCountWord} sample definitions
            demonstrates that the TABS scales are reliable instruments regardless of the inclusion
            criteria applied. This robustness is critical for supporting any downstream inferential
            analyses.
          </p>
        </section>

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

        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Related</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            {config.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-blue-600 hover:underline">
                  {link.label}
                </Link>{' '}
                - {link.description}
              </li>
            ))}
            <li>
              <Link href={config.backLink.href} className="text-blue-600 hover:underline">
                {config.backLink.label}
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}
