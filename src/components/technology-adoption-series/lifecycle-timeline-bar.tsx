export interface LifecyclePhase {
  label: string
  years: string
  duration: number
  color: string
  textColor?: string
}

export interface LifecycleTimelineBarProps {
  title: string
  phases: LifecyclePhase[]
  note: string
  source: string
}

/**
 * Compact horizontal bar chart showing lifecycle phases with proportional widths.
 * Used in slide overview cards and teaching-series visuals.
 */
export function LifecycleTimelineBar({ title, phases, note, source }: LifecycleTimelineBarProps) {
  const totalDuration = phases.reduce((s, p) => s + p.duration, 0)
  const ariaPhases = phases.map((p) => `${p.label}: ${p.duration} years (${p.years})`).join(', ')

  if (totalDuration === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <div
        role="img"
        aria-roledescription="chart"
        aria-label={`${title}: ${ariaPhases}`}
        className="flex w-full overflow-hidden rounded"
      >
        {phases.map((p) => {
          const widthPct = (p.duration / totalDuration) * 100
          return (
            <div
              key={p.label}
              style={{
                width: `${widthPct}%`,
                backgroundColor: p.color,
                color: p.textColor ?? '#111827',
              }}
              className="flex flex-col items-center justify-center py-3 px-1 text-center"
              title={`${p.label}: ${p.duration} years (${p.years})`}
            >
              <div className="text-xs font-bold leading-tight">{p.label}</div>
              <div className="text-xs">{p.duration}yr</div>
            </div>
          )
        })}
      </div>
      <div className="flex w-full text-xs text-gray-500">
        {phases.map((p) => {
          const widthPct = (p.duration / totalDuration) * 100
          return (
            <div key={p.label} style={{ width: `${widthPct}%` }} className="text-center">
              {p.years}
            </div>
          )
        })}
      </div>
      <div className="text-xs font-medium text-amber-700">{note}</div>
      <div className="text-xs text-gray-500 italic">{source}</div>
    </div>
  )
}
