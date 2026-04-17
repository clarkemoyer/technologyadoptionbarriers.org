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
    'Top-3 barrier salience ranking for the TABS CRP 2026 frozen dataset (N=200). Compares forced-choice pick counts with mean-based ranking and highlights the position-3 divergence between cultural and cybersecurity barriers.',
  alternates: {
    canonical: '/results/crp-2026/top-barriers',
  },
}

type PickItem = { item: string; text: string; count: number; pct: number }
type ItemDescriptive = { item: string; text: string; mean: number | null; sd: number | null; n: number }

type Top3Block = {
  total_n?: number
  items?: PickItem[]
  items_sorted_desc?: PickItem[]
}

type ItemBlock = {
  barriers?: ItemDescriptive[]
}

const top3: Top3Block =
  (crpData as { top3_pick_counts?: Top3Block }).top3_pick_counts ?? {}

const items: ItemBlock =
  (crpData as { item_descriptives?: ItemBlock }).item_descriptives ?? {}

const pickSorted: PickItem[] = Array.isArray(top3.items_sorted_desc)
  ? top3.items_sorted_desc
  : []
const meanSorted: ItemDescriptive[] = Array.isArray(items.barriers)
  ? [...items.barriers].sort((a, b) => (b.mean ?? -Infinity) - (a.mean ?? -Infinity))
  : []

const TOTAL_N: number | null = typeof top3.total_n === 'number' ? top3.total_n : null

const pickRankOf: Record<string, number> = {}
pickSorted.forEach((r, i) => {
  pickRankOf[r.item] = i + 1
})
const meanRankOf: Record<string, number> = {}
meanSorted.forEach((r, i) => {
  meanRankOf[r.item] = i + 1
})

const fmt = (val: number | null, decimals: number = 2): string => {
  if (val === null || val === undefined || Number.isNaN(val)) return DATA_UNAVAILABLE
  return val.toFixed(decimals)
}

const TopBarriersPage = () => {
  const topPick = pickSorted.slice(0, 10)
  const topMean = meanSorted.slice(0, 10)
  const maxPick = topPick.length > 0 ? Math.max(...topPick.map((r) => r.count)) : 1

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
            <Link href="/results/crp-2026/descriptive" className="text-blue-600 hover:underline font-medium">
              Descriptive Statistics
            </Link>{' '}
            page. When a participant is forced to pick only the 3 most salient barriers, cultural
            and people-centric barriers (B1: Resistance to Change) rise in salience relative to
            their continuous-rating position.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Top 10 by Pick Count</h2>
          <div className="space-y-2">
            {topPick.map((r) => {
              const width = Math.max(2, Math.round((r.count / maxPick) * 100))
              return (
                <div key={r.item} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="font-semibold text-tabs-teal-deep">
                      {r.item}. {r.text}
                    </div>
                    <div className="font-mono text-sm text-gray-700 whitespace-nowrap">
                      N={r.count} ({fmt(r.pct, 1)}%)
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
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Pick-Based vs Mean-Based Ranking</h2>
          <p className={PARAGRAPH_CLASSES}>
            The two rankings agree at the top two positions (B6: High Cost; B7: Legacy Integration)
            but diverge at position 3. Continuous Likert means place cybersecurity and compliance
            (B13, B14) above cultural barriers, while the forced-choice task places B1: Resistance
            to Change at position 3.
          </p>
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
                {topPick.map((r) => {
                  const meanEntry = (items.barriers ?? []).find((m) => m.item === r.item)
                  const pr = pickRankOf[r.item] ?? null
                  const mr = meanRankOf[r.item] ?? null
                  const delta = pr !== null && mr !== null ? pr - mr : null
                  return (
                    <tr key={r.item} className="border-t border-gray-200">
                      <td className="px-3 py-2">
                        <span className="font-semibold">{r.item}</span> {r.text}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{r.count}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmt(r.pct, 1)}</td>
                      <td className="px-3 py-2 text-right font-mono">{pr ?? DATA_UNAVAILABLE}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmt(meanEntry?.mean ?? null, 4)}</td>
                      <td className="px-3 py-2 text-right font-mono">{mr ?? DATA_UNAVAILABLE}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        {delta !== null ? (delta > 0 ? `+${delta}` : String(delta)) : DATA_UNAVAILABLE}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className={PARAGRAPH_CLASSES}>
            Interpretation: a negative Delta means the barrier is more salient under the
            forced-choice task than under continuous rating; a positive Delta means the opposite.
            B1 has Delta = -2 (forced choice pushes it up from rank 5 to rank 3), while B13 has
            Delta = +2 (mean rating pushes it up from pick-rank 5 to mean-rank 3).
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
                {topMean.map((r) => (
                  <tr key={r.item} className="border-t border-gray-200">
                    <td className="px-3 py-2">
                      <span className="font-semibold">{r.item}</span> {r.text}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{fmt(r.mean, 4)}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmt(r.sd, 4)}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.n}</td>
                  </tr>
                ))}
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
            counts above reflect the number of participants who selected each barrier, so the
            column sums to at most 3N (here 3 x{' '}
            {TOTAL_N !== null ? TOTAL_N : DATA_UNAVAILABLE} = {TOTAL_N !== null ? TOTAL_N * 3 : DATA_UNAVAILABLE}).
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
            , which is regenerated daily by the TABS analysis pipeline from the frozen
            CRP N=200 CSV. The pipeline script is{' '}
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
