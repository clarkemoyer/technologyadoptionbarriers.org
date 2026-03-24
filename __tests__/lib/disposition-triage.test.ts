import { computeDisposition, triageCsv, DispositionRow } from '../../src/lib/disposition'

/* ------------------------------------------------------------------ */
/*  Helper to build partial rows for waterfall tests                  */
/* ------------------------------------------------------------------ */

function makeRow(
  overrides: Partial<Omit<DispositionRow, 'Disposition'>> = {}
): Omit<DispositionRow, 'Disposition'> {
  return {
    PROLIFIC_PID: 'test-pid',
    Finished: 'TRUE',
    Duration_Seconds: 600,
    IRI_Barrier_Pass: 1,
    IRI_Readiness_Pass: 1,
    IRI_Maturity_Pass: 1,
    IRI_Pass_Count: 3,
    IRI_Fail_Count: 0,
    Speed_Flag: 0,
    Smeal_Benchmark_Flag: 0,
    reCAPTCHA_Score: 0.9,
    reCAPTCHA_Flag: 0,
    Straightlining_Count: 0,
    Straightlining_Flag: 0,
    ...overrides,
  }
}

/* ------------------------------------------------------------------ */
/*  Waterfall tests                                                   */
/* ------------------------------------------------------------------ */

describe('computeDisposition', () => {
  it('returns CLEAN when all checks pass', () => {
    expect(computeDisposition(makeRow())).toBe('CLEAN')
  })

  it('returns CLEAN when Finished is "1" (Qualtrics numeric format)', () => {
    expect(computeDisposition(makeRow({ Finished: '1' }))).toBe('CLEAN')
  })

  it('returns INCOMPLETE when Finished !== TRUE and !== 1', () => {
    expect(computeDisposition(makeRow({ Finished: 'FALSE' }))).toBe('INCOMPLETE')
    expect(computeDisposition(makeRow({ Finished: '0' }))).toBe('INCOMPLETE')
    expect(computeDisposition(makeRow({ Finished: '' }))).toBe('INCOMPLETE')
  })

  it('returns AUTO-EXCLUDE when IRI_Fail_Count >= 2', () => {
    expect(
      computeDisposition(
        makeRow({
          IRI_Fail_Count: 2,
          IRI_Pass_Count: 1,
          IRI_Barrier_Pass: 0,
          IRI_Readiness_Pass: 0,
        })
      )
    ).toBe('AUTO-EXCLUDE')
    expect(
      computeDisposition(
        makeRow({
          IRI_Fail_Count: 3,
          IRI_Pass_Count: 0,
          IRI_Barrier_Pass: 0,
          IRI_Readiness_Pass: 0,
          IRI_Maturity_Pass: 0,
        })
      )
    ).toBe('AUTO-EXCLUDE')
  })

  it('returns AUTO-EXCLUDE when Speed_Flag + any IRI fail', () => {
    expect(
      computeDisposition(
        makeRow({
          Speed_Flag: 1,
          Duration_Seconds: 200,
          IRI_Fail_Count: 1,
          IRI_Pass_Count: 2,
          IRI_Barrier_Pass: 0,
        })
      )
    ).toBe('AUTO-EXCLUDE')
  })

  it('returns FLAG-SPEED when fast but all IRIs pass', () => {
    expect(computeDisposition(makeRow({ Speed_Flag: 1, Duration_Seconds: 200 }))).toBe('FLAG-SPEED')
  })

  it('returns FLAG-SINGLE-IRI when one IRI fails at normal speed', () => {
    expect(
      computeDisposition(makeRow({ IRI_Fail_Count: 1, IRI_Pass_Count: 2, IRI_Barrier_Pass: 0 }))
    ).toBe('FLAG-SINGLE-IRI')
  })

  it('returns FLAG-SMEAL when duration is 300-539s', () => {
    expect(computeDisposition(makeRow({ Smeal_Benchmark_Flag: 1, Duration_Seconds: 400 }))).toBe(
      'FLAG-SMEAL'
    )
  })

  it('returns FLAG-RECAPTCHA when score < 0.5', () => {
    expect(computeDisposition(makeRow({ reCAPTCHA_Flag: 1, reCAPTCHA_Score: 0.3 }))).toBe(
      'FLAG-RECAPTCHA'
    )
  })

  it('returns FLAG-STRAIGHTLINING when count > 0', () => {
    expect(computeDisposition(makeRow({ Straightlining_Flag: 1, Straightlining_Count: 2 }))).toBe(
      'FLAG-STRAIGHTLINING'
    )
  })

  it('waterfall precedence: AUTO-EXCLUDE beats FLAG-SPEED', () => {
    // Speed flag + 1 IRI fail → AUTO-EXCLUDE, not FLAG-SPEED
    expect(
      computeDisposition(
        makeRow({
          Speed_Flag: 1,
          Duration_Seconds: 200,
          IRI_Fail_Count: 1,
          IRI_Pass_Count: 2,
          IRI_Barrier_Pass: 0,
        })
      )
    ).toBe('AUTO-EXCLUDE')
  })

  it('waterfall precedence: FLAG-SINGLE-IRI beats FLAG-SMEAL', () => {
    // 1 IRI fail at Smeal benchmark speed → FLAG-SINGLE-IRI first
    expect(
      computeDisposition(
        makeRow({
          IRI_Fail_Count: 1,
          IRI_Pass_Count: 2,
          IRI_Barrier_Pass: 0,
          Smeal_Benchmark_Flag: 1,
          Duration_Seconds: 400,
        })
      )
    ).toBe('FLAG-SINGLE-IRI')
  })
})

/* ------------------------------------------------------------------ */
/*  CSV parsing integration test                                      */
/* ------------------------------------------------------------------ */

describe('triageCsv', () => {
  const HEADERS =
    'PROLIFIC_PID,Finished,Duration (in seconds),Q10-28_Barriers_19,Q47-64_Readiness_18,Q65-73_Maturity_9,Q_RecaptchaScore,Q_StraightliningCount'
  const ROW2 = 'question text row,,,,,,,,'
  const ROW3 = 'import id row,,,,,,,,'

  it('parses a CLEAN response correctly', () => {
    const csv = [
      HEADERS,
      ROW2,
      ROW3,
      'pid-1,TRUE,600,Major Barrier,Low Readiness/Capability,Level 2: Developing/Repeatable,0.9,0',
    ].join('\n')

    const rows = triageCsv(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].Disposition).toBe('CLEAN')
    expect(rows[0].IRI_Pass_Count).toBe(3)
  })

  it('parses an AUTO-EXCLUDE response (2 IRI fails)', () => {
    const csv = [
      HEADERS,
      ROW2,
      ROW3,
      'pid-2,TRUE,600,Wrong Answer,Wrong Answer,Level 2: Developing/Repeatable,0.9,0',
    ].join('\n')

    const rows = triageCsv(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].Disposition).toBe('AUTO-EXCLUDE')
    expect(rows[0].IRI_Fail_Count).toBe(2)
  })

  it('skips rows without a PROLIFIC_PID', () => {
    const csv = [
      HEADERS,
      ROW2,
      ROW3,
      ',TRUE,600,Major Barrier,Low Readiness/Capability,Level 2: Developing/Repeatable,0.9,0',
    ].join('\n')

    const rows = triageCsv(csv)
    expect(rows).toHaveLength(0)
  })

  it('throws if CSV has fewer than 4 lines', () => {
    expect(() => triageCsv('just,headers\n')).toThrow('3 header rows')
  })
})
