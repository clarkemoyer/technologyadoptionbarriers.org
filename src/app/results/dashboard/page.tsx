import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
import dispositionData from '@/data/disposition-summary.json'
import sensitivityData from '@/data/sensitivity-analysis.json'
import LastUpdated from '@/components/last-updated'

export const metadata: Metadata = {
  title: 'Prolific Dashboard - TABS Results',
  description:
    'Live disposition breakdown for the Technology Adoption Barriers Survey: approvals, rejections, flags, and manual review status.',
  alternates: {
    canonical: '/results/dashboard',
  },
}

const DISPOSITION_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; description: string }
> = {
  CLEAN: {
    label: 'Clean',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description:
      'All quality and auth checks passed: finished, all 3 IRIs correct, duration ≥ 9 min (Smeal benchmark), reCAPTCHA ≥ 0.5, no straightlining, no partial straightlining, Prolific auth checks passed. Approved on Prolific.',
  },
  'AUTO-EXCLUDE': {
    label: 'Auto-Exclude',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Failed 2+ attention checks or speed + attention compound failure.',
  },
  'FLAG-SINGLE-IRI': {
    label: 'Flag: Single IRI',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Missed 1 of 3 attention checks at normal speed. Manual review.',
  },
  'FLAG-SMEAL': {
    label: 'Flag: Smeal Benchmark',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Below 9-minute doctoral SME benchmark but passed all attention checks.',
  },
  'FLAG-PARTIAL-STRAIGHTLINING': {
    label: 'Flag: Partial Straightlining',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Near-identical responses in one or more question blocks (SD < 0.5).',
  },
  'FLAG-SPEED': {
    label: 'Flag: Speed',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Completed in under 5 minutes but passed all attention checks.',
  },
  'FLAG-RECAPTCHA': {
    label: 'Flag: reCAPTCHA',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'reCAPTCHA score below 0.5, indicating potential bot activity.',
  },
  'FLAG-STRAIGHTLINING': {
    label: 'Flag: Full Straightlining',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Same answer for every item in an entire question block.',
  },
  INCOMPLETE: {
    label: 'Incomplete',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 border-gray-200',
    description: 'Survey not completed.',
  },
}

const DispositionDashboardPage = () => {
  const d = dispositionData
  const total = d.uniqueParticipants
  const dispositions = d.dispositions as Record<string, number>

  // Pre-compute maps for O(1) lookups
  const sampleMap = new Map(sensitivityData.samples.map((s) => [s.key, s]))
  const metricMap = new Map(sensitivityData.metrics.map((m) => [m.key, m]))

  // Sensitivity data lookups used in multiple places on this page
  const conservativeCleanN = sampleMap.get('conservative_clean')?.n ?? null
  const prolificAcceptedN = sampleMap.get('prolific_accepted')?.n ?? null

  const approvedPct = total > 0 ? ((d.actions.approved / total) * 100).toFixed(1) : '0'
  const flaggedCount =
    (dispositions['FLAG-SPEED'] || 0) +
    (dispositions['FLAG-SINGLE-IRI'] || 0) +
    (dispositions['FLAG-SMEAL'] || 0) +
    (dispositions['FLAG-RECAPTCHA'] || 0) +
    (dispositions['FLAG-PARTIAL-STRAIGHTLINING'] || 0) +
    (dispositions['FLAG-STRAIGHTLINING'] || 0)
  const flaggedPct = total > 0 ? ((flaggedCount / total) * 100).toFixed(1) : '0'

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Response Disposition Dashboard</h1>
        <LastUpdated
          utcTimestamp={(dispositionData as Record<string, unknown>).last_updated as string}
        />

        <p className="mb-8 text-gray-600">
          Live quality triage results for the <strong>{d.studyName}</strong>. Data is updated
          automatically by the{' '}
          <a
            href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/actions/workflows/disposition-pipeline.yml"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            disposition pipeline
          </a>
          .
        </p>

        {/* Summary Cards */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border rounded-lg p-4 text-center bg-blue-50 border-blue-200">
              <div className="text-3xl font-bold text-blue-700">{total}</div>
              <div className="text-sm text-blue-600 mt-1">Total Participants</div>
            </div>
            <div className="border rounded-lg p-4 text-center bg-green-50 border-green-200">
              <div className="text-3xl font-bold text-green-700">{d.actions.approved}</div>
              <div className="text-sm text-green-600 mt-1">Approved ({approvedPct}%)</div>
            </div>
            <div className="border rounded-lg p-4 text-center bg-red-50 border-red-200">
              <div className="text-3xl font-bold text-red-700">
                {dispositions['AUTO-EXCLUDE'] || 0}
              </div>
              <div className="text-sm text-red-600 mt-1">
                Auto-Exclude (
                {total > 0
                  ? (((dispositions['AUTO-EXCLUDE'] || 0) / total) * 100).toFixed(1)
                  : '0.0'}
                %)
              </div>
            </div>
            <div className="border rounded-lg p-4 text-center bg-amber-50 border-amber-200">
              <div className="text-3xl font-bold text-amber-700">{flaggedCount}</div>
              <div className="text-sm text-amber-600 mt-1">Flagged for Review ({flaggedPct}%)</div>
            </div>
          </div>
        </section>

        {/* Disposition Breakdown */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Disposition Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(dispositions)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([disposition, count]) => {
                const config = DISPOSITION_CONFIG[disposition] || {
                  label: disposition,
                  color: 'text-gray-700',
                  bgColor: 'bg-gray-50 border-gray-200',
                  description: '',
                }
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0'
                const barWidth = total > 0 ? (count / total) * 100 : 0

                return (
                  <div key={disposition} className={`border rounded-lg p-4 ${config.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className={`font-semibold ${config.color}`}>{config.label}</span>
                        <span className="text-gray-500 text-sm ml-2">({disposition})</span>
                      </div>
                      <div className={`text-lg font-bold ${config.color}`}>
                        {count} <span className="text-sm font-normal text-gray-500">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${disposition === 'CLEAN' ? 'bg-green-500' : disposition === 'AUTO-EXCLUDE' ? 'bg-red-400' : 'bg-amber-400'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                )
              })}
          </div>
        </section>

        {/* AUTO-EXCLUDE Breakdown */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Auto-Exclude Breakdown</h2>
          <p className="mb-4 text-gray-600">
            The {dispositions['AUTO-EXCLUDE'] || 0} auto-excluded submissions are broken down by
            severity. Failed all 3 IRIs with speed violation is the strongest exclusion signal.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                key: 'IRI3_SPEED',
                label: 'Failed 3 IRI + Speed',
                description: 'All 3 attention checks wrong AND under 5 minutes',
                severity: 'Critical',
                color: 'text-red-800',
                bgColor: 'bg-red-100 border-red-300',
                barColor: 'bg-red-600',
              },
              {
                key: 'IRI3',
                label: 'Failed 3 IRI',
                description: 'All 3 attention checks wrong, normal speed',
                severity: 'High',
                color: 'text-red-700',
                bgColor: 'bg-red-50 border-red-200',
                barColor: 'bg-red-500',
              },
              {
                key: 'IRI2_SPEED',
                label: 'Failed 2 IRI + Speed',
                description: '2 of 3 attention checks wrong AND under 5 minutes',
                severity: 'High',
                color: 'text-red-700',
                bgColor: 'bg-red-50 border-red-200',
                barColor: 'bg-red-400',
              },
              {
                key: 'IRI2',
                label: 'Failed 2 IRI',
                description: '2 of 3 attention checks wrong, normal speed',
                severity: 'Moderate',
                color: 'text-orange-700',
                bgColor: 'bg-orange-50 border-orange-200',
                barColor: 'bg-orange-400',
              },
              {
                key: 'SPEED_IRI',
                label: 'Speed + 1 IRI',
                description: 'Under 5 minutes AND 1 attention check wrong (compound signal)',
                severity: 'Moderate',
                color: 'text-orange-700',
                bgColor: 'bg-orange-50 border-orange-200',
                barColor: 'bg-orange-300',
              },
            ].map((sub) => {
              const breakdown = (d.autoExcludeBreakdown ?? {}) as Record<string, number>
              const count = breakdown[sub.key] ?? 0
              const autoExcludeTotal = dispositions['AUTO-EXCLUDE'] || 0
              const pct = autoExcludeTotal > 0 ? ((count / autoExcludeTotal) * 100).toFixed(0) : '0'
              return (
                <div key={sub.key} className={`border rounded-lg p-4 ${sub.bgColor}`}>
                  <div className={`text-2xl font-bold ${sub.color}`}>{count}</div>
                  <div className={`text-sm font-semibold ${sub.color} mt-1`}>{sub.label}</div>
                  <div className="w-full bg-white/50 rounded-full h-1.5 my-2">
                    <div
                      className={`h-1.5 rounded-full ${sub.barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">{sub.description}</p>
                  <div className="text-xs text-gray-500 mt-1">{pct}% of auto-excludes</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Action Status */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Action Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: 'Approved on Prolific',
                    value: d.actions.approved,
                    color: 'text-green-700',
                  },
                  {
                    label: 'Rejected on Prolific',
                    value: d.actions.rejected,
                    color: 'text-red-700',
                  },
                  {
                    label: 'Awaiting Review',
                    value: (d.actions as Record<string, number>).awaitingReview ?? 0,
                    color: 'text-amber-700',
                  },
                  {
                    label: 'Returned',
                    value: (d.actions as Record<string, number>).returned ?? 0,
                    color: 'text-gray-600',
                  },
                  {
                    label: 'Timed Out',
                    value: (d.actions as Record<string, number>).timedOut ?? 0,
                    color: 'text-gray-500',
                  },
                  {
                    label: 'Messaged (unique participants)',
                    value: d.actions.messaged,
                    color: 'text-blue-700',
                  },
                ]
                  .filter((row) => row.value > 0)
                  .map((row) => (
                    <tr key={row.label} className="border-b border-gray-100">
                      <td className={`py-3 px-4 font-medium ${row.color}`}>{row.label}</td>
                      <td className={`py-3 px-4 text-right font-bold ${row.color}`}>{row.value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* IRI Pass Rates */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Attention Check (IRI) Pass Rates</h2>
          <p className="mb-4 text-gray-600">
            Three instructed-response items are embedded in the survey to detect inattentive
            responding. Each requires selecting a specific answer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Barrier IRI',
                rate: d.iriPassRates.barrier,
                expected: 'Major Barrier',
                items: 19,
              },
              {
                name: 'Readiness IRI',
                rate: d.iriPassRates.readiness,
                expected: 'Low Readiness/Capability',
                items: 18,
              },
              {
                name: 'Maturity IRI',
                rate: d.iriPassRates.maturity,
                expected: 'Level 2: Developing/Repeatable',
                items: 9,
              },
            ].map((iri) => (
              <div key={iri.name} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-2">{iri.name}</h3>
                <div className="text-2xl font-bold text-teal-700 mb-1">{iri.rate}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="h-2 rounded-full bg-teal-500" style={{ width: `${iri.rate}%` }} />
                </div>
                <p className="text-xs text-gray-500">
                  Block: {iri.items} items | Expected: &ldquo;{iri.expected}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Result Group Types - The Four Analysis Datasets ── */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Result Group Types - The Four Analysis Datasets</h2>
          <p className="mb-4 text-gray-600">
            Every TABS metric is computed independently across four primary result groups
            (datasets). Each group applies progressively fewer quality filters. Researchers choose
            which dataset to use based on their tolerance for data quality risk. All four are
            refreshed daily by the analysis pipeline. Full statistics for each group are available
            on the{' '}
            <Link href="/results/descriptive" className="text-blue-600 hover:underline">
              Descriptive Statistics
            </Link>
            ,{' '}
            <Link href="/results/reliability" className="text-blue-600 hover:underline">
              Scale Reliability
            </Link>
            , and{' '}
            <Link href="/results/sensitivity" className="text-blue-600 hover:underline">
              Sensitivity Analysis
            </Link>{' '}
            pages.
          </p>

          {/* Verification cross-check */}
          {(() => {
            const prolificApproved = d.actions.approved
            const pipelineAccepted = prolificAcceptedN
            const match = pipelineAccepted !== null && prolificApproved === pipelineAccepted
            return (
              <div
                className={`border-2 rounded-lg p-4 mb-6 ${match ? 'border-green-300 bg-green-50' : 'border-red-400 bg-red-50'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{match ? '✅' : '⚠️'}</span>
                  <span className={`font-bold ${match ? 'text-green-800' : 'text-red-800'}`}>
                    {match
                      ? 'Prolific API and pipeline Ns match'
                      : 'Prolific API and pipeline Ns do NOT match - investigate'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  Prolific API &ldquo;Approved&rdquo; tab: <strong>{prolificApproved}</strong>
                  {' · '}
                  Pipeline &ldquo;Prolific Accepted&rdquo; sample:{' '}
                  <strong>{pipelineAccepted ?? 'N/A'}</strong>
                  {!match && pipelineAccepted !== null && (
                    <span className="text-red-700 font-medium">
                      {' '}
                      (Δ = {Math.abs(prolificApproved - pipelineAccepted)})
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Both numbers should be identical. A mismatch indicates the approve automation
                  failed to send commands to Prolific, or Prolific enrichment is using stale data.
                </p>
              </div>
            )
          })()}

          {/* Four Result Groups - full statistics per dataset */}
          {(() => {
            const getVal = (metricKey: string, sampleKey: string): number | null => {
              const m = metricMap.get(metricKey)
              if (!m) return null
              return (m.values as Record<string, number | null>)[sampleKey] ?? null
            }
            const fmt4 = (v: number | null) => (v !== null ? v.toFixed(4) : '-')
            const fmt2 = (v: number | null) => (v !== null ? v.toFixed(2) : '-')

            const groups = [
              {
                num: 1,
                key: 'conservative_clean',
                label: 'Conservative Clean',
                color: 'border-green-500',
                bg: 'bg-green-50',
                definition:
                  'Prolific APPROVED + all quality checks (3 IRIs, duration ≥ 540s, reCAPTCHA, no straightlining, auth)',
                usage: 'Primary CRP analysis - all published findings',
              },
              {
                num: 2,
                key: 'flexible_clean',
                label: 'Flexible Clean',
                color: 'border-blue-500',
                bg: 'bg-blue-50',
                definition: 'Prolific APPROVED + basic quality (3 IRIs + duration ≥ 480s)',
                usage: 'Sensitivity analysis - verifies findings hold with lighter filters',
              },
              {
                num: 3,
                key: 'prolific_accepted',
                label: 'Prolific Accepted',
                color: 'border-amber-500',
                bg: 'bg-amber-50',
                definition:
                  'All deduplicated V2 rows with Prolific APPROVED status (must match Prolific UI)',
                usage: 'N ceiling - maximum usable sample, platform truth',
              },
              {
                num: 4,
                key: 'v2_finished',
                label: 'All V2 Finished',
                color: 'border-gray-400',
                bg: 'bg-gray-50',
                definition: 'All finished responses with duration ≥ 120s (any Prolific status)',
                usage: 'Full-population baseline - includes returned/rejected/awaiting',
              },
            ]

            return (
              <div className="space-y-6">
                {groups.map((group) => {
                  const sample = sampleMap.get(group.key)
                  return (
                    <div
                      key={group.key}
                      className={`border-l-4 ${group.color} ${group.bg} rounded-lg p-5`}
                    >
                      <div className="flex flex-wrap items-baseline gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-400">#{group.num}</span>
                        <h3 className="text-lg font-bold text-gray-900">{group.label}</h3>
                        <span className="text-lg font-mono font-bold text-gray-700">
                          N = {sample?.n ?? '-'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Definition:</strong> {group.definition}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Used for:</strong> {group.usage}
                      </p>

                      {/* Key statistics for this dataset */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse bg-white/70 rounded">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="py-1.5 px-2 text-left font-semibold text-gray-600">
                                Construct
                              </th>
                              <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                Mean
                              </th>
                              <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                SD
                              </th>
                              <th className="py-1.5 px-2 text-right font-semibold text-gray-600">
                                Cronbach&rsquo;s &alpha;
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                name: 'Barriers',
                                mean: 'barrier_mean',
                                sd: 'barrier_sd',
                                alpha: 'alpha_barriers',
                              },
                              {
                                name: 'Readiness',
                                mean: 'readiness_mean',
                                sd: 'readiness_sd',
                                alpha: 'alpha_readiness',
                              },
                              {
                                name: 'Maturity',
                                mean: 'maturity_mean',
                                sd: 'maturity_sd',
                                alpha: 'alpha_maturity',
                              },
                            ].map((c) => (
                              <tr key={c.name} className="border-b border-gray-200">
                                <td className="py-1.5 px-2 font-medium text-gray-800">{c.name}</td>
                                <td className="py-1.5 px-2 text-right font-mono">
                                  {fmt4(getVal(c.mean, group.key))}
                                </td>
                                <td className="py-1.5 px-2 text-right font-mono">
                                  {fmt4(getVal(c.sd, group.key))}
                                </td>
                                <td className="py-1.5 px-2 text-right font-mono">
                                  {fmt4(getVal(c.alpha, group.key))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Correlations for this dataset */}
                      <div className="mt-2 text-xs text-gray-600">
                        <strong>Correlations:</strong> B-R = {fmt2(getVal('corr_br', group.key))},
                        B-M = {fmt2(getVal('corr_bm', group.key))}, R-M ={' '}
                        {fmt2(getVal('corr_rm', group.key))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          <p className="mt-4 text-sm text-gray-500">
            Conservative Clean ⊂ Flexible Clean ⊂ Prolific Accepted. All V2 Finished overlaps with
            Prolific Accepted but is not a strict subset (it includes non-APPROVED responses;
            Prolific Accepted includes incomplete-but-approved responses).
          </p>

          {/* Disposition CLEAN vs Conservative Clean */}
          <div className="bg-white border-2 border-amber-400 rounded-lg p-5 my-6">
            <h3 className="text-base font-bold text-amber-900 mb-2">
              Note: Disposition CLEAN ({dispositions['CLEAN'] || 0}) vs. Conservative Clean (
              {conservativeCleanN ?? '?'})
            </h3>
            <p className="text-sm text-gray-800 mb-2">
              <strong>Disposition CLEAN</strong> is the operations concept: a response that passes
              all quality checks in the waterfall (below). It is used to auto-approve participants
              on Prolific. It does <em>not</em> check Prolific_Status.
            </p>
            <p className="text-sm text-gray-800 mb-2">
              <strong>Conservative Clean</strong> is the analysis concept: Prolific_Status ==
              APPROVED <em>plus</em> all quality checks. This is the primary analysis sample.
            </p>
            <p className="text-sm text-gray-800">
              <strong>Expected:</strong> After the daily auto-approve workflow runs, all Disposition
              CLEAN participants should have Prolific_Status == APPROVED, making the counts
              converge. Any persistent gap indicates the approve automation failed to send commands
              to Prolific. The gap is currently{' '}
              <strong>{Math.abs((dispositions['CLEAN'] || 0) - (conservativeCleanN ?? 0))}</strong>,
              explained by{' '}
              {(dispositionData.dispositionByStatus as Record<string, Record<string, number>>)?.[
                'FLAG-PARTIAL-STRAIGHTLINING'
              ]?.['APPROVED'] ?? 0}{' '}
              partial-straightlining responses that were manually approved on Prolific but excluded
              from Conservative Clean.
            </p>
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Disposition Waterfall</h2>
          <p className="mb-4 text-gray-600">
            Each response is evaluated through this waterfall - the first matching step determines
            the disposition:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-2 px-3 font-semibold text-gray-600">Step</th>
                  <th className="py-2 px-3 font-semibold text-gray-600">Disposition</th>
                  <th className="py-2 px-3 font-semibold text-gray-600">Criteria</th>
                  <th className="py-2 px-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">0</td>
                  <td className="py-2 px-3 font-medium">INCOMPLETE</td>
                  <td className="py-2 px-3">Survey not finished</td>
                  <td className="py-2 px-3 text-gray-400">-</td>
                </tr>
                <tr className="border-b border-gray-100 bg-red-50/50">
                  <td className="py-2 px-3" rowSpan={5}>
                    1
                  </td>
                  <td className="py-2 px-3 font-medium text-red-800">AUTO-EXCLUDE: IRI3+Speed</td>
                  <td className="py-2 px-3">All 3 IRI checks wrong AND under 5 minutes</td>
                  <td className="py-2 px-3 text-red-700 font-medium">Auto-reject</td>
                </tr>
                <tr className="border-b border-gray-100 bg-red-50/50">
                  <td className="py-2 px-3 font-medium text-red-700">AUTO-EXCLUDE: IRI3</td>
                  <td className="py-2 px-3">All 3 IRI checks wrong, normal speed</td>
                  <td className="py-2 px-3 text-red-700 font-medium">Auto-reject</td>
                </tr>
                <tr className="border-b border-gray-100 bg-red-50/50">
                  <td className="py-2 px-3 font-medium text-red-700">AUTO-EXCLUDE: IRI2+Speed</td>
                  <td className="py-2 px-3">2 of 3 IRI checks wrong AND under 5 minutes</td>
                  <td className="py-2 px-3 text-red-700 font-medium">Auto-reject</td>
                </tr>
                <tr className="border-b border-gray-100 bg-red-50/30">
                  <td className="py-2 px-3 font-medium text-orange-700">AUTO-EXCLUDE: IRI2</td>
                  <td className="py-2 px-3">2 of 3 IRI checks wrong, normal speed</td>
                  <td className="py-2 px-3 text-orange-700 font-medium">Pending</td>
                </tr>
                <tr className="border-b border-gray-100 bg-red-50/30">
                  <td className="py-2 px-3 font-medium text-orange-700">AUTO-EXCLUDE: Speed+IRI</td>
                  <td className="py-2 px-3">Under 5 minutes AND 1 IRI failure (compound)</td>
                  <td className="py-2 px-3 text-orange-700 font-medium">Pending</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">2</td>
                  <td className="py-2 px-3 font-medium text-orange-700">FLAG-SPEED</td>
                  <td className="py-2 px-3">&lt;5 min but all 3 IRIs passed</td>
                  <td className="py-2 px-3 text-blue-600 font-medium">Message + review</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">3</td>
                  <td className="py-2 px-3 font-medium text-amber-700">FLAG-SINGLE-IRI</td>
                  <td className="py-2 px-3">1 IRI failure at normal speed</td>
                  <td className="py-2 px-3 text-blue-600 font-medium">Message + review</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 font-medium text-amber-700">FLAG-SMEAL</td>
                  <td className="py-2 px-3">5-9 min (below Smeal eDBA benchmark of 9 min)</td>
                  <td className="py-2 px-3 text-blue-600 font-medium">Message + review</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">5</td>
                  <td className="py-2 px-3 font-medium text-orange-700">FLAG-RECAPTCHA</td>
                  <td className="py-2 px-3">reCAPTCHA score &lt; 0.5</td>
                  <td className="py-2 px-3 text-blue-600 font-medium">Message + review</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">6</td>
                  <td className="py-2 px-3 font-medium text-red-700">FLAG-STRAIGHTLINING</td>
                  <td className="py-2 px-3">Qualtrics: same answer for every item in a block</td>
                  <td className="py-2 px-3 text-red-700 font-medium">Auto-reject</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">7</td>
                  <td className="py-2 px-3 font-medium text-amber-700">
                    FLAG-PARTIAL-STRAIGHTLINING
                  </td>
                  <td className="py-2 px-3">Within-person SD &lt; 0.5 in any question block</td>
                  <td className="py-2 px-3 text-blue-600 font-medium">Message + review</td>
                </tr>
                <tr className="bg-green-50/50">
                  <td className="py-2 px-3">8</td>
                  <td className="py-2 px-3 font-medium text-green-700">CLEAN</td>
                  <td className="py-2 px-3">All checks passed</td>
                  <td className="py-2 px-3 text-green-700 font-medium">Auto-approve</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
          <p>
            Last updated:{' '}
            {new Date(d.updatedAt.replace(/\.\d{4,}/, (m: string) => m.slice(0, 4))).toLocaleString(
              'en-US',
              {
                dateStyle: 'medium',
                timeStyle: 'short',
              }
            )}
          </p>
          <p className="mt-1">
            Reference: Meade &amp; Craig (2012). Identifying careless responses in survey data.{' '}
            <em>Psychological Methods</em>, 17(3), 437-455.
          </p>
        </footer>
      </article>
    </div>
  )
}

export default DispositionDashboardPage
