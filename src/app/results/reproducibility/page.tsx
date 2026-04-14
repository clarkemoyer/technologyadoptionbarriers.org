import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_LIST_CLASSES,
  BODY_OL_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'
import sensitivityData from '@/data/sensitivity-analysis.json'
import LastUpdated from '@/components/last-updated'

export const metadata: Metadata = {
  title: 'Open Data & Reproducibility - TABS Results',
  description:
    'How the TABS project ensures reproducible, transparent research through shared constants, automated validation, and open-source analysis scripts that anyone can run.',
  alternates: {
    canonical: '/results/reproducibility',
  },
}

const GITHUB_SCRIPTS_BLOB_BASE =
  'https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/scripts/analysis'
const GITHUB_TESTS_TREE_URL =
  'https://github.com/clarkemoyer/technologyadoptionbarriers.org/tree/main/scripts/analysis/tests'
const GITHUB_TESTS_BLOB_BASE =
  'https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/scripts/analysis/tests'

const ReproducibleAnalysisPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Reproducible Analysis Pipeline</h1>
        <LastUpdated
          utcTimestamp={(sensitivityData as Record<string, unknown>).last_updated as string}
        />

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            The TABS project is committed to open science and computational reproducibility. Every
            statistic reported in the Culminating Research Project (CRP) can be independently
            verified by running our public analysis scripts against the released dataset. This page
            explains how the pipeline works and how you can use it.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The dataset is archived at{' '}
            <a
              href="https://scholarsphere.psu.edu/resources/cc6df3e4-17d3-4594-86f6-48a433cde962"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Penn State ScholarSphere
            </a>{' '}
            under a CC-BY-4.0 license, ensuring long-term institutional preservation independent of
            the principal investigator.
          </p>
        </section>

        {/* ── Architecture ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Architecture: Single Source of Truth</h2>
          <p className={PARAGRAPH_CLASSES}>
            A common challenge in research software is keeping multiple systems in sync. The TABS
            project uses two parallel data processing systems: a live TypeScript pipeline for
            operational triage (approving and flagging survey submissions in real-time) and public
            Python scripts for research-grade statistical analysis. These systems share critical
            constants: scale mappings, IRI expected answers, column definitions, and duration
            thresholds.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            To prevent divergence, all shared constants are defined in a single TypeScript file (
            <a
              href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/src/lib/tabs-survey-constants.ts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 font-mono text-sm"
            >
              tabs-survey-constants.ts
            </a>
            ) that serves as the authoritative source. A CI workflow automatically exports these
            constants to JSON for the Python scripts to consume. Any change to a constant in one
            system is immediately validated against the other.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8 font-sans text-base">
            <h3 className="font-bold text-gray-900 mb-3">Data Flow</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>
                <strong>tabs-survey-constants.ts</strong> defines all instrument constants (scale
                mappings, IRI answers, column names, thresholds)
              </li>
              <li>
                <a
                  href={`${GITHUB_SCRIPTS_BLOB_BASE}/generate-constants-json.ts`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  <strong>generate-constants-json.ts</strong>
                </a>{' '}
                exports constants to JSON on every commit
              </li>
              <li>
                <strong>disposition.ts</strong> (TypeScript) imports constants for live triage
              </li>
              <li>
                <a
                  href={`${GITHUB_SCRIPTS_BLOB_BASE}/tabs_v2_data_audit.py`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  <strong>tabs_v2_data_audit.py</strong>
                </a>{' '}
                (Python) reads the JSON for reproducible analysis
              </li>
              <li>
                <strong>validate-analysis.yml</strong> (CI) verifies both systems agree on every
                push
              </li>
            </ol>
          </div>
        </section>

        {/* ── Analysis Scripts ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Analysis Scripts</h2>
          <p className={PARAGRAPH_CLASSES}>
            The reproducible analysis pipeline consists of five core Python scripts plus a
            presentation validator. Each script reads a standard Qualtrics CSV export and applies
            identical scale mappings, column definitions, and quality filters sourced from the
            shared constants file.
          </p>

          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>
                1. Data Audit (
                <a
                  href={`${GITHUB_SCRIPTS_BLOB_BASE}/tabs_v2_data_audit.py`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  tabs_v2_data_audit.py
                </a>
                )
              </h3>
              <p className={PARAGRAPH_CLASSES}>
                Implements the complete 10-step disposition waterfall that determines which survey
                responses are included in analysis. This is a faithful Python port of the live
                TypeScript triage logic, ensuring that the research analysis applies exactly the
                same quality criteria as the operational pipeline.
              </p>
              <p className="text-gray-600 font-sans text-sm">
                <strong>Waterfall steps:</strong> Incomplete check, Prolific auth verification, IRI
                attention checks (3 constructs), speed flags, Smeal benchmark, reCAPTCHA score,
                full-block straightlining, partial straightlining (within-person SD), and final
                CLEAN disposition.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>
                2. Statistical Analysis (
                <a
                  href={`${GITHUB_SCRIPTS_BLOB_BASE}/tabs_v2_analysis.py`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  tabs_v2_analysis.py
                </a>
                )
              </h3>
              <p className={PARAGRAPH_CLASSES}>
                Computes all descriptive and inferential statistics reported in the CRP: construct
                means, standard deviations, correlations with 95% confidence intervals, t-tests with
                effect sizes, ANOVA, sensitivity analysis across sample definitions, and demographic
                cross-tabulations.
              </p>
              <p className="text-gray-600 font-sans text-sm">
                <strong>Key outputs:</strong> Barrier severity rankings, readiness profiles,
                maturity assessments, construct correlations, demographic comparisons across role,
                industry, org size, and profit model.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>
                3. Psychometric Validation (
                <a
                  href={`${GITHUB_SCRIPTS_BLOB_BASE}/tabs_v2_psychometrics.py`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  tabs_v2_psychometrics.py
                </a>
                )
              </h3>
              <p className={PARAGRAPH_CLASSES}>
                Validates 84 statistical claims embedded in the CRP document against computed values
                from the source CSV. This ensures that all reported statistics - construct means,
                correlations, reliability coefficients, validity metrics, and demographic tables -
                are traceable to the data and protects against transcription errors.
              </p>
              <p className="text-gray-600 font-sans text-sm">
                <strong>Key outputs:</strong> Pass/fail summary with detailed mismatch reports.
                Coverage includes Cronbach&rsquo;s alpha, AVE, HTMT ratios, factor loadings, and
                demographic breakdowns.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>
                4. Advanced Statistics (
                <a
                  href={`${GITHUB_SCRIPTS_BLOB_BASE}/tabs_v2_advanced.py`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  tabs_v2_advanced.py
                </a>
                )
              </h3>
              <p className={PARAGRAPH_CLASSES}>
                Performs inferential statistics, factor analysis (PCA with Varimax rotation),
                interaction effects, and moderation analyses that extend the primary descriptive
                results.
              </p>
              <p className="text-gray-600 font-sans text-sm">
                <strong>Key outputs:</strong> Factor extraction with variance explained, KMO and
                Bartlett&rsquo;s tests, budget moderation effects, revenue tiers, role-by-role
                comparisons, and geographic scope analysis.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>
                5. Data Quality Audit (
                <a
                  href={`${GITHUB_SCRIPTS_BLOB_BASE}/tabs_v2_quality_audit.py`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  tabs_v2_quality_audit.py
                </a>
                )
              </h3>
              <p className={PARAGRAPH_CLASSES}>
                Systematically examines dataset flaws, biases, and limitations. Produces a
                comprehensive quality report including straightlining detection, outlier analysis
                (Mahalanobis distance), response pattern diagnostics, and order/fatigue effects.
              </p>
              <p className="text-gray-600 font-sans text-sm">
                <strong>Key outputs:</strong> Response entropy analysis, acquiescence bias metrics,
                extreme response style detection, position-based fatigue, and within-person SD
                distributions.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>
                6. Defense Deck Validator (
                <a
                  href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/scripts/validate-deck.py"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  validate-deck.py
                </a>
                )
              </h3>
              <p className={PARAGRAPH_CLASSES}>
                Validates 81 statistical claims in the defense presentation (PPTX) against computed
                values from the source CSV. Ensures consistency between the CRP document and
                presentation materials.
              </p>
              <p className="text-gray-600 font-sans text-sm">
                <strong>Key outputs:</strong> Per-slide PASS/FAIL summary for item means, standard
                deviations, grand construct means, and Pearson correlations.
              </p>
            </div>
          </div>
        </section>

        {/* ── Sample Definitions ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sample Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The analysis script supports five sample definitions, from most to least restrictive.
            Each applies different quality filters to the same underlying V2 dataset. Running all
            statistics against every sample definition demonstrates whether findings are robust to
            inclusion criteria - a key requirement for publication-grade research.
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Sample</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Criteria</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">N</th>
                </tr>
              </thead>
              <tbody>
                {sensitivityData.samples.map((sample, i) => (
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
          <p className="text-sm text-gray-500 mt-2">
            N values are populated by running{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
              python tabs_v2_analysis.py &lt;csv&gt; --json sensitivity-analysis.json
            </code>{' '}
            against the production dataset.
          </p>
        </section>

        {/* ── Sensitivity Analysis ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Sensitivity Analysis</h2>
          <p className={PARAGRAPH_CLASSES}>
            Every key statistic is computed across all sample definitions to verify that conclusions
            do not depend on a single set of inclusion criteria. If a finding holds across
            Conservative Clean, Flexible Clean, and Prolific Accepted samples, it is robust. If it
            shifts substantially, the sensitivity analysis flags it for discussion.
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
                            {(metric.values as Record<string, number | null>)[s.key] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          {(sensitivityData.metrics.length === 0 ||
            sensitivityData.metrics.every((metric) => Object.keys(metric.values).length === 0)) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-6">
              <p className="text-amber-800 font-sans">
                Sensitivity analysis data has not been generated yet. Run the analysis pipeline
                against the production dataset to populate this table.
              </p>
            </div>
          )}
        </section>

        {/* ── How to Run ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How to Reproduce the Analysis</h2>
          <p className={PARAGRAPH_CLASSES}>
            Anyone can independently verify the statistics reported in the CRP by following these
            steps:
          </p>

          <div className="bg-gray-900 text-green-400 rounded-lg p-6 my-6 font-mono text-sm overflow-x-auto">
            <pre>{`# Clone the repository
git clone https://github.com/clarkemoyer/technologyadoptionbarriers.org.git
cd technologyadoptionbarriers.org/scripts/analysis

# Install Python dependencies (pinned versions)
pip install -r requirements.txt

# Run with test data (included in repo)
python tabs_v2_data_audit.py --input test_data_qualtrics.csv
python tabs_v2_analysis.py test_data_qualtrics.csv
python tabs_v2_psychometrics.py test_data_qualtrics.csv
python tabs_v2_advanced.py test_data_qualtrics.csv
python tabs_v2_quality_audit.py test_data_qualtrics.csv

# Run with production data (from ScholarSphere)
python tabs_v2_data_audit.py --input <path_to_production_csv>
python tabs_v2_analysis.py <path_to_production_csv>
python tabs_v2_psychometrics.py <path_to_production_csv>
python tabs_v2_advanced.py <path_to_production_csv>
python tabs_v2_quality_audit.py <path_to_production_csv>

# Validate defense presentation
python ../validate-deck.py <path_to_csv> <path_to_pptx>

# Export sensitivity analysis as JSON (for dashboard)
python tabs_v2_analysis.py <csv> --json sensitivity-analysis.json

# Run with a different primary sample definition
python tabs_v2_analysis.py <csv> --primary-sample conservative_clean
python tabs_v2_analysis.py <csv> --primary-sample flexible_clean
python tabs_v2_analysis.py <csv> --primary-sample prolific_accepted`}</pre>
          </div>
        </section>

        {/* ── Test Data ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Test Data &amp; Automated Testing</h2>
          <p className={PARAGRAPH_CLASSES}>
            The repository includes multiple test datasets and a comprehensive pytest suite so that
            anyone can verify the analysis logic without production data.
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">File</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-bold">Records</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    <a
                      href={`${GITHUB_SCRIPTS_BLOB_BASE}/test_data.csv`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 font-mono text-xs"
                    >
                      test_data.csv
                    </a>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-mono">5</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Simplified format for quick logic checks with 5 actual response rows (clean, IRI
                    fail, duration fail, Don&rsquo;t Know); blank Qualtrics-style metadata rows are
                    not included in the count
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    <a
                      href={`${GITHUB_SCRIPTS_BLOB_BASE}/test_data_qualtrics.csv`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 font-mono text-xs"
                    >
                      test_data_qualtrics.csv
                    </a>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-mono">15</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Full Qualtrics CSV format with realistic headers and diverse demographic
                    combinations
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    <a
                      href={`${GITHUB_TESTS_BLOB_BASE}/generate_test_data.py`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 font-mono text-xs"
                    >
                      tests/generate_test_data.py
                    </a>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-mono">-</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Deterministic generator for the production-format synthetic dataset. Public
                    directory browsing is intentionally not linked here while the repository
                    remediates and sanitizes the test CSV per the PII policy.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className={PARAGRAPH_CLASSES}>
            The{' '}
            <a
              href={GITHUB_TESTS_TREE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              test suite
            </a>{' '}
            includes a comprehensive set of pytest modules covering every analysis script,
            cross-validation between scripts, edge cases, CLI argument parsing, and the operational
            pipeline tools. Tests run automatically in CI on every push.
          </p>
        </section>

        {/* ── Anti-Divergence ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Preventing Drift Between Systems</h2>
          <p className={PARAGRAPH_CLASSES}>
            The most dangerous failure mode in a dual-system research pipeline is silent divergence:
            the live pipeline and the public scripts gradually drift apart until they produce
            different results from the same data. The TABS project prevents this through three
            mechanisms:
          </p>
          <ol className={BODY_OL_CLASSES}>
            <li>
              <strong>Centralized constants:</strong> All instrument definitions (scale labels, IRI
              answers, column names, thresholds) live in one file. Neither the TypeScript nor Python
              code hardcodes these values independently.
            </li>
            <li>
              <strong>CI validation:</strong> Every commit that touches constants or analysis
              scripts triggers an automated workflow that regenerates the JSON export, validates all
              values match, and runs the Python scripts against test data.
            </li>
            <li>
              <strong>Faithful port:</strong> The Python disposition waterfall (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                tabs_v2_data_audit.py
              </code>
              ) implements the exact same 10-step logic as the TypeScript live pipeline (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                disposition.ts
              </code>
              ), including matching within-person SD calculations for partial straightlining
              detection.
            </li>
          </ol>
        </section>

        {/* ── Shared Constants ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>What the Shared Constants Cover</h2>
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Constant Category
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">Examples</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                    Why It Matters
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Scale Mappings</td>
                  <td className="border border-gray-300 px-4 py-2">
                    &ldquo;Major Barrier&rdquo; = 5, &ldquo;Very Low Readiness/Capability&rdquo; = 1
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    If one system maps a label to the wrong number, all statistics diverge silently
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">IRI Expected Answers</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Barrier: &ldquo;Major Barrier&rdquo;, Readiness: &ldquo;Low
                    Readiness/Capability&rdquo;
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Wrong IRI answer = wrong disposition = wrong sample = wrong conclusions
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Column Names</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Q10-28_Barriers_19 (IRI), Q47-64_Readiness_18 (IRI)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Column mismatch reads the wrong data entirely
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">Duration Thresholds</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Speed flag: 300s, Smeal: 300-540s, Clean: 480s
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Different thresholds produce different sample sizes and statistics
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Open Science ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Open Science Commitments</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Open source code:</strong> All scripts are public on{' '}
              <a
                href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/tree/main/scripts/analysis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                GitHub
              </a>
            </li>
            <li>
              <strong>Pinned dependencies:</strong>{' '}
              <a
                href={`${GITHUB_SCRIPTS_BLOB_BASE}/requirements.txt`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                requirements.txt
              </a>{' '}
              locks exact package versions for reproducibility across environments
            </li>
            <li>
              <strong>Test data included:</strong> Three test datasets (5 + 15 + 500 records) and a
              deterministic generator exercise all processing paths without requiring production
              data access
            </li>
            <li>
              <strong>Automated test suite:</strong> A comprehensive pytest suite with CI
              integration verifies script correctness on every commit
            </li>
            <li>
              <strong>Versioned datasets:</strong> Each data release (N=200, N=500, annual) receives
              its own DOI via ScholarSphere
            </li>
            <li>
              <strong>CC-BY-4.0 license:</strong> Both code and data are freely reusable with
              attribution
            </li>
            <li>
              <strong>CI-validated:</strong> Automated checks ensure constants match, scripts run,
              and outputs are correct on every code change
            </li>
          </ul>
        </section>

        {/* ── Get Involved ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Get Involved</h2>
          <p className={PARAGRAPH_CLASSES}>
            If you find an issue with the analysis scripts or want to contribute improvements, the
            repository welcomes pull requests. The analysis scripts are designed to be extended: add
            new statistical tests, improve visualizations, or adapt the pipeline for your own
            research context.
          </p>
          <div className="flex flex-wrap gap-4 my-6">
            <a
              href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/tree/main/scripts/analysis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors font-sans text-sm"
            >
              View Scripts on GitHub
            </a>
            <a
              href={GITHUB_TESTS_TREE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-600 transition-colors font-sans text-sm"
            >
              View Test Suite
            </a>
            <a
              href="https://scholarsphere.psu.edu/resources/cc6df3e4-17d3-4594-86f6-48a433cde962"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sans text-sm"
            >
              Access Dataset on ScholarSphere
            </a>
          </div>
        </section>
      </article>
    </div>
  )
}

export default ReproducibleAnalysisPage
