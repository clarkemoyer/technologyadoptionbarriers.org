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
import crpData from '@/data/crp-sensitivity-analysis.json'
import { DATA_UNAVAILABLE } from '@/lib/sentinelMarker'

export const metadata: Metadata = {
  title: 'CRP 2026 Top 3 Barriers - TABS',
  description:
    'Top-3 barrier salience ranking for the TABS CRP 2026 frozen dataset (N=200). Compares forced-choice pick counts with mean-based ranking and highlights divergences between cultural and cybersecurity barriers.',
  alternates: {
    canonical: '/results/crp-2026/top-barriers',
  },
}

type PickItem = { item: string; text: string; count: number; pct: number | null }
type ItemDescriptive = {
  item: string
  text: string
  mean: number | null
  sd: number | null
  n: number
}

type Top3Block = {
  total_n?: number
  items?: PickItem[]
  items_sorted_desc?: PickItem[]
}

type ItemBlock = {
  barriers?: ItemDescriptive[]
}

const top3: Top3Block = (crpData as { top3_pick_counts?: Top3Block }).top3_pick_counts ?? {}

const items: ItemBlock = (crpData as { item_descriptives?: ItemBlock }).item_descriptives ?? {}

const pickSorted: PickItem[] = Array.isArray(top3.items_sorted_desc) ? top3.items_sorted_desc : []

// Rank items by continuous mean, EXCLUDING items with missing means so they do not receive a
// spurious rank. Items without a mean are simply absent from meanRankOf.
const meanRankable: ItemDescriptive[] = Array.isArray(items.barriers)
  ? items.barriers.filter(
      (b): b is ItemDescriptive & { mean: number } => typeof b.mean === 'number'
    )
  : []
const meanSorted: ItemDescriptive[] = [...meanRankable].sort(
  (a, b) => (b.mean as number) - (a.mean as number)
)

const TOTAL_N: number | null = typeof top3.total_n === 'number' ? top3.total_n : null

const pickRankOf: Record<string, number> = {}
pickSorted.forEach((r, i) => {
  pickRankOf[r.item] = i + 1
})
const meanRankOf: Record<string, number> = {}
meanSorted.forEach((r, i) => {
  meanRankOf[r.item] = i + 1
})

const fmt = (val: number | null | undefined, decimals: number = 2): string => {
  if (val === null || val === undefined || Number.isNaN(val)) return DATA_UNAVAILABLE
  return val.toFixed(decimals)
}

// Render a value with a trailing unit (e.g., "%") only when the value is a real number, otherwise
// render just the sentinel without the unit suffix.
const fmtWithUnit = (
  val: number | null | undefined,
  unit: string,
  decimals: number = 1
): string => {
  if (val === null || val === undefined || Number.isNaN(val)) return DATA_UNAVAILABLE
  return `${val.toFixed(decimals)}${unit}`
}

// Clamp bar width to [2, 100] and guard against a zero/NaN denominator producing NaN.
const barWidth = (count: number, max: number): number => {
  if (!Number.isFinite(count) || !Number.isFinite(max) || max <= 0) return 2
  const pct = Math.round((count / max) * 100)
  if (!Number.isFinite(pct)) return 2
  return Math.max(2, Math.min(100, pct))
}

const signed = (n: number): string => (n > 0 ? `+${n}` : String(n))

// Build a human-readable list like "B2, B5, and B8" from an array of strings.
const joinItems = (xs: string[]): string => {
  if (xs.length === 0) return ''
  if (xs.length === 1) return xs[0]
  if (xs.length === 2) return `${xs[0]} and ${xs[1]}`
  return `${xs.slice(0, -1).join(', ')}, and ${xs[xs.length - 1]}`
}

// ---- Dynamic narrative inputs -------------------------------------------------------------------

type RankedRow = {
  item: string
  text: string
  count: number
  pct: number | null
  mean: number | null
  pickRank: number
  meanRank: number | null
  delta: number | null
}

const descByItem: Record<string, ItemDescriptive> = {}
;(items.barriers ?? []).forEach((b) => {
  descByItem[b.item] = b
})

const rankedRows: RankedRow[] = pickSorted.map((r) => {
  const d = descByItem[r.item]
  const mr = meanRankOf[r.item] ?? null
  const pr = pickRankOf[r.item] ?? 0
  return {
    item: r.item,
    text: r.text,
    count: r.count,
    pct: typeof r.pct === 'number' ? r.pct : null,
    mean: d?.mean ?? null,
    pickRank: pr,
    meanRank: mr,
    delta: pr !== 0 && mr !== null ? pr - mr : null,
  }
})

// Top-2 agreement: do the pick ranking and the mean ranking agree on the same two items in
// positions 1 and 2 (regardless of order within that pair)?
const pickTop2 = pickSorted.slice(0, 2).map((r) => r.item)
const meanTop2 = meanSorted.slice(0, 2).map((r) => r.item)
const topTwoAgree =
  pickTop2.length === 2 &&
  meanTop2.length === 2 &&
  new Set(pickTop2).size === 2 &&
  pickTop2.every((i) => meanTop2.includes(i))

// Position-3 divergence: who sits at pick-rank 3 vs mean-rank 3?
const pick3 = pickSorted[2] ?? null
const mean3 = meanSorted[2] ?? null
const positionThreeDiffers = pick3 !== null && mean3 !== null && pick3.item !== mean3.item

// Movers: top items by absolute delta, restricted to barriers that have both ranks available.
const moversAll = rankedRows.filter((r) => r.delta !== null) as (RankedRow & { delta: number })[]
const negativeMovers = [...moversAll].filter((r) => r.delta < 0).sort((a, b) => a.delta - b.delta) // most negative first
const positiveMovers = [...moversAll].filter((r) => r.delta > 0).sort((a, b) => b.delta - a.delta) // most positive first
const topNegative = negativeMovers.slice(0, 2)
const topPositive = positiveMovers.slice(0, 2)

const TopBarriersPage = () => {
  const topPick = pickSorted.slice(0, 10)
  const topMean = meanSorted.slice(0, 10)
  const maxPick = topPick.length > 0 ? Math.max(...topPick.map((r) => r.count)) : 0

  const dataAvailable = pickSorted.length > 0 && meanRankable.length > 0

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>CRP 2026: Top 3 Barriers</h1>

        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            Published: April 2026
          </span>
        </div>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This page presents the forced-choice Top 3 barriers ranking from the TABS CRP 2026
            frozen dataset (N={TOTAL_N !== null ? TOTAL_N : DATA_UNAVAILABLE}). Each participant
            selected up to three barriers from the full list of 18. Counts below reflect the number
            of participants who included each barrier in their top 3.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The forced-choice ranking complements the continuous Likert-based ranking shown on the{' '}
            <Link
              href="/results/crp-2026/descriptive"
              className="text-blue-600 hover:underline font-medium"
            >
              Descriptive Statistics
            </Link>{' '}
            page. Comparing the two rankings surfaces which barriers rise or fall in salience when
            participants are forced to choose only a small number of items rather than rate every
            item on a continuous scale.
          </p>
        </section>

        {!dataAvailable && (
          <section className={SECTION_CLASSES}>
            <div className="border border-amber-200 bg-amber-50 text-amber-900 rounded-lg p-4">
              <p className="font-semibold mb-1">Top 3 data unavailable</p>
              <p className="text-sm">
                The forced-choice Top 3 pick counts and/or barrier item descriptives have not been
                written to{' '}
                <code className="text-xs bg-white/50 px-1 py-0.5 rounded">
                  src/data/crp-sensitivity-analysis.json
                </code>{' '}
                by the most recent pipeline run. Check the latest daily pipeline run and rerender
                once the extended blocks are present.
              </p>
            </div>
          </section>
        )}

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Top 10 by Pick Count</h2>
          {topPick.length === 0 ? (
            <p className="text-sm text-gray-600 italic">No pick-count data to display.</p>
          ) : (
            <div className="space-y-2">
              {topPick.map((r) => {
                const width = barWidth(r.count, maxPick)
                return (
                  <div key={r.item} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="font-semibold text-tabs-teal-deep">
                        {r.item}. {r.text}
                      </div>
                      <div className="font-mono text-sm text-gray-700 whitespace-nowrap">
                        N={r.count} ({fmtWithUnit(r.pct, '%', 1)})
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tabs-teal-deep"
                        style={{ width: `${width}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Pick-Based vs Mean-Based Ranking</h2>
          {dataAvailable && (
            <>
              <p className={PARAGRAPH_CLASSES}>
                {topTwoAgree && pick3 && mean3 && positionThreeDiffers ? (
                  <>
                    The two rankings agree at the top two positions ({pickTop2[0]} and {pickTop2[1]}
                    ) but diverge at position 3. Under forced choice, position 3 is{' '}
                    <span className="font-semibold">
                      {pick3.item}: {pick3.text}
                    </span>
                    . Under the continuous Likert mean, position 3 is{' '}
                    <span className="font-semibold">
                      {mean3.item}: {mean3.text}
                    </span>
                    .
                  </>
                ) : topTwoAgree && pick3 && mean3 && !positionThreeDiffers ? (
                  <>
                    The two rankings agree at the top three positions ({pickTop2[0]}, {pickTop2[1]},
                    and {pick3.item}), with divergence emerging only further down the list.
                  </>
                ) : (
                  <>
                    The pick-based and mean-based rankings differ at the top of the list.
                    Forced-choice positions 1-2 are {joinItems(pickTop2)}; continuous-mean positions
                    1-2 are {joinItems(meanTop2)}.
                  </>
                )}
              </p>
              {(topNegative.length > 0 || topPositive.length > 0) && (
                <p className={PARAGRAPH_CLASSES}>
                  {topNegative.length > 0 && (
                    <>
                      The largest upward movers under forced choice (most negative deltas) are{' '}
                      {joinItems(
                        topNegative.map(
                          (r) =>
                            `${r.item} (pick ${r.pickRank}, mean ${r.meanRank}, delta ${signed(
                              r.delta
                            )})`
                        )
                      )}
                      .{' '}
                    </>
                  )}
                  {topPositive.length > 0 && (
                    <>
                      The largest downward movers under forced choice (most positive deltas) are{' '}
                      {joinItems(
                        topPositive.map(
                          (r) =>
                            `${r.item} (pick ${r.pickRank}, mean ${r.meanRank}, delta ${signed(
                              r.delta
                            )})`
                        )
                      )}
                      .
                    </>
                  )}
                </p>
              )}
            </>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Barrier</th>
                  <th className="px-3 py-2 text-right">Pick N</th>
                  <th className="px-3 py-2 text-right">Pick %</th>
                  <th className="px-3 py-2 text-right">Pick Rank</th>
                  <th className="px-3 py-2 text-right">Mean</th>
                  <th className="px-3 py-2 text-right">Mean Rank</th>
                  <th className="px-3 py-2 text-right">Delta</th>
                </tr>
              </thead>
              <tbody>
                {topPick.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-sm text-gray-500 italic text-center" colSpan={7}>
                      No pick-count data available.
                    </td>
                  </tr>
                ) : (
                  topPick.map((r) => {
                    const meanEntry = descByItem[r.item]
                    const pr = pickRankOf[r.item] ?? null
                    const mr = meanRankOf[r.item] ?? null
                    const delta = pr !== null && mr !== null ? pr - mr : null
                    return (
                      <tr key={r.item} className="border-t border-gray-200">
                        <td className="px-3 py-2">
                          <span className="font-semibold">{r.item}</span> {r.text}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{r.count}</td>
                        <td className="px-3 py-2 text-right font-mono">{fmt(r.pct ?? null, 1)}</td>
                        <td className="px-3 py-2 text-right font-mono">{pr ?? DATA_UNAVAILABLE}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {fmt(meanEntry?.mean ?? null, 4)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{mr ?? DATA_UNAVAILABLE}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {delta !== null ? signed(delta) : DATA_UNAVAILABLE}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className={PARAGRAPH_CLASSES}>
            Interpretation: Delta = Pick Rank - Mean Rank. A negative Delta means the barrier is
            more salient under the forced-choice task than under continuous rating (it rises when
            participants must prioritize), and a positive Delta means the opposite (it falls under
            forced choice relative to continuous rating). Barriers omitted from the Mean Rank column
            are those with no valid continuous-rating mean in the frozen dataset.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Top 10 by Continuous Mean</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Barrier</th>
                  <th className="px-3 py-2 text-right">Mean</th>
                  <th className="px-3 py-2 text-right">SD</th>
                  <th className="px-3 py-2 text-right">N</th>
                </tr>
              </thead>
              <tbody>
                {topMean.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-sm text-gray-500 italic text-center" colSpan={4}>
                      No continuous-mean data available.
                    </td>
                  </tr>
                ) : (
                  topMean.map((r) => (
                    <tr key={r.item} className="border-t border-gray-200">
                      <td className="px-3 py-2">
                        <span className="font-semibold">{r.item}</span> {r.text}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{fmt(r.mean, 4)}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmt(r.sd, 4)}</td>
                      <td className="px-3 py-2 text-right font-mono">{r.n}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Methodology</h2>
          <h3 className={H3_CLASSES}>Forced-Choice Top 3 Pick Task</h3>
          <p className={PARAGRAPH_CLASSES}>
            Participants were shown all 18 substantive barriers (IRI attention check excluded) and
            asked to select the three most salient barriers in their organizational context. The
            counts above reflect the number of participants who selected each barrier, so the column
            sums to at most 3N (here 3 x {TOTAL_N !== null ? TOTAL_N : DATA_UNAVAILABLE} ={' '}
            {TOTAL_N !== null ? TOTAL_N * 3 : DATA_UNAVAILABLE}).
          </p>
          <h3 className={H3_CLASSES}>Continuous-Rating Mean</h3>
          <p className={PARAGRAPH_CLASSES}>
            The continuous-rating mean is computed from the 5-point barrier Likert scale (Not a
            Barrier = 1 through Major Barrier = 5) across the same 18 substantive items, averaging
            across participants rather than summing selection counts. The sample-size column
            reflects the number of non-missing responses per item.
          </p>
          <h3 className={H3_CLASSES}>Source Data</h3>
          <p className={PARAGRAPH_CLASSES}>
            All numbers on this page are read from{' '}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
              src/data/crp-sensitivity-analysis.json
            </code>
            , which is regenerated daily by the TABS analysis pipeline from the frozen CRP N=200
            CSV. The pipeline script is{' '}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
              scripts/analysis/tabs_v2_unified_data_analysis.py
            </code>
            .
          </p>
        </section>
      </article>
    </div>
  )
}

export default TopBarriersPage
