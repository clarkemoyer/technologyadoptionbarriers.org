/**
 * Shared helper for selecting the primary sample entry from validation JSON.
 * Used by live and CRP reliability/findings pages to avoid duplicating this
 * logic and keep it consistent as the schema evolves.
 */

export type ValidationLike = {
  samples?: Array<Record<string, unknown>>
  primary_sample?: string
}

/**
 * Returns the sample object whose `key` matches `primary_sample`.
 * Falls back to `samples[0]` only when `primary_sample` is absent.
 * Returns `null` when:
 *   - the data has no samples array or the array is empty
 *   - `primary_sample` is set but no sample's `key` matches it
 *     (this case is treated as a schema regression, not a silent fallback)
 */
export const findPrimarySample = (data: ValidationLike): Record<string, unknown> | null => {
  if (!data || !Array.isArray(data.samples) || data.samples.length === 0) return null
  if (data.primary_sample) {
    return data.samples.find((s) => s.key === data.primary_sample) ?? null
  }
  return data.samples[0] ?? null
}
