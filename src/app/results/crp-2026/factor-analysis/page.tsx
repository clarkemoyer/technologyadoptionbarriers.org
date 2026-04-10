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
  title: 'Barrier Factor Structure — TABS CRP 2026',
  description:
    'Hierarchical factor analysis of the 18-item TABS Barriers scale showing theory-based groupings, EFA-derived 2-factor structure, and exploratory 3-group decomposition at N=200.',
  alternates: {
    canonical: '/results/crp-2026/factor-analysis',
  },
}

/* ── Barrier item labels (from crp-validation.json) ── */
const BARRIER_ITEMS: Record<string, string> = Object.fromEntries(
  validationData.factor_analysis.barrier_names.map((name, i) => [`B${i + 1}`, name])
)

/* ── Concept-mapping theory groups ── */
const THEORY_GROUPS = [
  {
    name: 'Organizational & Cultural',
    color: 'bg-blue-50 border-blue-300',
    headerColor: 'bg-blue-600',
    items: ['B1', 'B3'],
    description: 'Internal cultural resistance and risk aversion',
  },
  {
    name: 'Strategic & Operational',
    color: 'bg-emerald-50 border-emerald-300',
    headerColor: 'bg-emerald-600',
    items: ['B2', 'B7', 'B9', 'B10', 'B11', 'B12'],
    description: 'Strategy gaps, legacy systems, governance',
  },
  {
    name: 'Resource & Skill',
    color: 'bg-amber-50 border-amber-300',
    headerColor: 'bg-amber-600',
    items: ['B4', 'B5', 'B6', 'B8'],
    description: 'Workforce, training, cost, infrastructure',
  },
  {
    name: 'Risk, Trust & External',
    color: 'bg-rose-50 border-rose-300',
    headerColor: 'bg-rose-600',
    items: ['B13', 'B14', 'B15', 'B16', 'B17', 'B18'],
    description: 'Security, privacy, regulation, vendors',
  },
]

/* ── EFA 2-factor solution (from crp-validation.json) ── */
const EFA_COLORS = [
  { color: 'bg-indigo-50 border-indigo-400', headerColor: 'bg-indigo-600' },
  { color: 'bg-pink-50 border-pink-400', headerColor: 'bg-pink-600' },
]

const loadingsMatrix = validationData.factor_analysis.loadings_matrix

/**
 * Returns the dominant EFA factor ('F1' or 'F2') for a loadings-matrix row by
 * comparing absolute factor loadings. Uses numeric dominance rather than the
 * JSON `assigned` field, which may reflect theory-driven grouping.
 */
const getDominantFactor = (row: (typeof loadingsMatrix)[number]) =>
  Math.abs(row.f1) >= Math.abs(row.f2) ? 'F1' : 'F2'

const EFA_FACTORS = validationData.factor_analysis.efa_factors.map((f, idx) => {
  const tag = `F${idx + 1}`
  return {
    name: f.name,
    ...EFA_COLORS[idx],
    items: loadingsMatrix.filter((r) => getDominantFactor(r) === tag).map((r) => r.id),
    stats: {
      items: f.items,
      ...(f.alpha !== null && f.alpha !== undefined ? { alpha: f.alpha } : {}),
      eigenvalue: f.eigenvalue,
      varianceExplained: `${f.variance_pct}%`,
    } as Record<string, string | number>,
  }
})

/* ── Forced 3-group split of F1 (from crp-validation.json) ── */
const THREE_GROUP_COLORS = [
  { color: 'bg-violet-50 border-violet-400', headerColor: 'bg-violet-600' },
  { color: 'bg-cyan-50 border-cyan-400', headerColor: 'bg-cyan-600' },
  { color: 'bg-pink-50 border-pink-400', headerColor: 'bg-pink-600' },
]

/* Item lists for the 3-group decomposition — F1a/F1b split is exploratory, items
   derived from the forced 2-factor extraction within F1 (see discussion below). */
const THREE_GROUP_ITEMS = [
  ['B1', 'B2', 'B3', 'B5', 'B9', 'B10', 'B11', 'B15', 'B17'],
  ['B4', 'B6', 'B7', 'B8', 'B12'],
  ['B13', 'B14', 'B16', 'B18'],
]

const THREE_GROUPS = validationData.factor_analysis.three_groups.map((g, idx) => ({
  name: g.name,
  ...THREE_GROUP_COLORS[idx],
  items: THREE_GROUP_ITEMS[idx] ?? [],
  stats: {
    items: g.items,
    alpha: g.alpha,
    cr: g.cr,
    ave: g.ave,
  },
}))

const ItemChip = ({ id }: { id: string }) => (
  <span className="inline-block px-2 py-0.5 text-xs font-mono bg-white rounded border border-gray-300 mr-1 mb-1">
    <span className="font-bold text-gray-700">{id}</span>
    <span className="text-gray-500 ml-1 hidden sm:inline">{BARRIER_ITEMS[id]}</span>
  </span>
)

const GroupCard = ({
  name,
  items,
  color,
  headerColor,
  description,
  stats,
}: {
  name: string
  items: string[]
  color: string
  headerColor: string
  description?: string
  stats?: Record<string, string | number>
}) => (
  <div className={`rounded-lg border-2 ${color} overflow-hidden`}>
    <div className={`${headerColor} text-white text-sm font-bold px-3 py-1.5`}>
      {name} <span className="font-normal opacity-80">({items.length} items)</span>
    </div>
    <div className="p-3">
      {description && <p className="text-xs text-gray-600 mb-2 font-sans">{description}</p>}
      <div className="flex flex-wrap">
        {items.map((id) => (
          <ItemChip key={id} id={id} />
        ))}
      </div>
      {stats && (
        <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-3 text-xs font-sans text-gray-600">
          {Object.entries(stats).map(([k, v]) => (
            <span key={k}>
              <span className="font-semibold text-gray-700">{k}:</span> {v}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
)

const FlowArrow = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center my-4">
    <div className="w-0.5 h-6 bg-gray-400" />
    <div className="text-xs font-sans font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border">
      {label}
    </div>
    <div className="w-0.5 h-6 bg-gray-400" />
    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-400" />
  </div>
)

const FactorAnalysisPage = () => {
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
              Factor Analysis
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Barrier Factor Structure</h1>

        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            Published: April 2026
          </span>
        </div>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            The {validationData.metadata.n_barriers}-item TABS Barriers scale was developed through
            a concept-mapping process that identified four theoretical sub-constructs. Exploratory
            Factor Analysis (EFA) on the CRP-200 frozen dataset (N={validationData.metadata.n_total}
            , listwise valid N={validationData.Barriers.n_listwise}) reveals a statistically
            supported 2-factor structure, with an exploratory 3-group decomposition available for
            practitioner-oriented reporting. This page walks through each level of the hierarchy.
          </p>
          <p className="text-sm text-gray-500 font-sans mb-6">
            See the{' '}
            <Link href="/results/crp-2026/glossary" className="text-blue-600 hover:underline">
              Statistics Glossary
            </Link>{' '}
            for definitions of all psychometric terms used on this page, or the{' '}
            <Link href="/results/crp-2026/validation" className="text-blue-600 hover:underline">
              Instrument Validation
            </Link>{' '}
            page for the full results across all three constructs.
          </p>
        </section>

        {/* ══════════════════════════════════════════════════════════
            LEVEL 1: THEORY-BASED 4 GROUPS
        ══════════════════════════════════════════════════════════ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Level 1: Theory-Based Groupings (4 Groups)</h2>
          <p className={PARAGRAPH_CLASSES}>
            The concept-mapping exercise (Appendix D) sorted the 18 barrier items into four
            sub-constructs based on thematic affinity and theoretical grounding in the adoption
            barriers literature. These groups were the starting hypothesis for the factor structure.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {THEORY_GROUPS.map((g) => (
              <GroupCard key={g.name} {...g} />
            ))}
          </div>
          <p className="text-sm text-gray-500 font-sans">
            Total: 2 + 6 + 4 + 6 = 18 items. The four groups have unequal sizes by design because
            real-world barrier categories differ in breadth.
          </p>
        </section>

        <FlowArrow label="EFA with Promax rotation + Horn's Parallel Analysis" />

        {/* ══════════════════════════════════════════════════════════
            LEVEL 2: EFA 2-FACTOR
        ══════════════════════════════════════════════════════════ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Level 2: EFA-Derived Structure (2 Factors)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Horn&rsquo;s Parallel Analysis compared actual eigenvalues against the 95th percentile
            of random-data eigenvalues and retained exactly two factors. The two factors explain a
            cumulative {(validationData.Barriers.efa.total_variance * 100).toFixed(1)}% of variance.
            Factor correlations (r = .
            {validationData.factor_analysis.factor_correlation.toFixed(3).slice(2)}) confirm the
            oblique rotation was appropriate.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-3 py-2 border">
                    Statistic
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    F1: Internal
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    F2: External
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-1.5 border">Eigenvalue</td>
                  <td className="text-right px-3 py-1.5 border">
                    {validationData.factor_analysis.efa_factors[0].eigenvalue.toFixed(3)}
                  </td>
                  <td className="text-right px-3 py-1.5 border">
                    {validationData.factor_analysis.efa_factors[1].eigenvalue.toFixed(3)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-1.5 border">Variance Explained</td>
                  <td className="text-right px-3 py-1.5 border">
                    {validationData.factor_analysis.efa_factors[0].variance_pct}%
                  </td>
                  <td className="text-right px-3 py-1.5 border">
                    {validationData.factor_analysis.efa_factors[1].variance_pct}%
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 border">Items</td>
                  <td className="text-right px-3 py-1.5 border">
                    {validationData.factor_analysis.efa_factors[0].items}
                  </td>
                  <td className="text-right px-3 py-1.5 border">
                    {validationData.factor_analysis.efa_factors[1].items}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-1.5 border">KMO (overall)</td>
                  <td className="text-right px-3 py-1.5 border" colSpan={2}>
                    {validationData.Barriers.kmo_bartlett.kmo_overall.toFixed(3)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 border">Bartlett&rsquo;s &chi;&sup2;</td>
                  <td className="text-right px-3 py-1.5 border" colSpan={2}>
                    {validationData.Barriers.kmo_bartlett.bartlett_chi2.toLocaleString('en-US', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{' '}
                    (p &lt; .001)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {EFA_FACTORS.map((f) => (
              <GroupCard key={f.name} {...f} stats={f.stats} />
            ))}
          </div>

          <h3 className={H3_CLASSES}>What Changed from Theory?</h3>
          <p className={PARAGRAPH_CLASSES}>
            The theory-based 4-group structure collapsed into 2 empirical factors. All items from
            Organizational &amp; Cultural, Strategic &amp; Operational, and Resource &amp; Skill
            loaded together onto F1 (Internal/Organizational). All {EFA_FACTORS[1].items.length}{' '}
            Risk/Trust items (B13 Cybersecurity, B14 Data Privacy, B15 Trust, B16 Regulatory, B17
            External Pressure, B18 Vendor Difficulty) loaded onto F2 (External/Compliance). This
            suggests that organizational leaders perceive internal barriers as a unified challenge,
            while external compliance and trust constraints form a distinct dimension.
          </p>
        </section>

        <FlowArrow label="Forced 2-factor extraction within F1 (exploratory)" />

        {/* ══════════════════════════════════════════════════════════
            LEVEL 3: FORCED 3-GROUP
        ══════════════════════════════════════════════════════════ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Level 3: Exploratory 3-Group Decomposition</h2>
          <p className={PARAGRAPH_CLASSES}>
            Because F1 contains 14 of the 18 items, we explored whether it could be meaningfully
            sub-divided. Horn&rsquo;s Parallel Analysis on F1 alone recommends retaining only 1
            factor, so any split is not statistically mandated. However, a forced 2-factor
            extraction within F1 produces two interpretable, closely related sub-groups, suggesting
            they are best understood as facets of a single broader construct.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 font-sans text-sm">
            <p className="font-bold text-amber-800 mb-1">Important methodological note</p>
            <p className="text-amber-700">
              The 3-group solution is exploratory and intended for practitioner reporting, not as a
              replacement for the statistically supported 2-factor structure. Parallel Analysis does
              not support splitting F1. Use with appropriate caveats.
            </p>
          </div>

          {THREE_GROUPS.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {THREE_GROUPS.map((g) => (
                  <GroupCard key={g.name} {...g} stats={g.stats} />
                ))}
              </div>

              <h3 className={H3_CLASSES}>3-Group Reliability Summary</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm font-sans border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th scope="col" className="text-left px-3 py-2 border">
                        Group
                      </th>
                      <th scope="col" className="text-right px-3 py-2 border">
                        Items
                      </th>
                      <th scope="col" className="text-right px-3 py-2 border">
                        &alpha;
                      </th>
                      <th scope="col" className="text-right px-3 py-2 border">
                        CR
                      </th>
                      <th scope="col" className="text-right px-3 py-2 border">
                        AVE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {THREE_GROUPS.map((g, i) => (
                      <tr key={g.name} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                        <td className="px-3 py-1.5 border font-medium">{g.name}</td>
                        <td className="text-right px-3 py-1.5 border">{g.stats.items}</td>
                        <td className="text-right px-3 py-1.5 border">
                          {g.stats.alpha !== null && g.stats.alpha !== undefined
                            ? g.stats.alpha.toFixed(3)
                            : '\u2014'}
                        </td>
                        <td className="text-right px-3 py-1.5 border">
                          {g.stats.cr !== null && g.stats.cr !== undefined
                            ? g.stats.cr.toFixed(3)
                            : '\u2014'}
                        </td>
                        <td className="text-right px-3 py-1.5 border">
                          {g.stats.ave !== null && g.stats.ave !== undefined
                            ? g.stats.ave.toFixed(3)
                            : '\u2014'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 font-sans text-sm mb-6">
              <p className="text-red-600 font-medium">
                [DATA UNAVAILABLE — pipeline error] 3-group decomposition data missing from
                crp-validation.json (<code className="font-mono">three_groups</code>). Check the
                daily pipeline workflow.
              </p>
            </div>
          )}

          <h3 className={H3_CLASSES}>Item-Level Factor Loadings</h3>
          <p className="text-sm text-gray-500 font-sans mb-4">
            Full 18-item loading matrix from EFA with Promax rotation (ML estimation, N=192).
            Primary loadings are bolded. Items are grouped by their dominant factor assignment.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs sm:text-sm font-mono border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-2 py-1.5 border">
                    Item
                  </th>
                  <th scope="col" className="text-left px-2 py-1.5 border">
                    Barrier
                  </th>
                  <th scope="col" className="text-right px-2 py-1.5 border">
                    F1 Loading
                  </th>
                  <th scope="col" className="text-right px-2 py-1.5 border">
                    F2 Loading
                  </th>
                  <th scope="col" className="text-center px-2 py-1.5 border">
                    Assigned
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Sort by computed dominant factor: items with higher |f1| first, then |f2| */}
                {[...loadingsMatrix]
                  .sort((a, b) => {
                    const aDom = getDominantFactor(a)
                    const bDom = getDominantFactor(b)
                    return aDom === bDom ? 0 : aDom === 'F1' ? -1 : 1
                  })
                  .map((row, i) => {
                    const dominantFactor = getDominantFactor(row)
                    return (
                      <tr
                        key={row.id}
                        className={
                          dominantFactor === 'F2' ? 'bg-pink-50' : i % 2 === 0 ? '' : 'bg-gray-50'
                        }
                      >
                        <td className="px-2 py-1 border font-bold">{row.id}</td>
                        <td className="px-2 py-1 border text-gray-700">{BARRIER_ITEMS[row.id]}</td>
                        <td
                          className={`text-right px-2 py-1 border ${dominantFactor === 'F1' ? 'font-bold text-indigo-700' : 'text-gray-400'}`}
                        >
                          {row.f1.toFixed(3)}
                        </td>
                        <td
                          className={`text-right px-2 py-1 border ${dominantFactor === 'F2' ? 'font-bold text-pink-700' : 'text-gray-400'}`}
                        >
                          {row.f2.toFixed(3)}
                        </td>
                        <td className="text-center px-2 py-1 border">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${dominantFactor === 'F1' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'}`}
                          >
                            {dominantFactor}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            INTERPRETATION
        ══════════════════════════════════════════════════════════ */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Interpretation and Implications</h2>

          <h3 className={H3_CLASSES}>Why 4 Theory Groups Become 2 Factors</h3>
          <p className={PARAGRAPH_CLASSES}>
            The concept-mapping sub-constructs represent distinct theoretical traditions, but
            organizational leaders perceive barriers through a simpler lens: things within their
            control (internal organizational challenges) versus things imposed from outside
            (regulatory and compliance mandates). The data&rsquo;s factor structure reflects this
            lived experience of adoption barriers.
          </p>

          <h3 className={H3_CLASSES}>The 14/4 Imbalance</h3>
          <p className={PARAGRAPH_CLASSES}>
            F1 containing 14 items while F2 has only 4 is a legitimate asymmetry, not a flaw.
            Internal organizational barriers are inherently more diverse (spanning culture,
            strategy, resources, skills, governance, and infrastructure) while external compliance
            constraints cluster tightly. The 3-group decomposition offers a more balanced
            practitioner view (9 / 5 / 4) for organizations seeking targeted intervention.
          </p>

          <h3 className={H3_CLASSES}>Practical Application</h3>
          <p className={PARAGRAPH_CLASSES}>
            For academic reporting, use the statistically supported 2-factor structure. For
            practitioner dashboards and action planning, the 3-group decomposition provides more
            granular and actionable groupings: Strategy &amp; Culture barriers call for leadership
            and governance interventions, Technical Capacity barriers call for investment and
            infrastructure work, and External/Compliance barriers call for regulatory engagement and
            vendor management.
          </p>
        </section>

        {/* ── Navigation ── */}
        <section className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-wrap gap-4 text-sm font-sans">
            <Link href="/results/crp-2026/validation" className="text-blue-600 hover:underline">
              Instrument Validation Results &rarr;
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

export default FactorAnalysisPage
