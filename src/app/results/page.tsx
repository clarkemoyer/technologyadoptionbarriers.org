import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, PARAGRAPH_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
import sensitivityData from '@/data/sensitivity-analysis.json'
import LastUpdated from '@/components/last-updated'
export const metadata: Metadata = {
  title: 'Results - TABS',
  description:
    'Survey results from the Technology Adoption Barriers Survey: sample demographics, descriptive statistics, scale reliability, sensitivity analysis, and open data.',
  alternates: {
    canonical: '/results',
  },
}

const ResultsPage = () => {
  const conservativeN =
    sensitivityData.samples.find((s) => s.key === 'conservative_clean')?.n ?? '-'
  const prolificN = sensitivityData.samples.find((s) => s.key === 'prolific_accepted')?.n ?? '-'
  const totalN = sensitivityData.samples.find((s) => s.key === 'v2_all')?.n ?? '-'

  const alphaBarriers = sensitivityData.metrics.find((m) => m.key === 'alpha_barriers')?.values
    ?.conservative_clean
  const alphaReadiness = sensitivityData.metrics.find((m) => m.key === 'alpha_readiness')?.values
    ?.conservative_clean
  const alphaMaturity = sensitivityData.metrics.find((m) => m.key === 'alpha_maturity')?.values
    ?.conservative_clean
  const alphaValues = [alphaBarriers, alphaReadiness, alphaMaturity].filter(
    (v): v is number => typeof v === 'number' && isFinite(v)
  )
  const minAlphaDisplay = alphaValues.length === 3 ? Math.min(...alphaValues).toFixed(2) : '-'

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Results</h1>
        <LastUpdated
          utcTimestamp={(sensitivityData as Record<string, unknown>).last_updated as string}
        />

        <section className="mb-10 text-gray-800">
          <p className={PARAGRAPH_CLASSES}>
            The Technology Adoption Barriers Survey (TABS) collects data from organizational leaders
            about the barriers, readiness, and maturity factors that influence technology adoption.
            Every metric is computed independently across four primary result groups so researchers
            can choose the dataset that matches their quality requirements.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            All statistics are generated automatically by the{' '}
            <Link
              href="/results/data-quality"
              className="text-blue-600 hover:underline font-medium"
            >
              daily analysis pipeline
            </Link>{' '}
            and updated every time new data is collected.
          </p>
        </section>

        {/* ── Hero Stats ── */}
        <section className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Responses', value: String(totalN) },
              { label: 'Prolific Approved', value: String(prolificN) },
              { label: 'Clean Sample', value: String(conservativeN) },
              { label: 'Min Cronbach α', value: minAlphaDisplay },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-tabs-teal-deep font-mono">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Page Grid ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Explore the Data</h2>
          <p className={PARAGRAPH_CLASSES}>
            Each page below covers a different aspect of the survey results. Pages are updated daily
            from live pipeline data.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Sample & Demographics',
                href: '/results/sample',
                desc: 'Participant roles, org sizes, and profit models - broken down per result group.',
                border: 'border-blue-200',
                bg: 'bg-blue-50',
                titleColor: 'text-blue-900',
                textColor: 'text-blue-800',
              },
              {
                title: 'Data Quality Pipeline',
                href: '/results/data-quality',
                desc: 'Disposition waterfall, attention checks, edge cases, and sample definitions.',
                border: 'border-amber-200',
                bg: 'bg-amber-50',
                titleColor: 'text-amber-900',
                textColor: 'text-amber-800',
              },
              {
                title: 'Descriptive Statistics',
                href: '/results/descriptive',
                desc: 'Grand means, SDs, and inter-construct correlations - computed per result group.',
                border: 'border-green-200',
                bg: 'bg-green-50',
                titleColor: 'text-green-900',
                textColor: 'text-green-800',
              },
              {
                title: 'Scale Reliability',
                href: '/results/reliability',
                desc: "Cronbach's alpha for each construct across all five sample definitions.",
                border: 'border-purple-200',
                bg: 'bg-purple-50',
                titleColor: 'text-purple-900',
                textColor: 'text-purple-800',
              },
              {
                title: 'Sensitivity Analysis',
                href: '/results/sensitivity',
                desc: 'Every metric across all datasets plus deltas showing how results change with cleaning.',
                border: 'border-rose-200',
                bg: 'bg-rose-50',
                titleColor: 'text-rose-900',
                textColor: 'text-rose-800',
              },
              {
                title: 'Key Findings',
                href: '/results/findings',
                desc: 'Effect sizes, t-tests, ANOVA, and cross-tabulations per result group.',
                border: 'border-gray-200',
                bg: 'bg-gray-50',
                titleColor: 'text-gray-900',
                textColor: 'text-gray-600',
              },
              {
                title: 'Dataset Comparison',
                href: '/results/dataset-comparison',
                desc: 'Side-by-side statistics, demographics, and effect sizes across all four result groups.',
                border: 'border-emerald-200',
                bg: 'bg-emerald-50',
                titleColor: 'text-emerald-900',
                textColor: 'text-emerald-800',
              },
              {
                title: 'Survey Statistics',
                href: '/results/survey-stats',
                desc: 'Live response metrics pulled from the Qualtrics survey platform.',
                border: 'border-teal-200',
                bg: 'bg-teal-50',
                titleColor: 'text-teal-900',
                textColor: 'text-teal-800',
              },
              {
                title: 'Prolific Dashboard',
                href: '/results/dashboard',
                desc: 'Real-time submission statuses, approval rates, and messaging activity.',
                border: 'border-indigo-200',
                bg: 'bg-indigo-50',
                titleColor: 'text-indigo-900',
                textColor: 'text-indigo-800',
              },
              {
                title: 'CMO Survey Comparison',
                href: '/results/cmo-survey',
                desc: 'How TABS results compare to the long-running CMO Survey benchmarks.',
                border: 'border-orange-200',
                bg: 'bg-orange-50',
                titleColor: 'text-orange-900',
                textColor: 'text-orange-800',
              },
              {
                title: 'Open Data & Reproducibility',
                href: '/results/reproducibility',
                desc: 'De-identified dataset, analysis scripts, and instructions to reproduce every result.',
                border: 'border-cyan-200',
                bg: 'bg-cyan-50',
                titleColor: 'text-cyan-900',
                textColor: 'text-cyan-800',
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`block rounded-xl border ${card.border} ${card.bg} p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`}
              >
                <h3 className={`text-base font-semibold ${card.titleColor} mb-1`}>{card.title}</h3>
                <p className={`text-sm ${card.textColor}`}>{card.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── How to Cite ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How to Cite</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 font-sans text-sm">
            <p className="mb-2 font-medium">APA Format:</p>
            <p className="text-gray-700 italic">
              Moyer, C. (2026). Technology Adoption Barriers Survey (TABS): Survey results and open
              data.{' '}
              <span className="not-italic">https://technologyadoptionbarriers.org/results</span>
            </p>
          </div>
        </section>

        {/* ── Methodology Link ── */}
        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            For details on how this data is collected, processed, and validated, see the{' '}
            <Link href="/making-of-tabs" className="text-blue-600 hover:underline">
              Making of TABS
            </Link>{' '}
            section.
          </p>
        </section>
      </article>
    </div>
  )
}

export default ResultsPage
