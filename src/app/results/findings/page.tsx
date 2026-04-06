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
  title: 'Key Findings — TABS Results',
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

// Pre-compute sample map for O(1) lookups during rendering
const sampleMap = new Map(sensitivityData.samples.map((s) => [s.key, s]))

const PRIMARY_GROUPS = [
  { key: 'conservative_clean', label: 'Conservative Clean', color: 'border-green-500' },
  { key: 'flexible_clean', label: 'Flexible Clean', color: 'border-blue-500' },
  { key: 'prolific_accepted', label: 'Prolific Accepted', color: 'border-amber-500' },
  { key: 'v2_finished', label: 'All V2 Finished', color: 'border-gray-400' },
]

// Heatmap Color Scale (Red-based: low barriers = light, high barriers = dark)
// We use a base RGB of (220, 38, 38) -> Tailwind red-600
const getHeatmapColor = (val: number | null, min: number, max: number): string => {
  if (val === null) return 'transparent'
  // Calculate relative intensity (0 to 1)
  const range = max - min
  // Guard against divide-by-zero if all values are identical
  const intensity = range === 0 ? 0.5 : (val - min) / range
  // Map intensity to an opacity from 0.1 to 0.9 to ensure text remains readable
  const opacity = 0.1 + intensity * 0.8
  return `rgba(220, 38, 38, ${opacity})`
}

interface HeatmapDataCell {
  val: number | null
  n: number | null
}

interface HeatmapData {
  rowLabels: string[]
  matrixData: Record<string, Record<string, HeatmapDataCell>>
  minMean: number
  maxMean: number
}

const buildHeatmapData = (
  sampleDetails: Record<string, SampleDetail>,
  categoryKey: 'by_role' | 'by_org_size'
): HeatmapData => {
  const allGroups = new Set<string>()
  const matrixData: Record<string, Record<string, HeatmapDataCell>> = {}

  PRIMARY_GROUPS.forEach((g) => {
    const details = sampleDetails[g.key]
    const ct = details?.cross_tabs
    if (ct && ct[categoryKey]) {
      ct[categoryKey]?.forEach((row) => {
        allGroups.add(row.group)
      })
    }
  })

  const rowLabels = Array.from(allGroups)
  let minMean = Infinity
  let maxMean = -Infinity

  rowLabels.forEach((label) => {
    matrixData[label] = {}
    PRIMARY_GROUPS.forEach((g) => {
      const details = sampleDetails[g.key]
      const ct = details?.cross_tabs
      let val: number | null = null
      let n: number | null = null

      if (ct && ct[categoryKey]) {
        const row = ct[categoryKey]?.find((r) => r.group === label)
        if (row) {
          val = row.barrier_mean
          n = row.n
          if (val !== null && val < minMean) minMean = val
          if (val !== null && val > maxMean) maxMean = val
        }
      }
      matrixData[label][g.key] = { val, n }
    })
  })

  return { rowLabels, matrixData, minMean, maxMean }
}

const fmt = (val: number | null | undefined, decimals: number = 2): string => {
  if (val === null || val === undefined) return '—'
  const prefix = val > 0 ? '+' : ''
  return prefix + val.toFixed(decimals)
}

const formatPValue = (p: number | null | undefined): string => {
  if (p === null || p === undefined) return '—'
  return p < 0.001 ? '<.001' : p.toFixed(3)
}

const formatAnovaDf = (
  dfBetween: number | null | undefined,
  dfWithin: number | null | undefined
): string => {
  if (dfBetween == null || dfWithin == null) return '—'
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

const CrossTabHeatmap = ({ title, data }: { title: string; data: HeatmapData }) => {
  const { rowLabels, matrixData, minMean, maxMean } = data

  if (rowLabels.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic mt-2">
        {title} data will be populated by the next pipeline run.
      </p>
    )
  }

  return (
    <div className="mb-10">
      <h3 className={H3_CLASSES}>{title}</h3>
      <p className="text-sm text-gray-600 mb-3">
        Color intensity represents the mean barrier score (darker = higher barriers). Range across
        all groups: {minMean === Infinity ? '—' : minMean.toFixed(2)} to{' '}
        {maxMean === -Infinity ? '—' : maxMean.toFixed(2)}.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse bg-white rounded shadow-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-2 px-3 text-left font-semibold text-gray-700 min-w-[150px]">
                Group
              </th>
              {PRIMARY_GROUPS.map((g) => (
                <th
                  key={g.key}
                  className="py-2 px-3 text-center font-semibold text-gray-700 min-w-[120px]"
                >
                  {g.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rowLabel) => (
              <tr key={rowLabel} className="border-b border-gray-100 last:border-b-0">
                <td className="py-2 px-3 font-medium text-gray-800 bg-gray-50/50">{rowLabel}</td>
                {PRIMARY_GROUPS.map((g) => {
                  const cell = matrixData[rowLabel]?.[g.key]
                  const hasData = cell && cell.val !== null

                  return (
                    <td
                      key={g.key}
                      className="py-2 px-3 text-center"
                      style={{
                        backgroundColor: hasData
                          ? getHeatmapColor(cell.val, minMean, maxMean)
                          : 'transparent',
                      }}
                    >
                      {hasData ? (
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-gray-900 drop-shadow-sm">
                            {cell.val?.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-800 opacity-80 font-mono mt-0.5">
                            n={cell.n}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const FindingsPage = () => {
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
              Key Findings
            </li>
          </ol>
        </nav>

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

        {/* ── Technology Maturity Analysis ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Technology Maturity Analysis</h2>
          <p className={PARAGRAPH_CLASSES}>
            Technology maturity measures the extent to which an organization has formalized and
            optimized its technology processes. Higher scores indicate more advanced process
            management. This section highlights maturity trends across different result groups,
            respondent roles, and organizational characteristics.
          </p>

          {PRIMARY_GROUPS.map((group) => {
            const sample = sensitivityData.samples.find((s) => s.key === group.key)
            const details = sampleDetails[group.key]
            const ct = details?.cross_tabs
            const maturityMean = sensitivityData.metrics.find((m) => m.key === 'maturity_mean')
              ?.values?.[group.key as keyof (typeof sensitivityData.metrics)[0]['values']]
            const byRole = ct?.by_role
            const effects = details?.effect_sizes
            const inf = details?.inferential

            return (
              <div
                key={group.key}
                className={`border-l-4 ${group.color} bg-gray-50 rounded-lg p-5 mb-6`}
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-4 border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {group.label} (N={sample?.n ?? '—'})
                  </h3>
                  <div className="text-sm font-medium text-gray-500 mt-1 sm:mt-0">
                    Grand Mean: <span className="text-gray-900 font-mono">{fmt(maturityMean)}</span>
                  </div>
                </div>

                {byRole && byRole.length > 0 ? (
                  <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Role Breakdown Table */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                        Maturity by Role
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse bg-white/70 rounded text-left">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="py-1.5 px-2 font-semibold text-gray-600">
                                Role Group
                              </th>
                              <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                n
                              </th>
                              <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                Mean
                              </th>
                              <th className="py-1.5 px-2 text-left font-semibold text-gray-600">
                                &Delta; Grand
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {byRole.map((row) => {
                              const hasDiff = row.maturity_mean != null && maturityMean != null
                              const diff = hasDiff
                                ? (row.maturity_mean as number) - (maturityMean as number)
                                : 0
                              return (
                                <tr key={row.group} className="border-b border-gray-200">
                                  <td className="py-1.5 px-2 font-medium">{row.group}</td>
                                  <td className="py-1.5 px-2 text-right font-mono">{row.n}</td>
                                  <td className="py-1.5 px-2 text-right font-mono">
                                    {row.maturity_mean?.toFixed(2) ?? '—'}
                                  </td>
                                  <td className="py-1.5 px-2 font-mono text-[10px]">
                                    {hasDiff ? (
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`h-1.5 rounded-full ${
                                            diff >= 0 ? 'bg-green-500' : 'bg-rose-500'
                                          }`}
                                          style={{
                                            width: `${Math.min(Math.abs(diff) * 40, 60)}px`,
                                          }}
                                        ></div>
                                        <span
                                          className={diff >= 0 ? 'text-green-700' : 'text-rose-700'}
                                        >
                                          {diff >= 0 ? '+' : ''}
                                          {diff.toFixed(2)}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Maturity Statistics (Effect Sizes & Inferential) */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                        Maturity Statistical Tests
                      </h4>

                      {/* Technical Comparison */}
                      {effects?.tech_vs_nontech?.constructs?.maturity && (
                        <div className="bg-white/50 p-3 rounded border border-gray-200">
                          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                            Technical vs Non-Technical
                          </p>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium">Effect Size (d)</span>
                            <span className="text-xs font-mono font-bold">
                              {fmt(effects.tech_vs_nontech.constructs.maturity.d)}
                            </span>
                          </div>
                          {inf?.t_tests_tech_vs_nontech?.constructs?.maturity && (
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-gray-600">
                                Welch&rsquo;s t=
                                {inf.t_tests_tech_vs_nontech.constructs.maturity.t?.toFixed(2)}, p=
                                {formatPValue(inf.t_tests_tech_vs_nontech.constructs.maturity.p)}
                              </span>
                              {inf.t_tests_tech_vs_nontech.constructs.maturity.sig && (
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                  Significant
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ANOVA Results */}
                      {inf?.anova_by_role?.constructs?.maturity && (
                        <div className="bg-white/50 p-3 rounded border border-gray-200">
                          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                            One-way ANOVA by Role
                          </p>
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="text-gray-600">F-Statistic</span>
                            <span className="font-mono">
                              {inf.anova_by_role.constructs.maturity.f?.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-600">
                              df=
                              {formatAnovaDf(
                                inf.anova_by_role.constructs.maturity.df_between,
                                inf.anova_by_role.constructs.maturity.df_within
                              )}
                              , p={formatPValue(inf.anova_by_role.constructs.maturity.p)}
                            </span>
                            {inf.anova_by_role.constructs.maturity.sig && (
                              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                Significant
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-2">
                    Maturity data will be populated by the next pipeline run.
                  </p>
                )}
              </div>
            )
          })}
        </section>

        {/* ── Effect Sizes by Result Group ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Effect Sizes (Cohen&rsquo;s d)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Cohen&rsquo;s d measures the standardized difference between group means. Values of |d|
            &lt; 0.2 are negligible, 0.2&ndash;0.5 small, 0.5&ndash;0.8 medium, and &gt; 0.8 large.
            Each comparison is computed separately for each result group.
          </p>

          {PRIMARY_GROUPS.map((group) => {
            const sample = sampleMap.get(group.key)
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
                  {group.label} (N={sample?.n ?? '—'})
                </h3>

                {hasEffects ? (
                  <div className="space-y-4 mt-3">
                    {/* Tech vs Non-Tech */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                        Technical (CIO/CTO) vs Non-Technical — n=
                        {effects['tech_vs_nontech'].tech_n} vs n=
                        {effects['tech_vs_nontech'].nontech_n}
                      </h4>
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
                                  {vals.tech_mean?.toFixed(4) ?? '—'}
                                </td>
                                <td className="py-1.5 px-2 text-right font-mono">
                                  {vals.nontech_mean?.toFixed(4) ?? '—'}
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
                            Large Org (5000+) vs Small/Medium — n=
                            {effects['large_vs_small'].large_n} vs n=
                            {effects['large_vs_small'].small_medium_n}
                          </h4>
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
                                      {vals.large_mean?.toFixed(4) ?? '—'}
                                    </td>
                                    <td className="py-1.5 px-2 text-right font-mono">
                                      {vals.small_medium_mean?.toFixed(4) ?? '—'}
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
                  <p className="text-sm text-gray-500 italic mt-2">
                    Effect sizes will be populated by the next pipeline run.
                  </p>
                )}
              </div>
            )
          })}
        </section>

        {/* ── Cross-Tabulations by Result Group ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Cross-Tabulations Heatmap</h2>
          <p className={PARAGRAPH_CLASSES}>
            Cross-tabulations show mean barrier scores broken down by respondent subgroups (role,
            org size). The heatmap provides a side-by-side comparison across all data cleaning
            levels to visualize patterns and variations.
          </p>

          <CrossTabHeatmap
            title="Mean Barrier Score by Role"
            data={buildHeatmapData(sampleDetails, 'by_role')}
          />

          <CrossTabHeatmap
            title="Mean Barrier Score by Organization Size"
            data={buildHeatmapData(sampleDetails, 'by_org_size')}
          />
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
                            (n<sub>tech</sub>={inf.t_tests_tech_vs_nontech.tech_n ?? '—'}, n
                            <sub>non-tech</sub>={inf.t_tests_tech_vs_nontech.nontech_n ?? '—'})
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
                                      {vals.t?.toFixed(3) ?? '—'}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {vals.df?.toFixed(1) ?? '—'}
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
                            (n<sub>large</sub>={inf.t_tests_large_vs_small.large_n ?? '—'}, n
                            <sub>sm/med</sub>={inf.t_tests_large_vs_small.small_medium_n ?? '—'})
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
                                      {vals.t?.toFixed(3) ?? '—'}
                                    </td>
                                    <td className="text-right p-2 border-b font-mono">
                                      {vals.df?.toFixed(1) ?? '—'}
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
                                      {vals.f?.toFixed(3) ?? '—'}
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
                                      {vals.f?.toFixed(3) ?? '—'}
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
                  <p className="text-sm text-gray-500 italic mt-2">
                    Inferential statistics will be populated by the next pipeline run.
                  </p>
                )}
              </div>
            )
          })}
        </section>

        {/* ── Forthcoming Analyses ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Forthcoming Analyses</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 max-w-lg mx-auto mb-6 font-sans text-base">
              The following additional analyses are planned for future releases:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-block bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-600">
                Regression Models
              </span>
              <span className="inline-block bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-600">
                Factor Analysis
              </span>
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
              &mdash; means, SDs, and correlations per result group
            </li>
            <li>
              <Link href="/results/sample" className="text-blue-600 hover:underline">
                Sample &amp; Demographics
              </Link>{' '}
              &mdash; demographic breakdowns per result group
            </li>
            <li>
              <Link href="/results/sensitivity" className="text-blue-600 hover:underline">
                Sensitivity Analysis
              </Link>{' '}
              &mdash; all metrics and deltas across datasets
            </li>
            <li>
              <Link href="/results/dataset-comparison" className="text-blue-600 hover:underline">
                Dataset Comparison
              </Link>{' '}
              &mdash; side-by-side statistics across all four result groups
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

export default FindingsPage
