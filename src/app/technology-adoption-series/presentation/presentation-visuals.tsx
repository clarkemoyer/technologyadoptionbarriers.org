import React, { type ReactNode } from 'react'

import { LIFECYCLE_CONFIGS } from '@/data/lifecycle-timeline-configs'
import { MOMENT_IN_TIME_CONFIGS } from '@/data/moment-in-time-configs'

/* ────────────────────────────────────────────────────────────
   Dark-native visual components for the fullscreen presenter.
   These are ONLY used by the presentation route - the landing
   page continues to use the light-themed visuals in
   src/components/technology-adoption-series/slide-render.tsx.
   ──────────────────────────────────────────────────────────── */

// ── Shared primitives ──────────────────────────────────────

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 ${className}`}>
    {children}
  </div>
)

const TABLE_WRAPPER_CLASS =
  'w-full max-w-5xl overflow-hidden rounded-xl border border-slate-500/80 bg-slate-900/85 shadow-[0_0_0_1px_rgba(100,116,139,0.3)]'
const TABLE_HEAD_ROW_CLASS = 'bg-slate-700/95'
const TABLE_INDEX_EVEN_ROW_CLASS = 'bg-slate-800/80'
const TABLE_INDEX_ODD_ROW_CLASS = 'bg-slate-900/65'

const CardLabel = ({ children }: { children: ReactNode }) => (
  <div className="text-lg font-bold text-white">{children}</div>
)

const CardBody = ({ children }: { children: ReactNode }) => (
  <div className="mt-2 text-base leading-relaxed text-slate-300">{children}</div>
)

const Badge = ({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'good' | 'warn' | 'bad' | 'info'
}) => {
  const cls =
    tone === 'good'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : tone === 'warn'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        : tone === 'bad'
          ? 'bg-red-500/20 text-red-300 border-red-500/30'
          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-semibold ${cls}`}
    >
      {children}
    </span>
  )
}

const FrictionBar = ({ value, label }: { value: number; label?: string }) => {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="space-y-1">
      {label ? (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      ) : null}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const Arrow = () => (
  <span className="text-2xl text-cyan-400/70" aria-hidden="true">
    →
  </span>
)

const DownArrow = () => (
  <div className="flex justify-center text-2xl text-cyan-400/50" aria-hidden="true">
    ↓
  </div>
)

const IconCheck = () => (
  <svg
    viewBox="0 0 20 20"
    className="h-5 w-5 text-emerald-400"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.704 5.29a1 1 0 010 1.415l-7.2 7.2a1 1 0 01-1.414 0l-3.6-3.6a1 1 0 111.414-1.414l2.893 2.893 6.493-6.494a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
)

const IconX = () => (
  <svg viewBox="0 0 20 20" className="h-5 w-5 text-red-400" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
)

const IconWarn = () => (
  <svg
    viewBox="0 0 20 20"
    className="h-5 w-5 text-amber-400"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.517 11.59c.75 1.334-.213 2.99-1.743 2.99H3.483c-1.53 0-2.493-1.656-1.743-2.99L8.257 3.1z" />
    <path
      fill="#1e293b"
      d="M11 14a1 1 0 11-2 0 1 1 0 012 0zm-.25-7.75a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5z"
    />
  </svg>
)

// ── PART 1: DEFINITIONS & FRAMEWORK (Slides 1-4) ─────────────────────

function Visual01_AdoptionProcessFlow() {
  const steps = ['Evaluation', 'Selection', 'Integration', 'Deployment', 'Sustained Use']
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {steps.map((step, idx) => (
          <div key={step} className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-500/30 bg-slate-800/80 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-500/5">
              {step}
            </div>
            {idx < steps.length - 1 ? <Arrow /> : null}
          </div>
        ))}
      </div>
      <div className="text-center text-lg text-slate-300">
        <span className="font-bold text-cyan-400">Adoption Success</span> happens when usage is
        sustained.
      </div>
    </div>
  )
}

function Visual02_FrameworkLayers() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <Card className="w-full max-w-xl border-cyan-500/30 text-center">
        <CardLabel>Organizational Adoption</CardLabel>
        <CardBody>Organization deploys and makes technology available</CardBody>
      </Card>
      <DownArrow />
      <div className="grid w-full max-w-xl grid-cols-2 gap-4">
        <Card className="text-center">
          <CardLabel>Voluntary</CardLabel>
          <CardBody>Users choose to use it</CardBody>
        </Card>
        <Card className="text-center">
          <CardLabel>Involuntary</CardLabel>
          <CardBody>Users are required to use it</CardBody>
        </Card>
      </div>
    </div>
  )
}

function Visual03_VoluntaryVsInvoluntaryTable() {
  const rows = [
    { factor: 'User Engagement', vol: 'High', invol: 'Low' },
    { factor: 'Training Effectiveness', vol: 'Self-motivated', invol: 'Forced compliance' },
    { factor: 'Innovation / Feedback', vol: 'Active contribution', invol: 'Minimal' },
    { factor: 'Sustainability', vol: 'Self-sustaining', invol: 'Requires enforcement' },
    { factor: 'Organizational Risk', vol: 'Lower', invol: 'Higher (workarounds)' },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className={TABLE_WRAPPER_CLASS}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className={TABLE_HEAD_ROW_CLASS}>
              <th className="px-5 py-4 text-base font-bold text-slate-300">Factor</th>
              <th className="px-5 py-4 text-base font-bold text-emerald-400">Voluntary ✅</th>
              <th className="px-5 py-4 text-base font-bold text-amber-400">Involuntary ⚠️</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.factor}
                className={i % 2 === 0 ? TABLE_INDEX_EVEN_ROW_CLASS : TABLE_INDEX_ODD_ROW_CLASS}
              >
                <td className="px-5 py-3.5 text-base font-semibold text-white">{r.factor}</td>
                <td className="px-5 py-3.5 text-base text-slate-200">{r.vol}</td>
                <td className="px-5 py-3.5 text-base text-slate-200">{r.invol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Visual04_ShelfwareVsAdoptedComparison() {
  return (
    <div className="flex h-full items-stretch justify-center">
      <div className="grid h-full w-full max-w-6xl grid-cols-2 gap-8">
        <Card className="flex h-full flex-col justify-between border-cyan-500/25 p-6">
          <div>
            <div className="text-sm font-semibold tracking-wider uppercase text-cyan-300/80">
              Adoption Outcome
            </div>
            <div className="mt-3 text-3xl font-bold leading-tight text-white">
              Deployment does not equal adoption
            </div>
            <div className="mt-4 text-lg leading-relaxed text-slate-300">
              The same rollout can fail or succeed depending on whether users see clear value, can
              work naturally, and choose to keep using the tool.
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span className="font-semibold text-red-300">Shelf-ware Risk</span>
                <span>85%</span>
              </div>
              <FrictionBar value={85} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span className="font-semibold text-emerald-300">Adoption Fit</span>
                <span>80%</span>
              </div>
              <FrictionBar value={80} />
            </div>
            <div className="rounded-lg border border-slate-600/60 bg-slate-900/60 px-4 py-3 text-base text-slate-200">
              Optimize for{' '}
              <span className="font-semibold text-white">real user task completion</span>, not just
              technical deployment milestones.
            </div>
          </div>
        </Card>

        <div className="grid h-full grid-rows-2 gap-6">
          <Card className="flex h-full flex-col justify-between border-red-500/30 p-6">
            <div>
              <div className="flex items-center gap-3">
                <IconX />
                <CardLabel>Shelf-ware</CardLabel>
              </div>
              <CardBody>Deployed, but not used for mission work.</CardBody>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="bad">No user input</Badge>
              <Badge tone="bad">Too complex</Badge>
              <Badge tone="bad">Workarounds</Badge>
            </div>
          </Card>

          <Card className="flex h-full flex-col justify-between border-emerald-500/30 p-6">
            <div>
              <div className="flex items-center gap-3">
                <IconCheck />
                <CardLabel>Adopted</CardLabel>
              </div>
              <CardBody>Used consistently to complete real tasks.</CardBody>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="good">User-centered</Badge>
              <Badge tone="good">Clear value</Badge>
              <Badge tone="good">Fits workflows</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── PART 2: STRATEGY & LIFECYCLE (Slides 5-8) ────────────────────────

function Visual05_StrategicAdoptionPillars({ mode }: { mode?: 'hd' | '4k' }) {
  const pillars = [
    { title: 'Research & Development', desc: 'Innovation and exploration', accent: false },
    {
      title: 'Technology Adoption',
      desc: 'Bridge from innovation to operational use',
      accent: true,
    },
    {
      title: 'Technology Integration',
      desc: 'Make adopted technologies work together',
      accent: false,
    },
  ]
  const is4k = mode === '4k'

  return (
    <div
      className={`flex h-full items-center justify-center gap-4 ${is4k ? 'flex-row gap-12' : 'flex-col'}`}
    >
      {pillars.map((p, i) => (
        <React.Fragment key={p.title}>
          <div className={`${is4k ? 'flex-1 h-full max-h-[600px] flex items-stretch' : 'w-full'}`}>
            <Card
              className={`${is4k ? 'w-full h-full flex flex-col justify-center gap-8 border-4 p-12' : 'w-full max-w-xl'} text-center ${p.accent ? 'border-cyan-500/40 bg-cyan-950/30' : ''}`}
            >
              <CardLabel>{p.title}</CardLabel>
              <CardBody>{p.desc}</CardBody>
            </Card>
          </div>
          {i < pillars.length - 1 ? (
            is4k ? (
              <div className="flex items-center text-slate-500 text-6xl">→</div>
            ) : (
              <DownArrow />
            )
          ) : null}
        </React.Fragment>
      ))}
    </div>
  )
}

function Visual06_TechnologyLifecyclePositioningDiagram({ mode }: { mode?: 'hd' | '4k' }) {
  /* Dual-curve lifecycle chart:
     - Cyan dashed = Innovation Potential (peaks early, declines)
     - Amber solid = Adoption Risk (U-shaped: high at both extremes, lowest at Mainstream)
     - Cyan shaded zone = Target "sweet spot" (Leading Edge → Mainstream)
     Data validated against Slide 7 risk table:
       Bleeding Edge=Very High, Leading=High, Mainstream=Low,
       Trending Behind=Medium, End of Support=High–Very High */
  const stages = [
    { x: 120, label: 'Bleeding Edge', sub: 'Experimental' },
    { x: 230, label: 'Leading Edge', sub: 'Proven concepts' },
    { x: 350, label: 'Mainstream', sub: 'Stable & adopted' },
    { x: 470, label: 'Trending Behind', sub: 'Declining' },
    { x: 580, label: 'End of Support', sub: 'Migrate' },
  ]
  // Innovation curve (peaks early, declines) - Y values in SVG coords (lower Y = higher value)
  const innovY = [55, 75, 155, 215, 240]
  // Risk curve (U-shaped) - Y values (lower Y = higher risk)
  const riskY = [60, 130, 225, 160, 70]

  const innovPath = `M${stages[0].x} ${innovY[0]} C${stages[0].x + 40} ${innovY[0]},${stages[1].x - 40} ${innovY[1]},${stages[1].x} ${innovY[1]} C${stages[1].x + 60} ${innovY[1] + 20},${stages[2].x - 60} ${innovY[2]},${stages[2].x} ${innovY[2]} C${stages[2].x + 60} ${innovY[2] + 15},${stages[3].x - 60} ${innovY[3]},${stages[3].x} ${innovY[3]} C${stages[3].x + 50} ${innovY[3] + 10},${stages[4].x - 50} ${innovY[4]},${stages[4].x} ${innovY[4]}`
  const riskPath = `M${stages[0].x} ${riskY[0]} C${stages[0].x + 50} ${riskY[0] + 30},${stages[1].x - 50} ${riskY[1]},${stages[1].x} ${riskY[1]} C${stages[1].x + 60} ${riskY[1] + 40},${stages[2].x - 60} ${riskY[2]},${stages[2].x} ${riskY[2]} C${stages[2].x + 60} ${riskY[2] - 30},${stages[3].x - 60} ${riskY[3]},${stages[3].x} ${riskY[3]} C${stages[3].x + 50} ${riskY[3] - 40},${stages[4].x - 50} ${riskY[4]},${stages[4].x} ${riskY[4]}`

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <svg
        viewBox="0 0 700 310"
        className="w-full max-w-4xl"
        role="img"
        aria-label="Technology lifecycle: innovation potential vs adoption risk showing Leading Edge to Mainstream as target zone"
      >
        <defs>
          <linearGradient id="sweetSpotGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {/* Axes */}
        <line x1="70" y1="255" x2="630" y2="255" stroke="#334155" strokeWidth="1.5" />
        <line x1="70" y1="255" x2="70" y2="30" stroke="#334155" strokeWidth="1.5" />
        <text x="18" y="28" fontSize="11" fill="#64748b">
          High
        </text>
        <text x="18" y="255" fontSize="11" fill="#64748b">
          Low
        </text>
        {/* Sweet spot zone (Leading Edge → Mainstream) */}
        <rect
          x={stages[1].x - 15}
          y="40"
          width={stages[2].x - stages[1].x + 30}
          height="210"
          rx="8"
          fill="url(#sweetSpotGrad)"
          stroke="#22d3ee"
          strokeWidth="1"
          strokeDasharray="4 3"
          strokeOpacity="0.4"
        />
        <text
          x={(stages[1].x + stages[2].x) / 2}
          y="52"
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="#22d3ee"
          opacity="0.7"
        >
          TARGET ZONE
        </text>
        {/* Innovation curve (cyan dashed) */}
        <path d={innovPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="8 4" />
        {/* Risk curve (amber solid) */}
        <path d={riskPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        {/* Stage markers on both curves */}
        {stages.map((s, i) => (
          <g key={s.label}>
            {/* Innovation dot */}
            <circle cx={s.x} cy={innovY[i]} r="5" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
            {/* Risk dot */}
            <circle cx={s.x} cy={riskY[i]} r="5" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
            {/* Stage label below x-axis */}
            <text
              x={s.x}
              y="272"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="600"
              fill="#e2e8f0"
            >
              {s.label}
            </text>
            <text x={s.x} y="286" textAnchor="middle" fontSize="10" fill="#94a3b8">
              {s.sub}
            </text>
          </g>
        ))}
        {/* Legend */}
        <line
          x1="80"
          y1="300"
          x2="105"
          y2="300"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeDasharray="6 3"
        />
        <text x="110" y="304" fontSize="11" fill="#94a3b8">
          Innovation Potential
        </text>
        <line x1="260" y1="300" x2="285" y2="300" stroke="#f59e0b" strokeWidth="2.5" />
        <text x="290" y="304" fontSize="11" fill="#94a3b8">
          Adoption Risk
        </text>
        <rect
          x="420"
          y="294"
          width="14"
          height="10"
          rx="2"
          fill="#22d3ee"
          fillOpacity="0.15"
          stroke="#22d3ee"
          strokeWidth="0.5"
          strokeOpacity="0.4"
        />
        <text x="440" y="304" fontSize="11" fill="#94a3b8">
          Sweet Spot
        </text>
      </svg>
      <div className="text-center text-base text-slate-400">
        Risk is <span className="font-semibold text-amber-300">U-shaped</span> - highest at both
        extremes. The <span className="font-semibold text-cyan-400">Leading Edge → Mainstream</span>{' '}
        zone balances innovation with manageable risk.
      </div>
    </div>
  )
}

function Visual07_LifecycleStagesMatrix() {
  const rows: Array<{
    stage: string
    risk: string
    tone: 'good' | 'warn' | 'bad'
    posture: string
  }> = [
    { stage: 'Bleeding Edge', risk: 'Very High', tone: 'bad', posture: 'R&D only' },
    {
      stage: 'Leading Edge',
      risk: 'High',
      tone: 'warn',
      posture: 'Modern patterns, innovation room',
    },
    { stage: 'Mainstream', risk: 'Low', tone: 'good', posture: 'Best practices, predictable' },
    { stage: 'Trending Behind', risk: 'Medium', tone: 'warn', posture: 'Modernization planning' },
    { stage: 'End of Support+', risk: 'High–Very High', tone: 'bad', posture: 'Forced migration' },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-700/50">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-800/80">
              <th className="px-4 py-2 text-base font-bold text-slate-300">Lifecycle Stage</th>
              <th className="px-4 py-2 text-base font-bold text-slate-300">Adoption Risk</th>
              <th className="px-4 py-2 text-base font-bold text-slate-300">Posture</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.stage} className={i % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'}>
                <td className="px-4 py-2.5 text-base font-semibold text-white">{r.stage}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={r.tone}>{r.risk}</Badge>
                </td>
                <td className="px-4 py-2.5 text-base text-slate-300">{r.posture}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Visual08_StrategicPositioningTarget() {
  return (
    <div className="flex h-full items-center justify-center">
      <svg
        viewBox="0 0 560 300"
        className="w-full max-w-2xl"
        role="img"
        aria-label="Target zone: leading edge to mainstream"
      >
        {/* Outer ring */}
        <rect
          x="30"
          y="20"
          width="500"
          height="260"
          rx="20"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1.5"
        />
        <text x="50" y="48" fontSize="13" fill="#64748b">
          Bleeding Edge - monitor only
        </text>
        {/* Middle ring */}
        <rect
          x="80"
          y="65"
          width="400"
          height="170"
          rx="16"
          fill="#0f172a"
          stroke="#22d3ee"
          strokeWidth="1"
          strokeDasharray="6 4"
        />
        <text x="100" y="88" fontSize="14" fontWeight="600" fill="#22d3ee">
          Leading Edge - target ✅
        </text>
        {/* Inner ring */}
        <rect
          x="150"
          y="110"
          width="260"
          height="80"
          rx="14"
          fill="#164e63"
          fillOpacity="0.3"
          stroke="#22d3ee"
          strokeWidth="2"
        />
        <text x="195" y="155" fontSize="16" fontWeight="700" fill="#22d3ee">
          Mainstream - target ✅
        </text>
        {/* Bottom label */}
        <text x="100" y="225" fontSize="13" fill="#64748b">
          Trending Behind - cloud enabling only
        </text>
        <text x="50" y="265" fontSize="13" fill="#475569">
          End of Support - avoid / migrate
        </text>
      </svg>
    </div>
  )
}

function Visual09_ArchitectureApproachesComparison() {
  const cols = [
    {
      title: 'Cloud Enabling',
      friction: 35,
      items: ['Refactoring', 'Containerization', 'API wrapping'],
      note: 'Lower disruption',
    },
    {
      title: 'Cloud Native',
      friction: 75,
      items: ['Microservices', '12-factor apps', 'K8s patterns'],
      note: 'Highest performance',
    },
    {
      title: 'Cloud Agnostic',
      friction: 40,
      items: ['Portability', 'Abstraction', 'Multi-platform IaC'],
      note: 'Maximum flexibility',
    },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-4xl grid-cols-3 gap-5">
        {cols.map((c) => (
          <Card key={c.title}>
            <CardLabel>{c.title}</CardLabel>
            <ul className="mt-3 space-y-1.5 text-base text-slate-300">
              {c.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <FrictionBar value={c.friction} label="Adoption friction" />
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-400">{c.note}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Visual10_LifecycleArchitectureMapping() {
  const toneIcon = (t: 'good' | 'warn' | 'bad') =>
    t === 'good' ? <IconCheck /> : t === 'warn' ? <IconWarn /> : <IconX />
  const toneLabel = (t: 'good' | 'warn' | 'bad') =>
    t === 'good' ? 'Ideal' : t === 'warn' ? 'Caution' : 'Avoid'
  const toneBg = (t: 'good' | 'warn' | 'bad') =>
    t === 'good' ? 'bg-emerald-500/10' : t === 'warn' ? 'bg-amber-500/10' : 'bg-red-500/10'

  const data: Array<{
    stage: string
    ce: 'good' | 'warn' | 'bad'
    cn: 'good' | 'warn' | 'bad'
    ca: 'good' | 'warn' | 'bad'
  }> = [
    { stage: 'Bleeding Edge', ce: 'bad', cn: 'warn', ca: 'bad' },
    { stage: 'Leading Edge', ce: 'warn', cn: 'good', ca: 'warn' },
    { stage: 'Mainstream', ce: 'good', cn: 'good', ca: 'good' },
    { stage: 'Trending Behind', ce: 'good', cn: 'bad', ca: 'warn' },
    { stage: 'End of Support', ce: 'warn', cn: 'bad', ca: 'warn' },
  ]

  return (
    <div className="flex h-full items-center justify-center">
      <div className={TABLE_WRAPPER_CLASS}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className={TABLE_HEAD_ROW_CLASS}>
              <th className="px-4 py-3 text-base font-bold text-slate-300">Lifecycle</th>
              <th className="px-4 py-3 text-base font-bold text-slate-300">Cloud Enabling</th>
              <th className="px-4 py-3 text-base font-bold text-slate-300">Cloud Native</th>
              <th className="px-4 py-3 text-base font-bold text-slate-300">Cloud Agnostic</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr
                key={r.stage}
                className={i % 2 === 0 ? TABLE_INDEX_EVEN_ROW_CLASS : TABLE_INDEX_ODD_ROW_CLASS}
              >
                <td className="px-4 py-3 text-base font-semibold text-white">{r.stage}</td>
                {([r.ce, r.cn, r.ca] as const).map((t, j) => (
                  <td key={j} className={`px-4 py-3 ${toneBg(t)}`}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      {toneIcon(t)} {toneLabel(t)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Visual11_LifecyclePlanningLoop() {
  return (
    <div className="flex h-full items-center justify-center">
      <svg
        viewBox="0 0 640 300"
        className="w-full max-w-3xl"
        role="img"
        aria-label="Lifecycle loop: design → develop → deploy → sustain"
      >
        <defs>
          <marker
            id="pArrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#22d3ee" />
          </marker>
        </defs>
        {/* Boxes */}
        {[
          { x: 80, y: 40, label: 'Design' },
          { x: 420, y: 40, label: 'Develop' },
          { x: 420, y: 180, label: 'Deploy' },
          { x: 80, y: 180, label: 'Sustain' },
        ].map((n) => (
          <g key={n.label}>
            <rect
              x={n.x}
              y={n.y}
              width="140"
              height="70"
              rx="14"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text
              x={n.x + 70}
              y={n.y + 42}
              textAnchor="middle"
              fontSize="16"
              fontWeight="600"
              fill="#e2e8f0"
            >
              {n.label}
            </text>
          </g>
        ))}
        {/* Center circle */}
        <circle
          cx="320"
          cy="145"
          r="56"
          fill="#164e63"
          fillOpacity="0.3"
          stroke="#22d3ee"
          strokeWidth="1.5"
        />
        <text x="320" y="132" textAnchor="middle" fontSize="13" fontWeight="600" fill="#22d3ee">
          User Input
        </text>
        <text x="320" y="150" textAnchor="middle" fontSize="13" fontWeight="600" fill="#22d3ee">
          + Lifecycle
        </text>
        <text x="320" y="168" textAnchor="middle" fontSize="13" fontWeight="600" fill="#22d3ee">
          Awareness
        </text>
        {/* Arrows */}
        <path
          d="M220 75 L420 75"
          stroke="#22d3ee"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#pArrow)"
        />
        <path
          d="M490 110 L490 180"
          stroke="#22d3ee"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#pArrow)"
        />
        <path
          d="M420 215 L220 215"
          stroke="#22d3ee"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#pArrow)"
        />
        <path
          d="M150 180 L150 110"
          stroke="#22d3ee"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#pArrow)"
        />
      </svg>
    </div>
  )
}

function Visual12_AdoptionDrivenDecisionsFlow() {
  const stages = ['Adoption Need', 'Lifecycle Position', 'Architecture Approach', 'Dev Decisions']
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <Card className="text-center">
              <div className="text-base font-bold text-white">{s}</div>
            </Card>
            {i < stages.length - 1 ? <Arrow /> : null}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['Kubernetes', 'Microservices', 'Observability'].map((item) => (
          <Card key={item} className="text-center">
            <div className="text-sm font-semibold text-cyan-300">{item}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── PART 4: EXECUTION & METRICS (Slides 13-16) ───────────────────────

function Visual13_AdoptionEnablingCapabilities() {
  const cards = [
    {
      title: 'Graceful Degradation',
      body: 'Users trust the system - it fails safely and recovers quickly.',
    },
    { title: 'Scalable Deployment', body: 'Deploy where users operate, not vice versa.' },
    {
      title: 'Resilient Operations',
      body: 'Works in degraded conditions - no workarounds needed.',
    },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-5xl grid-cols-3 gap-6">
        {cards.map((c) => (
          <Card key={c.title} className="border-cyan-400/40 bg-slate-900/80">
            <CardLabel>{c.title}</CardLabel>
            <CardBody>{c.body}</CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Metric({ tone, label, value }: { tone: 'good' | 'bad'; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${tone === 'good' ? 'bg-emerald-400' : 'bg-red-400'}`}
          aria-hidden="true"
        />
        <span className="text-base font-semibold text-white">{label}</span>
      </div>
      <div className="mt-1 text-sm text-slate-300">{value}</div>
    </div>
  )
}

function Visual14_AdoptionSuccessMetrics() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-3xl grid-cols-2 gap-6">
        <div>
          <div className="mb-3 text-lg font-bold text-emerald-400">Success Signals</div>
          <div className="space-y-3">
            <Metric tone="good" label="Active usage rate" value="High" />
            <Metric tone="good" label="Task completion vs workarounds" value="Rising" />
            <Metric tone="good" label="User satisfaction" value="Positive" />
          </div>
        </div>
        <div>
          <div className="mb-3 text-lg font-bold text-red-400">Warning Signals</div>
          <div className="space-y-3">
            <Metric tone="bad" label="Availability vs usage" value="High / Low" />
            <Metric tone="bad" label="Workarounds / shadow IT" value="Increasing" />
            <Metric tone="bad" label="Help desk tickets" value="Constant basics" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Visual15_PhasedAdoptionRoadmap() {
  const phases = [
    { label: 'Design with representative users', note: 'Requirements validated' },
    { label: 'Develop with frequent user testing', note: 'Iterative feedback' },
    { label: 'Pilot with early adopters', note: 'Positive feedback' },
    { label: 'Expand as demand grows (voluntary)', note: 'Advocacy to peers' },
    { label: 'Scaled adoption - self-sustaining', note: 'User-driven roadmap' },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-2xl space-y-0">
        {phases.map((p, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-500 bg-cyan-950/40 text-sm font-bold text-cyan-300">
                {i + 1}
              </div>
              {i < phases.length - 1 ? <div className="h-8 w-px bg-slate-700" /> : null}
            </div>
            <div className="pb-6">
              <div className="text-lg font-bold text-white">{p.label}</div>
              <div className="text-sm text-slate-400">{p.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Visual16_AdoptionBestPracticesChecklist() {
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
    'Shelf-ware helps nobody',
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-3xl grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <Card key={idx} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-sm font-bold text-cyan-300">
              {idx + 1}
            </span>
            <span className="text-base font-semibold text-white">{item}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── TRANSITION (Slide 17) ────────────────────────────────────────────

function Visual17_QaTransitionCard() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-3xl grid-cols-2 gap-6">
        <Card className="text-center">
          <CardLabel>Q&A</CardLabel>
          <CardBody>Capture questions, then route deeper topics to optional slides.</CardBody>
        </Card>
        <Card className="text-center">
          <CardLabel>Deep Dives</CardLabel>
          <CardBody>
            Lifecycle examples, platforms, selection, anti-patterns, legacy, AI/ML.
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Visual21_DeepDiveAntiPatterns() {
  const avoid = ['Big bang deployment', 'Mandates as strategy', 'No user input', 'Ignore lifecycle']
  const doInstead = [
    'Pilot + iterate',
    'Build value proposition',
    'Design with users',
    'Plan modernization',
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-3xl grid-cols-2 gap-6">
        <Card className="border-red-500/30">
          <div className="flex items-center gap-2">
            <IconX />
            <CardLabel>Avoid</CardLabel>
          </div>
          <ul className="mt-3 space-y-2 text-base text-slate-300">
            {avoid.map((a) => (
              <li key={a} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400"
                  aria-hidden="true"
                />
                {a}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-emerald-500/30">
          <div className="flex items-center gap-2">
            <IconCheck />
            <CardLabel>Do Instead</CardLabel>
          </div>
          <ul className="mt-3 space-y-2 text-base text-slate-300">
            {doInstead.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                  aria-hidden="true"
                />
                {d}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function Visual24_DeepDiveAiFriction() {
  const stages = [
    { title: 'Bleeding Edge', friction: 90 },
    { title: 'Leading Edge', friction: 55 },
    { title: 'Mainstream', friction: 30 },
    { title: 'Trending Behind', friction: 65 },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-2xl space-y-4">
        {stages.map((s) => (
          <Card key={s.title}>
            <div className="flex items-center justify-between">
              <CardLabel>{s.title}</CardLabel>
            </div>
            <div className="mt-3">
              <FrictionBar value={s.friction} label="AI/ML adoption friction" />
            </div>
          </Card>
        ))}
        <div className="mt-2 text-center text-base text-slate-400">
          Adoption depends on <span className="font-semibold text-cyan-400">trust</span>,{' '}
          <span className="font-semibold text-cyan-400">explainability</span>, and governance - not
          just model accuracy.
        </div>
      </div>
    </div>
  )
}

function Visual25_DeepDiveLifecycleCycles() {
  const sw = 20
  // Standard 16:9 Canvas (1600 x 900)
  // Left Center

  // Text Sizes (SVG scale)
  const tsLg = 42 // Main labels
  const tsMd = 36 // Secondary

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 1600 900"
        className="h-full w-full max-h-full max-w-full"
        role="img"
        aria-label="Lifecycle Cycles"
      >
        <defs>
          <marker
            id="arrow-amber"
            markerWidth="3"
            markerHeight="3"
            refX="1.5"
            refY="1.5"
            orient="auto"
            fill="#fbbf24"
          >
            <path d="M0,0 L0,3 L3,1.5 z" />
          </marker>
          <marker
            id="arrow-green"
            markerWidth="3"
            markerHeight="3"
            refX="1.5"
            refY="1.5"
            orient="auto"
            fill="#22c55e"
          >
            <path d="M0,0 L0,3 L3,1.5 z" />
          </marker>
          <marker
            id="arrow-lightgreen"
            markerWidth="3"
            markerHeight="3"
            refX="1.5"
            refY="1.5"
            orient="auto"
            fill="#86efac"
          >
            <path d="M0,0 L0,3 L3,1.5 z" />
          </marker>
          <marker
            id="arrow-orange"
            markerWidth="3"
            markerHeight="3"
            refX="1.5"
            refY="1.5"
            orient="auto"
            fill="#ea580c"
          >
            <path d="M0,0 L0,3 L3,1.5 z" />
          </marker>
          <marker
            id="arrow-red"
            markerWidth="3"
            markerHeight="3"
            refX="1.5"
            refY="1.5"
            orient="auto"
            fill="#dc2626"
          >
            <path d="M0,0 L0,3 L3,1.5 z" />
          </marker>
          <marker
            id="arrow-conn"
            markerWidth="4"
            markerHeight="4"
            refX="3"
            refY="2"
            orient="auto"
            fill="#94a3b8"
          >
            <path d="M0,0 L0,4 L4,2 z" />
          </marker>
        </defs>

        {/* --- LEFT CYCLE (Innovation) --- */}
        {/* Arc 1: Bleeding Edge (Top -> Left) */}
        {/* Start (450, 230) -> End (230, 450) */}
        <path
          d="M 430 232 A 220 220 0 0 0 232 430"
          fill="none"
          stroke="#fbbf24"
          strokeWidth={sw}
          markerEnd="url(#arrow-amber)"
        />
        <text x="250" y="180" fontSize={tsLg} fontWeight="bold" fill="#fbbf24" textAnchor="middle">
          Bleeding Edge
        </text>

        {/* Arc 2: Leading Edge (Left -> Bottom) */}
        {/* Start (230, 470) -> End (430, 668) */}
        <path
          d="M 232 470 A 220 220 0 0 0 430 668"
          fill="none"
          stroke="#22c55e"
          strokeWidth={sw}
          markerEnd="url(#arrow-green)"
        />
        <text x="180" y="620" fontSize={tsLg} fontWeight="bold" fill="#22c55e" textAnchor="end">
          Leading Edge
        </text>

        {/* Arc 3: Mainstream (Bottom -> Right) */}
        {/* Start (470, 668) -> End (668, 470) */}
        <path
          d="M 470 668 A 220 220 0 0 0 668 470"
          fill="none"
          stroke="#86efac"
          strokeWidth={sw}
          markerEnd="url(#arrow-lightgreen)"
        />
        <text x="600" y="780" fontSize={tsLg} fontWeight="bold" fill="#86efac" textAnchor="middle">
          Mainstream
        </text>

        {/* --- RIGHT CYCLE (Legacy) --- */}
        {/* Arc 4: Trending Behind (Top -> Right) */}
        {/* Start (1150, 230) -> End (1368, 430) */}
        <path
          d="M 1170 232 A 220 220 0 0 1 1368 430"
          fill="none"
          stroke="#fbbf24"
          strokeWidth={sw}
          markerEnd="url(#arrow-amber)"
        />
        <text x="1350" y="180" fontSize={tsLg} fontWeight="bold" fill="#fbbf24" textAnchor="middle">
          Trending Behind
        </text>

        {/* Arc 5: End of Support (Right -> Bottom) */}
        {/* Start (1368, 470) -> End (1170, 668) */}
        <path
          d="M 1368 470 A 220 220 0 0 1 1170 668"
          fill="none"
          stroke="#ea580c"
          strokeWidth={sw}
          markerEnd="url(#arrow-orange)"
        />
        <text x="1420" y="620" fontSize={tsLg} fontWeight="bold" fill="#ea580c" textAnchor="start">
          End of Support
        </text>

        {/* Arc 6: End of Life (Bottom -> Left) */}
        {/* Start (1130, 668) -> End (932, 470) */}
        <path
          d="M 1130 668 A 220 220 0 0 1 932 470"
          fill="none"
          stroke="#dc2626"
          strokeWidth={sw}
          markerEnd="url(#arrow-red)"
        />
        <text x="1000" y="780" fontSize={tsLg} fontWeight="bold" fill="#dc2626" textAnchor="middle">
          End of Life
        </text>
        <text x="1000" y="825" fontSize={tsMd} fontWeight="bold" fill="#dc2626" textAnchor="middle">
          / Obsolete
        </text>

        {/* Central Connector Arrow: Mainstream End (near 668, 470) to Trending Behind Start (near 1170, 230) */}
        {/* Let's draw it from x=700, y=500 to x=900, y=300? */}
        <path
          d="M 668 470 C 850 470, 1000 230, 1170 232"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="4"
          strokeDasharray="12 12"
          markerEnd="url(#arrow-conn)"
          opacity="0.6"
        />
      </svg>

      {/* Central Text Box Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-slate-900/95 text-slate-100 px-8 py-8 border border-slate-700 shadow-2xl text-center rounded-2xl backdrop-blur-md">
        <p className="font-bold text-2xl leading-relaxed">
          Where you want to sit in the competitive pool affects your{' '}
          <span className="text-cyan-400">Management Methods</span>,{' '}
          <span className="text-cyan-400">Architecture</span>, and{' '}
          <span className="text-cyan-400">Solutions</span>
        </p>
      </div>
    </div>
  )
}

// ── Visual components for optional deep-dives (18–23) ──────

function Visual18_DeepDiveTechStackComparison() {
  const examples = [
    { category: 'Container Orchestration', mainstream: 'Kubernetes', behind: 'Docker Swarm' },
    { category: 'IaC', mainstream: 'Terraform / Ansible', behind: 'Chef / Puppet' },
    { category: 'Languages', mainstream: 'Python / Java / JS', behind: 'Perl / Ruby (cloud)' },
    { category: 'CI/CD', mainstream: 'GitLab CI / GitHub Actions', behind: 'Travis CI' },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className={TABLE_WRAPPER_CLASS}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className={TABLE_HEAD_ROW_CLASS}>
              <th className="px-5 py-4 text-base font-bold text-slate-300">Category</th>
              <th className="px-5 py-4 text-base font-bold text-emerald-400">Mainstream ✅</th>
              <th className="px-5 py-4 text-base font-bold text-amber-400">Trending Behind ⚠️</th>
            </tr>
          </thead>
          <tbody>
            {examples.map((r, i) => (
              <tr
                key={r.category}
                className={i % 2 === 0 ? TABLE_INDEX_EVEN_ROW_CLASS : TABLE_INDEX_ODD_ROW_CLASS}
              >
                <td className="px-5 py-3.5 text-base font-semibold text-white">{r.category}</td>
                <td className="px-5 py-3.5 text-base text-slate-200">{r.mainstream}</td>
                <td className="px-5 py-3.5 text-base text-slate-200">{r.behind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Visual19_DeepDiveCloudTiers() {
  const tiers = [
    {
      title: 'Public Cloud',
      stage: 'Mainstream',
      items: ['AWS', 'Azure', 'Google Cloud'],
      tone: 'good' as const,
    },
    {
      title: 'Private / On-Prem',
      stage: 'Mainstream',
      items: ['vSphere', 'OpenStack', 'Nutanix'],
      tone: 'good' as const,
    },
    {
      title: 'Container Platforms',
      stage: 'Mainstream → Leading',
      items: ['Kubernetes', 'Managed K8s', 'Edge K8s'],
      tone: 'info' as const,
    },
    {
      title: 'Multi-Cloud Mgmt',
      stage: 'Leading Edge',
      items: ['Multi-cluster', 'Cross-cloud', 'Unified CP'],
      tone: 'info' as const,
    },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-4xl grid-cols-2 gap-4">
        {tiers.map((t) => (
          <Card key={t.title}>
            <div className="flex items-center justify-between">
              <CardLabel>{t.title}</CardLabel>
              <Badge tone={t.tone}>{t.stage}</Badge>
            </div>
            <ul className="mt-3 space-y-1.5 text-base text-slate-300">
              {t.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Visual20_DeepDiveSourcingStrategy() {
  const categories = [
    {
      title: 'Open Source (FOSS)',
      examples: 'K8s, Terraform, Linux',
      tone: 'good' as const,
      note: 'Innovation + no lock-in',
    },
    {
      title: 'Gov / Enterprise',
      examples: 'FedRAMP, compliance tools',
      tone: 'info' as const,
      note: 'Compliance-driven',
    },
    {
      title: 'COTS',
      examples: 'Enterprise platforms',
      tone: 'info' as const,
      note: 'Rapid capability',
    },
    {
      title: 'Custom / Bespoke',
      examples: 'Internal development',
      tone: 'warn' as const,
      note: 'Full control + risk',
    },
  ]
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="grid w-full max-w-4xl grid-cols-2 gap-4">
        {categories.map((c) => (
          <Card key={c.title}>
            <div className="flex items-center justify-between">
              <CardLabel>{c.title}</CardLabel>
              <Badge tone={c.tone}>{c.note}</Badge>
            </div>
            <CardBody>{c.examples}</CardBody>
          </Card>
        ))}
      </div>
      <div className="text-center text-base text-slate-400">
        <span className="font-semibold text-cyan-400">&ldquo;Best tool for the job&rdquo;</span> -
        evaluate based on mission, lifecycle position, and adoption implications.
      </div>
    </div>
  )
}

function Visual22_DeepDiveRoiAnalysis() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6">
        <Card className="border-cyan-500/30">
          <CardLabel>Organizational Adoption</CardLabel>
          <CardBody>Leadership deploys &amp; makes available</CardBody>
          <div className="mt-4 space-y-2">
            <Metric tone="good" label="Deployment status" value="Completed" />
            <Metric tone="good" label="Budget" value="On target" />
            <Metric tone="bad" label="User engagement" value="Unknown" />
          </div>
          <div className="mt-3 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            ⚠️ Stopping here = shelf-ware
          </div>
        </Card>
        <Card className="border-emerald-500/30">
          <CardLabel>+ Voluntary User Adoption</CardLabel>
          <CardBody>Users choose to use &amp; advocate</CardBody>
          <div className="mt-4 space-y-2">
            <Metric tone="good" label="Active usage" value="High" />
            <Metric tone="good" label="Task completion" value="Rising" />
            <Metric tone="good" label="Expansion requests" value="Growing" />
          </div>
          <div className="mt-3 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            ✅ Both levels = real ROI
          </div>
        </Card>
      </div>
    </div>
  )
}

function Visual23_DeepDiveLegacyMigration() {
  const phases = [
    { label: 'Immediate', note: 'Security triage + isolation', tone: 'bad' as const },
    {
      label: 'Short-term',
      note: 'Risk documentation + self-support assessment',
      tone: 'warn' as const,
    },
    {
      label: 'Mid-term',
      note: 'Replacement selection + migration architecture',
      tone: 'info' as const,
    },
    { label: 'Long-term', note: 'Complete migration + decommission', tone: 'good' as const },
  ]
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="w-full max-w-2xl space-y-0">
        {phases.map((p, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-500 bg-cyan-950/40 text-sm font-bold text-cyan-300">
                {i + 1}
              </div>
              {i < phases.length - 1 ? <div className="h-8 w-px bg-slate-700" /> : null}
            </div>
            <div className="pb-6">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-white">{p.label}</div>
                <Badge tone={p.tone}>
                  {p.tone === 'bad'
                    ? 'Urgent'
                    : p.tone === 'warn'
                      ? 'Plan'
                      : p.tone === 'info'
                        ? 'Execute'
                        : 'Complete'}
                </Badge>
              </div>
              <div className="text-sm text-slate-400">{p.note}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-base text-slate-400">
        Legacy migration is{' '}
        <span className="font-semibold text-amber-300">involuntary adoption</span> -
        over-communicate, train extensively, and move fast.
      </div>
    </div>
  )
}

function Visual26_DeepDiveTrifectaModel() {
  // Triangle coordinates
  // Top (Organization): Yellow
  // Bottom Left (User): Blue
  // Bottom Right (Consumer): Green
  // Center (Technology): Red inverted

  // Canvas 1600x900
  // Center X = 800
  // Top Y = 100
  // Triangle Height ~ 700
  // Side length ~ 800

  // Vertices for main triangle
  const top = { x: 800, y: 100 }
  const botLeft = { x: 400, y: 800 }
  const botRight = { x: 1200, y: 800 }

  // Midpoints
  const midLeft = { x: (top.x + botLeft.x) / 2, y: (top.y + botLeft.y) / 2 } // 600, 450
  const midRight = { x: (top.x + botRight.x) / 2, y: (top.y + botRight.y) / 2 } // 1000, 450
  const midBot = { x: (botLeft.x + botRight.x) / 2, y: (botLeft.y + botRight.y) / 2 } // 800, 800

  return (
    <div className="flex h-full items-center justify-center">
      <svg
        viewBox="0 0 1600 900"
        className="h-full w-full max-h-full max-w-full"
        role="img"
        aria-label="The Trifecta of Adoption"
      >
        {/* Top Triangle - Organization (Yellow) */}
        <path
          d={`M${top.x},${top.y} L${midRight.x},${midRight.y} L${midLeft.x},${midLeft.y} Z`}
          fill="#facc15" // yellow-400
          stroke="white"
          strokeWidth="4"
        />
        <text x="800" y="320" textAnchor="middle" fill="#713f12" fontSize="32" fontWeight="bold">
          Organization Adoption (1)
        </text>
        <text x="800" y="360" textAnchor="middle" fill="#713f12" fontSize="28" fontStyle="italic">
          C-Suite Focus Area
        </text>

        {/* Bottom Left Triangle - User (Blue) */}
        <path
          d={`M${midLeft.x},${midLeft.y} L${midBot.x},${midBot.y} L${botLeft.x},${botLeft.y} Z`}
          fill="#67e8f9" // cyan-300 (adjust to match blue-ish)
          stroke="white"
          strokeWidth="4"
        />
        <text x="600" y="680" textAnchor="middle" fill="#0f4a5a" fontSize="32" fontWeight="bold">
          User Adoption (2)
        </text>
        <text x="600" y="720" textAnchor="middle" fill="#0f4a5a" fontSize="28" fontStyle="italic">
          Internal
        </text>

        {/* Bottom Right Triangle - Consumer (Green) */}
        <path
          d={`M${midRight.x},${midRight.y} L${botRight.x},${botRight.y} L${midBot.x},${midBot.y} Z`}
          fill="#86efac" // green-300
          stroke="white"
          strokeWidth="4"
        />
        <text x="1000" y="680" textAnchor="middle" fill="#14532d" fontSize="32" fontWeight="bold">
          Consumer Adoption (3)
        </text>
        <text x="1000" y="720" textAnchor="middle" fill="#14532d" fontSize="28" fontStyle="italic">
          External
        </text>

        {/* Center Triangle - Technology (Red/Orange) */}
        <path
          d={`M${midLeft.x},${midLeft.y} L${midRight.x},${midRight.y} L${midBot.x},${midBot.y} Z`}
          fill="#ea580c" // orange-600
          stroke="white"
          strokeWidth="4"
        />
        <text x="800" y="550" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold">
          Technology
        </text>
        <text x="800" y="590" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold">
          Adoption
        </text>
        <text x="800" y="630" textAnchor="middle" fill="white" fontSize="28">
          (1, 2, 3)
        </text>
      </svg>
    </div>
  )
}

// ── LIFECYCLE TIMELINE CHARTS (Slides 27-29) ─────────────────

/* Shared timeline bar renderer for lifecycle example charts.
   Each phase gets a proportional-width bar on a horizontal timeline.
   Phase data imported from @/data/lifecycle-timeline-configs.
   Sources cited inline per chart. */

// Re-use the shared type for timeline phases
type TimelinePhase =
  import('@/components/technology-adoption-series/lifecycle-timeline-bar').LifecyclePhase

function LifecycleTimelineChart({
  title,
  subtitle,
  phases,
  totalYears,
  sourceText,
  ariaLabel,
  noteText,
}: {
  title: string
  subtitle: string
  phases: TimelinePhase[]
  totalYears: string
  sourceText: string
  ariaLabel: string
  noteText?: string
}) {
  const chartLeft = 80
  const chartRight = 1520
  const chartWidth = chartRight - chartLeft
  const barY = 380
  const barH = 120
  const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0)

  const markerId = `arrow-timeline-${title.replace(/\W+/g, '-').toLowerCase()}`

  const phaseBars = phases.reduce<Array<TimelinePhase & { x: number; w: number }>>((acc, p) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].x + acc[acc.length - 1].w : chartLeft
    const w = (p.duration / totalDuration) * chartWidth
    acc.push({ ...p, x: prevEnd, w })
    return acc
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <svg
        viewBox="0 0 1600 900"
        className="h-full w-full max-h-full max-w-full"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Title */}
        <text x="800" y="60" textAnchor="middle" fontSize="38" fontWeight="bold" fill="#e2e8f0">
          {title}
        </text>
        <text x="800" y="100" textAnchor="middle" fontSize="24" fill="#94a3b8">
          {subtitle}
        </text>

        {/* Y-axis labels */}
        <text
          x="50"
          y="375"
          textAnchor="middle"
          fontSize="16"
          fill="#64748b"
          transform="rotate(-90,50,375)"
        >
          Lifecycle Stage
        </text>

        {/* Phase duration explanation header */}
        <text x="800" y="160" textAnchor="middle" fontSize="20" fill="#cbd5e1">
          Bar width is proportional to time spent in each phase - total span: {totalYears}
        </text>

        {/* Asymmetry callout arrows */}
        {phaseBars.length >= 3 && (
          <g>
            {/* First phase (often long) */}
            <path
              d={`M${phaseBars[0].x + phaseBars[0].w / 2} ${barY - 50} L${phaseBars[0].x + phaseBars[0].w / 2} ${barY - 15}`}
              stroke="#f59e0b"
              strokeWidth="2"
              markerEnd={`url(#${markerId})`}
            />
            <text
              x={phaseBars[0].x + phaseBars[0].w / 2}
              y={barY - 60}
              textAnchor="middle"
              fontSize="15"
              fill="#fbbf24"
              fontWeight="600"
            >
              {phaseBars[0].duration >= phaseBars[phaseBars.length - 1].duration
                ? 'Long incubation'
                : 'Short start'}
            </text>
            {/* Last phase (often compressed) */}
            <path
              d={`M${phaseBars[phaseBars.length - 1].x + phaseBars[phaseBars.length - 1].w / 2} ${barY - 50} L${phaseBars[phaseBars.length - 1].x + phaseBars[phaseBars.length - 1].w / 2} ${barY - 15}`}
              stroke="#f59e0b"
              strokeWidth="2"
              markerEnd={`url(#${markerId})`}
            />
            <text
              x={phaseBars[phaseBars.length - 1].x + phaseBars[phaseBars.length - 1].w / 2}
              y={barY - 60}
              textAnchor="middle"
              fontSize="15"
              fill="#fbbf24"
              fontWeight="600"
            >
              {phaseBars[phaseBars.length - 1].duration <= phaseBars[0].duration
                ? 'Rapid decline'
                : 'Slow fade'}
            </text>
          </g>
        )}

        {/* Arrow marker */}
        <defs>
          <marker
            id={markerId}
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="3"
            orient="auto"
            fill="#f59e0b"
          >
            <path d="M0,0 L0,6 L6,3 z" />
          </marker>
        </defs>

        {/* Timeline bars */}
        {phaseBars.map((p, i) => (
          <g key={p.label}>
            <rect
              x={p.x}
              y={barY}
              width={p.w}
              height={barH}
              rx="4"
              fill={p.color}
              stroke="#1e293b"
              strokeWidth="2"
            />
            {/* Phase label */}
            <text
              x={p.x + p.w / 2}
              y={barY + 40}
              textAnchor="middle"
              fontSize={p.w > 120 ? '18' : '14'}
              fontWeight="bold"
              fill={p.textColor || '#0f172a'}
            >
              {p.label}
            </text>
            {/* Duration */}
            <text
              x={p.x + p.w / 2}
              y={barY + 65}
              textAnchor="middle"
              fontSize={p.w > 120 ? '16' : '12'}
              fill={p.textColor || '#1e293b'}
              opacity="0.8"
            >
              {p.duration} yr{p.duration !== 1 ? 's' : ''}
            </text>
            {/* Year range below bar */}
            <text
              x={p.x + p.w / 2}
              y={barY + barH + 30}
              textAnchor="middle"
              fontSize="15"
              fill="#94a3b8"
            >
              {p.years}
            </text>
            {/* Phase divider tick */}
            {i < phaseBars.length - 1 ? (
              <line
                x1={p.x + p.w}
                y1={barY - 5}
                x2={p.x + p.w}
                y2={barY + barH + 5}
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            ) : null}
          </g>
        ))}

        {/* Timeline arrow */}
        <line
          x1={chartLeft - 10}
          y1={barY + barH + 55}
          x2={chartRight + 10}
          y2={barY + barH + 55}
          stroke="#475569"
          strokeWidth="2"
        />
        <polygon
          points={`${chartRight + 10},${barY + barH + 55} ${chartRight},${barY + barH + 50} ${chartRight},${barY + barH + 60}`}
          fill="#475569"
        />
        <text x={chartRight + 20} y={barY + barH + 60} fontSize="14" fill="#64748b">
          Time
        </text>

        {/* Note about asymmetric curves */}
        {noteText ? (
          <text x="800" y="680" textAnchor="middle" fontSize="18" fill="#f59e0b" fontWeight="600">
            {noteText}
          </text>
        ) : null}

        {/* Asymmetry explanation */}
        <text x="800" y="730" textAnchor="middle" fontSize="16" fill="#cbd5e1">
          Unequal phase durations create the asymmetric &quot;imperfect curves&quot; seen in real
          adoption data
        </text>
        <text x="800" y="755" textAnchor="middle" fontSize="16" fill="#cbd5e1">
          - the S-curve is an idealization; actual diffusion is shaped by market, regulatory, and
          network effects.
        </text>

        {/* Source citation */}
        <text x="800" y="830" textAnchor="middle" fontSize="13" fill="#64748b" fontStyle="italic">
          {sourceText}
        </text>

        {/* Phase duration reference */}
        <text x="800" y="860" textAnchor="middle" fontSize="13" fill="#64748b" fontStyle="italic">
          Rogers (2003): Innovators 2.5% → Early Majority at ~16% cumulative takes 2–8 years; full
          S-curve spans 15–40+ years
        </text>
      </svg>
    </div>
  )
}

function Visual27_HardwareLifecycleTimeline() {
  const cfg = LIFECYCLE_CONFIGS[27]

  return (
    <LifecycleTimelineChart
      title="Hardware Example: Hard Disk Drives (HDDs)"
      subtitle="From IBM RAMAC (1956) to SSD displacement - 70+ year lifecycle"
      phases={cfg.phases}
      totalYears="~77 years"
      ariaLabel="HDD lifecycle timeline showing 14 years bleeding edge, 15 years leading edge, 30 years mainstream, 13 years trending behind, and ongoing end of support"
      noteText="Long mainstream plateau (30 yrs) creates a right-skewed curve - slow start, extended peak, then rapid SSD displacement"
      sourceText="Sources: Computer History Museum (2024); IDC Worldwide HDD Forecast (2024); Backblaze Drive Stats (2023-2025)"
    />
  )
}

function Visual28_SoftwareLifecycleTimeline() {
  const cfg = LIFECYCLE_CONFIGS[28]

  return (
    <LifecycleTimelineChart
      title="Software Example: Adobe Flash"
      subtitle="From FutureSplash (1996) to EOL removal (2021) - 25 year lifecycle"
      phases={cfg.phases}
      totalYears="~25 years"
      ariaLabel="Adobe Flash lifecycle timeline showing 4 years bleeding edge, 5 years leading edge, 7 years mainstream, 5 years trending behind, 3 years end of support, and 1 year end of life"
      noteText="Compressed end-of-life (1 yr) after Apple's 2010 rejection + HTML5 - left-skewed tail with steep decline"
      sourceText="Sources: Adobe Flash EOL Page (2020); W3Techs Historical Usage (2023); Steve Jobs 'Thoughts on Flash' (2010)"
    />
  )
}

function Visual29_SupplyChainLifecycleTimeline() {
  const cfg = LIFECYCLE_CONFIGS[29]

  return (
    <LifecycleTimelineChart
      title="Supply Chain Example: Barcode / UPC Systems"
      subtitle="From patent (1952) to RFID/IoT displacement - 80+ year lifecycle"
      phases={cfg.phases}
      totalYears="~83 years"
      ariaLabel="Barcode lifecycle timeline showing 22 years bleeding edge, 11 years leading edge, 35 years mainstream, 10 years trending behind, and projected end of support"
      noteText="Extremely long bleeding edge (22 yrs) - technology existed decades before infrastructure enabled adoption"
      sourceText="Sources: GS1 Barcode History (2024); McKinsey Supply Chain 4.0 (2024); Zebra Technologies Global Study (2024)"
    />
  )
}

function Visual33_MLAILifecycleTimeline() {
  const cfg = LIFECYCLE_CONFIGS[33]

  return (
    <LifecycleTimelineChart
      title="ML/AI Example: Machine Learning & Artificial Intelligence"
      subtitle="From Turing's paper (1950) to ChatGPT - 75+ year lifecycle, still ascending"
      phases={cfg.phases}
      totalYears="~75+ years (ongoing)"
      ariaLabel="ML/AI lifecycle timeline showing 47 years bleeding edge, 23 years leading edge, and ongoing mainstream adoption since 2020"
      noteText="Longest bleeding edge of any example (47 yrs) - two AI winters stalled adoption until compute + data + algorithms aligned"
      sourceText="Sources: Stanford HAI AI Index (2024); Turing (1950); McCarthy (1956); Krizhevsky/AlexNet (2012); Vaswani/Transformers (2017)"
    />
  )
}

// ── MOMENT IN TIME CHARTS (Slides 30-35) ─────────────────

/* Column-based layout showing multiple technologies positioned by lifecycle stage.
   Companion to the timeline charts (slides 27-29) - these freeze a single moment
   and map the competitive landscape across lifecycle stages. */

function MomentInTimeChart({
  title,
  subtitle,
  asOf,
  stages,
  sourceText,
  ariaLabel,
}: {
  title: string
  subtitle: string
  asOf: string
  stages: Array<{
    stage: string
    color: string
    textColor?: string
    technologies: Array<{ name: string; detail: string }>
  }>
  sourceText: string
  ariaLabel: string
}) {
  const wrapByWords = (value: string, maxCharsPerLine: number) => {
    const words = value.trim().split(/\s+/)
    if (words.length === 0) return ['']

    const lines: string[] = []
    let current = ''

    for (const word of words) {
      const next = current ? `${current} ${word}` : word
      if (next.length <= maxCharsPerLine) {
        current = next
      } else {
        if (current) lines.push(current)
        if (word.length > maxCharsPerLine) {
          lines.push(word)
          current = ''
        } else {
          current = word
        }
      }
    }

    if (current) lines.push(current)
    return lines
  }

  const stageCount = Math.max(stages.length, 1)
  const horizontalPadding = 64
  const totalWidth = 1600 - horizontalPadding * 2
  const colWidth = totalWidth / stageCount
  const startX = horizontalPadding

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <svg
        viewBox="0 0 1600 900"
        className="h-full w-full max-h-full max-w-full"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Title */}
        <text x="800" y="50" textAnchor="middle" fontSize="34" fontWeight="bold" fill="#e2e8f0">
          {title}
        </text>
        <text x="800" y="85" textAnchor="middle" fontSize="22" fill="#94a3b8">
          {subtitle}
        </text>
        <text x="800" y="115" textAnchor="middle" fontSize="18" fill="#f59e0b" fontWeight="600">
          Snapshot: {asOf}
        </text>

        {/* Stage columns */}
        {stages.map((stage, i) => {
          const x = startX + i * colWidth
          const headerY = 150
          const techStartY = 200
          const maxNameChars = stageCount <= 5 ? 22 : 18
          const maxDetailChars = stageCount <= 5 ? 30 : 24

          let currentCardY = techStartY + 10

          return (
            <g key={stage.stage}>
              {/* Column background */}
              <rect
                x={x + 4}
                y={headerY}
                width={colWidth - 8}
                height={680}
                rx="8"
                fill="#1e293b"
                stroke={stage.color}
                strokeWidth="1.5"
                opacity="0.6"
              />

              {/* Stage header */}
              <rect
                x={x + 4}
                y={headerY}
                width={colWidth - 8}
                height={40}
                rx="8"
                fill={stage.color}
              />
              {/* Bottom corners of header should be square where they meet column body */}
              <rect x={x + 4} y={headerY + 32} width={colWidth - 8} height={8} fill={stage.color} />
              <text
                x={x + colWidth / 2}
                y={headerY + 27}
                textAnchor="middle"
                fontSize="13"
                fontWeight="bold"
                fill={stage.textColor || '#0f172a'}
              >
                {stage.stage}
              </text>

              {/* Technologies */}
              {stage.technologies.map((tech, j) => {
                const nameLines = wrapByWords(tech.name, maxNameChars)
                const detailLines = wrapByWords(tech.detail, maxDetailChars)
                const titleLineHeight = 13
                const detailLineHeight = 11
                const cardPaddingTop = 12
                const cardPaddingBottom = 12
                const cardGap = 9
                const bodyStart = cardPaddingTop + nameLines.length * titleLineHeight + 6
                const cardHeight =
                  bodyStart + detailLines.length * detailLineHeight + cardPaddingBottom
                const cardY = currentCardY
                currentCardY += cardHeight + cardGap

                return (
                  <g key={tech.name}>
                    <title>
                      {tech.name}: {tech.detail}
                    </title>
                    {/* Tech card background */}
                    <rect
                      x={x + 10}
                      y={cardY}
                      width={colWidth - 20}
                      height={cardHeight}
                      rx="6"
                      fill="#0f172a"
                      stroke={stage.color}
                      strokeWidth="1"
                      opacity="0.8"
                    />
                    {/* Tech name */}
                    {nameLines.map((line, lineIdx) => (
                      <text
                        key={`name-${lineIdx}`}
                        x={x + colWidth / 2}
                        y={cardY + cardPaddingTop + 10 + lineIdx * titleLineHeight}
                        textAnchor="middle"
                        fontSize="11.5"
                        fontWeight="bold"
                        fill="#e2e8f0"
                      >
                        {line}
                      </text>
                    ))}
                    {/* Tech detail */}
                    {detailLines.map((line, lineIdx) => (
                      <text
                        key={`detail-${lineIdx}`}
                        x={x + colWidth / 2}
                        y={cardY + bodyStart + 8 + lineIdx * detailLineHeight}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#94a3b8"
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* Risk gradient arrow at bottom */}
        <defs>
          <linearGradient id="risk-gradient-moment" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="25%" stopColor="#22d3ee" />
            <stop offset="45%" stopColor="#22c55e" />
            <stop offset="65%" stopColor="#f97316" />
            <stop offset="85%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>
        <rect
          x={startX}
          y="848"
          width={totalWidth}
          height="4"
          rx="2"
          fill="url(#risk-gradient-moment)"
        />
        <text x={startX} y="870" fontSize="12" fill="#64748b">
          High Risk (Unproven)
        </text>
        <text x={startX + totalWidth} y="870" textAnchor="end" fontSize="12" fill="#64748b">
          High Risk (Obsolete)
        </text>
        <text x="800" y="870" textAnchor="middle" fontSize="12" fill="#22c55e" fontWeight="600">
          ▲ Target Zone ▲
        </text>

        {/* Source */}
        <text x="800" y="895" textAnchor="middle" fontSize="11" fill="#64748b" fontStyle="italic">
          {sourceText}
        </text>
      </svg>
    </div>
  )
}

function Visual30_DataCenterStorageMoment() {
  const cfg = MOMENT_IN_TIME_CONFIGS[30]
  return (
    <MomentInTimeChart
      title={cfg.title}
      subtitle={cfg.subtitle}
      asOf={cfg.asOf}
      stages={cfg.stages}
      ariaLabel="Data center storage technologies positioned across lifecycle stages in 2025, from DNA storage at bleeding edge to 10K RPM HDDs at end of life"
      sourceText={cfg.source}
    />
  )
}

function Visual31_RichWebExperiencesMoment() {
  const cfg = MOMENT_IN_TIME_CONFIGS[31]
  return (
    <MomentInTimeChart
      title={cfg.title}
      subtitle={cfg.subtitle}
      asOf={cfg.asOf}
      stages={cfg.stages}
      ariaLabel="Rich web experience technologies positioned across lifecycle stages in 2025, from WebGPU at bleeding edge to ActiveX at end of life"
      sourceText={cfg.source}
    />
  )
}

function Visual32_SupplyChainIdMoment() {
  const cfg = MOMENT_IN_TIME_CONFIGS[32]
  return (
    <MomentInTimeChart
      title={cfg.title}
      subtitle={cfg.subtitle}
      asOf={cfg.asOf}
      stages={cfg.stages}
      ariaLabel="Supply chain identification technologies positioned across lifecycle stages in 2025, from blockchain track-and-trace at bleeding edge to Kimball tags at end of life"
      sourceText={cfg.source}
    />
  )
}

function Visual34_MLAIMoment() {
  const cfg = MOMENT_IN_TIME_CONFIGS[34]
  return (
    <MomentInTimeChart
      title={cfg.title}
      subtitle={cfg.subtitle}
      asOf={cfg.asOf}
      stages={cfg.stages}
      ariaLabel="ML/AI technologies positioned across lifecycle stages in 2025, from AGI at bleeding edge to expert system shells at end of life"
      sourceText={cfg.source}
    />
  )
}

function Visual35_LLMMoment() {
  const cfg = MOMENT_IN_TIME_CONFIGS[35]
  return (
    <MomentInTimeChart
      title={cfg.title}
      subtitle={cfg.subtitle}
      asOf={cfg.asOf}
      stages={cfg.stages}
      ariaLabel="Large language model technologies positioned across lifecycle stages in 2025, from persistent memory LLMs at bleeding edge to ELIZA at end of life"
      sourceText={cfg.source}
    />
  )
}

// ── Public export ──────────────────────────────────────────

export interface VisualDef {
  number: number
  id: string
  component: React.ComponentType<{ mode?: 'hd' | '4k' }>
}

export const VISUAL_CONFIG: VisualDef[] = [
  // ── PART 1: DEFINITIONS & FRAMEWORK (Slides 1-4) ─────────────────────
  { number: 1, id: 'adoption-process-flow', component: Visual01_AdoptionProcessFlow },
  { number: 2, id: 'adoption-framework-layers', component: Visual02_FrameworkLayers },
  {
    number: 3,
    id: 'voluntary-vs-involuntary-table',
    component: Visual03_VoluntaryVsInvoluntaryTable,
  },
  {
    number: 4,
    id: 'shelfware-vs-adopted-comparison',
    component: Visual04_ShelfwareVsAdoptedComparison,
  },

  // ── PART 2: STRATEGY & LIFECYCLE (Slides 5-8) ────────────────────────
  { number: 5, id: 'strategic-adoption-pillars', component: Visual05_StrategicAdoptionPillars },
  {
    number: 6,
    id: 'technology-lifecycle-positioning-diagram',
    component: Visual06_TechnologyLifecyclePositioningDiagram,
  },
  { number: 7, id: 'lifecycle-stages-matrix', component: Visual07_LifecycleStagesMatrix },
  { number: 8, id: 'strategic-positioning-target', component: Visual08_StrategicPositioningTarget },

  // ── PART 3: ARCHITECTURE & DECISIONS (Slides 9-12) ───────────────────
  {
    number: 9,
    id: 'architecture-approaches-comparison',
    component: Visual09_ArchitectureApproachesComparison,
  },
  {
    number: 10,
    id: 'lifecycle-architecture-mapping',
    component: Visual10_LifecycleArchitectureMapping,
  },
  { number: 11, id: 'lifecycle-planning-loop', component: Visual11_LifecyclePlanningLoop },
  {
    number: 12,
    id: 'adoption-driven-decisions-flow',
    component: Visual12_AdoptionDrivenDecisionsFlow,
  },

  // ── PART 4: EXECUTION & METRICS (Slides 13-16) ───────────────────────
  {
    number: 13,
    id: 'adoption-enabling-capabilities',
    component: Visual13_AdoptionEnablingCapabilities,
  },
  { number: 14, id: 'adoption-success-metrics', component: Visual14_AdoptionSuccessMetrics },
  { number: 15, id: 'phased-adoption-roadmap', component: Visual15_PhasedAdoptionRoadmap },
  {
    number: 16,
    id: 'adoption-best-practices-checklist',
    component: Visual16_AdoptionBestPracticesChecklist,
  },

  // ── TRANSITION (Slide 17) ────────────────────────────────────────────
  { number: 17, id: 'qa-transition-card', component: Visual17_QaTransitionCard },

  // ── PART 5: DEEP DIVES (Slides 18-25) ────────────────────────────────
  {
    number: 18,
    id: 'deep-dive-tech-stack-comparison',
    component: Visual18_DeepDiveTechStackComparison,
  },
  { number: 19, id: 'deep-dive-cloud-tiers', component: Visual19_DeepDiveCloudTiers },
  { number: 20, id: 'deep-dive-sourcing-strategy', component: Visual20_DeepDiveSourcingStrategy },
  { number: 21, id: 'deep-dive-anti-patterns', component: Visual21_DeepDiveAntiPatterns },
  { number: 22, id: 'deep-dive-roi-analysis', component: Visual22_DeepDiveRoiAnalysis },
  { number: 23, id: 'deep-dive-legacy-migration', component: Visual23_DeepDiveLegacyMigration },
  { number: 24, id: 'deep-dive-ai-friction', component: Visual24_DeepDiveAiFriction },
  { number: 25, id: 'deep-dive-lifecycle-cycles', component: Visual25_DeepDiveLifecycleCycles },
  { number: 26, id: 'deep-dive-trifecta-model', component: Visual26_DeepDiveTrifectaModel },

  // ── LIFECYCLE TIMELINE EXAMPLES (Slides 27-29) ──────────────
  {
    number: 27,
    id: 'hardware-lifecycle-timeline',
    component: Visual27_HardwareLifecycleTimeline,
  },
  {
    number: 28,
    id: 'software-lifecycle-timeline',
    component: Visual28_SoftwareLifecycleTimeline,
  },
  {
    number: 29,
    id: 'supply-chain-lifecycle-timeline',
    component: Visual29_SupplyChainLifecycleTimeline,
  },

  // ── MOMENT IN TIME COMPANIONS (Slides 30-32) ──────────────
  {
    number: 30,
    id: 'data-center-storage-moment',
    component: Visual30_DataCenterStorageMoment,
  },
  {
    number: 31,
    id: 'rich-web-experiences-moment',
    component: Visual31_RichWebExperiencesMoment,
  },
  {
    number: 32,
    id: 'supply-chain-id-moment',
    component: Visual32_SupplyChainIdMoment,
  },

  // ── ML/AI LIFECYCLE + MOMENT (Slides 33-35) ──────────────
  {
    number: 33,
    id: 'mlai-lifecycle-timeline',
    component: Visual33_MLAILifecycleTimeline,
  },
  {
    number: 34,
    id: 'mlai-moment',
    component: Visual34_MLAIMoment,
  },
  {
    number: 35,
    id: 'llm-moment',
    component: Visual35_LLMMoment,
  },
]

export const VISUAL_REGISTRY = Object.fromEntries(
  VISUAL_CONFIG.map((v) => [v.id, v.component])
) as Record<string, React.ComponentType<{ mode?: 'hd' | '4k' }>>

/**
 * Mapping of Slide Number (which corresponds to Visual Number in this deck) to Visual ID.
 * This is used by the client to resolve which visual to show for a given slide.
 */
export const SLIDE_TO_VISUAL_ID = Object.fromEntries(
  VISUAL_CONFIG.map((v) => [v.number, v.id])
) as Record<number, string>

export function PresentationVisual({ id, mode = 'hd' }: { id: string; mode?: 'hd' | '4k' }) {
  const Component = VISUAL_REGISTRY[id]
  if (!Component) return null
  return (
    <div className={mode === '4k' ? 'visual-4k-scale h-full w-full' : 'h-full w-full'}>
      <Component mode={mode} />
    </div>
  )
}
