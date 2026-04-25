import dispositionData from '@/data/disposition-summary.json'
import metricsData from '@/data/qualtrics-metrics.json'
import { TOTAL_ITEMS_PRESENTED } from '@/lib/tabs-survey-constants'
import { formatUtcTimestamp } from '@/lib/formatUtcTimestamp'
import {
  METRIC_META,
  SOURCE_BADGE_CLASS,
  SOURCE_LABEL,
  type MetricKey,
} from './metric-explanations'

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return value.toLocaleString()
}

function formatPercent(value: number | null | undefined, fractionDigits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(fractionDigits)}%`
}

function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value} min`
}

function formatCurrency(pence: number | null | undefined): string {
  if (pence === null || pence === undefined || Number.isNaN(pence)) return '—'
  // Prolific stores reward in minor units (pence/cents). Show as £ since the study is GBP-priced.
  const major = pence / 100
  return `£${major.toFixed(2)}`
}

function formatHourlyRate(centsPerHour: number | null | undefined): string {
  if (centsPerHour === null || centsPerHour === undefined || Number.isNaN(centsPerHour)) return '—'
  // Prolific reports averageRewardPerHour in minor units of the study currency.
  const major = centsPerHour / 100
  return `£${major.toFixed(2)}/hr`
}

interface MetricCardProps {
  metricKey: MetricKey
  value: string
}

function MetricCard({ metricKey, value }: MetricCardProps) {
  const meta = METRIC_META[metricKey]
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          {meta.label}
        </h4>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${SOURCE_BADGE_CLASS[meta.source]}`}
          title={SOURCE_LABEL[meta.source]}
        >
          {SOURCE_LABEL[meta.source]}
        </span>
      </div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{meta.explanation}</p>
    </div>
  )
}

interface SectionProps {
  id: string
  title: string
  intro: string
  children: React.ReactNode
}

function FunnelSection({ id, title, intro, children }: SectionProps) {
  return (
    <section id={id} className="mt-12">
      <header className="mb-4 max-w-3xl">
        <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-700">{intro}</p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}

export default function QualtricsSurveyStats() {
  const dispositionUpdatedAt = formatUtcTimestamp(dispositionData.updatedAt)
  const qualtricsUpdatedAt = formatUtcTimestamp(metricsData.collectedAt)

  // Look up Qualtrics raw counts by metric name (workflow writes them as an array of {metric, value}).
  const findMetric = (name: string): number | null =>
    metricsData.metrics.find((m) => m.metric === name)?.value ?? null

  const generated = findMetric('generated')
  const auditable = findMetric('auditable')
  const deleted = findMetric('deleted')

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8 max-w-3xl">
        <h2 className="text-3xl font-bold text-slate-900">Response funnel</h2>
        <p className="mt-3 text-base text-slate-700">
          Every count the daily pipeline tracks, with the API that surfaces it and what it means for
          the analysis. The homepage shows the marketing-friendly Prolific-approved number; this
          page shows the rest of the funnel — the participants who started, returned, timed out,
          were flagged, and were excluded.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div className="rounded-md bg-slate-100 px-3 py-2">
            <span className="font-semibold text-slate-800">Qualtrics snapshot:</span>{' '}
            {qualtricsUpdatedAt ?? '—'}
          </div>
          <div className="rounded-md bg-slate-100 px-3 py-2">
            <span className="font-semibold text-slate-800">Prolific snapshot:</span>{' '}
            {dispositionUpdatedAt ?? '—'}
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <div className="text-slate-600">Survey</div>
          <div className="mt-1 font-semibold text-slate-900">{metricsData.survey.name}</div>
          <div className="mt-1 text-slate-600">
            <span className="font-medium">Survey ID:</span> {metricsData.survey.id} ·{' '}
            <span className="font-medium">Org:</span> {metricsData.survey.organizationId}
          </div>
        </div>
      </header>

      <FunnelSection
        id="raw-response-counts"
        title="1. Top of funnel — raw response counts"
        intro="Where a row first shows up. Qualtrics tracks several count types in parallel; the TABS pipeline reconciles them with Prolific to produce the canonical totals used downstream."
      >
        <MetricCard metricKey="qualtricsGenerated" value={formatNumber(generated)} />
        <MetricCard metricKey="qualtricsAuditable" value={formatNumber(auditable)} />
        <MetricCard metricKey="qualtricsDeleted" value={formatNumber(deleted)} />
        <MetricCard
          metricKey="totalResponses"
          value={formatNumber(dispositionData.totalResponses)}
        />
        <MetricCard
          metricKey="uniqueParticipants"
          value={formatNumber(dispositionData.uniqueParticipants)}
        />
        <MetricCard
          metricKey="duplicatesRemoved"
          value={formatNumber(dispositionData.duplicatesRemoved)}
        />
      </FunnelSection>

      <FunnelSection
        id="prolific-study-state"
        title="2. Prolific study state"
        intro="The shape of the study itself, as Prolific reports it. These numbers describe capacity and pricing rather than outcomes."
      >
        <MetricCard
          metricKey="totalAvailablePlaces"
          value={formatNumber(dispositionData.study?.totalAvailablePlaces)}
        />
        <MetricCard
          metricKey="placesTaken"
          value={formatNumber(dispositionData.study?.placesTaken)}
        />
        <MetricCard metricKey="reward" value={formatCurrency(dispositionData.study?.reward)} />
        <MetricCard
          metricKey="averageTimeTaken"
          value={formatMinutes(dispositionData.study?.averageTimeTaken)}
        />
        <MetricCard
          metricKey="averageRewardPerHour"
          value={formatHourlyRate(dispositionData.study?.averageRewardPerHour)}
        />
      </FunnelSection>

      <FunnelSection
        id="submission-outcomes"
        title="3. Submission outcomes"
        intro="What Prolific itself says about each submitted attempt. The 'Approved' number here is the same one shown on the homepage Statistics callout."
      >
        <MetricCard
          metricKey="actionApproved"
          value={formatNumber(dispositionData.actions?.approved)}
        />
        <MetricCard
          metricKey="actionAwaitingReview"
          value={formatNumber(dispositionData.actions?.awaitingReview)}
        />
        <MetricCard
          metricKey="actionRejected"
          value={formatNumber(dispositionData.actions?.rejected)}
        />
        <MetricCard
          metricKey="actionReturned"
          value={formatNumber(dispositionData.actions?.returned)}
        />
        <MetricCard
          metricKey="actionTimedOut"
          value={formatNumber(dispositionData.actions?.timedOut)}
        />
        <MetricCard
          metricKey="actionActive"
          value={formatNumber(dispositionData.actions?.active)}
        />
        <MetricCard
          metricKey="actionMessaged"
          value={formatNumber(dispositionData.actions?.messaged)}
        />
      </FunnelSection>

      <FunnelSection
        id="disposition-categories"
        title="4. TABS disposition categories"
        intro="Quality-triage labels the daily pipeline assigns based on attention checks, straightlining, duration, and reCAPTCHA. CLEAN is the unambiguously usable bucket; FLAG-* responses are reviewed before approval; AUTO-EXCLUDE drops out of the analysis dataset."
      >
        <MetricCard
          metricKey="dispositionClean"
          value={formatNumber(dispositionData.dispositions?.CLEAN)}
        />
        <MetricCard
          metricKey="dispositionFlagSmeal"
          value={formatNumber(dispositionData.dispositions?.['FLAG-SMEAL'])}
        />
        <MetricCard
          metricKey="dispositionFlagSpeed"
          value={formatNumber(dispositionData.dispositions?.['FLAG-SPEED'])}
        />
        <MetricCard
          metricKey="dispositionFlagPartialStraightlining"
          value={formatNumber(dispositionData.dispositions?.['FLAG-PARTIAL-STRAIGHTLINING'])}
        />
        <MetricCard
          metricKey="dispositionFlagSingleIri"
          value={formatNumber(dispositionData.dispositions?.['FLAG-SINGLE-IRI'])}
        />
        <MetricCard
          metricKey="dispositionFlagRecaptcha"
          value={formatNumber(dispositionData.dispositions?.['FLAG-RECAPTCHA'])}
        />
        <MetricCard
          metricKey="dispositionAutoExclude"
          value={formatNumber(dispositionData.dispositions?.['AUTO-EXCLUDE'])}
        />
        <MetricCard
          metricKey="dispositionIncomplete"
          value={formatNumber(dispositionData.dispositions?.INCOMPLETE)}
        />
      </FunnelSection>

      <FunnelSection
        id="auto-exclude-reasons"
        title="5. AUTO-EXCLUDE reasons"
        intro="Why each AUTO-EXCLUDE was triggered. Categories overlap by design — the pipeline tags every relevant signal so post-hoc analysis can be re-cut later."
      >
        <MetricCard
          metricKey="autoExcludeIri3"
          value={formatNumber(dispositionData.autoExcludeBreakdown?.IRI3)}
        />
        <MetricCard
          metricKey="autoExcludeIri3Speed"
          value={formatNumber(dispositionData.autoExcludeBreakdown?.IRI3_SPEED)}
        />
        <MetricCard
          metricKey="autoExcludeIri2"
          value={formatNumber(dispositionData.autoExcludeBreakdown?.IRI2)}
        />
        <MetricCard
          metricKey="autoExcludeIri2Speed"
          value={formatNumber(dispositionData.autoExcludeBreakdown?.IRI2_SPEED)}
        />
        <MetricCard
          metricKey="autoExcludeSpeedIri"
          value={formatNumber(dispositionData.autoExcludeBreakdown?.SPEED_IRI)}
        />
      </FunnelSection>

      <FunnelSection
        id="iri-pass-rates"
        title="6. IRI attention-check pass rates"
        intro="Each Likert block embeds one instructed-response item with a pre-specified correct answer. Pass rates describe how often the embedded check was answered as instructed across the IRI denominator."
      >
        <MetricCard
          metricKey="iriPassBarrier"
          value={formatPercent(dispositionData.iriPassRates?.barrier)}
        />
        <MetricCard
          metricKey="iriPassReadiness"
          value={formatPercent(dispositionData.iriPassRates?.readiness)}
        />
        <MetricCard
          metricKey="iriPassMaturity"
          value={formatPercent(dispositionData.iriPassRates?.maturity)}
        />
        <MetricCard
          metricKey="iriDenominator"
          value={formatNumber(dispositionData.iriPassRates?.denominator)}
        />
      </FunnelSection>

      <FunnelSection
        id="items-presented"
        title="7. Items presented to participants"
        intro="What 'Question Count' means depends on who's counting. Qualtrics counts the question IDs in the survey definition; participants experience each Likert matrix as many separate items."
      >
        <MetricCard
          metricKey="qualtricsQuestionIds"
          value={formatNumber(metricsData.questionCount)}
        />
        <MetricCard metricKey="itemsPresented" value={formatNumber(TOTAL_ITEMS_PRESENTED)} />
      </FunnelSection>
    </section>
  )
}
