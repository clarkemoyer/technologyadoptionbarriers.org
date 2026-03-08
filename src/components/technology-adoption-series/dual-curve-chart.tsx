/**
 * Shared dual-curve lifecycle chart used on slide 6.
 * Shows innovation potential (cyan dashed) vs adoption risk (amber solid)
 * with a highlighted "Target Zone" (Leading Edge → Mainstream).
 */

const STAGES = [
  { x: 100, label: 'Bleeding Edge' },
  { x: 190, label: 'Leading Edge' },
  { x: 290, label: 'Mainstream' },
  { x: 390, label: 'Trending Behind' },
  { x: 480, label: 'End of Support' },
]

const INNOV_Y = [55, 72, 145, 195, 220]
const RISK_Y = [60, 120, 205, 150, 65]

function buildCurvePath(yValues: number[], offsets: number[][]): string {
  let d = `M${STAGES[0].x} ${yValues[0]}`
  for (let i = 0; i < STAGES.length - 1; i++) {
    const [cpOff1, cpOff2] = offsets[i]
    d += ` C${STAGES[i].x + cpOff1} ${yValues[i] + (offsets[i][2] ?? 0)},${STAGES[i + 1].x - cpOff2} ${yValues[i + 1] + (offsets[i][3] ?? 0)},${STAGES[i + 1].x} ${yValues[i + 1]}`
  }
  return d
}

const INNOV_PATH = buildCurvePath(INNOV_Y, [
  [35, 35, 0, 0],
  [50, 50, 18, 0],
  [50, 50, 12, 0],
  [40, 40, 10, 0],
])

const RISK_PATH = buildCurvePath(RISK_Y, [
  [40, 40, 25, 0],
  [50, 50, 35, 0],
  [50, 50, -25, 0],
  [40, 40, -35, 0],
])

interface DualCurveChartProps {
  /** Unique ID prefix for SVG gradient defs to avoid collisions when rendered multiple times. */
  gradientId: string
  /** 'card' renders with outlined markers and bolder labels; 'slide' uses filled markers. */
  variant?: 'card' | 'slide'
}

export function DualCurveChart({ gradientId, variant = 'slide' }: DualCurveChartProps) {
  const isCard = variant === 'card'

  return (
    <div className="overflow-x-auto w-full flex justify-center bg-slate-900 rounded p-4">
      <svg
        viewBox="0 0 560 280"
        className="w-full max-w-full"
        role="img"
        aria-label="Technology lifecycle: innovation potential vs adoption risk showing Leading Edge to Mainstream as target zone"
        style={{ maxHeight: '400px' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
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

        {/* Sweet-spot zone */}
        <rect
          x={STAGES[1].x - 12}
          y="35"
          width={STAGES[2].x - STAGES[1].x + 24}
          height="190"
          rx="6"
          fill={`url(#${gradientId})`}
          {...(isCard
            ? {
                stroke: '#22d3ee',
                strokeWidth: 0.8,
                strokeDasharray: '3 2',
                strokeOpacity: 0.4,
              }
            : {})}
        />
        <text
          x={(STAGES[1].x + STAGES[2].x) / 2}
          y={isCard ? 46 : 48}
          textAnchor="middle"
          fontSize={isCard ? 9 : 8}
          fontWeight={isCard ? 600 : undefined}
          fill="#22d3ee"
          opacity="0.7"
        >
          {isCard ? 'TARGET ZONE' : 'Target Zone'}
        </text>

        {/* Innovation potential curve (cyan dashed) */}
        <path d={INNOV_PATH} fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 3" />

        {/* Adoption risk curve (amber solid) */}
        <path d={RISK_PATH} fill="none" stroke="#f59e0b" strokeWidth="2" />

        {/* Stage markers and labels */}
        {STAGES.map((s, i) => (
          <g key={s.label}>
            {isCard ? (
              <>
                <circle
                  cx={s.x}
                  cy={INNOV_Y[i]}
                  r="4"
                  fill="#0f172a"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />
                <circle
                  cx={s.x}
                  cy={RISK_Y[i]}
                  r="4"
                  fill="#0f172a"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
              </>
            ) : (
              <>
                <circle cx={s.x} cy={INNOV_Y[i]} r="3" fill="#22d3ee" />
                <circle cx={s.x} cy={RISK_Y[i]} r="3" fill="#f59e0b" />
              </>
            )}
            <text
              x={s.x}
              y={isCard ? 245 : 246}
              textAnchor="middle"
              fontSize={isCard ? 9 : 8}
              fontWeight={isCard ? 600 : undefined}
              fill={isCard ? '#e2e8f0' : '#94a3b8'}
            >
              {s.label}
            </text>
          </g>
        ))}

        {/* Legend */}
        <line
          x1={isCard ? 70 : 100}
          y1="268"
          x2={isCard ? 90 : 120}
          y2="268"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeDasharray={isCard ? '5 2' : '6 3'}
        />
        <text x={isCard ? 94 : 124} y="271" fontSize={isCard ? 9 : 7} fill="#94a3b8">
          Innovation Potential
        </text>
        <line
          x1={isCard ? 220 : 250}
          y1="268"
          x2={isCard ? 240 : 270}
          y2="268"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <text x={isCard ? 244 : 274} y="271" fontSize={isCard ? 9 : 7} fill="#94a3b8">
          Adoption Risk
        </text>
        <rect
          x={isCard ? 350 : 390}
          y={isCard ? 263 : 264}
          width="10"
          height="8"
          rx={isCard ? 1.5 : 2}
          fill="#22d3ee"
          fillOpacity="0.15"
          {...(isCard
            ? { stroke: '#22d3ee', strokeWidth: 0.5, strokeOpacity: 0.4 }
            : { opacity: 0.15 })}
        />
        <text x={isCard ? 364 : 404} y="271" fontSize={isCard ? 9 : 7} fill="#94a3b8">
          Sweet Spot
        </text>
      </svg>
    </div>
  )
}
