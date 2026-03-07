import type { ReactNode } from 'react'

import { RenderMarkdownNodes } from '@/lib/simple-markdown'

import { LifecycleTimelineBar } from './lifecycle-timeline-bar'
import type { LifecyclePhase } from './lifecycle-timeline-bar'

const IconCheck = ({ title }: { title: string }) => (
  <svg
    aria-label={title}
    role="img"
    viewBox="0 0 20 20"
    className="h-4 w-4 text-green-700"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M16.704 5.29a1 1 0 010 1.415l-7.2 7.2a1 1 0 01-1.414 0l-3.6-3.6a1 1 0 111.414-1.414l2.893 2.893 6.493-6.494a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
)

const IconX = ({ title }: { title: string }) => (
  <svg
    aria-label={title}
    role="img"
    viewBox="0 0 20 20"
    className="h-4 w-4 text-red-700"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
)

const IconWarn = ({ title }: { title: string }) => (
  <svg
    aria-label={title}
    role="img"
    viewBox="0 0 20 20"
    className="h-4 w-4 text-amber-700"
    fill="currentColor"
  >
    <path d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.517 11.59c.75 1.334-.213 2.99-1.743 2.99H3.483c-1.53 0-2.493-1.656-1.743-2.99L8.257 3.1z" />
    <path
      fill="white"
      d="M11 14a1 1 0 11-2 0 1 1 0 012 0zm-.25-7.75a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5z"
    />
  </svg>
)

const VisualCard = ({ title, children }: { title?: string; children: ReactNode }) => (
  <section
    className="rounded border border-gray-200 bg-gray-50 p-4"
    aria-label={title?.trim() ? title : 'Slide visual'}
  >
    {children}
  </section>
)

const Badge = ({ children, tone }: { children: ReactNode; tone: 'good' | 'warn' | 'bad' }) => {
  const className =
    tone === 'good'
      ? 'bg-green-50 text-green-800 border-green-200'
      : tone === 'warn'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-red-50 text-red-800 border-red-200'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs ${className}`}
    >
      {children}
    </span>
  )
}

const AdoptionFrictionBar = ({ value }: { value: number }) => {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <svg
      role="img"
      aria-label={`Adoption friction ${pct}%`}
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
      className="h-2 w-full"
    >
      <rect x="0" y="0" width="100" height="4" rx="2" className="fill-gray-200" />
      <rect x="0" y="0" width={`${pct}`} height="4" rx="2" className="fill-gray-700" />
    </svg>
  )
}

const InlineDiagramCard = ({ children }: { children: ReactNode }) => (
  <div className="rounded border border-gray-200 bg-white p-4">{children}</div>
)

type TreeRow = {
  key: string
  value?: string
  bullets: string[]
}

const isTreeDiagramText = (value: string) => /[├└]─/.test(value)

const toneForLifecycleStage = (stage: string): 'good' | 'warn' | 'bad' => {
  const normalized = stage.trim().toLowerCase()
  if (normalized.includes('mainstream')) return 'good'
  if (normalized.includes('leading')) return 'warn'
  if (normalized.includes('bleeding')) return 'bad'
  if (normalized.includes('trending')) return 'warn'
  if (normalized.includes('end of support')) return 'bad'
  if (normalized.includes('end of life')) return 'bad'
  if (normalized.includes('obsolete')) return 'bad'
  return 'warn'
}

const TreeDiagram = ({ code, label }: { code: string; label?: string }) => {
  const lines = code.split(/\r?\n/)

  const rows: TreeRow[] = []
  let current: TreeRow | null = null

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '')
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed === '│') continue

    const branchMatch = trimmed.match(/^[├└]─\s*(.+?)(?::\s*(.+))?$/)
    if (branchMatch) {
      const key = (branchMatch[1] || '').trim()
      const value = (branchMatch[2] || '').trim() || undefined
      current = { key, value, bullets: [] }
      rows.push(current)
      continue
    }

    const bulletMatch = trimmed.match(/^([│\s]*)•\s+(.+)$/)
    if (bulletMatch && current) {
      current.bullets.push(bulletMatch[2].trim())
      continue
    }

    if (current) {
      current.bullets.push(trimmed)
    } else {
      rows.push({ key: trimmed, bullets: [] })
    }
  }

  const looksLikeLifecycleStages = rows.some((r) =>
    /bleeding edge|leading edge|mainstream|trending behind|end of support|obsolete|end of life/i.test(
      r.key
    )
  )

  return (
    <InlineDiagramCard>
      {label ? <div className="text-sm font-semibold text-gray-900 mb-3">{label}</div> : null}
      <div className="space-y-3">
        {rows.map((row, rowIdx) => (
          <div
            key={`${row.key}-${row.value ?? ''}-${rowIdx}`}
            className="rounded border border-gray-200 bg-gray-50 p-3"
          >
            <div className="flex flex-wrap items-start gap-2">
              {looksLikeLifecycleStages ? (
                <Badge tone={toneForLifecycleStage(row.key)}>{row.key}</Badge>
              ) : (
                <div className="text-sm font-semibold text-gray-900">{row.key}</div>
              )}
              {row.value ? <div className="text-sm text-gray-700">{row.value}</div> : null}
            </div>
            {row.bullets.length ? (
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {row.bullets.map((b, bulletIdx) => (
                  <li key={`${rowIdx}-${bulletIdx}`}>{b}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </InlineDiagramCard>
  )
}

export const TechnologyAdoptionSeriesSlideVisual = ({
  slideNumber,
  description,
}: {
  slideNumber: number
  description?: string
}) => {
  if (slideNumber === 1) {
    const steps = ['Evaluation', 'Selection', 'Integration', 'Deployment', 'Sustained Use']
    return (
      <VisualCard title="Visual">
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900">
                {step}
              </div>
              {idx < steps.length - 1 ? (
                <span className="text-gray-500" aria-hidden="true">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-700">
          <span className="font-semibold">Adoption Success</span> happens when usage is sustained.
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 2) {
    return (
      <VisualCard title="Visual">
        <div className="space-y-3">
          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold text-gray-900">Organizational adoption</div>
            <div className="text-sm text-gray-700">Org deploys and makes technology available</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 rounded border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold text-gray-900">Voluntary user adoption</div>
              <div className="text-sm text-gray-700">Users choose to use it</div>
            </div>
            <div className="flex-1 rounded border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold text-gray-900">Involuntary user adoption</div>
              <div className="text-sm text-gray-700">Users are required to use it</div>
            </div>
          </div>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 3) {
    const rows = [
      { factor: 'User engagement', voluntary: 'High', involuntary: 'Low' },
      {
        factor: 'Training effectiveness',
        voluntary: 'Self-motivated',
        involuntary: 'Forced compliance',
      },
      { factor: 'Innovation/feedback', voluntary: 'Active contribution', involuntary: 'Minimal' },
      {
        factor: 'Sustainability',
        voluntary: 'Self-sustaining',
        involuntary: 'Requires enforcement',
      },
      {
        factor: 'Organizational risk',
        voluntary: 'Lower',
        involuntary: 'Higher (workarounds/resistance)',
      },
    ]

    return (
      <VisualCard title="Visual">
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  Factor
                </th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  Voluntary
                </th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  Involuntary
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.factor} className="bg-white">
                  <td className="border-b border-gray-200 px-3 py-2 font-semibold text-gray-900">
                    {row.factor}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-2 text-gray-800">
                    {row.voluntary}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-2 text-gray-800">
                    {row.involuntary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 4) {
    return (
      <VisualCard title="Visual">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Shelf-ware</div>
              <IconX title="Not adopted" />
            </div>
            <div className="mt-2 text-sm text-gray-700">Deployed, but not used.</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="bad">
                <IconX title="No user input" />
                No user input
              </Badge>
              <Badge tone="bad">
                <IconX title="Too complex" />
                Too complex
              </Badge>
              <Badge tone="bad">
                <IconX title="Workarounds" />
                Workarounds
              </Badge>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Adopted</div>
              <IconCheck title="Adopted" />
            </div>
            <div className="mt-2 text-sm text-gray-700">Used to complete real tasks.</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="good">
                <IconCheck title="User-centered" />
                User-centered
              </Badge>
              <Badge tone="good">
                <IconCheck title="Clear value" />
                Clear value
              </Badge>
              <Badge tone="good">
                <IconCheck title="Fits workflows" />
                Fits workflows
              </Badge>
            </div>
          </div>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 5) {
    return (
      <VisualCard title="Visual">
        <div className="space-y-3">
          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold text-gray-900">Research & Development</div>
            <div className="text-sm text-gray-700">Innovation and exploration</div>
          </div>
          <div className="text-center text-gray-500" aria-hidden="true">
            ↓
          </div>
          <div className="rounded border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm font-semibold text-gray-900">Technology Adoption</div>
            <div className="text-sm text-gray-700">Bridge from innovation to operational use</div>
          </div>
          <div className="text-center text-gray-500" aria-hidden="true">
            ↓
          </div>
          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold text-gray-900">Technology Integration</div>
            <div className="text-sm text-gray-700">Make adopted technologies work together</div>
          </div>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 6) {
    /* Dual-curve lifecycle chart (card-scaled version):
       - Cyan dashed = Innovation Potential (peaks early, declines)
       - Amber solid = Adoption Risk (U-shaped)
       - Shaded zone = Target sweet spot (Leading Edge → Mainstream) */
    const stages = [
      { x: 100, label: 'Bleeding Edge' },
      { x: 190, label: 'Leading Edge' },
      { x: 290, label: 'Mainstream' },
      { x: 390, label: 'Trending Behind' },
      { x: 480, label: 'End of Support' },
    ]
    const innovY = [55, 72, 145, 195, 220]
    const riskY = [60, 120, 205, 150, 65]

    const innovPath = `M${stages[0].x} ${innovY[0]} C${stages[0].x + 35} ${innovY[0]},${stages[1].x - 35} ${innovY[1]},${stages[1].x} ${innovY[1]} C${stages[1].x + 50} ${innovY[1] + 18},${stages[2].x - 50} ${innovY[2]},${stages[2].x} ${innovY[2]} C${stages[2].x + 50} ${innovY[2] + 12},${stages[3].x - 50} ${innovY[3]},${stages[3].x} ${innovY[3]} C${stages[3].x + 40} ${innovY[3] + 10},${stages[4].x - 40} ${innovY[4]},${stages[4].x} ${innovY[4]}`
    const riskPath = `M${stages[0].x} ${riskY[0]} C${stages[0].x + 40} ${riskY[0] + 25},${stages[1].x - 40} ${riskY[1]},${stages[1].x} ${riskY[1]} C${stages[1].x + 50} ${riskY[1] + 35},${stages[2].x - 50} ${riskY[2]},${stages[2].x} ${riskY[2]} C${stages[2].x + 50} ${riskY[2] - 25},${stages[3].x - 50} ${riskY[3]},${stages[3].x} ${riskY[3]} C${stages[3].x + 40} ${riskY[3] - 35},${stages[4].x - 40} ${riskY[4]},${stages[4].x} ${riskY[4]}`

    return (
      <VisualCard title="Visual">
        <div className="overflow-x-auto w-full flex justify-center bg-slate-900 rounded p-4">
          <svg
            viewBox="0 0 560 280"
            className="w-full max-w-full"
            role="img"
            aria-label="Technology lifecycle: innovation potential vs adoption risk showing Leading Edge to Mainstream as target zone"
            style={{ maxHeight: '400px' }}
          >
            <defs>
              <linearGradient id="sweetSpotGradSm" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            {/* Axes */}
            <line x1="60" y1="230" x2="520" y2="230" stroke="#334155" strokeWidth="1" />
            <line x1="60" y1="230" x2="60" y2="25" stroke="#334155" strokeWidth="1" />
            <text x="15" y="25" fontSize="9" fill="#64748b">
              High
            </text>
            <text x="15" y="230" fontSize="9" fill="#64748b">
              Low
            </text>
            {/* Sweet spot zone */}
            <rect
              x={stages[1].x - 12}
              y="35"
              width={stages[2].x - stages[1].x + 24}
              height="190"
              rx="6"
              fill="url(#sweetSpotGradSm)"
              stroke="#22d3ee"
              strokeWidth="0.8"
              strokeDasharray="3 2"
              strokeOpacity="0.4"
            />
            <text
              x={(stages[1].x + stages[2].x) / 2}
              y="46"
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="#22d3ee"
              opacity="0.7"
            >
              TARGET ZONE
            </text>
            {/* Innovation curve (cyan dashed) */}
            <path
              d={innovPath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
            {/* Risk curve (amber solid) */}
            <path d={riskPath} fill="none" stroke="#f59e0b" strokeWidth="2" />
            {/* Stage markers */}
            {stages.map((s, i) => (
              <g key={s.label}>
                <circle
                  cx={s.x}
                  cy={innovY[i]}
                  r="4"
                  fill="#0f172a"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />
                <circle
                  cx={s.x}
                  cy={riskY[i]}
                  r="4"
                  fill="#0f172a"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <text
                  x={s.x}
                  y="245"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#e2e8f0"
                >
                  {s.label}
                </text>
              </g>
            ))}
            {/* Legend */}
            <line
              x1="70"
              y1="268"
              x2="90"
              y2="268"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeDasharray="5 2"
            />
            <text x="94" y="271" fontSize="9" fill="#94a3b8">
              Innovation Potential
            </text>
            <line x1="220" y1="268" x2="240" y2="268" stroke="#f59e0b" strokeWidth="2" />
            <text x="244" y="271" fontSize="9" fill="#94a3b8">
              Adoption Risk
            </text>
            <rect
              x="350"
              y="263"
              width="10"
              height="8"
              rx="1.5"
              fill="#22d3ee"
              fillOpacity="0.15"
              stroke="#22d3ee"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
            <text x="364" y="271" fontSize="9" fill="#94a3b8">
              Sweet Spot
            </text>
          </svg>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 7) {
    const rows = [
      { stage: 'Bleeding edge', risk: 'Very high', tone: 'bad' as const },
      { stage: 'Leading edge', risk: 'High', tone: 'warn' as const },
      { stage: 'Mainstream', risk: 'Low', tone: 'good' as const },
      { stage: 'Trending behind', risk: 'Medium', tone: 'warn' as const },
      { stage: 'End of support or older', risk: 'High', tone: 'bad' as const },
      { stage: 'End of life', risk: 'Very high', tone: 'bad' as const },
    ]

    return (
      <VisualCard title="Visual">
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  Lifecycle stage
                </th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  User adoption risk
                </th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  Typical posture
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.stage} className="bg-white">
                  <td className="border-b border-gray-200 px-3 py-2 font-semibold text-gray-900">
                    {row.stage}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-2">
                    <Badge tone={row.tone}>{row.risk}</Badge>
                  </td>
                  <td className="border-b border-gray-200 px-3 py-2 text-gray-800">
                    {row.stage === 'Mainstream'
                      ? 'Best practices, predictable outcomes'
                      : row.stage === 'Leading edge'
                        ? 'Modern patterns, innovation room'
                        : row.stage === 'Trending behind'
                          ? 'Modernization planning, migration paths'
                          : 'R&D only or forced migration'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 8) {
    return (
      <VisualCard title="Visual">
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 520 260"
            role="img"
            aria-label="Target zone for leading edge to mainstream"
            className="w-full"
          >
            <rect x="0" y="0" width="520" height="260" fill="white" />
            <rect x="30" y="30" width="460" height="200" rx="16" fill="#F9FAFB" stroke="#D1D5DB" />
            <rect x="90" y="70" width="340" height="140" rx="16" fill="#EFF6FF" stroke="#BFDBFE" />
            <rect x="170" y="105" width="180" height="70" rx="14" fill="#FFFFFF" stroke="#93C5FD" />
            <text x="45" y="55" fontSize="12" fill="#6B7280">
              Bleeding edge (monitor)
            </text>
            <text x="105" y="95" fontSize="12" fill="#1F2937">
              Leading edge (target)
            </text>
            <text x="185" y="145" fontSize="12" fill="#1F2937">
              Mainstream (target)
            </text>
            <text x="105" y="205" fontSize="12" fill="#6B7280">
              Trending behind (cloud enabling)
            </text>
          </svg>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 9) {
    const cols = [
      {
        title: 'Cloud enabling',
        friction: 35,
        notes: ['Refactoring', 'Containerization', 'API wrapping'],
      },
      {
        title: 'Cloud native',
        friction: 75,
        notes: ['Microservices', '12-factor apps', 'Kubernetes patterns'],
      },
      {
        title: 'Cloud agnostic',
        friction: 40,
        notes: ['Portability', 'Abstraction', 'Multi-platform IaC'],
      },
    ]

    return (
      <VisualCard title="Visual">
        <div className="grid gap-3 md:grid-cols-3">
          {cols.map((col) => (
            <div key={col.title} className="rounded border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold text-gray-900">{col.title}</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {col.notes.map((n, idx) => (
                  <li key={`${col.title}-${idx}`}>{n}</li>
                ))}
              </ul>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Adoption friction</span>
                  <span>{col.friction}%</span>
                </div>
                <AdoptionFrictionBar value={col.friction} />
              </div>
            </div>
          ))}
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 10) {
    const cells: Array<{
      stage: string
      enabling: 'good' | 'warn' | 'bad'
      native: 'good' | 'warn' | 'bad'
      agnostic: 'good' | 'warn' | 'bad'
    }> = [
      { stage: 'Bleeding edge', enabling: 'bad', native: 'warn', agnostic: 'bad' },
      { stage: 'Leading edge', enabling: 'warn', native: 'good', agnostic: 'warn' },
      { stage: 'Mainstream', enabling: 'good', native: 'good', agnostic: 'good' },
      { stage: 'Trending behind', enabling: 'good', native: 'bad', agnostic: 'warn' },
      { stage: 'End of support', enabling: 'warn', native: 'bad', agnostic: 'warn' },
    ]

    const iconFor = (tone: 'good' | 'warn' | 'bad') =>
      tone === 'good' ? (
        <IconCheck title="Ideal" />
      ) : tone === 'warn' ? (
        <IconWarn title="Caution" />
      ) : (
        <IconX title="Avoid" />
      )

    const cellClass = (tone: 'good' | 'warn' | 'bad') =>
      tone === 'good' ? 'bg-green-50' : tone === 'warn' ? 'bg-amber-50' : 'bg-red-50'

    return (
      <VisualCard title="Visual">
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  Lifecycle stage
                </th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  Cloud enabling
                </th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  Cloud native
                </th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  Cloud agnostic
                </th>
              </tr>
            </thead>
            <tbody>
              {cells.map((row) => (
                <tr key={row.stage}>
                  <td className="border-b border-gray-200 px-3 py-2 font-semibold text-gray-900">
                    {row.stage}
                  </td>
                  {(
                    [
                      { key: 'enabling', tone: row.enabling },
                      { key: 'native', tone: row.native },
                      { key: 'agnostic', tone: row.agnostic },
                    ] as const
                  ).map((c) => (
                    <td
                      key={c.key}
                      className={`border-b border-gray-200 px-3 py-2 ${cellClass(c.tone)}`}
                    >
                      <div className="flex items-center gap-2">
                        {iconFor(c.tone)}
                        <span className="text-gray-800">
                          {c.tone === 'good' ? 'Ideal' : c.tone === 'warn' ? 'Caution' : 'Avoid'}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 11) {
    return (
      <VisualCard title="Visual">
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 640 260"
            role="img"
            aria-label="Lifecycle loop with continuous user input"
            className="w-full"
          >
            <rect x="0" y="0" width="640" height="260" fill="white" />
            {[
              { x: 90, y: 40, label: 'Design' },
              { x: 410, y: 40, label: 'Develop' },
              { x: 410, y: 160, label: 'Deploy' },
              { x: 90, y: 160, label: 'Sustain' },
            ].map((n) => (
              <g key={n.label}>
                <rect
                  x={n.x}
                  y={n.y}
                  width="140"
                  height="60"
                  rx="12"
                  fill="#F9FAFB"
                  stroke="#D1D5DB"
                />
                <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fontSize="14" fill="#111827">
                  {n.label}
                </text>
              </g>
            ))}
            <circle cx="320" cy="130" r="52" fill="#EFF6FF" stroke="#BFDBFE" />
            <text x="320" y="120" textAnchor="middle" fontSize="12" fill="#111827">
              User input
            </text>
            <text x="320" y="140" textAnchor="middle" fontSize="12" fill="#111827">
              + lifecycle
            </text>
            <text x="320" y="160" textAnchor="middle" fontSize="12" fill="#111827">
              awareness
            </text>

            <path
              d="M230 70 C 300 70, 340 70, 410 70"
              stroke="#6B7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow)"
            />
            <path
              d="M480 100 C 480 130, 480 150, 480 160"
              stroke="#6B7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow)"
            />
            <path
              d="M410 190 C 340 190, 300 190, 230 190"
              stroke="#6B7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow)"
            />
            <path
              d="M160 160 C 160 140, 160 120, 160 100"
              stroke="#6B7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow)"
            />

            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#6B7280" />
              </marker>
            </defs>
          </svg>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 12) {
    const stages = [
      'Adoption need',
      'Lifecycle position',
      'Architecture approach',
      'Development decisions',
    ]
    return (
      <VisualCard title="Visual">
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900">
                {s}
              </div>
              {idx < stages.length - 1 ? (
                <span className="text-gray-500" aria-hidden="true">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {['Kubernetes', 'Microservices', 'Observability'].map((item) => (
            <div
              key={item}
              className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
            >
              {item}
            </div>
          ))}
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 13) {
    const cards = [
      {
        title: 'Graceful degradation & rapid recovery',
        body: 'Users trust the system because it fails safely and recovers quickly.',
      },
      {
        title: 'Scalable deployment',
        body: 'Deploy where users operate, reducing infrastructure friction.',
      },
      {
        title: 'Resilient operations',
        body: 'Works in degraded conditions so users don’t need workarounds.',
      },
    ]

    return (
      <VisualCard title="Visual">
        <div className="grid gap-3 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="rounded border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold text-gray-900">{c.title}</div>
              <div className="mt-2 text-sm text-gray-700">{c.body}</div>
            </div>
          ))}
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 14) {
    const success = [
      { label: 'Active usage rate', value: 'High' },
      { label: 'Task completion (vs workarounds)', value: 'Rising' },
      { label: 'User satisfaction', value: 'Positive' },
    ]

    const warning = [
      { label: 'Availability vs usage', value: 'High / Low' },
      { label: 'Workarounds / shadow IT', value: 'Increasing' },
      { label: 'Help desk tickets', value: 'Constant basics' },
    ]

    const Metric = ({
      tone,
      label,
      value,
    }: {
      tone: 'good' | 'bad'
      label: string
      value: string
    }) => (
      <div className="rounded border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${tone === 'good' ? 'bg-green-600' : 'bg-red-600'}`}
            aria-hidden="true"
          />
          <div className="text-sm font-semibold text-gray-900">{label}</div>
        </div>
        <div className="mt-1 text-sm text-gray-700">{value}</div>
      </div>
    )

    return (
      <VisualCard title="Visual">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-2">Success signals</div>
            <div className="space-y-2">
              {success.map((m) => (
                <Metric key={m.label} tone="good" label={m.label} value={m.value} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-2">Warning signals</div>
            <div className="space-y-2">
              {warning.map((m) => (
                <Metric key={m.label} tone="bad" label={m.label} value={m.value} />
              ))}
            </div>
          </div>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 15) {
    const phases = [
      'Design with representative users',
      'Develop with frequent user testing',
      'Pilot with early adopters',
      'Expand as demand grows (voluntary)',
      'Scaled adoption (self-sustaining)',
    ]

    return (
      <VisualCard title="Visual">
        <ol className="border-l border-gray-200 pl-4 space-y-3">
          {phases.map((p, idx) => (
            <li key={idx} className="relative">
              <span
                className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border border-gray-300 bg-white"
                aria-hidden="true"
              />
              <div className="text-sm font-semibold text-gray-900">Phase {idx + 1}</div>
              <div className="text-sm text-gray-700">{p}</div>
            </li>
          ))}
        </ol>
      </VisualCard>
    )
  }

  if (slideNumber === 16) {
    const items = [
      'Right lifecycle stage',
      'Architecture for adoption',
      'Design with users',
      'Demonstrate immediate value',
      'Minimize behavior change',
      'Phased rollout with champions',
      'Plan the full lifecycle',
      'Avoid involuntary adoption',
      'Measure what matters',
      'Remember: shelf-ware helps nobody',
    ]

    return (
      <VisualCard title="Visual">
        <ol className="grid gap-2 sm:grid-cols-2">
          {items.map((item, idx) => (
            <li key={idx} className="rounded border border-gray-200 bg-white p-3">
              <div className="flex items-start gap-2">
                <span
                  className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-700"
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-gray-900">{item}</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-3 text-sm text-gray-700">
          <span className="font-semibold">Lifecycle awareness</span> should be threaded through
          every step.
        </div>
      </VisualCard>
    )
  }

  // Optional deep-dive slides: add lightweight visuals so the deck remains business + engineering oriented.
  if (slideNumber === 17) {
    return (
      <VisualCard title="Visual">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold text-gray-900">Q&A</div>
            <div className="mt-2 text-sm text-gray-700">
              Capture questions, then route deeper topics to optional slides.
            </div>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold text-gray-900">Deep dives</div>
            <div className="mt-2 text-sm text-gray-700">
              Lifecycle examples, platforms, selection, anti-patterns, legacy, AI/ML.
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Focus on decisions, trade-offs, and adoption risk reduction.
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 19) {
    const groups = [
      { title: 'Public cloud', items: ['AWS', 'Azure', 'GCP'] },
      { title: 'Private/on-prem', items: ['VMware', 'OpenStack', 'Nutanix'] },
      { title: 'Containers', items: ['Kubernetes', 'Managed K8s', 'Edge distros'] },
      { title: 'Multi-cloud mgmt', items: ['Control planes', 'Orchestration', 'Multi-cluster'] },
    ]

    return (
      <VisualCard title="Visual">
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title} className="rounded border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold text-gray-900">{g.title}</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 20) {
    const tiles = [
      { title: 'Open source (FOSS)', note: 'Fast ecosystem, lower lock-in' },
      { title: 'Enterprise / gov', note: 'Compliance + constraints' },
      { title: 'COTS', note: 'Vendor support + SLAs' },
      { title: 'Custom', note: 'Unique capability, internal lifecycle' },
    ]

    return (
      <VisualCard title="Visual">
        <div className="grid gap-3 sm:grid-cols-2">
          {tiles.map((t) => (
            <div key={t.title} className="rounded border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold text-gray-900">{t.title}</div>
              <div className="mt-2 text-sm text-gray-700">{t.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Evaluate lifecycle + adoption implications, not just features.
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 21) {
    const avoid = [
      'Big bang deployment',
      'Mandates as strategy',
      'No user input',
      'Ignore lifecycle',
    ]
    const doInstead = [
      'Pilot + iterate',
      'Build value proposition',
      'Design with users',
      'Plan modernization',
    ]

    return (
      <VisualCard title="Visual">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <IconX title="Avoid" />
              <div className="text-sm font-semibold text-gray-900">Avoid</div>
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
              {avoid.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <IconCheck title="Do instead" />
              <div className="text-sm font-semibold text-gray-900">Do instead</div>
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
              {doInstead.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 23) {
    const steps = [
      { title: 'Immediate', hint: 'Triage + isolate + audit' },
      { title: 'Short-term', hint: 'Document risk + plan response' },
      { title: 'Medium-term', hint: 'Select replacement + migrate' },
      { title: 'Long-term', hint: 'Decommission + monitor lifecycle' },
    ]
    return (
      <VisualCard title="Visual">
        <div className="grid gap-3 sm:grid-cols-2">
          {steps.map((s, idx) => (
            <div key={s.title} className="rounded border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                <div className="text-xs text-gray-500" aria-hidden="true">
                  Step {idx + 1}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">{s.hint}</div>
            </div>
          ))}
        </div>
      </VisualCard>
    )
  }

  if (slideNumber === 24) {
    const stages = [
      { title: 'Bleeding edge', value: 90 },
      { title: 'Leading edge', value: 55 },
      { title: 'Mainstream', value: 30 },
      { title: 'Trending behind', value: 65 },
    ]

    return (
      <VisualCard title="Visual">
        <div className="space-y-3">
          {stages.map((stage) => (
            <div key={stage.title} className="rounded border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-gray-900">{stage.title}</div>
                <div className="text-xs text-gray-500">Adoption friction</div>
              </div>
              <div className="mt-2">
                <AdoptionFrictionBar value={stage.value} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Adoption depends on trust, explainability, and governance—not just model accuracy.
        </div>
      </VisualCard>
    )
  }

  // ── Lifecycle timeline charts (slides 27-29) ──────────────
  if (slideNumber === 27 || slideNumber === 28 || slideNumber === 29) {
    const configs: Record<
      number,
      { title: string; phases: LifecyclePhase[]; note: string; source: string }
    > = {
      27: {
        title: 'Hardware: Hard Disk Drives (HDDs)',
        phases: [
          { label: 'Bleeding Edge', years: '1956–1970', duration: 14, color: '#fbbf24' },
          { label: 'Leading Edge', years: '1970–1985', duration: 15, color: '#22d3ee' },
          { label: 'Mainstream', years: '1985–2015', duration: 30, color: '#22c55e' },
          { label: 'Trending Behind', years: '2015–2028', duration: 13, color: '#f97316' },
          {
            label: 'End of Support',
            years: '2028+',
            duration: 5,
            color: '#ef4444',
            textColor: '#fff',
          },
        ],
        note: 'Long mainstream (30 yrs) creates right-skewed curve',
        source: 'Computer History Museum (2024); IDC HDD Forecast (2024)',
      },
      28: {
        title: 'Software: Adobe Flash',
        phases: [
          { label: 'Bleeding Edge', years: '1996–2000', duration: 4, color: '#fbbf24' },
          { label: 'Leading Edge', years: '2000–2005', duration: 5, color: '#22d3ee' },
          { label: 'Mainstream', years: '2005–2012', duration: 7, color: '#22c55e' },
          { label: 'Trending Behind', years: '2012–2017', duration: 5, color: '#f97316' },
          {
            label: 'End of Support',
            years: '2017–2020',
            duration: 3,
            color: '#ef4444',
            textColor: '#fff',
          },
          {
            label: 'EOL',
            years: '2020–21',
            duration: 1,
            color: '#991b1b',
            textColor: '#fff',
          },
        ],
        note: 'Compressed EOL (1 yr) after HTML5 displaced it',
        source: 'Adobe Flash EOL Page (2020); W3Techs (2023)',
      },
      29: {
        title: 'Supply Chain: Barcode / UPC Systems',
        phases: [
          { label: 'Bleeding Edge', years: '1952–1974', duration: 22, color: '#fbbf24' },
          { label: 'Leading Edge', years: '1974–1985', duration: 11, color: '#22d3ee' },
          { label: 'Mainstream', years: '1985–2020', duration: 35, color: '#22c55e' },
          { label: 'Trending Behind', years: '2020–2030', duration: 10, color: '#f97316' },
          {
            label: 'End of Support',
            years: '2030+',
            duration: 5,
            color: '#ef4444',
            textColor: '#fff',
          },
        ],
        note: 'Extremely long bleeding edge (22 yrs) — infrastructure lag',
        source: 'GS1 Barcode History (2024); McKinsey Supply Chain 4.0 (2024)',
      },
    }

    const cfg = configs[slideNumber]
    if (cfg) {
      return (
        <VisualCard title={cfg.title}>
          <LifecycleTimelineBar
            title={cfg.title}
            phases={cfg.phases}
            note={cfg.note}
            source={cfg.source}
          />
        </VisualCard>
      )
    }
  }

  if (description?.trim()) {
    return (
      <VisualCard title={description}>
        <div className="text-sm text-gray-700">{description}</div>
      </VisualCard>
    )
  }

  return null
}

export const splitTechnologyAdoptionSeriesSlideSections = (markdown: string) => {
  const lines = markdown.split(/\r?\n/)
  const content: string[] = []
  const speakerNotes: string[] = []
  const transition: string[] = []

  let section: 'content' | 'speaker' | 'transition' = 'content'

  for (const line of lines) {
    const trimmed = line.trim()

    if (/^\*\*Content\*\*\s*$/i.test(trimmed) || /^\*\*Content:\*\*\s*$/i.test(trimmed)) {
      section = 'content'
      continue
    }

    if (
      /^\*\*Speaker Notes\*\*\s*$/i.test(trimmed) ||
      /^\*\*Speaker Notes:\*\*\s*$/i.test(trimmed)
    ) {
      section = 'speaker'
      continue
    }

    if (/^\*\*Transition\*\*\s*$/i.test(trimmed) || /^\*\*Transition:\*\*\s*$/i.test(trimmed)) {
      section = 'transition'
      continue
    }

    if (section === 'content') content.push(line)
    if (section === 'speaker') speakerNotes.push(line)
    if (section === 'transition') transition.push(line)
  }

  const joinAndTrim = (value: string[]) => value.join('\n').trim()

  return {
    content: joinAndTrim(content),
    speakerNotes: joinAndTrim(speakerNotes) || null,
    transition: joinAndTrim(transition) || null,
  }
}

export const TechnologyAdoptionSeriesSlideMarkdown = ({
  nodes,
  slideNumber,
  variant,
}: {
  nodes: Parameters<typeof RenderMarkdownNodes>[0]['nodes']
  slideNumber: number
  variant?: Parameters<typeof RenderMarkdownNodes>[0]['variant']
}) => {
  return (
    <RenderMarkdownNodes
      nodes={nodes}
      renderVisual={(description) => (
        <TechnologyAdoptionSeriesSlideVisual slideNumber={slideNumber} description={description} />
      )}
      renderCodeBlock={(node) => {
        const lang = node.lang.trim().toLowerCase()
        const isPlainText = lang === '' || lang === 'text' || lang === 'plaintext'

        if (isPlainText && isTreeDiagramText(node.code) && slideNumber >= 17) {
          return <TreeDiagram code={node.code} />
        }

        return null
      }}
      variant={variant}
    />
  )
}
