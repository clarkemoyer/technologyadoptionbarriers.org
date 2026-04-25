import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'The Squash Merge Incident - AI-Assisted Development - Making of TABS',
  description:
    'How a single squash merge silently reverted 25+ pull requests, the root cause analysis, the full restoration effort, and the permanent safeguards now in place.',
  alternates: {
    canonical: '/making-of-tabs/ai-assisted-development/squash-merge-incident',
  },
}

const SquashMergeIncidentPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>The Squash Merge Incident</h1>

        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-900 font-semibold mb-2">Incident Date: April 6-7, 2026</p>
          <p className="text-sm text-red-800">
            A single squash merge silently reverted 25+ previously merged pull requests across 67
            files, destroying security fixes, accessibility features, statistical analysis code, and
            research data. A second squash merge downgraded GitHub Actions versions across 30
            workflow files. Full restoration required 6 commits across 2 PRs touching 50+ files.
          </p>
        </div>

        {/* ── What Happened ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>What Happened</h2>
          <p className="mb-4">
            During a batch merge session managed by Claude Code, PR #927 (a 5-file feature adding an
            effect size chart) was squash-merged into main. The branch had been forked from main
            approximately 27 hours earlier. During that window, 35 other PRs had been merged to
            main.
          </p>
          <p className="mb-4">
            The squash merge silently reverted every change to every file the branch touched - not
            just the 5 files that were part of the feature, but 62 additional files that had been
            modified between the branch&apos;s fork point and the merge time. GitHub&apos;s diff
            showed 67 changed files, but this red flag was missed.
          </p>
          <p className="mb-4">
            A second squash merge (PR #803) was identified during the investigation. It had the same
            root cause: a stale Dependabot-style branch squash-merged without rebasing, reverting
            action version upgrades across 30 workflow files.
          </p>
        </section>

        {/* ── Root Cause ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Root Cause: How Squash Merge Reverts Code</h2>
          <p className="mb-4">
            GitHub&apos;s squash merge algorithm computes a single diff between the current main
            HEAD and the branch tip. When a branch is behind main, this diff includes stale versions
            of every file the branch touches. Squash merge treats those stale versions as the
            &ldquo;intended state&rdquo; and overwrites whatever is currently on main.
          </p>

          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className={H3_CLASSES}>The Mechanism</h3>
            <ol className="list-decimal pl-6 space-y-2 text-sm">
              <li>
                Branch forks from main at commit{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">A</code>
              </li>
              <li>
                35 PRs merge to main, advancing it to commit{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">Z</code>
              </li>
              <li>
                Branch still contains commit{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">A</code>&apos;s versions of all
                67 files it touches
              </li>
              <li>
                Squash merge computes diff: &ldquo;branch tip vs. main HEAD (
                <code className="text-xs bg-gray-200 px-1 rounded">Z</code>)&rdquo;
              </li>
              <li>
                Every file where the branch has the{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">A</code>-era version gets
                overwritten onto main, silently reverting all changes made between{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">A</code> and{' '}
                <code className="text-xs bg-gray-200 px-1 rounded">Z</code>
              </li>
            </ol>
          </div>

          <p className="mb-4">
            Regular merge commits do not have this problem. A merge commit preserves both histories
            and only applies the branch&apos;s own changes. Rebase merge also avoids the issue
            because it replays commits individually onto the current main.
          </p>
        </section>

        {/* ── What Was Lost ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>What Was Lost</h2>
          <p className="mb-6">
            The squash merge reverted work from 25+ previously merged pull requests. The damage
            spanned every layer of the application:
          </p>

          <div className="space-y-4 mb-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-bold text-red-900 mb-1">Security (Critical)</h3>
              <ul className="list-disc pl-5 text-sm text-red-800 space-y-1">
                <li>
                  XSS sanitization for Google Tag Manager IDs (PR #1154) - re-exposed injection
                  vulnerability
                </li>
                <li>JSON-LD sanitization on media page (PR #1226) - re-exposed XSS vector</li>
              </ul>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <h3 className="text-sm font-bold text-orange-900 mb-1">Accessibility</h3>
              <ul className="list-disc pl-5 text-sm text-orange-800 space-y-1">
                <li>Skip-to-content keyboard navigation (PR #1275) - removed from layout</li>
                <li>E2E accessibility test deleted</li>
              </ul>
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="text-sm font-bold text-yellow-900 mb-1">Statistical Analysis</h3>
              <ul className="list-disc pl-5 text-sm text-yellow-800 space-y-1">
                <li>
                  95% confidence intervals via bootstrap (PR #1191) -{' '}
                  <code className="text-xs bg-yellow-100 px-1 rounded">cohens_d</code> reverted from
                  tuple to float return
                </li>
                <li>
                  Welch&apos;s t-test confidence intervals removed (5-tuple reverted to 3-tuple)
                </li>
                <li>
                  Role categorization patterns for &ldquo;Other&rdquo; responses deleted (PR #1279)
                </li>
                <li>Mean confidence interval function removed entirely</li>
              </ul>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-bold text-blue-900 mb-1">
                Data Quality &amp; Infrastructure
              </h3>
              <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                <li>
                  JSON schema validation script and CI step (PR #1077) - removed from pipeline
                </li>
                <li>
                  13 workflow files downgraded from{' '}
                  <code className="text-xs bg-blue-100 px-1 rounded">setup-python@v6</code> to v5
                </li>
                <li>Action versions across 30 workflows downgraded (PR #803 squash)</li>
                <li>Sensitivity analysis data reverted to stale sample counts</li>
              </ul>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <h3 className="text-sm font-bold text-purple-900 mb-1">Pages &amp; Features</h3>
              <ul className="list-disc pl-5 text-sm text-purple-800 space-y-1">
                <li>Famous Quotes on Technology Adoption page deleted (PR #1170)</li>
                <li>Automation Infrastructure page deleted (PR #796)</li>
                <li>Google Jules integration page deleted (PR #940)</li>
                <li>Reproducibility page reverted to outdated 3-script version (PR #1281)</li>
                <li>Findings page lost heatmap, maturity analysis, and optimization PRs</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Tests</h3>
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                <li>GoogleTagManager XSS test suite deleted (101 lines)</li>
                <li>QuotesPageClient test suite deleted (154 lines)</li>
                <li>Teaching series segment builder tests deleted</li>
                <li>Skip-to-content E2E test deleted</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Detection ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How It Was Detected</h2>
          <p className="mb-4">
            The damage was not immediately obvious. The site continued to build and deploy because
            the reverted code was still valid - it was simply an older version. Detection came
            through a combination of:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Post-deploy smoke test failures alerted us to content regressions on the live site
            </li>
            <li>
              Manual inspection of PR #927&apos;s 67-file diff - a 5-file feature PR should never
              touch 67 files
            </li>
            <li>
              Comparing <code className="text-xs bg-gray-200 px-1 rounded">git show</code> output
              between the pre-squash commit and current main revealed wholesale reversions
            </li>
            <li>
              Python test failures: tests expected{' '}
              <code className="text-xs bg-gray-200 px-1 rounded">cohens_d</code> to return a tuple{' '}
              <code className="text-xs bg-gray-200 px-1 rounded">(d, ci_lower, ci_upper)</code> but
              the reverted function returned a bare float
            </li>
          </ul>
          <p className="mb-4">
            <strong>Key lesson:</strong> The file count in a PR diff is a critical signal. A feature
            PR showing significantly more changed files than expected is a red flag that the branch
            is stale and the merge will carry unintended changes.
          </p>
        </section>

        {/* ── The Fix ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>The Restoration</h2>
          <p className="mb-4">
            Restoration was performed in two PRs with a total of 7 commits, comparing each file
            against the pre-squash commit (
            <code className="text-xs bg-gray-200 px-1 rounded">7ccd6d2</code>) to identify the
            correct state:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">PR</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Commits</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Scope</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-mono text-xs">#1330</td>
                  <td className="p-3">6 commits</td>
                  <td className="p-3">
                    30 source/config files restored, 30 workflow files restored, Node.js 24 env var
                    re-applied, package.json dependencies fixed, Python analysis functions restored
                    (cohens_d CIs, mean_ci, welch_t_test CIs, role categorization patterns)
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-mono text-xs">#1341</td>
                  <td className="p-3">1 commit</td>
                  <td className="p-3">
                    10 remaining deleted files: 3 pages (Quotes, Automation Infrastructure, Google
                    Jules), 4 test suites (GTM XSS, Quotes client, teaching series, skip-to-content
                    E2E), quotes data file, Zotero workflow
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            Files that had been modified by later PRs (e.g.,{' '}
            <code className="text-xs bg-gray-200 px-1 rounded">tabs_v2_analysis.py</code> was
            touched by both #927 and the subsequent #1216 filter bias analysis) required careful
            merging: restore from pre-#927, then re-apply the legitimate post-#927 additions.
          </p>
        </section>

        {/* ── Permanent Fixes ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Permanent Safeguards</h2>
          <p className="mb-4">Three changes were made to prevent this from recurring:</p>

          <div className="space-y-6 mb-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className={H3_CLASSES}>Squash Merge Disabled at Repository Level</h3>
                <p>
                  The &ldquo;Allow squash merging&rdquo; option was unchecked in the
                  repository&apos;s Pull Requests settings. Only merge commits and rebase merging
                  are now permitted. This is a hard block - GitHub will reject any attempt to squash
                  merge, regardless of who or what initiates it.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className={H3_CLASSES}>AI Agent Memory Updated</h3>
                <p>
                  A persistent memory entry was created for Claude Code: &ldquo;NEVER use
                  <code className="text-xs bg-gray-200 px-1 rounded ml-1">
                    gh pr merge --squash
                  </code>
                  . Always use
                  <code className="text-xs bg-gray-200 px-1 rounded ml-1">gh pr merge --merge</code>
                  .&rdquo; This memory loads automatically in every future conversation, ensuring
                  the agent cannot repeat the mistake even if operating autonomously.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className={H3_CLASSES}>File Count Verification Before Merge</h3>
                <p>
                  Before any merge, the PR&apos;s changed file count is now verified against the
                  expected scope. A 3-file feature PR showing 67 changed files is a clear signal
                  that the branch is stale and carrying unintended reversions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Lessons ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Lessons for AI-Assisted Development</h2>
          <p className="mb-4">
            This incident is worth documenting because it reveals a class of failure unique to
            high-velocity AI-assisted development:
          </p>
          <ul className="list-disc pl-6 space-y-3 mb-6">
            <li>
              <strong>Speed amplifies mistakes.</strong> An AI agent can merge 30 PRs in minutes.
              When one merge silently reverts the others, the blast radius is enormous precisely
              because of the speed that makes AI-assisted development valuable.
            </li>
            <li>
              <strong>Git operations need guardrails too.</strong> We had extensive CI, testing, and
              code review guardrails. But the merge strategy itself was unconstrained. The agent
              chose squash merge as a reasonable default - and it is reasonable in most cases. The
              failure mode only appears with stale branches, which are common during batch merge
              sessions.
            </li>
            <li>
              <strong>AI agents make systematic errors.</strong> A human might notice that a 5-file
              PR has a 67-file diff and pause. The agent processed the diff size as expected. AI
              agents need explicit rules for red flags that humans catch intuitively.
            </li>
            <li>
              <strong>Detection matters as much as prevention.</strong> The smoke test caught
              content regressions on the live site. Without automated post-deploy checks, the
              reversions could have persisted for days before anyone noticed missing features.
            </li>
            <li>
              <strong>Persistent memory prevents repeat failures.</strong> The agent&apos;s memory
              system means this specific mistake will never recur in future sessions. This is the AI
              equivalent of a runbook update - encoding operational lessons into the system itself.
            </li>
          </ul>
        </section>

        {/* ── Timeline ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Timeline</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 5, 21:13</div>
              <div>PR #927 branch forks from main</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 5-6</div>
              <div>
                35 PRs merge to main (security fixes, accessibility, statistics, pages, tests)
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 7, 00:39</div>
              <div>PR #927 squash-merged - 25+ PRs silently reverted across 67 files</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 7, 01:15</div>
              <div>Post-deploy smoke test detects content regressions</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 7, 02:00</div>
              <div>Root cause identified: squash merge on stale branch</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 7, 02:30</div>
              <div>
                PR #803 identified as second squash merge with same issue (30 workflow files)
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 7, 03:20</div>
              <div>
                PR #1330 opened: 30 source files + 30 workflow files + package.json restored
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 7, 03:50</div>
              <div>Python analysis files restored (cohens_d CIs, role categories)</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 7, 04:05</div>
              <div>PR #1330 merged (13/13 CI checks passing, regular merge commit)</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 7, 04:10</div>
              <div>Squash merging disabled in repository settings</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-36 font-mono text-gray-500">Apr 7, 04:30</div>
              <div>10 remaining deleted files restored (pages, tests, data, workflow)</div>
            </div>
          </div>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This incident report was written by the same Claude Code agent that caused and then
            fixed the issue. The restoration PRs, repository setting change, and this documentation
            were all part of the remediation.
          </p>
        </section>
      </article>
    </div>
  )
}

export default SquashMergeIncidentPage
