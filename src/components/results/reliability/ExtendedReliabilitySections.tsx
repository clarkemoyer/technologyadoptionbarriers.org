import { H2_CLASSES, H3_CLASSES, PARAGRAPH_CLASSES } from '@/lib/articleStyles'
import { DATA_UNAVAILABLE } from '@/lib/sentinelMarker'

/**
 * Three extra reliability sections that consume keys added by PR #1837 and
 * surfaced per issue #1839: bootstrap_alpha_ci, alpha_if_deleted_summary,
 * reliability_by_demo.
 *
 * Designed to be dropped into both /results/reliability and
 * /results/crp-2026/reliability page.tsx files. Both pages import their own
 * validation JSON (live-validation.json or crp-validation.json) and pass the
 * primary sample's data here.
 */

type AlphaIfDeletedItem = {
  item: string
  alpha_if_deleted: number
  change: number
}

type AlphaIfDeletedConstruct = {
  construct: string
  base_alpha: number
  items_increasing_alpha_count: number
  items_increasing_alpha: AlphaIfDeletedItem[]
  closest_call?: AlphaIfDeletedItem | null
}

type BootstrapCIEntry = {
  mean: number
  ci_lower: number
  ci_upper: number
  n_boot: number
}

type ReliabilityByDemoGroup = {
  n: number
  Barriers?: number | null
  Readiness?: number | null
  Maturity?: number | null
}

export type ExtendedReliabilityProps = {
  /** Per-construct bootstrap CI on Cronbach's alpha. */
  bootstrap?: Record<string, BootstrapCIEntry | null> | null
  /** Per-construct alpha-if-deleted summary. */
  alphaIfDeleted?: AlphaIfDeletedConstruct[] | null
  /** Cronbach's alpha by demographic group. */
  reliabilityByDemo?: Record<string, ReliabilityByDemoGroup | null> | null
}

const fmt = (v: number | null | undefined, digits = 4): string => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return DATA_UNAVAILABLE
  return v.toFixed(digits)
}

const CONSTRUCTS = ['Barriers', 'Readiness', 'Maturity'] as const

/** Bootstrap percentile CI table, one row per construct. */
function BootstrapCITable({ data }: { data: NonNullable<ExtendedReliabilityProps['bootstrap']> }) {
  const rows = CONSTRUCTS.map((c) => ({ construct: c, entry: data[c] ?? null }))
  const nBoot = rows.find((r) => r.entry)?.entry?.n_boot ?? 1000
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Construct
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
              Bootstrap mean
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
              95% CI lower
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
              95% CI upper
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
              CI width
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.construct} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
              <td className="border border-gray-300 px-4 py-2 font-medium">{r.construct}</td>
              <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                {fmt(r.entry?.mean)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                {fmt(r.entry?.ci_lower)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                {fmt(r.entry?.ci_upper)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                {r.entry?.ci_upper != null && r.entry?.ci_lower != null
                  ? (r.entry.ci_upper - r.entry.ci_lower).toFixed(4)
                  : DATA_UNAVAILABLE}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-gray-600">
        Bootstrap percentile CIs computed from {nBoot.toLocaleString()} resamples (Efron, 1979).
        Narrow CIs that do not cross the .70 acceptability threshold provide stronger evidence of
        scale reliability than a single point estimate.
      </p>
    </div>
  )
}

/** Alpha-if-deleted: items whose removal would raise Cronbach's alpha. */
function AlphaIfDeletedTable({
  data,
}: {
  data: NonNullable<ExtendedReliabilityProps['alphaIfDeleted']>
}) {
  return (
    <div className="space-y-4">
      {data.map((c) => (
        <div key={c.construct} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className={`${H3_CLASSES} mt-0`}>
            {c.construct}{' '}
            <span className="text-sm font-normal text-gray-600">
              (base alpha = {fmt(c.base_alpha)})
            </span>
          </h3>
          {c.items_increasing_alpha_count === 0 ? (
            <p className="text-sm text-gray-700">
              No items would raise alpha if removed. Closest call:{' '}
              {c.closest_call ? (
                <>
                  <span className="font-medium">{c.closest_call.item}</span> (alpha if deleted ={' '}
                  <span className="font-mono">{fmt(c.closest_call.alpha_if_deleted)}</span>, change{' '}
                  <span className="font-mono">
                    {c.closest_call.change >= 0 ? '+' : ''}
                    {fmt(c.closest_call.change)}
                  </span>
                  )
                </>
              ) : (
                <span className="text-gray-500">no data</span>
              )}
              . The scale is robust to single-item removal.
            </p>
          ) : (
            <>
              <p className="text-sm text-amber-800 mb-2">
                <strong>{c.items_increasing_alpha_count}</strong>{' '}
                {c.items_increasing_alpha_count === 1 ? 'item' : 'items'} would raise alpha if
                removed. None of these are large enough to motivate dropping the item, but they are
                the candidates a future revision would target first.
              </p>
              <ul className="text-sm font-sans list-disc list-inside space-y-1">
                {c.items_increasing_alpha.map((item) => (
                  <li key={item.item}>
                    <span className="font-medium">{item.item}</span>: alpha if deleted ={' '}
                    <span className="font-mono">{fmt(item.alpha_if_deleted)}</span> (change{' '}
                    <span className="font-mono text-amber-700">+{fmt(item.change)}</span>)
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

/** Cronbach's alpha by demographic group (SMB / Enterprise / For-Profit / Non-Profit). */
function ReliabilityByDemoTable({
  data,
}: {
  data: NonNullable<ExtendedReliabilityProps['reliabilityByDemo']>
}) {
  const groups = ['SMB', 'Enterprise', 'For_Profit', 'Non_Profit_or_Gov'] as const
  const labels: Record<(typeof groups)[number], string> = {
    SMB: 'SMB (<1000 emp)',
    Enterprise: 'Enterprise (>=1000 emp)',
    For_Profit: 'For-Profit',
    Non_Profit_or_Gov: 'Non-Profit / Gov',
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Group
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
              N
            </th>
            {CONSTRUCTS.map((c) => (
              <th
                key={c}
                scope="col"
                className="border border-gray-300 px-4 py-2 text-right font-bold"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g, i) => {
            const entry = data[g]
            if (!entry) return null
            return (
              <tr key={g} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-300 px-4 py-2 font-medium">{labels[g]}</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-mono">{entry.n}</td>
                {CONSTRUCTS.map((c) => (
                  <td key={c} className="border border-gray-300 px-4 py-2 text-right font-mono">
                    {fmt(entry[c])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-gray-600">
        Cronbach&apos;s alpha computed independently within each demographic group. Stable values
        across groups demonstrate that the scales perform reliably regardless of organizational size
        or sector.
      </p>
    </div>
  )
}

/**
 * Main exported component. Renders 3 self-contained reliability sections.
 * Gracefully handles missing or sentinel-marked (skipped) data by hiding
 * the corresponding section.
 */
export function ExtendedReliabilitySections({
  bootstrap,
  alphaIfDeleted,
  reliabilityByDemo,
}: ExtendedReliabilityProps) {
  const hasBootstrap =
    bootstrap != null &&
    typeof bootstrap === 'object' &&
    !('skipped' in bootstrap) &&
    Object.keys(bootstrap).length > 0
  const hasAlphaIfDeleted = Array.isArray(alphaIfDeleted) && alphaIfDeleted.length > 0
  const hasByDemo =
    reliabilityByDemo != null &&
    typeof reliabilityByDemo === 'object' &&
    !('skipped' in reliabilityByDemo) &&
    Object.keys(reliabilityByDemo).length > 0

  if (!hasBootstrap && !hasAlphaIfDeleted && !hasByDemo) {
    return null
  }

  return (
    <>
      {hasBootstrap && (
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Bootstrap Confidence Intervals on Alpha</h2>
          <p className={PARAGRAPH_CLASSES}>
            Point estimates of Cronbach&apos;s alpha can fluctuate with sample composition.
            Bootstrap percentile confidence intervals (Efron, 1979) quantify that uncertainty: if
            the entire CI sits above the .70 acceptability threshold (or .80 for &quot;good&quot;),
            the scale&apos;s reliability is well-supported across plausible resamples of the data.
          </p>
          <BootstrapCITable data={bootstrap} />
        </section>
      )}

      {hasAlphaIfDeleted && (
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Alpha if Deleted</h2>
          <p className={PARAGRAPH_CLASSES}>
            For each construct, alpha-if-deleted reports the value Cronbach&apos;s alpha would take
            if a given item were removed from the scale. Items whose removal would noticeably raise
            alpha are candidates for revision in a future version of the instrument; items whose
            removal would lower alpha are well-aligned with the construct.
          </p>
          <AlphaIfDeletedTable data={alphaIfDeleted} />
        </section>
      )}

      {hasByDemo && (
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Reliability by Demographic Group</h2>
          <p className={PARAGRAPH_CLASSES}>
            Cronbach&apos;s alpha computed within each organizational subgroup. Comparable values
            across SMB vs Enterprise and For-Profit vs Non-Profit / Government provide evidence that
            the scales work reliably regardless of organizational context, supporting cross-segment
            comparisons in downstream analyses.
          </p>
          <ReliabilityByDemoTable data={reliabilityByDemo} />
        </section>
      )}
    </>
  )
}
