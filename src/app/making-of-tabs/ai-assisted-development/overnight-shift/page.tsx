import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
import { assetPath } from '@/lib/assetPath'

export const metadata: Metadata = {
  title: "Copilot's Got the Overnight Shift — AI-Assisted Development — Making of TABS",
  description:
    'A real screenshot from a Claude Code session showing multi-agent orchestration: Claude finishing work, assigning 9 issues to Copilot for overnight processing, and signing off.',
  alternates: {
    canonical: '/making-of-tabs/ai-assisted-development/overnight-shift',
  },
}

const OvernightShiftPage = () => {
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
            <li>
              <Link
                href="/making-of-tabs/ai-assisted-development"
                className="hover:text-blue-600 hover:underline"
              >
                AI-Assisted Development
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Copilot&apos;s Got the Overnight Shift
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>
          &ldquo;Go Sleep — Copilot&apos;s Got the Overnight Shift&rdquo;
        </h1>

        <div className="mb-8 rounded-xl border border-purple-200 bg-purple-50 p-6">
          <p className="text-sm text-purple-900 font-semibold mb-2">
            Zotero Integration Session — April 6–7, 2026
          </p>
          <p className="text-sm text-purple-800">
            A real, unscripted moment from a Claude Code session that captures the multi-agent
            workflow in action: one AI agent finishing its work, delegating 9 issues to another
            agent for overnight processing, and signing off.
          </p>
        </div>

        {/* ── The Screenshot ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>The Moment</h2>
          <figure className="mb-6">
            <img
              src={assetPath('/Images/making-of-tabs/copilot-overnight-shift.png')}
              alt="Claude Code terminal session showing a status summary: PRs #1281 and #1283 merged, PR #1293 auto-merge waiting, 9 issues assigned to Copilot overnight, and issue #1347 documented for next session. The final message reads: You're good. Go sleep — Copilot's got the overnight shift."
              className="w-full rounded-lg border border-gray-200 shadow-md"
            />
            <figcaption className="mt-3 text-sm text-gray-500 italic text-center">
              Claude Code wrapping up the Zotero integration session — everything is either merged,
              auto-merging, assigned to Copilot, or documented for the next session.
            </figcaption>
          </figure>
        </section>

        {/* ── What You're Seeing ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>What You&apos;re Seeing</h2>
          <p className="mb-6">
            At the end of an evening session, Claude Code presents a status report. Every task has a
            clear disposition:
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                ✓
              </span>
              <div>
                <h3 className={H3_CLASSES}>Merged</h3>
                <p>
                  PRs #1281 and #1283 — already merged and deployed. The Zotero environment setup
                  and initial bibliography integration are live.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                ⏳
              </span>
              <div>
                <h3 className={H3_CLASSES}>Auto-merge Waiting</h3>
                <p>
                  PR #1293 — CI passed, auto-merge is enabled. It will merge on its own once status
                  checks propagate. No human intervention needed.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                9
              </span>
              <div>
                <h3 className={H3_CLASSES}>Assigned to Copilot Overnight</h3>
                <p>
                  Nine sub-issues from the Zotero integration were created and assigned to
                  Copilot&apos;s coding agent. While the human sleeps, Copilot picks up each issue,
                  creates a branch, writes the implementation, opens a PR, and moves on to the next.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-sm font-bold">
                📋
              </span>
              <div>
                <h3 className={H3_CLASSES}>Documented for Next Session</h3>
                <p>
                  Issue #1347 — work that requires human decision-making or is too complex for
                  autonomous execution, saved for the next interactive session.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why This Matters ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Why This Matters</h2>
          <p className="mb-6">This screenshot captures three things about how TABS is built:</p>

          <div className="space-y-6">
            <div>
              <h3 className={H3_CLASSES}>1. Multi-Agent Orchestration</h3>
              <p>
                Claude Code acts as the session orchestrator — researching the codebase, writing
                implementations, opening PRs, and creating issues. When the session ends, it
                delegates remaining work to GitHub Copilot&apos;s coding agent, which operates
                autonomously on assigned issues. Two AI agents, different capabilities, coordinated
                handoff.
              </p>
            </div>

            <div>
              <h3 className={H3_CLASSES}>2. Autonomous CI/CD</h3>
              <p>
                The pipeline does not stop when the human leaves. Auto-merge waits for CI checks to
                pass and merges without intervention. Copilot picks up issues, writes code, and
                opens PRs that go through the same automated review cycle. By morning, the human
                wakes up to PRs ready for review — not an empty backlog.
              </p>
            </div>

            <div>
              <h3 className={H3_CLASSES}>3. The Human-AI Collaboration Model</h3>
              <p>
                The human decided to build Zotero integration. Claude Code executed the plan across
                multiple PRs and issues. Copilot handles the follow-up work overnight. The human
                reviews the results in the morning. Direction is human; execution is distributed
                across agents; quality is enforced by CI.
              </p>
            </div>
          </div>
        </section>

        {/* ── Context ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Session Context</h2>
          <p className="mb-4">
            This screenshot came from the session that built the Zotero reference management
            integration. In a single evening, the session:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              Created the <code className="text-xs bg-gray-200 px-1 rounded">zotero-prod</code>{' '}
              GitHub environment with API credentials
            </li>
            <li>Set up the pyzotero MCP server across Claude Desktop, VS Code, and Claude Code</li>
            <li>
              Populated the Website Citations collection with 64+ items from the Zotero library
            </li>
            <li>Created 15 enriched software citations with full metadata</li>
            <li>Opened 9 sub-issues and assigned them all to Copilot at end of session</li>
            <li>
              Merged PRs{' '}
              <a
                href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1281"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                #1281
              </a>{' '}
              and{' '}
              <a
                href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1283"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                #1283
              </a>
              , with{' '}
              <a
                href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1293"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                #1293
              </a>{' '}
              set to auto-merge
            </li>
          </ul>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This page documents a real moment from the TABS development process. The screenshot is
            unedited. The quote is what the agent actually said.
          </p>
        </section>
      </article>
    </main>
  )
}

export default OvernightShiftPage
