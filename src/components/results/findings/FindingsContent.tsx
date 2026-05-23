import type { ReactNode } from 'react'
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
import EffectSizeChart from '@/components/effect-size-chart'
import { DATA_UNAVAILABLE } from '@/lib/sentinelMarker'
import { InferentialExtensions } from '@/components/results/findings/InferentialExtensions'
import { buildInferentialExtensionsProps } from '@/lib/results/buildInferentialExtensionsProps'

interface EffectSizeConstruct {
  tech_mean?: number | null
  nontech_mean?: number | null
  large_mean?: number | null
  small_medium_mean?: number | null
  d?: number | null
  d_ci_lower?: number | null
  d_ci_upper?: number | null
}

interface EffectSizeGroup {
  tech_n?: number
  nontech_n?: number
  large_n?: number
  small_medium_n?: number
  constructs?: Record<string, EffectSizeConstruct>
}

interface CrossTabRow {
  group: string
  n: number
  barrier_mean: number | null
  readiness_mean: number | null
  maturity_mean: number | null
}

interface InferentialConstruct {
  t?: number | null
  p?: number | null
  df?: number | null
  f?: number | null
  df_between?: number | null
  df_within?: number | null
  sig?: boolean
}

interface InferentialGroup {
  tech_n?: number
  nontech_n?: number
  large_n?: number
  small_medium_n?: number
  groups?: string[]
  group_ns?: number[]
  constructs?: Record<string, InferentialConstruct>
}

interface InferentialDataBlock {
  t_tests_tech_vs_nontech?: InferentialGroup
  t_tests_large_vs_small?: InferentialGroup
  anova_by_role?: InferentialGroup
  anova_by_org_size?: InferentialGroup
}

interface SampleDetail {
  demographics?: Record<string, unknown>
  effect_sizes?: Record<string, EffectSizeGroup>
  cross_tabs?: { by_role?: CrossTabRow[]; by_org_size?: CrossTabRow[] }
  inferential?: InferentialDataBlock
}

type Sample = {
  key: string
  label: string
  description?: string
  n: number | null
}

export type FindingsData = {
  samples: Sample[]
  sample_details?: Record<string, SampleDetail>
  last_updated?: string
}

export type FindingsVariant = 'live' | 'crp'

type GroupConfig = { key: string; label: string; color: string }

interface FindingsContentProps {
  variant: FindingsVariant
  data: FindingsData
  validationData: unknown
}

const fmt = (val: number | null | undefined, decimals: number = 2): string => {
  if (val === null || val === undefined) return '-'
  const prefix = val > 0 ? '+' : ''
  return prefix + val.toFixed(decimals)
}

const formatPValue = (p: number | null | undefined): string => {
  if (p === null || p === undefined) return '-'
  return p < 0.001 ? '<.001' : p.toFixed(3)
}

const formatAnovaDf = (
  dfBetween: number | null | undefined,
  dfWithin: number | null | undefined
): string => {
  if (dfBetween == null || dfWithin == null) return '-'
  return `${dfBetween}, ${dfWithin}`
}

const dSize = (d: number | null | undefined): string => {
  if (d === null || d === undefined) return ''
  const abs = Math.abs(d)
  if (abs < 0.2) return 'negligible'
  if (abs < 0.5) return 'small'
  if (abs < 0.8) return 'medium'
  return 'large'
}

const PRIMARY_GROUPS_LIVE: GroupConfig[] = [
  { key: 'conservative_clean', label: 'Conservative Clean', color: 'border-green-500' },
  { key: 'flexible_clean', label: 'Flexible Clean', color: 'border-blue-500' },
  { key: 'prolific_accepted', label: 'Prolific Accepted', color: 'border-amber-500' },
  { key: 'v2_finished', label: 'All V2 Finished', color: 'border-gray-400' },
]

const PRIMARY_GROUPS_CRP: GroupConfig[] = [
  { key: 'conservative_clean', label: 'Conservative Clean', color: 'border-green-500' },
  { key: 'flexible_clean', label: 'Flexible Clean', color: 'border-blue-500' },
  { key: 'prolific_accepted', label: 'Prolific Accepted', color: 'border-amber-500' },
]

type RelatedLink = { href: string; label: string; description: string }

type VariantConfig = {
  title: string
  metaPublishedLabel?: string
  groups: GroupConfig[]
  groupCountWord: string
  groupTypeWord: string
  techVsNontechHeading: string
  relatedLinks: RelatedLink[]
  backLink: { href: string; label: string }
}

const VARIANT_CONFIG: Record<FindingsVariant, VariantConfig> = {
  live: {
    title: 'Key Findings',
    groups: PRIMARY_GROUPS_LIVE,
    groupCountWord: 'four',
    groupTypeWord: 'primary result groups',
    techVsNontechHeading: 'Technical (CIO/CTO) vs Non-Technical',
    relatedLinks: [
      {
        href: '/results/descriptive',
        label: 'Descriptive Statistics',
        description: 'means, SDs, and correlations per result group',
      },
      {
        href: '/results/sample',
        label: 'Sample & Demographics',
        description: 'demographic breakdowns per result group',
      },
      {
        href: '/results/sensitivity',
        label: 'Sensitivity Analysis',
        description: 'all metrics and deltas across datasets',
      },
      {
        href: '/results/dataset-comparison',
        label: 'Dataset Comparison',
        description: 'side-by-side statistics across all four result groups',
      },
    ],
    backLink: { href: '/results', label: '← Back to Results Overview' },
  },
  crp: {
    title: 'CRP 2026: Key Findings',
    metaPublishedLabel: 'Published: April 2026',
    groups: PRIMARY_GROUPS_CRP,
    groupCountWord: 'three',
    groupTypeWord: 'CRP sample definitions',
    techVsNontechHeading: 'Technical vs Non-Technical',
    relatedLinks: [
      {
        href: '/results/crp-2026/descriptive',
        label: 'Descriptive Statistics',
        description: 'means, SDs, and correlations per result group',
      },
      {
        href: '/results/crp-2026/sample',
        label: 'Sample & Demographics',
        description: 'demographic breakdowns per result group',
      },
      {
        href: '/results/crp-2026/sensitivity',
        label: 'Sensitivity Analysis',
        description: 'all metrics and deltas across datasets',
      },
      {
        href: '/results/crp-2026/data-quality',
        label: 'Data Quality Pipeline',
        description: 'quality checks and disposition waterfall',
      },
    ],
    backLink: { href: '/results/crp-2026', label: '← Back to CRP 2026 Overview' },
  },
}

const COMPLETED_ANALYSES_LINKS_LIVE = [
  {
    href: '/results/validation',
    label: 'Regression Models',
    aria: 'View completed Regression Models analysis',
  },
  {
    href: '/results/factor-analysis',
    label: 'Factor Analysis',
    aria: 'View completed Factor Analysis results',
  },
]

const COMPLETED_ANALYSES_LINKS_CRP = [
  {
    href: '/results/crp-2026/validation',
    label: 'Regression Models',
    aria: 'View completed Regression Models analysis',
  },
  {
    href: '/results/crp-2026/factor-analysis',
    label: 'Factor Analysis',
    aria: 'View completed Factor Analysis results',
  },
]

const mapEffectChartData = (constructs: Record<string, EffectSizeConstruct>) =>
  Object.entries(constructs).map(([construct, vals]) => ({
    construct,
    d: vals.d ?? null,
    ci_lower: vals.d_ci_lower ?? null,
    ci_upper: vals.d_ci_upper ?? null,
  }))

/**
 * Renders the Key Findings results page for either the live (rolling
 * Prolific) or CRP-2026 (frozen N=200) dataset, sharing all layout and
 * computation between them.
 *
 * Variant-specific differences live in `VARIANT_CONFIG` so the two
 * tracks can no longer drift on prose, table structure, or links:
 *
 * - `variant: 'live'` renders 4 result groups (incl. `v2_finished`),
 *   the LastUpdated timestamp, the "Technical (CIO/CTO) vs Non-Technical"
 *   heading, and live-track related links (incl. Dataset Comparison).
 * - `variant: 'crp'` renders 3 nested CRP groups, a static
 *   "Published: April 2026" badge, the simpler "Technical vs Non-Technical"
 *   heading, and crp-track related links (incl. Data Quality Pipeline).
 *
 * `data` accepts the unified-pipeline JSON shape (sensitivity-analysis.json
 * for live, crp-sensitivity-analysis.json for CRP). `validationData` is
 * passed through to InferentialExtensions for mediation/regression/TOST.
 */
export const FindingsContent = ({ variant, data, validationData }: FindingsContentProps) => {
  const config = VARIANT_CONFIG[variant]
  const sampleDetails: Record<string, SampleDetail> = data.sample_details ?? {}
  const inferentialExtensionsProps = buildInferentialExtensionsProps(validationData)

  const samplesByKey = new Map(data.samples.map((s) => [s.key, s]))

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
            All effect sizes, cross-tabulations, t-tests, and ANOVA are computed independently for
            each of the {config.groupCountWord} {config.groupTypeWord}. This ensures that any
            finding can be validated against the researcher&rsquo;s chosen dataset.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Effect Sizes (Cohen&rsquo;s d)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Cohen&rsquo;s d measures the standardized difference between group means. Values of |d|
            &lt; 0.2 are negligible, 0.2-0.5 small, 0.5-0.8 medium, and &gt; 0.8 large. Each
            comparison is computed separately for each result group.
          </p>

          {config.groups.map((group) => {
            const sample = samplesByKey.get(group.key)
            const details = sampleDetails[group.key]
            const effects = details?.effect_sizes
            const techVsNontech = effects?.['tech_vs_nontech']
            const largeVsSmall = effects?.['large_vs_small']
            const techConstructs = techVsNontech?.constructs
            const largeConstructs = largeVsSmall?.constructs
            const hasEffects =
              techConstructs !== undefined && Object.keys(techConstructs).length > 0

            return (
              <div
                key={group.key}
                className={`border-l-4 ${group.color} bg-gray-50 rounded-lg p-5 mb-6`}
              >
                <h3 className={H3_CLASSES}>
                  {group.label} (N={sample?.n ?? '-'})
                </h3>

                {hasEffects && techConstructs ? (
                  <div className="space-y-4 mt-3">
                    <div>
                      <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                        {config.techVsNontechHeading} - n={techVsNontech?.tech_n} vs n=
                        {techVsNontech?.nontech_n}
                      </h4>

                      <EffectSizeChart data={mapEffectChartData(techConstructs)} />

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse bg-white/70 rounded">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th
                                scope="col"
                                className="py-1.5 px-2 text-left font-semibold text-gray-600"
                              >
                                Construct
                              </th>
                              <th
                                scope="col"
                                className="py-1.5 px-2 text-right font-semibold text-gray-600"
                              >
                                Tech Mean
                              </th>
                              <th
                                scope="col"
                                className="py-1.5 px-2 text-right font-semibold text-gray-600"
                              >
                                Non-Tech Mean
                              </th>
                              <th
                                scope="col"
                                className="py-1.5 px-2 text-right font-semibold text-gray-600"
                              >
                                Cohen&rsquo;s d
                              </th>
                              <th
                                scope="col"
                                className="py-1.5 px-2 text-left font-semibold text-gray-600"
                              >
                                Size
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(techConstructs).map(([construct, vals]) => (
                              <tr key={construct} className="border-b border-gray-200">
                                <th
                                  scope="row"
                                  className="py-1.5 px-2 font-medium capitalize text-left"
                                >
                                  {construct}
                                </th>
                                <td className="py-1.5 px-2 text-right font-mono">
                                  {vals.tech_mean?.toFixed(4) ?? '-'}
                                </td>
                                <td className="py-1.5 px-2 text-right font-mono">
                                  {vals.nontech_mean?.toFixed(4) ?? '-'}
                                </td>
                                <td className="py-1.5 px-2 text-right font-mono font-semibold">
                                  {fmt(vals.d)}
                                </td>
                                <td className="py-1.5 px-2 text-gray-600 italic">
                                  {dSize(vals.d)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {largeConstructs && Object.keys(largeConstructs).length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                          Large Org (5000+) vs Small/Medium - n={largeVsSmall?.large_n} vs n=
                          {largeVsSmall?.small_medium_n}
                        </h4>

                        <EffectSizeChart data={mapEffectChartData(largeConstructs)} />

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse bg-white/70 rounded">
                            <thead>
                              <tr className="border-b border-gray-300">
                                <th
                                  scope="col"
                                  className="py-1.5 px-2 text-left font-semibold text-gray-600"
                                >
                                  Construct
                                </th>
                                <th
                                  scope="col"
                                  className="py-1.5 px-2 text-right font-semibold text-gray-600"
                                >
                                  Large Mean
                                </th>
                                <th
                                  scope="col"
                                  className="py-1.5 px-2 text-right font-semibold text-gray-600"
                                >
                                  S/M Mean
                                </th>
                                <th
                                  scope="col"
                                  className="py-1.5 px-2 text-right font-semibold text-gray-600"
                                >
                                  Cohen&rsquo;s d
                                </th>
                                <th
                                  scope="col"
                                  className="py-1.5 px-2 text-left font-semibold text-gray-600"
                                >
                                  Size
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(largeConstructs).map(([construct, vals]) => (
                                <tr key={construct} className="border-b border-gray-200">
                                  <th
                                    scope="row"
                                    className="py-1.5 px-2 font-medium capitalize text-left"
                                  >
                                    {construct}
                                  </th>
                                  <td className="py-1.5 px-2 text-right font-mono">
                                    {vals.large_mean?.toFixed(4) ?? '-'}
                                  </td>
                                  <td className="py-1.5 px-2 text-right font-mono">
                                    {vals.small_medium_mean?.toFixed(4) ?? '-'}
                                  </td>
                                  <td className="py-1.5 px-2 text-right font-mono font-semibold">
                                    {fmt(vals.d)}
                                  </td>
                                  <td className="py-1.5 px-2 text-gray-600 italic">
                                    {dSize(vals.d)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-600 font-medium mt-2">
                    {DATA_UNAVAILABLE} Effect size data missing. Check the daily pipeline workflow.
                  </p>
                )}
              </div>
            )
          })}
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Cross-Tabulations</h2>
          <p className={PARAGRAPH_CLASSES}>
            Cross-tabulations show construct means broken down by respondent subgroups (role, org
            size). These are computed for each result group to check whether group-level patterns
            hold across data cleaning levels.
          </p>

          {config.groups.map((group) => {
            const sample = samplesByKey.get(group.key)
            const details = sampleDetails[group.key]
            const ct = details?.cross_tabs
            const hasData =
              ct && ((ct.by_role?.length ?? 0) > 0 || (ct.by_org_size?.length ?? 0) > 0)

            return (
              <div
                key={group.key}
                className={`border-l-4 ${group.color} bg-gray-50 rounded-lg p-5 mb-6`}
              >
                <h3 className={H3_CLASSES}>
                  {group.label} (N={sample?.n ?? '-'})
                </h3>

                {hasData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {(ct.by_role?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">By Role</h4>
                        <CrossTabTable rows={ct.by_role ?? []} />
                      </div>
                    )}
                    {(ct.by_org_size?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                          By Org Size
                        </h4>
                        <CrossTabTable rows={ct.by_org_size ?? []} />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-600 font-medium mt-2">
                    {DATA_UNAVAILABLE} Cross-tabulation data missing. Check the daily pipeline
                    workflow.
                  </p>
                )}
              </div>
            )
          })}
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Inferential Statistics</h2>
          <p className={PARAGRAPH_CLASSES}>
            Welch&rsquo;s t-tests compare two groups (unequal variance assumed). One-way ANOVA tests
            whether means differ across three or more groups. All tests are two-tailed with
            &alpha;&nbsp;=&nbsp;0.05. Significant results (p&nbsp;&lt;&nbsp;0.05) are highlighted.
          </p>

          {config.groups.map((group) => {
            const inf = sampleDetails[group.key]?.inferential
            const hasData =
              inf && (inf.t_tests_tech_vs_nontech?.constructs || inf.anova_by_role?.constructs)

            return (
              <div key={group.key} className={`border-l-4 ${group.color} pl-5 mb-10`}>
                <h3 className={H3_CLASSES}>{group.label}</h3>

                {hasData ? (
                  <div className="space-y-6">
                    {inf.t_tests_tech_vs_nontech?.constructs && (
                      <TTestTable
                        title={<>Welch&rsquo;s t-test: Technical vs Non-Technical</>}
                        nLabels={[
                          {
                            label: 'tech',
                            n: inf.t_tests_tech_vs_nontech.tech_n,
                          },
                          {
                            label: 'non-tech',
                            n: inf.t_tests_tech_vs_nontech.nontech_n,
                          },
                        ]}
                        constructs={inf.t_tests_tech_vs_nontech.constructs}
                      />
                    )}

                    {inf.t_tests_large_vs_small?.constructs && (
                      <TTestTable
                        title={<>Welch&rsquo;s t-test: Large vs Small/Medium Org</>}
                        nLabels={[
                          { label: 'large', n: inf.t_tests_large_vs_small.large_n },
                          {
                            label: 'sm/med',
                            n: inf.t_tests_large_vs_small.small_medium_n,
                          },
                        ]}
                        constructs={inf.t_tests_large_vs_small.constructs}
                      />
                    )}

                    {inf.anova_by_role?.constructs && (
                      <AnovaTable
                        title="One-way ANOVA: by Role"
                        groups={inf.anova_by_role.groups ?? []}
                        constructs={inf.anova_by_role.constructs}
                      />
                    )}

                    {inf.anova_by_org_size?.constructs && (
                      <AnovaTable
                        title="One-way ANOVA: by Organization Size"
                        groups={inf.anova_by_org_size.groups ?? []}
                        constructs={inf.anova_by_org_size.constructs}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-600 font-medium mt-2">
                    {DATA_UNAVAILABLE} Inferential statistics missing. Check the daily pipeline
                    workflow.
                  </p>
                )}
              </div>
            )
          })}
        </section>

        <InferentialExtensions {...inferentialExtensionsProps} />

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Completed Analyses</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 max-w-lg mx-auto mb-6 font-sans text-base">
              The following additional analyses have been completed:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {(variant === 'crp'
                ? COMPLETED_ANALYSES_LINKS_CRP
                : COMPLETED_ANALYSES_LINKS_LIVE
              ).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-label={link.aria}
                  className="inline-flex items-center gap-1.5 bg-white border border-green-300 rounded-full px-4 py-1.5 text-sm text-green-700 hover:bg-green-100 transition-colors"
                >
                  <span aria-hidden="true">✓</span> {link.label}
                </Link>
              ))}
            </div>
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

const CrossTabTable = ({ rows }: { rows: CrossTabRow[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border-collapse bg-white/70 rounded">
      <thead>
        <tr className="border-b border-gray-300">
          <th scope="col" className="py-1.5 px-2 text-left font-semibold">
            Group
          </th>
          <th scope="col" className="py-1.5 px-2 text-right font-semibold">
            n
          </th>
          <th scope="col" className="py-1.5 px-2 text-right font-semibold">
            B
          </th>
          <th scope="col" className="py-1.5 px-2 text-right font-semibold">
            R
          </th>
          <th scope="col" className="py-1.5 px-2 text-right font-semibold">
            M
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.group} className="border-b border-gray-200">
            <th scope="row" className="py-1.5 px-2 font-medium text-left">
              {row.group}
            </th>
            <td className="py-1.5 px-2 text-right font-mono">{row.n}</td>
            <td className="py-1.5 px-2 text-right font-mono">
              {row.barrier_mean?.toFixed(2) ?? '-'}
            </td>
            <td className="py-1.5 px-2 text-right font-mono">
              {row.readiness_mean?.toFixed(2) ?? '-'}
            </td>
            <td className="py-1.5 px-2 text-right font-mono">
              {row.maturity_mean?.toFixed(2) ?? '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

interface TTestTableProps {
  title: ReactNode
  nLabels: { label: string; n: number | undefined }[]
  constructs: Record<string, InferentialConstruct>
}

const TTestTable = ({ title, nLabels, constructs }: TTestTableProps) => (
  <div>
    <h4 className="font-sans font-semibold text-gray-700 text-sm mb-2">
      {title}
      <span className="text-gray-500 font-normal ml-2">
        (
        {nLabels.map((nl, i) => (
          <span key={nl.label}>
            n<sub>{nl.label}</sub>={nl.n ?? '-'}
            {i < nLabels.length - 1 ? ', ' : ''}
          </span>
        ))}
        )
      </span>
    </h4>
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-sans border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="text-left p-2 border-b">
              Construct
            </th>
            <th scope="col" className="text-right p-2 border-b">
              t
            </th>
            <th scope="col" className="text-right p-2 border-b">
              df
            </th>
            <th scope="col" className="text-right p-2 border-b">
              p
            </th>
            <th scope="col" className="text-center p-2 border-b">
              Sig.
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(constructs).map(([construct, vals]) => (
            <tr key={construct} className={vals.sig ? 'bg-green-50' : ''}>
              <th scope="row" className="p-2 border-b capitalize text-left">
                {construct}
              </th>
              <td className="text-right p-2 border-b font-mono">{vals.t?.toFixed(3) ?? '-'}</td>
              <td className="text-right p-2 border-b font-mono">{vals.df?.toFixed(1) ?? '-'}</td>
              <td className="text-right p-2 border-b font-mono">{formatPValue(vals.p)}</td>
              <td className="text-center p-2 border-b" aria-label={vals.sig ? 'significant' : ''}>
                {vals.sig ? '✱' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

interface AnovaTableProps {
  title: string
  groups: string[]
  constructs: Record<string, InferentialConstruct>
}

const AnovaTable = ({ title, groups, constructs }: AnovaTableProps) => (
  <div>
    <h4 className="font-sans font-semibold text-gray-700 text-sm mb-2">
      {title}
      <span className="text-gray-500 font-normal ml-2">({groups.join(', ')})</span>
    </h4>
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-sans border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="text-left p-2 border-b">
              Construct
            </th>
            <th scope="col" className="text-right p-2 border-b">
              F
            </th>
            <th scope="col" className="text-right p-2 border-b">
              df
            </th>
            <th scope="col" className="text-right p-2 border-b">
              p
            </th>
            <th scope="col" className="text-center p-2 border-b">
              Sig.
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(constructs).map(([construct, vals]) => (
            <tr key={construct} className={vals.sig ? 'bg-green-50' : ''}>
              <th scope="row" className="p-2 border-b capitalize text-left">
                {construct}
              </th>
              <td className="text-right p-2 border-b font-mono">{vals.f?.toFixed(3) ?? '-'}</td>
              <td className="text-right p-2 border-b font-mono">
                {formatAnovaDf(vals.df_between, vals.df_within)}
              </td>
              <td className="text-right p-2 border-b font-mono">{formatPValue(vals.p)}</td>
              <td className="text-center p-2 border-b" aria-label={vals.sig ? 'significant' : ''}>
                {vals.sig ? '✱' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
