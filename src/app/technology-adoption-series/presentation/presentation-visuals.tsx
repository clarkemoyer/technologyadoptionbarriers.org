import React, { type ReactNode } from 'react'

/* ────────────────────────────────────────────────────────────
   Dark-native visual components for the fullscreen presenter.
   These are ONLY used by the presentation route — the landing
   page continues to use the light-themed visuals in
   src/components/technology-adoption-series/slide-render.tsx.
   ──────────────────────────────────────────────────────────── */

// ── Shared primitives ──────────────────────────────────────

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 ${className}`}>
    {children}
  </div>
)

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

// ── Per-slide visuals ──────────────────────────────────────

function Visual1() {
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

function Visual2() {
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

function Visual3() {
  const rows = [
    { factor: 'User Engagement', vol: 'High', invol: 'Low' },
    { factor: 'Training Effectiveness', vol: 'Self-motivated', invol: 'Forced compliance' },
    { factor: 'Innovation / Feedback', vol: 'Active contribution', invol: 'Minimal' },
    { factor: 'Sustainability', vol: 'Self-sustaining', invol: 'Requires enforcement' },
    { factor: 'Organizational Risk', vol: 'Lower', invol: 'Higher (workarounds)' },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-700/50">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-800/80">
              <th className="px-5 py-4 text-base font-bold text-slate-300">Factor</th>
              <th className="px-5 py-4 text-base font-bold text-emerald-400">Voluntary ✅</th>
              <th className="px-5 py-4 text-base font-bold text-amber-400">Involuntary ⚠️</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.factor} className={i % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'}>
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

function Visual4() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-3xl grid-cols-2 gap-6">
        <Card className="border-red-500/30">
          <div className="flex items-center gap-3">
            <IconX />
            <CardLabel>Shelf-ware</CardLabel>
          </div>
          <CardBody>Deployed, but not used.</CardBody>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="bad">No user input</Badge>
            <Badge tone="bad">Too complex</Badge>
            <Badge tone="bad">Workarounds</Badge>
          </div>
        </Card>
        <Card className="border-emerald-500/30">
          <div className="flex items-center gap-3">
            <IconCheck />
            <CardLabel>Adopted</CardLabel>
          </div>
          <CardBody>Used to complete real tasks.</CardBody>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="good">User-centered</Badge>
            <Badge tone="good">Clear value</Badge>
            <Badge tone="good">Fits workflows</Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Visual5({ mode }: { mode?: 'hd' | '4k' }) {
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

function Visual6() {
  const sw = 20
  // Standard 16:9 Canvas (1600 x 900)
  // Left Center
  const cL = { x: 450, y: 450 }
  // Right Center
  const cR = { x: 1150, y: 450 }
  const r = 220

  // Text Sizes (SVG scale)
  const tsLg = 42 // Main labels
  const tsMd = 36 // Secondary

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 1600 900"
        className="h-full w-full"
        role="img"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
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

function Visual7() {
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

function Visual8() {
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
          Bleeding Edge — monitor only
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
          Leading Edge — target ✅
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
          Mainstream — target ✅
        </text>
        {/* Bottom label */}
        <text x="100" y="225" fontSize="13" fill="#64748b">
          Trending Behind — cloud enabling only
        </text>
        <text x="50" y="265" fontSize="13" fill="#475569">
          End of Support — avoid / migrate
        </text>
      </svg>
    </div>
  )
}

function Visual9() {
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

function Visual10() {
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
      <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-slate-700/50">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-800/80">
              <th className="px-4 py-3 text-base font-bold text-slate-300">Lifecycle</th>
              <th className="px-4 py-3 text-base font-bold text-slate-300">Cloud Enabling</th>
              <th className="px-4 py-3 text-base font-bold text-slate-300">Cloud Native</th>
              <th className="px-4 py-3 text-base font-bold text-slate-300">Cloud Agnostic</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.stage} className={i % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'}>
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

function Visual11() {
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

function Visual12() {
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

function Visual13() {
  const cards = [
    {
      title: 'Graceful Degradation',
      body: 'Users trust the system — it fails safely and recovers quickly.',
    },
    { title: 'Scalable Deployment', body: 'Deploy where users operate, not vice versa.' },
    {
      title: 'Resilient Operations',
      body: 'Works in degraded conditions — no workarounds needed.',
    },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid w-full max-w-4xl grid-cols-3 gap-5">
        {cards.map((c) => (
          <Card key={c.title} className="border-cyan-500/20">
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

function Visual14() {
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

function Visual15() {
  const phases = [
    { label: 'Design with representative users', note: 'Requirements validated' },
    { label: 'Develop with frequent user testing', note: 'Iterative feedback' },
    { label: 'Pilot with early adopters', note: 'Positive feedback' },
    { label: 'Expand as demand grows (voluntary)', note: 'Advocacy to peers' },
    { label: 'Scaled adoption — self-sustaining', note: 'User-driven roadmap' },
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

function Visual16() {
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

function Visual17() {
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

function Visual21() {
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

function Visual24() {
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
          <span className="font-semibold text-cyan-400">explainability</span>, and governance — not
          just model accuracy.
        </div>
      </div>
    </div>
  )
}

// ── Visual components for optional deep-dives (18–23) ──────

function Visual18() {
  const examples = [
    { category: 'Container Orchestration', mainstream: 'Kubernetes', behind: 'Docker Swarm' },
    { category: 'IaC', mainstream: 'Terraform / Ansible', behind: 'Chef / Puppet' },
    { category: 'Languages', mainstream: 'Python / Java / JS', behind: 'Perl / Ruby (cloud)' },
    { category: 'CI/CD', mainstream: 'GitLab CI / GitHub Actions', behind: 'Travis CI' },
  ]
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-slate-700/50">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-800/80">
              <th className="px-5 py-4 text-base font-bold text-slate-300">Category</th>
              <th className="px-5 py-4 text-base font-bold text-emerald-400">Mainstream ✅</th>
              <th className="px-5 py-4 text-base font-bold text-amber-400">Trending Behind ⚠️</th>
            </tr>
          </thead>
          <tbody>
            {examples.map((r, i) => (
              <tr key={r.category} className={i % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'}>
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

function Visual19() {
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

function Visual20() {
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
        <span className="font-semibold text-cyan-400">&ldquo;Best tool for the job&rdquo;</span> —
        evaluate based on mission, lifecycle position, and adoption implications.
      </div>
    </div>
  )
}

function Visual22() {
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

function Visual23() {
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
        <span className="font-semibold text-amber-300">involuntary adoption</span> —
        over-communicate, train extensively, and move fast.
      </div>
    </div>
  )
}

// ── Public export ──────────────────────────────────────────

// ── Public export ──────────────────────────────────────────

export interface VisualDef {
  number: number
  id: string
  component: React.ComponentType<{ mode?: 'hd' | '4k' }>
}

export const VISUAL_CONFIG: VisualDef[] = [
  { number: 1, id: 'adoption-process-flow', component: Visual1 },
  { number: 2, id: 'adoption-framework-layers', component: Visual2 },
  { number: 3, id: 'voluntary-vs-involuntary-table', component: Visual3 },
  { number: 4, id: 'shelfware-vs-adopted-comparison', component: Visual4 },
  { number: 5, id: 'strategic-adoption-pillars', component: Visual5 },
  { number: 6, id: 'technology-lifecycle-positioning-diagram', component: Visual6 },
  { number: 7, id: 'lifecycle-stages-matrix', component: Visual7 },
  { number: 8, id: 'strategic-positioning-target', component: Visual8 },
  { number: 9, id: 'architecture-approaches-comparison', component: Visual9 },
  { number: 10, id: 'lifecycle-architecture-mapping', component: Visual10 },
  { number: 11, id: 'lifecycle-planning-loop', component: Visual11 },
  { number: 12, id: 'adoption-driven-decisions-flow', component: Visual12 },
  { number: 13, id: 'adoption-enabling-capabilities', component: Visual13 },
  { number: 14, id: 'adoption-success-metrics', component: Visual14 },
  { number: 15, id: 'phased-adoption-roadmap', component: Visual15 },
  { number: 16, id: 'adoption-best-practices-checklist', component: Visual16 },
  { number: 17, id: 'qa-transition-card', component: Visual17 },
  { number: 18, id: 'deep-dive-tech-stack-comparison', component: Visual18 },
  { number: 19, id: 'deep-dive-cloud-tiers', component: Visual19 },
  { number: 20, id: 'deep-dive-sourcing-strategy', component: Visual20 },
  { number: 21, id: 'deep-dive-anti-patterns', component: Visual21 },
  { number: 22, id: 'deep-dive-roi-analysis', component: Visual22 },
  { number: 23, id: 'deep-dive-legacy-migration', component: Visual23 },
  { number: 24, id: 'deep-dive-ai-friction', component: Visual24 },
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
