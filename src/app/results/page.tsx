import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'
import sensitivityData from '@/data/sensitivity-analysis.json'
import crpSensitivityData from '@/data/crp-sensitivity-analysis.json'
import LastUpdated from '@/components/last-updated'
import { DATA_UNAVAILABLE } from '@/lib/sentinelMarker'
import { resultsSeries } from '@/data/results-series'
import { joinItems } from '@/lib/joinItems'

export const metadata: Metadata = {
  title: 'Results - TABS',
  description:
    'Survey results from the Technology Adoption Barriers Survey. Start with the top 3 barriers, then walk down through key findings, descriptives, sample, quality, reliability, factor analysis, validation, and sensitivity.',
  alternates: {
    canonical: '/results',
  },
}

/**
 * Static prose for the search index.
 * The /results landing page is highly dynamic (top-3 labels, N values, etc.),
 * so the auto-extractor produces garbled tokens.  This export is used verbatim
 * by scripts/generate-search-index.ts instead of the auto-extracted text.
 *
 * IMPORTANT: this MUST be a single string or template literal — not a
 * concatenation of strings.  The extractor in generate-search-index.ts only
 * reads the first literal token after the `=` sign; a `+`-joined value will
 * be silently truncated in the search index.
 */
export const SEARCH_CONTENT = `Across the live TABS dataset, the nine-page insight-first flow covers: Top 3 Barriers, Key Findings, Descriptive Statistics, Sample and Demographics, Data Quality, Scale Reliability, Factor Analysis, Instrument Validation, and Sensitivity Analysis. Parallel pages are available for the growing live dataset and the frozen CRP 2026 snapshot (N=200). Start with the forced-choice top 3 barriers ranking, then work down through the full analytic story.`

type PickItem = { item: string; text: string; count: number; pct: number | null }
type Top3Block = { total_n?: number; items_sorted_desc?: PickItem[] }

const liveTop3: Top3Block =
  (sensitivityData as { top3_pick_counts?: Top3Block }).top3_pick_counts ?? {}
const crpTop3: Top3Block =
  (crpSensitivityData as { top3_pick_counts?: Top3Block }).top3_pick_counts ?? {}

const liveTopThree: PickItem[] = Array.isArray(liveTop3.items_sorted_desc)
  ? liveTop3.items_sorted_desc.slice(0, 3)
  : []
const crpTopThree: PickItem[] = Array.isArray(crpTop3.items_sorted_desc)
  ? crpTop3.items_sorted_desc.slice(0, 3)
  : []

const liveTotalN: number | null = typeof liveTop3.total_n === 'number' ? liveTop3.total_n : null
const crpTotalN: number | null = typeof crpTop3.total_n === 'number' ? crpTop3.total_n : null

const barrierShort = (text: string): string => {
  // Strip trailing period, remove parentheticals, and keep the first sentence-like
  // clause for a compact lede without leaving unmatched parentheses.
  const trimmed = text.replace(/\s*[.]\s*$/, '').trim()
  const withoutParentheticals = trimmed
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  const firstClause = withoutParentheticals.split(/[.;:]/)[0].trim()
  return firstClause.length >= 8
    ? firstClause
    : withoutParentheticals.length > 0
      ? withoutParentheticals
      : trimmed
}

const liveLedeLabels = liveTopThree.map((r) => `${r.item} (${barrierShort(r.text)})`)

// Taglines for each page in the insight-first flow. These are the only metadata not encoded in
// resultsSeries (which owns ordering, titles, and hrefs). Keyed by the last path segment so they
// stay in sync with resultsSeries even if hrefs change.
const PAGE_TAGLINES: Record<string, string> = {
  'top-barriers':
    'Forced-choice ranking: the three barriers leaders pick when they must prioritize, plus how that ranking compares to the continuous Likert mean.',
  findings:
    'Inferential statistics that answer the research questions: t-tests, ANOVA by decision authority, effect sizes, and cross-tabulations.',
  descriptive:
    'Grand means, standard deviations, and inter-construct correlations across barriers, readiness, and maturity.',
  sample:
    'Who participated: roles, organization sizes, and profit models, broken down per result group.',
  'data-quality':
    'Disposition waterfall, attention checks, edge cases, and sample definitions that lead from raw submissions to the clean analytic sample.',
  reliability:
    "Cronbach's alpha and composite reliability for each construct across all sample definitions.",
  'factor-analysis':
    'EFA loadings, eigenvalues, and explained variance that back the three-factor barrier structure and the one-factor readiness/maturity scales.',
  validation:
    'Convergent validity (AVE), discriminant validity (HTMT, Fornell-Larcker), and the IRI attention-check criterion.',
  sensitivity:
    'Every metric across every sample cut, plus deltas that show how conservative cleaning changes the headline numbers.',
}

// FLOW_PAGES is derived from resultsSeries so the landing-page order always matches the sidebar.
// CRP 2026 children supply title + crpPath; TABS Full Dataset children supply livePath.
// Taglines (not stored in the nav data) come from PAGE_TAGLINES above.
type FlowPage = {
  key: string
  title: string
  tagline: string
  livePath: string
  crpPath: string
}

const getResultsPageKey = (href: string) => href.split('/').filter(Boolean).pop() ?? href

const crpChildren = resultsSeries.find((s) => s.href === '/results/crp-2026')?.children ?? []
const liveChildren =
  resultsSeries.find((s) => s.isGroup && s.href === '/results/full-dataset')?.children ?? []

const liveChildrenByKey = new Map(
  liveChildren.map((livePage) => [getResultsPageKey(livePage.href), livePage] as const)
)

const crpKeys = crpChildren.map((crpPage) => getResultsPageKey(crpPage.href))
const crpKeySet = new Set(crpKeys)
const liveKeys = liveChildren.map((livePage) => getResultsPageKey(livePage.href))
const missingLiveKeys = crpKeys.filter((key) => !liveChildrenByKey.has(key))
const extraLiveKeys = liveKeys.filter((key) => !crpKeySet.has(key))

if (missingLiveKeys.length > 0 || extraLiveKeys.length > 0) {
  throw new Error(
    `Results page configuration mismatch between /results/crp-2026 and /results/full-dataset. Missing live pages for: ${missingLiveKeys.join(', ') || 'none'}. Extra live pages: ${extraLiveKeys.join(', ') || 'none'}.`
  )
}

const FLOW_PAGES: FlowPage[] = crpChildren.map((crpPage) => {
  const key = getResultsPageKey(crpPage.href)
  const livePage = liveChildrenByKey.get(key)
  return {
    key,
    title: crpPage.title,
    tagline: PAGE_TAGLINES[key] ?? '',
    livePath: livePage?.href ?? `/results/${key}`,
    crpPath: crpPage.href,
  }
})

const SECONDARY_CARDS = [
  {
    title: 'Prolific Dashboard',
    href: '/results/dashboard',
    desc: 'Real-time submission statuses, approval rates, and messaging activity from Prolific.',
  },
  {
    title: 'Response Funnel',
    href: '/results/survey-stats',
    desc: 'Every count the daily pipeline tracks - Qualtrics raw responses, Prolific submissions, and disposition triage - with the API source for each.',
  },
  {
    title: 'Dataset Comparison',
    href: '/results/dataset-comparison',
    desc: 'Side-by-side statistics, demographics, and effect sizes across all four result groups.',
  },
  {
    title: 'CMO Survey Comparison',
    href: '/results/cmo-survey',
    desc: 'How TABS results compare to the long-running CMO Survey benchmarks.',
  },
  {
    title: 'Open Data & Reproducibility',
    href: '/results/reproducibility',
    desc: 'De-identified dataset, analysis scripts, and instructions to reproduce every result.',
  },
  {
    title: 'Statistics Glossary',
    href: '/results/glossary',
    desc: '21 statistical terms with their TABS-specific values and citations.',
  },
]

// Hero stats (live pipeline)
const conservativeN =
  (sensitivityData as { samples?: Array<{ key: string; n?: number }> }).samples?.find(
    (s) => s.key === 'conservative_clean'
  )?.n ?? null
const prolificN =
  (sensitivityData as { samples?: Array<{ key: string; n?: number }> }).samples?.find(
    (s) => s.key === 'prolific_accepted'
  )?.n ?? null
const totalN =
  (sensitivityData as { samples?: Array<{ key: string; n?: number }> }).samples?.find(
    (s) => s.key === 'v2_all'
  )?.n ?? null

type MetricRow = { key: string; values?: Record<string, number | null> }
const metrics: MetricRow[] = (sensitivityData as { metrics?: MetricRow[] }).metrics ?? []
const alphaBarriers = metrics.find((m) => m.key === 'alpha_barriers')?.values?.conservative_clean
const alphaReadiness = metrics.find((m) => m.key === 'alpha_readiness')?.values?.conservative_clean
const alphaMaturity = metrics.find((m) => m.key === 'alpha_maturity')?.values?.conservative_clean
const alphaValues: number[] = [alphaBarriers, alphaReadiness, alphaMaturity].filter(
  (v): v is number => typeof v === 'number' && isFinite(v)
)
const minAlphaDisplay: string =
  alphaValues.length === 3 ? Math.min(...alphaValues).toFixed(2) : DATA_UNAVAILABLE

const heroStats: Array<{ label: string; value: string }> = [
  { label: 'Total V2 Responses', value: totalN !== null ? String(totalN) : DATA_UNAVAILABLE },
  {
    label: 'Prolific Accepted',
    value: prolificN !== null ? String(prolificN) : DATA_UNAVAILABLE,
  },
  {
    label: 'Clean Sample',
    value: conservativeN !== null ? String(conservativeN) : DATA_UNAVAILABLE,
  },
  { label: 'Min Cronbach α', value: minAlphaDisplay },
]

const ResultsPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Results</h1>
        <LastUpdated
          utcTimestamp={
            ((sensitivityData as Record<string, unknown>).extended_last_updated ??
              (sensitivityData as Record<string, unknown>).last_updated) as string
          }
        />

        {/* ── Lede (headline finding) ── */}
        <section className="mb-10 text-gray-800">
          {liveLedeLabels.length === 3 && liveTotalN !== null ? (
            <p className={PARAGRAPH_CLASSES}>
              Across the live TABS dataset ({liveTotalN} Prolific Accepted leaders), the three
              barriers that organizations pick most often when forced to prioritize are{' '}
              <span className="font-semibold">{joinItems(liveLedeLabels)}</span>. This page walks
              you through those findings first, then the statistical scaffolding that supports them.
            </p>
          ) : (
            <p className={PARAGRAPH_CLASSES}>
              The Technology Adoption Barriers Survey (TABS) asks organizational leaders about the
              barriers, readiness, and maturity factors that shape technology adoption. Every metric
              is computed independently across multiple result groups so researchers can choose the
              dataset that matches their quality requirements.
            </p>
          )}
          <p className={PARAGRAPH_CLASSES}>
            All statistics are regenerated automatically by the{' '}
            <Link
              href="/results/data-quality"
              className="text-blue-600 hover:underline font-medium"
            >
              daily analysis pipeline
            </Link>{' '}
            and refreshed every time new Prolific-approved responses are accepted.
          </p>
        </section>

        {/* ── Hero Stats ── */}
        <section className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-tabs-teal-deep font-mono">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Flow narrative ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Why this order</h2>
          <p className={PARAGRAPH_CLASSES}>
            Most research sites put methodology first and findings last. TABS flips that. We lead
            with the top 3 barriers and the key inferential findings because that is the answer to
            the research question. Everything below the findings is the scaffolding: the sample, the
            quality pipeline, the reliability and validity evidence, the factor structure, and the
            sensitivity checks that show the results do not depend on a single cleaning decision.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            If you are evaluating the research, walk straight down the nine pages in order. If you
            are cross-checking a specific number, jump straight to the page you need.
          </p>
        </section>

        {/* ── Live vs CRP 2026 split path ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Two result tracks: live vs. frozen</h2>
          <p className={PARAGRAPH_CLASSES}>
            TABS publishes two parallel result sets. The live track updates daily as the Prolific
            study progresses toward N=500. The CRP 2026 track is the frozen N=200 snapshot that the
            dissertation cites. Use the track that matches the decision you are making.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Live card */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Updates daily
                </span>
                {liveTotalN !== null && (
                  <span className="text-xs font-mono text-blue-900">
                    N={liveTotalN} Prolific Accepted
                  </span>
                )}
              </div>
              <h3 className={`${H3_CLASSES} text-blue-900 mt-0`}>Live Results</h3>
              <p className="text-sm text-blue-900 mb-3">
                The growing TABS V2 dataset, regenerated daily from the latest approved Prolific
                responses. Best for watching the ranking stabilize as the sample fills toward N=500.
              </p>
              <Link
                href="/results/top-barriers"
                className="inline-flex items-center text-sm font-medium text-blue-700 hover:underline"
              >
                Start: Live Top 3 Barriers -&gt;
              </Link>
            </div>

            {/* CRP card */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Frozen for CRP
                </span>
                {crpTotalN !== null && (
                  <span className="text-xs font-mono text-green-900">
                    N={crpTotalN} (April 2026)
                  </span>
                )}
              </div>
              <h3 className={`${H3_CLASSES} text-green-900 mt-0`}>CRP 2026</h3>
              <p className="text-sm text-green-900 mb-3">
                The N=200 snapshot cited in the dissertation. Use this track to reproduce the
                published statistics exactly or to cite a fixed reference in academic work.
              </p>
              <Link
                href="/results/crp-2026/top-barriers"
                className="inline-flex items-center text-sm font-medium text-green-700 hover:underline"
              >
                Start: CRP Top 3 Barriers -&gt;
              </Link>
            </div>
          </div>

          {crpTopThree.length === 3 && liveTopThree.length === 3 && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
              <p className="font-semibold mb-1">Top 3 at a glance</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-blue-900 mb-1">
                    Live (N={liveTotalN == null ? DATA_UNAVAILABLE : liveTotalN})
                  </div>
                  <ol className="list-decimal list-inside space-y-0.5">
                    {liveTopThree.map((r) => (
                      <li key={`live-${r.item}`}>
                        <span className="font-mono text-xs">{r.item}</span> {barrierShort(r.text)}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <div className="text-xs font-semibold text-green-900 mb-1">
                    CRP 2026 (N={crpTotalN == null ? DATA_UNAVAILABLE : crpTotalN})
                  </div>
                  <ol className="list-decimal list-inside space-y-0.5">
                    {crpTopThree.map((r) => (
                      <li key={`crp-${r.item}`}>
                        <span className="font-mono text-xs">{r.item}</span> {barrierShort(r.text)}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── The 9 flow pages ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>The nine pages, in order</h2>
          <p className={PARAGRAPH_CLASSES}>
            Each row below links to both the live version and the CRP 2026 version of the same page.
            The left-hand navigation is ordered to match.
          </p>
          <ol className="space-y-4 mt-4 list-none">
            {FLOW_PAGES.map((p, i) => (
              <li
                key={p.key}
                className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col sm:flex-row sm:items-start sm:gap-4"
              >
                <div
                  aria-hidden="true"
                  className="shrink-0 w-10 h-10 rounded-full bg-tabs-teal-deep text-white flex items-center justify-center font-bold font-mono mb-2 sm:mb-0"
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">{p.tagline}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={p.livePath}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                    >
                      Live
                    </Link>
                    <Link
                      href={p.crpPath}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800 border border-green-200 hover:bg-green-100"
                    >
                      CRP 2026
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Dashboards & comparisons ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Dashboards, comparisons, and open data</h2>
          <p className={PARAGRAPH_CLASSES}>
            These pages sit outside the core flow. They track the operational side of the survey,
            compare the dataset to external benchmarks, and provide the materials needed to
            reproduce every result.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {SECONDARY_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="block rounded-xl border border-gray-200 bg-gray-50 p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <h3 className="text-base font-semibold text-gray-900 mb-1">{card.title}</h3>
                <p className="text-sm text-gray-700">{card.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── How to Cite ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How to cite</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 font-sans text-sm">
            <p className="mb-2 font-medium">APA Format:</p>
            <p className="text-gray-700 italic">
              Moyer, C. (2026). Technology Adoption Barriers Survey (TABS): Survey results and open
              data.{' '}
              <span className="not-italic">https://technologyadoptionbarriers.org/results</span>
            </p>
          </div>
        </section>

        {/* ── Methodology Link ── */}
        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            For details on how this data is collected, processed, and validated, see the{' '}
            <Link href="/making-of-tabs" className="text-blue-600 hover:underline">
              Making of TABS
            </Link>{' '}
            section.
          </p>
        </section>
      </article>
    </div>
  )
}

export default ResultsPage
