/**
 * TABS V2 Instrument Constants - Single Source of Truth
 *
 * This file defines all shared constants for the TABS V2 survey instrument.
 * Both the live TypeScript disposition pipeline and the public Python analysis
 * scripts reference these values. Changes here propagate to both systems.
 *
 * Python scripts consume these via a CI-generated JSON export:
 *   scripts/analysis/tabs_v2_constants.json
 *
 * See: .github/workflows/validate-constants.yml
 */

/* ------------------------------------------------------------------ */
/*  Scale Mappings                                                     */
/* ------------------------------------------------------------------ */

export const BARRIER_SCALE = {
  'Not a Barrier': 1,
  'Minor Barrier': 2,
  'Moderate Barrier': 3,
  'Significant Barrier': 4,
  'Major Barrier': 5,
} as const

export const READINESS_SCALE = {
  'Very Low Readiness/Capability': 1,
  'Low Readiness/Capability': 2,
  'Moderate Readiness/Capability': 3,
  'High Readiness/Capability': 4,
  'Very High Readiness/Capability': 5,
} as const

export const MATURITY_SCALE = {
  'Level 1: Initial/Ad Hoc': 1,
  'Level 2: Developing/Repeatable': 2,
  'Level 3: Defined/Standardized': 3,
  'Level 4: Managed/Quantitatively Managed': 4,
  'Level 5: Optimizing/Innovating': 5,
} as const

/** "Don't Know" is valid on readiness and maturity. Exclude from scoring. */
export const DONT_KNOW_RESPONSE = "Don't Know"

/* ------------------------------------------------------------------ */
/*  IRI (Instructed Response Item) Expected Answers                    */
/* ------------------------------------------------------------------ */

export const IRI_EXPECTED_ANSWERS = {
  barrier: 'Major Barrier',
  readiness: 'Low Readiness/Capability',
  maturity: 'Level 2: Developing/Repeatable',
} as const

/* ------------------------------------------------------------------ */
/*  Column Names                                                       */
/* ------------------------------------------------------------------ */

export const COLUMN_PREFIXES = {
  barriers: 'Q10-28_Barriers_',
  readiness: 'Q47-64_Readiness_',
  maturity: 'Q65-73_Maturity_',
} as const

export const IRI_COLUMNS = {
  barrier: 'Q10-28_Barriers_19',
  readiness: 'Q47-64_Readiness_18',
  maturity: 'Q65-73_Maturity_9',
} as const

export const ITEM_COUNTS = {
  barriers: 18,
  readiness: 17,
  maturity: 8,
} as const

export const DEMOGRAPHIC_COLUMNS = {
  role: 'Q1_Role',
  decisionAuth: 'Q2_DecisionAuth',
  industry: 'Q3_Industry',
  orgSize: 'Q4_OrgSize',
  profitModel: 'Q5_ProfitModel',
  revenueBudget: 'Q6_RevenueBudget',
  personalBudget: 'Q7_PersonalBudget',
  geoScope: 'Q8_GeoScope',
  geoScale: 'Q9_GeoScale',
  feedback: 'Q74_Feedback',
} as const

/* ------------------------------------------------------------------ */
/*  Participant-facing item count                                      */
/*                                                                     */
/*  Total items a respondent actually sees in a complete submission.   */
/*  Barriers/Readiness/Maturity blocks each include 1 IRI attention-   */
/*  check item (presented inline in the matrix, excluded from scoring).*/
/*  Demographics cover Q1-Q9 plus the open-ended Q74 feedback prompt.  */
/*  The reCAPTCHA challenge is a gating item participants complete     */
/*  before the survey (tracked as FLAG-RECAPTCHA in disposition data). */
/* ------------------------------------------------------------------ */

const IRI_ITEMS_TOTAL = Object.keys(IRI_COLUMNS).length // 1 per Likert block (barriers + readiness + maturity)
const DEMOGRAPHIC_ITEMS = Object.keys(DEMOGRAPHIC_COLUMNS).length // Q1-Q9 plus Q74 open-ended feedback
const RECAPTCHA_ITEMS = 1

export const TOTAL_ITEMS_PRESENTED =
  ITEM_COUNTS.barriers +
  ITEM_COUNTS.readiness +
  ITEM_COUNTS.maturity +
  IRI_ITEMS_TOTAL +
  DEMOGRAPHIC_ITEMS +
  RECAPTCHA_ITEMS

/* ------------------------------------------------------------------ */
/*  Duration Thresholds                                                */
/* ------------------------------------------------------------------ */

export const DURATION_THRESHOLDS = {
  /**
   * Live pipeline: flag responses completed in under 5 minutes as suspicious.
   * These are manually reviewed, not auto-excluded.
   */
  speedFlag: 300,
  /**
   * Smeal benchmark: responses between 5-9 minutes are flagged for review.
   * Based on Smeal College standard for survey engagement.
   */
  smealBenchmarkMin: 300,
  smealBenchmarkMax: 540,
  /**
   * Research analysis: minimum duration for "Flexible Clean" sample inclusion.
   * This 480s (~8 min) threshold is used for Flexible Clean (Finished +
   * Prolific APPROVED + all 3 IRIs + duration >= 480s). Conservative Clean uses smealBenchmarkMax
   * (540s / 9 min) which also requires reCAPTCHA, straightlining, and auth checks.
   */
  cleanSample: 480,
} as const

/* ------------------------------------------------------------------ */
/*  V2 Data Filter                                                     */
/* ------------------------------------------------------------------ */

export const V2_DATA_FILTER = {
  /** V2 production data starts at this timestamp */
  startDate: '2026-03-23 14:00:00',
  /**
   * Explicit inclusion: Prolific live test of V2 instrument from 2026-03-23 09:07 AM.
   * COO role, 876s duration. Collected before official V2 launch but used V2 instrument.
   */
  explicitIncludeResponseId: 'R_1QK12IJpHjC3wd6',
} as const

/* ------------------------------------------------------------------ */
/*  Org Size Values                                                    */
/* ------------------------------------------------------------------ */

export const ORG_SIZE_VALUES = [
  '<100',
  '100-499',
  '500-999',
  '1000-4999',
  '5000-9999',
  '10000+',
] as const

export const PROFIT_MODEL_VALUES = ['For-Profit', 'Non-Profit', 'Government/Public Sector'] as const

/* ------------------------------------------------------------------ */
/*  Survey Blocks (for straightlining analysis)                        */
/*  Use substantive item counts only - IRI items have predetermined    */
/*  correct answers and must NOT be included in within-person SD       */
/*  calculations. Including IRIs artificially inflates variance and    */
/*  masks straightlining. See Issue #735 for the root-cause analysis.  */
/* ------------------------------------------------------------------ */

export const SURVEY_BLOCKS = [
  { name: 'Barriers', prefix: COLUMN_PREFIXES.barriers, count: ITEM_COUNTS.barriers }, // substantive items only (excludes IRI)
  { name: 'Readiness', prefix: COLUMN_PREFIXES.readiness, count: ITEM_COUNTS.readiness },
  { name: 'Maturity', prefix: COLUMN_PREFIXES.maturity, count: ITEM_COUNTS.maturity },
] as const

/* ------------------------------------------------------------------ */
/*  Maturity Item Names (from CSV subheader row)                       */
/* ------------------------------------------------------------------ */

export const MATURITY_ITEM_NAMES = [
  'IT Investment & Value Mgmt',
  'IT-Enabled Innovation',
  'Process Mgmt & Standardization',
  'Data Governance & Analytics',
  'Tech Risk & Resilience',
  'Strategic IT Planning',
  'Workforce Capability',
  'Change Leadership',
] as const

/* ------------------------------------------------------------------ */
/*  Maturity Sub-construct Groupings (concept mapping framework)       */
/* ------------------------------------------------------------------ */

/**
 * Maps each maturity dimension (D1-D8) to its canonical survey item name
 * and concept-mapping grouping label. The `item` field matches the
 * corresponding entry in MATURITY_ITEM_NAMES exactly so lookups can be
 * joined deterministically. The `itemCode` stores the survey dimension
 * identifier (D1-D8).
 *
 * Grouping labels synthesize related capability domains across CMMI v2.0,
 * IT-CMF, COBIT 2019, and DREAMY. For D1-D5 the canonical names and
 * grouping labels are closely aligned; for D6-D8 the grouping labels are
 * broader (e.g. "Strategy & Architecture" encompasses both strategic
 * planning and enterprise architecture maturity).
 */
type MaturityItemCode = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' | 'D8'
type MaturitySubconstructGrouping = {
  itemCode: MaturityItemCode
  item: (typeof MATURITY_ITEM_NAMES)[number]
  grouping: string
}

export const MATURITY_SUBCONSTRUCT_GROUPINGS = [
  { itemCode: 'D1', item: 'IT Investment & Value Mgmt', grouping: 'Investment & Value Management' },
  {
    itemCode: 'D2',
    item: 'IT-Enabled Innovation',
    grouping: 'Innovation & Digital Transformation',
  },
  {
    itemCode: 'D3',
    item: 'Process Mgmt & Standardization',
    grouping: 'Process & Quality Management',
  },
  {
    itemCode: 'D4',
    item: 'Data Governance & Analytics',
    grouping: 'Data & Information Management',
  },
  { itemCode: 'D5', item: 'Tech Risk & Resilience', grouping: 'Risk, Security & Compliance' },
  { itemCode: 'D6', item: 'Strategic IT Planning', grouping: 'Strategy & Architecture' },
  { itemCode: 'D7', item: 'Workforce Capability', grouping: 'Workforce & Talent' },
  { itemCode: 'D8', item: 'Change Leadership', grouping: 'Change & Adoption Leadership' },
] as const satisfies readonly MaturitySubconstructGrouping[]

export const MATURITY_ITEM_NAMES_NOTE =
  `MATURITY_ITEM_NAMES contains the canonical survey item names as they appear in the Qualtrics ` +
  `CSV column subheaders. MATURITY_SUBCONSTRUCT_GROUPINGS uses the same canonical names in its ` +
  `item field so entries can be joined deterministically to MATURITY_ITEM_NAMES, while itemCode ` +
  `stores the survey dimension identifier (D1-D8). The grouping labels synthesize related ` +
  `capability domains across CMMI v2.0, IT-CMF, COBIT 2019, and DREAMY into unified conceptual ` +
  `categories. For items D1-D5, the canonical names and grouping labels are closely aligned. ` +
  `For D6-D8, the grouping labels are broader (e.g., 'Strategy & Architecture' encompasses both ` +
  `strategic planning and enterprise architecture maturity).`
