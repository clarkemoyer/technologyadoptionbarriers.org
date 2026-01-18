export type QualtricsResponseCounts = Record<string, number | null | undefined>

function asNumber(value: unknown): number | null {
  if (typeof value !== 'number') return null
  if (!Number.isFinite(value)) return null
  return value
}

/**
 * Choose the best available "surveys completed" count from Qualtrics responseCounts.
 *
 * Qualtrics exposes different count keys depending on account/endpoint; we prefer
 * the most semantically correct completion values when present.
 */
export function getSurveysCompletedCount(responseCounts: QualtricsResponseCounts): number {
  const preferredKeys = ['completedResponses', 'finishedResponses', 'auditable']

  for (const key of preferredKeys) {
    const value = asNumber(responseCounts[key])
    if (value !== null) return value
  }

  const numericValues = Object.values(responseCounts)
    .map((value) => asNumber(value))
    .filter((value): value is number => value !== null)

  return numericValues.length ? Math.max(...numericValues) : 0
}
