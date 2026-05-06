import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
import voiceData from '@/data/participant-voice.json'

export const metadata: Metadata = {
  title: 'Participant Voice - TABS Results',
  description:
    'Open-ended feedback from 162 of 200 TABS survey respondents (81% engagement). Curated quotes alongside theme distributions and length-of-engagement buckets.',
  alternates: {
    canonical: '/results/participant-voice',
  },
}

// Theme labels for the user-facing display. Kept here (not in the JSON)
// because they are presentation choices, not data: the JSON keys are
// machine-tokens emitted by the local categorizer.
const THEME_LABEL: Record<string, string> = {
  null_short: 'No additional comment',
  positive_meta: '"You covered everything"',
  praise: 'Praise / thanks',
  skills_training: 'Workforce skills & training',
  org_dynamics: 'Leadership, culture, change',
  budget_cost: 'Budget & cost',
  ai_ml: 'AI / ML adoption',
  legacy_integration: 'Legacy systems & integration',
  mentions_industry: 'Sector-specific concern',
  pace_speed: 'Pace of change',
  survey_design: 'Survey scale design',
  vendor_third_party: 'Vendors & third parties',
  mentions_role: 'Role-specific concern',
  security_compliance: 'Security & compliance',
  cloud: 'Cloud / SaaS',
  survey_too_short: 'Survey could be longer',
  survey_too_long: 'Survey was too long',
  confusion: 'Found a question confusing',
  strategy_vision: 'Strategy / vision',
  ask_for_more: 'Wanted more questions on...',
  luck_close: 'Encouragement / good luck',
}

const LENGTH_LABEL: Record<string, string> = {
  micro: 'Micro (≤ 10 chars)',
  short: 'Short (11–50 chars)',
  medium: 'Medium (51–200 chars)',
  long: 'Long (201–500 chars)',
  essay: 'Essay (> 500 chars)',
}

const ParticipantVoicePage = () => {
  const {
    stats,
    quotes,
    source_prompt: sourcePrompt,
    selection_method: selectionMethod,
  } = voiceData

  const totalQuotes =
    quotes.praise.length + quotes.insight.length + quotes.critique.length + quotes.essay.length

  return (
    <div className="bg-white pt-20 sm:pt-[120px]">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Participant Voice</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            Quantitative results tell us <em>what</em> respondents experienced; the open-ended
            feedback question tells us <em>how they talk about it</em>. {stats.total_responses} of{' '}
            {stats.respondents_in_dataset} respondents ({stats.engagement_rate_pct}%) wrote
            something in the optional Q74 feedback box. Some wrote a single word; one wrote nearly
            700 characters. This page surfaces what they said.
          </p>
          <p className="mb-6 text-sm text-gray-600">
            Prompt as shown to respondents: <em>&ldquo;{sourcePrompt}&rdquo;</em>
          </p>
        </section>

        {/* ── Engagement scoreboard ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Engagement at a glance</h2>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.engagement_rate_pct}%</div>
              <div className="mt-1 text-sm font-medium text-gray-700">Wrote feedback</div>
              <div className="mt-1 text-xs text-gray-500">
                {stats.total_responses} / {stats.respondents_in_dataset}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.substantive_rate_pct}%</div>
              <div className="mt-1 text-sm font-medium text-gray-700">Added new content</div>
              <div className="mt-1 text-xs text-gray-500">
                {stats.substantive_count} substantive
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.length_distribution.essay}
              </div>
              <div className="mt-1 text-sm font-medium text-gray-700">Mini-essays</div>
              <div className="mt-1 text-xs text-gray-500">&gt; 500 characters each</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">
                {Object.keys(stats.theme_distribution).length}
              </div>
              <div className="mt-1 text-sm font-medium text-gray-700">Distinct themes</div>
              <div className="mt-1 text-xs text-gray-500">categorized post-hoc</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Engagement was high but uneven: about a third of responses added new substantive
            content, a third were brief affirmations of the survey itself, and a third were short
            &ldquo;no further comment&rdquo; placeholders. The numerical-result pages report on what
            the survey <em>asked</em>; this page reports on what respondents felt was missing or
            worth elaborating.
          </p>
        </section>

        {/* ── Length distribution ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How much did people write?</h2>
          <p className="mb-4">
            Length is a useful engagement signal. Short responses tend to be courtesy
            (&ldquo;thanks&rdquo;); medium and long responses are where the real content lives.
          </p>
          <div className="mb-4 overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b border-gray-200 p-3 text-left font-semibold">
                    Length bucket
                  </th>
                  <th className="border-b border-gray-200 p-3 text-right font-semibold">
                    Responses
                  </th>
                  <th className="border-b border-gray-200 p-3 text-right font-semibold">
                    % of feedback
                  </th>
                </tr>
              </thead>
              <tbody>
                {(['micro', 'short', 'medium', 'long', 'essay'] as const).map((bucket) => {
                  const n = stats.length_distribution[bucket] ?? 0
                  const pct = stats.total_responses
                    ? Math.round((n * 100) / stats.total_responses)
                    : 0
                  return (
                    <tr key={bucket} className="border-b border-gray-100">
                      <td className="p-3 font-medium">{LENGTH_LABEL[bucket]}</td>
                      <td className="p-3 text-right">{n}</td>
                      <td className="p-3 text-right">{pct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600">
            The {stats.length_distribution.essay} mini-essays (each over 500 characters) are
            highlighted on their own below — they read like talk-aloud reflections rather than
            survey answers, and several anticipate themes we plan to investigate in the next survey
            iteration.
          </p>
        </section>

        {/* ── Theme distribution ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>What did they talk about?</h2>
          <p className="mb-4">
            Each response was tagged with one or more theme labels via a regex categorizer; one
            response can match multiple themes. Themes ranked by frequency:
          </p>
          <div className="mb-4 overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b border-gray-200 p-3 text-left font-semibold">Theme</th>
                  <th className="border-b border-gray-200 p-3 text-right font-semibold">
                    Responses
                  </th>
                  <th className="border-b border-gray-200 p-3 text-right font-semibold">
                    % of 162
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.theme_distribution).map(([theme, n]) => {
                  const pct = stats.total_responses
                    ? Math.round((n * 100) / stats.total_responses)
                    : 0
                  return (
                    <tr key={theme} className="border-b border-gray-100">
                      <td className="p-3 font-medium">{THEME_LABEL[theme] ?? theme}</td>
                      <td className="p-3 text-right">{n}</td>
                      <td className="p-3 text-right">{pct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Curated quotes ── */}
        {totalQuotes === 0 ? (
          <section className="mb-12 text-gray-800">
            <h2 className={H2_CLASSES}>Selected quotes</h2>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>Curation in progress.</strong> Verbatim respondent quotes are reviewed for
              identifying detail (employer names, sector-specific phrasing) before publication. The
              aggregate stats above are already final; the quote selections below will appear once
              review is complete.
            </div>
          </section>
        ) : (
          <>
            {quotes.essay.length > 0 && (
              <QuoteSection
                title="Mini-essays"
                description="Long-form responses where the participant treated the feedback box as a place to think out loud. These are the closest thing the dataset has to interview transcripts."
                quotes={quotes.essay}
              />
            )}
            {quotes.insight.length > 0 && (
              <QuoteSection
                title="What participants would have asked about"
                description="Responses that named additional barriers, sectors, or dynamics the structured items didn't cover. These directly inform v3 instrument design."
                quotes={quotes.insight}
              />
            )}
            {quotes.critique.length > 0 && (
              <QuoteSection
                title="Critiques of the instrument itself"
                description="Where respondents pushed back on the survey design (scale gradations, specific phrasings). These are gifts; future iterations should address them."
                quotes={quotes.critique}
              />
            )}
            {quotes.praise.length > 0 && (
              <QuoteSection
                title="Affirmations"
                description="Short positive feedback on the survey. Useful as engagement signal even though it doesn't change instrument design."
                quotes={quotes.praise}
              />
            )}
          </>
        )}

        {/* ── Method note ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How quotes were selected</h2>
          <p className="mb-4 text-sm text-gray-700">{selectionMethod}</p>
          <p className="text-sm text-gray-600">
            The full set of 162 responses lives in the public dataset (the{' '}
            <code className="rounded bg-gray-200 px-1 py-0.5 text-xs">Q74_Feedback</code> column of{' '}
            <code className="rounded bg-gray-200 px-1 py-0.5 text-xs">
              TABS_V2_CRP_2026_public_dataset.csv
            </code>
            ). Anyone can do their own thematic analysis from source.
          </p>
        </section>

        <section className="border-t border-gray-200 pt-8">
          <p className="mb-2 text-sm font-medium text-gray-700">Related</p>
          <ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
            <li>
              <Link
                href="/results/findings"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Key Findings
              </Link>{' '}
              — the quantitative side of these themes
            </li>
            <li>
              <Link href="/results/sample" className="text-blue-600 underline hover:text-blue-800">
                Sample &amp; Demographics
              </Link>{' '}
              — who these 162 voices belong to in aggregate
            </li>
            <li>
              <Link href="/results" className="text-blue-600 underline hover:text-blue-800">
                ← Back to Results Overview
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}

interface Quote {
  id: string
  text: string
  char_count: number
  themes: string[]
  edited: boolean
}

const QuoteSection = ({
  title,
  description,
  quotes,
}: {
  title: string
  description: string
  quotes: Quote[]
}) => (
  <section className="mb-12 text-gray-800">
    <h2 className={H2_CLASSES}>{title}</h2>
    <p className="mb-6 text-sm text-gray-600">{description}</p>
    <div className="space-y-6">
      {quotes.map((q) => (
        <figure
          key={q.id}
          className="rounded-lg border-l-4 border-blue-300 bg-gray-50 p-4 text-gray-800"
        >
          <blockquote className="mb-3 italic">&ldquo;{q.text}&rdquo;</blockquote>
          <figcaption className="text-xs text-gray-600">
            <span className="font-mono">{q.id}</span>
            {q.themes.length > 0 && (
              <>
                {' · '}
                <span>
                  {q.themes
                    .map((t) => THEME_LABEL[t] ?? t)
                    .filter((t, i, a) => a.indexOf(t) === i)
                    .join(', ')}
                </span>
              </>
            )}
            {q.edited && (
              <>
                {' · '}
                <span className="italic">excerpted</span>
              </>
            )}
            {' · '}
            <span>{q.char_count} chars</span>
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
)

export default ParticipantVoicePage
