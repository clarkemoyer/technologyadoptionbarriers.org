/**
 * Shared UI components and formatting helpers used by both
 * `src/app/results/validation/page.tsx` (Full Dataset) and
 * `src/app/results/crp-2026/validation/page.tsx` (CRP 2026).
 *
 * Extracting them here prevents the two pages from drifting out of sync
 * as the psychometric reporting evolves.
 */
import Link from 'next/link'

/* ══════════════════════════════════════════════════════════════════
   SHARED TYPE
══════════════════════════════════════════════════════════════════ */

/** Shape expected by the card/table components below. */
export type ConstructValidation = {
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
  cfa_chi2: number | null
  cfa_df: number | null
  cfa_p: number | null
  cfa_cfi: number | null
  cfa_tli: number | null
  cfa_rmsea: number | null
  inter_item_mean: number
  inter_item_min: number
  inter_item_max: number
  inter_item_sd: number
}

/* ══════════════════════════════════════════════════════════════════
   FORMATTING HELPERS
══════════════════════════════════════════════════════════════════ */

export const fmt = (val: number | null | undefined, digits = 3): string => {
  if (val === null || val === undefined) return '\u2014'
  return val.toFixed(digits)
}

export const pFmt = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '\u2014'
  if (val < 0.001) return '< .001'
  return val.toFixed(3)
}

/* ══════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
══════════════════════════════════════════════════════════════════ */

/** True when at least one CFA fit index is non-null. */
export const hasCfaData = (c: ConstructValidation): boolean =>
  c.cfa_cfi != null || c.cfa_tli != null || c.cfa_rmsea != null || c.cfa_chi2 != null

/** Safely extract a CFA error message from the raw validation data. */
export const getCfaError = (source: Record<string, unknown>): string | undefined =>
  (source as Record<string, unknown>)?.error as string | undefined

/* ══════════════════════════════════════════════════════════════════
   BADGE / VERDICT COMPONENTS
══════════════════════════════════════════════════════════════════ */

/** Pass/Fail badge with optional custom label. */
export const Verdict = ({ pass, label }: { pass: boolean; label?: string }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
      pass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}
  >
    {label ?? (pass ? 'Pass' : 'Fail')}
  </span>
)

/** N/A badge for missing CFA indices — matches the summary table style. */
export const NaBadge = () => (
  <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-500">
    N/A
  </span>
)

/** Verdict for a higher-is-better CFA index; renders N/A when null. */
export const CfaHigherVerdict = ({
  val,
  good,
  acceptable,
}: {
  val: number | null
  good: number
  acceptable: number
}) =>
  val == null ? (
    <NaBadge />
  ) : (
    <Verdict
      pass={val >= acceptable}
      label={val >= good ? 'Good' : val >= acceptable ? 'Acceptable' : 'Poor'}
    />
  )

/** Verdict for a lower-is-better CFA index; renders N/A when null. */
export const CfaLowerVerdict = ({
  val,
  good,
  acceptable,
}: {
  val: number | null
  good: number
  acceptable: number
}) =>
  val == null ? (
    <NaBadge />
  ) : (
    <Verdict
      pass={val <= acceptable}
      label={val <= good ? 'Good' : val <= acceptable ? 'Acceptable' : 'Poor'}
    />
  )

/** Placeholder shown when CFA data is not yet available. */
export const CfaUnavailable = ({ error }: { error?: string | null }) => (
  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 font-sans">
    <p>CFA fit indices are not yet available.</p>
    {error && (
      <p className="mt-1 text-xs text-amber-600">
        Reason: <code className="bg-amber-100 px-1 rounded">{error}</code>
      </p>
    )}
  </div>
)

/* ══════════════════════════════════════════════════════════════════
   CARD COMPONENTS
══════════════════════════════════════════════════════════════════ */

/** Reliability metrics card (α, ω, CR, AVE, Split-Half). */
export const ReliabilityCard = ({ c }: { c: ConstructValidation }) => (
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
                href="/results/glossary#cronbach-alpha"
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
                href="/results/glossary#mcdonalds-omega"
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
                href="/results/glossary#composite-reliability"
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
              <Link href="/results/glossary#ave" className="hover:text-blue-600 hover:underline">
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
                href="/results/glossary#split-half"
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

/** EFA summary card (KMO, Bartlett, parallel factors, variance explained, eigenvalues). */
export const EFACard = ({ c }: { c: ConstructValidation }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-indigo-700 text-white px-4 py-2 font-bold font-sans">{c.construct} EFA</div>
    <div className="p-4">
      <table className="w-full text-sm font-sans border-collapse">
        <tbody>
          <tr className="border-b">
            <td className="py-1.5 text-gray-600">
              <Link href="/results/glossary#kmo" className="hover:text-blue-600 hover:underline">
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
                href="/results/glossary#bartlett"
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
                href="/results/glossary#parallel-analysis"
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
                href="/results/glossary#variance-explained"
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
                href="/results/glossary#eigenvalue"
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

/**
 * CFA single-factor card.
 * `cfaError` should be pre-extracted from the raw data by the caller using `getCfaError()`,
 * allowing this component to remain data-source-agnostic.
 */
export const CFACard = ({ c, cfaError }: { c: ConstructValidation; cfaError?: string | null }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-purple-700 text-white px-4 py-2 font-bold font-sans">
      {c.construct} CFA (Single-Factor)
    </div>
    <div className="p-4">
      {hasCfaData(c) ? (
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
                <Link href="/results/glossary#cfi" className="hover:text-blue-600 hover:underline">
                  CFI
                </Link>
              </td>
              <td className="py-1.5 text-right font-mono font-bold">{fmt(c.cfa_cfi)}</td>
              <td className="py-1.5 text-right">
                <CfaHigherVerdict val={c.cfa_cfi} good={0.95} acceptable={0.9} />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 text-gray-600">
                <Link href="/results/glossary#tli" className="hover:text-blue-600 hover:underline">
                  TLI
                </Link>
              </td>
              <td className="py-1.5 text-right font-mono font-bold">{fmt(c.cfa_tli)}</td>
              <td className="py-1.5 text-right">
                <CfaHigherVerdict val={c.cfa_tli} good={0.95} acceptable={0.9} />
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-gray-600">
                <Link
                  href="/results/glossary#rmsea"
                  className="hover:text-blue-600 hover:underline"
                >
                  RMSEA
                </Link>
              </td>
              <td className="py-1.5 text-right font-mono font-bold">{fmt(c.cfa_rmsea)}</td>
              <td className="py-1.5 text-right">
                <CfaLowerVerdict val={c.cfa_rmsea} good={0.06} acceptable={0.08} />
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <CfaUnavailable error={cfaError} />
      )}
    </div>
  </div>
)
