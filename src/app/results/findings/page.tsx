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
import liveValidationData from '@/data/live-validation.json'
import LastUpdated from '@/components/last-updated'
import EffectSizeChart from '@/components/effect-size-chart'
import { DATA_UNAVAILABLE } from '@/lib/sentinelMarker'
import {
  InferentialExtensions,
  type InferentialExtensionsProps,
} from '@/components/results/findings/InferentialExtensions'
import { findPrimarySample, type ValidationLike } from '@/lib/results/findPrimarySample'

export const metadata: Metadata = {
  title: 'Key Findings - TABS Results',
  description:
    'Effect sizes, cross-tabulations, t-tests, and ANOVA from the Technology Adoption Barriers Survey, computed independently across four result groups.',
  alternates: {
    canonical: '/results/findings',
  },
}

interface EffectSizeConstruct {
  tech_mean?: number | null
  nontech_mean?: number | null
  large_mean?: number | null
  small_medium_mean?: number | null
  d?: number | null
  ci_lower?: number | null
  ci_upper?: number | null
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

interface InferentialData {
  t_tests_tech_vs_nontech?: InferentialGroup
  t_tests_large_vs_small?: InferentialGroup
  anova_by_role?: InferentialGroup
  anova_by_org_size?: InferentialGroup
}

interface SampleDetail {
  demographics?: Record<string, unknown>
  effect_sizes?: Record<string, EffectSizeGroup>
  cross_tabs?: { by_role?: CrossTabRow[]; by_org_size?: CrossTabRow[] }
  inferential?: InferentialData
}

const sampleDetails: Record<string, SampleDetail> =
  ((sensitivityData as Record<string, unknown>).sample_details as Record<string, SampleDetail>) ??
  {}

const PRIMARY_GROUPS = [
  { key: 'conservative_clean', label: 'Conservative Clean', color: 'border-green-500' },
  { key: 'flexible_clean', label: 'Flexible Clean', color: 'border-blue-500' },
  { key: 'prolific_accepted', label: 'Prolific Accepted', color: 'border-amber-500' },
  { key: 'v2_finished', label: 'All V2 Finished', color: 'border-gray-400' },
]

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

const buildInferentialExtensionsProps = (validation: unknown): InferentialExtensionsProps => {
  const sample = findPrimarySample(validation as ValidationLike)
  if (!sample) return {}
  return {
    mediation: sample.mediation_b_r_m as InferentialExtensionsProps['mediation'],
    perFactorReg: sample.per_factor_regressions as InferentialExtensionsProps['perFactorReg'],
    standardizedReg:
      sample.standardized_subfactor_regressions as InferentialExtensionsProps['standardizedReg'],
    tost: sample.equivalence_test_tost_smb_ent as InferentialExtensionsProps['tost'],
    powerAnalysis: sample.power_analysis as InferentialExtensionsProps['powerAnalysis'],
  }
}

const FindingsPage = () => {
  const inferentialExtensionsProps = buildInferentialExtensionsProps(liveValidationData)
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Key Findings</h1>
        <LastUpdated
          utcTimestamp={(sensitivityData as Record<string, unknown>).last_updated as string}
        />

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            All effect sizes, cross-tabulations, t-tests, and ANOVA are computed independently for
            each of the four primary result groups. This ensures that any finding can be validated
            against the researcher&rsquo;s chosen dataset.
          </p>
        </section>

        {/* ── Effect Sizes by Result Group ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Effect Sizes (Cohen&rsquo;s d)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Cohen&rsquo;s d measures the standardized difference between group means. Values of |d|
            &lt; 0.2 are negligible, 0.2-0.5 small, 0.5-0.8 medium, and &gt; 0.8 large. Each
            comparison is computed separately for each result group.
          </p>

          {PRIMARY_GROUPS.map((group) => {
            const sample = sensitivityData.samples.find((s) => s.key === group.key)
            const details = sampleDetails[group.key]
            const effects = details?.effect_sizes
            const hasEffects =
              effects &&
              effects['tech_vs_nontech'] &&
              Object.keys(effects['tech_vs_nontech'].constructs ?? {}).length > 0

            return (
              <div
                key={group.key}
                className={`border-l-4 ${group.color} bg-gray-50 rounded-lg p-5 mb-6`}
              >
                <h3 className={H3_CLASSES}>
                  {group.label} (N={sample?.n ?? '-'})
                </h3>

                {hasEffects ? (
                  <div className="space-y-4 mt-3">
                    {/* Tech vs Non-Tech */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                        Technical (CIO/CTO) vs Non-Technical - n=
                        {effects['tech_vs_nontech'].tech_n} vs n=
                        {effects['tech_vs_nontech'].nontech_n}
                      </h4>

                      <EffectSizeChart
                        data={Object.entries(
                          (effects['tech_vs_nontech'].constructs ?? {}) as Record<
                            string,
                            EffectSizeConstruct
                          >
                        ).map(([construct, vals]) => ({
                          construct,
                          d: vals.d ?? null,
                          ci_lower: vals.ci_lower ?? null,
                          ci_upper: vals.ci_upper ?? null,
                        }))}
                      />

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse bg-white/70 rounded">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="py-1.5 px-2 text-left font-semibold text-gray-600">
                                Construct
                              </th>
                              <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                Tech Mean
                              </th>
                              <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                Non-Tech Mean
                              </th>
                              <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                Cohen&rsquo;s d
                              </th>
                              <th className="py-1.5 px-2 text-left font-semibold text-gray-600">
                                Size
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(
                              (effects['tech_vs_nontech'].constructs ?? {}) as Record<
                                string,
                                EffectSizeConstruct
                              >
                            ).map(([construct, vals]) => (
                              <tr key={construct} className="border-b border-gray-200">
                                <td className="py-1.5 px-2 font-medium capitalize">{construct}</td>
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

                    {/* Large vs Small/Medium */}
                    {effects['large_vs_small'] &&
                      Object.keys(effects['large_vs_small'].constructs ?? {}).length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                            Large Org (5000+) vs Small/Medium - n=
                            {effects['large_vs_small'].large_n} vs n=
                            {effects['large_vs_small'].small_medium_n}
                          </h4>

                          <EffectSizeChart
                            data={Object.entries(
                              (effects['large_vs_small'].constructs ?? {}) as Record<
                                string,
                                EffectSizeConstruct
                              >
                            ).map(([construct, vals]) => ({
                              construct,
                              d: vals.d ?? null,
                              ci_lower: vals.ci_lower ?? null,
                              ci_upper: vals.ci_upper ?? null,
                            }))}
                          />

                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse bg-white/70 rounded">
                              <thead>
                                <tr className="border-b border-gray-300">
                                  <th className="py-1.5 px-2 text-left font-semibold text-gray-600">
                                    Construct
                                  </th>
                                  <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                    Large Mean
                                  </th>
                                  <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                    S/M Mean
                                  </th>
                                  <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                    Cohen&rsquo;s d
                                  </th>
                                  <th className="py-1.5 px-2 text-left font-semibold text-gray-600">
                                    Size
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(
                                  (effects['large_vs_small'].constructs ?? {}) as Record<
                                    string,
                                    EffectSizeConstruct
                                  >
                                ).map(([construct, vals]) => (
                                  <tr key={construct} className="border-b border-gray-200">
                                    <td className="py-1.5 px-2 font-medium capitalize">
                                      {construct}
                                    </td>
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

        {/* ── Cross-Tabulations by Result Group ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Cross-Tabulations</h2>
          <p className={PARAGRAPH_CLASSES}>
            Cross-tabulations show construct means broken down by respondent subgroups (role, org
            size). These are computed for each result group to check whether group-level patterns
            hold across data cleaning levels.
          </p>

          {PRIMARY_GROUPS.map((group) => {
            const sample = sensitivityData.samples.find((s) => s.key === group.key)
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
                    {/* By Role */}
                    {(ct.by_role?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">By Role</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse bg-white/70 rounded">
                            <thead>
                              <tr className="border-b border-gray-300">
                                <th className="py-1.5 px-2 text-left font-semibold">Group</th>
                                <th className="py-1.5 px-2 text-right font-semibold">n</th>
                                <th className="py-1.5 px-2 text-right font-semibold">B</th>
                                <th className="py-1.5 px-2 text-right font-semibold">R</th>
                                <th className="py-1.5 px-2 text-right font-semibold">M</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(ct.by_role as CrossTabRow[]).map((row) => (
                                <tr key={row.group} className="border-b border-gray-200">
                                  <td className="py-1.5 px-2 font-medium">{row.group}</td>
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
                      </div>
                    )}

                    {/* By Org Size */}
                    {(ct.by_org_size?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                          By Org Size
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse bg-white/70 rounded">
                            <thead>
                              <tr className="border-b border-gray-300">
                                <th className="py-1.5 px-2 text-left font-semibold">Group</th>
                                <th className="py-1.5 px-2 text-right font-semibold">n</th>
                                <th className="py-1.5 px-2 text-right font-semibold">B</th>
                                <th className="py-1.5 px-2 text-right font-semibold">R</th>
                                <th className="py-1.5 px-2 text-right font-semibold">M</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(ct.by_org_size as CrossTabRow[]).map((row) => (
                                <tr key={row.group} className="border-b border-gray-200">
                                  <td className="py-1.5 px-2 font-medium">{row.group}</td>
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

        {/* ── Inferential Statistics by Result Group ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Inferential Statistics</h2>
          <p className={PARAGRAPH_CLASSES}>
            Welch&rsquo;s t-tests compare two groups (unequal variance assumed). One-way ANOVA tests
            whether means differ across three or more groups. All tests are two-tailed with
            &alpha;&nbsp;=&nbsp;0.05. Significant results (p&nbsp;&lt;&nbsp;0.05) are highlighted.
          </p>

          {PRIMARY_GROUPS.map((group) => {
            const inf = sampleDetails[group.key]?.inferential
            const hasData =
              inf && (inf.t_tests_tech_vs_nontech?.constructs || inf.anova_by_role?.constructs)

            return (
              <div key={group.key} className={`border-l-4 ${group.color} pl-5 mb-10`}>
                <h3 className={H3_CLASSES}>{group.label}</h3>

                {hasData ? (
                  <div className="space-y-6">
                    {/* T-tests: Tech vs Non-Tech */}
                    {inf.t_tests_tech_vs_nontech?.constructs && (
                      <div>
                        <h4 className="font-sans font-semibold text-gray-700 text-sm mb-2">
                          Welch&rsquo;s t-test: Technical vs Non-Technical
                          <span className="text-gray-500 font-normal ml-2">
                            (n<sub>tech</sub>={inf.t_tests_tech_vs_nontech.tech_n ?? '-'}, n
                            <sub>non-tech</sub>={inf.t_tests_tech_vs_nontech.nontech_n ?? '-'})
                          </span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm font-sans border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left p-2 border-b">Construct</th>
                                <th className="text-right p-2 border-b">t</th>
                                <th className="text-right p-2 border-b">df</th>
                                <th className="text-right p-2 border-b">p</th>
                                <th className="text-center p-2 border-b">Sig.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(inf.t_tests_tech_vs_nontech.constructs).map(
                                ([construct, vals]) => (
                                  <tr key={construct} className={vals.sig ? 'bg-green-50' : ''}>
                                    <td className="p-2 border-b capitalize">{construct}</td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {vals.t?.toFixed(3) ?? '-'}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {vals.df?.toFixed(1) ?? '-'}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {formatPValue(vals.p)}
                                    </td>
                                    <td className="text-center p-2 border-b">
                                      {vals.sig ? '✱' : ''}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* T-tests: Large vs Small/Medium */}
                    {inf.t_tests_large_vs_small?.constructs && (
                      <div>
                        <h4 className="font-sans font-semibold text-gray-700 text-sm mb-2">
                          Welch&rsquo;s t-test: Large vs Small/Medium Org
                          <span className="text-gray-500 font-normal ml-2">
                            (n<sub>large</sub>={inf.t_tests_large_vs_small.large_n ?? '-'}, n
                            <sub>sm/med</sub>={inf.t_tests_large_vs_small.small_medium_n ?? '-'})
                          </span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm font-sans border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left p-2 border-b">Construct</th>
                                <th className="text-right p-2 border-b">t</th>
                                <th className="text-right p-2 border-b">df</th>
                                <th className="text-right p-2 border-b">p</th>
                                <th className="text-center p-2 border-b">Sig.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(inf.t_tests_large_vs_small.constructs).map(
                                ([construct, vals]) => (
                                  <tr key={construct} className={vals.sig ? 'bg-green-50' : ''}>
                                    <td className="p-2 border-b capitalize">{construct}</td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {vals.t?.toFixed(3) ?? '-'}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {vals.df?.toFixed(1) ?? '-'}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {formatPValue(vals.p)}
                                    </td>
                                    <td className="text-center p-2 border-b">
                                      {vals.sig ? '✱' : ''}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ANOVA: by Role */}
                    {inf.anova_by_role?.constructs && (
                      <div>
                        <h4 className="font-sans font-semibold text-gray-700 text-sm mb-2">
                          One-way ANOVA: by Role
                          <span className="text-gray-500 font-normal ml-2">
                            ({inf.anova_by_role.groups?.join(', ')})
                          </span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm font-sans border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left p-2 border-b">Construct</th>
                                <th className="text-right p-2 border-b">F</th>
                                <th className="text-right p-2 border-b">df</th>
                                <th className="text-right p-2 border-b">p</th>
                                <th className="text-center p-2 border-b">Sig.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(inf.anova_by_role.constructs).map(
                                ([construct, vals]) => (
                                  <tr key={construct} className={vals.sig ? 'bg-green-50' : ''}>
                                    <td className="p-2 border-b capitalize">{construct}</td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {vals.f?.toFixed(3) ?? '-'}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {formatAnovaDf(vals.df_between, vals.df_within)}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {formatPValue(vals.p)}
                                    </td>
                                    <td className="text-center p-2 border-b">
                                      {vals.sig ? '✱' : ''}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ANOVA: by Org Size */}
                    {inf.anova_by_org_size?.constructs && (
                      <div>
                        <h4 className="font-sans font-semibold text-gray-700 text-sm mb-2">
                          One-way ANOVA: by Organization Size
                          <span className="text-gray-500 font-normal ml-2">
                            ({inf.anova_by_org_size.groups?.join(', ')})
                          </span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm font-sans border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left p-2 border-b">Construct</th>
                                <th className="text-right p-2 border-b">F</th>
                                <th className="text-right p-2 border-b">df</th>
                                <th className="text-right p-2 border-b">p</th>
                                <th className="text-center p-2 border-b">Sig.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(inf.anova_by_org_size.constructs).map(
                                ([construct, vals]) => (
                                  <tr key={construct} className={vals.sig ? 'bg-green-50' : ''}>
                                    <td className="p-2 border-b capitalize">{construct}</td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {vals.f?.toFixed(3) ?? '-'}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {formatAnovaDf(vals.df_between, vals.df_within)}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {formatPValue(vals.p)}
                                    </td>
                                    <td className="text-center p-2 border-b">
                                      {vals.sig ? '✱' : ''}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
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

        {/* ── Inferential Extensions (PR #1837 / issue #1839) ── */}
        <InferentialExtensions {...inferentialExtensionsProps} />

        {/* ── Completed Analyses ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Completed Analyses</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 max-w-lg mx-auto mb-6 font-sans text-base">
              The following additional analyses have been completed:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/results/crp-2026/validation"
                aria-label="View completed Regression Models analysis"
                className="inline-flex items-center gap-1.5 bg-white border border-green-300 rounded-full px-4 py-1.5 text-sm text-green-700 hover:bg-green-100 transition-colors"
              >
                <span aria-hidden="true">✓</span> Regression Models
              </Link>
              <Link
                href="/results/crp-2026/factor-analysis"
                aria-label="View completed Factor Analysis results"
                className="inline-flex items-center gap-1.5 bg-white border border-green-300 rounded-full px-4 py-1.5 text-sm text-green-700 hover:bg-green-100 transition-colors"
              >
                <span aria-hidden="true">✓</span> Factor Analysis
              </Link>
            </div>
          </div>
        </section>

        {/* ── Back Link ── */}
        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Related</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <Link href="/results/descriptive" className="text-blue-600 hover:underline">
                Descriptive Statistics
              </Link>{' '}
              - means, SDs, and correlations per result group
            </li>
            <li>
              <Link href="/results/sample" className="text-blue-600 hover:underline">
                Sample &amp; Demographics
              </Link>{' '}
              - demographic breakdowns per result group
            </li>
            <li>
              <Link href="/results/sensitivity" className="text-blue-600 hover:underline">
                Sensitivity Analysis
              </Link>{' '}
              - all metrics and deltas across datasets
            </li>
            <li>
              <Link href="/results/dataset-comparison" className="text-blue-600 hover:underline">
                Dataset Comparison
              </Link>{' '}
              - side-by-side statistics across all four result groups
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

export default FindingsPage
