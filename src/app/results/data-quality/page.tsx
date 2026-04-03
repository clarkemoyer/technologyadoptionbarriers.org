import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_OL_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'
import sensitivityData from '@/data/sensitivity-analysis.json'

export const metadata: Metadata = {
  title: 'Data Quality Pipeline — TABS Results',
  description:
    'How the TABS project ensures data quality through multi-stage validation, disposition waterfall logic, and sensitivity analysis across five sample definitions.',
  alternates: {
    canonical: '/results/data-quality',
  },
}

const DataQualityPage = () => {
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
              Data Quality Pipeline
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Data Quality Pipeline</h1>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            The TABS project applies a multi-stage data quality pipeline to every survey response.
            This page documents how responses flow from collection through validation to analysis,
            the quality checks applied at each stage, the edge cases we discovered and resolved, and
            the sensitivity analysis that demonstrates our findings are robust to inclusion
            criteria.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            All statistics on this page are generated automatically by the daily analysis pipeline
            and updated every time the pipeline runs. The numbers shown here match the Prolific
            platform exactly.
          </p>
        </section>

        {/* ── Data Flow ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Data Flow</h2>
          <p className={PARAGRAPH_CLASSES}>
            Every survey response passes through this pipeline before appearing in any analysis:
          </p>
          <ol className={BODY_OL_CLASSES}>
            <li>
              <strong>Qualtrics Export</strong> &mdash; Raw survey responses exported via API
              (3-header-row CSV format with question text and import IDs)
            </li>
            <li>
              <strong>Prolific Enrichment</strong> &mdash; Each response is cross-referenced with
              Prolific submission data (approval status, auth check scores) using the participant ID
              as join key
            </li>
            <li>
              <strong>Deduplication</strong> &mdash; When a participant retakes the survey, only one
              response is kept. Completed responses are preferred over incomplete retakes (see Edge
              Cases below)
            </li>
            <li>
              <strong>Disposition Waterfall</strong> &mdash; An 11-step quality classification
              assigns each response to exactly one disposition category
            </li>
            <li>
              <strong>Sample Definition</strong> &mdash; Five nested samples are computed, from most
              restrictive (Conservative Clean) to least (All V2)
            </li>
            <li>
              <strong>Statistical Analysis</strong> &mdash; Every metric is computed independently
              across all five samples
            </li>
          </ol>
        </section>

        {/* ── Disposition Waterfall ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Disposition Waterfall (Steps 0&ndash;10)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Each response is evaluated through this 11-step waterfall (steps 0&ndash;10). The{' '}
            <strong>first matching step</strong> determines the disposition &mdash; a response is
            never counted in multiple categories.
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Step</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Disposition
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Criteria</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['0', 'INCOMPLETE', 'Survey not finished (Qualtrics Finished != TRUE)'],
                  ['1', 'FLAG-AUTH-FAIL', 'Prolific authenticity check: LLM or Bots score = "Low"'],
                  [
                    '2',
                    'FLAG-AUTH-MIXED',
                    'Prolific authenticity check: LLM or Bots score = "Mixed"',
                  ],
                  [
                    '3',
                    'AUTO-EXCLUDE',
                    '2+ IRI failures, OR speed flag (<5 min) + any IRI failure',
                  ],
                  ['4', 'FLAG-SPEED', 'Duration < 5 min but all 3 IRIs correct'],
                  ['5', 'FLAG-SINGLE-IRI', '1 IRI failure at normal speed (>= 5 min)'],
                  ['6', 'FLAG-SMEAL', 'Duration 5-9 min (below Smeal eDBA benchmark of 9 min)'],
                  ['7', 'FLAG-RECAPTCHA', 'reCAPTCHA score < 0.5'],
                  [
                    '8',
                    'FLAG-STRAIGHTLINING',
                    'Qualtrics Q_StraightliningCount > 0 (same answer for entire block)',
                  ],
                  [
                    '9',
                    'FLAG-PARTIAL-STRAIGHTLINING',
                    'Within-person SD < 0.5 in any question block (Meade & Craig 2012)',
                  ],
                  [
                    '10',
                    'CLEAN',
                    'All checks passed: finished, all 3 IRIs, duration >= 9 min, reCAPTCHA >= 0.5, no straightlining, auth checks pass',
                  ],
                ].map(([step, disp, criteria], i) => (
                  <tr key={step} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-mono">{step}</td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{disp}</td>
                    <td className="border border-gray-300 px-4 py-2">{criteria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── IRI Attention Checks ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Instructed Response Items (IRIs)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Three attention check items are embedded within the survey, one per construct. Each
            instructs the respondent to select a specific answer. Exact string match is required
            &mdash; any other value (including &ldquo;Don&rsquo;t Know&rdquo;) is scored as a
            failure.
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Construct
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Column</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Expected Answer
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Barriers (19 items)</td>
                  <td className="border border-gray-300 px-4 py-2 font-mono text-xs">
                    Q10-28_Barriers_19
                  </td>
                  <td className="border border-gray-300 px-4 py-2">&ldquo;Major Barrier&rdquo;</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">Readiness (18 items)</td>
                  <td className="border border-gray-300 px-4 py-2 font-mono text-xs">
                    Q47-64_Readiness_18
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    &ldquo;Low Readiness/Capability&rdquo;
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Maturity (9 items)</td>
                  <td className="border border-gray-300 px-4 py-2 font-mono text-xs">
                    Q65-73_Maturity_9
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    &ldquo;Level 2: Developing/Repeatable&rdquo;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Sample Definitions ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sample Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            Five nested sample definitions are used, from most to least restrictive. The{' '}
            <strong>Prolific Accepted</strong> count matches the Prolific platform&rsquo;s
            &ldquo;Approved&rdquo; tab exactly. The clean samples apply additional quality filters
            on top of Prolific approval.
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Sample</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Definition
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">N</th>
                </tr>
              </thead>
              <tbody>
                {sensitivityData.samples.map((sample, i) => (
                  <tr key={sample.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{sample.label}</td>
                    <td className="border border-gray-300 px-4 py-2">{sample.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {sample.n ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500">
            Constraints: Conservative Clean &sube; Flexible Clean &sube; Prolific Accepted &sube;
            All V2, and All V2 Finished &sube; All V2. Prolific Accepted and All V2 Finished overlap
            but neither is guaranteed to be a subset of the other (Prolific Accepted includes
            INCOMPLETE+APPROVED responses; All V2 Finished includes non-APPROVED responses).
          </p>
        </section>

        {/* ── Sensitivity Analysis ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sensitivity Analysis</h2>
          <p className={PARAGRAPH_CLASSES}>
            Every key statistic is computed across all five sample definitions. If a finding holds
            across Conservative Clean (N=
            {sensitivityData.samples.find((s) => s.key === 'conservative_clean')?.n ?? '?'}) and
            Flexible Clean (N=
            {sensitivityData.samples.find((s) => s.key === 'flexible_clean')?.n ?? '?'}), it is
            robust to inclusion criteria.
          </p>
          {sensitivityData.metrics.length > 0 &&
            sensitivityData.metrics.some((m) => Object.keys(m.values).length > 0) && (
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                        Metric
                      </th>
                      {sensitivityData.samples.map((s) => (
                        <th
                          key={s.key}
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
                    {sensitivityData.metrics.map((metric, i) => (
                      <tr key={metric.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {metric.label}
                        </td>
                        {sensitivityData.samples.map((s) => (
                          <td
                            key={s.key}
                            className="border border-gray-300 px-4 py-2 text-right font-mono"
                          >
                            {(metric.values as Record<string, number | null>)[s.key] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>

        {/* ── Edge Cases ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Edge Cases &amp; Data Quality Decisions</h2>
          <p className={PARAGRAPH_CLASSES}>
            During pipeline development, several edge cases were discovered and resolved. Each
            decision is documented here for transparency and reproducibility.
          </p>

          <div className="space-y-8 my-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>Retake Deduplication: Prefer Completed Response</h3>
              <p className={PARAGRAPH_CLASSES}>
                Some participants completed the survey, received Prolific approval, then started a
                retake but did not finish it. The Qualtrics export contains both rows for the same
                Prolific PID. The Python analysis pipeline&rsquo;s deduplication logic prefers the{' '}
                <strong>completed response</strong> (Finished=TRUE) over the incomplete retake,
                regardless of chronological order. This ensures the approved, completed response is
                used for analysis rather than being overwritten by an abandoned retake.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Note: The TypeScript disposition triage (used by the operations pipeline) still uses
                &ldquo;latest row wins&rdquo; dedup, which can keep an incomplete retake over a
                completed original. This is being addressed in issue #687 (TS → Python migration).
                The Python analysis pipeline already applies the correct logic.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>Prolific Accepted Must Match Prolific UI</h3>
              <p className={PARAGRAPH_CLASSES}>
                The &ldquo;Prolific Accepted&rdquo; sample count must match the Prolific
                platform&rsquo;s &ldquo;Approved&rdquo; tab exactly. This is validated by
                cross-referencing the Prolific API submission statuses with the Qualtrics export.
                Any discrepancy indicates a pipeline bug, not a data issue.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                The Prolific API is queried with limit=1000 per page to ensure all submissions are
                fetched. The enrichment step matches Prolific participant IDs to Qualtrics
                PROLIFIC_PID embedded data fields.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>IRI Pass Rate Denominator</h3>
              <p className={PARAGRAPH_CLASSES}>
                IRI (attention check) pass rates are computed using{' '}
                <strong>finished responses only</strong> as the denominator, not all responses.
                Incomplete responses cannot have valid IRI answers, so including them would
                artificially deflate pass rates.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>Partial Straightlining Detection</h3>
              <p className={PARAGRAPH_CLASSES}>
                Beyond Qualtrics&rsquo; built-in straightlining count, the pipeline computes
                within-person standard deviation per question block. If a respondent selected nearly
                identical answers for all items in a block (SD &lt; 0.5), the response is flagged.
                The threshold follows Meade &amp; Craig (2012), <em>Psychological Methods</em>,
                17(3), 437-455.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                The minimum response threshold for evaluation is ceil(block_count / 2) items
                answered, matching the TypeScript disposition pipeline exactly.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>Qualtrics Export Format</h3>
              <p className={PARAGRAPH_CLASSES}>
                Qualtrics CSV exports include 3 header rows: column names (row 0), question text
                (row 1), and import IDs (row 2). Data starts at row 3. The pipeline handles UTF-8
                BOM markers (common in Qualtrics exports), embedded newlines in quoted feedback
                fields, and both label mode (&ldquo;TRUE&rdquo;/&ldquo;FALSE&rdquo;) and numeric
                mode (&ldquo;1&rdquo;/&ldquo;0&rdquo;) for the Finished column.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>Don&rsquo;t Know Responses (Readiness &amp; Maturity)</h3>
              <p className={PARAGRAPH_CLASSES}>
                The Readiness and Maturity constructs allow &ldquo;Don&rsquo;t Know&rdquo; as a
                response option. These are treated as missing data (excluded from person-level
                means), not mapped to a numeric value. This prevents artificial deflation of
                construct scores. The Barriers construct does not include a Don&rsquo;t Know option.
              </p>
            </div>
          </div>
        </section>

        {/* ── Reproducibility ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Reproducibility</h2>
          <p className={PARAGRAPH_CLASSES}>
            All analysis code is open source and can be run independently against the public
            dataset. The sensitivity analysis shown above is generated automatically by the daily
            analysis pipeline and committed to the repository as JSON data.
          </p>
          <div className="flex flex-wrap gap-4 my-6">
            <Link
              href="/results/reproducibility"
              className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors font-sans text-sm"
            >
              Open Data &amp; Reproducibility
            </Link>
            <Link
              href="/results/dashboard"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sans text-sm"
            >
              Prolific Dashboard
            </Link>
            <a
              href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/tree/main/scripts/analysis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-sans text-sm"
            >
              View Analysis Scripts on GitHub
            </a>
          </div>
        </section>
      </article>
    </main>
  )
}

export default DataQualityPage
