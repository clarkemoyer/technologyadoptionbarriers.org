/**
 * Shared helper for building InferentialExtensions props from validation JSON.
 * Used by both the live and CRP findings pages to avoid duplicating this
 * logic and keep it consistent as the schema evolves.
 */

import { findPrimarySample, type ValidationLike } from '@/lib/results/findPrimarySample'
import type { InferentialExtensionsProps } from '@/components/results/findings/InferentialExtensions'

export const buildInferentialExtensionsProps = (
  validation: unknown
): InferentialExtensionsProps => {
  const sample = findPrimarySample(validation as ValidationLike)
  if (!sample) return {}
  return {
    mediation: sample.mediation_b_r_m as InferentialExtensionsProps['mediation'],
    perFactorReg: sample.per_factor_regressions as InferentialExtensionsProps['perFactorReg'],
    standardizedReg:
      sample.standardized_subfactor_regressions as InferentialExtensionsProps['standardizedReg'],
    tost: sample.equivalence_test_tost_smb_ent as InferentialExtensionsProps['tost'],
    powerAnalysis: sample.power_analysis as InferentialExtensionsProps['powerAnalysis'],
  }
}
