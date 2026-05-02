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
 * Returns the sample object whose `key` matches `primary_sample`, or the
 * first sample if `primary_sample` is absent. Returns null when the data
 * has no samples array or the array is empty.
 */
export const findPrimarySample = (data: ValidationLike): Record<string, unknown> | null => {
  if (!data || !Array.isArray(data.samples) || data.samples.length === 0) return null
  if (data.primary_sample) {
    const match = data.samples.find((s) => s.key === data.primary_sample)
    if (match) return match
  }
  return data.samples[0] ?? null
}
