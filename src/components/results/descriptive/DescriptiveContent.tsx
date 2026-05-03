import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import LastUpdated from '@/components/last-updated'

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

export type DescriptiveData = {
  samples: Sample[]
  metrics: Metric[]
  last_updated?: string
}

export type DescriptiveVariant = 'live' | 'crp'

interface DescriptiveContentProps {
  variant: DescriptiveVariant
  data: DescriptiveData
}

const CRP_SAMPLE_KEYS = ['conservative_clean', 'flexible_clean', 'prolific_accepted']

const fmt = (val: number | null, decimals: number = 4): string => {
  if (val === null) return '-'
  return val.toFixed(decimals)
}

type ConstructDef = { name: string; meanKey: string; sdKey: string; description: string }

const CONSTRUCTS: ConstructDef[] = [
  {
    name: 'Barriers',
    meanKey: 'barrier_mean',
    sdKey: 'barrier_sd',
    description:
      'The Barriers construct measures the severity of technology adoption obstacles as perceived by organizational leaders. Higher values indicate greater perceived barriers.',
  },
  {
    name: 'Readiness',
    meanKey: 'readiness_mean',
    sdKey: 'readiness_sd',
    description:
      'The Readiness construct assesses organizational preparedness for technology adoption. Higher values indicate greater self-reported readiness and capability.',
  },
  {
    name: 'Maturity',
    meanKey: 'maturity_mean',
    sdKey: 'maturity_sd',
    description:
      'The Maturity construct measures the current level of technology process maturity within the organization. Higher values indicate more advanced, formalized technology processes.',
  },
]

type CorrelationFootnote = { href: string; label: string; tail: string }

type RelatedLink = { href: string; label: string; description: string }

type VariantConfig = {
  title: string
  metaPublished?: { wrapperClass: string; badgeClass: string; label: string }
  introValuesClause: string
  correlationGroupsCountWord: string
  correlationGroupsTypeWord: string
  /** Sample keys to exclude from the correlation matrix section. Live
   *  excludes `v2_all` because the original page hardcoded the matrices
   *  to the 4 primary groups; CRP is already filtered to 3. */
  correlationExcludeKeys: string[]
  correlationFootnote: CorrelationFootnote
  relatedLinks: RelatedLink[]
  backLink: { href: string; label: string }
}

const VARIANT_CONFIG: Record<DescriptiveVariant, VariantConfig> = {
  live: {
    title: 'Descriptive Statistics',
    introValuesClause:
      'All values are computed from the daily analysis pipeline using person-level construct means.',
    correlationGroupsCountWord: 'four',
    correlationGroupsTypeWord: 'primary result groups',
    correlationExcludeKeys: ['v2_all'],
    correlationFootnote: {
      href: '/results/sensitivity',
      label: 'Sensitivity Analysis',
      tail: ' page for the full five-sample comparison including All V2.',
    },
    relatedLinks: [
      {
        href: '/results/reliability',
        label: 'Scale Reliability',
        description: 'Cronbach’s alpha for each construct',
      },
      {
        href: '/results/sensitivity',
        label: 'Sensitivity Analysis',
        description: 'robustness across all five sample definitions',
      },
      {
        href: '/results/data-quality',
        label: 'Data Quality Pipeline',
        description: 'how responses are validated before analysis',
      },
    ],
    backLink: { href: '/results', label: '← Back to Results Overview' },
  },
  crp: {
    title: 'CRP 2026: Descriptive Statistics',
    metaPublished: {
      wrapperClass: 'mb-6',
      badgeClass:
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200',
      label: 'Published: April 2026',
    },
    introValuesClause:
      'All values are computed from the frozen CRP 2026 dataset across three sample definitions.',
    correlationGroupsCountWord: 'three',
    correlationGroupsTypeWord: 'CRP sample groups',
    correlationExcludeKeys: [],
    correlationFootnote: {
      href: '/results/crp-2026',
      label: 'CRP 2026 Overview',
      tail: ' page for dataset methodology and sample definitions.',
    },
    relatedLinks: [
      {
        href: '/results/crp-2026/reliability',
        label: 'Scale Reliability',
        description: 'Cronbach’s alpha for each construct',
      },
      {
        href: '/results/crp-2026',
        label: 'CRP 2026 Overview',
        description: 'frozen dataset methodology and download',
      },
      {
        href: '/results/crp-2026/data-quality',
        label: 'Data Quality Pipeline',
        description: 'how responses are validated before analysis',
      },
    ],
    backLink: { href: '/results/crp-2026', label: '← Back to CRP 2026 Overview' },
  },
}

/**
 * Renders the Descriptive Statistics results page for either the live
 * (rolling Prolific) or CRP-2026 (frozen N=200) dataset, sharing all
 * layout and computation between them. Variant-specific differences
 * (title, date treatment, sample filtering, prose, correlation footnote,
 * related links) live in `VARIANT_CONFIG` so the two tracks can no
 * longer drift on layout.
 */
export const DescriptiveContent = ({ variant, data }: DescriptiveContentProps) => {
  const config = VARIANT_CONFIG[variant]
  const allSamples = data.samples
  const samples =
    variant === 'crp' ? allSamples.filter((s) => CRP_SAMPLE_KEYS.includes(s.key)) : allSamples

  const getMetricValue = (key: string, sample: string): number | null => {
    const metric = data.metrics.find((m) => m.key === key)
    if (!metric) return null
    return metric.values[sample] ?? null
  }

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
            This page presents the grand means, standard deviations, and inter-construct
            correlations for the three TABS constructs: Barriers, Readiness, and Maturity.{' '}
            {config.introValuesClause}
          </p>
        </section>

        {CONSTRUCTS.map((c) => (
          <ConstructSection
            key={c.name}
            construct={c}
            samples={samples}
            getMetricValue={getMetricValue}
          />
        ))}

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Inter-Construct Correlations</h2>
          <p className={PARAGRAPH_CLASSES}>
            The correlation matrices below show the Pearson correlations between construct-level
            means, computed independently on each of the {config.correlationGroupsCountWord}{' '}
            {config.correlationGroupsTypeWord}. Negative correlations between Barriers and the other
            constructs indicate that organizations perceiving higher barriers tend to report lower
            readiness and maturity.
          </p>

          {samples
            .filter((s) => !config.correlationExcludeKeys.includes(s.key))
            .map((group) => {
              const n = group.n ?? '-'
              const br = getMetricValue('corr_br', group.key)
              const bm = getMetricValue('corr_bm', group.key)
              const rm = getMetricValue('corr_rm', group.key)
              return (
                <div key={group.key} className="mb-6">
                  <h3 className={H3_CLASSES}>
                    {group.label} (N={n})
                  </h3>
                  <CorrelationMatrix br={br} bm={bm} rm={rm} />
                </div>
              )
            })}

          <p className="text-sm text-gray-500">
            Correlations are Pearson product-moment. See the{' '}
            <Link href={config.correlationFootnote.href} className="text-blue-600 hover:underline">
              {config.correlationFootnote.label}
            </Link>
            {config.correlationFootnote.tail}
          </p>
        </section>

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

interface ConstructSectionProps {
  construct: ConstructDef
  samples: Sample[]
  getMetricValue: (key: string, sample: string) => number | null
}

const ConstructSection = ({ construct, samples, getMetricValue }: ConstructSectionProps) => (
  <section className="mb-12 text-gray-800">
    <h2 className={H2_CLASSES}>{construct.name}</h2>
    <p className={PARAGRAPH_CLASSES}>{construct.description}</p>
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Sample
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
              Grand Mean
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
              SD
            </th>
          </tr>
        </thead>
        <tbody>
          {samples.map((sample, i) => (
            <tr key={sample.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
              <th scope="row" className="border border-gray-300 px-4 py-2 font-medium text-left">
                {sample.label} (N={sample.n ?? '-'})
              </th>
              <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                {fmt(getMetricValue(construct.meanKey, sample.key))}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                {fmt(getMetricValue(construct.sdKey, sample.key))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

interface CorrelationMatrixProps {
  br: number | null
  bm: number | null
  rm: number | null
}

const CorrelationMatrix = ({ br, bm, rm }: CorrelationMatrixProps) => (
  <div className="overflow-x-auto my-3">
    <table className="w-full border-collapse font-sans text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
            Construct
          </th>
          <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
            Barriers
          </th>
          <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
            Readiness
          </th>
          <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
            Maturity
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row" className="border border-gray-300 px-4 py-2 font-medium text-left">
            Barriers
          </th>
          <td className="border border-gray-300 px-4 py-2 text-right font-mono bg-gray-100">
            1.0000
          </td>
          <td className="border border-gray-300 px-4 py-2 text-right font-mono">{fmt(br)}</td>
          <td className="border border-gray-300 px-4 py-2 text-right font-mono">{fmt(bm)}</td>
        </tr>
        <tr className="bg-gray-50">
          <th scope="row" className="border border-gray-300 px-4 py-2 font-medium text-left">
            Readiness
          </th>
          <td className="border border-gray-300 px-4 py-2 text-right font-mono">{fmt(br)}</td>
          <td className="border border-gray-300 px-4 py-2 text-right font-mono bg-gray-100">
            1.0000
          </td>
          <td className="border border-gray-300 px-4 py-2 text-right font-mono">{fmt(rm)}</td>
        </tr>
        <tr>
          <th scope="row" className="border border-gray-300 px-4 py-2 font-medium text-left">
            Maturity
          </th>
          <td className="border border-gray-300 px-4 py-2 text-right font-mono">{fmt(bm)}</td>
          <td className="border border-gray-300 px-4 py-2 text-right font-mono">{fmt(rm)}</td>
          <td className="border border-gray-300 px-4 py-2 text-right font-mono bg-gray-100">
            1.0000
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)
