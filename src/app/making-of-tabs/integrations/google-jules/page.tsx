import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Google Jules (Gemini) Integration - Making of TABS',
  description:
    'How TABS uses Google Jules, powered by Gemini, for autonomous visualization, content, and frontend workflows.',
  alternates: {
    canonical: '/making-of-tabs/integrations/google-jules',
  },
}

const GoogleJulesIntegrationPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Google Jules (Gemini) Integration</h1>
        <p className="mb-8 text-lg sm:text-xl text-gray-600 font-sans">
          Jules is Google&apos;s autonomous coding agent powered by Gemini. We leverage its high
          concurrency and vast context window to handle visualization, content updates, and complex
          frontend work at scale.
        </p>

        {/* ── What is Jules ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>What is Jules?</h2>
          <p className="mb-4">
            <a
              href="https://jules.google/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Jules
            </a>{' '}
            is an autonomous AI coding agent designed to interact with repositories similarly to a
            human contributor. Powered by the Gemini 3.1 Pro model, it can clone a repository,
            understand the codebase, write and test code, and eventually open a pull request without
            manual intervention.
          </p>
        </section>

        {/* ── How it works ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>How It Works</h2>
          <p className="mb-4">
            The integration process is seamless and heavily tied into our GitHub workflows. When a
            new issue is created that requires Jules&apos; attention, a maintainer simply adds the{' '}
            <code>jules</code> label.
          </p>
          <div className="rounded-lg bg-gray-50 p-4 text-sm font-mono mb-6 whitespace-pre-wrap">
            {`1. Issue created with requirements
2. Label 'jules' added
3. GitHub Action (jules-on-label.yml) triggered
4. Jules clones the repo to a Google Cloud VM
5. Jules writes code, validates builds, and opens a PR`}
          </div>
        </section>

        {/* ── Capabilities ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Capabilities</h2>
          <p className="mb-4">
            Because Jules operates independently on a Google Cloud VM with full access to the
            repository, its capabilities include:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Codebase Analysis:</strong> Navigating and parsing large codebases using its
              long context window.
            </li>
            <li>
              <strong>Multi-file Changes:</strong> Making consistent updates across numerous
              components and data files.
            </li>
            <li>
              <strong>Build Verification:</strong> Running <code>npm run build</code> and other
              checks before submitting.
            </li>
            <li>
              <strong>PR Creation:</strong> Automatically pushing branches and creating pull
              requests with clear descriptions.
            </li>
          </ul>
        </section>

        {/* ── Secret Management ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Secret Management</h2>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              The Jules API <code>sendMessage</code> endpoint requires an OAuth2 bearer token, NOT
              the API key from settings.
            </li>
            <li>
              For local development, we store the API key in Windows Credential Manager (
              <code>cmdkey /generic:TABS_GOOGLE_JULES_API_KEY</code>).
            </li>
            <li>
              The Jules CLI handles OAuth internally - use <code>jules remote new</code> for
              programmatic interaction.
            </li>
          </ul>
        </section>

        {/* ── Feedback Methods ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Feedback Methods</h2>
          <p className="mb-4">When interacting with Jules, these methods have proven effective:</p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>@jules on PR comments:</strong> Works effectively when Jules has an active,
              open pull request.
            </li>
            <li>
              <strong>jules remote new via CLI:</strong> The best approach for giving detailed,
              fresh instructions and creating a new session.
            </li>
            <li>
              <strong>Jules web UI (jules.google):</strong> Direct, reliable interaction.
            </li>
            <li>
              <strong>@jules on issue comments:</strong> Does <em>NOT</em> unblock waiting sessions
              (tested and confirmed).
            </li>
            <li>
              <strong>Jules API sendMessage:</strong> Requires an OAuth bearer token, not the
              standard API key.
            </li>
          </ul>
        </section>

        {/* ── Concurrency & Workflows ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Concurrency &amp; Workflows</h2>
          <p className="mb-4">
            TABS relies on the <strong>Ultra tier</strong> of Jules, which provides up to{' '}
            <strong>60 concurrent tasks</strong>. This massive pool is completely independent from
            GitHub Copilot&apos;s concurrency pool, making it ideal for wide-scale refactors.
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              Tasks can be instantiated via the Jules CLI, the web UI, or our custom GitHub Action.
            </li>
            <li>
              The <code>.github/workflows/jules-on-label.yml</code> workflow triggers Jules
              automatically when the <code>jules</code> label is added to an issue.
            </li>
            <li>
              The <code>auto-approve-bot-workflows.yml</code> action unblocks bot-generated pull
              requests for smooth CI checks.
            </li>
            <li>
              Scheduled agents (like Security, Performance, and Testing) are available for setup
              directly in the Jules UI.
            </li>
          </ul>
        </section>

        {/* ── Task Routing ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Task Routing in a Multi-Agent Setup</h2>
          <p className="mb-4">
            With three primary AI agents, we route work strategically based on strengths:
          </p>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full text-left text-sm text-gray-800 border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 font-semibold">Agent</th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold">Concurrency</th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold">Focus Areas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">Jules</td>
                  <td className="border border-gray-200 px-4 py-2">60 (Ultra tier)</td>
                  <td className="border border-gray-200 px-4 py-2">
                    Visualization, charts, content pages, frontend components
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">Copilot</td>
                  <td className="border border-gray-200 px-4 py-2">~4</td>
                  <td className="border border-gray-200 px-4 py-2">
                    Pipeline scripts, workflow YAML, analysis code, GitHub Actions
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">Claude Code</td>
                  <td className="border border-gray-200 px-4 py-2">1 (Orchestrator)</td>
                  <td className="border border-gray-200 px-4 py-2">
                    PR management, Prolific operations, complex multi-step work
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Jules Features We Use ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Jules Features We Use</h2>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Issue-to-PR Coding:</strong> The <code>jules</code> label workflow automates
              the transition from idea to implementation.
            </li>
            <li>
              <strong>Automatic Issue Finding:</strong> Jules can proactively scan the repository
              for bugs and propose fixes.
            </li>
            <li>
              <strong>Scheduled Sessions:</strong> Routine maintenance tasks can be handed off to
              Jules over time.
            </li>
            <li>
              <strong>Build and Quality Checks:</strong> Verifying changes before opening a PR
              ensures high code quality.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Other Available Features</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <a
                href="https://developers.google.com/jules/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Jules API
              </a>{' '}
              for programmatic task creation.
            </li>
            <li>Jules CLI for local orchestration.</li>
            <li>Powered by the latest Gemini 3.1 Pro model.</li>
            <li>Session monitoring available directly at jules.google.</li>
          </ul>
        </section>

        {/* ── Comparison & Privacy ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Comparison with Copilot &amp; Privacy</h2>
          <p className="mb-4">
            Jules and Copilot are <strong>complementary, not competing</strong>. Copilot is heavily
            integrated into our code review cycle and daily CI/CD routines, while Jules acts as a
            massive parallel workforce capable of tackling broad, multi-file frontend scopes at
            once.
          </p>
          <p className="mb-4">
            <strong>Privacy:</strong> When triggered, Jules clones the repository to a secure Google
            Cloud VM, processes the requested changes locally within that environment, and returns
            the result via a Pull Request. Data is handled securely following Google&apos;s
            stringent cloud security protocols.
          </p>
        </section>
      </article>
    </div>
  )
}

export default GoogleJulesIntegrationPage
