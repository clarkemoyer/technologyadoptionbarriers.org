import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Automation Infrastructure — Making of TABS',
  description:
    'How the TABS project automates the full lifecycle from issue assignment to human review — daily data pipelines, privacy-safe boundaries, AI agent coordination, and dependency provenance.',
  alternates: {
    canonical: '/making-of-tabs/automation-infrastructure',
  },
}

const AutomationInfrastructurePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/making-of-tabs" className="hover:text-blue-600 hover:underline">
                Making of TABS
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Automation Infrastructure
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Automation Infrastructure</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            TABS runs with minimal human intervention between data collection cycles. GitHub Actions
            workflows handle daily participant processing, survey data export, statistical analysis,
            Prolific communications, and repository updates — all without a human pressing a button.
            This page documents exactly how that automation works and what safeguards keep it
            trustworthy.
          </p>
        </section>

        {/* ── The Hands-Off Chain ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>The Hands-Off Chain</h2>
          <p className="mb-6">
            When the Copilot coding agent is assigned a GitHub Issue, a deterministic chain of
            events follows that leads all the way to a merged pull request — with human review as
            the only manual gate:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Step</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Actor</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Action</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Output</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    '1',
                    'Human',
                    'Opens GitHub Issue, assigns Copilot coding agent',
                    'Issue with requirements',
                  ],
                  [
                    '2',
                    'Copilot coding agent',
                    'Reads codebase, creates feature branch, implements changes',
                    'Committed code on branch',
                  ],
                  [
                    '3',
                    'Copilot coding agent',
                    'Opens pull request referencing the issue',
                    'PR with description',
                  ],
                  [
                    '4',
                    'GitHub Actions (CI)',
                    'Runs format check, lint, Jest, build, Playwright E2E, CodeQL',
                    'Pass / fail status',
                  ],
                  [
                    '5',
                    'GitHub Copilot (review)',
                    'Automatically reviews the PR for quality and consistency',
                    'Review comments',
                  ],
                  [
                    '6',
                    'Copilot coding agent',
                    'Addresses review comments, pushes fixes',
                    'Updated commits',
                  ],
                  [
                    '7',
                    'GitHub Actions (CI)',
                    'Re-runs all checks on updated commits',
                    'Green CI status',
                  ],
                  [
                    '8',
                    'Human',
                    'Reviews final diff, approves, and merges',
                    'Deployed to production',
                  ],
                ].map(([step, actor, action, output]) => (
                  <tr key={step} className="border-b border-gray-100">
                    <td className="p-3 font-bold text-gray-600">{step}</td>
                    <td className="p-3 font-medium">{actor}</td>
                    <td className="p-3 text-gray-700">{action}</td>
                    <td className="p-3 text-gray-600 italic">{output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            Steps 2–7 are fully automated. The human is involved only at the bookends: defining the
            goal and approving the result. The multi-round Copilot review cycle (
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
              copilot-review-cycle.yml
            </code>
            ) can run up to seven rounds automatically, requesting a new review after each fix
            batch.
          </p>
        </section>

        {/* ── Daily Data Pipeline ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Daily Data Pipeline</h2>
          <p className="mb-6">
            Every day at 09:00 UTC, the{' '}
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">daily-pipeline.yml</code>{' '}
            workflow runs a seven-phase chain that processes Prolific submissions, exports and
            analyzes survey data, acts on quality decisions, and commits results back to the
            repository:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Phase</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Name</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    What it does
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Environment
                  </th>
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
                    'Exports Qualtrics survey responses, enriches with Prolific status, runs disposition waterfall, descriptive stats, advanced analysis, psychometrics, and quality audit — 7 sub-steps in sequence',
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
                    'Sends personalized follow-up messages to FLAG-disposition participants; runs sequentially across 9 disposition sub-types',
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
                    'Creates a daily GitHub Issue summarizing pipeline results, counts, and any anomalies — always runs, even if earlier phases fail',
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

          <p className="mb-4">
            Phases 3a, 3b, and 3c run in parallel after Phase 2 completes. The disposition CSV
            produced in Phase 1 is passed between phases as a GitHub Actions artifact with a one-day
            retention window — it never touches the repository.
          </p>
        </section>

        {/* ── Data Privacy Boundaries ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Data Privacy Boundaries</h2>
          <p className="mb-6">
            The pipeline deliberately separates participant-identifiable data (PIDs, demographic
            profiles) from the aggregate outputs that flow into the public repository. This table
            documents what goes where:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Data artifact
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Contains PIDs?
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Committed to repo?
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Retention
                  </th>
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
            not fetched in the daily pipeline. When fetched via manual scripts, any resulting CSV
            files are written only to runner temp directories or short-lived artifacts and are never
            committed to the repository. The public dataset excludes all direct identifiers.
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

        {/* ── AI Agent Ecosystem ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>AI Agent Ecosystem</h2>
          <p className="mb-6">
            Three distinct AI systems work together across the TABS development lifecycle. Each has
            a defined role:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Copilot Coding Agent</h3>
              <p className="text-sm text-blue-800 mb-3">
                Assigned to GitHub Issues via the UI. Reads the full codebase, creates a branch,
                implements the required changes, opens a PR, and responds to review feedback —
                entirely within GitHub without a local IDE.
              </p>
              <p className="text-xs text-blue-700 font-semibold">
                Role: Autonomous implementation from issue to PR
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-2">Claude Code Agent</h3>
              <p className="text-sm text-purple-800 mb-3">
                IDE-integrated agent (VS Code / Antigravity) with terminal access, MCP server
                connections, and multi-file editing capability. Handles complex refactors,
                multi-session features, and tasks requiring local build validation before pushing.
              </p>
              <p className="text-xs text-purple-700 font-semibold">
                Role: Complex features, cross-file refactoring, local validation
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <h3 className="text-lg font-bold text-green-900 mb-2">Copilot PR Review</h3>
              <p className="text-sm text-green-800 mb-3">
                Triggered automatically when a PR is marked ready for review. Runs up to seven
                review rounds via{' '}
                <code className="text-xs bg-green-200 px-1 py-0.5 rounded">
                  copilot-review-cycle.yml
                </code>
                . Each round checks for unused variables, type safety, ARIA issues, consistency
                violations, and misleading comments.
              </p>
              <p className="text-xs text-green-700 font-semibold">
                Role: Automated quality gate before human approval
              </p>
            </div>
          </div>

          <h3 className={H3_CLASSES}>How They Collaborate</h3>
          <p className="mb-4">A typical feature follows this agent handoff pattern:</p>
          <ol className="list-decimal pl-6 space-y-2 mb-6">
            <li>
              Human opens issue → <strong>Copilot coding agent</strong> implements and opens PR
            </li>
            <li>
              CI fails on accessibility check → <strong>Claude Code agent</strong> is invoked
              locally to diagnose and fix the subtle ARIA issue
            </li>
            <li>
              Fixed PR is marked ready → <strong>Copilot PR Review</strong> runs multiple rounds,
              flags a redundant prop
            </li>
            <li>
              <strong>Copilot coding agent</strong> addresses the review comment in a follow-up
              commit
            </li>
            <li>Human performs final approval and merge</li>
          </ol>
          <p className="mb-4">
            The agents complement rather than replace each other. Copilot&apos;s tight GitHub
            integration handles the issue-to-PR lifecycle. Claude&apos;s deep IDE access handles
            tasks needing local toolchain output. Copilot Review provides an independent quality
            lens on whatever either agent produced.
          </p>
        </section>

        {/* ── Dependency Provenance ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Dependency Provenance</h2>
          <p className="mb-6">
            We prefer official, first-party sources for every external integration. This is not
            merely a best practice — it is a deliberate policy driven by auditability, security, and
            long-term maintainability:
          </p>

          <div className="mb-8 space-y-4">
            <div className="p-5 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">Official MCP Servers</h3>
              <p className="text-sm text-gray-700 mb-2">
                We use the{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                  @modelcontextprotocol/server-github
                </code>{' '}
                package from the official MCP SDK organization. This ensures the tool definitions,
                authentication flows, and transport behavior match what the AI agents were trained
                to expect, reducing hallucination risk.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">Qualtrics API v3 (REST)</h3>
              <p className="text-sm text-gray-700 mb-2">
                All survey operations use the official Qualtrics REST API v3 with{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">X-API-TOKEN</code>{' '}
                authentication. Credentials are stored exclusively in GitHub environment secrets
                under the{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">qualtrics-prod</code>{' '}
                environment and are never logged or committed.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">Prolific API v1 (REST)</h3>
              <p className="text-sm text-gray-700 mb-2">
                Participant operations (approve, message, status) use the official Prolific API with
                token-based authentication. A shared Python client (
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                  scripts/analysis/tabs_api.py
                </code>
                ) and TypeScript client (
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                  src/lib/prolific-api.ts
                </code>
                ) centralize all API calls so authentication logic cannot drift across scripts.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">
                Google APIs (GA4 + Search Console)
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                Analytics and SEO data come from the official{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                  @google-analytics/data
                </code>{' '}
                SDK and the{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">googleapis</code> package,
                authenticated via a service account. Using Google&apos;s own SDKs means our scripts
                receive typed responses and benefit from Google&apos;s own retry and pagination
                logic.
              </p>
            </div>
          </div>

          <p className="mb-4">
            The principle: when an official SDK or MCP server exists, we use it. When only a REST
            API exists, we write a thin typed client and centralize it in{' '}
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">src/lib/</code> or{' '}
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">scripts/analysis/</code>. This
            keeps credentials and API surface area auditable from a small number of files rather
            than scattered across workflows.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This page was written by a Claude Code agent and reviewed by GitHub Copilot. The human
            approved it.
          </p>
        </section>
      </article>
    </main>
  )
}

export default AutomationInfrastructurePage
