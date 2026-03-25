import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
import dispositionData from '@/data/disposition-summary.json'

export const metadata: Metadata = {
  title: 'Response Disposition Dashboard — TABS',
  description:
    'Live disposition breakdown for the Technology Adoption Barriers Survey: approvals, rejections, flags, and manual review status.',
  alternates: {
    canonical: '/making-of-tabs/integrations/prolific/dashboard',
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
    description: 'All quality checks passed. Approved on Prolific.',
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

  const approvedPct = total > 0 ? ((d.actions.approved / total) * 100).toFixed(1) : '0'
  const rejectedPct = total > 0 ? ((d.actions.rejected / total) * 100).toFixed(1) : '0'
  const flaggedCount =
    (dispositions['FLAG-SPEED'] || 0) +
    (dispositions['FLAG-SINGLE-IRI'] || 0) +
    (dispositions['FLAG-SMEAL'] || 0) +
    (dispositions['FLAG-RECAPTCHA'] || 0) +
    (dispositions['FLAG-PARTIAL-STRAIGHTLINING'] || 0) +
    (dispositions['FLAG-STRAIGHTLINING'] || 0)
  const flaggedPct = total > 0 ? ((flaggedCount / total) * 100).toFixed(1) : '0'

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/making-of-tabs" className="hover:text-blue-600 hover:underline">
                Making of TABS
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations"
                className="hover:text-blue-600 hover:underline"
              >
                Integrations
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/prolific"
                className="hover:text-blue-600 hover:underline"
              >
                Prolific
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Dashboard
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Response Disposition Dashboard</h1>

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
                {d.actions.rejected + (dispositions['AUTO-EXCLUDE'] || 0) - d.actions.rejected}
              </div>
              <div className="text-sm text-red-600 mt-1">
                Auto-Exclude ({(((dispositions['AUTO-EXCLUDE'] || 0) / total) * 100).toFixed(1)}%)
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
                key: 'SPEED_IRI1',
                label: 'Speed + 1 IRI',
                description: 'Under 5 minutes AND 1 attention check wrong (compound signal)',
                severity: 'Moderate',
                color: 'text-orange-700',
                bgColor: 'bg-orange-50 border-orange-200',
                barColor: 'bg-orange-300',
              },
            ].map((sub) => {
              const count = (d.autoExcludeBreakdown as Record<string, number>)[sub.key] || 0
              const autoExcludeTotal = dispositions['AUTO-EXCLUDE'] || 1
              const pct = ((count / autoExcludeTotal) * 100).toFixed(0)
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
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-green-700 font-medium">Approved on Prolific</td>
                  <td className="py-3 px-4 text-right font-bold text-green-700">
                    {d.actions.approved}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-red-700 font-medium">Rejected on Prolific</td>
                  <td className="py-3 px-4 text-right font-bold text-red-700">
                    {d.actions.rejected}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-blue-700 font-medium">Messaged (awaiting reply)</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">
                    {d.actions.messaged}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-amber-700 font-medium">Pending Review</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-700">
                    {d.actions.pendingReview}
                  </td>
                </tr>
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

        {/* Methodology */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Disposition Waterfall</h2>
          <p className="mb-4 text-gray-600">
            Each response is evaluated through this waterfall — the first matching step determines
            the disposition:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-2 px-3 font-semibold text-gray-600">Step</th>
                  <th className="py-2 px-3 font-semibold text-gray-600">Disposition</th>
                  <th className="py-2 px-3 font-semibold text-gray-600">Criteria</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">0</td>
                  <td className="py-2 px-3 font-medium">INCOMPLETE</td>
                  <td className="py-2 px-3">Survey not finished</td>
                </tr>
                <tr className="border-b border-gray-100 bg-red-50/50">
                  <td className="py-2 px-3">1</td>
                  <td className="py-2 px-3 font-medium text-red-700">AUTO-EXCLUDE</td>
                  <td className="py-2 px-3">
                    IRI failures &ge; 2, or speed (&lt;5 min) + any IRI failure
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">2</td>
                  <td className="py-2 px-3 font-medium text-orange-700">FLAG-SPEED</td>
                  <td className="py-2 px-3">&lt;5 min but all 3 IRIs passed</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">3</td>
                  <td className="py-2 px-3 font-medium text-amber-700">FLAG-SINGLE-IRI</td>
                  <td className="py-2 px-3">1 IRI failure at normal speed</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 font-medium text-amber-700">FLAG-SMEAL</td>
                  <td className="py-2 px-3">5-9 min (below Smeal eDBA benchmark)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">5</td>
                  <td className="py-2 px-3 font-medium text-orange-700">FLAG-RECAPTCHA</td>
                  <td className="py-2 px-3">reCAPTCHA score &lt; 0.5</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">6</td>
                  <td className="py-2 px-3 font-medium text-red-700">FLAG-STRAIGHTLINING</td>
                  <td className="py-2 px-3">Qualtrics: same answer for every item in a block</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3">7</td>
                  <td className="py-2 px-3 font-medium text-amber-700">
                    FLAG-PARTIAL-STRAIGHTLINING
                  </td>
                  <td className="py-2 px-3">Within-person SD &lt; 0.5 in any block</td>
                </tr>
                <tr className="bg-green-50/50">
                  <td className="py-2 px-3">8</td>
                  <td className="py-2 px-3 font-medium text-green-700">CLEAN</td>
                  <td className="py-2 px-3">All checks passed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
          <p>
            Last updated:{' '}
            {new Date(d.updatedAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
          <p className="mt-1">
            Reference: Meade &amp; Craig (2012). Identifying careless responses in survey data.{' '}
            <em>Psychological Methods</em>, 17(3), 437-455.
          </p>
        </footer>
      </article>
    </main>
  )
}

export default DispositionDashboardPage
