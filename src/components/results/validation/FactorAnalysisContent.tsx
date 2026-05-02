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
import { DATA_UNAVAILABLE } from '@/lib/sentinelMarker'

/* ══════════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════════ */

/** Legacy flat format (pre-#1544) or new per-sample format. */
type LegacyValidationData = {
  metadata: { n_total: number; crp200_mode: boolean; [key: string]: unknown }
  [key: string]: unknown
}

/** Widened to accept JSON imports whose inferred types don't exactly match. */
type AnyValidationData = Record<string, unknown>

type SampleEntry = {
  key: string
  label: string
  description: string
  n: number
  adequacy: string
  adequacy_note: string
  Barriers: Record<string, unknown>
  factor_analysis: {
    barrier_names: string[]
    loadings_matrix: Array<{ id: string; f1: number; f2?: number; assigned: string }>
    efa_factors: Array<{ name: string; items: number; eigenvalue: number; variance_pct: number }>
    three_groups: Array<{
      name: string
      item_ids?: string[]
      items: number
      alpha: number
      cr: number
      ave: number
    }>
    factor_correlation: number | null
  }
  metadata: {
    n_total: number
    n_barriers: number
    [key: string]: unknown
  }
  // New keys from PR #1837 (issue #1839 surfaces them on this page)
  subgroup_discriminant_validity?: Record<string, unknown>
  subgroup_standalone_validation?: Record<string, unknown>
  barriers_3f_cross_validation?: Record<string, unknown>
  multigroup_3f_smb_vs_ent?: Record<string, unknown>
  esem_3factor?: Record<string, unknown>
}

type NormalizedData = {
  samples: SampleEntry[]
  primary_sample: string
}

/* ══════════════════════════════════════════════════════════════════
   DATA NORMALIZATION
══════════════════════════════════════════════════════════════════ */

function normalizeData(data: AnyValidationData): NormalizedData {
  if ('samples' in data && Array.isArray(data.samples)) {
    return data as unknown as NormalizedData
  }
  const legacy = data as unknown as LegacyValidationData
  const isCrp = legacy.metadata?.crp200_mode ?? false
  return {
    samples: [
      {
        ...(legacy as unknown as SampleEntry),
        key: isCrp ? 'crp_200' : 'legacy',
        label: isCrp ? 'CRP-200' : 'Legacy Filter',
        description: isCrp
          ? 'Frozen CRP dataset (N=200, tiered selection)'
          : 'Pre-#1544 unnamed sample',
        n: legacy.metadata?.n_total ?? 0,
        adequacy: 'unknown',
        adequacy_note: '',
      },
    ],
    primary_sample: isCrp ? 'crp_200' : 'legacy',
  }
}

/* ══════════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
══════════════════════════════════════════════════════════════════ */

const ADEQUACY_COLORS: Record<string, string> = {
  good: 'bg-green-50 text-green-800 border-green-200',
  adequate: 'bg-blue-50 text-blue-800 border-blue-200',
  marginal: 'bg-amber-50 text-amber-800 border-amber-200',
  inadequate: 'bg-red-50 text-red-800 border-red-200',
  unknown: 'bg-gray-50 text-gray-700 border-gray-200',
}

const ItemChip = ({ id, label }: { id: string; label: string }) => (
  <span className="inline-block px-2 py-0.5 text-xs font-mono bg-white rounded border border-gray-300 mr-1 mb-1">
    <span className="font-bold text-gray-700">{id}</span>
    <span className="text-gray-500 ml-1 hidden sm:inline">{label}</span>
  </span>
)

const GroupCard = ({
  name,
  items,
  color,
  headerColor,
  description,
  stats,
  labelMap,
}: {
  name: string
  items: string[]
  color: string
  headerColor: string
  description?: string
  stats?: Record<string, string | number>
  labelMap?: Record<string, string>
}) => (
  <div className={`rounded-lg border-2 ${color} overflow-hidden`}>
    <div className={`${headerColor} text-white text-sm font-bold px-3 py-1.5`}>
      {name} <span className="font-normal opacity-80">({items.length} items)</span>
    </div>
    <div className="p-3">
      {description && <p className="text-xs text-gray-600 mb-2 font-sans">{description}</p>}
      <div className="flex flex-wrap">
        {items.map((id) => (
          <ItemChip key={id} id={id} label={labelMap?.[id] ?? ''} />
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

/* ══════════════════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════════════════ */

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

const EFA_COLORS = [
  { color: 'bg-indigo-50 border-indigo-400', headerColor: 'bg-indigo-600' },
  { color: 'bg-pink-50 border-pink-400', headerColor: 'bg-pink-600' },
]

const THREE_GROUP_COLORS = [
  { color: 'bg-violet-50 border-violet-400', headerColor: 'bg-violet-600' },
  { color: 'bg-cyan-50 border-cyan-400', headerColor: 'bg-cyan-600' },
  { color: 'bg-pink-50 border-pink-400', headerColor: 'bg-pink-600' },
]

/* ══════════════════════════════════════════════════════════════════
   SECTION HELPERS for Multi-Group + ESEM (added per issue #1839)
══════════════════════════════════════════════════════════════════ */

function fmtNum(v: unknown, digits = 3): string {
  if (typeof v !== 'number' || !Number.isFinite(v)) return DATA_UNAVAILABLE
  return v.toFixed(digits)
}

function isNonPrimary(d: Record<string, unknown> | undefined): boolean {
  return d != null && d.skipped === true
}

/** Multi-group SEM (SMB vs Enterprise) + cross-validation Tucker congruence. */
function MultiGroupSection({
  multigroup,
  crossVal,
}: {
  multigroup: Record<string, unknown> | undefined
  crossVal: Record<string, unknown> | undefined
}) {
  const mgSkipped = isNonPrimary(multigroup)
  const cvSkipped = isNonPrimary(crossVal)
  if ((!multigroup || mgSkipped) && (!crossVal || cvSkipped)) {
    return null
  }
  return (
    <section className={SECTION_CLASSES}>
      <h2 className={H2_CLASSES}>Level 4: Multi-Group Stability and Cross-Validation</h2>
      <p className={PARAGRAPH_CLASSES}>
        The 3-factor structure must hold across organizational subgroups (SMB vs Enterprise) and
        across random splits of the sample to support generalization. Multi-group CFA reports
        per-group fit; cross-validation reports Tucker congruence between independently estimated
        factor solutions.
      </p>

      {multigroup && !mgSkipped && (
        <div className="mb-4">
          <h3 className={H3_CLASSES}>Multi-group 3F CFA (SMB vs Enterprise)</h3>
          <MultiGroupTable data={multigroup} />
        </div>
      )}
      {mgSkipped && (
        <p className="text-sm text-gray-500 font-sans italic mb-4">
          Multi-group CFA is computed for the primary sample tier only.
        </p>
      )}

      {crossVal && !cvSkipped && (
        <div>
          <h3 className={H3_CLASSES}>50/50 split-half cross-validation</h3>
          <CrossValidationTable data={crossVal} />
          <p className="mt-2 text-xs text-gray-600 font-sans">
            Tucker&apos;s congruence coefficient (Lorenzo-Seva &amp; ten Berge, 2006): values &ge;
            .95 indicate factor equivalence, .85 to .95 indicate fair similarity, &lt; .85 indicate
            dissimilar factors.
          </p>
        </div>
      )}
    </section>
  )
}

function MultiGroupTable({ data }: { data: Record<string, unknown> }) {
  const groups = Object.entries(data).filter(([k]) => k.startsWith('Group_'))
  if (groups.length === 0) {
    return <p className="text-sm text-amber-700 font-sans">No per-group fit data available.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-sans border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="text-left px-3 py-2 border">
              Group
            </th>
            <th scope="col" className="text-right px-3 py-2 border">
              N
            </th>
            <th scope="col" className="text-right px-3 py-2 border">
              CFI
            </th>
            <th scope="col" className="text-right px-3 py-2 border">
              RMSEA
            </th>
            <th scope="col" className="text-right px-3 py-2 border">
              chi-squared
            </th>
            <th scope="col" className="text-right px-3 py-2 border">
              df
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map(([key, val], i) => {
            const v = val as Record<string, unknown>
            const fit = (v.fit as Record<string, unknown>) ?? v
            return (
              <tr key={key} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="px-3 py-1.5 border font-medium">
                  {key === 'Group_1'
                    ? 'SMB (n<1000)'
                    : key === 'Group_0'
                      ? 'Enterprise (n>=1000)'
                      : key}
                </td>
                <td className="text-right px-3 py-1.5 border font-mono">
                  {(v.n_listwise as number) ?? (v.n as number) ?? 'n/a'}
                </td>
                <td className="text-right px-3 py-1.5 border font-mono">{fmtNum(fit.cfi)}</td>
                <td className="text-right px-3 py-1.5 border font-mono">{fmtNum(fit.rmsea)}</td>
                <td className="text-right px-3 py-1.5 border font-mono">{fmtNum(fit.chi2, 2)}</td>
                <td className="text-right px-3 py-1.5 border font-mono">
                  {(fit.df as number) ?? 'n/a'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CrossValidationTable({ data }: { data: Record<string, unknown> }) {
  const tucker = data.tucker_congruence as number | null | undefined
  const nCal = data.n_calibration as number | undefined
  const nVal = data.n_validation as number | undefined
  const cal = (data.calibration as Record<string, unknown>) ?? {}
  const val = (data.validation as Record<string, unknown>) ?? {}
  const interp = data.interpretation as string | undefined
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-sans border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th scope="col" className="text-left px-3 py-2 border">
                Split
              </th>
              <th scope="col" className="text-right px-3 py-2 border">
                N
              </th>
              <th scope="col" className="text-right px-3 py-2 border">
                CFI
              </th>
              <th scope="col" className="text-right px-3 py-2 border">
                TLI
              </th>
              <th scope="col" className="text-right px-3 py-2 border">
                RMSEA
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-1.5 border font-medium">Calibration</td>
              <td className="text-right px-3 py-1.5 border font-mono">{nCal ?? 'n/a'}</td>
              <td className="text-right px-3 py-1.5 border font-mono">{fmtNum(cal.cfi)}</td>
              <td className="text-right px-3 py-1.5 border font-mono">{fmtNum(cal.tli)}</td>
              <td className="text-right px-3 py-1.5 border font-mono">{fmtNum(cal.rmsea)}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-3 py-1.5 border font-medium">Validation</td>
              <td className="text-right px-3 py-1.5 border font-mono">{nVal ?? 'n/a'}</td>
              <td className="text-right px-3 py-1.5 border font-mono">{fmtNum(val.cfi)}</td>
              <td className="text-right px-3 py-1.5 border font-mono">{fmtNum(val.tli)}</td>
              <td className="text-right px-3 py-1.5 border font-mono">{fmtNum(val.rmsea)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {typeof tucker === 'number' && (
        <p className="mt-2 text-base text-gray-900 font-sans">
          Tucker&apos;s congruence:{' '}
          <span className="font-mono font-semibold">{tucker.toFixed(3)}</span>
          {tucker >= 0.95 && (
            <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 border border-green-200">
              Factor equivalence
            </span>
          )}
          {tucker < 0.95 && tucker >= 0.85 && (
            <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Fair similarity
            </span>
          )}
          {tucker < 0.85 && (
            <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
              Dissimilar factors
            </span>
          )}
          {interp && <span className="ml-2 text-xs text-gray-600 italic">({interp})</span>}
        </p>
      )}
    </div>
  )
}

/**
 * Detect items whose dominant absolute loading index differs from primary_factor.
 * primary_factor 'F1' -> index 0, 'F2' -> index 1, 'F3' -> index 2.
 */
function detectESEMReassignments(
  items: Record<string, { loadings: number[]; primary_factor: string }>
): Array<{ item: string; primary: string; dominant: string; loading: number }> {
  const factorNames = ['F1', 'F2', 'F3']
  return Object.entries(items).flatMap(([itemId, d]) => {
    const loadings = d.loadings
    if (!Array.isArray(loadings) || loadings.length === 0) return []
    const domIdx = loadings.reduce(
      (best, v, i) => (Math.abs(v) > Math.abs(loadings[best]) ? i : best),
      0
    )
    const domFactor = factorNames[domIdx] ?? `F${domIdx + 1}`
    if (domFactor === d.primary_factor) return []
    return [
      { item: itemId, primary: d.primary_factor, dominant: domFactor, loading: loadings[domIdx] },
    ]
  })
}

/** Exploratory Structural Equation Modeling (ESEM) section.
 *  Renders from the actual esem_3factor JSON shape: n_listwise,
 *  variance_explained_per_factor, factor_correlations, and per-item loadings.
 */
function ESEMSection({ esem }: { esem: Record<string, unknown> | undefined }) {
  if (!esem || isNonPrimary(esem)) {
    return null
  }

  const nListwise = esem.n_listwise as number | undefined
  const varPerFactor = esem.variance_explained_per_factor as number[] | undefined
  const cumVar = esem.cumulative_variance as number | undefined
  const factorCorr = esem.factor_correlations as number[][] | undefined
  const rawItems = esem.items as
    | Record<string, { loadings: number[]; primary_factor: string }>
    | undefined

  const reassignments = rawItems ? detectESEMReassignments(rawItems) : []
  const factorLabels = ['F1 (Barriers)', 'F2 (Readiness)', 'F3 (Maturity)']

  return (
    <section className={SECTION_CLASSES}>
      <h2 className={H2_CLASSES}>
        Level 5: ESEM Sensitivity (Exploratory Structural Equation Modeling)
      </h2>
      <p className={PARAGRAPH_CLASSES}>
        ESEM (Asparouhov &amp; Muthen, 2009) sits between EFA and CFA: it estimates a target-rotated
        factor solution with all cross-loadings free. Items whose dominant loading shifts relative
        to the canonical 3-group assignment are candidates for reassignment in future revisions.
      </p>

      {/* Summary row */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm font-sans">
        {nListwise != null && (
          <div className="bg-gray-50 rounded border border-gray-200 px-3 py-2">
            <span className="text-xs text-gray-600 block">N (listwise)</span>
            <span className="font-mono font-semibold">{nListwise}</span>
          </div>
        )}
        {cumVar != null && (
          <div className="bg-gray-50 rounded border border-gray-200 px-3 py-2">
            <span className="text-xs text-gray-600 block">Cumulative variance</span>
            <span className="font-mono font-semibold">{(cumVar * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Variance explained per factor */}
      {Array.isArray(varPerFactor) && varPerFactor.length > 0 && (
        <div className="mb-4">
          <h3 className={H3_CLASSES}>Variance Explained per Factor</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-3 py-2 border">
                    Factor
                  </th>
                  <th scope="col" className="text-right px-3 py-2 border">
                    Variance Explained
                  </th>
                </tr>
              </thead>
              <tbody>
                {varPerFactor.map((v, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-3 py-1.5 border">{factorLabels[i] ?? `F${i + 1}`}</td>
                    <td className="text-right px-3 py-1.5 border font-mono">
                      {(v * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Factor correlations */}
      {Array.isArray(factorCorr) && factorCorr.length > 0 && (
        <div className="mb-4">
          <h3 className={H3_CLASSES}>Factor Correlations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="px-3 py-2 border" />
                  {factorCorr[0].map((_, j) => (
                    <th key={j} scope="col" className="text-right px-3 py-2 border">
                      {factorLabels[j] ?? `F${j + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {factorCorr.map((row, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <th scope="row" className="text-left px-3 py-1.5 border font-medium">
                      {factorLabels[i] ?? `F${i + 1}`}
                    </th>
                    {row.map((v, j) => (
                      <td key={j} className="text-right px-3 py-1.5 border font-mono">
                        {i === j ? '—' : fmtNum(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reassignments */}
      {reassignments.length > 0 ? (
        <div>
          <h3 className={H3_CLASSES}>Suggested item reassignments (dominant loading)</h3>
          <ul className="text-sm font-sans list-disc list-inside space-y-1">
            {reassignments.map((r) => (
              <li key={r.item}>
                <span className="font-mono">{r.item}</span>: {r.primary} -&gt; {r.dominant}{' '}
                (dominant loading <span className="font-mono">{r.loading.toFixed(3)}</span>)
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-600 font-sans">
            These are exploratory suggestions, not retroactive recodings. The canonical 3-group
            assignment in Level 3 above is preserved for the dissertation analyses.
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-600 font-sans italic">
          No items shifted dominant loadings under ESEM relative to the canonical 3-group structure.
        </p>
      )}
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */

type Props = {
  data: AnyValidationData
  variant: 'live' | 'crp'
}

export function FactorAnalysisContent({ data, variant }: Props) {
  const normalized = useMemo(() => normalizeData(data), [data])
  const [selectedKey, setSelectedKey] = useState(normalized.primary_sample)

  const sample = useMemo(
    () => normalized.samples.find((s) => s.key === selectedKey) ?? normalized.samples[0],
    [normalized, selectedKey]
  )

  const fa = sample.factor_analysis
  const barriers = sample.Barriers as Record<string, unknown>
  const kmo = barriers.kmo_bartlett as Record<string, number>
  const efa = barriers.efa as Record<string, number>

  const BARRIER_ITEMS: Record<string, string> = useMemo(
    () => Object.fromEntries(fa.barrier_names.map((name, i) => [`B${i + 1}`, name])),
    [fa]
  )

  const getDominantFactor = (row: { f1: number; f2?: number }) =>
    row.f2 != null && Math.abs(row.f2) > Math.abs(row.f1) ? 'F2' : 'F1'

  const EFA_FACTORS = useMemo(
    () =>
      fa.efa_factors.map((f, idx) => {
        const tag = `F${idx + 1}`
        return {
          name: f.name,
          ...EFA_COLORS[idx],
          items: fa.loadings_matrix.filter((r) => getDominantFactor(r) === tag).map((r) => r.id),
          stats: {
            items: f.items,
            eigenvalue: f.eigenvalue,
            varianceExplained: `${f.variance_pct}%`,
          } as Record<string, string | number>,
        }
      }),
    [fa]
  )

  const hasTwoFactors = fa.efa_factors.length >= 2

  const THREE_GROUPS = useMemo(
    () =>
      fa.three_groups.map((g, idx) => ({
        name: g.name,
        ...THREE_GROUP_COLORS[idx],
        items: g.item_ids ?? [],
        stats: { items: g.items, alpha: g.alpha, cr: g.cr, ave: g.ave },
      })),
    [fa]
  )

  const validationLink = variant === 'crp' ? '/results/crp-2026/validation' : '/results/validation'
  const glossaryLink = '/results/glossary'
  const reliabilityLink =
    variant === 'crp' ? '/results/crp-2026/reliability' : '/results/reliability'
  const backLink = variant === 'crp' ? '/results/crp-2026' : '/results'
  const backLabel = variant === 'crp' ? 'CRP 2026 Overview' : 'Results Overview'

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Barrier Factor Structure</h1>

        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            Published: April 2026
          </span>
        </div>

        {/* -- Sample Selector -- */}
        {normalized.samples.length > 1 && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg font-sans">
            <label
              htmlFor="fa-sample-select"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Analysis Sample
            </label>
            <select
              id="fa-sample-select"
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

        {/* -- Adequacy Note -- */}
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
            The TABS Barriers scale includes {sample.metadata.n_barriers} items and was developed
            through a concept-mapping process that identified four theoretical sub-constructs.
            Exploratory Factor Analysis (EFA) on the{' '}
            {variant === 'crp'
              ? `CRP-200 frozen dataset (N=${sample.metadata.n_total}`
              : `full TABS dataset included ${sample.metadata.n_total} responses`}
            , with {(barriers.n_listwise as number) ?? 'N/A'} listwise valid responses for the
            factor analysis
            {variant === 'crp' ? ')' : ''}. An exploratory 3-group decomposition is also available
            for practitioner-oriented reporting.
          </p>
          <p className="text-sm text-gray-500 font-sans mb-6">
            See the{' '}
            <Link href={glossaryLink} className="text-blue-600 hover:underline">
              Statistics Glossary
            </Link>{' '}
            for definitions of all psychometric terms used on this page, or the{' '}
            <Link href={validationLink} className="text-blue-600 hover:underline">
              Instrument Validation
            </Link>{' '}
            page for the full results across all three constructs.
          </p>
        </section>

        {/* == LEVEL 1: THEORY-BASED 4 GROUPS == */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Level 1: Theory-Based Groupings (4 Groups)</h2>
          <p className={PARAGRAPH_CLASSES}>
            The concept-mapping exercise (Appendix D) sorted the 18 barrier items into four
            sub-constructs based on thematic affinity and theoretical grounding in the adoption
            barriers literature.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {THEORY_GROUPS.map((g) => (
              <GroupCard key={g.name} {...g} labelMap={BARRIER_ITEMS} />
            ))}
          </div>
          <p className="text-sm text-gray-500 font-sans">
            Total: 2 + 6 + 4 + 6 = 18 items. The four groups have unequal sizes by design because
            real-world barrier categories differ in breadth.
          </p>
        </section>

        <FlowArrow label="EFA with Promax rotation + Horn's Parallel Analysis" />

        {/* == LEVEL 2: EFA 2-FACTOR == */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Level 2: EFA-Derived Structure (2 Factors)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Horn&rsquo;s Parallel Analysis compared actual eigenvalues against the 95th percentile
            of random-data eigenvalues and retained{' '}
            {fa.efa_factors.length === 1 ? 'one factor' : `${fa.efa_factors.length} factors`}.
            {hasTwoFactors
              ? ` The two factors explain a cumulative ${(efa.total_variance * 100).toFixed(1)}% of variance. Factor correlations (r = ${fa.factor_correlation!.toFixed(3).replace(/^(-?)0\./, '$1.')}) confirm the oblique rotation was appropriate.`
              : ` The single factor explains ${(efa.total_variance * 100).toFixed(1)}% of variance.`}
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th scope="col" className="text-left px-3 py-2 border">
                    Statistic
                  </th>
                  {fa.efa_factors.map((f, i) => (
                    <th key={i} scope="col" className="text-right px-3 py-2 border">
                      {f.name || `F${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-1.5 border">Eigenvalue</td>
                  {fa.efa_factors.map((f, i) => (
                    <td key={i} className="text-right px-3 py-1.5 border">
                      {f.eigenvalue.toFixed(3)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-1.5 border">Variance Explained</td>
                  {fa.efa_factors.map((f, i) => (
                    <td key={i} className="text-right px-3 py-1.5 border">
                      {f.variance_pct}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-1.5 border">Items</td>
                  {fa.efa_factors.map((f, i) => (
                    <td key={i} className="text-right px-3 py-1.5 border">
                      {f.items}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-1.5 border">KMO (overall)</td>
                  <td className="text-right px-3 py-1.5 border" colSpan={fa.efa_factors.length}>
                    {kmo.kmo_overall.toFixed(3)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 border">Bartlett&rsquo;s &chi;&sup2;</td>
                  <td className="text-right px-3 py-1.5 border" colSpan={fa.efa_factors.length}>
                    {kmo.bartlett_chi2.toLocaleString('en-US', {
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
              <GroupCard key={f.name} {...f} stats={f.stats} labelMap={BARRIER_ITEMS} />
            ))}
          </div>

          {hasTwoFactors && (
            <>
              <h3 className={H3_CLASSES}>What Changed from Theory?</h3>
              <p className={PARAGRAPH_CLASSES}>
                The theory-based 4-group structure collapsed into 2 empirical factors. All items
                from Organizational &amp; Cultural, Strategic &amp; Operational, and Resource &amp;
                Skill loaded together onto F1 (Internal/Organizational). All{' '}
                {EFA_FACTORS[1]?.items.length} Risk/Trust items loaded onto F2
                (External/Compliance). This suggests that organizational leaders perceive internal
                barriers as a unified challenge, while external compliance and trust constraints
                form a distinct dimension.
              </p>
            </>
          )}
        </section>

        <FlowArrow label="Forced 2-factor extraction within F1 (exploratory)" />

        {/* == LEVEL 3: FORCED 3-GROUP == */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Level 3: Exploratory 3-Group Decomposition</h2>
          <p className={PARAGRAPH_CLASSES}>
            Because F1 contains 14 of the 18 items, we explored whether it could be meaningfully
            sub-divided. Horn&rsquo;s Parallel Analysis on F1 alone recommends retaining only 1
            factor, so any split is not statistically mandated. However, a forced 2-factor
            extraction within F1 produces two interpretable, closely related sub-groups.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 font-sans text-sm">
            <p className="font-bold text-amber-800 mb-1">Important methodological note</p>
            <p className="text-amber-700">
              The 3-group solution is exploratory and intended for practitioner reporting, not as a
              replacement for the statistically supported 2-factor structure.
            </p>
          </div>

          {THREE_GROUPS.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {THREE_GROUPS.map((g) => (
                  <GroupCard key={g.name} {...g} stats={g.stats} labelMap={BARRIER_ITEMS} />
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
                          {g.stats.alpha != null ? g.stats.alpha.toFixed(3) : '\u2014'}
                        </td>
                        <td className="text-right px-3 py-1.5 border">
                          {g.stats.cr != null ? g.stats.cr.toFixed(3) : '\u2014'}
                        </td>
                        <td className="text-right px-3 py-1.5 border">
                          {g.stats.ave != null ? g.stats.ave.toFixed(3) : '\u2014'}
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
                {DATA_UNAVAILABLE} 3-group decomposition data missing (
                <code className="font-mono">three_groups</code>). Check the daily pipeline workflow.
              </p>
            </div>
          )}

          <h3 className={H3_CLASSES}>Item-Level Factor Loadings</h3>
          <p className="text-sm text-gray-500 font-sans mb-4">
            Full 18-item loading matrix from EFA with Promax rotation (ML estimation, N=
            {(barriers.n_listwise as number) ?? '?'}). Primary loadings are bolded. Items are
            grouped by their dominant factor assignment.
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
                  {hasTwoFactors && (
                    <th scope="col" className="text-right px-2 py-1.5 border">
                      F2 Loading
                    </th>
                  )}
                  <th scope="col" className="text-center px-2 py-1.5 border">
                    Assigned
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...fa.loadings_matrix]
                  .sort((a, b) => {
                    const aDom = getDominantFactor(a)
                    const bDom = getDominantFactor(b)
                    if (aDom !== bDom) return aDom === 'F1' ? -1 : 1
                    const aMag = aDom === 'F1' ? Math.abs(a.f1) : Math.abs(a.f2 ?? 0)
                    const bMag = bDom === 'F1' ? Math.abs(b.f1) : Math.abs(b.f2 ?? 0)
                    return bMag - aMag
                  })
                  .map((row, i) => {
                    const dom = getDominantFactor(row)
                    return (
                      <tr
                        key={row.id}
                        className={dom === 'F2' ? 'bg-pink-50' : i % 2 === 0 ? '' : 'bg-gray-50'}
                      >
                        <td className="px-2 py-1 border font-bold">{row.id}</td>
                        <td className="px-2 py-1 border text-gray-700">{BARRIER_ITEMS[row.id]}</td>
                        <td
                          className={`text-right px-2 py-1 border ${dom === 'F1' ? 'font-bold text-indigo-700' : 'text-gray-400'}`}
                        >
                          {row.f1.toFixed(3)}
                        </td>
                        {hasTwoFactors && (
                          <td
                            className={`text-right px-2 py-1 border ${dom === 'F2' ? 'font-bold text-pink-700' : 'text-gray-400'}`}
                          >
                            {(row.f2 ?? 0).toFixed(3)}
                          </td>
                        )}
                        <td className="text-center px-2 py-1 border">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${dom === 'F1' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'}`}
                          >
                            {dom}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </section>

        {/* == LEVEL 4: MULTI-GROUP CFA + CROSS-VALIDATION (added per #1839) == */}
        <MultiGroupSection
          multigroup={sample.multigroup_3f_smb_vs_ent as Record<string, unknown> | undefined}
          crossVal={sample.barriers_3f_cross_validation as Record<string, unknown> | undefined}
        />

        {/* == LEVEL 5: ESEM SENSITIVITY (added per #1839) == */}
        <ESEMSection esem={sample.esem_3factor as Record<string, unknown> | undefined} />

        {/* == INTERPRETATION == */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Interpretation and Implications</h2>

          <h3 className={H3_CLASSES}>Why 4 Theory Groups Become 2 Factors</h3>
          <p className={PARAGRAPH_CLASSES}>
            The concept-mapping sub-constructs represent distinct theoretical traditions, but
            organizational leaders perceive barriers through a simpler lens: things within their
            control (internal organizational challenges) versus things imposed from outside
            (regulatory and compliance mandates).
          </p>

          <h3 className={H3_CLASSES}>The 14/4 Imbalance</h3>
          <p className={PARAGRAPH_CLASSES}>
            F1 containing 14 items while F2 has only 4 is a legitimate asymmetry, not a flaw.
            Internal organizational barriers are inherently more diverse while external compliance
            constraints cluster tightly. The 3-group decomposition offers a more balanced
            practitioner view (9 / 5 / 4) for organizations seeking targeted intervention.
          </p>

          <h3 className={H3_CLASSES}>Practical Application</h3>
          <p className={PARAGRAPH_CLASSES}>
            For academic reporting, use the statistically supported 2-factor structure. For
            practitioner dashboards and action planning, the 3-group decomposition provides more
            granular and actionable groupings.
          </p>
        </section>

        {/* -- Navigation -- */}
        <section className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-wrap gap-4 text-sm font-sans">
            <Link href={validationLink} className="text-blue-600 hover:underline">
              Instrument Validation Results &rarr;
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
