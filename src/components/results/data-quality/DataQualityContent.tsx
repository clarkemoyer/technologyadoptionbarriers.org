import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_OL_CLASSES,
} from '@/lib/articleStyles'
import LastUpdated from '@/components/last-updated'
import { PipelineDataFlow } from '@/components/results/data-quality/PipelineDataFlow'

type Sample = {
  key: string
  label: string
  description: string
  n?: number | null
}

type Metric = {
  key: string
  label: string
  values: Record<string, unknown>
}

export type DataQualityData = {
  samples: Sample[]
  metrics: Metric[]
  last_updated?: string
  extended_last_updated?: string
}

export type DataQualityVariant = 'live' | 'crp'

interface DataQualityContentProps {
  variant: DataQualityVariant
  data: DataQualityData
}

// Samples that the CRP-2026 dataset uses. Live shows all samples; CRP filters to these three.
const CRP_SAMPLE_KEYS = new Set(['conservative_clean', 'flexible_clean', 'prolific_accepted'])

// Format a metric value: pretty-print numbers, render anything else as a dash.
const fmt = (v: unknown): string =>
  typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(4)) : '-'

// Convert a sample count to its English-word equivalent for prose ("five" / "three").
const countWord = (n: number): string => {
  if (n === 5) return 'five'
  if (n === 3) return 'three'
  if (n === 4) return 'four'
  if (n === 2) return 'two'
  return String(n)
}

export function DataQualityContent({ variant, data }: DataQualityContentProps) {
  const samples: Sample[] =
    variant === 'crp' ? data.samples.filter((s) => CRP_SAMPLE_KEYS.has(s.key)) : data.samples

  const sampleCount = samples.length
  const sampleWord = countWord(sampleCount)

  const conservativeN = samples.find((s) => s.key === 'conservative_clean')?.n ?? '?'
  const flexibleN = samples.find((s) => s.key === 'flexible_clean')?.n ?? '?'

  // Cross-reference URL prefix for "See What This Pipeline Produces" section. CRP routes link
  // sideways to the CRP-2026 twins; live routes link to the live equivalents.
  const xref = variant === 'crp' ? '/results/crp-2026' : '/results'

  // Pipeline-script citation: unified analysis script that generates sensitivity and validation JSONs.
  const analysisScript = 'tabs_v2_unified_data_analysis.py'

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          {variant === 'crp' ? 'CRP 2026: Data Quality Pipeline' : 'Data Quality Pipeline'}
        </h1>

        {variant === 'crp' ? (
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
              Published: April 2026
            </span>
          </div>
        ) : (
          <LastUpdated utcTimestamp={data.last_updated as string} />
        )}

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
              <strong>Qualtrics Export</strong> - Raw survey responses exported via API
              (3-header-row CSV format with question text and import IDs)
            </li>
            <li>
              <strong>Prolific Enrichment</strong> - Each response is cross-referenced with Prolific
              submission data (approval status, auth check scores) using the participant ID as join
              key
            </li>
            <li>
              <strong>Deduplication</strong> - When a participant retakes the survey, only one
              response is kept. Completed responses are preferred over incomplete retakes (see Edge
              Cases below)
            </li>
            <li>
              <strong>Disposition Waterfall</strong> - An 11-step quality classification assigns
              each response to exactly one disposition category
            </li>
            <li>
              <strong>Sample Definition</strong> -{' '}
              {variant === 'crp' ? (
                <>
                  Three nested samples are computed, from most restrictive (Conservative Clean) to
                  least restrictive (Prolific Accepted)
                </>
              ) : (
                <>
                  Five samples are computed, ranging from most restrictive (Conservative Clean) to
                  least restrictive (All V2)
                </>
              )}
            </li>
            <li>
              <strong>Statistical Analysis</strong> - Every metric is computed independently across
              all {sampleWord} samples
            </li>
          </ol>
        </section>

        {/* ── Pipeline & Data Flow (issue #1839 - permanent diagram home) ── */}
        <PipelineDataFlow variant={variant} />

        {/* ── Demographic Data Sources ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Demographic Data Sources</h2>
          <p className={PARAGRAPH_CLASSES}>
            Participant demographics are collected from two independent sources that capture
            fundamentally different information:
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Aspect</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Survey Demographics (Qualtrics)
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Platform Demographics (Prolific)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Source</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Self-reported in the TABS survey instrument (questions Q1-Q9)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Prolific participant profile database (archived at submission completion)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Type</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Organizational/role-based characteristics
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Personal/sociodemographic + professional characteristics
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Base Fields</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Executive Role (Q1), Decision Authority (Q2), Industry (Q3), Org Size (Q4),
                    Profit Model (Q5), Revenue/Budget (Q6-Q7), Geography (Q8-Q9)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Age, Sex, Ethnicity, Language, Country of Residence, Nationality, Country of
                    Birth, Student Status, Employment Status
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    Prescreener Fields
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-400 italic">
                    N/A - all fields are part of the survey instrument
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Employment Sector, Industry, Company Size, Occupation, Education Level,
                    Household Income, Fluent Languages, and{' '}
                    <a
                      href="https://docs.prolific.com/api-reference/filters/get-filters"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      hundreds more via GET /api/v1/filters/
                    </a>{' '}
                    (up to 15 per export)
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    Collection Method
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Qualtrics CSV export, processed by{' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">{analysisScript}</code>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Prolific API{' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      POST /studies/&#123;id&#125;/demographic-export/
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    Used in Analysis
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    ✅ All per-group statistics, effect sizes, cross-tabulations
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    ✅ Available via API for cross-validation and sample balancing; base fields not
                    published on results pages (privacy protection)
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    Cross-Validation
                  </td>
                  <td className="border border-gray-300 px-4 py-2" colSpan={2}>
                    Overlapping dimensions allow independent verification: Prolific{' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">industry</code> &harr;
                    Qualtrics <code className="bg-gray-100 px-1 rounded text-xs">Q3_Industry</code>,
                    Prolific <code className="bg-gray-100 px-1 rounded text-xs">company_size</code>{' '}
                    &harr; Qualtrics{' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">Q4_OrgSize</code>, Prolific{' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">employment_sector</code>{' '}
                    &harr; Qualtrics{' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">Q5_ProfitModel</code>,
                    Prolific <code className="bg-gray-100 px-1 rounded text-xs">occupation</code>{' '}
                    &harr; Qualtrics{' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">Q1_Role</code>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Join Key</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Embedded in Qualtrics response row (same CSV)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Matched via Prolific Participant ID (PID)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>Key distinction:</strong> Survey Demographics (Qualtrics) and Platform
              Demographics (Prolific) are separate datasets that capture different types of
              information. Survey demographics document <em>what role participants hold</em> and{' '}
              <em>what kind of organization they work in</em>. Prolific demographics document{' '}
              <em>who the participants are</em> personally, plus professional characteristics
              (industry, company size, occupation) when prescreener filters are configured. Where
              fields overlap (industry, company size, sector, role), they provide an independent
              cross-validation opportunity to verify self-reported data and balance samples. The two
              are joined via Prolific Participant ID (PID).
            </p>
          </div>

          {/* ── Enrichment & Privacy ── */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-bold text-red-900 mb-2">
              🔒 Privacy-First Enrichment Architecture
            </h3>
            <p className="text-sm text-red-800 mb-2">
              Prolific demographic data (both base fields and prescreener responses) contains
              personally identifiable information (PII). The pipeline processes this data{' '}
              <strong>ephemerally</strong>:
            </p>
            <ul className="text-xs text-red-700 space-y-1 list-disc list-inside mb-2">
              <li>
                Demographics are fetched to{' '}
                <code className="bg-red-100 px-1 rounded">runner.temp</code> during pipeline
                execution - never committed to the repository
              </li>
              <li>
                Cross-validation checks run in-memory; only aggregate pass/fail flags are emitted
              </li>
              <li>
                Published results pages display only category-level aggregates from Qualtrics survey
                data (Q1-Q9), never individual Prolific profile data
              </li>
              <li>
                The <code className="bg-red-100 px-1 rounded">PROLIFIC_STUDY_SCREENERS</code>{' '}
                constant in <code className="bg-red-100 px-1 rounded">tabs_api.py</code> and{' '}
                <code className="bg-red-100 px-1 rounded">prolific-api.ts</code> documents the exact
                eligibility criteria and filter_ids used for enrichment export
              </li>
            </ul>
            <h4 className="text-xs font-bold text-red-800 mt-3 mb-1">
              Enrichment Filter Budget (7 of 15 max)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mb-2">
                <thead>
                  <tr className="bg-red-100">
                    <th className="border border-red-200 px-2 py-1 text-left font-bold">
                      Category
                    </th>
                    <th className="border border-red-200 px-2 py-1 text-left font-bold">
                      Filter IDs
                    </th>
                    <th className="border border-red-200 px-2 py-1 text-right font-bold">Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-red-200 px-2 py-1 font-medium">
                      Study screeners (prescreener)
                    </td>
                    <td className="border border-red-200 px-2 py-1">
                      <code className="bg-red-100 px-0.5 rounded">employment_sector</code>,{' '}
                      <code className="bg-red-100 px-0.5 rounded">company_size</code>,{' '}
                      <code className="bg-red-100 px-0.5 rounded">occupation</code>
                    </td>
                    <td className="border border-red-200 px-2 py-1 text-right font-mono">3</td>
                  </tr>
                  <tr className="bg-red-50/50">
                    <td className="border border-red-200 px-2 py-1 font-medium">
                      Cross-validation
                    </td>
                    <td className="border border-red-200 px-2 py-1">
                      <code className="bg-red-100 px-0.5 rounded">industry</code>
                    </td>
                    <td className="border border-red-200 px-2 py-1 text-right font-mono">1</td>
                  </tr>
                  <tr>
                    <td className="border border-red-200 px-2 py-1 font-medium">Augmentation</td>
                    <td className="border border-red-200 px-2 py-1">
                      <code className="bg-red-100 px-0.5 rounded">education_level</code>,{' '}
                      <code className="bg-red-100 px-0.5 rounded">household_income</code>,{' '}
                      <code className="bg-red-100 px-0.5 rounded">fluent_languages</code>
                    </td>
                    <td className="border border-red-200 px-2 py-1 text-right font-mono">3</td>
                  </tr>
                  <tr className="bg-red-100/50 font-bold">
                    <td className="border border-red-200 px-2 py-1">Total</td>
                    <td className="border border-red-200 px-2 py-1">&nbsp;</td>
                    <td className="border border-red-200 px-2 py-1 text-right font-mono">7 / 15</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-red-600 italic">
              Note: &ldquo;Current Country of Residence&rdquo; and &ldquo;Employment Status&rdquo;
              are base fields (always included in every export) and do not count against the
              15-filter limit. See{' '}
              <a
                href="https://docs.prolific.com/api-reference/studies/export-demographic-data"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-700 underline"
              >
                Prolific Demographic Export API
              </a>{' '}
              for export limits (15 filters, 2 configuration changes before lock).
            </p>
          </div>
        </section>

        {/* ── Disposition Waterfall ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Disposition Waterfall (Steps 0-10)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Each response is evaluated through this 11-step waterfall (steps 0-10). The{' '}
            <strong>first matching step</strong> determines the disposition - a response is never
            counted in multiple categories.
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
            instructs the respondent to select a specific answer. Exact string match is required -
            any other value (including &ldquo;Don&rsquo;t Know&rdquo;) is scored as a failure.
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
            {variant === 'crp' ? 'Three nested' : 'Five'} sample definitions are used, from most to
            least restrictive. The <strong>Prolific Accepted</strong> count matches the Prolific
            platform&rsquo;s &ldquo;Approved&rdquo; tab exactly. The clean samples apply additional
            quality filters on top of Prolific approval.
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
                {samples.map((sample, i) => (
                  <tr key={sample.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{sample.label}</td>
                    <td className="border border-gray-300 px-4 py-2">{sample.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                      {sample.n ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500">
            {variant === 'crp' ? (
              <>
                Constraints: Conservative Clean &sube; Flexible Clean &sube; Prolific Accepted. The
                CRP dataset uses these three nested sample definitions for sensitivity analysis.
              </>
            ) : (
              <>
                Constraints: Conservative Clean &sube; Flexible Clean &sube; Prolific Accepted
                &sube; All V2, and All V2 Finished &sube; All V2. Prolific Accepted and All V2
                Finished overlap but neither is guaranteed to be a subset of the other (Prolific
                Accepted includes INCOMPLETE+APPROVED responses; All V2 Finished includes
                non-APPROVED responses).
              </>
            )}
          </p>
        </section>

        {/* ── Authoritative Sample Filter Chains ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Exact Filter Chains (Authoritative Definitions)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Each sample definition is produced by applying filters in order. These are the{' '}
            <strong>canonical definitions</strong> used by the analysis pipeline (
            <code className="text-xs bg-gray-100 px-1 rounded">{analysisScript}</code>). Every
            metric on the Results pages is computed against these exact filters.
          </p>

          <div className="space-y-6 my-6">
            {/* Conservative Clean */}
            <div className="border border-green-200 bg-green-50 rounded-lg p-5">
              <h3 className="text-base font-bold text-green-900 mb-2">
                1. Conservative Clean (Primary Analysis Sample)
              </h3>
              <p className="text-sm text-green-800 mb-3">
                The most restrictive sample. Used for all primary reporting. Requires Prolific
                approval <strong>plus</strong> passing every quality gate.
              </p>
              <ol className="text-sm text-green-900 space-y-1 list-decimal list-inside ml-2">
                <li>Prolific_Status == &ldquo;APPROVED&rdquo;</li>
                <li>Qualtrics Finished == TRUE (survey completed)</li>
                <li>Duration &ge; 480 seconds (8 minutes)</li>
                <li>All 3 IRI attention checks correct (exact string match)</li>
                <li>Duration &ge; 540 seconds (9 min Smeal eDBA benchmark)</li>
                <li>reCAPTCHA score &ge; 0.5</li>
                <li>Q_StraightliningCount == 0 (no full-block straightlining)</li>
                <li>Within-person SD &ge; 0.5 in all blocks (no partial straightlining)</li>
                <li>Auth_LLM and Auth_Bots not LOW or MIXED</li>
              </ol>
              <p className="text-xs text-green-700 mt-2 italic">
                Source: <code className="bg-green-100 px-1 rounded">filter_samples()</code> in{' '}
                <code className="bg-green-100 px-1 rounded">{analysisScript}</code>
              </p>
            </div>

            {/* Flexible Clean */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-5">
              <h3 className="text-base font-bold text-blue-900 mb-2">
                2. Flexible Clean (Expanded Quality Sample)
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Includes manually-reviewed FLAG responses that were approved on Prolific. Uses a
                lower duration threshold and only checks IRI attention.
              </p>
              <ol className="text-sm text-blue-900 space-y-1 list-decimal list-inside ml-2">
                <li>Prolific_Status == &ldquo;APPROVED&rdquo;</li>
                <li>Qualtrics Finished == TRUE</li>
                <li>Duration &ge; 480 seconds (8 minutes)</li>
                <li>All 3 IRI attention checks correct</li>
              </ol>
              <p className="text-xs text-blue-700 mt-2 italic">
                Does NOT check: reCAPTCHA, straightlining, partial straightlining, or auth flags.
              </p>
            </div>

            {/* Prolific Accepted */}
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-5">
              <h3 className="text-base font-bold text-amber-900 mb-2">
                3. Prolific Accepted (Platform-Verified Sample)
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                All deduplicated V2 responses where the participant has been approved on Prolific.
                This count <strong>must match</strong> the Prolific UI &ldquo;Approved&rdquo; tab
                exactly. Any discrepancy indicates a pipeline bug.
              </p>
              <ol className="text-sm text-amber-900 space-y-1 list-decimal list-inside ml-2">
                <li>Prolific_Status == &ldquo;APPROVED&rdquo;</li>
                <li>Deduplicated by PROLIFIC_PID (prefer completed response)</li>
              </ol>
              <p className="text-xs text-amber-700 mt-2 italic">
                No quality filters. Includes incomplete/short responses if Prolific approved them.
              </p>
            </div>

            {variant === 'live' ? (
              <>
                {/* All V2 Finished */}
                <div className="border border-gray-200 bg-gray-50 rounded-lg p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    4. All V2 Finished (Completed Responses)
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    All finished responses above a minimum duration threshold. Not filtered by
                    Prolific status - includes returned, timed-out, and awaiting-review
                    participants.
                  </p>
                  <ol className="text-sm text-gray-800 space-y-1 list-decimal list-inside ml-2">
                    <li>Qualtrics Finished == TRUE</li>
                    <li>Duration &ge; 120 seconds (extreme speeders excluded)</li>
                  </ol>
                </div>

                {/* All V2 */}
                <div className="border border-gray-200 bg-gray-50 rounded-lg p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    5. All V2 (Complete Dataset)
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Every V2 response including incomplete, deduplicated by PROLIFIC_PID. This is
                    the universe from which all other samples are drawn.
                  </p>
                  <ol className="text-sm text-gray-800 space-y-1 list-decimal list-inside ml-2">
                    <li>StartDate on or after V2 launch (2026-03-23)</li>
                    <li>Deduplicated by PROLIFIC_PID (prefer completed response)</li>
                  </ol>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Note: All V2 Finished and All V2 sample definitions are not included in the CRP
                dataset - only the three groups above.
              </p>
            )}
          </div>

          {/* Disposition CLEAN vs Conservative Clean */}
          <div className="bg-white border-2 border-amber-400 rounded-lg p-5 my-6">
            <h3 className="text-base font-bold text-amber-900 mb-2">
              ⚠ Disposition CLEAN vs. Conservative Clean
            </h3>
            <p className="text-sm text-gray-800 mb-3">
              These are related but distinct concepts that serve different purposes:
            </p>
            <ul className="text-sm text-gray-800 space-y-2 list-disc list-inside ml-2">
              <li>
                <strong>Disposition CLEAN</strong> (from the waterfall above): A response that
                passes all 10 quality checks without being flagged. Used by the{' '}
                <strong>operations pipeline</strong> to auto-approve participants on Prolific. Does{' '}
                <em>not</em> check Prolific_Status.
              </li>
              <li>
                <strong>Conservative Clean</strong> (sample definition): Requires Prolific_Status ==
                &ldquo;APPROVED&rdquo; <em>plus</em> all quality checks. Used for{' '}
                <strong>statistical analysis and reporting</strong>.
              </li>
            </ul>
            <p className="text-sm text-gray-700 mt-3">
              <strong>Expected relationship:</strong> After the daily auto-approve workflow runs,
              all Disposition CLEAN participants should have Prolific_Status == APPROVED, making the
              counts equal. Any persistent gap indicates a pipeline issue. The disposition dashboard
              cross-references these counts automatically.
            </p>
          </div>
        </section>

        {/* ── Sensitivity Analysis ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sensitivity Analysis</h2>
          <p className={PARAGRAPH_CLASSES}>
            Every key statistic is computed across all {sampleWord} sample definitions. If a finding
            holds across Conservative Clean (N={conservativeN}) and Flexible Clean (N=
            {flexibleN}), it is robust to inclusion criteria.
          </p>
          {data.metrics.length > 0 &&
            data.metrics.some((m) => Object.keys(m.values).length > 0) && (
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th
                        scope="col"
                        className="border border-gray-300 px-4 py-2 text-left font-bold"
                      >
                        Metric
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
                    {data.metrics.map((metric, i) => (
                      <tr key={metric.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                        <th
                          scope="row"
                          className="border border-gray-300 px-4 py-2 font-medium text-left"
                        >
                          {metric.label}
                        </th>
                        {samples.map((s) => (
                          <td
                            key={s.key}
                            className="border border-gray-300 px-4 py-2 text-right font-mono"
                          >
                            {fmt((metric.values as Record<string, unknown>)[s.key])}
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
                <strong>IRI items are excluded</strong> from the SD calculation. IRI attention
                checks have predetermined correct answers (e.g., &ldquo;Major Barrier&rdquo;) that
                differ from typical straightline responses. Including them would artificially
                inflate within-person variance and mask genuine straightlining. Only substantive
                scale items are used: 18 Barrier items, 17 Readiness items, and 8 Maturity items.
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
            {variant === 'crp' ? (
              <>
                All analysis code is open source and can be run independently against the public
                CRP-2026 dataset. The sensitivity analysis shown above was generated from the frozen
                dataset and is committed to the repository as JSON data.
              </>
            ) : (
              <>
                All analysis code is open source. The sensitivity analysis is generated
                automatically by the daily analysis pipeline and committed to the repository as JSON
                data.
              </>
            )}
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

        {/* ── See the Results ── */}
        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            See What This Pipeline Produces
          </h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <Link href={`${xref}/descriptive`} className="text-blue-600 hover:underline">
                Descriptive Statistics
              </Link>{' '}
              - grand means, standard deviations, correlations
            </li>
            <li>
              <Link href={`${xref}/reliability`} className="text-blue-600 hover:underline">
                Scale Reliability
              </Link>{' '}
              - Cronbach&rsquo;s alpha across all {sampleWord} samples
            </li>
            <li>
              <Link href={`${xref}/sensitivity`} className="text-blue-600 hover:underline">
                Sensitivity Analysis
              </Link>{' '}
              - every metric across all sample definitions
            </li>
            <li>
              <Link href={`${xref}/sample`} className="text-blue-600 hover:underline">
                Sample &amp; Demographics
              </Link>{' '}
              - who participated in the survey
            </li>
            <li>
              <Link
                href={variant === 'crp' ? '/results/crp-2026' : '/results'}
                className="text-blue-600 hover:underline"
              >
                &larr; Back to Results Overview
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}
