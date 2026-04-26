import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Qualtrics Integration - Making of TABS',
  description:
    'How TABS uses Qualtrics for survey design, data collection, and automated management via the Qualtrics REST API v3 and GitHub Actions workflows.',
  alternates: {
    canonical: '/making-of-tabs/integrations/qualtrics',
  },
}

const QualtricsIntegrationPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Qualtrics Integration</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            <a
              href="https://www.qualtrics.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Qualtrics
            </a>{' '}
            is the survey engine at the heart of the TABS research project. It hosts the survey
            instrument, manages branching logic, captures respondent data, and handles the
            post-survey redirect flow. We interact with Qualtrics programmatically via its{' '}
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
        </section>

        {/* ── Why Qualtrics ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Why Qualtrics</h2>
          <p className="mb-4">
            We chose Qualtrics for several reasons critical to a long-term academic survey:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Sophisticated logic capabilities</strong> - Complex question branching adapts
              to the respondent&apos;s role and industry, ensuring participants see only the
              questions relevant to them.
            </li>
            <li>
              <strong>Enterprise-grade security</strong> - SOC 2 Type II compliance, data encryption
              at rest and in transit, and fine-grained access controls.
            </li>
            <li>
              <strong>API-first platform</strong> - Every aspect of survey management (creation,
              configuration, export) is accessible via REST endpoints, enabling full automation.
            </li>
            <li>
              <strong>Embedded Data &amp; Survey Flow</strong> - The Survey Flow engine allows us to
              capture URL parameters, set variables, branch conditionally, and control the
              respondent experience without custom code.
            </li>
          </ul>
        </section>

        {/* ── API Integration ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>API Integration Pattern</h2>

          <p className="mb-4">
            Every Qualtrics API call is authenticated with an <code>X-API-TOKEN</code> header. The
            token is stored as a GitHub Actions secret in the <code>qualtrics-prod</code>{' '}
            environment and is never committed to the repository.
          </p>

          <div className="rounded-lg bg-gray-50 p-4 text-sm mb-6">
            <p className="mb-2 font-semibold">Key environment values</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <code>QUALTRICS_BASE_URL</code> - Datacenter root (e.g.,{' '}
                <code>https://yul1.qualtrics.com</code>)
              </li>
              <li>
                <code>QUALTRICS_SURVEY_ID</code> - Active survey ID (updated during annual rollover)
              </li>
              <li>
                <code>QUALTRICS_API_TOKEN</code> - API authentication secret
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>TypeScript Client Library</h3>
            <p className="mb-4">
              The repository includes a TypeScript client (<code>src/lib/qualtrics-api.ts</code>)
              that wraps common API operations. This client is used by both GitHub Actions workflows
              and local development scripts. Key functions include survey listing, definition
              export, question fetching, and metrics retrieval.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>MCP Server Integration</h3>
            <p className="mb-4">
              For IDE-integrated AI agents, Qualtrics also provides an{' '}
              <strong>MCP (Model Context Protocol) server</strong> that supports OAuth 2.0
              authentication. This allows coding agents in VS Code to query surveys, inspect
              definitions, and copy surveys interactively via the <code>.vscode/mcp.json</code>{' '}
              configuration. The MCP server supplements the REST API for interactive use cases.
            </p>
          </div>
        </section>

        {/* ── Automated Workflows ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Automated Workflows</h2>

          <p className="mb-4">
            Seven GitHub Actions workflows automate different aspects of Qualtrics management:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th className="py-2 pr-4 font-semibold">Workflow</th>
                  <th className="py-2 pr-4 font-semibold">Purpose</th>
                  <th className="py-2 pr-4 font-semibold">Trigger</th>
                  <th className="py-2 font-semibold">Read / Write</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">qualtrics-api-smoke</td>
                  <td className="py-2 pr-4">Connectivity &amp; credential test</td>
                  <td className="py-2 pr-4">Manual</td>
                  <td className="py-2">Read-only</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">qualtrics-dump-flow</td>
                  <td className="py-2 pr-4">Export Survey Flow JSON</td>
                  <td className="py-2 pr-4">Manual</td>
                  <td className="py-2">Read-only</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">qualtrics-metrics-update</td>
                  <td className="py-2 pr-4">Update response counts &amp; question count</td>
                  <td className="py-2 pr-4">Daily + Manual</td>
                  <td className="py-2">Read-only</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">fetch-qualtrics-questions</td>
                  <td className="py-2 pr-4">Extract survey question metadata</td>
                  <td className="py-2 pr-4">Manual</td>
                  <td className="py-2">Read-only</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">qualtrics-prolific-verify</td>
                  <td className="py-2 pr-4">Verify Prolific integration markers</td>
                  <td className="py-2 pr-4">Manual</td>
                  <td className="py-2">Read-only</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">qualtrics-copy-survey</td>
                  <td className="py-2 pr-4">Copy survey for annual rollover</td>
                  <td className="py-2 pr-4">Manual (confirmation required)</td>
                  <td className="py-2">Write</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">qualtrics-prolific-apply</td>
                  <td className="py-2 pr-4">Apply Prolific integration config</td>
                  <td className="py-2 pr-4">Manual (confirmation required)</td>
                  <td className="py-2">Write</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
            <p className="font-semibold mb-1">Safety gates</p>
            <p>
              Write workflows require explicit confirmation. The copy and apply workflows include a
              safety gate where you must type <code>APPLY</code> to confirm the operation. This
              prevents accidental modifications to the live survey.
            </p>
          </div>
        </section>

        {/* ── Survey Flow ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Survey Flow Architecture</h2>

          <p className="mb-4">
            The most critical piece of the Qualtrics configuration is the{' '}
            <strong>Survey Flow</strong> - the sequence of logic steps executed for each respondent.
            The TABS survey uses a &quot;redirect lockdown&quot; pattern with two conditional
            branches that ensure every respondent ends up at the correct destination.
          </p>

          <div className="mb-6">
            <h3 className={H3_CLASSES}>The Two-Branch Design</h3>
            <p className="mb-4">
              The survey accepts respondents from two channels: website visitors (via a button on
              technologyadoptionbarriers.org) and Prolific participants (launched by Prolific with
              participant IDs). After all question blocks, two conditional branches determine the
              redirect:
            </p>

            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-1 font-semibold text-blue-900">Branch 1 - SOURCE is not empty</p>
              <p className="text-sm text-blue-800">
                Respondent came from a known channel. Sets <code>COMPLETE_URL</code> to the website
                completion page and redirects there.
              </p>
            </div>

            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-1 font-semibold text-green-900">
                Branch 2 - PROLIFIC_PID is not empty
              </p>
              <p className="text-sm text-green-800">
                Safety net for Prolific participants arriving without <code>SOURCE</code>. Sets the
                source and redirects to Prolific&apos;s completion URL.
              </p>
            </div>
          </div>

          <p className="mb-4">
            The redirect lockdown prevents open-redirect vulnerabilities by hard-coding{' '}
            <code>COMPLETE_URL</code> in the Survey Flow rather than accepting it as a URL
            parameter. See the{' '}
            <Link
              href="/making-of-tabs/integrations"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Technical Integrations overview
            </Link>{' '}
            for the full visual flow diagram.
          </p>
        </section>

        {/* ── Annual Rollover ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Annual Survey Rollover</h2>

          <p className="mb-4">
            TABS runs a 10-year data collection effort. Each year, a new copy of the survey is
            created to keep yearly data cleanly separated. The recommended rollover sequence:
          </p>

          <ol className="mb-6 list-decimal space-y-3 pl-6">
            <li>
              <strong>Test connectivity</strong> - Run the smoke test workflow to verify API
              credentials are valid.
            </li>
            <li>
              <strong>Copy the survey</strong> - Use the copy workflow to clone the current
              year&apos;s survey.
            </li>
            <li>
              <strong>Update environment variable</strong> - Point <code>QUALTRICS_SURVEY_ID</code>{' '}
              at the new survey ID in GitHub environment variables.
            </li>
            <li>
              <strong>Verify configuration</strong> - Run the verification workflow against the new
              survey.
            </li>
            <li>
              <strong>Apply Prolific integration</strong> - If the copy didn&apos;t preserve Survey
              Flow branches, re-apply them using the apply workflow.
            </li>
            <li>
              <strong>Update Prolific study</strong> - Point the Prolific study&apos;s external URL
              at the new Qualtrics survey link.
            </li>
          </ol>

          <p className="text-sm text-gray-600 italic">
            This entire process can be completed in under 30 minutes using the automated workflows.
            All steps are documented in <code>PROLIFIC_INTEGRATION.md</code>.
          </p>
        </section>

        {/* ── Data-Driven Metrics ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Data-Driven Site Metrics</h2>

          <p className="mb-4">
            The Qualtrics integration feeds live data to the website. The daily metrics workflow
            queries the Qualtrics API for response counts and question metadata, then writes the
            results to <code>src/data/qualtrics-metrics.json</code>. The Response Funnel page (
            <Link className="underline" href="/results/survey-stats">/results/survey-stats</Link>)
            {' '}reads this file to surface every Qualtrics-reported count alongside the Prolific
            and pipeline-level numbers.
          </p>

          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Generated / Auditable / Deleted</strong> - Qualtrics&apos; own response
              counters, displayed in the Response Funnel&apos;s &quot;Top of funnel&quot; section.
            </li>
            <li>
              <strong>Survey definition</strong> - Question IDs and metadata used to display the
              &quot;Qualtrics question IDs&quot; metric, which is intentionally distinct from the
              participant-facing &quot;Items presented&quot; total.
            </li>
          </ul>

          <p className="mb-4">
            The headline &quot;Surveys Completed&quot; counter on the homepage and the press kit
            comes from Prolific&apos;s approved-submission count in{' '}
            <code>src/data/disposition-summary.json</code>, not from this Qualtrics file. Keeping
            the two sources separate means the marketing number and the internal funnel can each
            tell their own truth without drifting.
          </p>
        </section>

        {/* ── Related ── */}
        <section className="mb-8 text-gray-800">
          <h2 className={H2_CLASSES}>Related</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <Link
                href="/making-of-tabs/integrations"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Technical Integrations overview
              </Link>
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/prolific"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Prolific Integration
              </Link>{' '}
              - participant recruitment and the Qualtrics-Prolific bridge
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/google-analytics"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Google Analytics Integration
              </Link>{' '}
              - impact measurement and verified visitors
            </li>
          </ul>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This page documents the Qualtrics integration as of February 2026. For the most current
            API details, see <code>qualtrics-api-cheatsheet.md</code> in the project repository.
          </p>
        </section>
      </article>
    </div>
  )
}

export default QualtricsIntegrationPage
