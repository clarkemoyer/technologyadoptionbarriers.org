import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_LIST_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'
import { assetPath } from '@/lib/assetPath'
import crpData from '@/data/crp-sensitivity-analysis.json'
import { DATA_UNAVAILABLE } from '@/lib/sentinelMarker'
export const metadata: Metadata = {
  title: 'TABS 2026 CRP Results',
  description:
    'Snapshot dataset used for the TABS Culminating Research Project (CRP). A moment-in-time capture with three-tier quality selection, de-identified per NIST Expert Determination protocol.',
  alternates: {
    canonical: '/results/crp-2026',
  },
}

// Derived from src/data/crp-sensitivity-analysis.json - updated by the daily pipeline.
// No fallback values - if the JSON is missing or malformed, the page must show
// a visible "data unavailable" state rather than fake numbers.
type CrpSample = { key: string; n: number }
const crpSamples: CrpSample[] = Array.isArray((crpData as { samples?: unknown }).samples)
  ? (crpData as { samples: CrpSample[] }).samples
  : []
const CRP_SAMPLE_SIZE = crpSamples.find((s) => s.key === 'prolific_accepted')?.n ?? null
const CRP_CONSERVATIVE_CLEAN = crpSamples.find((s) => s.key === 'conservative_clean')?.n ?? null
const CRP_FLEXIBLE_CLEAN = crpSamples.find((s) => s.key === 'flexible_clean')?.n ?? null
const CRP_SELECTION_TIERS = 3

/** Format a number or show the unavailable marker. */
const d = (val: number | null): string => (val !== null ? String(val) : DATA_UNAVAILABLE)

const CRP2026Page = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>TABS 2026 CRP Results</h1>

        {/* ── Published Badge ── */}
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            Published: April 2026
          </span>
        </div>

        {/* ── Hero Description ── */}
        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This page presents the frozen, moment-in-time dataset (N={d(CRP_SAMPLE_SIZE)}) used for
            the TABS Culminating Research Project (CRP). Unlike the{' '}
            <Link href="/results" className="text-blue-600 hover:underline font-medium">
              live pipeline results
            </Link>{' '}
            which update daily as new survey responses are collected, the CRP dataset is a static
            snapshot locked at the point of manuscript submission.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Freezing the dataset ensures that every statistic, table, and figure in the final paper
            can be independently reproduced. The live pipeline continues to collect data beyond N=
            {d(CRP_SAMPLE_SIZE)}, but the CRP references only this fixed sample.
          </p>
        </section>

        {/* ── Key Stats Grid ── */}
        <section className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'CRP Sample Size', value: `N=${d(CRP_SAMPLE_SIZE)}` },
              { label: 'Conservative Clean', value: d(CRP_CONSERVATIVE_CLEAN) },
              { label: 'Flexible Clean (total)', value: d(CRP_FLEXIBLE_CLEAN) },
              { label: 'Selection Tiers', value: String(CRP_SELECTION_TIERS) },
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

        {/* ── Dataset Information ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Dataset Information</h2>

          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>Three-Tier Selection Methodology</h3>
              <p className={PARAGRAPH_CLASSES}>
                The CRP dataset selects N={d(CRP_SAMPLE_SIZE)} responses from Prolific Accepted
                participants using a three-tier quality-based strategy. Higher tiers are
                automatically included; remaining slots are filled by quality-ranked responses from
                lower tiers.
              </p>
              <ul className={BODY_LIST_CLASSES}>
                <li>
                  <strong>Tier 1 - Conservative Clean (auto-include):</strong> All responses passing
                  every quality gate: 3/3 IRI attention checks, duration ≥ 540s, reCAPTCHA ≥ 0.5, no
                  straightlining, no auth flags (N={d(CRP_CONSERVATIVE_CLEAN)})
                </li>
                <li>
                  <strong>Tier 2 - Flexible Clean surplus (auto-include):</strong> Responses passing
                  basic quality (all 3 IRIs + duration ≥ 480s) that did not qualify for Tier 1 (N=
                  {CRP_FLEXIBLE_CLEAN !== null && CRP_CONSERVATIVE_CLEAN !== null
                    ? CRP_FLEXIBLE_CLEAN - CRP_CONSERVATIVE_CLEAN
                    : DATA_UNAVAILABLE}
                  )
                </li>
                <li>
                  <strong>Tier 3 - Quality-ranked fill:</strong> Remaining Prolific Accepted
                  responses ranked by a 100-point composite quality score, selected until N=
                  {d(CRP_SAMPLE_SIZE)} is reached
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>Quality Scoring</h3>
              <p className={PARAGRAPH_CLASSES}>
                Each response receives a composite quality score derived from six independent
                indicators, scaled to a 100-point range. The six indicators are: IRI attention check
                performance (35 pts), survey completion duration (20 pts), reCAPTCHA bot-detection
                score (15 pts), Prolific authentication flags (15 pts), full straightlining
                detection (8 pts), and partial straightlining / within-person response variance (7
                pts).
              </p>
              <p className="text-gray-600 font-sans text-sm">
                All N={d(CRP_SAMPLE_SIZE)} responses are included in the CRP dataset. The quality
                score determines Tier 3 selection priority and supports sensitivity analysis across
                sample definitions (Conservative Clean vs. full CRP sample).
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>De-Identification Protocol</h3>
              <p className={PARAGRAPH_CLASSES}>
                The public dataset is de-identified following the NIST 5-step Expert Determination
                protocol. All direct identifiers (Prolific PIDs, IP addresses, geolocation data) are
                removed prior to release. Indirect identifiers (organization size, industry sector)
                are retained at categorical granularity to support meaningful analysis without
                enabling re-identification.
              </p>
              <p className="text-gray-600 font-sans text-sm">
                The de-identification process is documented in the analysis scripts and can be
                independently verified. See the{' '}
                <Link href="/results/reproducibility" className="text-blue-600 hover:underline">
                  Open Data &amp; Reproducibility
                </Link>{' '}
                page for full details.
              </p>
            </div>
          </div>
        </section>

        {/* ── Download Section ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Download the Dataset</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6">
            <p className={PARAGRAPH_CLASSES}>
              The CRP 2026 public dataset is available for download in CSV format. This file
              contains the de-identified, frozen N={d(CRP_SAMPLE_SIZE)} sample used for all CRP
              analyses. The dataset is permanently archived at Penn State ScholarSphere.
            </p>
            <div className="flex flex-wrap gap-4 my-4">
              <a
                href="https://scholarsphere.psu.edu/resources/cc6df3e4-17d3-4594-86f6-48a433cde962"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors font-sans text-base font-medium shadow-sm"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download from ScholarSphere
              </a>
              <a
                href={assetPath('/datasets/TABS_V2_CRP_2026_public_dataset.csv')}
                download
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors font-sans text-base font-medium"
              >
                Mirror: Direct CSV Download
              </a>
            </div>
            <ul className="text-sm text-blue-900 space-y-1 font-sans">
              <li>
                <strong>Format:</strong> CSV (comma-separated values)
              </li>
              <li>
                <strong>Records:</strong> {d(CRP_SAMPLE_SIZE)} de-identified responses
              </li>
              <li>
                <strong>De-identification:</strong> NIST Expert Determination protocol (5-step)
              </li>
              <li>
                <strong>License:</strong> CC-BY-4.0
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 font-sans mt-2">
            The mirror link provides a direct download of the frozen dataset from this repository.
          </p>
        </section>

        {/* ── Citation Section ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How to Cite</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 font-sans text-sm">
            <p className="mb-2 font-medium">APA Format (Dataset):</p>
            <p className="text-gray-700 italic">
              Moyer, C. (2026).{' '}
              <em>
                Technology Adoption Barriers Survey (TABS): CRP 2026 public dataset (N=
                {d(CRP_SAMPLE_SIZE)})
              </em>{' '}
              [Data set]. Penn State ScholarSphere.{' '}
              <span className="not-italic">
                https://scholarsphere.psu.edu/resources/cc6df3e4-17d3-4594-86f6-48a433cde962
              </span>
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 font-sans text-sm mt-4">
            <p className="mb-2 font-medium">APA Format (Web Results):</p>
            <p className="text-gray-700 italic">
              Moyer, C. (2026). Technology Adoption Barriers Survey (TABS): 2026 CRP results.{' '}
              <span className="not-italic">
                https://technologyadoptionbarriers.org/results/crp-2026
              </span>
            </p>
          </div>
        </section>

        {/* ── Related Pages ── */}
        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Related</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <Link href="/results/crp-2026/validation" className="text-blue-600 hover:underline">
                Instrument Validation
              </Link>{' '}
              - full psychometric validation at N={d(CRP_SAMPLE_SIZE)}
            </li>
            <li>
              <Link
                href="/results/crp-2026/factor-analysis"
                className="text-blue-600 hover:underline"
              >
                Factor Analysis
              </Link>{' '}
              - hierarchical barrier factor structure
            </li>
            <li>
              <Link href="/results/crp-2026/glossary" className="text-blue-600 hover:underline">
                Statistics Glossary
              </Link>{' '}
              - what every statistic means and how it&apos;s calculated
            </li>
            <li>
              <Link href="/results/reproducibility" className="text-blue-600 hover:underline">
                Open Data &amp; Reproducibility
              </Link>{' '}
              - analysis scripts and reproduction instructions
            </li>
            <li>
              <Link href="/results/sensitivity" className="text-blue-600 hover:underline">
                Sensitivity Analysis
              </Link>{' '}
              - robustness across sample definitions
            </li>
            <li>
              <Link href="/results/data-quality" className="text-blue-600 hover:underline">
                Data Quality Pipeline
              </Link>{' '}
              - how responses are validated before analysis
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

export default CRP2026Page
