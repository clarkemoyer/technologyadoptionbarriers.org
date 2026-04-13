import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Automation Infrastructure - Making of TABS',
  description:
    'How the TABS project automates the full lifecycle from issue assignment to human review - daily data pipelines, privacy-safe boundaries, AI agent coordination, and dependency provenance.',
  alternates: {
    canonical: '/making-of-tabs/automation-infrastructure',
  },
}

const AutomationInfrastructurePage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Automation Infrastructure</h1>

        <p className="text-gray-600 mb-8">
          TABS is operated almost entirely through automated pipelines. This page documents the two
          main chains: the hands-off coding workflow that takes a GitHub Issue to a merged PR
          without any human writing code, and the daily data pipeline that processes Prolific
          submissions, runs analysis, and commits results - all without a human pressing a button.
        </p>

        {/* Section 1: The hands-off chain */}
        <section className="mb-10">
          <h2 className={H2_CLASSES}>The Hands-Off Chain</h2>
          <p className="mb-4">
            Every feature and fix follows an eight-step chain from GitHub Issue to merged PR. No
            human writes code; the workflow is purely assignment, review, and approval.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Step</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Actor</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Action</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Output</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    '1',
                    'Human',
                    'Creates a GitHub Issue describing the task',
                    'Issue assigned to @Copilot or Claude Code',
                  ],
                  [
                    '2',
                    'Copilot / Claude',
                    'Reads the issue, explores the codebase, plans and implements the change',
                    'Branch + commits pushed to GitHub',
                  ],
                  [
                    '3',
                    'GitHub Actions',
                    'CI runs: format check, lint, unit tests, build, Playwright E2E',
                    'Green or red status on the PR',
                  ],
                  [
                    '4',
                    'Copilot PR Review',
                    'Automatically reviews the PR diff for correctness, style, and security',
                    'Inline review comments on the PR',
                  ],
                  [
                    '5',
                    'Copilot / Claude',
                    'Reads review comments, applies fixes, pushes updated commits',
                    'PR updated; CI re-runs',
                  ],
                  [
                    '6',
                    'GitHub Actions',
                    'CI re-runs on the updated commits',
                    'Green or red status',
                  ],
                  [
                    '7',
                    'Human',
                    'Reviews the final diff and CI results; approves if satisfied',
                    'PR approval recorded',
                  ],
                  [
                    '8',
                    'GitHub',
                    'Merge queue runs final checks; merges to main and deploys to GitHub Pages',
                    'Feature live on technologyadoptionbarriers.org',
                  ],
                ].map(([step, actor, action, output]) => (
                  <tr key={step} className="border-b border-gray-100">
                    <td className="p-3 font-bold text-gray-600">{step}</td>
                    <td className="p-3 font-medium">{actor}</td>
                    <td className="p-3 text-gray-700">{action}</td>
                    <td className="p-3 text-gray-600">{output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Daily data pipeline */}
        <section className="mb-10">
          <h2 className={H2_CLASSES}>Daily Data Pipeline</h2>
          <p className="mb-4">
            A GitHub Actions workflow (<code>daily-pipeline.yml</code>) runs every morning. The
            workflow runs a seven-phase chain that processes Prolific submissions, exports and
            analyzes Qualtrics responses, and commits updated JSON artifacts - all without manual
            intervention.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Phase</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                  <th className="text-left p-3 font-semibold text-gray-700">What it does</th>
                  <th className="text-left p-3 font-semibold text-gray-700">GitHub Environment</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    '1',
                    'Fetch',
                    'Pulls auth checks and submission statuses from the Prolific API; produces a disposition CSV artifact',
                    'prolific-prod',
                  ],
                  [
                    '2',
                    'Analyze',
                    'Exports Qualtrics survey responses, enriches with Prolific status, runs disposition waterfall, descriptive stats, advanced analysis, psychometrics, and quality audit - 7 sub-steps in sequence',
                    'qualtrics-prod',
                  ],
                  [
                    '3a',
                    'Approve',
                    'Bulk-approves CLEAN-disposition participants on Prolific; pre-filters already-approved PIDs to avoid double-processing',
                    'prolific-prod',
                  ],
                  [
                    '3b',
                    'Message',
                    'Sends disposition-specific messages to FLAG participants via the Prolific messaging API - 9 message variants, run sequentially',
                    'prolific-prod',
                  ],
                  [
                    '3c',
                    'Dashboard',
                    'Generates disposition-summary.json with live Prolific counts cross-referenced against the analysis sample Ns',
                    'prolific-prod',
                  ],
                  [
                    '4',
                    'Commit',
                    'Runs Prettier on all changed data files, then opens a PR with updated JSON artifacts via the format-and-pr composite action',
                    'copilot',
                  ],
                  [
                    '5',
                    'Report',
                    'Creates a daily GitHub Issue summarizing pipeline results, counts, and any anomalies - always runs, even if earlier phases fail',
                    'github-pages',
                  ],
                ].map(([phase, name, desc, env]) => (
                  <tr key={phase} className="border-b border-gray-100">
                    <td className="p-3 font-bold text-gray-600">{phase}</td>
                    <td className="p-3 font-medium">{name}</td>
                    <td className="p-3 text-gray-700">{desc}</td>
                    <td className="p-3">
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{env}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Data privacy */}
        <section className="mb-10">
          <h2 className={H2_CLASSES}>Data Privacy Boundaries</h2>
          <p className="mb-4">
            The pipeline is designed so that PII never reaches the repository. The table below
            classifies every artifact produced during a pipeline run.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Artifact</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Contains PIDs?</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Committed to repo?</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Retention</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['sensitivity-analysis.json', 'No (aggregate stats)', 'Yes', 'Permanent'],
                  ['data-audit.json', 'No (aggregate counts)', 'Yes', 'Permanent'],
                  ['disposition-summary.json', 'No (aggregate counts)', 'Yes', 'Permanent'],
                  ['Disposition CSV', 'Yes (PROLIFIC_PID)', 'No (artifact only)', '1 day'],
                  ['Qualtrics raw CSV', 'Yes (PII fields)', 'No (stays on runner)', 'Ephemeral'],
                  [
                    'Prolific demographics',
                    'Yes (per-participant)',
                    'No (not fetched in daily pipeline)',
                    'Ephemeral',
                  ],
                  [
                    'Step summaries',
                    'No (aggregate counts)',
                    'No (Actions UI)',
                    'Workflow lifetime',
                  ],
                  ['Workflow logs', 'Yes (PIDs in debug)', 'No (Actions UI)', '90 days'],
                ].map(([artifact, pids, committed, retention]) => (
                  <tr key={artifact} className="border-b border-gray-100">
                    <td className="p-3 font-mono text-xs">{artifact}</td>
                    <td className="p-3">
                      <span
                        className={
                          pids.startsWith('No')
                            ? 'text-green-700 font-medium'
                            : 'text-amber-700 font-medium'
                        }
                      >
                        {pids}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          committed === 'Yes' ? 'text-blue-700 font-medium' : 'text-gray-600'
                        }
                      >
                        {committed}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            Demographic data (age, sex, ethnicity, language, nationality) from Prolific profiles is
            not fetched during the daily pipeline. When fetched via manual workflows or standalone
            scripts, any resulting CSV files are written only to runner temp or short-lived
            artifacts and are never committed to the repository. The public dataset excludes all
            direct identifiers.
          </p>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 mb-4">
            <h3 className="text-base font-semibold text-amber-900 mb-2">Privacy Rule</h3>
            <p className="text-sm text-amber-800">
              <strong>Never commit PROLIFIC_PID or participant-level data</strong> to the
              repository. Step summaries use aggregate counts only. Workflow logs containing PIDs
              are retained only in the GitHub Actions UI for 90 days and are not accessible to the
              public.
            </p>
          </div>
        </section>

        {/* Section 4: AI agent ecosystem */}
        <section className="mb-10">
          <h2 className={H2_CLASSES}>AI Agent Ecosystem</h2>
          <p className="mb-4">
            Three distinct AI agents collaborate on every feature, each with a different role and
            access level.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                name: 'Copilot Coding Agent',
                role: 'Implementation',
                color: 'blue',
                points: [
                  'Assigned GitHub Issues',
                  'Writes and pushes code to a branch',
                  'Opens a pull request',
                  'Fixes review comments',
                  'Never merges - human approves',
                ],
              },
              {
                name: 'Claude Code',
                role: 'Implementation (alternate)',
                color: 'purple',
                points: [
                  'IDE-integrated; runs locally or in CI',
                  'Same write access as Copilot agent',
                  'Used for complex multi-file refactors',
                  'Can call MCP servers (Qualtrics, GitHub)',
                  'Submits work via PR - same review chain',
                ],
              },
              {
                name: 'Copilot PR Review',
                role: 'Review',
                color: 'green',
                points: [
                  'Triggered when PR is marked ready',
                  'Reviews diffs for bugs and style',
                  'Posts inline comments',
                  'Re-reviews after fixes',
                  'Cannot merge - advisory only',
                ],
              },
            ].map(({ name, role, color, points }) => (
              <div
                key={name}
                className={`rounded-xl border p-5 border-${
                  color === 'blue'
                    ? 'blue-200 bg-blue-50'
                    : color === 'purple'
                      ? 'purple-200 bg-purple-50'
                      : 'green-200 bg-green-50'
                }`}
              >
                <h3
                  className={`font-semibold text-${
                    color === 'blue' ? 'blue-900' : color === 'purple' ? 'purple-900' : 'green-900'
                  } mb-1`}
                >
                  {name}
                </h3>
                <p
                  className={`text-xs text-${
                    color === 'blue' ? 'blue-700' : color === 'purple' ? 'purple-700' : 'green-700'
                  } mb-3`}
                >
                  {role}
                </p>
                <ul className="text-sm space-y-1">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className={H3_CLASSES}>How the agents hand off on a single feature</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
            <li>Human creates an issue and assigns it to @Copilot.</li>
            <li>Copilot coding agent clones the repo, reads the issue, and writes the code.</li>
            <li>Agent pushes a branch and opens a PR, which triggers CI.</li>
            <li>CI (format, lint, tests, build, E2E) runs automatically and posts status.</li>
            <li>
              Human marks the PR as “Ready for review” - Copilot PR Review reads the diff and posts
              comments.
            </li>
            <li>Copilot coding agent (or Claude) reads the review comments and pushes fixes.</li>
            <li>CI re-runs; if green, human reviews the final diff and approves.</li>
            <li>GitHub merge queue merges the PR and deploys to GitHub Pages.</li>
          </ol>
        </section>

        {/* Section 5: Dependency provenance */}
        <section className="mb-10">
          <h2 className={H2_CLASSES}>Dependency Provenance</h2>
          <p className="mb-4">
            Every external API is accessed through either an official first-party client library or
            a centralized TypeScript/Python module that wraps the REST API directly. No third-party
            API wrappers are used.
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Qualtrics API v3 (REST)</h3>
              <p className="text-sm text-gray-700 mb-2">
                Survey export, embedded data, and quota operations use the official Qualtrics REST
                API v3. The centralized client is{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">src/lib/qualtrics-api.ts</code>{' '}
                (TypeScript) and{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">
                  scripts/analysis/tabs_api.py
                </code>{' '}
                (Python). No third-party Qualtrics SDK is used.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Prolific API v1 (REST)</h3>
              <p className="text-sm text-gray-700 mb-2">
                Participant operations (approve, message, status) use the official Prolific API with
                token-based authentication. The centralized client is{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">src/lib/prolific-api.ts</code>{' '}
                (TypeScript) and{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">
                  scripts/analysis/prolific_tools.py
                </code>{' '}
                (Python).
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">
                Google Analytics &amp; Search Console
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                Analytics and SEO metrics use the official{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">@google-analytics/data</code> and{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">googleapis</code> SDKs from
                Google. Service account authentication is used; credentials are stored in GitHub
                Secrets and never committed to the repository.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">GitHub MCP Server</h3>
              <p className="text-sm text-gray-700 mb-2">
                AI agents access GitHub - creating issues, pushing files, managing PRs - through the
                official{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">
                  @modelcontextprotocol/server-github
                </code>{' '}
                MCP server, not via third-party wrappers. Qualtrics MCP uses the first-party MCP
                endpoint built into the Qualtrics platform.
              </p>
            </div>
          </div>
        </section>
      </article>
    </div>
  )
}

export default AutomationInfrastructurePage
