import metricsData from '@/data/qualtrics-metrics.json'

type QualtricsMetrics = typeof metricsData

function formatMetricName(metric: string): string {
  return metric.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function QualtricsSurveyStats() {
  const metrics = metricsData.metrics
  const maxValue = Math.max(1, ...metrics.map((m) => m.value))

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Survey stats</h2>
        <p className="mt-2 text-slate-700">
          Source: Qualtrics API (cached via GitHub Actions). Last updated{' '}
          <span className="font-medium">{metricsData.collectedAt}</span>.
        </p>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Survey</div>
          <div className="mt-1 flex flex-col gap-1">
            <div className="text-lg font-semibold text-slate-900">{metricsData.survey.name}</div>
            <div className="text-sm text-slate-700">
              <span className="font-medium">Survey ID:</span> {metricsData.survey.id}
            </div>
            <div className="text-sm text-slate-700">
              <span className="font-medium">Org:</span> {metricsData.survey.organizationId}
            </div>
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h3 className="text-xl font-semibold text-slate-900">Response counts</h3>
          <div className="text-sm text-slate-600">Max: {maxValue.toLocaleString()}</div>
        </div>

        <div className="space-y-4">
          {metrics.map((m) => {
            return (
              <div key={m.metric} className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-3">
                  <div className="text-sm font-medium text-slate-900">
                    {formatMetricName(m.metric)}
                  </div>
                  <div className="text-xs text-slate-600">{m.metric}</div>
                </div>

                <div className="col-span-12 sm:col-span-7">
                  <progress
                    className="h-3 w-full overflow-hidden rounded-full"
                    value={m.value}
                    max={maxValue}
                    aria-label={`${formatMetricName(m.metric)} count`}
                  />
                </div>

                <div className="col-span-12 sm:col-span-2 text-right text-sm font-semibold text-slate-900">
                  {m.value.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-sm text-slate-700">
          Note: Qualtrics exposes multiple count types (for example,{' '}
          <span className="font-medium">auditable</span>,{' '}
          <span className="font-medium">generated</span>,{' '}
          <span className="font-medium">deleted</span>). We chart each type as its own metric.
        </p>
      </div>
    </section>
  )
}
