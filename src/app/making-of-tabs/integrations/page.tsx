import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Technical Integrations & Workflows - Making of TABS',
  description:
    'A detailed guide to the API integrations, automated workflows, and Survey Flow architecture that power the Technology Adoption Barriers Survey (TABS).',
}

const IntegrationsPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Technical Integrations &amp; Workflows</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            Running a long-term academic survey across multiple platforms requires reliable,
            automated plumbing. This page explains the four major platform integrations that keep
            TABS running: <strong>Qualtrics</strong> (the survey engine), <strong>Prolific</strong>{' '}
            (the participant recruitment platform),{' '}
            <strong>Google Analytics & Search Console</strong> (impact measurement and SEO
            transparency), and <strong>Zotero</strong> (the vetted reference library powering
            AI-assisted research). Each integration is managed through GitHub Actions workflows and
            TypeScript or Python client libraries, so the entire operational lifecycle - from survey
            creation to data collection to analytics - is version-controlled and reproducible.
          </p>
        </section>

        {/* ── Integration Deep Dives ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Integration Deep Dives</h2>
          <p className="mb-6">
            Each integration has a dedicated page with detailed methodology, architecture diagrams,
            and lessons learned:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Link
              href="/making-of-tabs/integrations/qualtrics"
              className="block rounded-xl border border-blue-200 bg-blue-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-blue-900 mb-1">Qualtrics</p>
              <p className="text-sm text-blue-800">
                Survey engine, API workflows, Survey Flow architecture, and annual rollover
              </p>
            </Link>
            <Link
              href="/making-of-tabs/integrations/prolific"
              className="block rounded-xl border border-green-200 bg-green-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-green-900 mb-1">Prolific</p>
              <p className="text-sm text-green-800">
                Participant recruitment, the Qualtrics-Prolific bridge, and data collection
              </p>
            </Link>
            <Link
              href="/making-of-tabs/integrations/google-analytics"
              className="block rounded-xl border border-orange-200 bg-orange-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-orange-900 mb-1">Google Analytics</p>
              <p className="text-sm text-orange-800">
                Impact measurement, the Verified Visitors methodology, and GA4 API lessons
              </p>
            </Link>
            <Link
              href="/making-of-tabs/integrations/microsoft-clarity"
              className="block rounded-xl border border-purple-200 bg-purple-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-purple-900 mb-1">Microsoft Clarity</p>
              <p className="text-sm text-purple-800">
                Heatmaps, session recordings, consent-gated loading, and SPA route tracking
              </p>
            </Link>
            <Link
              href="/making-of-tabs/integrations/github"
              className="block rounded-xl border border-gray-300 bg-gray-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-gray-900 mb-1">GitHub</p>
              <p className="text-sm text-gray-700">
                CI/CD, code review, security scanning, deployment, and data pipelines
              </p>
            </Link>
            <Link
              href="/making-of-tabs/integrations/cloudflare"
              className="block rounded-xl border border-amber-200 bg-amber-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-amber-900 mb-1">Cloudflare</p>
              <p className="text-sm text-amber-800">
                DNS, global CDN, SSL/TLS, caching strategy, and security headers
              </p>
            </Link>
            <Link
              href="/making-of-tabs/integrations/zotero"
              className="block rounded-xl border border-red-200 bg-red-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-red-900 mb-1">Zotero</p>
              <p className="text-sm text-red-800">
                Vetted reference library, citation validation, and AI-assisted research grounding
              </p>
            </Link>
          </div>
        </section>

        {/* ── Qualtrics ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Qualtrics - The Survey Engine</h2>

          <p className="mb-4">
            Qualtrics hosts the TABS survey instrument. The platform provides sophisticated logic
            capabilities, enterprise-grade security, and versatile data export. We interact with
            Qualtrics programmatically via its{' '}
            <a
              href="https://api.qualtrics.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              REST API v3
            </a>
            , which enables us to copy surveys, inspect definitions, apply configuration changes,
            and export data - all from GitHub Actions.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>API Integration Pattern</h3>
            <p className="mb-4">
              Every Qualtrics API call is authenticated with an <code>X-API-TOKEN</code> header. The
              token is stored as a GitHub Actions secret in the <code>qualtrics-prod</code>{' '}
              environment and is never committed to the repository. Workflows and scripts resolve
              the base URL and survey ID from environment variables, making it straightforward to
              point the automation at a different survey or datacenter.
            </p>
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p className="mb-2 font-semibold">Key environment values</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <code>QUALTRICS_BASE_URL</code> - The datacenter root (e.g.,{' '}
                  <code>https://yul1.qualtrics.com</code>)
                </li>
                <li>
                  <code>QUALTRICS_SURVEY_ID</code> - The active survey ID (updated during annual
                  rollover)
                </li>
                <li>
                  <code>QUALTRICS_API_TOKEN</code> - API authentication secret
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Automated Workflows</h3>
            <p className="mb-4">
              Seven GitHub Actions workflows automate different aspects of Qualtrics management:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-left">
                    <th className="py-2 pr-4 font-semibold">Workflow</th>
                    <th className="py-2 pr-4 font-semibold">Purpose</th>
                    <th className="py-2 font-semibold">Read / Write</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">qualtrics-api-smoke</td>
                    <td className="py-2 pr-4">Connectivity &amp; credential test</td>
                    <td className="py-2">Read-only</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">qualtrics-dump-flow</td>
                    <td className="py-2 pr-4">Export Survey Flow JSON for inspection</td>
                    <td className="py-2">Read-only</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">qualtrics-metrics-update</td>
                    <td className="py-2 pr-4">Update survey response metrics</td>
                    <td className="py-2">Read-only</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">fetch-qualtrics-questions</td>
                    <td className="py-2 pr-4">Extract survey questions &amp; metadata</td>
                    <td className="py-2">Read-only</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">qualtrics-prolific-verify</td>
                    <td className="py-2 pr-4">Verify Prolific integration markers</td>
                    <td className="py-2">Read-only</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">qualtrics-copy-survey</td>
                    <td className="py-2 pr-4">Copy survey for annual rollover</td>
                    <td className="py-2">Write</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">qualtrics-prolific-apply</td>
                    <td className="py-2 pr-4">Apply Prolific integration config</td>
                    <td className="py-2">Write</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Annual Survey Rollover</h3>
            <p className="mb-4">
              TABS runs a 10-year data collection effort. Each year, a new copy of the survey is
              created so that yearly data stays cleanly separated. The recommended rollover
              sequence:
            </p>
            <ol className="mb-4 list-decimal space-y-2 pl-6">
              <li>
                <strong>Test connectivity</strong> - Run the smoke test workflow to verify
                credentials.
              </li>
              <li>
                <strong>Copy the survey</strong> - Use the copy workflow to clone the current
                survey.
              </li>
              <li>
                <strong>Update the environment variable</strong> - Point{' '}
                <code>QUALTRICS_SURVEY_ID</code> at the new survey ID.
              </li>
              <li>
                <strong>Verify configuration</strong> - Run the verification workflow against the
                new survey.
              </li>
              <li>
                <strong>Apply Prolific integration</strong> - If the copy didn&apos;t preserve
                Survey Flow branches, re-apply them.
              </li>
              <li>
                <strong>Update Prolific</strong> - Point the Prolific study&apos;s external URL at
                the new Qualtrics survey link.
              </li>
            </ol>
          </div>
        </section>

        {/* ── Prolific ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Prolific - Participant Recruitment</h2>

          <p className="mb-4">
            <a
              href="https://www.prolific.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Prolific
            </a>{' '}
            specializes in high-quality academic research recruitment. It enables pre-screening
            participants by job seniority, industry sector, and other criteria - ensuring the survey
            reaches the right audience. The TABS integration uses Prolific&apos;s REST API v1 for
            automated weekly data collection.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>How Prolific Connects to Qualtrics</h3>
            <p className="mb-4">
              When a Prolific participant starts the study, Prolific opens the Qualtrics survey URL
              and appends three URL parameters: <code>PROLIFIC_PID</code>, <code>STUDY_ID</code>,
              and <code>SESSION_ID</code>. Qualtrics captures these as Embedded Data fields, which
              allows us to link each survey response back to the Prolific submission.
            </p>
            <p className="mb-4">
              At the end of the survey, the respondent is redirected to the appropriate destination
              based on the Survey Flow logic. Prolific participants are redirected to
              Prolific&apos;s completion page (with a completion code), while website visitors see a
              thank-you page on the TABS site.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Automated Data Collection</h3>
            <p className="mb-4">
              A GitHub Actions workflow (<code>prolific.yml</code>) runs every Monday at 9:00 AM
              UTC. It uses a TypeScript client library to query the Prolific API, collecting study
              metadata, submission statistics, and approval rates. The workflow can also be
              triggered manually for on-demand checks.
            </p>
          </div>
        </section>

        {/* ── Survey Flow Architecture ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Survey Flow Architecture - The Two-Branch Design</h2>

          <p className="mb-4">
            The most critical piece of the Qualtrics-Prolific integration is the{' '}
            <strong>Survey Flow</strong> - the sequence of logic steps that Qualtrics executes for
            each respondent. The TABS survey uses a &quot;redirect lockdown&quot; pattern that
            ensures every respondent ends up at the correct destination, regardless of how they
            arrived at the survey.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Why We Need This</h3>
            <p className="mb-4">
              The survey accepts respondents from two channels. <strong>Website visitors</strong>{' '}
              click a button on technologyadoptionbarriers.org, which opens the Qualtrics survey
              with <code>SOURCE=TABS_Website</code> in the URL.{' '}
              <strong>Prolific participants</strong> are launched by Prolific, which appends{' '}
              <code>PROLIFIC_PID</code>, <code>STUDY_ID</code>, and <code>SESSION_ID</code> as URL
              parameters.
            </p>
            <p className="mb-4">
              Without the lockdown, the redirect URL (<code>COMPLETE_URL</code>) could be passed as
              a URL parameter by anyone, creating an open-redirect vulnerability. The two-branch
              design hard-codes <code>COMPLETE_URL</code> inside the Survey Flow so that inbound
              URLs cannot override it.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>The Two Branches</h3>
            <p className="mb-4">
              After all survey question blocks, the flow contains two conditional branches:
            </p>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-2 font-semibold text-blue-900">Branch 1 - If SOURCE is not empty</p>
              <p className="text-sm text-blue-800">
                When the <code>SOURCE</code> field has any value (e.g., <code>TABS_Website</code> or{' '}
                <code>prolific</code>), the respondent came from a known channel. This branch sets{' '}
                <code>COMPLETE_URL</code> to the <strong>website completion page</strong> and ends
                the survey with a redirect.
              </p>
            </div>

            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-2 font-semibold text-green-900">
                Branch 2 - If PROLIFIC_PID is not empty
              </p>
              <p className="text-sm text-green-800">
                This is a safety net. If a Prolific participant arrives without <code>SOURCE</code>{' '}
                being set (e.g., due to a misconfigured study URL), the presence of{' '}
                <code>PROLIFIC_PID</code> alone is enough to tag them. This branch sets{' '}
                <code>SOURCE=&quot;prolific&quot;</code>, sets <code>COMPLETE_URL</code> to the{' '}
                <strong>Prolific completion URL</strong>, and ends the survey with a redirect to
                Prolific.
              </p>
            </div>

            <p className="text-sm text-gray-600 italic">
              Branch 1 is evaluated first. Because Prolific links typically include{' '}
              <code>SOURCE=prolific</code>, Branch 1 catches Prolific participants and redirects
              them to the website completion page. This is intentional - the website thank-you page
              is appropriate for all respondents, and Prolific tracks completion independently via
              its authenticity script.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Visual Flow Diagram</h3>
            <div className="overflow-x-auto rounded-lg bg-gray-50 p-4 font-mono text-xs leading-relaxed">
              <pre>{`┌─────────────────────────────────────────────┐
│  Top-Level Embedded Data                    │
│  ├─ PROLIFIC_PID   (captured from URL)      │
│  ├─ STUDY_ID       (captured from URL)      │
│  ├─ SESSION_ID     (captured from URL)      │
│  └─ SOURCE         (captured from URL)      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Survey Question Blocks (6 blocks)          │
│  (Demographics, barriers, adoption, etc.)   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Branch 1: If SOURCE is not empty           │
│  ├─ Set COMPLETE_URL = website URL          │
│  └─ End Survey → Redirect to website        │
└──────────────────┬──────────────────────────┘
                   │ (only reached if SOURCE
                   │  was empty)
                   ▼
┌─────────────────────────────────────────────┐
│  Branch 2: If PROLIFIC_PID is not empty     │
│  ├─ Set SOURCE = "prolific"                 │
│  ├─ Set COMPLETE_URL = Prolific URL         │
│  └─ End Survey → Redirect to Prolific       │
└─────────────────────────────────────────────┘`}</pre>
            </div>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>The Apply Script</h3>
            <p className="mb-4">
              The branches are managed by a TypeScript script (
              <code>scripts/qualtrics-apply-prolific-integration.ts</code>) that reads the current
              Survey Flow, removes any existing TABS branches, rebuilds the two branches with
              hard-coded URLs, and writes the flow back via the Qualtrics API. The script is
              idempotent - running it multiple times produces the same result.
            </p>
            <p className="mb-4">
              A companion workflow (<code>qualtrics-prolific-apply.yml</code>) runs this script in
              GitHub Actions with a safety gate: you must type <code>APPLY</code> to confirm you
              want to modify the live survey.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Inspecting the Live Flow</h3>
            <p className="mb-4">
              A read-only workflow (<code>qualtrics-dump-flow.yml</code>) exports the current Survey
              Flow JSON. The output is printed to the workflow log and uploaded as a downloadable
              artifact. This is useful for verifying that the apply script produced the expected
              result, or for debugging API issues.
            </p>
          </div>
        </section>

        {/* ── Google Analytics & Search Console ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>
            Google Analytics &amp; Search Console - Impact &amp; SEO Measurement
          </h2>

          <p className="mb-4">
            Google Analytics 4 (GA4) tracks how researchers, participants, and the public interact
            with the TABS website. The Google Search Console (GSC) API powers our public SEO
            transparency dashboard. Daily GitHub Actions workflows fetch analytics and organic
            search data via Google APIs, generate JSON reports, and update our public dashboard.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Automated Reporting</h3>
            <p className="mb-4">
              The daily report workflow (<code>ga-report.yml</code>) uses a service account to
              authenticate with the GA4 API. It collects metrics like active users, sessions,
              engagement rate, and top pages, then saves the data to{' '}
              <code>src/data/impact.json</code> for display on the website. A companion script
              emails the report to the project team.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Verified Visitors Methodology</h3>
            <p className="mb-4">
              Raw GA4 numbers can be misleading - 99.6% of recorded traffic came from{' '}
              <code>localhost</code> (Playwright tests, CI runs, AI agents). The &quot;Verified
              Visitors&quot; metric filters to the production hostname only, showing actual human
              visitors.
            </p>
            <Link
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              href="/making-of-tabs/integrations/google-analytics"
            >
              Read the full methodology
            </Link>
          </div>
        </section>

        {/* ── GitHub Actions ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>GitHub Actions - The Automation Layer</h2>

          <p className="mb-4">
            GitHub Actions ties everything together. Every integration workflow runs in a secure,
            isolated environment with access to the API credentials it needs. Workflows are
            triggered on a schedule, manually via the GitHub UI or CLI, or automatically by events
            like pushes and pull requests.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Environments &amp; Secrets</h3>
            <p className="mb-4">
              API tokens are stored as GitHub Actions environment secrets - encrypted at rest and
              never exposed in logs. Each external service has its own environment:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-left">
                    <th className="py-2 pr-4 font-semibold">Environment</th>
                    <th className="py-2 pr-4 font-semibold">Service</th>
                    <th className="py-2 font-semibold">Workflows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">qualtrics-prod</td>
                    <td className="py-2 pr-4">Qualtrics API</td>
                    <td className="py-2">7 workflows</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">prolific-prod</td>
                    <td className="py-2 pr-4">Prolific API</td>
                    <td className="py-2">2 workflows</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">google-prod</td>
                    <td className="py-2 pr-4">Google Analytics &amp; Search Console</td>
                    <td className="py-2">2 workflows</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>CI/CD Pipeline</h3>
            <p className="mb-4">
              Beyond API integrations, GitHub Actions runs the full CI/CD pipeline on every pull
              request: formatting checks, linting, unit tests (including accessibility tests with
              jest-axe), static site build, and Playwright end-to-end tests. The site deploys
              automatically to GitHub Pages when changes merge to the main branch.
            </p>
          </div>
        </section>

        {/* ── For developers ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>For Developers &amp; Contributors</h2>

          <p className="mb-4">
            Detailed documentation for each integration is maintained alongside the codebase:
          </p>

          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Prolific Integration Guide</strong> - Complete setup, Survey Flow
              architecture, verification, and annual rollover (<code>PROLIFIC_INTEGRATION.md</code>)
            </li>
            <li>
              <strong>Qualtrics API Cheat Sheet</strong> - Quick reference for common API calls,
              including tenant-specific field values (<code>qualtrics-api-cheatsheet.md</code>)
            </li>
            <li>
              <strong>API Integration Guide</strong> - Comprehensive reference for all three APIs,
              environments, secrets, and workflows (<code>API_INTEGRATION_GUIDE.md</code>)
            </li>
            <li>
              <strong>MCP Servers</strong> - Model Context Protocol integration for AI coding agents
              (<code>MCP_SERVERS.md</code>)
            </li>
          </ul>

          <p className="text-sm text-gray-600">
            All documentation is in the repository root. The source code for client libraries lives
            in <code>src/lib/</code>, and workflow files are in <code>.github/workflows/</code>.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This page is a living document, updated as integrations evolve. For the most current
            details, refer to the documentation files linked above in the project repository.
          </p>
        </section>
      </article>
    </div>
  )
}

export default IntegrationsPage
