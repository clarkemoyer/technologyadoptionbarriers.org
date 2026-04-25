/**
 * Metric explanations for the Response Funnel page.
 *
 * Every number on /results/survey-stats lives here with three things:
 *   - label:       short human-readable name shown in the card heading
 *   - source:      which API or system surfaces the number
 *   - explanation: 1-2 sentences on what it means in the context of TABS
 *
 * Keeping these in one structured map makes the wording auditable and
 * lets the component focus on layout rather than copy.
 */

export type MetricSource = 'qualtrics' | 'prolific' | 'pipeline' | 'instrument'

export interface MetricMeta {
  label: string
  source: MetricSource
  explanation: string
}

export const SOURCE_LABEL: Record<MetricSource, string> = {
  qualtrics: 'Qualtrics API v3',
  prolific: 'Prolific API v1',
  pipeline: 'TABS analysis pipeline',
  instrument: 'TABS instrument constants',
}

export const SOURCE_BADGE_CLASS: Record<MetricSource, string> = {
  qualtrics: 'bg-blue-100 text-blue-800 border-blue-200',
  prolific: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pipeline: 'bg-purple-100 text-purple-800 border-purple-200',
  instrument: 'bg-amber-100 text-amber-800 border-amber-200',
}

export const METRIC_META = {
  // Section 1 — top-of-funnel raw response counts
  qualtricsGenerated: {
    label: 'Generated',
    source: 'qualtrics',
    explanation:
      'Every response row Qualtrics has ever created for this survey, including previews, partial sessions, and rows later soft-deleted. This is the broadest count Qualtrics exposes and includes traffic that never became a real submission.',
  },
  qualtricsAuditable: {
    label: 'Auditable',
    source: 'qualtrics',
    explanation:
      'Responses Qualtrics considers eligible for export and audit. Excludes preview-mode and obviously-spammed rows but still includes incompletes and quality-flagged submissions before TABS triage.',
  },
  qualtricsDeleted: {
    label: 'Deleted',
    source: 'qualtrics',
    explanation:
      'Soft-deleted rows in Qualtrics. Includes test runs from the build phase, withdrawn duplicates, and any rows the survey administrator removed. Counted but not part of the analysis dataset.',
  },
  totalResponses: {
    label: 'Total responses (reconciled)',
    source: 'pipeline',
    explanation:
      'TABS-reconciled response total after joining the Qualtrics export with Prolific submission data. This is the canonical denominator the daily pipeline starts from.',
  },
  uniqueParticipants: {
    label: 'Unique participants',
    source: 'pipeline',
    explanation:
      'Distinct Prolific PIDs in the reconciled dataset. Differs from total responses when a participant submits more than once (we keep the first complete attempt).',
  },
  duplicatesRemoved: {
    label: 'Duplicates removed',
    source: 'pipeline',
    explanation:
      'Submissions dropped because the same Prolific PID had a more complete attempt elsewhere in the data. Currently zero — Prolific blocks reentry by default.',
  },

  // Section 2 — Prolific study state
  totalAvailablePlaces: {
    label: 'Total available places',
    source: 'prolific',
    explanation:
      'The participant cap configured for this Prolific study. Once filled, the study automatically pauses recruitment.',
  },
  placesTaken: {
    label: 'Places taken',
    source: 'prolific',
    explanation:
      'Slots Prolific has handed out — every participant who at least clicked through to start the survey, regardless of whether they finished, returned, or timed out.',
  },
  reward: {
    label: 'Reward per submission',
    source: 'prolific',
    explanation:
      'Cash payment Prolific pays each approved participant. Stored in pence (UK) or cents (US) by Prolific; displayed here in major-unit currency.',
  },
  averageTimeTaken: {
    label: 'Average time taken',
    source: 'prolific',
    explanation:
      'Mean minutes a participant spent on the survey, computed by Prolific across all submitted attempts.',
  },
  averageRewardPerHour: {
    label: 'Effective hourly rate',
    source: 'prolific',
    explanation:
      'Implied hourly pay Prolific reports based on reward and average time. Prolific uses this to show participants whether a study meets fair-pay thresholds.',
  },

  // Section 3 — submission outcomes (Prolific-reported status)
  actionApproved: {
    label: 'Approved',
    source: 'prolific',
    explanation:
      "Submissions the TABS team has accepted on Prolific. Approval pays the participant and locks the row into the analysis dataset. This is the headline 'Surveys Completed' number on the homepage.",
  },
  actionAwaitingReview: {
    label: 'Awaiting review',
    source: 'prolific',
    explanation:
      "Submitted attempts that haven't been approved or rejected yet. The daily pipeline messages quality flags and approves clean submissions automatically; this bucket should drain to zero between runs.",
  },
  actionRejected: {
    label: 'Rejected',
    source: 'prolific',
    explanation:
      'Submissions the team rejected on Prolific because they failed quality gates (multiple failed attention checks plus speed). Participants are not paid; the response is not part of the analysis dataset.',
  },
  actionReturned: {
    label: 'Returned',
    source: 'prolific',
    explanation:
      'Participants who claimed a slot and then returned the study without submitting. Returned slots are recycled back into the pool for new participants.',
  },
  actionTimedOut: {
    label: 'Timed out',
    source: 'prolific',
    explanation:
      'Slots Prolific reclaimed because the participant started but did not submit within the allowed window. The slot is recycled for a new participant.',
  },
  actionActive: {
    label: 'Active',
    source: 'prolific',
    explanation:
      'Participants currently in the survey at the moment the daily pipeline ran. Snapshot only — usually zero except mid-burst.',
  },
  actionMessaged: {
    label: 'Messaged',
    source: 'pipeline',
    explanation:
      'Participants the daily pipeline sent a Prolific message to (typically about a quality flag). Counted by the TABS messaging script, not Prolific itself.',
  },

  // Section 4 — TABS disposition categories
  dispositionClean: {
    label: 'CLEAN',
    source: 'pipeline',
    explanation:
      'Passed every quality check: all 3 attention checks, no straightlining, duration above threshold, reCAPTCHA fine. Auto-approved on Prolific and included in the primary analysis sample.',
  },
  dispositionFlagSmeal: {
    label: 'FLAG-SMEAL',
    source: 'pipeline',
    explanation:
      'Completed within the 5-9 minute Smeal benchmark band. Borderline-fast but otherwise passes checks; almost always approved after manual review.',
  },
  dispositionFlagSpeed: {
    label: 'FLAG-SPEED',
    source: 'pipeline',
    explanation:
      'Finished in under 5 minutes. Flagged for review because that pace is hard to reconcile with thoughtful answers, but not auto-excluded.',
  },
  dispositionFlagPartialStraightlining: {
    label: 'FLAG-PARTIAL-STRAIGHTLINING',
    source: 'pipeline',
    explanation:
      'Showed low within-person variance on at least one Likert block (e.g., picked the same point on every readiness item). Not auto-excluded because some respondents legitimately answer that way.',
  },
  dispositionFlagSingleIri: {
    label: 'FLAG-SINGLE-IRI',
    source: 'pipeline',
    explanation:
      'Failed exactly 1 of the 3 instructed-response (attention check) items. One miss is usually inattention, not a bot — flagged for review and typically approved.',
  },
  dispositionFlagRecaptcha: {
    label: 'FLAG-RECAPTCHA',
    source: 'pipeline',
    explanation:
      'reCAPTCHA score sat in the borderline range. Flagged so the team can decide if the response should still count.',
  },
  dispositionAutoExclude: {
    label: 'AUTO-EXCLUDE',
    source: 'pipeline',
    explanation:
      'Failed multiple quality gates (typically 2 or 3 attention checks, often with speed). Removed from the analysis dataset and the participant is rejected on Prolific.',
  },
  dispositionIncomplete: {
    label: 'INCOMPLETE',
    source: 'pipeline',
    explanation:
      'Started the survey but did not reach the end. Includes both Prolific-returned and Prolific-timed-out attempts. Excluded from analysis but kept for funnel accounting.',
  },

  // Section 5 — AUTO-EXCLUDE reason breakdown
  autoExcludeIri3: {
    label: 'IRI3',
    source: 'pipeline',
    explanation:
      'Failed all 3 instructed-response items. Strong signal of inattention or automation; auto-excluded.',
  },
  autoExcludeIri3Speed: {
    label: 'IRI3 + SPEED',
    source: 'pipeline',
    explanation:
      'Failed all 3 attention checks AND completed too fast. The combination is the highest-confidence auto-exclude.',
  },
  autoExcludeIri2: {
    label: 'IRI2',
    source: 'pipeline',
    explanation:
      "Failed 2 of 3 attention checks. Two misses crosses the threshold from 'inattention' to 'pattern,' so the response is auto-excluded.",
  },
  autoExcludeIri2Speed: {
    label: 'IRI2 + SPEED',
    source: 'pipeline',
    explanation: 'Failed 2 attention checks AND completed too fast. Treated as auto-exclude.',
  },
  autoExcludeSpeedIri: {
    label: 'SPEED + IRI',
    source: 'pipeline',
    explanation:
      'Speed flag combined with at least one IRI failure that, together, crosses the auto-exclude threshold. Tracks responses where speed is the leading signal.',
  },

  // Section 6 — IRI attention-check pass rates
  iriPassBarrier: {
    label: 'Barriers IRI pass rate',
    source: 'pipeline',
    explanation:
      "Share of evaluable submissions that selected the expected option ('Major Barrier') on the embedded barriers attention-check item.",
  },
  iriPassReadiness: {
    label: 'Readiness IRI pass rate',
    source: 'pipeline',
    explanation:
      "Share that selected the expected option ('Low Readiness/Capability') on the readiness attention-check item.",
  },
  iriPassMaturity: {
    label: 'Maturity IRI pass rate',
    source: 'pipeline',
    explanation:
      "Share that selected the expected option ('Level 2: Developing/Repeatable') on the maturity attention-check item.",
  },
  iriDenominator: {
    label: 'IRI denominator',
    source: 'pipeline',
    explanation:
      'Submissions evaluated for IRI pass rates (excludes incompletes and rows missing the IRI columns).',
  },

  // Section 7 — items presented to participants
  qualtricsQuestionIds: {
    label: 'Qualtrics question IDs',
    source: 'qualtrics',
    explanation:
      'Distinct question IDs the Qualtrics survey definition reports. Matrix Likert blocks (Barriers / Readiness / Maturity) collapse to 1 ID even though they present many items.',
  },
  itemsPresented: {
    label: 'Items presented',
    source: 'instrument',
    explanation:
      'What a participant actually sees: 19 barriers + 18 readiness + 9 maturity + 9 demographics + 1 open-ended feedback + 1 reCAPTCHA = 57. Derived from the TABS instrument constants.',
  },
} as const satisfies Record<string, MetricMeta>

export type MetricKey = keyof typeof METRIC_META
