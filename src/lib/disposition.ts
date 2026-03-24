/**
 * TABS V2 Disposition Logic
 *
 * Reusable types and waterfall logic for computing survey response dispositions.
 * Used by scripts/disposition-triage.ts and tests.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface DispositionRow {
  PROLIFIC_PID: string
  Finished: string
  Duration_Seconds: number
  IRI_Barrier_Pass: 0 | 1
  IRI_Readiness_Pass: 0 | 1
  IRI_Maturity_Pass: 0 | 1
  IRI_Pass_Count: number
  IRI_Fail_Count: number
  Speed_Flag: 0 | 1
  Smeal_Benchmark_Flag: 0 | 1
  reCAPTCHA_Score: number
  reCAPTCHA_Flag: 0 | 1
  Straightlining_Count: number
  Straightlining_Flag: 0 | 1
  Disposition: string
}

/* ------------------------------------------------------------------ */
/*  CSV helpers                                                       */
/* ------------------------------------------------------------------ */

export function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

/* ------------------------------------------------------------------ */
/*  Disposition waterfall                                             */
/* ------------------------------------------------------------------ */

export function computeDisposition(row: Omit<DispositionRow, 'Disposition'>): string {
  if (row.Finished !== 'TRUE' && row.Finished !== '1') return 'INCOMPLETE'
  if (row.IRI_Fail_Count >= 2) return 'AUTO-EXCLUDE'
  if (row.Speed_Flag === 1 && row.IRI_Fail_Count >= 1) return 'AUTO-EXCLUDE'
  if (row.Speed_Flag === 1 && row.IRI_Fail_Count === 0) return 'FLAG-SPEED'
  if (row.IRI_Fail_Count === 1 && row.Speed_Flag === 0) return 'FLAG-SINGLE-IRI'
  if (row.Smeal_Benchmark_Flag === 1) return 'FLAG-SMEAL'
  if (row.reCAPTCHA_Flag === 1) return 'FLAG-RECAPTCHA'
  if (row.Straightlining_Flag === 1) return 'FLAG-STRAIGHTLINING'
  return 'CLEAN'
}

/* ------------------------------------------------------------------ */
/*  CSV triage                                                        */
/* ------------------------------------------------------------------ */

function colIndex(headers: string[], name: string): number {
  const idx = headers.findIndex((h) => h === name)
  if (idx === -1) throw new Error(`Required column "${name}" not found in CSV headers`)
  return idx
}

export function triageCsv(inputCsv: string): DispositionRow[] {
  const lines = inputCsv
    .trimEnd()
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')

  if (lines.length < 4) {
    throw new Error('Qualtrics CSV must have 3 header rows + at least 1 data row')
  }

  const headers = parseCsvLine(lines[0])

  const pidIdx = colIndex(headers, 'PROLIFIC_PID')
  const finishedIdx = colIndex(headers, 'Finished')
  const durationIdx = colIndex(headers, 'Duration (in seconds)')
  const iriBarrierIdx = colIndex(headers, 'Q10-28_Barriers_19')
  const iriReadinessIdx = colIndex(headers, 'Q47-64_Readiness_18')
  const iriMaturityIdx = colIndex(headers, 'Q65-73_Maturity_9')
  const recaptchaIdx = colIndex(headers, 'Q_RecaptchaScore')
  const straightliningIdx = colIndex(headers, 'Q_StraightliningCount')

  // Use a Map keyed by PID to deduplicate. Qualtrics exports rows in
  // chronological order, so later entries (retakes) overwrite earlier ones.
  // Decision: use latest attempt only — documented in issue #521.
  const byPid = new Map<string, DispositionRow>()
  let duplicateCount = 0

  for (let i = 3; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])

    const pid = fields[pidIdx] ?? ''
    if (!pid) continue

    const finished = (fields[finishedIdx] ?? '').toUpperCase()
    const duration = parseInt(fields[durationIdx] ?? '0', 10) || 0
    const iriBarrier: 0 | 1 = fields[iriBarrierIdx] === 'Major Barrier' ? 1 : 0
    const iriReadiness: 0 | 1 = fields[iriReadinessIdx] === 'Low Readiness/Capability' ? 1 : 0
    const iriMaturity: 0 | 1 = fields[iriMaturityIdx] === 'Level 2: Developing/Repeatable' ? 1 : 0
    const iriPassCount = iriBarrier + iriReadiness + iriMaturity
    const iriFailCount = 3 - iriPassCount
    const speedFlag: 0 | 1 = duration < 300 ? 1 : 0
    const smealFlag: 0 | 1 = duration >= 300 && duration < 540 ? 1 : 0
    const rawRecaptcha = (fields[recaptchaIdx] ?? '').trim()
    const recaptchaScore = rawRecaptcha === '' ? 1.0 : parseFloat(rawRecaptcha) || 1.0
    const recaptchaFlag: 0 | 1 = recaptchaScore < 0.5 ? 1 : 0
    const straightliningCount = parseInt(fields[straightliningIdx] ?? '0', 10) || 0
    const straightliningFlag: 0 | 1 = straightliningCount > 0 ? 1 : 0

    const partial: Omit<DispositionRow, 'Disposition'> = {
      PROLIFIC_PID: pid,
      Finished: finished,
      Duration_Seconds: duration,
      IRI_Barrier_Pass: iriBarrier,
      IRI_Readiness_Pass: iriReadiness,
      IRI_Maturity_Pass: iriMaturity,
      IRI_Pass_Count: iriPassCount,
      IRI_Fail_Count: iriFailCount,
      Speed_Flag: speedFlag,
      Smeal_Benchmark_Flag: smealFlag,
      reCAPTCHA_Score: recaptchaScore,
      reCAPTCHA_Flag: recaptchaFlag,
      Straightlining_Count: straightliningCount,
      Straightlining_Flag: straightliningFlag,
    }

    if (byPid.has(pid)) duplicateCount++
    byPid.set(pid, { ...partial, Disposition: computeDisposition(partial) })
  }

  if (duplicateCount > 0) {
    console.log(`Dedup: ${duplicateCount} duplicate PID(s) found — using latest attempt for each.`)
  }

  return Array.from(byPid.values())
}
