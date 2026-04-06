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
  title: 'Dataset Comparison — TABS Results',
  description:
    'Side-by-side comparison of all statistics across the four primary result groups of the Technology Adoption Barriers Survey.',
  alternates: {
    canonical: '/results/dataset-comparison',
  },
}

interface SampleInfo {
  key: string
  label: string
  n: number
}

interface MetricInfo {
  key: string
  label: string
  values: Record<string, number | null>
}

const PRIMARY_GROUPS = [
  { key: 'conservative_clean', label: 'Conservative Clean', color: 'bg-green-50' },
  { key: 'flexible_clean', label: 'Flexible Clean', color: 'bg-blue-50' },
  { key: 'prolific_accepted', label: 'Prolific Accepted', color: 'bg-amber-50' },
  { key: 'v2_finished', label: 'All V2 Finished', color: 'bg-gray-50' },
]

const fmt = (val: number | null | undefined, decimals: number = 4): string => {
  if (val === null || val === undefined || !isFinite(val)) return '—'
  return val.toFixed(decimals)
}

const ORG_SIZE_ORDER = ['<100', '100-499', '500-999', '1000-4999', '5000-9999', '10000+']

const DatasetComparisonPage = () => {
  const samples: SampleInfo[] = (sensitivityData.samples ?? []).filter((s) =>
    PRIMARY_GROUPS.some((g) => g.key === s.key)
  ) as SampleInfo[]

  const metrics: MetricInfo[] = (sensitivityData.metrics ?? []) as MetricInfo[]
  const sampleDetails = (sensitivityData as Record<string, unknown>).sample_details as Record<
    string,
    Record<string, unknown>
  >

  // Get the conservative clean values as the baseline for delta computation
  const baselineKey = 'conservative_clean'

  return (
    <main id="main-content" className="pt-20 sm:pt-[120px] min-h-screen bg-white">
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
              Dataset Comparison
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Dataset Comparison</h1>
        <LastUpdated
          utcTimestamp={(sensitivityData as Record<string, unknown>).last_updated as string}
        />

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This page provides a comprehensive side-by-side comparison of all four primary result
            groups. Each group represents an independent dataset with progressively less restrictive
            quality criteria. Researchers can use this comparison to assess how data cleaning
            decisions affect statistical conclusions.
          </p>
        </section>

        {/* ── Sample Overview ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sample Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 border-b font-semibold">#</th>
                  <th className="text-left p-3 border-b font-semibold">Result Group</th>
                  <th className="text-right p-3 border-b font-semibold">N</th>
                  <th className="text-left p-3 border-b font-semibold">Definition</th>
                </tr>
              </thead>
              <tbody>
                {PRIMARY_GROUPS.map((group, i) => {
                  const sample = samples.find((s) => s.key === group.key)
                  const desc =
                    sensitivityData.samples.find((s) => s.key === group.key)?.description ?? ''
                  return (
                    <tr key={group.key} className={group.color}>
                      <td className="p-3 border-b">{i + 1}</td>
                      <td className="p-3 border-b font-medium">{group.label}</td>
                      <td className="text-right p-3 border-b font-mono font-semibold">
                        {sample?.n ?? '—'}
                      </td>
                      <td className="p-3 border-b text-gray-600 text-xs">{desc}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Core Metrics Comparison ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Core Metrics Comparison</h2>
          <p className={PARAGRAPH_CLASSES}>
            All descriptive statistics, reliability coefficients, and correlations are shown for
            each result group. The &Delta; column shows the difference from Conservative Clean (the
            strictest dataset). Deltas &gt; 0.05 are highlighted in amber.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 border-b font-semibold">Metric</th>
                  {PRIMARY_GROUPS.map((g) => (
                    <th key={g.key} className="text-right p-2 border-b font-semibold">
                      {g.label}
                    </th>
                  ))}
                  {PRIMARY_GROUPS.slice(1).map((g) => (
                    <th
                      key={`delta-${g.key}`}
                      className="text-right p-2 border-b font-semibold text-gray-500"
                    >
                      &Delta; {g.label.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => {
                  const baseVal = metric.values?.[baselineKey]
                  return (
                    <tr key={metric.key} className="hover:bg-gray-50">
                      <td className="p-2 border-b">{metric.label}</td>
                      {PRIMARY_GROUPS.map((g) => (
                        <td key={g.key} className="text-right p-2 border-b font-mono">
                          {fmt(metric.values?.[g.key])}
                        </td>
                      ))}
                      {PRIMARY_GROUPS.slice(1).map((g) => {
                        const val = metric.values?.[g.key]
                        const delta =
                          val != null && baseVal != null && isFinite(val) && isFinite(baseVal)
                            ? val - baseVal
                            : null
                        const isLarge = delta != null && Math.abs(delta) > 0.05
                        return (
                          <td
                            key={`delta-${g.key}`}
                            className={`text-right p-2 border-b font-mono ${isLarge ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-gray-500'}`}
                          >
                            {delta != null ? `${delta >= 0 ? '+' : ''}${delta.toFixed(4)}` : '—'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Demographic Composition Comparison ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Survey Demographics Comparison (Qualtrics)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Role distribution and organization size breakdown for each result group, based on
            self-reported survey responses (Q1, Q4). These are organizational demographics from the
            TABS instrument. Prolific platform demographics (age, sex, ethnicity, plus prescreener
            fields like industry, company size, and occupation) are collected separately and can be
            used to cross-validate these survey responses via Prolific Participant ID.
          </p>

          <h3 className={H3_CLASSES}>Tech vs Non-Tech Composition</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 border-b">Result Group</th>
                  <th className="text-right p-2 border-b">N</th>
                  <th className="text-right p-2 border-b">Technical</th>
                  <th className="text-right p-2 border-b">Non-Technical</th>
                  <th className="text-right p-2 border-b">Other</th>
                  <th className="text-right p-2 border-b">% Tech</th>
                </tr>
              </thead>
              <tbody>
                {PRIMARY_GROUPS.map((group) => {
                  const details = sampleDetails?.[group.key] as Record<string, unknown> | undefined
                  const demo = details?.demographics as Record<string, unknown> | undefined
                  const tvn = demo?.tech_vs_nontech as Record<string, number> | undefined
                  const tech = tvn?.technical ?? 0
                  const nontech = tvn?.non_technical ?? 0
                  const other = tvn?.other ?? 0
                  const total = tech + nontech + other
                  const pctTech = total > 0 ? ((tech / total) * 100).toFixed(1) : '—'
                  return (
                    <tr key={group.key} className={group.color}>
                      <td className="p-2 border-b font-medium">{group.label}</td>
                      <td className="text-right p-2 border-b font-mono">{total || '—'}</td>
                      <td className="text-right p-2 border-b font-mono">{tech || '—'}</td>
                      <td className="text-right p-2 border-b font-mono">{nontech || '—'}</td>
                      <td className="text-right p-2 border-b font-mono">{other || '—'}</td>
                      <td className="text-right p-2 border-b font-mono">
                        {pctTech !== '—' ? `${pctTech}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <h3 className={H3_CLASSES}>Organization Size Distribution</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 border-b">Result Group</th>
                  <th className="text-right p-2 border-b">&lt;100</th>
                  <th className="text-right p-2 border-b">100–499</th>
                  <th className="text-right p-2 border-b">500–999</th>
                  <th className="text-right p-2 border-b">1000–4999</th>
                  <th className="text-right p-2 border-b">5000–9999</th>
                  <th className="text-right p-2 border-b">10000+</th>
                </tr>
              </thead>
              <tbody>
                {PRIMARY_GROUPS.map((group) => {
                  const details = sampleDetails?.[group.key] as Record<string, unknown> | undefined
                  const demo = details?.demographics as Record<string, unknown> | undefined
                  const sizes = (demo?.org_sizes ?? {}) as Record<string, number>
                  return (
                    <tr key={group.key} className={group.color}>
                      <td className="p-2 border-b font-medium">{group.label}</td>
                      {ORG_SIZE_ORDER.map((s) => (
                        <td key={s} className="text-right p-2 border-b font-mono">
                          {sizes[s] || '—'}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Effect Size Comparison ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Effect Size Comparison</h2>
          <p className={PARAGRAPH_CLASSES}>
            Cohen&rsquo;s d effect sizes for key group comparisons across all four result groups.
            This shows how effect sizes shift as the sample becomes less restrictive.
          </p>

          <h3 className={H3_CLASSES}>Tech vs Non-Tech (Cohen&rsquo;s d)</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 border-b">Construct</th>
                  {PRIMARY_GROUPS.map((g) => (
                    <th key={g.key} className="text-right p-2 border-b">
                      {g.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['barriers', 'readiness', 'maturity'].map((construct) => (
                  <tr key={construct} className="hover:bg-gray-50">
                    <td className="p-2 border-b capitalize">{construct}</td>
                    {PRIMARY_GROUPS.map((group) => {
                      const details = sampleDetails?.[group.key] as
                        | Record<string, unknown>
                        | undefined
                      const es = details?.effect_sizes as Record<string, unknown> | undefined
                      const tvn = es?.tech_vs_nontech as Record<string, unknown> | undefined
                      const constructs = tvn?.constructs as Record<string, unknown> | undefined
                      const c = constructs?.[construct] as Record<string, number | null> | undefined
                      return (
                        <td key={group.key} className="text-right p-2 border-b font-mono">
                          {c?.d != null ? c.d.toFixed(3) : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className={H3_CLASSES}>Large vs Small/Medium Org (Cohen&rsquo;s d)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 border-b">Construct</th>
                  {PRIMARY_GROUPS.map((g) => (
                    <th key={g.key} className="text-right p-2 border-b">
                      {g.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['barriers', 'readiness'].map((construct) => (
                  <tr key={construct} className="hover:bg-gray-50">
                    <td className="p-2 border-b capitalize">{construct}</td>
                    {PRIMARY_GROUPS.map((group) => {
                      const details = sampleDetails?.[group.key] as
                        | Record<string, unknown>
                        | undefined
                      const es = details?.effect_sizes as Record<string, unknown> | undefined
                      const lvs = es?.large_vs_small as Record<string, unknown> | undefined
                      const constructs = lvs?.constructs as Record<string, unknown> | undefined
                      const c = constructs?.[construct] as Record<string, number | null> | undefined
                      return (
                        <td key={group.key} className="text-right p-2 border-b font-mono">
                          {c?.d != null ? c.d.toFixed(3) : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Interpretation ── */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Interpretation Guide</h2>
          <p className={PARAGRAPH_CLASSES}>
            Metrics that remain <strong>stable</strong> across all four groups suggest robust
            findings that are not sensitive to data cleaning decisions. Metrics that show{' '}
            <strong>large deltas</strong> (highlighted in amber) between Conservative Clean and less
            restrictive groups warrant further investigation, as the finding may depend on sample
            composition.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            As a rule of thumb: if a Cohen&rsquo;s d shifts by more than 0.1 between Conservative
            Clean and All V2 Finished, the effect size may be inflated or attenuated by
            lower-quality responses. Similarly, if Cronbach&rsquo;s &alpha; drops below 0.70 in
            larger samples, it may indicate that less-engaged respondents are adding noise to the
            scale.
          </p>
        </section>

        {/* ── Back Link ── */}
        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Related</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <Link href="/results/findings" className="text-blue-600 hover:underline">
                Key Findings
              </Link>{' '}
              &mdash; effect sizes, t-tests, and ANOVA per result group
            </li>
            <li>
              <Link href="/results/sensitivity" className="text-blue-600 hover:underline">
                Sensitivity Analysis
              </Link>{' '}
              &mdash; metric-level sensitivity across sample definitions
            </li>
            <li>
              <Link href="/results/descriptive" className="text-blue-600 hover:underline">
                Descriptive Statistics
              </Link>{' '}
              &mdash; correlation matrices per result group
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

export default DatasetComparisonPage
