import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Prolific Integration - Making of TABS',
  description:
    'How TABS uses Prolific for participant recruitment, the Qualtrics-Prolific bridge architecture, and automated data collection workflows.',
  alternates: {
    canonical: '/making-of-tabs/integrations/prolific',
  },
}

const ProlificIntegrationPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Prolific Integration</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            <a
              href="https://www.prolific.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Prolific
            </a>{' '}
            is the participant recruitment platform that connects the TABS survey with a diverse,
            pre-screened pool of organizational leaders. Unlike general-purpose survey panels,
            Prolific specializes in high-quality academic research, offering participant screening
            by job seniority, industry sector, and other professional criteria.
          </p>
          <p className="mb-6">
            This page explains how Prolific integrates with Qualtrics, how participant data flows
            between the two platforms, and how automated workflows keep the data pipeline running.
          </p>
        </section>

        {/* ── Why Prolific ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Why Prolific</h2>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Research-grade participants</strong> - Prolific&apos;s pool is verified and
              rated for data quality, with built-in attention checks and approval mechanisms.
            </li>
            <li>
              <strong>Pre-screening</strong> - We can target participants by industry, company size,
              seniority level, and geographic region, ensuring the survey reaches decision-makers
              who actually experience technology adoption barriers.
            </li>
            <li>
              <strong>Ethical recruitment</strong> - Participants are fairly compensated and
              informed about study purposes, aligning with academic research ethics standards.
            </li>
            <li>
              <strong>API access</strong> - Prolific&apos;s REST API enables automated data
              collection, study management, and submission tracking.
            </li>
          </ul>
        </section>

        {/* ── How It Connects ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>The Qualtrics-Prolific Bridge</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Participant Flow</h3>
            <p className="mb-4">
              When a Prolific participant starts the TABS study, Prolific opens the Qualtrics survey
              URL and appends three URL parameters:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>
                <code>PROLIFIC_PID</code> - The participant&apos;s unique Prolific identifier
              </li>
              <li>
                <code>STUDY_ID</code> - The Prolific study identifier
              </li>
              <li>
                <code>SESSION_ID</code> - The specific session identifier
              </li>
            </ul>
            <p className="mb-4">
              Qualtrics captures these as <strong>Embedded Data</strong> fields in the Survey Flow,
              which links each survey response back to the Prolific submission. At the end of the
              survey, the respondent is redirected to the appropriate destination based on the
              Survey Flow logic.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Two-Channel Design</h3>
            <p className="mb-4">
              The TABS survey accepts respondents from two channels simultaneously:
            </p>

            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-1 font-semibold text-blue-900">Website visitors</p>
              <p className="text-sm text-blue-800">
                Click a button on technologyadoptionbarriers.org, which opens the survey with{' '}
                <code>SOURCE=TABS_Website</code>. After completion, they&apos;re redirected to the
                site&apos;s thank-you page.
              </p>
            </div>

            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-1 font-semibold text-green-900">Prolific participants</p>
              <p className="text-sm text-green-800">
                Launched by Prolific with <code>PROLIFIC_PID</code>, <code>STUDY_ID</code>, and{' '}
                <code>SESSION_ID</code>. After completion, the Survey Flow decides the redirect
                destination based on the presence of these parameters.
              </p>
            </div>

            <p className="mb-4 text-sm text-gray-600 italic">
              See the{' '}
              <Link
                href="/making-of-tabs/integrations/qualtrics"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Qualtrics Integration
              </Link>{' '}
              page for the full two-branch Survey Flow architecture, including the redirect lockdown
              pattern.
            </p>
          </div>
        </section>

        {/* ── Data Collection ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Automated Data Collection</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Weekly Pipeline</h3>
            <p className="mb-4">
              A GitHub Actions workflow (<code>prolific.yml</code>) runs every Monday at 9:00 AM
              UTC. It uses a TypeScript client library (<code>src/lib/prolific-api.ts</code>) to
              query the Prolific API and collect:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>Study metadata and status</li>
              <li>Submission counts and completion rates</li>
              <li>Approval and rejection statistics</li>
              <li>Participant demographic summaries</li>
            </ul>
            <p className="mb-4">
              The workflow can also be triggered manually for on-demand checks. All Prolific API
              calls use a token stored in the <code>prolific-prod</code> GitHub environment.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>API Integration</h3>
            <p className="mb-4">
              The TypeScript client wraps the{' '}
              <a
                href="https://docs.prolific.com/api-reference/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Prolific REST API v1
              </a>
              . Key functions include:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-left">
                    <th className="py-2 pr-4 font-semibold">Function</th>
                    <th className="py-2 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">getCurrentUser()</td>
                    <td className="py-2">Verify API token validity</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">listStudies()</td>
                    <td className="py-2">List all studies in the workspace</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">getStudy(id)</td>
                    <td className="py-2">Get study details and status</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">listStudySubmissions(id)</td>
                    <td className="py-2">Get all submissions for a study</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">exportSubmissionsCSV(id)</td>
                    <td className="py-2">Export submission data as CSV</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Cross-platform Verification ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Cross-Platform Verification</h2>

          <p className="mb-4">
            A dedicated workflow (<code>qualtrics-prolific-verify.yml</code>) validates the
            integration between both platforms. It checks:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              The Qualtrics Survey Flow contains the expected Embedded Data fields (
              <code>PROLIFIC_PID</code>, <code>STUDY_ID</code>, <code>SESSION_ID</code>,{' '}
              <code>SOURCE</code>)
            </li>
            <li>The two conditional branches exist with the correct redirect URLs</li>
            <li>The Prolific study&apos;s external URL points to the correct Qualtrics survey</li>
            <li>Both API tokens are valid and have the required permissions</li>
          </ul>

          <p className="mb-4">
            This verification is part of the annual rollover checklist - after copying a survey and
            re-applying the Prolific integration, the verify workflow confirms everything is wired
            correctly before the study goes live.
          </p>
        </section>

        {/* ── Data Privacy ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Data Privacy &amp; Ethics</h2>

          <p className="mb-4">The Prolific integration is designed with privacy in mind:</p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>No PII in code</strong> - Prolific participant IDs are anonymous identifiers.
              No names, emails, or other personally identifiable information flows through the
              automation.
            </li>
            <li>
              <strong>Secrets management</strong> - API tokens are stored as GitHub Actions
              environment secrets, encrypted at rest, and never exposed in logs or source code.
            </li>
            <li>
              <strong>Minimal data retention</strong> - Automated workflows collect aggregate
              statistics only. Individual submission data is accessed on-demand for research
              purposes and is not stored in the repository.
            </li>
            <li>
              <strong>Fair compensation</strong> - All Prolific participants are compensated at or
              above the platform&apos;s recommended rates.
            </li>
          </ul>
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
                href="/making-of-tabs/integrations/qualtrics"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Qualtrics Integration
              </Link>{' '}
              - survey engine and Survey Flow architecture
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
            This page documents the Prolific integration as of February 2026. For the complete setup
            guide and annual rollover checklist, see <code>PROLIFIC_INTEGRATION.md</code> in the
            project repository.
          </p>
        </section>
      </article>
    </div>
  )
}

export default ProlificIntegrationPage
