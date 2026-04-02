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

export const metadata: Metadata = {
  title: 'Reproducible Analysis Pipeline — Making of TABS',
  description:
    'How the TABS project ensures reproducible, transparent research through shared constants, automated validation, and open-source analysis scripts that anyone can run.',
  alternates: {
    canonical: '/making-of-tabs/reproducible-analysis',
  },
}

const ReproducibleAnalysisPage = () => {
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
                &rsaquo;
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Reproducible Analysis
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Reproducible Analysis Pipeline</h1>

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
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
              tabs-survey-constants.ts
            </code>
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
                <strong>generate-constants-json.ts</strong> exports constants to JSON on every
                commit
              </li>
              <li>
                <strong>disposition.ts</strong> (TypeScript) imports constants for live triage
              </li>
              <li>
                <strong>tabs_v2_data_audit.py</strong> (Python) reads the JSON for reproducible
                analysis
              </li>
              <li>
                <strong>validate-analysis.yml</strong> (CI) verifies both systems agree on every
                push
              </li>
            </ol>
          </div>
        </section>

        {/* ── Three Scripts ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>The Three Analysis Scripts</h2>

          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className={H3_CLASSES}>1. Data Audit (tabs_v2_data_audit.py)</h3>
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
              <h3 className={H3_CLASSES}>2. Statistical Analysis (tabs_v2_analysis.py)</h3>
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
              <h3 className={H3_CLASSES}>3. Psychometric Validation (tabs_v2_psychometrics.py)</h3>
              <p className={PARAGRAPH_CLASSES}>
                Validates the instrument itself: convergent and discriminant validity, scale
                discrimination, IRI effectiveness analysis, response bias detection (straightlining,
                acquiescence, extreme response style), and order/fatigue effects.
              </p>
              <p className="text-gray-600 font-sans text-sm">
                <strong>Key outputs:</strong> Within-scale vs. between-scale correlations, IRI pass
                rate distributions, response entropy analysis, position-based fatigue detection.
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
            inclusion criteria — a key requirement for publication-grade research.
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
                      {sample.n ?? '—'}
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
            do not depend on a single set of inclusion criteria. If a finding holds across Pipeline
            CLEAN, Conservative, Relaxed, and All Finished samples, it is robust. If it shifts
            substantially, the sensitivity analysis flags it for discussion.
          </p>
          {sensitivityData.metrics.length > 0 &&
            Object.keys(sensitivityData.metrics[0].values).length > 0 && (
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
                            {(metric.values as Record<string, number | null>)[s.key] ?? '—'}
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
python tabs_v2_data_audit.py --input test_data.csv
python tabs_v2_analysis.py test_data.csv

# Run with production data (from ScholarSphere)
python tabs_v2_data_audit.py --input <path_to_production_csv>
python tabs_v2_analysis.py <path_to_production_csv>

# Export sensitivity analysis as JSON (for dashboard)
python tabs_v2_analysis.py <csv> --json sensitivity-analysis.json

# Run detailed analysis on a different primary sample
python tabs_v2_analysis.py <csv> --primary-sample pipeline_clean
python tabs_v2_analysis.py <csv> --primary-sample relaxed`}</pre>
          </div>

          <p className={PARAGRAPH_CLASSES}>
            The test dataset (15 synthetic records) is included in the repository for logic
            verification. It contains a mix of clean records, IRI failures, duration failures, and
            &ldquo;Don&rsquo;t Know&rdquo; responses to exercise all processing paths. Production
            data is available from ScholarSphere once the initial dataset reaches N=200.
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
              <strong>Pinned dependencies:</strong> requirements.txt locks exact package versions
              for reproducibility across environments
            </li>
            <li>
              <strong>Test data included:</strong> 15 synthetic records exercise all processing
              paths without requiring production data access
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
    </main>
  )
}

export default ReproducibleAnalysisPage
