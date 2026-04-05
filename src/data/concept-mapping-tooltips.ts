/**
 * Shared tooltip constants and lookup helpers for concept mapping views.
 *
 * - `SECTION_DESCRIPTIONS` and `COLUMN_DESCRIPTIONS` are defined once here
 *   and imported by both simple.tsx and complex.tsx to avoid copy-drift.
 * - Normalized `Map`-based lookup tables (`barrierLookup`, `readinessLookup`,
 *   `maturityLookup`) are built once at module load time so that per-row
 *   tooltip resolution is an O(1) map lookup rather than a repeated O(n)
 *   `Array.find()` with redundant `trim().toLowerCase()` calls.
 */

import { barriers, type Barrier } from '@/data/barriers'
import { readinessItems, type ReadinessItem } from '@/data/readiness'
import { maturityItems, type MaturityItem } from '@/data/maturity'

/** Minimal shape required by tooltip rendering in both views */
export type TooltipItem = {
  name: string
  examples?: string[]
}

/** Short descriptions for each section, shown in section-filter/header tooltip icons */
export const SECTION_DESCRIPTIONS: Record<string, string> = {
  A: 'Section A captures respondent demographics (role, organization size, industry, profit model). Used for subgroup analysis across all constructs.',
  B: 'Section B measures the perceived severity of 18 technology adoption barriers using a 5-point scale (Not a barrier → Extreme barrier), plus a forced-choice Top 3 selection.',
  C: 'Section C assesses perceived organizational technology readiness across 17 dimensions (e.g., leadership vision, culture, infrastructure, data governance) using a 5-point capability scale.',
  D: 'Section D evaluates perceived organizational maturity across 8 IT capability domains using a 5-level maturity model (Ad Hoc → Optimized).',
  E: 'Section E collects open-ended qualitative feedback about technology adoption experiences.',
}

/** Descriptions shown in column header tooltips (simple view) */
export const COLUMN_DESCRIPTIONS: Partial<Record<string, string>> = {
  'Section / Primary Construct':
    'The major survey section (A–E) and primary theoretical construct this item belongs to.',
  'Sub-Construct / Grouping':
    'The more specific thematic grouping within the section (e.g., "Strategic Leadership & Governance").',
  'Survey Item (Question Text)': 'The exact question text presented to survey respondents.',
  'Measurement Objective': 'The specific concept or phenomenon this item is designed to measure.',
  'Item Code / Variable Name':
    'The short alphanumeric item code (e.g., "B1") and the associated variable name used in exported data files.',
  'Variable Type':
    'The statistical measurement level of this item (e.g., Ordinal Likert, Categorical).',
  'Theoretical Grounding (Source)':
    "The academic frameworks, models, or prior studies that informed this item's design.",
  'APA Citation (Full)':
    'Full academic citation in APA 7th edition format for the primary theoretical source.',
  'RIS Citation':
    'Citation in RIS format, compatible with reference managers such as Zotero, Mendeley, and EndNote.',
  'Source Link (URL/DOI)': 'A direct hyperlink or DOI to the primary source document or scale.',
  'Scale Type / Response Options':
    'The response format and scale labels presented to respondents for this item.',
  'Qualtrics QID / Export Tag':
    'The internal Qualtrics question ID and the column header name in exported response data.',
  'Relationship to Other Items':
    'Cross-references to other survey items that share theoretical overlap or empirical correlation.',
}

/**
 * Normalized description → barrier item lookup map.
 * Built once at module load; O(1) per lookup during render.
 */
export const barrierLookup: Map<string, Barrier> = new Map(
  barriers.map((b) => [b.description.trim().toLowerCase(), b])
)

/**
 * Normalized description → readiness item lookup map.
 * Built once at module load; O(1) per lookup during render.
 */
export const readinessLookup: Map<string, ReadinessItem> = new Map(
  readinessItems.map((r) => [r.description.trim().toLowerCase(), r])
)

/**
 * Normalized description → maturity item lookup map.
 * Built once at module load; O(1) per lookup during render.
 */
export const maturityLookup: Map<string, MaturityItem> = new Map(
  maturityItems.map((m) => [m.description.trim().toLowerCase(), m])
)

/**
 * Resolve the tooltip item for a survey row using precomputed lookup maps.
 *
 * @param sectionLabel - The "Section / Primary Construct" field value
 * @param surveyItemText - The "Survey Item (Question Text)" field value
 * @returns The matching barrier, readiness, or maturity item, or undefined
 */
export function resolveTooltipItem(
  sectionLabel: string,
  surveyItemText: string
): TooltipItem | undefined {
  const key = surveyItemText.trim().toLowerCase()
  if (!key) return undefined

  if (sectionLabel.includes('Technology Adoption Barriers')) return barrierLookup.get(key)
  if (sectionLabel.includes('Readiness')) return readinessLookup.get(key)
  if (sectionLabel.includes('Maturity')) return maturityLookup.get(key)
  return undefined
}
