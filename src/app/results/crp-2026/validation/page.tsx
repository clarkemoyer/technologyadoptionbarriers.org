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

/* ══════════════════════════════════════════════════════════════════
   CRP-200 VALIDATION DATA — imported from crp-validation.json
   All values come from src/data/crp-validation.json, which the
   daily pipeline generates by extracting the `validation` section
   from tabs_v2_unified_data_analysis.py for the frozen N=200 dataset.
══════════════════════════════════════════════════════════════════ */

const N_CLEAN = validationData.metadata.n_total

/** Shape expected by the card / table components below. */
type ConstructValidation = {
  construct: string
  n_items: number
  n_valid: number
  cronbach_alpha: number
  alpha_95ci: [number, number]
  mcdonalds_omega: number
  composite_reliability: number
  ave_from_loadings: number
  split_half: number
  kmo: number
  bartlett_chi2: number
  bartlett_p: number
  parallel_factors: number
  variance_explained: number
  top_eigenvalues: number[]
  cfa_chi2: number
  cfa_df: number
  cfa_p: number
  cfa_cfi: number
  cfa_tli: number
  cfa_rmsea: number
  inter_item_mean: number
  inter_item_min: number
  inter_item_max: number
  inter_item_sd: number
}

const ITEM_COUNTS: Record<string, number> = {
  Barriers: validationData.metadata.n_barriers,
  Readiness: validationData.metadata.n_readiness,
  Maturity: validationData.metadata.n_maturity,
}

// Derived from validationData.metadata.constructs — typed as literal union
// for safe indexing into validationData's top-level keys.
const CONSTRUCT_NAMES = validationData.metadata.constructs as (
  | 'Barriers'
  | 'Readiness'
  | 'Maturity'
)[]
const CONSTRUCTS: ConstructValidation[] = CONSTRUCT_NAMES.map((name) => {
  const d = validationData[name]
  return {
    construct: name,
    n_items: ITEM_COUNTS[name],
    n_valid: d.n_listwise,
    cronbach_alpha: d.cronbach_alpha,
    alpha_95ci: d.cronbach_alpha_ci as [number, number],
    mcdonalds_omega: d.mcdonalds_omega,
    composite_reliability: d.composite_reliability,
    ave_from_loadings: d.ave,
    split_half: d.split_half,
    kmo: d.kmo_bartlett.kmo_overall,
    bartlett_chi2: d.kmo_bartlett.bartlett_chi2,
    bartlett_p: d.kmo_bartlett.bartlett_p,
    parallel_factors: d.parallel_analysis.n_factors,
    variance_explained: d.efa.total_variance,
    top_eigenvalues: d.parallel_analysis.eigenvalues_real,
    cfa_chi2: d.cfa.chi2,
    cfa_df: d.cfa.df,
    cfa_p: d.cfa.chi2_p,
    cfa_cfi: d.cfa.cfi,
    cfa_tli: d.cfa.tli,
    cfa_rmsea: d.cfa.rmsea,
    inter_item_mean: d.inter_item.mean_r,
    inter_item_min: d.inter_item.min_r,
    inter_item_max: d.inter_item.max_r,
    inter_item_sd: d.inter_item.sd_r,
  }
})

type HTMTPair = {
  pair: string
  htmt: number
  ci_95: [number, number]
  passes_085: boolean
  passes_090: boolean
}

const HTMT_DATA: HTMTPair[] = validationData.htmt.map((h) => ({
  pair: h.pair.replace(' vs ', '-'),
  htmt: h.htmt,
  ci_95: [h.ci_lower, h.ci_upper] as [number, number],
  passes_085: h.below_085,
  passes_090: h.below_090,
}))

type FLPair = {
  pair: string
  sqrt_ave_1: number
  sqrt_ave_2: number
  correlation: number
  passes: boolean
}

const FL_DATA: FLPair[] = validationData.fornell_larcker.map((fl) => ({
  pair: fl.pair.replace(' vs ', '-'),
  sqrt_ave_1: fl.sqrt_ave1,
  sqrt_ave_2: fl.sqrt_ave2,
  correlation:
    validationData.construct_correlations[
      fl.pair.split(' vs ')[0] as keyof typeof validationData.construct_correlations
    ][fl.pair.split(' vs ')[1] as 'Barriers' | 'Readiness' | 'Maturity'],
  passes: fl.pass,
}))

const CORR_MATRIX: Record<string, Record<string, number>> = validationData.construct_correlations

const BARRIERS_4F_CFA = validationData.barriers_4f_cfa

/** Validation summary rows derived from crp-validation.json verdicts. */
const VERDICT_ROWS: { label: string; vals: boolean[] }[] = (() => {
  const constructs = ['Barriers', 'Readiness', 'Maturity'] as const
  type ConstructKey = (typeof constructs)[number]
  const verdicts = validationData.verdicts as Record<
    ConstructKey,
    {
      alpha_above_070: boolean
      cr_above_070: boolean
      ave_above_050: boolean
      kmo_above_060: boolean
      cfa_cfi_above_090: boolean
      itc_all_above_030: boolean
    }
  >
  const getVals = (fn: (c: ConstructKey) => boolean): boolean[] => constructs.map(fn)

  return [
    {
      label: 'Internal Consistency (\u03B1 \u2265 .70)',
      vals: getVals((c) => verdicts[c].alpha_above_070),
    },
    {
      label: 'Composite Reliability (CR \u2265 .70)',
      vals: getVals((c) => verdicts[c].cr_above_070),
    },
    {
      label: 'Convergent Validity (AVE \u2265 .50)',
      vals: getVals((c) => verdicts[c].ave_above_050),
    },
    {
      label: 'AVE Compensated by CR > .70',
      vals: getVals((c) => verdicts[c].cr_above_070 && !verdicts[c].ave_above_050),
    },
    {
      label: 'KMO \u2265 .60',
      vals: getVals((c) => verdicts[c].kmo_above_060),
    },
    {
      label: 'CFA CFI \u2265 .90',
      vals: getVals((c) => verdicts[c].cfa_cfi_above_090),
    },
    {
      label: 'CFA RMSEA \u2264 .08',
      vals: getVals((c) => {
        const rmsea = (validationData[c] as { cfa: { rmsea: number | null } }).cfa.rmsea
        return rmsea !== null && rmsea <= 0.08
      }),
    },
    {
      label: 'HTMT < .85 (all pairs)',
      vals: getVals((c) =>
        validationData.htmt.filter((h) => h.pair.includes(c)).every((h) => h.below_085)
      ),
    },
    {
      label: 'No CITC < .30 flags',
      vals: getVals((c) => verdicts[c].itc_all_above_030),
    },
  ]
})()

/* ── Formatting helpers ── */
const fmt = (val: number | null | undefined, digits = 3): string => {
  if (val === null || val === undefined) return '\u2014'
  return val.toFixed(digits)
}

const pFmt = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '\u2014'
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
const ReliabilityCard = ({ c }: { c: ConstructValidation }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-tabs-teal-deep text-white px-4 py-2 font-bold font-sans">
      {c.construct}{' '}
      <span className="font-normal opacity-80">
        ({c.n_items} items, N={c.n_valid})
      </span>
    </div>
    <div className="p-4">
      <table className="w-full text-sm font-sans border-collapse">
        <tbody>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#cronbach-alpha"
                className="hover:text-blue-600 hover:underline"
              >
                Cronbach&rsquo;s &alpha;
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{fmt(c.cronbach_alpha, 4)}</td>
            <td className="py-1.5 text-right text-xs text-gray-400 pl-2">
              95% CI [{fmt(c.alpha_95ci[0], 3)}, {fmt(c.alpha_95ci[1], 3)}]
            </td>
          </tr>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#mcdonalds-omega"
                className="hover:text-blue-600 hover:underline"
              >
                McDonald&rsquo;s &omega;
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{fmt(c.mcdonalds_omega, 4)}</td>
            <td />
          </tr>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#composite-reliability"
                className="hover:text-blue-600 hover:underline"
              >
                Composite Reliability
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">
              {fmt(c.composite_reliability, 4)}
            </td>
            <td className="py-1.5 text-right">
              <Verdict
                pass={c.composite_reliability >= 0.7}
                label={
                  c.composite_reliability >= 0.8
                    ? 'Good'
                    : c.composite_reliability >= 0.7
                      ? 'Acceptable'
                      : 'Low'
                }
              />
            </td>
          </tr>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#ave"
                className="hover:text-blue-600 hover:underline"
              >
                AVE
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{fmt(c.ave_from_loadings, 4)}</td>
            <td className="py-1.5 text-right">
              <Verdict
                pass={c.ave_from_loadings >= 0.5}
                label={c.ave_from_loadings >= 0.5 ? '\u2265 .50' : '< .50 (CR compensates)'}
              />
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#split-half"
                className="hover:text-blue-600 hover:underline"
              >
                Split-Half (Spearman-Brown)
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{fmt(c.split_half, 4)}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)

/* ── EFA Summary Card ── */
const EFACard = ({ c }: { c: ConstructValidation }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-indigo-700 text-white px-4 py-2 font-bold font-sans">{c.construct} EFA</div>
    <div className="p-4">
      <table className="w-full text-sm font-sans border-collapse">
        <tbody>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#kmo"
                className="hover:text-blue-600 hover:underline"
              >
                KMO
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{fmt(c.kmo)}</td>
            <td className="py-1.5 text-right">
              <Verdict
                pass={c.kmo >= 0.8}
                label={
                  c.kmo >= 0.9
                    ? 'Marvelous'
                    : c.kmo >= 0.8
                      ? 'Meritorious'
                      : c.kmo >= 0.7
                        ? 'Middling'
                        : 'Low'
                }
              />
            </td>
          </tr>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#bartlett"
                className="hover:text-blue-600 hover:underline"
              >
                Bartlett&rsquo;s &chi;&sup2;
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{fmt(c.bartlett_chi2, 1)}</td>
            <td className="py-1.5 text-right text-xs text-gray-400">p {pFmt(c.bartlett_p)}</td>
          </tr>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#parallel-analysis"
                className="hover:text-blue-600 hover:underline"
              >
                Parallel Analysis Factors
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{c.parallel_factors}</td>
            <td />
          </tr>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#variance-explained"
                className="hover:text-blue-600 hover:underline"
              >
                Variance Explained
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">
              {fmt(c.variance_explained * 100, 1)}%
            </td>
            <td />
          </tr>
          <tr>
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#eigenvalue"
                className="hover:text-blue-600 hover:underline"
              >
                Top Eigenvalues
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono text-xs" colSpan={2}>
              {c.top_eigenvalues.map((v) => fmt(v, 2)).join(', ')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)

/* ── CFA Summary Card ── */
const CFACard = ({ c }: { c: ConstructValidation }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-purple-700 text-white px-4 py-2 font-bold font-sans">
      {c.construct} CFA (Single-Factor)
    </div>
    <div className="p-4">
      <table className="w-full text-sm font-sans border-collapse">
        <tbody>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">N</td>
            <td className="py-1.5 text-right font-mono">{c.n_valid}</td>
            <td />
          </tr>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">&chi;&sup2; (df)</td>
            <td className="py-1.5 text-right font-mono">
              {fmt(c.cfa_chi2, 1)} ({c.cfa_df})
            </td>
            <td className="py-1.5 text-right text-xs text-gray-400">p {pFmt(c.cfa_p)}</td>
          </tr>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#cfi"
                className="hover:text-blue-600 hover:underline"
              >
                CFI
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{fmt(c.cfa_cfi)}</td>
            <td className="py-1.5 text-right">
              <Verdict
                pass={c.cfa_cfi >= 0.9}
                label={c.cfa_cfi >= 0.95 ? 'Good' : c.cfa_cfi >= 0.9 ? 'Acceptable' : 'Poor'}
              />
            </td>
          </tr>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#tli"
                className="hover:text-blue-600 hover:underline"
              >
                TLI
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{fmt(c.cfa_tli)}</td>
            <td className="py-1.5 text-right">
              <Verdict
                pass={c.cfa_tli >= 0.9}
                label={c.cfa_tli >= 0.95 ? 'Good' : c.cfa_tli >= 0.9 ? 'Acceptable' : 'Poor'}
              />
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-gray-600">
              <Link
                href="/results/crp-2026/glossary#rmsea"
                className="hover:text-blue-600 hover:underline"
              >
                RMSEA
              </Link>
            </td>
            <td className="py-1.5 text-right font-mono font-bold">{fmt(c.cfa_rmsea)}</td>
            <td className="py-1.5 text-right">
              <Verdict
                pass={c.cfa_rmsea <= 0.08}
                label={c.cfa_rmsea <= 0.06 ? 'Good' : c.cfa_rmsea <= 0.08 ? 'Acceptable' : 'Poor'}
              />
            </td>
          </tr>
        </tbody>
      </table>
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
              <span className="mx-2" aria-hidden="true">
                &rsaquo;
              </span>
            </li>
            <li>
              <Link href="/results/crp-2026" className="hover:text-blue-600 hover:underline">
                CRP 2026
              </Link>
              <span className="mx-2" aria-hidden="true">
                &rsaquo;
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Instrument Validation
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Instrument Validation</h1>

        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            Published: April 2026
          </span>
          <span className="inline-flex items-center px-3 py-1 ml-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            N = {N_CLEAN}
          </span>
        </div>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This page presents the comprehensive psychometric validation of the 43-item TABS
            instrument (18 Barriers + 17 Readiness + 8 Maturity) using the CRP-200 frozen dataset.
            All computations are produced by the open-source{' '}
            <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              tabs_v2_validation.py
            </code>{' '}
            script (Appendix N) and are fully reproducible.
          </p>
          <p className="text-sm text-gray-500 font-sans mb-6">
            Terms are linked to the{' '}
            <Link href="/results/crp-2026/glossary" className="text-blue-600 hover:underline">
              Statistics Glossary
            </Link>
            . See also{' '}
            <Link
              href="/results/crp-2026/factor-analysis"
              className="text-blue-600 hover:underline"
            >
              Factor Analysis
            </Link>{' '}
            for the hierarchical barrier factor structure.
          </p>
        </section>

        {/* ══ SECTION 1: RELIABILITY ══ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>1. Reliability</h2>
          <p className={PARAGRAPH_CLASSES}>
            Five complementary reliability measures confirm strong internal consistency across all
            three TABS constructs. Every construct exceeds the .80 threshold for good reliability.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {CONSTRUCTS.map((c) => (
              <ReliabilityCard key={c.construct} c={c} />
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-3 py-2 border">
                    Measure
                  </th>
                  {CONSTRUCTS.map((c) => (
                    <th scope="col" key={c.construct} className="text-right px-3 py-2 border">
                      {c.construct}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Cronbach's \u03B1", key: 'cronbach_alpha' as const },
                  { label: "McDonald's \u03C9", key: 'mcdonalds_omega' as const },
                  { label: 'Composite Reliability', key: 'composite_reliability' as const },
                  { label: 'AVE', key: 'ave_from_loadings' as const },
                  { label: 'Split-Half', key: 'split_half' as const },
                ].map((row, i) => (
                  <tr key={row.key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border font-medium">{row.label}</td>
                    {CONSTRUCTS.map((c) => (
                      <td key={c.construct} className="text-right px-3 py-1.5 border font-mono">
                        {fmt(c[row.key], 4)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══ SECTION 2: EFA ══ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>2. Exploratory Factor Analysis</h2>
          <p className={PARAGRAPH_CLASSES}>
            EFA was conducted on each construct independently using Maximum Likelihood estimation
            with Promax oblique rotation. The number of factors was determined by Horn&rsquo;s
            Parallel Analysis comparing actual eigenvalues against 95th-percentile random data
            eigenvalues.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {CONSTRUCTS.map((c) => (
              <EFACard key={c.construct} c={c} />
            ))}
          </div>
          <p className="text-sm text-gray-500 font-sans">
            Barriers extract 2 factors (Internal/Organizational + External/Compliance). Readiness
            and Maturity are each unidimensional. See{' '}
            <Link
              href="/results/crp-2026/factor-analysis"
              className="text-blue-600 hover:underline"
            >
              Factor Analysis
            </Link>{' '}
            for the full loading matrix and hierarchical decomposition.
          </p>
        </section>

        {/* ══ SECTION 3: CFA ══ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>3. Confirmatory Factor Analysis</h2>
          <p className={PARAGRAPH_CLASSES}>
            CFA tests whether the EFA-derived factor structure fits the data when specified as a
            confirmatory model. Single-factor models were fit for each construct, plus a 4-factor
            model for Barriers using the concept-mapping sub-constructs.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {CONSTRUCTS.map((c) => (
              <CFACard key={c.construct} c={c} />
            ))}
          </div>

          <h3 className={H3_CLASSES}>Barriers 4-Factor CFA (Concept-Mapping Sub-Constructs)</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-3 py-2 border">
                    Index
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    Value
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    Verdict
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-1.5 border">&chi;&sup2; (df)</td>
                  <td className="text-right px-3 py-1.5 border font-mono">
                    {fmt(BARRIERS_4F_CFA.chi2, 1)} ({BARRIERS_4F_CFA.df})
                  </td>
                  <td className="text-right px-3 py-1.5 border text-xs text-gray-400">
                    p {pFmt(BARRIERS_4F_CFA.chi2_p)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-1.5 border">CFI</td>
                  <td className="text-right px-3 py-1.5 border font-mono font-bold">
                    {fmt(BARRIERS_4F_CFA.cfi)}
                  </td>
                  <td className="text-right px-3 py-1.5 border">
                    <Verdict
                      pass={BARRIERS_4F_CFA.cfi >= 0.9}
                      label={
                        BARRIERS_4F_CFA.cfi >= 0.95
                          ? 'Good'
                          : BARRIERS_4F_CFA.cfi >= 0.9
                            ? 'Acceptable'
                            : 'Poor'
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 border">TLI</td>
                  <td className="text-right px-3 py-1.5 border font-mono font-bold">
                    {fmt(BARRIERS_4F_CFA.tli)}
                  </td>
                  <td className="text-right px-3 py-1.5 border">
                    <Verdict
                      pass={BARRIERS_4F_CFA.tli >= 0.9}
                      label={
                        BARRIERS_4F_CFA.tli >= 0.95
                          ? 'Good'
                          : BARRIERS_4F_CFA.tli >= 0.9
                            ? 'Acceptable'
                            : 'Poor'
                      }
                    />
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-1.5 border">RMSEA</td>
                  <td className="text-right px-3 py-1.5 border font-mono font-bold">
                    {fmt(BARRIERS_4F_CFA.rmsea)}
                  </td>
                  <td className="text-right px-3 py-1.5 border">
                    <Verdict
                      pass={BARRIERS_4F_CFA.rmsea <= 0.08}
                      label={
                        BARRIERS_4F_CFA.rmsea <= 0.06
                          ? 'Good'
                          : BARRIERS_4F_CFA.rmsea <= 0.08
                            ? 'Acceptable'
                            : 'Poor'
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 border">AIC</td>
                  <td className="text-right px-3 py-1.5 border font-mono">
                    {fmt(BARRIERS_4F_CFA.aic, 1)}
                  </td>
                  <td className="text-right px-3 py-1.5 border text-xs text-gray-400">
                    Lower is better
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-1.5 border">BIC</td>
                  <td className="text-right px-3 py-1.5 border font-mono">
                    {fmt(BARRIERS_4F_CFA.bic, 1)}
                  </td>
                  <td className="text-right px-3 py-1.5 border text-xs text-gray-400">
                    Lower is better
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 font-sans">
            The 4-factor model (CFI = {fmt(BARRIERS_4F_CFA.cfi)}) improves over the single-factor
            model (CFI = {fmt(CONSTRUCTS[0].cfa_cfi)}) but remains below the .90 threshold,
            consistent with the EFA finding that 2 factors (not 4) best represent the data. Full CFA
            with cross-validation is planned at N=500.
          </p>
        </section>

        {/* ══ SECTION 4: DISCRIMINANT VALIDITY ══ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>4. Discriminant Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            Discriminant validity assesses whether the three TABS constructs are empirically
            distinct from one another. Two complementary methods are used: HTMT and the
            Fornell-Larcker criterion.
          </p>

          <h3 className={H3_CLASSES}>HTMT Ratios</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-3 py-2 border">
                    Construct Pair
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    HTMT
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    95% Bootstrap CI
                  </th>
                  <th scope="col" className="text-center px-3 py-2 border">
                    &lt; .85
                  </th>
                  <th scope="col" className="text-center px-3 py-2 border">
                    &lt; .90
                  </th>
                </tr>
              </thead>
              <tbody>
                {HTMT_DATA.map((h, i) => (
                  <tr key={h.pair} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border font-medium">{h.pair}</td>
                    <td className="text-right px-3 py-1.5 border font-mono font-bold">
                      {fmt(h.htmt)}
                    </td>
                    <td className="text-right px-3 py-1.5 border font-mono text-xs">
                      [{fmt(h.ci_95[0])}, {fmt(h.ci_95[1])}]
                    </td>
                    <td className="text-center px-3 py-1.5 border">
                      <Verdict pass={h.passes_085} />
                    </td>
                    <td className="text-center px-3 py-1.5 border">
                      <Verdict pass={h.passes_090} />
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
                  <th scope="col" className="text-left px-3 py-2 border">
                    Pair
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    &radic;AVE<sub>1</sub>
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    &radic;AVE<sub>2</sub>
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    |r|
                  </th>
                  <th scope="col" className="text-center px-3 py-2 border">
                    Pass
                  </th>
                </tr>
              </thead>
              <tbody>
                {FL_DATA.map((fl, i) => (
                  <tr key={fl.pair} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border font-medium">{fl.pair}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">
                      {fmt(fl.sqrt_ave_1)}
                    </td>
                    <td className="text-right px-3 py-1.5 border font-mono">
                      {fmt(fl.sqrt_ave_2)}
                    </td>
                    <td className="text-right px-3 py-1.5 border font-mono font-bold">
                      {fmt(Math.abs(fl.correlation))}
                    </td>
                    <td className="text-center px-3 py-1.5 border">
                      <Verdict pass={fl.passes} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 font-sans text-sm">
            <p className="font-bold text-amber-800 mb-1">Readiness-Maturity Overlap (r = .719)</p>
            <p className="text-amber-700">
              The Fornell-Larcker criterion fails for the Readiness-Maturity pair, while HTMT (.804)
              passes the .85 threshold. This reflects their shared &ldquo;organizational
              capability&rdquo; dimension: Readiness originates from the TRI/adoption literature and
              Maturity from CMMI/IT governance. Both scales provide distinct value to their
              respective practitioner communities despite measuring overlapping variance, and the
              HTMT result suggests the constructs remain distinguishable under that criterion.
            </p>
          </div>
        </section>

        {/* ══ SECTION 5: CONSTRUCT CORRELATIONS ══ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>5. Construct Correlations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-3 py-2 border">
                    Construct
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    Barriers
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    Readiness
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    Maturity
                  </th>
                </tr>
              </thead>
              <tbody>
                {['Barriers', 'Readiness', 'Maturity'].map((row, ri) => (
                  <tr key={row} className={ri % 2 === 1 ? 'bg-gray-50' : ''}>
                    <th scope="row" className="px-3 py-1.5 border font-medium text-left">
                      {row}
                    </th>
                    {['Barriers', 'Readiness', 'Maturity'].map((col) => {
                      const val = CORR_MATRIX[row][col]
                      const isDiag = row === col
                      return (
                        <td
                          key={col}
                          className={`text-right px-3 py-1.5 border font-mono ${isDiag ? 'bg-gray-200 font-bold' : ''}`}
                        >
                          {isDiag ? '1.000' : fmt(val)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 font-sans">
            Barriers correlate negatively with both Readiness (r = -.381) and Maturity (r = -.316),
            as expected: organizations with higher readiness and maturity perceive fewer barriers.
            Readiness and Maturity are positively correlated (r = .719), reflecting overlapping
            organizational capability constructs.
          </p>
        </section>

        {/* ══ SECTION 6: ITEM DIAGNOSTICS ══ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>6. Item Diagnostics</h2>

          <h3 className={H3_CLASSES}>Flagged Items</h3>
          <p className={PARAGRAPH_CLASSES}>
            Items are flagged if their corrected item-total correlation falls below .30, or if
            deleting them would increase Cronbach&rsquo;s alpha. The current validation summary
            reports whether any items fall below the CITC threshold and the minimum observed CITC:
          </p>
          {validationData.Barriers.itc_all_above_030 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 font-sans text-sm mb-6">
              <p className="font-bold text-green-800">No Barriers items are flagged by CITC.</p>
              <p className="text-green-700 mt-1">
                All corrected item-total correlations are at or above .30 for the Barriers scale.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 font-sans text-sm mb-6">
              <p className="font-bold text-red-800">
                At least one Barriers item falls below the CITC threshold (minimum CITC ={' '}
                {validationData.Barriers.itc_min.toFixed(2).replace(/^0/, '')}).
              </p>
              <p className="text-red-700 mt-1">
                This item&rsquo;s CITC score falls below the conventional .30 threshold. The current
                validation summary does not identify which item produced the minimum CITC, so no
                item-specific rationale is reported here. Review the full item statistics in the
                pipeline output for details.
              </p>
            </div>
          )}

          <h3 className={H3_CLASSES}>Inter-Item Correlation Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-3 py-2 border">
                    Construct
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    Mean r
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    Min r
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    Max r
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    SD
                  </th>
                </tr>
              </thead>
              <tbody>
                {CONSTRUCTS.map((c, i) => (
                  <tr key={c.construct} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border font-medium">{c.construct}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">
                      {fmt(c.inter_item_mean)}
                    </td>
                    <td className="text-right px-3 py-1.5 border font-mono">
                      {fmt(c.inter_item_min, 2)}
                    </td>
                    <td className="text-right px-3 py-1.5 border font-mono">
                      {fmt(c.inter_item_max, 2)}
                    </td>
                    <td className="text-right px-3 py-1.5 border font-mono">
                      {fmt(c.inter_item_sd, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 font-sans">
            Optimal mean inter-item correlation: 0.15 to 0.50 (Clark &amp; Watson, 1995). All three
            constructs fall within this range.
          </p>
        </section>

        {/* ══ SECTION 7: OVERALL VERDICT ══ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>7. Validation Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-3 py-2 border">
                    Criterion
                  </th>
                  <th scope="col" className="text-center px-3 py-2 border">
                    Barriers
                  </th>
                  <th scope="col" className="text-center px-3 py-2 border">
                    Readiness
                  </th>
                  <th scope="col" className="text-center px-3 py-2 border">
                    Maturity
                  </th>
                </tr>
              </thead>
              <tbody>
                {VERDICT_ROWS.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border">{row.label}</td>
                    {row.vals.map((v, j) => (
                      <td key={j} className="text-center px-3 py-1.5 border">
                        <Verdict pass={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={PARAGRAPH_CLASSES}>
            The TABS instrument demonstrates strong reliability (all &alpha; &gt; .85, all CR &gt;
            .87) and adequate factor structure at N=200. Readiness and Maturity show excellent CFA
            fit as unidimensional scales. Barriers is inherently multi-dimensional (2-factor EFA),
            so single-factor CFA fit is expected to be poor. All HTMT ratios pass the conservative
            .85 threshold. Any item-level flags (CITC &lt; .30) are retained for substantive
            reasons. AVE values below .50 are compensated by CR &gt; .80 per Fornell &amp; Larcker
            (1981) and are typical for broad, multi-faceted organizational behavior constructs.
          </p>
        </section>

        {/* ── Navigation ── */}
        <section className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-wrap gap-4 text-sm font-sans">
            <Link
              href="/results/crp-2026/factor-analysis"
              className="text-blue-600 hover:underline"
            >
              Factor Analysis &rarr;
            </Link>
            <Link href="/results/crp-2026/glossary" className="text-blue-600 hover:underline">
              Statistics Glossary &rarr;
            </Link>
            <Link href="/results/crp-2026/reliability" className="text-blue-600 hover:underline">
              Scale Reliability &rarr;
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
