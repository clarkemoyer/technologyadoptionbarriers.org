import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'AI-Assisted Development - Making of TABS',
  description:
    'How the TABS project uses AI coding agents - Claude, GPT-4o, GitHub Copilot, and Gemini - to build and maintain its website, with honest lessons on what works and what does not.',
  alternates: {
    canonical: '/making-of-tabs/ai-assisted-development',
  },
}

const AIAssistedDevelopmentPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>AI-Assisted Development</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            The TABS website is built almost entirely with AI coding agents working in a 3-agent
            setup (Copilot, Jules, and Claude). This is not a marketing claim - it is a literal
            description of how code gets written. A human defines the goal, an AI agent researches
            the codebase, writes the implementation, and a different AI reviews the result. The
            human approves, requests changes, or redirects. This page documents exactly how that
            works, which models we use, and what we have learned.
          </p>
        </section>

        {/* ── The Models ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>The Models We Use</h2>
          <p className="mb-6">
            We do not rely on a single AI model. Different models have different strengths, and we
            choose based on the task at hand:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-2">Claude (Anthropic)</h3>
              <p className="text-sm text-purple-800 mb-3">
                Our primary development agent. Claude excels at deep code analysis, multi-file
                refactoring, and following complex project conventions. It reads our instruction
                files and maintains context across long sessions involving dozens of file edits.
              </p>
              <p className="text-xs text-purple-700 font-semibold">
                Best for: Large features, complex refactoring, documentation, accessibility fixes
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">GitHub Copilot</h3>
              <p className="text-sm text-blue-800 mb-3">
                Serves dual roles: inline code completion during editing, and automated pull request
                reviewer. Every PR gets a Copilot code review that catches issues ranging from
                unused variables to accessibility problems. We typically require 3 clean reviews
                before merging.
              </p>
              <p className="text-xs text-blue-700 font-semibold">
                Best for: Code review, inline completions, quick edits
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <h3 className="text-lg font-bold text-green-900 mb-2">GPT-4o / o1 (OpenAI)</h3>
              <p className="text-sm text-green-800 mb-3">
                Used for brainstorming, content drafting, and reasoning about complex architectural
                decisions. The o1 reasoning model is particularly useful for thinking through
                multi-step problems where the solution path is not obvious.
              </p>
              <p className="text-xs text-green-700 font-semibold">
                Best for: Content drafting, architecture planning, complex reasoning
              </p>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
              <h3 className="text-lg font-bold text-orange-900 mb-2">Gemini (Google)</h3>
              <p className="text-sm text-orange-800 mb-3">
                Another agent option within our IDE. Gemini offers strong performance on code
                generation tasks and provides an alternative perspective when we want to compare
                approaches across models.
              </p>
              <p className="text-xs text-orange-700 font-semibold">
                Best for: Alternative perspectives, code generation, comparative analysis
              </p>
            </div>
          </div>
        </section>

        {/* ── The Workflow ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How We Actually Build</h2>
          <p className="mb-6">
            Our development workflow is a structured loop between human intent and AI execution.
            Here is the actual process, not idealized:
          </p>

          <div className="mb-8 space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tabs-teal-deep text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className={H3_CLASSES}>Human Opens an Issue</h3>
                <p>
                  Every change starts as a GitHub Issue. The human describes the goal - fix a bug,
                  add a page, refactor a component. Parent issues can have sub-tasks for larger
                  initiatives.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tabs-teal-deep text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className={H3_CLASSES}>AI Agent Implements</h3>
                <p>
                  The human tells an AI agent (usually Claude) what to build. The agent reads the
                  codebase, understands the patterns, creates a feature branch, writes the code,
                  runs tests, and pushes the branch - all within the IDE.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tabs-teal-deep text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className={H3_CLASSES}>PR Opens, CI Runs</h3>
                <p>
                  The agent opens a pull request referencing the issue. CI automatically runs:
                  formatting checks, linting, Jest unit tests (including accessibility), static
                  build, four Playwright E2E shards, and CodeQL security scanning.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tabs-teal-deep text-white flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div>
                <h3 className={H3_CLASSES}>AI Reviews AI</h3>
                <p>
                  GitHub Copilot automatically reviews the PR. It checks for unused variables,
                  misleading comments, type safety issues, accessibility problems, and consistency
                  with the rest of the codebase. We request multiple review rounds.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tabs-teal-deep text-white flex items-center justify-center font-bold text-lg">
                5
              </div>
              <div>
                <h3 className={H3_CLASSES}>Fix, Re-review, Merge</h3>
                <p>
                  Review comments get addressed - the same or a different AI agent reads the
                  feedback, makes fixes, pushes again, and requests another review. Once reviews are
                  clean and CI is green, the human approves the merge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Instruction Files ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Instruction Files: Teaching AI Your Codebase</h2>
          <p className="mb-6">
            AI agents are only as good as the context they receive. We maintain several instruction
            files that teach agents about our project conventions, architecture, and workflows:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">File</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Purpose</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Used By</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-mono text-xs">AGENTS.md</td>
                  <td className="p-3">
                    General instructions for all AI coding agents - architecture, naming
                    conventions, testing requirements, API integrations
                  </td>
                  <td className="p-3">All agents</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-mono text-xs">CLAUDE.md</td>
                  <td className="p-3">
                    Claude-specific instructions - strengths to leverage, IDE capabilities, MCP
                    integration details, terminal access patterns
                  </td>
                  <td className="p-3">Claude</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-mono text-xs">GEMINI.md</td>
                  <td className="p-3">
                    Gemini-specific instructions - optimized for Google&apos;s agent capabilities
                    and context window
                  </td>
                  <td className="p-3">Gemini</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-mono text-xs">.github/copilot-instructions.md</td>
                  <td className="p-3">
                    GitHub Copilot instructions - automatically loaded by Copilot Chat and code
                    review, covers full project context
                  </td>
                  <td className="p-3">GitHub Copilot</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            These files are &quot;meta-documentation&quot; - documentation that teaches AI how to
            read documentation. They are version-controlled alongside the code and updated whenever
            the project&apos;s conventions change. This creates a virtuous cycle: better instruction
            files produce better AI output, which reveals what the instruction files are missing.
          </p>
        </section>

        {/* ── MCP ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>MCP: Giving AI Agents Real Tools</h2>
          <p className="mb-6">
            The <strong>Model Context Protocol (MCP)</strong> extends AI agents beyond code
            generation by giving them access to external APIs directly within the IDE:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">GitHub MCP</h3>
              <p className="text-sm text-gray-700 mb-3">
                Allows agents to create issues, open pull requests, request reviews, search code,
                and check CI status - all without leaving the conversation. The agent can manage the
                full issue-to-merge lifecycle.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Qualtrics MCP</h3>
              <p className="text-sm text-gray-700 mb-3">
                Connects agents to the Qualtrics survey platform via OAuth. Agents can list surveys,
                inspect definitions, and manage survey operations - useful for the annual survey
                rollover process.
              </p>
            </div>
          </div>

          <p>
            MCP means an agent can go from &quot;create an issue for this bug&quot; to &quot;fix it,
            open a PR, and request a review&quot; in a single conversation. This is how most of our
            development actually happens.
          </p>
        </section>

        {/* ── Quality Guardrails ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Quality Guardrails</h2>
          <p className="mb-6">
            AI-generated code is not trusted by default. Every change passes through multiple
            automated quality gates before it reaches production:
          </p>

          <ul className="list-disc pl-6 space-y-3 mb-6">
            <li>
              <strong>Prettier formatting</strong> - enforced in CI; code that does not match the
              project style is rejected
            </li>
            <li>
              <strong>ESLint</strong> - catches code quality issues; new errors fail the build
            </li>
            <li>
              <strong>Jest unit tests</strong> - 124+ tests covering components and utilities
            </li>
            <li>
              <strong>jest-axe accessibility</strong> - automated WCAG compliance checks that catch
              missing ARIA labels, incorrect roles, and color contrast issues
            </li>
            <li>
              <strong>Static build</strong> - the entire site must build successfully as a static
              export
            </li>
            <li>
              <strong>Playwright E2E</strong> - four parallel shards testing real browser
              interactions across the full site
            </li>
            <li>
              <strong>CodeQL security scanning</strong> - GitHub&apos;s code analysis catches
              security vulnerabilities
            </li>
            <li>
              <strong>Copilot code review</strong> - automated review catching logical errors,
              unused code, misleading comments, and consistency issues
            </li>
            <li>
              <strong>Lighthouse CI</strong> - performance, accessibility, and SEO scoring on every
              merge to main
            </li>
          </ul>

          <p>
            These guardrails mean that AI can write code aggressively - the safety net catches
            problems before they reach users.
          </p>
        </section>

        {/* ── Lessons Learned ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>What We Have Learned</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Where AI Excels</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong>Boilerplate and scaffolding</strong> - creating new pages, components, and
                test files following established patterns
              </li>
              <li>
                <strong>Multi-file refactoring</strong> - renaming, restructuring, and moving code
                across many files consistently
              </li>
              <li>
                <strong>Writing tests</strong> - generating unit and E2E tests with good coverage of
                edge cases
              </li>
              <li>
                <strong>Documentation</strong> - writing clear, structured technical documentation
                and inline comments
              </li>
              <li>
                <strong>Accessibility fixes</strong> - identifying and fixing ARIA issues, semantic
                HTML problems, and keyboard navigation gaps
              </li>
              <li>
                <strong>Code review response</strong> - reading review comments and implementing
                precise fixes
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Where AI Struggles</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong>Merge strategy failures</strong> - squash merging stale branches can
                silently revert dozens of previously merged PRs. We learned this the hard way when a
                single squash merge{' '}
                <Link
                  href="/making-of-tabs/ai-assisted-development/squash-merge-incident"
                  className="text-blue-600 hover:underline"
                >
                  reverted 25+ PRs across 67 files
                </Link>
              </li>
              <li>
                <strong>Nuanced design decisions</strong> - visual layout choices, color palette
                decisions, and UX trade-offs still need human judgment
              </li>
              <li>
                <strong>Cross-session context</strong> - agents lose context between conversations;
                the instruction files partially solve this, but complex multi-day work requires
                human continuity
              </li>
              <li>
                <strong>External API quirks</strong> - when an API behaves unexpectedly (like
                Qualtrics rejecting a valid-looking request), agents can get stuck in loops trying
                the same approach
              </li>
              <li>
                <strong>Knowing when to stop</strong> - agents sometimes over-engineer solutions or
                make unnecessary &quot;improvements&quot; that the human did not request
              </li>
            </ul>
          </div>
        </section>

        {/* ── Impact ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>The Impact</h2>
          <p className="mb-6">
            This approach allows a small team to maintain a 149+ page website with comprehensive
            testing, daily automated reports, and multiple API integrations. Tasks that would take
            hours of manual coding - creating six new pages with consistent styling, breadcrumbs,
            metadata, sitemap entries, and navigation updates - can be completed in a single
            conversation.
          </p>
          <p className="mb-6">
            The key insight is not that AI writes perfect code. It does not. The key insight is that
            with good guardrails - CI, automated review, accessibility checks - the imperfect code
            gets caught and fixed before it matters. The velocity gain comes from the AI handling
            the mechanical work while the human focuses on direction and quality judgment.
          </p>
        </section>

        {/* ── Stories from Development ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Stories from Development</h2>
          <p className="mb-6">
            Real moments from the TABS development process that illustrate how multi-agent AI
            development works in practice - the wins and the failures.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/making-of-tabs/ai-assisted-development/overnight-shift"
              className="block rounded-xl border border-purple-200 bg-purple-50 p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-purple-900 mb-2">
                &ldquo;Copilot&apos;s Got the Overnight Shift&rdquo;
              </h3>
              <p className="text-sm text-purple-800">
                Claude Code finishes a session, assigns 9 issues to Copilot for overnight
                processing, and signs off. A real screenshot of multi-agent handoff.
              </p>
            </Link>

            <Link
              href="/making-of-tabs/ai-assisted-development/squash-merge-incident"
              className="block rounded-xl border border-red-200 bg-red-50 p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-red-900 mb-2">The Squash Merge Incident</h3>
              <p className="text-sm text-red-800">
                A single squash merge silently reverted 25+ PRs across 67 files. How speed amplifies
                mistakes, and the safeguards we built afterward.
              </p>
            </Link>

            <Link
              href="/making-of-tabs/ai-assisted-development/50-reviewer-process"
              className="block rounded-xl border border-teal-200 bg-teal-50 p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-teal-900 mb-2">The 50-Reviewer Process</h3>
              <p className="text-sm text-teal-800">
                How fifty simulated expert-reviewer personas were designed, batched, aggregated, and
                triaged to stress-test the CRP before committee submission. The method, not the
                run-time numbers.
              </p>
            </Link>
          </div>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This page was, naturally, written by an AI agent and reviewed by GitHub Copilot. The
            human approved it.
          </p>
        </section>
      </article>
    </div>
  )
}

export default AIAssistedDevelopmentPage
