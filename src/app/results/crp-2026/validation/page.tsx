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
import validationData from '@/data/crp-validation.json'

export const metadata: Metadata = {
  title: 'Instrument Validation — TABS CRP 2026',
  description:
    'Comprehensive psychometric validation of the 43-item TABS instrument at N=200: reliability, factor analysis, convergent and discriminant validity, item diagnostics, and normality assessment.',
  alternates: {
    canonical: '/results/crp-2026/validation',
  },
}

/* ── Type helpers ── */
type ConstructData = (typeof validationData.constructs)[number]
type HTMTPair = (typeof validationData.discriminant_validity.htmt)[number]
type FLPair = (typeof validationData.discriminant_validity.fornell_larcker)[number]

const fmt = (val: number | null | undefined, digits = 3): string => {
  if (val === null || val === undefined) return '—'
  return val.toFixed(digits)
}

const pFmt = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '—'
  if (val < 0.001) return '< .001'
  return val.toFixed(3)
}

/* ── Verdict badge ── */
const Verdict = ({ pass, label }: { pass: boolean; label?: string }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
      pass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}
  >
    {label ?? (pass ? 'Pass' : 'Fail')}
  </span>
)

/* ── Construct Reliability Card ── */
const ReliabilityCard = ({ c }: { c: ConstructData }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-tabs-teal-deep text-white px-4 py-2 font-bold font-sans">
      {c.construct} <span className="font-normal opacity-80">({c.n_items} items, N={c.n_valid_listwise})</span>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-xs text-gray-600 font-semibold">Cronbach’s α</span>
          <div className="text-lg font-mono font-bold text-tabs-teal-deep">{fmt(c.cronbach_alpha, 4)}</div>
          {c.alpha_95ci && (
            <div className="text-xs text-gray-500 font-sans">95% CI [{fmt(c.alpha_95ci[0], 3)}, {fmt(c.alpha_95ci[1], 3)}]</div>
          )}
        </div>
        <div>
          <span className="text-xs text-gray-600 font-semibold">McDonald’s ω</span>
          <div className="text-lg font-mono font-bold text-tabs-teal-deep">{fmt(c.mcdonalds_omega, 4)}</div>
        </div>
        <div>
          <span className="text-xs text-gray-600 font-semibold">Composite Reliability</span>
          <div className="text-lg font-mono font-bold text-tabs-teal-deep">{fmt(c.composite_reliability, 4)}</div>
        </div>
        <div>
          <span className="text-xs text-gray-600 font-semibold">Split-Half</span>
          <div className="text-lg font-mono font-bold text-tabs-teal-deep">{fmt(c.split_half_spearman_brown, 4)}</div>
        </div>
        <div>
          <span className="text-xs text-gray-600 font-semibold">AVE</span>
          <div className="text-lg font-mono font-bold text-tabs-teal-deep">{fmt(c.ave_from_loadings, 4)}</div>
        </div>
      </div>
    </div>
  </div>
)

const ValidationPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/results" className="hover:text-blue-600 hover:underline">
                Results
              </Link>
              <span className="mx-2" aria-hidden="true">&rsaquo;</span>
            </li>
            <li>
              <Link href="/results/crp-2026" className="hover:text-blue-600 hover:underline">
                CRP 2026
              </Link>
              <span className="mx-2" aria-hidden="true">&rsaquo;</span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Instrument Validation
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Instrument Validation Results</h1>

        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            Published: April 2026 | N={validationData.n_clean}
          </span>
        </div>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This page presents comprehensive psychometric validation results for the 43-item TABS
            instrument on the CRP-200 frozen dataset. The validation covers reliability,
            convergent and discriminant validity, factor structure, item-level diagnostics, and
            normality assumptions for all three constructs: Barriers (18 items), Readiness (18
            items), and Maturity (8 items). See the{' '}
            <Link href="/results/crp-2026/glossary" className="text-blue-600 hover:underline">
              Statistics Glossary
            </Link>{' '}
            for plain-language explanations of each method.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Reliability and Item Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {validationData.constructs.map((c) => (
              <ReliabilityCard key={c.construct} c={c} />
            ))}
          </div>

          <h3 className={H3_CLASSES}>Internal Consistency Summary</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2 border">Construct</th>
                  <th className="text-right px-3 py-2 border">Items</th>
                  <th className="text-right px-3 py-2 border">α</th>
                  <th className="text-right px-3 py-2 border">ω</th>
                  <th className="text-right px-3 py-2 border">CR</th>
                  <th className="text-right px-3 py-2 border">AVE</th>
                </tr>
              </thead>
              <tbody>
                {validationData.constructs.map((c, i) => (
                  <tr key={c.construct} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border font-semibold">{c.construct}</td>
                    <td className="text-right px-3 py-1.5 border">{c.n_items}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(c.cronbach_alpha)}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(c.mcdonalds_omega)}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(c.composite_reliability)}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(c.ave_from_loadings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Factor Structure and KMO / Bartlett Test</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2 border">Construct</th>
                  <th className="text-right px-3 py-2 border">KMO</th>
                  <th className="text-right px-3 py-2 border">Bartlett χ²</th>
                  <th className="text-right px-3 py-2 border">p-value</th>
                  <th className="text-left px-3 py-2 border">Factors Retained</th>
                </tr>
              </thead>
              <tbody>
                {validationData.constructs.map((c, i) => (
                  <tr key={c.construct} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border font-semibold">{c.construct}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(c.kmo_measure)}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(c.bartlett_chi_squared)}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{pFmt(c.bartlett_p_value)}</td>
                    <td className="px-3 py-1.5 border">{c.n_factors_retained}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Discriminant Validity</h2>
          
          <h3 className={H3_CLASSES}>HTMT Ratios (Conservative Threshold: .85)</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2 border">Pair</th>
                  <th className="text-right px-3 py-2 border">HTMT</th>
                  <th className="text-left px-3 py-2 border">95% CI</th>
                  <th className="text-center px-3 py-2 border">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {validationData.discriminant_validity.htmt.map((pair, i) => (
                  <tr key={pair.pair} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border font-semibold">{pair.pair}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(pair.htmt)}</td>
                    <td className="px-3 py-1.5 border font-mono text-xs">
                      [{fmt(pair.ci_lower)}, {fmt(pair.ci_upper)}]
                    </td>
                    <td className="text-center px-3 py-1.5 border">
                      <Verdict pass={pair.htmt < 0.85} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className={H3_CLASSES}>Fornell-Larcker Criterion</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2 border">Pair</th>
                  <th className="text-right px-3 py-2 border">√AVE(A)</th>
                  <th className="text-right px-3 py-2 border">√AVE(B)</th>
                  <th className="text-right px-3 py-2 border">r(A,B)</th>
                  <th className="text-center px-3 py-2 border">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {validationData.discriminant_validity.fornell_larcker.map((pair, i) => (
                  <tr key={pair.pair} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border font-semibold">{pair.pair}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(pair.sqrt_ave_a)}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(pair.sqrt_ave_b)}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">{fmt(pair.correlation)}</td>
                    <td className="text-center px-3 py-1.5 border">
                      <Verdict pass={pair.discriminant_valid} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Normality Diagnostics</h2>
          <p className={PARAGRAPH_CLASSES}>
            All 43 TABS items were evaluated using Shapiro-Wilk test, skewness, and excess kurtosis.
            Individual item results are available in the comprehensive analysis report. Summary:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <ul className="text-sm space-y-2 font-sans text-blue-900">
              <li><strong>Shapiro-Wilk:</strong> All items p &lt; .001 (non-normal, expected for Likert data)</li>
              <li><strong>Skewness range:</strong> |{fmt(validationData.normality.skewness_min)}| to |{fmt(validationData.normality.skewness_max)}| (all |skew| &lt; 2.0)</li>
              <li><strong>Kurtosis range:</strong> {fmt(validationData.normality.kurtosis_min)} to {fmt(validationData.normality.kurtosis_max)} (all within acceptable limits)</li>
              <li><strong>ML Estimation:</strong> Robust to these departures from normality at N=200</li>
            </ul>
          </div>
        </section>

        {/* ── Navigation ── */}
        <section className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-wrap gap-4 text-sm font-sans">
            <Link href="/results/crp-2026/factor-analysis" className="text-blue-600 hover:underline">
              Factor Analysis &rarr;
            </Link>
            <Link href="/results/crp-2026/glossary" className="text-blue-600 hover:underline">
              Statistics Glossary &rarr;
            </Link>
            <Link href="/results/crp-2026" className="text-blue-600 hover:underline">
              &larr; CRP 2026 Overview
            </Link>
          </div>
        </section>
      </article>
    </main>
  )
}

export default ValidationPage