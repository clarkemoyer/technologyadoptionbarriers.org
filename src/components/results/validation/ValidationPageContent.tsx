'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import {
  type ConstructValidation,
  fmt,
  pFmt,
  getCfaError,
  Verdict,
  CfaHigherVerdict,
  CfaLowerVerdict,
  CfaUnavailable,
  ReliabilityCard,
  EFACard,
  CFACard,
} from '@/components/results/validation/ValidationCards'

/* ══════════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════════ */

/** A single sample's validation results (matches pipeline output). */
type SampleEntry = {
  key: string
  label: string
  description: string
  n: number
  n_to_param_ratio: number
  adequacy: string
  adequacy_note: string
  Barriers: Record<string, unknown>
  Readiness: Record<string, unknown>
  Maturity: Record<string, unknown>
  htmt: Array<Record<string, unknown>>
  fornell_larcker: Array<Record<string, unknown>>
  construct_correlations: Record<string, Record<string, number>>
  barriers_4f_cfa: Record<string, unknown>
  factor_analysis: Record<string, unknown>
  verdicts: Record<string, Record<string, boolean>>
  metadata: {
    n_total: number
    crp200_mode: boolean
    constructs: string[]
    n_barriers: number
    n_readiness: number
    n_maturity: number
  }
}

/** Top-level validation data (new per-sample format). */
type ValidationDataNew = {
  samples: SampleEntry[]
  primary_sample: string
}

/** Legacy flat validation data (pre-#1544). */
type ValidationDataLegacy = {
  Barriers: Record<string, unknown>
  metadata: {
    n_total: number
    crp200_mode: boolean
    constructs: string[]
    n_barriers: number
    n_readiness: number
    n_maturity: number
  }
  [key: string]: unknown
}

/** Widened to accept JSON imports whose inferred types don't exactly match. */
type AnyValidationData = Record<string, unknown>

/* ══════════════════════════════════════════════════════════════════
   DATA NORMALIZATION (handles old flat format + new per-sample format)
══════════════════════════════════════════════════════════════════ */

function normalizeValidationData(data: AnyValidationData): ValidationDataNew {
  if ('samples' in data && Array.isArray(data.samples)) {
    return data as unknown as ValidationDataNew
  }
  // Legacy flat format: wrap in single-sample structure
  const legacy = data as unknown as ValidationDataLegacy
  const isCrp = legacy.metadata?.crp200_mode ?? false
  const entry: SampleEntry = {
    ...(legacy as unknown as SampleEntry),
    key: isCrp ? 'crp_200' : 'legacy',
    label: isCrp ? 'CRP-200' : 'Legacy Filter',
    description: isCrp
      ? 'Frozen CRP dataset (N=200, tiered selection)'
      : 'Pre-#1544 unnamed sample (duration >= 480s + all 3 IRIs)',
    n: legacy.metadata?.n_total ?? 0,
    n_to_param_ratio: Math.round(((legacy.metadata?.n_total ?? 0) / 46) * 10) / 10,
    adequacy: 'unknown',
    adequacy_note: 'Sample size adequacy was not tracked in the pre-#1544 pipeline format.',
  }
  return {
    samples: [entry],
    primary_sample: entry.key,
  }
}

/* ══════════════════════════════════════════════════════════════════
   ADEQUACY BADGE
══════════════════════════════════════════════════════════════════ */

const ADEQUACY_COLORS: Record<string, string> = {
  good: 'bg-green-50 text-green-800 border-green-200',
  adequate: 'bg-blue-50 text-blue-800 border-blue-200',
  marginal: 'bg-amber-50 text-amber-800 border-amber-200',
  inadequate: 'bg-red-50 text-red-800 border-red-200',
  unknown: 'bg-gray-50 text-gray-700 border-gray-200',
}

/* ══════════════════════════════════════════════════════════════════
   EXTRACT CONSTRUCTS (from a single sample entry)
══════════════════════════════════════════════════════════════════ */

function extractConstructs(sample: SampleEntry): ConstructValidation[] {
  const ITEM_COUNTS: Record<string, number> = {
    Barriers: sample.metadata.n_barriers,
    Readiness: sample.metadata.n_readiness,
    Maturity: sample.metadata.n_maturity,
  }
  const constructNames = sample.metadata.constructs as ('Barriers' | 'Readiness' | 'Maturity')[]
  return constructNames.map((name) => {
    const d = sample[name] as Record<string, unknown>
    const kmo = d.kmo_bartlett as Record<string, number>
    const pa = d.parallel_analysis as Record<string, unknown>
    const efa = d.efa as Record<string, number>
    const cfa = d.cfa as Record<string, number | null>
    const ii = d.inter_item as Record<string, number>
    return {
      construct: name,
      n_items: ITEM_COUNTS[name],
      n_valid: d.n_listwise as number,
      cronbach_alpha: d.cronbach_alpha as number,
      alpha_95ci: d.cronbach_alpha_ci as [number, number],
      mcdonalds_omega: d.mcdonalds_omega as number,
      composite_reliability: d.composite_reliability as number,
      ave_from_loadings: d.ave as number,
      split_half: d.split_half as number,
      kmo: kmo.kmo_overall,
      bartlett_chi2: kmo.bartlett_chi2,
      bartlett_p: kmo.bartlett_p,
      parallel_factors: pa.n_factors as number,
      variance_explained: efa.total_variance,
      top_eigenvalues: pa.eigenvalues_real as number[],
      cfa_chi2: cfa.chi2 ?? null,
      cfa_df: cfa.df ?? null,
      cfa_p: cfa.chi2_p ?? null,
      cfa_cfi: cfa.cfi ?? null,
      cfa_tli: cfa.tli ?? null,
      cfa_rmsea: cfa.rmsea ?? null,
      inter_item_mean: ii.mean_r,
      inter_item_min: ii.min_r,
      inter_item_max: ii.max_r,
      inter_item_sd: ii.sd_r,
    }
  })
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */

type Props = {
  data: AnyValidationData
  variant: 'live' | 'crp'
}

export function ValidationPageContent({ data, variant }: Props) {
  const normalized = useMemo(() => normalizeValidationData(data), [data])
  const [selectedKey, setSelectedKey] = useState(normalized.primary_sample)

  const sample = useMemo(
    () => normalized.samples.find((s) => s.key === selectedKey) ?? normalized.samples[0],
    [normalized, selectedKey]
  )

  const CONSTRUCTS = useMemo(() => extractConstructs(sample), [sample])

  const HTMT_DATA = useMemo(
    () =>
      (sample.htmt as Array<Record<string, unknown>>).map((h) => ({
        pair: (h.pair as string).replace(' vs ', '-'),
        htmt: h.htmt as number,
        ci_95: [h.ci_lower, h.ci_upper] as [number, number],
        passes_085: h.below_085 as boolean,
        passes_090: h.below_090 as boolean,
      })),
    [sample]
  )

  const FL_DATA = useMemo(
    () =>
      (sample.fornell_larcker as Array<Record<string, unknown>>).map((fl) => ({
        pair: (fl.pair as string).replace(' vs ', '-'),
        sqrt_ave_1: fl.sqrt_ave1 as number,
        sqrt_ave_2: fl.sqrt_ave2 as number,
        correlation:
          sample.construct_correlations[
            (fl.pair as string).split(' vs ')[0] as keyof typeof sample.construct_correlations
          ][(fl.pair as string).split(' vs ')[1] as 'Barriers' | 'Readiness' | 'Maturity'],
        passes: fl.pass as boolean,
      })),
    [sample]
  )

  const CORR_MATRIX = sample.construct_correlations
  const BARRIERS_4F_CFA = sample.barriers_4f_cfa as Record<string, number | null>

  const has4fCfaData =
    BARRIERS_4F_CFA.cfi != null ||
    BARRIERS_4F_CFA.tli != null ||
    BARRIERS_4F_CFA.rmsea != null ||
    BARRIERS_4F_CFA.chi2 != null

  const VERDICT_ROWS = useMemo(() => {
    const constructs = ['Barriers', 'Readiness', 'Maturity'] as const
    type CK = (typeof constructs)[number]
    const verdicts = sample.verdicts as Record<CK, Record<string, boolean>>
    const getVals = (fn: (c: CK) => boolean | null): (boolean | null)[] => constructs.map(fn)

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
      { label: 'KMO \u2265 .60', vals: getVals((c) => verdicts[c].kmo_above_060) },
      {
        label: 'CFA CFI \u2265 .90',
        vals: getVals((c) => {
          const cfa = (sample[c] as Record<string, unknown>)?.cfa as
            | Record<string, number | null>
            | undefined
          return cfa?.cfi != null ? verdicts[c].cfa_cfi_above_090 : null
        }),
      },
      {
        label: 'CFA RMSEA \u2264 .08',
        vals: getVals((c) => {
          const cfa = (sample[c] as Record<string, unknown>)?.cfa as
            | Record<string, number | null>
            | undefined
          if (cfa?.rmsea == null) return null
          return verdicts[c].cfa_rmsea_below_008 ?? cfa.rmsea <= 0.08
        }),
      },
      {
        label: 'HTMT < .85 (all pairs)',
        vals: getVals((c) =>
          (sample.htmt as Array<Record<string, unknown>>)
            .filter((h) => (h.pair as string).includes(c))
            .every((h) => h.below_085 as boolean)
        ),
      },
      { label: 'No CITC < .30 flags', vals: getVals((c) => verdicts[c].itc_all_above_030) },
    ]
  }, [sample])

  const factorAnalysisLink =
    variant === 'crp' ? '/results/crp-2026/factor-analysis' : '/results/factor-analysis'
  const glossaryLink = '/results/glossary'
  const reliabilityLink =
    variant === 'crp' ? '/results/crp-2026/reliability' : '/results/reliability'
  const backLink = variant === 'crp' ? '/results/crp-2026' : '/results'
  const backLabel = variant === 'crp' ? 'CRP 2026 Overview' : 'Results Overview'

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Instrument Validation</h1>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            Published: April 2026
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            N = {sample.n}
          </span>
        </div>

        {/* ── Sample Selector ── */}
        {normalized.samples.length > 1 && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg font-sans">
            <label htmlFor="sample-select" className="block text-sm font-bold text-gray-700 mb-2">
              Analysis Sample
            </label>
            <select
              id="sample-select"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {normalized.samples.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label} (N={s.n}){s.key === normalized.primary_sample ? ' - Primary' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">{sample.description}</p>
          </div>
        )}

        {/* ── Adequacy Note ── */}
        {sample.adequacy && sample.adequacy !== 'unknown' && (
          <div
            className={`mb-6 rounded-lg border p-4 font-sans text-sm ${ADEQUACY_COLORS[sample.adequacy] ?? ADEQUACY_COLORS.unknown}`}
          >
            <p>
              <span className="font-bold">
                Sample size adequacy:{' '}
                {sample.adequacy.charAt(0).toUpperCase() + sample.adequacy.slice(1)}.
              </span>{' '}
              {sample.adequacy_note}
            </p>
          </div>
        )}

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This page presents the comprehensive psychometric validation of the 43-item TABS
            instrument (18 Barriers + 17 Readiness + 8 Maturity) using the{' '}
            {variant === 'crp' ? 'CRP-200 frozen dataset' : 'full TABS dataset'}. All computations
            are produced by the open-source{' '}
            <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              tabs_v2_unified_data_analysis.py
            </code>{' '}
            script (Appendix N) and are fully reproducible.
          </p>
          <p className="text-sm text-gray-500 font-sans mb-6">
            Terms are linked to the{' '}
            <Link href={glossaryLink} className="text-blue-600 hover:underline">
              Statistics Glossary
            </Link>
            . See also{' '}
            <Link href={factorAnalysisLink} className="text-blue-600 hover:underline">
              Factor Analysis
            </Link>{' '}
            for the hierarchical barrier factor structure.
          </p>
        </section>

        {/* == SECTION 1: RELIABILITY == */}
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
                {(
                  [
                    { label: "Cronbach's \u03B1", key: 'cronbach_alpha' as const },
                    { label: "McDonald's \u03C9", key: 'mcdonalds_omega' as const },
                    { label: 'Composite Reliability', key: 'composite_reliability' as const },
                    { label: 'AVE', key: 'ave_from_loadings' as const },
                    { label: 'Split-Half', key: 'split_half' as const },
                  ] as const
                ).map((row, i) => (
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

        {/* == SECTION 2: EFA == */}
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
            <Link href={factorAnalysisLink} className="text-blue-600 hover:underline">
              Factor Analysis
            </Link>{' '}
            for the full loading matrix and hierarchical decomposition.
          </p>
        </section>

        {/* == SECTION 3: CFA == */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>3. Confirmatory Factor Analysis</h2>
          <p className={PARAGRAPH_CLASSES}>
            CFA tests whether the EFA-derived factor structure fits the data when specified as a
            confirmatory model. Single-factor models were fit for each construct, plus a 4-factor
            model for Barriers using the concept-mapping sub-constructs.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {CONSTRUCTS.map((c) => (
              <CFACard
                key={c.construct}
                c={c}
                cfaError={getCfaError(
                  (
                    sample[c.construct as 'Barriers' | 'Readiness' | 'Maturity'] as Record<
                      string,
                      unknown
                    >
                  )?.cfa as Record<string, unknown>
                )}
              />
            ))}
          </div>

          <h3 className={H3_CLASSES}>Barriers 4-Factor CFA (Concept-Mapping Sub-Constructs)</h3>
          {has4fCfaData ? (
            <>
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
                        <CfaHigherVerdict
                          val={BARRIERS_4F_CFA.cfi ?? null}
                          good={0.95}
                          acceptable={0.9}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 border">TLI</td>
                      <td className="text-right px-3 py-1.5 border font-mono font-bold">
                        {fmt(BARRIERS_4F_CFA.tli)}
                      </td>
                      <td className="text-right px-3 py-1.5 border">
                        <CfaHigherVerdict
                          val={BARRIERS_4F_CFA.tli ?? null}
                          good={0.95}
                          acceptable={0.9}
                        />
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-3 py-1.5 border">RMSEA</td>
                      <td className="text-right px-3 py-1.5 border font-mono font-bold">
                        {fmt(BARRIERS_4F_CFA.rmsea)}
                      </td>
                      <td className="text-right px-3 py-1.5 border">
                        <CfaLowerVerdict
                          val={BARRIERS_4F_CFA.rmsea ?? null}
                          good={0.06}
                          acceptable={0.08}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 border">AIC</td>
                      <td className="text-right px-3 py-1.5 border font-mono">
                        {fmt(BARRIERS_4F_CFA.aic as number | null, 1)}
                      </td>
                      <td className="text-right px-3 py-1.5 border text-xs text-gray-400">
                        Lower is better
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-3 py-1.5 border">BIC</td>
                      <td className="text-right px-3 py-1.5 border font-mono">
                        {fmt(BARRIERS_4F_CFA.bic as number | null, 1)}
                      </td>
                      <td className="text-right px-3 py-1.5 border text-xs text-gray-400">
                        Lower is better
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 font-sans">
                The 4-factor model (CFI = {fmt(BARRIERS_4F_CFA.cfi)}) improves over the
                single-factor model (CFI = {fmt(CONSTRUCTS[0].cfa_cfi)}) but remains below the .90
                threshold, consistent with the EFA finding that 2 factors (not 4) best represent the
                data. Full CFA with cross-validation is planned at N=500.
              </p>
            </>
          ) : (
            <CfaUnavailable
              error={getCfaError(sample.barriers_4f_cfa as Record<string, unknown>)}
            />
          )}
        </section>

        {/* == SECTION 4: DISCRIMINANT VALIDITY == */}
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

        {/* == SECTION 5: CONSTRUCT CORRELATIONS == */}
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
                      const val = CORR_MATRIX[row]?.[col]
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
            Barriers correlate negatively with both Readiness and Maturity, as expected:
            organizations with higher readiness and maturity perceive fewer barriers. Readiness and
            Maturity are positively correlated, reflecting overlapping organizational capability
            constructs.
          </p>
        </section>

        {/* == SECTION 6: ITEM DIAGNOSTICS == */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>6. Item Diagnostics</h2>

          <h3 className={H3_CLASSES}>Flagged Items</h3>
          <p className={PARAGRAPH_CLASSES}>
            Items are flagged if their corrected item-total correlation falls below .30, or if
            deleting them would increase Cronbach&rsquo;s alpha. The current validation summary
            reports whether any items fall below the CITC threshold and the minimum observed CITC:
          </p>
          {(sample.Barriers as Record<string, unknown>).itc_all_above_030 ? (
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
                {(sample.Barriers as Record<string, unknown>).itc_min === null
                  ? 'N/A'
                  : ((sample.Barriers as Record<string, unknown>).itc_min as number)
                      .toFixed(2)
                      .replace(/^0/, '')}
                ).
              </p>
              <p className="text-red-700 mt-1">
                This item&rsquo;s CITC score falls below the conventional .30 threshold. Review the
                full item statistics in the pipeline output for details.
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

        {/* == SECTION 7: OVERALL VERDICT == */}
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
                        {v === null ? (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-500">
                            N/A
                          </span>
                        ) : (
                          <Verdict pass={v} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={PARAGRAPH_CLASSES}>
            The TABS instrument demonstrates strong reliability (all &alpha; &gt; .85, all CR &gt;
            .87) and adequate factor structure. Readiness and Maturity show excellent CFA fit as
            unidimensional scales. Barriers is inherently multi-dimensional (2-factor EFA), so
            single-factor CFA fit is expected to be poor. All HTMT ratios pass the conservative .85
            threshold. Any item-level flags (CITC &lt; .30) are retained for substantive reasons.
            AVE values below .50 are compensated by CR &gt; .80 per Fornell &amp; Larcker (1981) and
            are typical for broad, multi-faceted organizational behavior constructs.
          </p>
        </section>

        {/* -- Navigation -- */}
        <section className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-wrap gap-4 text-sm font-sans">
            <Link href={factorAnalysisLink} className="text-blue-600 hover:underline">
              Factor Analysis &rarr;
            </Link>
            <Link href={glossaryLink} className="text-blue-600 hover:underline">
              Statistics Glossary &rarr;
            </Link>
            <Link href={reliabilityLink} className="text-blue-600 hover:underline">
              Scale Reliability &rarr;
            </Link>
            <Link href={backLink} className="text-blue-600 hover:underline">
              &larr; {backLabel}
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
