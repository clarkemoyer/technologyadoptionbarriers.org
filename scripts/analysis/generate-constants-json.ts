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
  _generated: new Date().toISOString(),
  _source: 'src/lib/tabs-survey-constants.ts',
}

const outPath = path.join(__dirname, 'tabs_v2_constants.json')
fs.writeFileSync(outPath, JSON.stringify(constants, null, 2) + '\n')
console.log(`Written: ${outPath}`)
