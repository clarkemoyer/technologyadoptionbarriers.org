import { getSurveysCompletedCount } from '@/lib/qualtricsStats'

describe('getSurveysCompletedCount', () => {
  it('prefers completedResponses when present', () => {
    expect(
      getSurveysCompletedCount({
        auditable: 8,
        finishedResponses: 9,
        completedResponses: 10,
      })
    ).toBe(10)
  })

  it('falls back to finishedResponses, then auditable', () => {
    expect(getSurveysCompletedCount({ finishedResponses: 11, auditable: 12 })).toBe(11)
    expect(getSurveysCompletedCount({ auditable: 7 })).toBe(7)
  })

  it('falls back to max numeric value when preferred keys missing', () => {
    expect(getSurveysCompletedCount({ generated: 501, deleted: 0 })).toBe(501)
  })

  it('returns 0 when no numeric values exist', () => {
    expect(getSurveysCompletedCount({})).toBe(0)
    expect(getSurveysCompletedCount({ auditable: null, completedResponses: undefined })).toBe(0)
  })
})
