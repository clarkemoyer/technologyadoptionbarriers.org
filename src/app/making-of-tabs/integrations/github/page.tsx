import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'GitHub Integration - Making of TABS',
  description:
    'How TABS uses GitHub as a comprehensive DevOps platform: 12 Actions workflows, automated code review, CodeQL security scanning, Dependabot, GitHub Pages deployment, and release management.',
  alternates: {
    canonical: '/making-of-tabs/integrations/github',
  },
}

const GitHubIntegrationPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>GitHub</h1>
        <p className="mb-8 text-lg sm:text-xl text-gray-600 font-sans">
          GitHub is the operational backbone of TABS - it hosts the code, enforces quality gates,
          deploys the site, scans for vulnerabilities, and orchestrates every external-API data
          pipeline.
        </p>

        {/* ── Role Overview ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Role Overview</h2>
          <p className="mb-4">
            Most projects treat GitHub as a place to store code and open pull requests. TABS uses it
            as a <strong>full DevOps platform</strong>. Every automated task - from daily analytics
            reports to weekly participant-data collection - runs inside GitHub Actions, is gated by
            environment secrets, and produces auditable step summaries.
          </p>
          <div className="rounded-lg bg-gray-50 p-4 text-sm font-mono mb-6 whitespace-pre-wrap">
            {`Issue → Branch → PR → CI (format + lint + test + build + E2E)
  → Code Review (Copilot + human) → Merge Queue → Deploy → Lighthouse`}
          </div>
        </section>

        {/* ── CI/CD Pipeline ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>CI/CD Pipeline</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Continuous Integration</h3>
            <p className="mb-4">
              The core CI workflow (<code>ci.yml</code>) runs on every pull request, merge-queue
              entry, and push to <code>main</code>. It executes five stages sequentially, then fans
              out into four parallel shards for E2E testing:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 text-sm font-sans">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2 border-b">Stage</th>
                    <th className="px-4 py-2 border-b">Command</th>
                    <th className="px-4 py-2 border-b">What It Catches</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">Format check</td>
                    <td className="px-4 py-2 border-b font-mono">npm run format:check</td>
                    <td className="px-4 py-2 border-b">Inconsistent code formatting</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 border-b">Lint</td>
                    <td className="px-4 py-2 border-b font-mono">npm run lint</td>
                    <td className="px-4 py-2 border-b">ESLint errors, unused imports</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">Unit tests</td>
                    <td className="px-4 py-2 border-b font-mono">npm test</td>
                    <td className="px-4 py-2 border-b">
                      Logic regressions, accessibility violations (jest-axe)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 border-b">Build</td>
                    <td className="px-4 py-2 border-b font-mono">npm run build</td>
                    <td className="px-4 py-2 border-b">
                      TypeScript errors, static export failures
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">E2E (4 shards)</td>
                    <td className="px-4 py-2 font-mono">npx playwright test --shard=n/4</td>
                    <td className="px-4 py-2">
                      Visual regressions, broken navigation, missing images
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4">
              Concurrency control ensures that pushing a new commit to a PR cancels any in-progress
              CI run for the same ref, saving compute and avoiding stale results.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Deployment</h3>
            <p className="mb-4">
              When CI passes on <code>main</code>, the deployment workflow builds the static site
              with <code>output: &apos;export&apos;</code> and publishes the <code>out/</code>{' '}
              directory to the <code>github-pages</code> environment. The site is served at the
              custom domain <code>technologyadoptionbarriers.org</code> via a CNAME record managed
              in Cloudflare.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Performance Monitoring</h3>
            <p className="mb-4">
              A Lighthouse CI workflow runs after every deployment and on a weekly schedule. It
              dynamically discovers every HTML page in the build output and runs Lighthouse against
              each one, providing performance, accessibility, best-practices, and SEO scores.
            </p>
          </div>
        </section>

        {/* ── All Workflows ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>All GitHub Actions Workflows</h2>
          <p className="mb-4">
            The repository contains <strong>12 workflow files</strong> covering CI, deployment,
            security, performance, and three external API integrations:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-sm font-sans">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Workflow</th>
                  <th className="px-4 py-2 border-b">Trigger</th>
                  <th className="px-4 py-2 border-b">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">ci.yml</td>
                  <td className="px-4 py-2 border-b">PR, merge queue, push</td>
                  <td className="px-4 py-2 border-b">Format, lint, test, build, E2E (4 shards)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b font-mono">deploy.yml</td>
                  <td className="px-4 py-2 border-b">After CI on main</td>
                  <td className="px-4 py-2 border-b">Build and deploy to GitHub Pages</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">codeql.yml</td>
                  <td className="px-4 py-2 border-b">PR, push, weekly</td>
                  <td className="px-4 py-2 border-b">Security scanning (JS/TS + Actions)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b font-mono">lighthouse.yml</td>
                  <td className="px-4 py-2 border-b">After deploy, weekly</td>
                  <td className="px-4 py-2 border-b">Performance audit of every page</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">ga-report.yml</td>
                  <td className="px-4 py-2 border-b">Daily (00:00 UTC)</td>
                  <td className="px-4 py-2 border-b">
                    Fetch GA4 data, update impact.json, email report
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b font-mono">seo-dashboard-sync.yml</td>
                  <td className="px-4 py-2 border-b">Daily (01:00 UTC)</td>
                  <td className="px-4 py-2 border-b">
                    Fetch Google Search Console data, flag automated regressions
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">qualtrics-metrics-update.yml</td>
                  <td className="px-4 py-2 border-b">Daily (03:17 UTC)</td>
                  <td className="px-4 py-2 border-b">
                    Fetch Qualtrics survey metrics, update data file
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">prolific.yml</td>
                  <td className="px-4 py-2 border-b">Weekly (Mon 09:00 UTC)</td>
                  <td className="px-4 py-2 border-b">Collect participant data from Prolific API</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b font-mono">qualtrics-api-smoke.yml</td>
                  <td className="px-4 py-2 border-b">Manual</td>
                  <td className="px-4 py-2 border-b">API connectivity and authentication check</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">qualtrics-prolific-verify.yml</td>
                  <td className="px-4 py-2 border-b">Manual</td>
                  <td className="px-4 py-2 border-b">Cross-platform survey setup verification</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b font-mono">fetch-qualtrics-questions.yml</td>
                  <td className="px-4 py-2 border-b">Manual</td>
                  <td className="px-4 py-2 border-b">Download survey question definitions</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">qualtrics-dump-flow.yml</td>
                  <td className="px-4 py-2">Manual</td>
                  <td className="px-4 py-2">Export Survey Flow JSON for inspection</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Code Review ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Automated Code Review</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>GitHub Copilot Review</h3>
            <p className="mb-4">
              Every pull request is automatically reviewed by GitHub Copilot when marked as{' '}
              <em>Ready for review</em>. Copilot scans for common issues - accessibility problems,
              missing ARIA labels, type safety gaps, and unused code. Review comments appear inline
              on the PR diff and must be addressed before merging.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>CODEOWNERS</h3>
            <p className="mb-4">
              A <code>CODEOWNERS</code> file maps file paths to responsible reviewers. This ensures
              that changes to security-sensitive files (workflows, environment configs, governance
              docs) always require review from the appropriate owner.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>PR Template</h3>
            <p className="mb-4">
              A comprehensive pull request template guides contributors through a structured
              description with sections for change type, related issues, manual testing, automated
              testing, accessibility, and a final checklist. This standardizes the review process
              and ensures nothing is overlooked.
            </p>
          </div>
        </section>

        {/* ── Security Scanning ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Security Scanning</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>CodeQL</h3>
            <p className="mb-4">
              CodeQL Advanced runs on every push and PR to <code>main</code>, plus on a weekly
              schedule. It analyses <strong>two language matrices</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
              <li>
                <strong>JavaScript / TypeScript</strong> - source code analysis for injection
                vulnerabilities, insecure data handling, and logic errors
              </li>
              <li>
                <strong>GitHub Actions</strong> - workflow security analysis for secret exposure,
                untrusted input usage, and privilege escalation
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Dependabot</h3>
            <p className="mb-4">Dependabot monitors two ecosystems weekly (Monday 09:00 UTC):</p>
            <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
              <li>
                <strong>npm</strong> - groups production and development dependency updates (minor +
                patch) into separate PRs, with major versions handled individually for careful
                review. Limited to 10 open PRs.
              </li>
              <li>
                <strong>GitHub Actions</strong> - updates action versions. Limited to 5 open PRs.
              </li>
            </ul>
          </div>
        </section>

        {/* ── Environments ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>GitHub Environments</h2>
          <p className="mb-4">
            External API credentials are stored in environment-scoped secrets, never in the
            repository. Each environment is locked to specific workflows:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-sm font-sans">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Environment</th>
                  <th className="px-4 py-2 border-b">Integration</th>
                  <th className="px-4 py-2 border-b">Workflows</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">github-pages</td>
                  <td className="px-4 py-2 border-b">GitHub Pages</td>
                  <td className="px-4 py-2 border-b">deploy.yml</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b font-mono">qualtrics-prod</td>
                  <td className="px-4 py-2 border-b">Qualtrics API v3</td>
                  <td className="px-4 py-2 border-b">5 workflows</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">prolific-prod</td>
                  <td className="px-4 py-2 border-b">Prolific API v1</td>
                  <td className="px-4 py-2 border-b">2 workflows</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 font-mono">google-prod</td>
                  <td className="px-4 py-2">Google Analytics &amp; Search Console API</td>
                  <td className="px-4 py-2">2 workflows</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Data Pipelines ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Automated Data Pipelines</h2>
          <p className="mb-4">
            Several workflows act as <strong>data pipelines</strong> - they fetch data from external
            APIs, update JSON files in the repository, and create auto-merge PRs. This keeps the
            site&rsquo;s displayed metrics current without manual intervention:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>GA daily report</strong> - fetches analytics from GA4, updates{' '}
              <code>impact.json</code>, creates a PR via{' '}
              <code>peter-evans/create-pull-request</code>, and auto-merges it
            </li>
            <li>
              <strong>Qualtrics metrics update</strong> - fetches survey response counts and updates{' '}
              <code>qualtrics-metrics.json</code>, also auto-merged
            </li>
            <li>
              <strong>SEO Dashboard Sync</strong> - queries GSC and GA4 to update the public SEO
              Transparency Dashboard, with automated regression alerts.
            </li>
            <li>
              <strong>Prolific data collection</strong> - weekly export of participant submission
              data, uploaded as a CI artifact
            </li>
          </ul>
          <p className="mb-4">
            All pipeline outputs appear as{' '}
            <a
              href="https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/adding-a-job-summary"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              GitHub Actions Job Summaries
            </a>
            , using utility functions from <code>src/lib/github-utils.ts</code> that write Markdown
            tables and status indicators to <code>GITHUB_STEP_SUMMARY</code>.
          </p>
        </section>

        {/* ── Release Management ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Release Management</h2>
          <p className="mb-4">
            A TypeScript release-notes generator (<code>scripts/generate-release-notes.ts</code>)
            uses the GitHub CLI to query merged PRs and closed issues between Git refs. It separates
            human contributors from bots, categorises changes into user-facing and internal
            improvements, and produces structured Markdown with sections for each external
            integration.
          </p>
          <p className="mb-4">
            The release process follows{' '}
            <a
              href="https://www.conventionalcommits.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Conventional Commits
            </a>{' '}
            - every commit message and PR title starts with a type prefix (<code>feat:</code>,{' '}
            <code>fix:</code>, <code>docs:</code>, <code>chore:</code>), enforced by a{' '}
            <code>commitlint</code> hook.
          </p>
        </section>

        {/* ── Community Health ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Community Health Files</h2>
          <p className="mb-4">
            The repository includes a complete set of GitHub-recognised community health files that
            appear automatically in the GitHub navigation:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 font-sans text-sm">
            {[
              ['README.md', 'Project overview and quick start'],
              ['LICENSE', 'Apache 2.0'],
              ['CODE_OF_CONDUCT.md', 'Contributor Covenant 2.1'],
              ['CONTRIBUTING.md', 'Contribution guidelines'],
              ['SECURITY.md', 'Security policies and reporting'],
              ['SUPPORT.md', 'Support resources'],
              ['CITATION.cff', 'Academic citation info'],
              ['CHANGELOG.md', 'Release notes'],
              ['.github/FUNDING.yml', 'GitHub Sponsors button'],
              ['.github/CODEOWNERS', 'Auto-assign reviewers'],
              ['.github/PULL_REQUEST_TEMPLATE.md', 'PR template'],
              ['Issue templates (4)', 'Bug, feature, docs, onboarding'],
            ].map(([file, desc]) => (
              <div key={file} className="rounded-lg border border-gray-200 p-3">
                <p className="font-mono text-xs text-gray-600">{file}</p>
                <p className="text-gray-800">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Lessons Learned ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Lessons Learned</h2>
          <ul className="list-disc pl-5 space-y-3 mb-6 font-sans text-base">
            <li>
              <strong>Environment secrets are essential.</strong> Storing API tokens in
              environment-scoped secrets (not repository-level) limits blast radius - a workflow
              only has access to the environment it declares.
            </li>
            <li>
              <strong>Sharded E2E pays off fast.</strong> Splitting Playwright across 4 shards cuts
              E2E wall time by ~75%. The overhead of spinning up extra runners is negligible
              compared to running 50+ test files sequentially.
            </li>
            <li>
              <strong>Auto-merge data PRs carefully.</strong> The GA and Qualtrics pipelines
              auto-merge their data-update PRs. This works because (a) the PRs only modify specific
              JSON files, (b) CI validates the build after the update, and (c) the commit history is
              transparent. Manual review would create a bottleneck for daily data updates.
            </li>
            <li>
              <strong>Job Summaries improve observability.</strong> Writing Markdown tables to{' '}
              <code>GITHUB_STEP_SUMMARY</code> turns workflow runs into readable reports without
              scrolling through log output.
            </li>
          </ul>
        </section>

        {/* ── Related ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Related</h2>
          <ul className="list-disc pl-5 space-y-2 font-sans text-base">
            <li>
              <Link
                href="/making-of-tabs/integrations/cloudflare"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Cloudflare Integration
              </Link>{' '}
              - DNS, CDN, and security layer that sits in front of GitHub Pages
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/google-analytics"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Google Analytics Integration
              </Link>{' '}
              - the GA4 data pipeline that feeds impact.json
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/qualtrics"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Qualtrics Integration
              </Link>{' '}
              - the survey automation workflows
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations"
                className="text-blue-600 underline hover:text-blue-800"
              >
                All Technical Integrations
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}

export default GitHubIntegrationPage
