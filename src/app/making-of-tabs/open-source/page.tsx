import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Open Source & Community - Making of TABS',
  description:
    'Why the TABS project is open source - Apache 2.0 licensing, community health files, contribution guidelines, academic citation, and how we build in public.',
  alternates: {
    canonical: '/making-of-tabs/open-source',
  },
}

const OpenSourcePage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Open Source &amp; Community</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            The TABS project is fully open source. Every line of code, every design decision, and
            every workflow configuration is publicly visible. This is a deliberate choice: a
            research project that documents technology adoption barriers should itself be a
            transparent example of how technology is adopted, built, and maintained.
          </p>
        </section>

        {/* ── License ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Apache 2.0 License</h2>
          <p className="mb-6">
            The project is licensed under the{' '}
            <a
              href="https://www.apache.org/licenses/LICENSE-2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Apache License 2.0
            </a>
            , which allows:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Commercial use</strong> - organizations can use, modify, and distribute the
              code freely
            </li>
            <li>
              <strong>Modification</strong> - anyone can adapt the code for their own projects
            </li>
            <li>
              <strong>Patent protection</strong> - contributors grant a patent license, providing
              legal clarity
            </li>
            <li>
              <strong>Attribution only</strong> - the only requirement is to include the license and
              copyright notice
            </li>
          </ul>

          <p className="mb-6">
            We chose Apache 2.0 over MIT or GPL because it provides explicit patent protection -
            important for a project connected to academic research - while remaining maximally
            permissive for adoption.
          </p>
        </section>

        {/* ── Community Health ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Community Health Files</h2>
          <p className="mb-6">
            GitHub recognizes a set of standard community health files that appear automatically in
            the repository&apos;s navigation. TABS maintains all of them:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">File</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Purpose</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    GitHub Feature
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['README.md', 'Project overview and setup', 'Repository landing page'],
                  ['LICENSE', 'Apache 2.0 license text', 'License tab in navigation'],
                  ['CODE_OF_CONDUCT.md', 'Contributor Covenant 2.1', 'Code of Conduct tab'],
                  ['CONTRIBUTING.md', 'How to contribute', 'Contributing tab and sidebar link'],
                  ['SECURITY.md', 'Vulnerability reporting process', 'Security tab'],
                  ['SUPPORT.md', 'Where to get help', 'Sidebar link'],
                  ['CITATION.cff', 'Academic citation metadata', '"Cite this repository" button'],
                  ['CHANGELOG.md', 'Version history', 'Release documentation'],
                  ['.github/FUNDING.yml', 'Funding sources', '"Sponsor" button in header'],
                  ['.github/CODEOWNERS', 'Code ownership rules', 'Auto-assigns PR reviewers'],
                  [
                    '.github/PULL_REQUEST_TEMPLATE.md',
                    'PR description template',
                    'Auto-populates PR form',
                  ],
                  ['.github/ISSUE_TEMPLATE/', '4 issue templates', 'Issue creation form'],
                ].map(([file, purpose, feature]) => (
                  <tr key={file} className="border-b border-gray-100">
                    <td className="p-3 font-mono text-xs">{file}</td>
                    <td className="p-3">{purpose}</td>
                    <td className="p-3 text-gray-600">{feature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Academic Citation ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Academic Citation</h2>
          <p className="mb-6">
            The repository includes a{' '}
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">CITATION.cff</code> file that
            enables GitHub&apos;s &quot;Cite this repository&quot; button. Researchers can export
            citation metadata in BibTeX or APA format with a single click. This is especially
            important for a project that bridges academic research and open source development.
          </p>

          <div className="mb-6 rounded-lg bg-gray-900 text-gray-100 p-4 overflow-x-auto">
            <pre className="text-sm font-mono">
              <code>{`cff-version: 1.2.0
title: Technology Adoption Barriers Survey (TABS) Website
message: >-
  If you use this software, please cite it using the
  metadata from this file.
type: software
authors:
  - given-names: Clarke
    family-names: Moyer
    email: clarke@technologyadoptionbarriers.org
    affiliation: Technology Adoption Barriers Survey (TABS)
repository-code: https://github.com/clarkemoyer/technologyadoptionbarriers.org
url: https://technologyadoptionbarriers.org
license: Apache-2.0`}</code>
            </pre>
          </div>
        </section>

        {/* ── Contributing ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Contribution Workflow</h2>
          <p className="mb-6">
            All contributions follow a structured Issue → Pull Request → Review → Merge workflow:
          </p>

          <ol className="list-decimal pl-6 space-y-3 mb-6">
            <li>
              <strong>Open an issue</strong> - describe the change, bug, or feature request
            </li>
            <li>
              <strong>Create a feature branch</strong> - use conventional naming (
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">feat/</code>,{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">fix/</code>,{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">docs/</code>)
            </li>
            <li>
              <strong>Make changes</strong> - follow the style guide, naming conventions, and
              accessibility requirements
            </li>
            <li>
              <strong>Open a pull request</strong> - the PR template auto-populates with checklists
              for testing, accessibility, and documentation
            </li>
            <li>
              <strong>Pass CI</strong> - formatting, linting, unit tests, E2E tests, and
              accessibility checks must all pass
            </li>
            <li>
              <strong>Code review</strong> - automated Copilot review plus human review for all
              changes
            </li>
            <li>
              <strong>Squash merge</strong> - clean commit history on{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">main</code>
            </li>
          </ol>
        </section>

        {/* ── Issue Templates ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Issue Templates</h2>
          <p className="mb-6">TABS provides four issue templates to guide contributors:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: 'Bug Report',
                desc: 'Steps to reproduce, expected vs actual behavior, environment details',
              },
              {
                title: 'Feature Request',
                desc: 'Problem statement, proposed solution, alternatives considered',
              },
              {
                title: 'Documentation',
                desc: 'What needs updating, where, and why',
              },
              {
                title: 'Reviewer Onboarding',
                desc: 'Checklist for new code reviewers joining the project',
              },
            ].map((template) => (
              <div
                key={template.title}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <h3 className="text-base font-semibold text-gray-900 mb-1">{template.title}</h3>
                <p className="text-sm text-gray-600">{template.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Building in Public ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Building in Public</h2>
          <p className="mb-6">Being open source means all project decisions are visible:</p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Issues track all work</strong> - feature requests, bugs, and improvements are
              documented in GitHub Issues
            </li>
            <li>
              <strong>PRs show the process</strong> - code review comments, CI results, and
              iteration are all part of the public record
            </li>
            <li>
              <strong>Changelog documents releases</strong> - every version includes a detailed
              summary of changes
            </li>
            <li>
              <strong>Agent instruction files</strong> - AGENTS.md, CLAUDE.md, and GEMINI.md
              document how AI coding agents are configured for this project
            </li>
            <li>
              <strong>CI/CD is transparent</strong> - GitHub Actions workflows are visible in the
              repository
            </li>
          </ul>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            Open source is not just a license - it is how we work.
          </p>
        </section>
      </article>
    </div>
  )
}

export default OpenSourcePage
