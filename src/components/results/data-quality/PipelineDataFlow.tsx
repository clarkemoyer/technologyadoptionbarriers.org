import Link from 'next/link'
import { H2_CLASSES, H3_CLASSES, PARAGRAPH_CLASSES } from '@/lib/articleStyles'

/**
 * Pipeline & Data Flow diagram (issue #1839 - permanent home for the
 * defense-presentation flow diagram). 11-stage daily-pipeline visualization
 * rendered as accessible vertical flow cards (HTML, no SVG dependency).
 *
 * Each stage links to the most relevant TABS results page so a reviewer can
 * jump from "what does Stage 7 produce?" to the actual statistics that
 * stage emits. Stages without a downstream results page (data ops, commit)
 * link to GitHub source instead.
 *
 * Drop into both /results/data-quality and /results/crp-2026/data-quality.
 * The smoke test asserts the section heading 'Pipeline and Data Flow' is
 * present so a future regression auto-files an issue.
 */

type StageColor = 'blue' | 'cyan' | 'amber' | 'emerald' | 'purple' | 'gray'

const COLOR_MAP: Record<StageColor, { bg: string; border: string; head: string; text: string }> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    head: 'bg-blue-600',
    text: 'text-blue-900',
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-300',
    head: 'bg-cyan-600',
    text: 'text-cyan-900',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    head: 'bg-amber-600',
    text: 'text-amber-900',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    head: 'bg-emerald-600',
    text: 'text-emerald-900',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    head: 'bg-purple-600',
    text: 'text-purple-900',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    head: 'bg-gray-600',
    text: 'text-gray-900',
  },
}

type Stage = {
  num: string
  title: string
  phase: string
  source: string
  description: string
  outputs: string[]
  href: string
  color: StageColor
}

const STAGES: Stage[] = [
  {
    num: '1',
    title: 'Fetch Prolific Data',
    phase: 'Phase 1',
    source: 'scripts/analysis/fetch_prolific_data.py',
    description:
      'Pulls per-participant auth-check scores and submission statuses (AWAITING REVIEW / APPROVED / REJECTED) from the Prolific API. ~10 seconds.',
    outputs: ['Prolific submission JSON', 'auth check pass/fail per participant'],
    href: '/results/dashboard',
    color: 'blue',
  },
  {
    num: '2',
    title: 'Export Qualtrics CSV',
    phase: 'Phase 2.1',
    source: 'scripts/analysis/export_qualtrics.py',
    description:
      'Exports the survey response CSV from the Qualtrics API for the active TABS V2 survey. 3-header-row format with question text and import IDs.',
    outputs: ['raw Qualtrics CSV (ephemeral, runner-only)'],
    href: '/results/survey-stats',
    color: 'cyan',
  },
  {
    num: '3',
    title: 'Enrich + Join',
    phase: 'Phase 2.2',
    source: 'scripts/analysis/enrich_qualtrics_csv.py',
    description:
      'Joins each Qualtrics row to the Prolific submission record on PROLIFIC_PID, attaching the auth-check verdict and the demographic roster.',
    outputs: ['enriched CSV (ephemeral, runner-only - contains PII)'],
    href: '/making-of-tabs/data-analysis',
    color: 'cyan',
  },
  {
    num: '4',
    title: 'Disposition Audit',
    phase: 'Phase 2.3',
    source: 'scripts/analysis/tabs_v2_data_audit.py',
    description:
      '11-step waterfall classifier: each response is assigned exactly one disposition - CLEAN, AWAITING REVIEW, FLAG, or AUTO-EXCLUDE - based on duration, IRI failures, and content checks.',
    outputs: ['disposition CSV (1-day artifact)', 'disposition-summary.json'],
    href: '/results/data-quality',
    color: 'amber',
  },
  {
    num: '5',
    title: 'De-identify Public Dataset',
    phase: 'Phase 2.4',
    source: 'scripts/analysis/tabs_v2_data_audit.py',
    description:
      'Strips PROLIFIC_PID and other direct identifiers, producing the public dataset that ships in the repo. The original PID column never leaves the runner.',
    outputs: ['public/datasets/TABS_V2_CRP_2026_public_dataset.csv'],
    href: '/results/reproducibility',
    color: 'amber',
  },
  {
    num: '6',
    title: 'Descriptive Analysis',
    phase: 'Phase 2.5',
    source: 'scripts/analysis/tabs_v2_analysis.py',
    description:
      'Means, SDs, skewness, kurtosis, inter-construct correlations, top-3 forced-choice tallies. Run once per sample tier.',
    outputs: ['sensitivity-analysis.json (per-sample stats)'],
    href: '/results/descriptive',
    color: 'emerald',
  },
  {
    num: '7',
    title: 'Advanced Analysis',
    phase: 'Phase 2.6',
    source: 'scripts/analysis/tabs_v2_advanced.py',
    description:
      'Effect sizes (Cohen d), t-tests, ANOVA, regression on demographic groupings, cross-tabs. Per sample tier.',
    outputs: ['effect-size and inferential blocks in sensitivity JSON'],
    href: '/results/findings',
    color: 'emerald',
  },
  {
    num: '8',
    title: 'Psychometrics / Validation',
    phase: 'Phase 2.7',
    source: 'scripts/analysis/tabs_v2_unified_data_analysis.py',
    description:
      "Cronbach's alpha, McDonald's omega, KMO, Bartlett, EFA, CFA (ML + DWLS), HTMT, HTMT2, bifactor, second-order, multigroup, ESEM, IRT GRM, Mardia normality, Mahalanobis outliers. Emits the 28+ keys consumed by /results/validation, /results/factor-analysis, /results/reliability, /results/findings.",
    outputs: [
      'src/data/crp-validation.json',
      'src/data/live-validation.json',
      '28 new top-level keys (PR #1837)',
    ],
    href: '/results/validation',
    color: 'purple',
  },
  {
    num: '9',
    title: 'Quality Audit',
    phase: 'Phase 2.8',
    source: 'scripts/analysis/tabs_v2_quality_audit.py',
    description:
      'Outlier detection (Mahalanobis, Cook distance), common-method-variance check, missing-data pattern audit. Cross-checks earlier stages.',
    outputs: ['quality block in unified analysis JSON'],
    href: '/results/validation',
    color: 'purple',
  },
  {
    num: '10',
    title: 'Operations',
    phase: 'Phase 3',
    source: 'scripts/analysis/{approve,message,reject}_*.py',
    description:
      'Auto-approves CLEAN dispositions on Prolific, sends per-disposition messages to FLAG participants, generates the live dashboard JSON.',
    outputs: ['approval / message side effects on Prolific'],
    href: '/results/dashboard',
    color: 'gray',
  },
  {
    num: '11',
    title: 'Commit Results + Daily Report',
    phase: 'Phase 4-5',
    source: '.github/workflows/daily-pipeline.yml',
    description:
      'Commits the regenerated JSONs to the repo via the format-and-pr action and files a daily disposition report issue. Triggers the deploy chain that pushes the updated site.',
    outputs: ['committed JSONs in src/data/', 'daily report issue'],
    href: 'https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/.github/workflows/daily-pipeline.yml',
    color: 'gray',
  },
]

function StageCard({ stage }: { stage: Stage }) {
  const c = COLOR_MAP[stage.color]
  const isExternal = stage.href.startsWith('http')
  const Inner = (
    <div className={`rounded-lg border-2 ${c.border} ${c.bg} overflow-hidden`}>
      <div className={`${c.head} text-white px-3 py-2 flex items-baseline gap-2`}>
        <span className="font-mono font-bold text-base">Stage {stage.num}</span>
        <span className="text-xs opacity-90">- {stage.phase}</span>
      </div>
      <div className="p-3">
        <h3 className={`${H3_CLASSES} ${c.text} mt-0 mb-1 text-base`}>{stage.title}</h3>
        <p className="text-sm text-gray-700 mb-2">{stage.description}</p>
        <p className="text-xs text-gray-500 font-mono break-all mb-2">{stage.source}</p>
        <div>
          <p className="text-xs font-semibold text-gray-700">Outputs:</p>
          <ul className="text-xs text-gray-700 list-disc list-inside">
            {stage.outputs.map((o) => (
              <li key={o} className="font-mono break-all">
                {o}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-2 text-xs">
          <span className="text-gray-600">Surfaced on: </span>
          {isExternal ? (
            <a
              href={stage.href}
              className="text-blue-700 hover:underline font-mono break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {stage.href}
            </a>
          ) : (
            <Link href={stage.href} className="text-blue-700 hover:underline font-mono">
              {stage.href}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
  return Inner
}

function FlowConnector() {
  return (
    <div aria-hidden="true" className="flex flex-col items-center my-2">
      <div className="w-0.5 h-4 bg-gray-400" />
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-400" />
    </div>
  )
}

/**
 * Vertical pipeline flow. Stage cards are clickable to navigate to the
 * results page that surfaces the stage's output.
 */
export function PipelineDataFlow() {
  return (
    <section className="mb-12 text-gray-800">
      <h2 className={H2_CLASSES}>Pipeline and Data Flow</h2>
      <p className={PARAGRAPH_CLASSES}>
        The TABS daily pipeline runs 11 stages end-to-end every morning at 09:00 UTC, plus on-demand
        via <code className="font-mono text-sm">workflow_dispatch</code>. Each stage produces a
        specific output that surfaces somewhere on this site. The diagram below traces a single
        response from Qualtrics export to the committed JSON that drives every results page. Click
        any stage to jump to where its output is visible.
      </p>
      <p className="mb-6 text-sm text-gray-600 font-sans">
        Phase numbering matches{' '}
        <Link
          href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/.github/workflows/daily-pipeline.yml"
          className="text-blue-700 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          .github/workflows/daily-pipeline.yml
        </Link>
        . Stages 6-9 emit the per-sample blocks consumed by the validation, factor-analysis,
        reliability, and findings pages.
      </p>

      <ol className="list-none p-0 m-0">
        {STAGES.map((stage, i) => (
          <li key={stage.num} className="block">
            <StageCard stage={stage} />
            {i < STAGES.length - 1 && <FlowConnector />}
          </li>
        ))}
      </ol>
    </section>
  )
}
