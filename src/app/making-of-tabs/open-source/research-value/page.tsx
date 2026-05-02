import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Value of Open-Source Research Infrastructure - Making of TABS',
  description:
    'Why TABS publishes its research infrastructure - not just its data - as open source: transparency, reproducibility, reusability, sustainability, permanence, citation, and the economics that make this approach feasible.',
  alternates: {
    canonical: '/making-of-tabs/open-source/research-value',
  },
}

const ResearchValuePage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>The Value of Open-Source Research Infrastructure</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            Most academic research is open in its <em>outputs</em> - papers, data, sometimes code -
            but closed in the <em>infrastructure</em> that produced those outputs. Survey platforms,
            deployment scripts, analysis pipelines, and operational workflows usually stay inside
            the institution. TABS publishes that layer too. This page explains why, and what changes
            when you do.
          </p>
          <p className="mb-6">
            For the operational side of how the project is licensed and contributed to, see the{' '}
            <Link href="/making-of-tabs/open-source" className="text-blue-600 hover:underline">
              Open Source &amp; Community
            </Link>{' '}
            page.
          </p>
        </section>

        {/* ── 1 Transparency ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>1. Transparency Over Opacity</h2>
          <p className="mb-6">
            A reader who wants to know how a TABS finding was produced does not have to take the
            author&apos;s word for it, and does not have to write an email to ask. The survey
            instrument, the deployment workflow, the analysis code, and the quality checks are all
            visible at the same URL as the result.
          </p>
          <p className="mb-6">
            The default in academic research is the opposite: methods sections describe the machine,
            but the machine itself is not inspectable. Open infrastructure flips that default. The
            cost of asking &ldquo;how was this actually done&rdquo; drops from{' '}
            <em>request and wait</em> to <em>read the file</em>.
          </p>
        </section>

        {/* ── 2 Reproducibility ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>2. Reproducibility and Verification</h2>
          <p className="mb-6">
            When the analysis pipeline is published as code, the published code <em>is</em> the
            method - not a description of the method. A reader can re-run the pipeline against the
            published dataset and see whether the result matches.
          </p>
          <p className="mb-6">
            The same applies to the data-quality checks: the rules that decide whether a response is
            included are visible in the repository, not summarised in a paragraph. This shifts the
            credibility burden from &ldquo;trust the author&rdquo; to &ldquo;inspect the
            check.&rdquo;
          </p>
        </section>

        {/* ── 3 Reusability ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>3. Reusability and Adaptation</h2>
          <p className="mb-6">
            Apache 2.0 licensing means the platform can be re-used and adapted by anyone who needs
            something similar. Concrete reuse paths include:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Academic researchers</strong> running comparable studies in adjacent sectors,
              who can fork the survey instrument, the analysis pipeline, or both
            </li>
            <li>
              <strong>Industry practitioners</strong> benchmarking adoption inside an organisation,
              who can run the instrument internally without re-implementing it
            </li>
            <li>
              <strong>Government and public-sector teams</strong> assessing readiness across
              programmes, who need a defensible measurement design they can audit
            </li>
            <li>
              <strong>Educators</strong> teaching research methods, who can use a working pipeline
              as a worked example rather than a textbook diagram
            </li>
          </ul>

          <p className="mb-6">
            None of these paths require permission from the author. That is the point.
          </p>
        </section>

        {/* ── 4 Sustainability ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>4. Sustainability Beyond One Author</h2>
          <p className="mb-6">
            A research project tied to a single author has a single point of failure. Open-source
            infrastructure is the standard mechanism for letting a project survive its founder:
            governance documents, contribution guidelines, issue templates, and a public history
            give a future contributor enough to pick up the work without re-deriving it.
          </p>
          <p className="mb-6">
            TABS is designed to run as an annual cycle. Sustaining a multi-year cycle past one
            author requires the operational layer to be inspectable and editable by people who were
            not in the original conversations. That is not optional; it is the only way the
            longitudinal design works.
          </p>
        </section>

        {/* ── 5 Permanence ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>5. Permanence and Availability</h2>
          <p className="mb-6">
            Research artefacts have a habit of disappearing - paywalled journals, decommissioned
            university servers, vendor portals that are sunset. Hosting the platform on GitHub
            attaches it to a widely used, indexed, version-controlled host with a long history of
            availability.
          </p>
          <p className="mb-6">
            The version history is itself an artefact: every change to the instrument, the analysis,
            or the documentation is recorded with author, date, and reason. A reader in five years
            can ask &ldquo;why does the survey ask this question this way&rdquo; and get an answer
            from the commit log, not from a memory.
          </p>
        </section>

        {/* ── 6 Citation ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>6. Academic Citation and Attribution</h2>
          <p className="mb-6">
            The repository ships a{' '}
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">CITATION.cff</code> file -
            machine-readable citation metadata that GitHub surfaces as a{' '}
            <em>Cite this repository</em> button and that reference managers can import directly.
            Researchers who reuse the instrument or the pipeline can cite a specific version without
            having to compose the citation by hand.
          </p>
          <p className="mb-6">
            The combination of open licensing and structured citation metadata is what lets the
            project be both freely reusable and properly attributable. The two are not in tension;
            they are how scholarly credit and open infrastructure coexist.
          </p>
        </section>

        {/* ── 7 Economics ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>7. The Economics of Open-Source Research</h2>
          <p className="mb-6">
            A meaningful share of what a research project usually pays for - source hosting,
            continuous integration, static site hosting, analytics on public traffic, version
            control for data and code - is available at no cost on the public-good tier of commodity
            developer platforms. The recurring spend on TABS infrastructure is dominated by domain
            registration; everything else runs on services that are free for open-source projects.
          </p>
          <p className="mb-6">
            This is the under-discussed reason open-source research infrastructure is feasible at
            all. The economics are not heroic - they are commonplace in the open-source software
            world and increasingly available to academic projects that are willing to work in
            public.
          </p>
        </section>

        {/* ── Limits ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>What Open Infrastructure Does Not Solve</h2>
          <p className="mb-6">
            Publishing the infrastructure does not, on its own, make the science better. It makes
            the science <em>checkable</em>. A reader still has to do the checking. A flawed
            instrument is still flawed when it is open; a bias in the analysis is still a bias when
            it is in a public commit. The argument for open infrastructure is that it lowers the
            cost of catching those problems - not that it removes them.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            Open the data, open the code, and also open the machine that produced both.
          </p>
        </section>
      </article>
    </div>
  )
}

export default ResearchValuePage
