/**
 * Generate tabs_v2_constants.json for Python scripts.
 * Run via: npx tsx scripts/analysis/generate-constants-json.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import {
  BARRIER_SCALE,
  READINESS_SCALE,
  MATURITY_SCALE,
  DONT_KNOW_RESPONSE,
  IRI_EXPECTED_ANSWERS,
  IRI_COLUMNS,
  COLUMN_PREFIXES,
  ITEM_COUNTS,
  DEMOGRAPHIC_COLUMNS,
  DURATION_THRESHOLDS,
  V2_DATA_FILTER,
  ORG_SIZE_VALUES,
  PROFIT_MODEL_VALUES,
  MATURITY_ITEM_NAMES,
  MATURITY_SUBCONSTRUCT_GROUPINGS,
  MATURITY_ITEM_NAMES_NOTE,
} from '../../src/lib/tabs-survey-constants'

const constants = {
  BARRIER_SCALE,
  READINESS_SCALE,
  MATURITY_SCALE,
  DONT_KNOW_RESPONSE,
  IRI_EXPECTED_ANSWERS,
  IRI_COLUMNS,
  COLUMN_PREFIXES,
  ITEM_COUNTS,
  DEMOGRAPHIC_COLUMNS,
  DURATION_THRESHOLDS,
  V2_DATA_FILTER,
  ORG_SIZE_VALUES,
  PROFIT_MODEL_VALUES,
  MATURITY_ITEM_NAMES,
  MATURITY_SUBCONSTRUCT_GROUPINGS,
  MATURITY_ITEM_NAMES_NOTE,
  _generated: new Date().toISOString(),
  _source: 'src/lib/tabs-survey-constants.ts',
}

// Guardrail: validate MATURITY_SUBCONSTRUCT_GROUPINGS invariants before writing the JSON.
// This is a behavioral change — if any invariant is violated (missing D1-D8 codes, duplicate
// codes, or item strings that don't match MATURITY_ITEM_NAMES), the generator throws and the
// constants file is NOT written, failing the generation step intentionally.
const EXPECTED_ITEM_CODES = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'] as const
const actualItemCodes = MATURITY_SUBCONSTRUCT_GROUPINGS.map((g) => g.itemCode)
const missingCodes = EXPECTED_ITEM_CODES.filter((c) => !actualItemCodes.includes(c))
const duplicateCodes = [
  ...new Set(actualItemCodes.filter((c, i) => actualItemCodes.indexOf(c) !== i)),
]
const unknownItems = MATURITY_SUBCONSTRUCT_GROUPINGS.filter(
  (g) => !(MATURITY_ITEM_NAMES as readonly string[]).includes(g.item)
).map((g) => g.item)

if (missingCodes.length > 0) {
  throw new Error(
    `MATURITY_SUBCONSTRUCT_GROUPINGS is missing itemCode(s): ${missingCodes.join(', ')}`
  )
}
if (duplicateCodes.length > 0) {
  throw new Error(
    `MATURITY_SUBCONSTRUCT_GROUPINGS has duplicate itemCode(s): ${duplicateCodes.join(', ')}`
  )
}
if (unknownItems.length > 0) {
  throw new Error(
    `MATURITY_SUBCONSTRUCT_GROUPINGS contains item(s) not found in MATURITY_ITEM_NAMES: ${unknownItems.join(', ')}`
  )
}
if (MATURITY_SUBCONSTRUCT_GROUPINGS.length !== MATURITY_ITEM_NAMES.length) {
  throw new Error(
    `MATURITY_SUBCONSTRUCT_GROUPINGS length (${MATURITY_SUBCONSTRUCT_GROUPINGS.length}) does not match MATURITY_ITEM_NAMES length (${MATURITY_ITEM_NAMES.length})`
  )
}

const outPath = path.join(__dirname, 'tabs_v2_constants.json')
fs.writeFileSync(outPath, JSON.stringify(constants, null, 2) + '\n')
console.log(`Written: ${outPath}`)
