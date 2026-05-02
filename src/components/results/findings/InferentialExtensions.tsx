import { H2_CLASSES, H3_CLASSES, PARAGRAPH_CLASSES } from '@/lib/articleStyles'
import { DATA_UNAVAILABLE } from '@/lib/sentinelMarker'

/**
 * "Inferential Extensions" section for /results/findings and
 * /results/crp-2026/findings, surfacing 5 of the 28 new JSON keys from
 * PR #1837 per issue #1839:
 *
 *   mediation_b_r_m                    - bootstrapped Barriers -> Readiness -> Maturity
 *   per_factor_regressions             - sub-factor regression decomposition
 *   standardized_subfactor_regressions - standardized betas + VIF (multicollinearity)
 *   equivalence_test_tost_smb_ent      - TOST equivalence (+/- 0.30 SD) by org size
 *   power_analysis                     - smallest detectable Cohen's d at current N
 */

type MediationLeg = {
  coef: number | null
  se: number | null
  p: number | null
  ci_lo: number | null
  ci_hi: number | null
  /** JSON encodes sig as "Yes"/"No" strings; boolean also accepted. */
  sig: string | boolean | null
}

type MediationData = {
  'R ~ X'?: MediationLeg
  'Y ~ R'?: MediationLeg
  Total?: MediationLeg
  Direct?: MediationLeg
  Indirect?: MediationLeg
  n_listwise?: number
  error?: string
  skipped?: boolean
}

type RegressionModel = {
  r2: number | null
  beta_std?: Record<string, number | null>
  t?: Record<string, number | null>
  p?: Record<string, number | null>
  n?: number
}

type PerFactorRegEntry = {
  total_scale_model: RegressionModel
  sub_factor_model: RegressionModel
  r2_lift_from_decomposition: number | null
  error?: string
}

type PerFactorRegData = {
  Readiness_mean?: PerFactorRegEntry
  Maturity_mean?: PerFactorRegEntry
  error?: string
  skipped?: boolean
}

type StandardizedRegData = {
  R?: RegressionModel
  M?: RegressionModel
  vif?: Record<string, number | null>
  error?: string
  skipped?: boolean
}

type TOSTConstruct = {
  p_tost: number | null
  delta: number | null
  pooled_sd: number | null
  equivalent_05: boolean | null
}

type TOSTData = {
  Barriers?: TOSTConstruct
  Readiness?: TOSTConstruct
  Maturity?: TOSTConstruct
  error?: string
  skipped?: boolean
}

type PowerAnalysisData = {
  n_smb?: number
  n_enterprise?: number
  ratio?: number
  detectable_d_at_power_80?: number
  note?: string
  error?: string
  skipped?: boolean
}

export type InferentialExtensionsProps = {
  mediation?: MediationData | null
  perFactorReg?: PerFactorRegData | null
  standardizedReg?: StandardizedRegData | null
  tost?: TOSTData | null
  powerAnalysis?: PowerAnalysisData | null
}

const fmt = (v: number | null | undefined, digits = 3): string => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return DATA_UNAVAILABLE
  return v.toFixed(digits)
}

const fmtP = (v: number | null | undefined): string => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return DATA_UNAVAILABLE
  if (v < 0.001) return '< .001'
  return v.toFixed(3)
}

/**
 * Normalize `sig` from pipeline JSON ("Yes"/"No" strings or boolean) to
 * boolean | null. Case-insensitive to handle any pipeline encoding variant.
 */
function normSig(sig: string | boolean | null | undefined): boolean | null {
  if (sig === true) return true
  if (sig === false) return false
  if (typeof sig === 'string') {
    const lower = sig.toLowerCase()
    if (lower === 'yes') return true
    if (lower === 'no') return false
  }
  return null
}

const isUsable = <T extends { skipped?: boolean; error?: string }>(
  d: T | null | undefined
): d is T => {
  if (!d) return false
  if (d.skipped === true) return false
  if (typeof d.error === 'string') return false
  return true
}

/* -- Mediation B -> R -> M (full bootstrap output) -- */

function MediationBlock({ data }: { data: MediationData }) {
  const indirect = data.Indirect
  const direct = data.Direct
  const total = data.Total
  const fullMediation =
    normSig(indirect?.sig) === true &&
    normSig(direct?.sig) === false &&
    normSig(total?.sig) === true
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th scope="col" className="border border-gray-300 px-3 py-2 text-left font-bold">Path</th>
              <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">Coef</th>
              <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">SE</th>
              <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">95% CI</th>
              <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">p</th>
              <th scope="col" className="border border-gray-300 px-3 py-2 text-center font-bold">Sig</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['a (R ~ X): Barriers -> Readiness', data['R ~ X']],
                ['b (Y ~ R): Readiness -> Maturity', data['Y ~ R']],
                ['Total (c): Barriers -> Maturity', total],
                ['Direct (c-prime): Barriers -> Maturity | Readiness', direct],
                ['Indirect (a*b): bootstrap mediation effect', indirect],
              ] as Array<[string, MediationLeg | undefined]>
            ).map(([label, leg], i) => (
              <tr key={label} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-300 px-3 py-1.5 font-medium">{label}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">
                  {fmt(leg?.coef)}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">
                  {fmt(leg?.se)}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono text-xs">
                  [{fmt(leg?.ci_lo)}, {fmt(leg?.ci_hi)}]
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">
                  {fmtP(leg?.p)}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-center">
                  {normSig(leg?.sig) === true ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                      sig
                    </span>
                  ) : normSig(leg?.sig) === false ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                      ns
                    </span>
                  ) : (
                    DATA_UNAVAILABLE
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {fullMediation && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 font-sans">
          <strong>Full mediation:</strong> the indirect path through Readiness is significant, the
          direct path is not, and the total is significant. Readiness fully mediates the effect of
          perceived Barriers on Maturity (Baron &amp; Kenny, 1986; Hayes, 2018).
        </div>
      )}
      {data.n_listwise != null && (
        <p className="text-xs text-gray-600 font-sans">
          N (listwise) = {data.n_listwise}. CI bounds are bootstrap percentile intervals (Preacher
          &amp; Hayes, 2008).
        </p>
      )}
    </div>
  )
}

/* -- Per-factor regressions: sub-factor decomposition lift -- */

function PerFactorRegressionBlock({ data }: { data: PerFactorRegData }) {
  const entries: Array<[string, PerFactorRegEntry | undefined]> = [
    ['Readiness as outcome', data.Readiness_mean],
    ['Maturity as outcome', data.Maturity_mean],
  ]
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="border border-gray-300 px-3 py-2 text-left font-bold">Outcome</th>
            <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">
              R-squared (total Barriers scale)
            </th>
            <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">
              R-squared (3 sub-factors F1a/F1b/F2)
            </th>
            <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">
              Lift from decomposition
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([label, e], i) =>
            e ? (
              <tr key={label} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-300 px-3 py-1.5 font-medium">{label}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">
                  {fmt(e.total_scale_model?.r2, 4)}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">
                  {fmt(e.sub_factor_model?.r2, 4)}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono text-emerald-700 font-semibold">
                  {e.r2_lift_from_decomposition != null
                    ? `+${fmt(e.r2_lift_from_decomposition, 4)}`
                    : DATA_UNAVAILABLE}
                </td>
              </tr>
            ) : null
          )}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-gray-600 font-sans">
        Decomposing Barriers into the canonical 3 sub-factors (F1a Strategy &amp; Culture, F1b
        Resources &amp; Operations, F2 External &amp; Compliance) explains additional variance
        beyond the aggregated scale, supporting the multi-factor structure.
      </p>
    </div>
  )
}

/* -- Standardized regressions: betas + VIF -- */

function StandardizedRegressionBlock({ data }: { data: StandardizedRegData }) {
  const factors = ['F1a', 'F1b', 'F2'] as const
  const renderModel = (label: string, m: RegressionModel | undefined) => {
    if (!m) return null
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 mb-3">
        <h4 className="font-semibold text-sm mb-2 text-gray-900">
          {label}{' '}
          <span className="font-mono text-gray-600">
            (R-squared = {fmt(m.r2, 4)}, n = {m.n ?? 'n/a'})
          </span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-white">
                <th scope="col" className="border border-gray-300 px-2 py-1 text-left">Predictor</th>
                <th scope="col" className="border border-gray-300 px-2 py-1 text-right">beta (std)</th>
                <th scope="col" className="border border-gray-300 px-2 py-1 text-right">t</th>
                <th scope="col" className="border border-gray-300 px-2 py-1 text-right">p</th>
              </tr>
            </thead>
            <tbody>
              {factors.map((f) => (
                <tr key={f}>
                  <td className="border border-gray-300 px-2 py-1 font-medium">{f}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                    {fmt(m.beta_std?.[f])}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                    {fmt(m.t?.[f], 2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                    {fmtP(m.p?.[f])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  return (
    <>
      {renderModel('Readiness ~ F1a + F1b + F2', data.R)}
      {renderModel('Maturity ~ F1a + F1b + F2', data.M)}
      {data.vif && (
        <div className="overflow-x-auto">
          <h4 className="font-semibold text-sm mb-2 text-gray-900">
            Variance Inflation Factor (multicollinearity diagnostic)
          </h4>
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th scope="col" className="border border-gray-300 px-3 py-2 text-left">Predictor</th>
                <th scope="col" className="border border-gray-300 px-3 py-2 text-right">VIF</th>
                <th scope="col" className="border border-gray-300 px-3 py-2 text-left">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.vif).map(([k, v], i) => {
                const vif = typeof v === 'number' ? v : null
                const tag =
                  vif == null
                    ? null
                    : vif < 5
                      ? { label: 'OK', cls: 'bg-green-100 text-green-800 border-green-200' }
                      : vif < 10
                        ? { label: 'Watch', cls: 'bg-amber-100 text-amber-800 border-amber-200' }
                        : {
                            label: 'Multicollinearity',
                            cls: 'bg-red-100 text-red-800 border-red-200',
                          }
                return (
                  <tr key={k} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-3 py-1.5 font-medium">{k}</td>
                    <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">
                      {fmt(vif, 2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-1.5">
                      {tag && (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${tag.cls}`}
                        >
                          {tag.label}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-gray-600 font-sans">
            VIF &lt; 5 indicates negligible multicollinearity; 5-10 warrants attention; &gt; 10
            indicates a problem (Hair et al., 2010).
          </p>
        </div>
      )}
    </>
  )
}

/* -- TOST equivalence test (SMB vs ENT) per construct -- */

function TOSTBlock({ data }: { data: TOSTData }) {
  const constructs = ['Barriers', 'Readiness', 'Maturity'] as const
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="border border-gray-300 px-3 py-2 text-left font-bold">Construct</th>
            <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">delta</th>
            <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">Pooled SD</th>
            <th scope="col" className="border border-gray-300 px-3 py-2 text-right font-bold">p-TOST</th>
            <th scope="col" className="border border-gray-300 px-3 py-2 text-center font-bold">
              Equivalent at +/- 0.30 SD
            </th>
          </tr>
        </thead>
        <tbody>
          {constructs.map((c, i) => {
            const e = data[c]
            return (
              <tr key={c} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-300 px-3 py-1.5 font-medium">{c}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">
                  {fmt(e?.delta, 3)}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">
                  {fmt(e?.pooled_sd, 3)}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">
                  {fmtP(e?.p_tost)}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-center">
                  {e?.equivalent_05 === true ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                      Equivalent
                    </span>
                  ) : e?.equivalent_05 === false ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Not equivalent
                    </span>
                  ) : (
                    DATA_UNAVAILABLE
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-gray-600 font-sans">
        Two One-Sided Tests (Lakens 2017) for equivalence between SMB and Enterprise on each
        construct, using equivalence bounds of +/- 0.30 standardized mean difference. p-TOST &lt;
        .05 rejects non-equivalence.
      </p>
    </div>
  )
}

/* -- Power analysis -- */

function PowerAnalysisBlock({ data }: { data: PowerAnalysisData }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 font-sans">
      <h3 className={`${H3_CLASSES} text-blue-900 mt-0 mb-2`}>Smallest detectable effect size</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <div className="text-xs text-blue-800">N (SMB)</div>
          <div className="font-mono text-blue-900 text-base">{data.n_smb ?? DATA_UNAVAILABLE}</div>
        </div>
        <div>
          <div className="text-xs text-blue-800">N (Enterprise)</div>
          <div className="font-mono text-blue-900 text-base">
            {data.n_enterprise ?? DATA_UNAVAILABLE}
          </div>
        </div>
        <div>
          <div className="text-xs text-blue-800">SMB / ENT ratio</div>
          <div className="font-mono text-blue-900 text-base">{fmt(data.ratio, 3)}</div>
        </div>
        <div>
          <div className="text-xs text-blue-800">Detectable d (power = 0.80)</div>
          <div className="font-mono text-blue-900 text-base font-semibold">
            {fmt(data.detectable_d_at_power_80, 3)}
          </div>
        </div>
      </div>
      {data.note && <p className="mt-3 text-xs text-blue-800">{data.note}</p>}
    </div>
  )
}

/* -- Section wrapper -- */

export function InferentialExtensions({
  mediation,
  perFactorReg,
  standardizedReg,
  tost,
  powerAnalysis,
}: InferentialExtensionsProps) {
  const hasMediation = isUsable(mediation)
  const hasPerFactor = isUsable(perFactorReg)
  const hasStandardized = isUsable(standardizedReg)
  const hasTOST = isUsable(tost)
  const hasPower = isUsable(powerAnalysis)

  if (!hasMediation && !hasPerFactor && !hasStandardized && !hasTOST && !hasPower) {
    return null
  }

  return (
    <section className="mb-12 text-gray-800">
      <h2 className={H2_CLASSES}>Inferential Extensions</h2>
      <p className={PARAGRAPH_CLASSES}>
        These analyses extend the headline inferential statistics with bootstrap mediation, factor
        decomposition, multicollinearity diagnostics, equivalence testing (TOST), and a power
        analysis describing the smallest effect the current sample can reliably detect.
      </p>

      {hasMediation && (
        <div className="mb-6">
          <h3 className={H3_CLASSES}>Mediation: Barriers -&gt; Readiness -&gt; Maturity</h3>
          <p className="text-sm text-gray-700 mb-2">
            Bootstrapped mediation analysis testing whether perceived Barriers influence Maturity
            indirectly through Readiness rather than directly.
          </p>
          <MediationBlock data={mediation as MediationData} />
        </div>
      )}

      {hasPerFactor && (
        <div className="mb-6">
          <h3 className={H3_CLASSES}>Per-Factor Regressions</h3>
          <p className="text-sm text-gray-700 mb-2">
            Comparing the explanatory power of the aggregated Barriers score versus the canonical 3
            sub-factors as separate predictors.
          </p>
          <PerFactorRegressionBlock data={perFactorReg as PerFactorRegData} />
        </div>
      )}

      {hasStandardized && (
        <div className="mb-6">
          <h3 className={H3_CLASSES}>Standardized Sub-factor Regressions and VIF</h3>
          <p className="text-sm text-gray-700 mb-2">
            Per-factor standardized betas with t-statistics, and Variance Inflation Factor (VIF) to
            verify the 3 sub-factors are not collinear enough to bias the coefficients.
          </p>
          <StandardizedRegressionBlock data={standardizedReg as StandardizedRegData} />
        </div>
      )}

      {hasTOST && (
        <div className="mb-6">
          <h3 className={H3_CLASSES}>Equivalence Test (TOST): SMB vs Enterprise</h3>
          <p className="text-sm text-gray-700 mb-2">
            Tests whether SMB and Enterprise organizations are statistically equivalent on each
            construct, using +/- 0.30 SD as the equivalence bound (Lakens, 2017).
          </p>
          <TOSTBlock data={tost as TOSTData} />
        </div>
      )}

      {hasPower && (
        <div>
          <h3 className={H3_CLASSES}>Power Analysis</h3>
          <PowerAnalysisBlock data={powerAnalysis as PowerAnalysisData} />
        </div>
      )}
    </section>
  )
}
