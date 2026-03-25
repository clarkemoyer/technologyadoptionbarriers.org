import {
  computeDisposition,
  triageCsv,
  withinPersonSD,
  detectPartialStraightlining,
  DispositionRow,
} from '../../src/lib/disposition'

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
    Auth_LLM: '',
    Auth_Bots: '',
    Auth_Flag: 0,
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
    Partial_Straightlining_Flag: 0,
    Partial_Straightlining_Blocks: '',
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

  it('returns FLAG-AUTH-FAIL when Auth_LLM is Low', () => {
    expect(computeDisposition(makeRow({ Auth_LLM: 'Low' }))).toBe('FLAG-AUTH-FAIL')
  })

  it('returns FLAG-AUTH-FAIL when Auth_Bots is Low', () => {
    expect(computeDisposition(makeRow({ Auth_Bots: 'Low' }))).toBe('FLAG-AUTH-FAIL')
  })

  it('returns FLAG-AUTH-FAIL when Auth_LLM is Low (case insensitive)', () => {
    expect(computeDisposition(makeRow({ Auth_LLM: 'low' }))).toBe('FLAG-AUTH-FAIL')
    expect(computeDisposition(makeRow({ Auth_LLM: 'LOW' }))).toBe('FLAG-AUTH-FAIL')
  })

  it('returns FLAG-AUTH-MIXED when Auth_LLM is Mixed', () => {
    expect(computeDisposition(makeRow({ Auth_LLM: 'Mixed' }))).toBe('FLAG-AUTH-MIXED')
  })

  it('returns FLAG-AUTH-MIXED when Auth_Bots is Mixed', () => {
    expect(computeDisposition(makeRow({ Auth_Bots: 'Mixed' }))).toBe('FLAG-AUTH-MIXED')
  })

  it('waterfall precedence: FLAG-AUTH-FAIL beats FLAG-AUTH-MIXED', () => {
    expect(computeDisposition(makeRow({ Auth_LLM: 'Low', Auth_Bots: 'Mixed' }))).toBe(
      'FLAG-AUTH-FAIL'
    )
  })

  it('waterfall precedence: FLAG-AUTH-FAIL beats AUTO-EXCLUDE', () => {
    expect(
      computeDisposition(
        makeRow({
          Auth_LLM: 'Low',
          IRI_Fail_Count: 3,
          IRI_Pass_Count: 0,
          IRI_Barrier_Pass: 0,
          IRI_Readiness_Pass: 0,
          IRI_Maturity_Pass: 0,
        })
      )
    ).toBe('FLAG-AUTH-FAIL')
  })

  it('returns CLEAN when Auth fields are High', () => {
    expect(computeDisposition(makeRow({ Auth_LLM: 'High', Auth_Bots: 'High' }))).toBe('CLEAN')
  })

  it('returns CLEAN when Auth fields are empty (not enriched)', () => {
    expect(computeDisposition(makeRow({ Auth_LLM: '', Auth_Bots: '' }))).toBe('CLEAN')
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

  it('returns FLAG-PARTIAL-STRAIGHTLINING when partial flag is set', () => {
    expect(
      computeDisposition(
        makeRow({ Partial_Straightlining_Flag: 1, Partial_Straightlining_Blocks: 'Barriers' })
      )
    ).toBe('FLAG-PARTIAL-STRAIGHTLINING')
  })

  it('waterfall precedence: FLAG-STRAIGHTLINING beats FLAG-PARTIAL-STRAIGHTLINING', () => {
    expect(
      computeDisposition(
        makeRow({
          Straightlining_Flag: 1,
          Straightlining_Count: 1,
          Partial_Straightlining_Flag: 1,
          Partial_Straightlining_Blocks: 'Barriers',
        })
      )
    ).toBe('FLAG-STRAIGHTLINING')
  })
})

/* ------------------------------------------------------------------ */
/*  Within-person SD tests                                            */
/* ------------------------------------------------------------------ */

describe('withinPersonSD', () => {
  it('returns 0 for identical responses', () => {
    expect(withinPersonSD(['A', 'A', 'A', 'A', 'A'])).toBe(0)
  })

  it('returns > 0 for varied responses', () => {
    expect(withinPersonSD(['A', 'B', 'C', 'A', 'B'])).toBeGreaterThan(0)
  })

  it('returns NaN for fewer than 2 non-empty', () => {
    expect(withinPersonSD(['A'])).toBeNaN()
    expect(withinPersonSD(['', '', 'A'])).toBeNaN()
  })

  it('ignores empty responses', () => {
    expect(withinPersonSD(['A', '', 'A', '', 'A'])).toBe(0)
  })

  it('returns SD below 0.5 for near-straightlining', () => {
    // 18 identical + 1 different = very low variance
    const responses = Array(18).fill('Moderate Barrier')
    responses.push('Major Barrier')
    expect(withinPersonSD(responses)).toBeLessThan(0.5)
  })

  it('returns SD above 0.5 for varied responses', () => {
    const responses = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A']
    expect(withinPersonSD(responses)).toBeGreaterThan(0.5)
  })
})

/* ------------------------------------------------------------------ */
/*  Partial straightlining detection tests                            */
/* ------------------------------------------------------------------ */

describe('detectPartialStraightlining', () => {
  const blocks = [{ name: 'TestBlock', prefix: 'TB_', count: 5 }]
  const headers = ['TB_1', 'TB_2', 'TB_3', 'TB_4', 'TB_5']

  it('flags a block where all items are identical', () => {
    const fields = ['Same', 'Same', 'Same', 'Same', 'Same']
    expect(detectPartialStraightlining(fields, headers, blocks)).toEqual(['TestBlock'])
  })

  it('does not flag a block with varied responses', () => {
    const fields = ['A', 'B', 'C', 'D', 'E']
    expect(detectPartialStraightlining(fields, headers, blocks)).toEqual([])
  })

  it('flags near-straightlining (4 of 5 identical)', () => {
    const fields = ['Same', 'Same', 'Same', 'Same', 'Different']
    const result = detectPartialStraightlining(fields, headers, blocks)
    // SD of [0,0,0,0,1] = 0.4 < 0.5 threshold
    expect(result).toEqual(['TestBlock'])
  })

  it('skips blocks with too few non-empty responses', () => {
    const fields = ['A', '', '', '', '']
    expect(detectPartialStraightlining(fields, headers, blocks)).toEqual([])
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

  it('deduplicates by PID, keeping the latest (last) attempt', () => {
    const csv = [
      HEADERS,
      ROW2,
      ROW3,
      // First attempt: AUTO-EXCLUDE (2 IRI fails)
      'pid-dup,TRUE,600,Wrong Answer,Wrong Answer,Level 2: Developing/Repeatable,0.9,0',
      // Second attempt (retake): CLEAN (all pass)
      'pid-dup,TRUE,700,Major Barrier,Low Readiness/Capability,Level 2: Developing/Repeatable,0.9,0',
    ].join('\n')

    const rows = triageCsv(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].PROLIFIC_PID).toBe('pid-dup')
    expect(rows[0].Disposition).toBe('CLEAN')
    expect(rows[0].Duration_Seconds).toBe(700)
  })

  it('deduplicates keeping latest even when latest is worse', () => {
    const csv = [
      HEADERS,
      ROW2,
      ROW3,
      // First attempt: CLEAN
      'pid-dup2,TRUE,700,Major Barrier,Low Readiness/Capability,Level 2: Developing/Repeatable,0.9,0',
      // Second attempt: AUTO-EXCLUDE
      'pid-dup2,TRUE,600,Wrong Answer,Wrong Answer,Level 2: Developing/Repeatable,0.9,0',
    ].join('\n')

    const rows = triageCsv(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].Disposition).toBe('AUTO-EXCLUDE')
  })

  it('handles mix of unique and duplicate PIDs', () => {
    const csv = [
      HEADERS,
      ROW2,
      ROW3,
      'pid-unique,TRUE,600,Major Barrier,Low Readiness/Capability,Level 2: Developing/Repeatable,0.9,0',
      'pid-dup,TRUE,200,Wrong Answer,Wrong Answer,Wrong Answer,0.9,0',
      'pid-dup,TRUE,700,Major Barrier,Low Readiness/Capability,Level 2: Developing/Repeatable,0.9,0',
    ].join('\n')

    const rows = triageCsv(csv)
    expect(rows).toHaveLength(2)
    const pids = rows.map((r) => r.PROLIFIC_PID)
    expect(pids).toContain('pid-unique')
    expect(pids).toContain('pid-dup')
  })
})
