import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Development Workflow - Making of TABS',
  description:
    'The CI/CD pipeline, merge queue, automated testing, and operational workflows that keep the TABS website reliable and continuously deployed.',
  alternates: {
    canonical: '/making-of-tabs/development-workflow',
  },
}

const DevelopmentWorkflowPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Development Workflow</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            Every change to the TABS website follows a structured path from idea to production. This
            is not accidental - for a research project that handles survey data and analytics, we
            need to know that every deployed change has been tested, reviewed, and verified. This
            page documents our entire development pipeline.
          </p>
        </section>

        {/* ── The Pipeline ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Issue → PR → Merge → Deploy</h2>
          <p className="mb-6">No code reaches production without passing through this pipeline:</p>

          <div className="mb-8 space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-bold text-gray-900">GitHub Issue</p>
                <p className="text-sm text-gray-700">
                  Every change starts as a tracked issue. Bug reports, feature requests, and
                  documentation updates all get an issue number for traceability.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-bold text-gray-900">Feature Branch</p>
                <p className="text-sm text-gray-700">
                  A branch is created from{' '}
                  <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">main</code> using
                  conventional naming:{' '}
                  <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">feat/</code>,{' '}
                  <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">fix/</code>,{' '}
                  <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">docs/</code>, or{' '}
                  <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">chore/</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-bold text-gray-900">Pull Request</p>
                <p className="text-sm text-gray-700">
                  A PR is opened referencing the issue. This triggers CI and automated code review.
                  The PR template includes an accessibility checklist.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <p className="font-bold text-gray-900">CI Checks (7 total)</p>
                <p className="text-sm text-gray-700">
                  All checks must pass before merge. See details below.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <p className="font-bold text-gray-900">Squash Merge</p>
                <p className="text-sm text-gray-700">
                  PRs are squash-merged into main, keeping the commit history clean with one commit
                  per feature. The feature branch is automatically deleted.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                6
              </div>
              <div>
                <p className="font-bold text-gray-900">Automatic Deploy</p>
                <p className="text-sm text-gray-700">
                  Merging to main triggers the deploy workflow, which builds the static site and
                  pushes it to GitHub Pages. The site is live within minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CI Details ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>CI Pipeline: 7 Checks</h2>
          <p className="mb-6">
            Every pull request runs through seven automated checks before it can be merged:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Check</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    What It Does
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Typical Time
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">Test &amp; Build</td>
                  <td className="p-3">
                    Prettier format check, ESLint, Jest unit tests (including jest-axe
                    accessibility), static build
                  </td>
                  <td className="p-3">~2 min</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">E2E Shard 1/4</td>
                  <td className="p-3" rowSpan={4}>
                    Playwright browser tests split across four parallel shards - logo rendering,
                    image loading, navigation, page content verification
                  </td>
                  <td className="p-3" rowSpan={4}>
                    ~2 min each
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">E2E Shard 2/4</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">E2E Shard 3/4</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">E2E Shard 4/4</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">CodeQL (JavaScript/TypeScript)</td>
                  <td className="p-3">
                    GitHub&apos;s semantic code analysis for security vulnerabilities in application
                    code
                  </td>
                  <td className="p-3">~1 min</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">CodeQL (Actions)</td>
                  <td className="p-3">Security analysis of GitHub Actions workflow files</td>
                  <td className="p-3">~40 sec</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Additionally, <strong>Lighthouse CI</strong> runs on merges to main, scoring
            performance, accessibility, best practices, and SEO.
          </p>
        </section>

        {/* ── Merge Queue ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Merge Queue</h2>
          <p className="mb-6">
            The repository uses GitHub&apos;s merge queue to prevent integration failures when
            multiple PRs are approved around the same time. Instead of merging immediately, PRs
            enter a queue where GitHub creates a temporary merge commit combining the PR with the
            current state of main and any PRs ahead of it in the queue.
          </p>
          <p className="mb-6">
            The full CI suite runs against this temporary merge commit. If any check fails, the
            offending PR is removed from the queue and the others re-test. This guarantees that what
            merges into main has been tested against the actual code it will sit alongside, not just
            the state of main when the PR was opened.
          </p>
          <p>
            This is especially valuable for a statically exported site - a broken build in the merge
            queue stops the deploy before it ever reaches GitHub Pages.
          </p>
        </section>

        {/* ── Parallel Development ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Parallel Development: Git Worktrees</h2>
          <p className="mb-6">
            To maintain high velocity, TABS developers leverage the <strong>Git Worktree</strong>{' '}
            pattern. While standard development involves switching branches in a single directory,
            worktrees allow multiple branches to be checked out simultaneously in separate folders.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/50">
              <h3 className="font-bold text-blue-900 mb-2">Standard Switching</h3>
              <ul className="text-sm space-y-2 text-blue-800">
                <li className="flex gap-2">
                  <span className="text-blue-500" aria-hidden="true" title="Disadvantage">
                    ✕
                  </span>
                  Stashing changes required
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500" aria-hidden="true" title="Disadvantage">
                    ✕
                  </span>
                  Re-running installs/builds
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500" aria-hidden="true" title="Disadvantage">
                    ✕
                  </span>
                  Loss of terminal state
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500" aria-hidden="true" title="Disadvantage">
                    ✕
                  </span>
                  One task at a time
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-green-100 bg-green-50/50">
              <h3 className="font-bold text-green-900 mb-2">Worktree Parallelism</h3>
              <ul className="text-sm space-y-2 text-green-800">
                <li className="flex gap-2">
                  <span className="text-green-500" aria-hidden="true" title="Advantage">
                    ✓
                  </span>
                  No stashing or &quot;dirty tree&quot; issues
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500" aria-hidden="true" title="Advantage">
                    ✓
                  </span>
                  Independent build artifacts
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500" aria-hidden="true" title="Advantage">
                    ✓
                  </span>
                  Persistent terminal/IDE state
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500" aria-hidden="true" title="Advantage">
                    ✓
                  </span>
                  3-5 parallel agent sessions
                </li>
              </ul>
            </div>
          </div>

          <p className="mb-6">
            This pattern is particularly effective when working with AI coding agents. A developer
            can spin up 3-5 separate worktrees, each with its own terminal and Claude Code session,
            to handle different aspects of the project in parallel:
          </p>

          <div className="mb-6 rounded-lg bg-gray-900 text-gray-100 p-4 overflow-x-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              <code>{`# Create worktrees for parallel tasks
git worktree add -b feat/viz ../tabs-feature main
git worktree add -b fix/nav ../tabs-bugfix main
git worktree add -b docs/api ../tabs-docs main

# Start separate Claude sessions in each directory
~/tabs-feature $ claude "Implement new heatmap viz"
~/tabs-bugfix  $ claude "Fix mobile nav overflow"
~/tabs-docs    $ claude "Update API documentation"`}</code>
            </pre>
          </div>

          <p>
            By decoupling the local development environment from a single branch, we eliminate the
            &quot;waiting for CI&quot; or &quot;waiting for build&quot; bottlenecks that slow down
            traditional workflows.
          </p>
        </section>

        {/* ── Automated Operations ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Automated Operations</h2>
          <p className="mb-6">
            Beyond CI/CD, GitHub Actions runs several scheduled workflows that keep the project data
            current:
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">Daily GA Report</h3>
              <p className="text-sm text-gray-700">
                Runs at midnight UTC. Fetches Google Analytics data, generates a report artifact,
                updates public impact statistics, and emails a summary to stakeholders.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">SEO Dashboard Sync</h3>
              <p className="text-sm text-gray-700">
                Runs at 01:00 UTC. Queries the Google Search Console API and GA4 to update the
                public SEO Transparency Dashboard and flags significant traffic regressions via
                GitHub Issues.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">Qualtrics Metrics Update</h3>
              <p className="text-sm text-gray-700">
                Periodically fetches survey question count and response counts from the Qualtrics
                API, keeping the homepage statistics current.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">Prolific Data Collection</h3>
              <p className="text-sm text-gray-700">
                Weekly workflow (Mondays, 9 AM UTC) that collects participant study data from
                Prolific and stores it as a workflow artifact.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">Dependabot</h3>
              <p className="text-sm text-gray-700">
                Automated dependency updates for npm packages and GitHub Actions. Security patches
                are flagged for immediate attention.
              </p>
            </div>
          </div>
        </section>

        {/* ── Living Documentation ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Living Documentation</h2>
          <p className="mb-6">
            Documentation is not an afterthought - it is a first-class part of every change. When a
            feature is added, its documentation is updated in the same PR. This includes:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>CHANGELOG.md</strong> - tracks every release and notable change
            </li>
            <li>
              <strong>Instruction files</strong> - AGENTS.md, CLAUDE.md, GEMINI.md updated when
              architecture changes
            </li>
            <li>
              <strong>Sitemap</strong> - maintained in src/app/sitemap.ts; new routes are added
              manually to keep SEO coverage complete
            </li>
            <li>
              <strong>Community health files</strong> - CODE_OF_CONDUCT, CONTRIBUTING, SECURITY,
              SUPPORT maintained alongside code
            </li>
          </ul>

          <p>
            This &quot;living documentation&quot; approach means the project remains understandable
            to new contributors - human or AI - at any point in time.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This workflow is itself documented in AGENTS.md, which AI agents read before every
            session.
          </p>
        </section>
      </article>
    </div>
  )
}

export default DevelopmentWorkflowPage
