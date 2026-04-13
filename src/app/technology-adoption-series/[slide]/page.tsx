import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import { parseSimpleMarkdown, RenderMarkdownNodes } from '@/lib/simple-markdown'
import {
  getTechnologyAdoptionSeriesPrevNext,
  getTechnologyAdoptionSeriesSlides,
} from '@/lib/technology-adoption-series'
import { DualCurveChart } from '@/components/technology-adoption-series/dual-curve-chart'
import { LifecycleTimelineBar } from '@/components/technology-adoption-series/lifecycle-timeline-bar'
import { LIFECYCLE_CONFIGS } from '@/data/lifecycle-timeline-configs'
import TeachingSeriesNavigation from '@/components/teaching-series-navigation'

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

const VisualCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded border border-gray-200 bg-gray-50 p-4" aria-label={title}>
    <h3 className="text-[16px] font-semibold text-gray-900 mb-3">{title}</h3>
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

    // Fallback: attach unknown lines as bullets if possible
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

const SlideVisual = ({ slideNumber }: { slideNumber: number }) => {
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
    return (
      <VisualCard title="Visual">
        <DualCurveChart gradientId="sweetSpotGradSlide" variant="slide" />
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

  // Slides 27-29: Lifecycle timeline bars (HDD, Flash, Barcode)
  const lifecycleCfg = LIFECYCLE_CONFIGS[slideNumber]
  if (lifecycleCfg) {
    return (
      <LifecycleTimelineBar
        title={lifecycleCfg.title}
        phases={lifecycleCfg.phases}
        note={lifecycleCfg.note}
        source={lifecycleCfg.source}
      />
    )
  }

  // Slides without an explicit visual block in the core deck
  return null
}

const splitSections = (markdown: string) => {
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

const SlideMarkdown = ({
  nodes,
  slideNumber,
}: {
  nodes: Parameters<typeof RenderMarkdownNodes>[0]['nodes']
  slideNumber: number
}) => {
  return (
    <RenderMarkdownNodes
      nodes={nodes}
      renderVisual={() => <SlideVisual slideNumber={slideNumber} />}
      renderCodeBlock={(node) => {
        const lang = node.lang.trim().toLowerCase()
        const isPlainText = lang === '' || lang === 'text' || lang === 'plaintext'

        if (isPlainText && isTreeDiagramText(node.code) && slideNumber >= 17) {
          return <TreeDiagram code={node.code} />
        }

        return null
      }}
    />
  )
}

export const dynamic = 'force-static'

const pad2 = (value: number) => String(value).padStart(2, '0')

const legacySegmentsForSlide = (slideNumber: number) => {
  const withoutPad = `slide-${slideNumber}`
  const withPad = `slide-${pad2(slideNumber)}`
  return [withoutPad, withPad]
}

const slideNumberFromSegment = (segment: string) => {
  const match = segment.match(/^slide-(\d{1,2})(?:\b|[-/])/i)
  if (!match) return null
  const number = Number(match[1])
  return Number.isFinite(number) ? number : null
}

type PageProps = {
  params: { slide: string } | Promise<{ slide: string }>
}

export async function generateStaticParams() {
  const slides = await getTechnologyAdoptionSeriesSlides()
  const allSegments = new Set<string>()

  for (const slide of slides) {
    allSegments.add(slide.segment)
    for (const legacy of legacySegmentsForSlide(slide.number)) allSegments.add(legacy)
  }

  return Array.from(allSegments).map((segment) => ({ slide: segment }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slide: segment } = await Promise.resolve(params)

  const slides = await getTechnologyAdoptionSeriesSlides()
  const slideNumber = slideNumberFromSegment(segment)
  const slide =
    slides.find((s) => s.segment === segment) ||
    (slideNumber ? slides.find((s) => s.number === slideNumber) : null)
  if (!slide) return {}

  return {
    title: `Slide ${slide.number}: ${slide.title} - Technology Adoption Teaching Series`,
    description: `Technology Adoption Teaching Series - Slide ${slide.number}: ${slide.title}.`,
  }
}

export default async function TechnologyAdoptionSeriesSlidePage({ params }: PageProps) {
  const { slide: segment } = await Promise.resolve(params)

  const slides = await getTechnologyAdoptionSeriesSlides()
  const slideNumber = slideNumberFromSegment(segment)
  const slide =
    slides.find((s) => s.segment === segment) ||
    (slideNumber ? slides.find((s) => s.number === slideNumber) : null)
  if (!slide) notFound()

  const currentHref = `/technology-adoption-series/${slide.segment}`
  const prevNext = await getTechnologyAdoptionSeriesPrevNext(currentHref)
  const prev = prevNext?.prev ?? null
  const next = prevNext?.next ?? null

  const sections = splitSections(slide.contentMarkdown)
  const contentNodes = parseSimpleMarkdown(sections.content)
  const speakerNodes = sections.speakerNotes ? parseSimpleMarkdown(sections.speakerNotes) : []
  const transitionNodes = sections.transition ? parseSimpleMarkdown(sections.transition) : []

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
          <Link href="/technology-adoption-series" className="text-blue-700 hover:underline">
            Technology Adoption Teaching Series
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span aria-current="page">
            Slide {slide.number}: {slide.title}
          </span>
        </nav>

        <h1 className={H1_CLASSES}>
          Slide {slide.number}: {slide.title}
        </h1>

        <section className="mb-10">
          <SlideMarkdown nodes={contentNodes} slideNumber={slide.number} />
        </section>

        {speakerNodes.length ? (
          <details className="mb-6 rounded border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-900">
              Speaker notes
            </summary>
            <div className="px-4 pb-4">
              <SlideMarkdown nodes={speakerNodes} slideNumber={slide.number} />
            </div>
          </details>
        ) : null}

        {transitionNodes.length ? (
          <details className="mb-10 rounded border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-900">
              Transition
            </summary>
            <div className="px-4 pb-4">
              <SlideMarkdown nodes={transitionNodes} slideNumber={slide.number} />
            </div>
          </details>
        ) : null}

        <nav
          aria-label="Series navigation"
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-6"
        >
          <div className="flex items-center gap-3">
            {prev ? (
              <Link
                href={prev.href}
                className="inline-flex items-center rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                Previous: {prev.title}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded border border-gray-200 px-3 py-2 text-sm text-gray-400">
                Previous
              </span>
            )}

            {next ? (
              <Link
                href={next.href}
                className="inline-flex items-center rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                Next: {next.title}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded border border-gray-200 px-3 py-2 text-sm text-gray-400">
                Next
              </span>
            )}
          </div>

          <Link
            href="/technology-adoption-series"
            className="text-sm text-blue-700 hover:underline"
          >
            Back to series overview
          </Link>
        </nav>

        <TeachingSeriesNavigation className="mt-10" />
      </article>
    </main>
  )
}
