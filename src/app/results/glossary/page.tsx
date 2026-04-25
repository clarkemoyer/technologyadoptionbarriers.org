import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'
import validationData from '@/data/crp-validation.json'
import { glossaryTerms } from '@/data/glossary-terms'
export const metadata: Metadata = {
  title: 'Statistics Glossary - TABS Results',
  description:
    'Plain-language explanations of every psychometric and statistical method used in the TABS instrument validation, including formulas, thresholds, and interpretive guidance.',
  alternates: {
    canonical: '/results/glossary',
  },
}

/* ── Validation data shortcuts ── */
// Support both per-sample format (post-#1544) and legacy flat format
const _vd = validationData as Record<string, unknown>
const _sample =
  'samples' in _vd && Array.isArray(_vd.samples)
    ? ((_vd.samples as Record<string, unknown>[]).find(
        (s) => s.key === (_vd.primary_sample as string)
      ) ?? (_vd.samples as Record<string, unknown>[])[0])
    : _vd
const b = _sample.Barriers as (typeof validationData)['samples'][number]['Barriers']
const r = _sample.Readiness as (typeof validationData)['samples'][number]['Readiness']
const m = _sample.Maturity as (typeof validationData)['samples'][number]['Maturity']
const htmt = _sample.htmt as (typeof validationData)['samples'][number]['htmt']
const fl = _sample.fornell_larcker as (typeof validationData)['samples'][number]['fornell_larcker']
const fa = _sample.factor_analysis as (typeof validationData)['samples'][number]['factor_analysis']
const b4 = _sample.barriers_4f_cfa as (typeof validationData)['samples'][number]['barriers_4f_cfa']
const _metadata = _sample.metadata as (typeof validationData)['samples'][number]['metadata']

/** Format a number without leading zero, e.g. 0.873 → ".873". Returns "N/A" if null. */
const f3 = (v: number | null | undefined) => (v != null ? v.toFixed(3).replace(/^0/, '') : 'N/A')

/** Format a number to 2 decimal places without leading zero. Returns "N/A" if null. */
const f2 = (v: number | null | undefined) => (v != null ? v.toFixed(2).replace(/^0/, '') : 'N/A')

/* ── Glossary entry type ── */
type GlossaryEntry = {
  id: string
  term: string
  category: string
  whatItMeasures: string
  howCalculated: string
  thresholds: string
  tabsContext?: string
}

/**
 * Page-specific fields: howCalculated, thresholds, and optional tabsContext.
 * id, term, category, and whatItMeasures are derived from glossary-terms.ts
 * (the single source of truth for inline-tooltip copy) so they never drift.
 */
type GlossaryPageExtra = Omit<GlossaryEntry, 'term' | 'category' | 'whatItMeasures'>

const _termBase = new Map(glossaryTerms.map((g) => [g.id, g]))

const PAGE_EXTRAS: GlossaryPageExtra[] = [
  /* ── Reliability ── */
  {
    id: 'cronbach-alpha',
    howCalculated:
      'α = (k / (k − 1)) × (1 − Σs²ᵢ / s²ₜ), where k = number of items, s²ᵢ = variance of each item, s²ₜ = variance of the total score. TABS also reports the Feldt (1965) 95% confidence interval.',
    thresholds:
      '≥ 0.70 acceptable, ≥ 0.80 good, ≥ 0.90 excellent. Values above 0.95 may indicate item redundancy.',
    tabsContext: `Barriers α = ${f3(b.cronbach_alpha)}, Readiness α = ${f3(r.cronbach_alpha)}, Maturity α = ${f3(m.cronbach_alpha)} - all in the "good to excellent" range.`,
  },
  {
    id: 'mcdonalds-omega',
    howCalculated:
      'ω = (Σλᵢ)² / ((Σλᵢ)² + Σ(1 − λ²ᵢ)), where λᵢ are the standardized factor loadings from a single-factor model. This is equivalent to total reliability omega.',
    thresholds:
      'Same thresholds as alpha (≥ 0.70 acceptable). Omega is generally preferred over alpha by modern psychometricians because it relaxes the tau-equivalent assumption.',
    tabsContext: `Barriers ω = ${f3(b.mcdonalds_omega)}, Readiness ω = ${f3(r.mcdonalds_omega)}, Maturity ω = ${f3(m.mcdonalds_omega)} - very close to alpha values, suggesting reasonably tau-equivalent item loadings.`,
  },
  {
    id: 'composite-reliability',
    howCalculated:
      'CR = (Σλᵢ)² / ((Σλᵢ)² + Σε²ᵢ), where λᵢ are standardized factor loadings and ε²ᵢ = 1 − λ²ᵢ are the error variances. Numerically equivalent to omega when computed from the same loadings.',
    thresholds:
      '≥ 0.70 acceptable, ≥ 0.80 good. When CR exceeds 0.70 but AVE falls below 0.50, convergent validity is "adequate" per Fornell & Larcker (1981).',
    tabsContext: `Barriers CR = ${f3(b.composite_reliability)}, Readiness CR = ${f3(r.composite_reliability)}, Maturity CR = ${f3(m.composite_reliability)} - all above 0.80, compensating for below-threshold AVE values.`,
  },
  {
    id: 'split-half',
    howCalculated:
      'rₛₕ = 2r / (1 + r), where r is the Pearson correlation between the two half-scores. This is the Spearman-Brown prophecy formula, which estimates what the reliability would be if both halves were combined.',
    thresholds:
      'Same as alpha: ≥ 0.70 acceptable. Split-half reliability provides a useful cross-check against alpha - large discrepancies suggest item ordering effects.',
    tabsContext: `Barriers = ${f3(b.split_half)}, Readiness = ${f3(r.split_half)}, Maturity = ${f3(m.split_half)} - all consistent with alpha/omega values.`,
  },
  {
    id: 'alpha-if-deleted',
    howCalculated:
      "Recompute Cronbach's alpha on the remaining k−1 items for each item in turn. Report the change (Δα) and flag items where deletion would increase alpha.",
    thresholds:
      'If Δα > 0, the item may be a candidate for removal (though substantive justification should outweigh statistical criteria alone).',
    tabsContext: `The current validation summary does not export per-item alpha-if-deleted values. Overall Barriers alpha is ${f3(b.cronbach_alpha)}, indicating adequate scale reliability. Any item whose deletion would substantially increase alpha would be a candidate for review on substantive grounds.`,
  },

  /* ── Item Analysis ── */
  {
    id: 'corrected-itc',
    howCalculated:
      'For item i, CITCᵢ = r(xᵢ, T₋ᵢ), where T₋ᵢ is the sum of all items except item i.',
    thresholds:
      '≥ 0.30 acceptable. Items below 0.30 may not be measuring the same construct as the other items, or may be interpreted inconsistently by respondents.',
    tabsContext: b.itc_all_above_030
      ? `All Barriers items meet the ≥ 0.30 CITC threshold (minimum observed CITC = ${b.itc_min != null ? f2(b.itc_min) : 'N/A'}).`
      : `At least one Barriers item falls below the 0.30 threshold (minimum observed CITC = ${b.itc_min != null ? f2(b.itc_min) : 'N/A'}). Items below threshold are typically retained when substantive coverage justifies it.`,
  },
  {
    id: 'inter-item-correlation',
    howCalculated:
      'Standard Pearson r between each pair of items. Summary: mean of all unique pairwise correlations, plus minimum, maximum, and standard deviation.',
    thresholds:
      'Mean inter-item correlation between 0.15 and 0.50 is optimal (Clark & Watson, 1995). Below 0.15 suggests items are too heterogeneous; above 0.50 suggests redundancy. No negative correlations should exist for a unidimensional scale.',
    tabsContext: `Barriers mean r = ${f3(b.inter_item.mean_r)}, Readiness mean r = ${f3(r.inter_item.mean_r)}, Maturity mean r = ${f3(m.inter_item.mean_r)}. All within acceptable ranges, with Maturity approaching the upper bound (consistent with its 8-item high-homogeneity scale).`,
  },

  /* ── Factor Analysis ── */
  {
    id: 'kmo',
    howCalculated:
      'KMO = ΣΣr²ᵢⱼ / (ΣΣr²ᵢⱼ + ΣΣp²ᵢⱼ), where rᵢⱼ are correlations and pᵢⱼ are partial correlations. Values closer to 1.0 mean factor analysis is more appropriate.',
    thresholds:
      '≥ 0.50 minimum (miserable), ≥ 0.60 mediocre, ≥ 0.70 middling, ≥ 0.80 meritorious, ≥ 0.90 marvelous (Kaiser, 1974).',
    tabsContext: `Barriers KMO = ${f3(b.kmo_bartlett.kmo_overall)} (meritorious), Readiness KMO = ${f3(r.kmo_bartlett.kmo_overall)} (marvelous), Maturity KMO = ${f3(m.kmo_bartlett.kmo_overall)} (marvelous).`,
  },
  {
    id: 'bartlett',
    howCalculated:
      'χ² = −(N − 1 − (2k+5)/6) × ln|R|, where N = sample size, k = number of variables, |R| = determinant of the correlation matrix. Tested against a chi-squared distribution with k(k−1)/2 degrees of freedom.',
    thresholds:
      'p < .05 required. In practice, large samples almost always produce significant results, so this is a necessary but not sufficient condition.',
    tabsContext:
      'All three constructs: p < .001 - highly significant, confirming factor analysis is appropriate.',
  },
  {
    id: 'efa',
    howCalculated:
      'TABS uses Maximum Likelihood (ML) estimation with Promax oblique rotation. ML is preferred for normally-distributed data; Promax allows factors to correlate (appropriate for related constructs). The number of factors is determined by Parallel Analysis, not the Kaiser criterion.',
    thresholds:
      'Factor loadings ≥ 0.30 are typically considered meaningful. Cross-loadings (high loading on multiple factors) above 0.30 suggest item complexity.',
    tabsContext:
      'Barriers: 2 factors (F1 Internal, F2 External). Readiness: 1 factor. Maturity: 1 factor. See the Factor Analysis page for the full loading matrix.',
  },
  {
    id: 'parallel-analysis',
    howCalculated:
      'Generate many (typically 100-1,000) random datasets with the same N and k. Compute eigenvalues for each. Retain factors whose actual eigenvalues exceed the 95th percentile of the random eigenvalues.',
    thresholds:
      'Retain factors where actual eigenvalue > 95th percentile random eigenvalue. This is more accurate than the Kaiser criterion (eigenvalue > 1.0), which tends to over-extract factors.',
    tabsContext: `Barriers: ${b.parallel_analysis.n_factors} factors retained (eigenvalues ${b.parallel_analysis.eigenvalues_real[0].toFixed(2)}, ${b.parallel_analysis.eigenvalues_real[1].toFixed(2)} > random thresholds). Readiness: ${r.parallel_analysis.n_factors} factor (only first eigenvalue ${r.parallel_analysis.eigenvalues_real[0].toFixed(2)} exceeds threshold). Maturity: ${m.parallel_analysis.n_factors} factor (eigenvalue ${m.parallel_analysis.eigenvalues_real[0].toFixed(2)} exceeds threshold).`,
  },
  {
    id: 'cfa',
    howCalculated:
      'Fit a structural equation model where latent factors predict observed items. Estimate factor loadings, error variances, and factor correlations using ML estimation. Evaluate fit using multiple indices (CFI, TLI, RMSEA, SRMR).',
    thresholds:
      'CFI ≥ .95 (good), ≥ .90 (acceptable). TLI ≥ .95 (good), ≥ .90 (acceptable). RMSEA ≤ .06 (good), ≤ .08 (acceptable). SRMR ≤ .08 (good).',
    tabsContext: `Maturity CFA fits well (CFI = ${f3(m.cfa.cfi)}, TLI = ${f3(m.cfa.tli)}, RMSEA = ${f3(m.cfa.rmsea)}). Barriers single-factor CFA shows poor fit (CFI = ${f3(b.cfa.cfi)}), expected for a multi-factor construct. The 4-factor Barriers CFA (CFI = ${f3(b4.cfi)}) improves but remains below threshold, reflecting the exploratory nature of the current sample.`,
  },

  /* ── Validity ── */
  {
    id: 'ave',
    howCalculated:
      'AVE = Σλ²ᵢ / k, where λᵢ are the standardized factor loadings and k is the number of items. This is the mean of the squared loadings - the average communality.',
    thresholds:
      '≥ 0.50 indicates that the construct explains more variance in its items than error does. When AVE < 0.50 but CR > 0.70, convergent validity is "adequate" per Fornell & Larcker (1981). Below 0.50 is common in broad, multi-faceted constructs with many items.',
    tabsContext: `Barriers AVE = ${f3(b.ave)}, Readiness AVE = ${f3(r.ave)}, Maturity AVE = ${f3(m.ave)}. All below the ideal .50, but all have CR > .80. The 18-item Barriers scale measures diverse barrier types, naturally reducing AVE. Maturity (${_metadata.n_maturity} homogeneous items) is closest to the threshold.`,
  },
  {
    id: 'htmt',
    howCalculated:
      'HTMT = mean(heterotrait-heteromethod correlations) / geometric mean of (mean(monotrait-heteromethod correlations) for each construct). Bootstrap confidence intervals (2,000 iterations) are reported for inferential testing.',
    thresholds:
      '< 0.85 conservative threshold (Henseler et al., 2015). < 0.90 liberal threshold. If the 95% CI includes 1.0, constructs may not be distinct.',
    tabsContext: `B-R: ${f3(htmt[0].htmt)}, B-M: ${f3(htmt[1].htmt)}, R-M: ${f3(htmt[2].htmt)}. All pass the conservative .85 threshold. The R-M value (${f3(htmt[2].htmt)}) is the highest, reflecting the known Readiness-Maturity conceptual overlap, but remains below threshold.`,
  },
  {
    id: 'fornell-larcker',
    howCalculated:
      'For each construct pair (A, B): check whether √AVE(A) > |r(A,B)| and √AVE(B) > |r(A,B)|. Both conditions must hold for discriminant validity.',
    thresholds:
      'Pass: √AVE > inter-construct correlation. Fail: the constructs may overlap too much. Fornell-Larcker has been criticized as overly lenient; HTMT is now preferred. When they disagree, HTMT takes precedence.',
    tabsContext: `B-R: passes (√AVE ${f3(fl[0].sqrt_ave1)}/${f3(fl[0].sqrt_ave2)} > |r| ${f3(fl[0].abs_r)}). B-M: passes (${f3(fl[1].sqrt_ave1)}/${f3(fl[1].sqrt_ave2)} > ${f3(fl[1].abs_r)}). R-M: fails (√AVE ${f3(fl[2].sqrt_ave1)} < r ${f3(fl[2].abs_r)}). The R-M failure is expected given their shared "organizational capability" dimension and is well-documented in the CRP.`,
  },

  /* ── Normality ── */
  {
    id: 'shapiro-wilk',
    howCalculated:
      'W = (Σaᵢx₍ᵢ₎)² / Σ(xᵢ − x̄)², where x₍ᵢ₎ are the ordered values and aᵢ are tabulated coefficients. W ranges from 0 to 1, with 1 indicating perfect normality.',
    thresholds:
      'p > .05 suggests normality. In large samples (N > 100), even trivial departures from normality produce significant results, so practical significance (skewness, kurtosis) matters more than p-values.',
    tabsContext:
      'For Likert-type items at N=200, significant non-normality by Shapiro-Wilk is typical. ML estimation is robust to moderate non-normality at this sample size, so practical indicators (skewness, kurtosis) are more informative than p-values. Item-level Shapiro-Wilk results are not exported in the current validation summary.',
  },
  {
    id: 'skewness-kurtosis',
    howCalculated:
      'Skewness = E[(X−μ)³] / σ³. Kurtosis (excess) = E[(X−μ)⁴] / σ⁴ − 3. Both are standardized moments of the distribution.',
    thresholds:
      '|Skewness| < 2.0 and |Kurtosis| < 7.0 are considered acceptable for ML estimation (Curran et al., 1996). West et al. (1995) use stricter |skew| < 2, |kurtosis| < 7.',
    tabsContext:
      'Item-level skewness and kurtosis distributions for the CRP-200 dataset are not exported in the current validation summary. Acceptable limits for ML estimation are |skew| < 2.0 and |kurtosis| < 7.0 (Curran et al., 1996).',
  },

  /* ── Additional ── */
  {
    id: 'eigenvalue',
    howCalculated:
      'Computed from the eigendecomposition of the correlation matrix R. The eigenvalue λⱼ for factor j is the sum of squared factor loadings for that factor across all items.',
    thresholds:
      "Kaiser criterion: retain factors with eigenvalue > 1.0 (explains more than a single item's worth of variance). However, Parallel Analysis is more accurate and is used by TABS.",
    tabsContext: `Barriers: λ₁=${b.parallel_analysis.eigenvalues_real[0].toFixed(2)}, λ₂=${b.parallel_analysis.eigenvalues_real[1].toFixed(2)}, λ₃=${b.parallel_analysis.eigenvalues_real[2].toFixed(2)} (only ${b.parallel_analysis.n_factors} exceed parallel analysis threshold). Readiness: λ₁=${r.parallel_analysis.eigenvalues_real[0].toFixed(2)} (${r.parallel_analysis.n_factors} factor). Maturity: λ₁=${m.parallel_analysis.eigenvalues_real[0].toFixed(2)} (${m.parallel_analysis.n_factors} factor).`,
  },
  {
    id: 'communality',
    howCalculated:
      'h²ᵢ = Σλ²ᵢⱼ across all retained factors, where λᵢⱼ is the loading of item i on factor j. Equivalently, 1 minus the uniqueness.',
    thresholds:
      '≥ 0.40 is generally considered adequate. Low communalities (≤ 0.20) indicate the item is not well-explained by the factor structure.',
    tabsContext:
      'In TABS, communalities are interpreted item-by-item to check whether each question is adequately represented by the retained factor structure. Items with lower communalities are candidates for closer review because the extracted factors explain less of their variance.',
  },
  {
    id: 'variance-explained',
    howCalculated:
      'Sum of (eigenvalue / k) × 100 for each retained factor, where k is the number of items.',
    thresholds:
      '> 50% is commonly cited as a minimum in social sciences, but 40-60% is typical for survey instruments measuring complex constructs.',
    tabsContext: `Barriers ${b.efa.n_factors}-factor: ${(b.efa.total_variance * 100).toFixed(1)}%. Readiness ${r.efa.n_factors}-factor: ${(r.efa.total_variance * 100).toFixed(1)}%. Maturity ${m.efa.n_factors}-factor: ${(m.efa.total_variance * 100).toFixed(1)}%. All within the typical range for organizational behavior surveys.`,
  },
  {
    id: 'promax',
    howCalculated:
      'Start with a Varimax (orthogonal) rotation, then raise the loadings to a power (kappa, typically 4) and use the resulting matrix as a target for oblique Procrustes rotation. This simplifies the loading pattern while allowing inter-factor correlations.',
    thresholds:
      'If inter-factor correlations exceed |r| > .32, oblique rotation is preferred over orthogonal (Tabachnick & Fidell, 2013). Report factor correlations to justify the choice.',
    tabsContext: `Barriers F1-F2 correlation = ${f3(fa.factor_correlation)}, well above .32, confirming Promax was the correct choice.`,
  },
  {
    id: 'cfi',
    howCalculated:
      'CFI = 1 − max((χ²ₘ − dfₘ), 0) / max((χ²₀ − df₀), (χ²ₘ − dfₘ), 0), where m = proposed model, 0 = null model.',
    thresholds: '≥ .95 good fit, ≥ .90 acceptable fit (Hu & Bentler, 1999).',
    tabsContext: `Maturity CFI = ${f3(m.cfa.cfi)} (excellent). Readiness CFI = ${f3(r.cfa.cfi)} (acceptable). Barriers single-factor CFI = ${f3(b.cfa.cfi)} (poor, expected for multi-dimensional construct).`,
  },
  {
    id: 'tli',
    howCalculated: 'TLI = ((χ²₀/df₀) − (χ²ₘ/dfₘ)) / ((χ²₀/df₀) − 1).',
    thresholds: '≥ .95 good fit, ≥ .90 acceptable (same as CFI).',
    tabsContext: `Maturity TLI = ${f3(m.cfa.tli)} (excellent). Readiness TLI = ${f3(r.cfa.tli)} (acceptable). Barriers TLI = ${f3(b.cfa.tli)} (poor).`,
  },
  {
    id: 'rmsea',
    howCalculated: 'RMSEA = √(max((χ²ₘ − dfₘ) / (dfₘ × (N−1)), 0)).',
    thresholds: '≤ .06 good, ≤ .08 acceptable, > .10 poor (Browne & Cudeck, 1993).',
    tabsContext: `Maturity RMSEA = ${f3(m.cfa.rmsea)} (good). Readiness RMSEA = ${f3(r.cfa.rmsea)} (acceptable). Barriers RMSEA = ${f3(b.cfa.rmsea)} (borderline poor).`,
  },
  {
    id: 'srmr',
    howCalculated:
      'SRMR = √(ΣΣ(sᵢⱼ − σ̂ᵢⱼ)² / (k(k+1)/2)), where s and σ̂ are observed and predicted correlations.',
    thresholds:
      '≤ .08 good fit (Hu & Bentler, 1999). SRMR is less sensitive to sample size than chi-squared tests.',
    tabsContext:
      'SRMR is not always available from all estimation methods. When computed, all TABS constructs fall within acceptable ranges.',
  },
]

/* ── Derive full ENTRIES from the shared glossary-terms data + page-specific extras ── */
const ENTRIES: GlossaryEntry[] = PAGE_EXTRAS.map((extra) => {
  const base = _termBase.get(extra.id)
  if (!base) {
    throw new Error(
      `Glossary configuration error: PAGE_EXTRAS entry "${extra.id}" does not exist in glossaryTerms.`
    )
  }
  // Spread `extra` first so `id` comes through once; static fields from the
  // shared glossary-terms data then override anything on `extra` if needed.
  return {
    ...extra,
    term: base.term,
    category: base.category,
    whatItMeasures: base.shortDefinition,
  }
})

/* ── Group entries by category ── */
const categories = [...new Set(ENTRIES.map((e) => e.category))]

const GlossaryEntryCard = ({ entry }: { entry: GlossaryEntry }) => (
  <div id={entry.id} className="scroll-mt-32 mb-8 last:mb-0">
    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-sans">{entry.term}</h3>
    <div className="space-y-3 text-sm sm:text-base font-sans text-gray-700 pl-0 sm:pl-4">
      <div>
        <span className="font-semibold text-tabs-teal-deep">What it measures:</span>{' '}
        {entry.whatItMeasures}
      </div>
      <div>
        <span className="font-semibold text-tabs-teal-deep">How it&rsquo;s calculated:</span>{' '}
        {entry.howCalculated}
      </div>
      <div>
        <span className="font-semibold text-tabs-teal-deep">Thresholds:</span> {entry.thresholds}
      </div>
      {entry.tabsContext && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <span className="font-semibold text-gray-800">TABS result:</span> {entry.tabsContext}
        </div>
      )}
    </div>
  </div>
)

const GlossaryPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Statistics Glossary</h1>

        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            Published: April 2026
          </span>
        </div>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This glossary explains every psychometric and statistical method used in the TABS
            instrument validation. Each entry describes what the statistic measures, how it is
            calculated, commonly accepted thresholds, and the TABS-specific results from the CRP-200
            frozen dataset (N=200).
          </p>
          <p className="text-sm text-gray-500 font-sans mb-6">
            Jump to:{' '}
            {categories.map((cat, i) => (
              <span key={cat}>
                {i > 0 && ' | '}
                <a
                  href={`#cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-blue-600 hover:underline"
                >
                  {cat}
                </a>
              </span>
            ))}
          </p>
        </section>

        {categories.map((cat) => (
          <section
            key={cat}
            id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            className={SECTION_CLASSES}
          >
            <h2 className={H2_CLASSES}>{cat}</h2>
            {ENTRIES.filter((e) => e.category === cat).map((entry) => (
              <GlossaryEntryCard key={entry.id} entry={entry} />
            ))}
          </section>
        ))}

        {/* ── References ── */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key References</h2>
          <div className="text-sm font-sans text-gray-600 space-y-2">
            <p>
              Browne, M.W. & Cudeck, R. (1993). Alternative ways of assessing model fit. In K.A.
              Bollen & J.S. Long (Eds.), <em>Testing Structural Equation Models</em> (pp. 136-162).
              Sage.
            </p>
            <p>
              Clark, L.A. & Watson, D. (1995). Constructing validity: Basic issues in objective
              scale development. <em>Psychological Assessment</em>, 7(3), 309-319.
            </p>
            <p>
              Curran, P.J., West, S.G. & Finch, J.F. (1996). The robustness of test statistics to
              nonnormality and specification error. <em>Psychological Methods</em>, 1(1), 16-29.
            </p>
            <p>
              Feldt, L.S. (1965). The approximate sampling distribution of Kuder-Richardson
              reliability coefficient twenty. <em>Psychometrika</em>, 30, 357-370.
            </p>
            <p>
              Fornell, C. & Larcker, D.F. (1981). Evaluating structural equation models with
              unobservable variables and measurement error. <em>Journal of Marketing Research</em>,
              18(1), 39-50.
            </p>
            <p>
              Henseler, J., Ringle, C.M. & Sarstedt, M. (2015). A new criterion for assessing
              discriminant validity in variance-based SEM.{' '}
              <em>Journal of the Academy of Marketing Science</em>, 43(1), 115-135.
            </p>
            <p>
              Hu, L. & Bentler, P.M. (1999). Cutoff criteria for fit indexes in covariance structure
              analysis. <em>Structural Equation Modeling</em>, 6(1), 1-55.
            </p>
            <p>
              Kaiser, H.F. (1974). An index of factorial simplicity. <em>Psychometrika</em>, 39,
              31-36.
            </p>
            <p>
              Tabachnick, B.G. & Fidell, L.S. (2013). <em>Using Multivariate Statistics</em> (6th
              ed.). Pearson.
            </p>
          </div>
        </section>

        {/* ── Navigation ── */}
        <section className="border-t border-gray-200 pt-8 mt-8">
          <div className="space-y-4 text-sm font-sans">
            <div>
              <p className="mb-2 font-medium text-gray-700">Shared / Full Dataset Results</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/results/validation" className="text-blue-600 hover:underline">
                  Instrument Validation Results &rarr;
                </Link>
                <Link href="/results/factor-analysis" className="text-blue-600 hover:underline">
                  Factor Analysis &rarr;
                </Link>
                <Link href="/results/reliability" className="text-blue-600 hover:underline">
                  Scale Reliability &rarr;
                </Link>
                <Link href="/results" className="text-blue-600 hover:underline">
                  &larr; Results Overview
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-2 font-medium text-gray-700">CRP 2026 Results</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/results/crp-2026/validation" className="text-blue-600 hover:underline">
                  CRP 2026 Validation &rarr;
                </Link>
                <Link
                  href="/results/crp-2026/factor-analysis"
                  className="text-blue-600 hover:underline"
                >
                  CRP 2026 Factor Analysis &rarr;
                </Link>
                <Link
                  href="/results/crp-2026/reliability"
                  className="text-blue-600 hover:underline"
                >
                  CRP 2026 Reliability &rarr;
                </Link>
                <Link href="/results/crp-2026" className="text-blue-600 hover:underline">
                  &larr; CRP 2026 Overview
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  )
}

export default GlossaryPage
