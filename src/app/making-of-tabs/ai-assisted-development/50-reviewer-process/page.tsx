import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The 50-Reviewer Process - AI-Assisted Development - Making of TABS',
  description:
    'How the TABS Culminating Research Project (CRP) used 50 simulated expert-reviewer personas in parallel batches to surface gaps before committee submission - the design of the method, not the run-time numbers.',
  alternates: {
    canonical: '/making-of-tabs/ai-assisted-development/50-reviewer-process',
  },
}

const FiftyReviewerProcessPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>The 50-Reviewer Process</h1>

        <div className="mb-8 rounded-xl border border-purple-200 bg-purple-50 p-6">
          <p className="text-sm text-purple-900 font-semibold mb-2">
            CRP Pre-Submission Review - Methodology
          </p>
          <p className="text-sm text-purple-800">
            Before submitting the TABS Culminating Research Project (CRP) to the doctoral committee,
            the author used Claude to simulate fifty distinct expert-reviewer personas in parallel
            batches to stress-test the document. This page describes how the method was designed and
            run. Round-by-round counts and scores are intentionally kept out of the prose - they are
            run-time artifacts, not part of the method.
          </p>
        </div>

        {/* ── What this is ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>What the Method Is</h2>
          <p className="mb-6">
            The 50-reviewer process is a structured way to use a large language model (Claude) to
            generate simulated expert feedback on a long-form research document before that document
            goes to human committee review. The author treats the AI output as{' '}
            <em>a systematic way to surface candidate findings</em> - not as a substitute for
            committee review, peer review, or empirical validation.
          </p>
          <p className="mb-6">
            The author retained full decision-making authority over every finding. The process
            generated candidate critiques; the author triaged them.
          </p>
        </section>

        {/* ── Why fifty ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Why Fifty Reviewers</h2>
          <p className="mb-6">
            Single-reviewer prompts (&ldquo;critique this document&rdquo;) tend to surface a narrow
            band of issues - usually whatever the model considers most legible. Increasing the
            number of reviewers and forcing each one to occupy a distinct disciplinary lens widens
            the band of issues that get raised, because each persona reads the same document against
            a different rubric.
          </p>
          <p className="mb-6">
            Fifty was chosen as a working size that is large enough to span the disciplines a
            doctoral committee might draw from, while still being small enough to triage by hand. It
            is not a magic number; the design of the personas matters more than the count.
          </p>
        </section>

        {/* ── Persona design ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How the Personas Were Designed</h2>
          <p className="mb-6">
            Each persona is specified along three axes so that two personas in the same broad
            category (e.g. two psychometricians) still read the document differently:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Axis</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    What it specifies
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">Disciplinary background</td>
                  <td className="p-3">
                    The reviewer&apos;s home field and the journals they would read
                  </td>
                  <td className="p-3 text-gray-600">
                    Industrial-organizational psychology; MIS Quarterly
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">Methodological orientation</td>
                  <td className="p-3">
                    What the reviewer treats as evidence (CFA, ethnography, design research, etc.)
                  </td>
                  <td className="p-3 text-gray-600">
                    Quantitative, latent-variable; values measurement invariance
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">Critical lens</td>
                  <td className="p-3">
                    A point of view that biases what the reviewer is most likely to flag
                  </td>
                  <td className="p-3 text-gray-600">
                    Skeptical of self-report; pushes for behavioural anchors
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-6">
            The fifty personas span committee-style readers (chair, methods member, content member),
            adjacent academic readers (psychometricians, sociologists of technology, philosophers of
            science, feminist methods scholars, critical theorists), and practitioner-style readers
            (CIOs, CTOs, management consultants, research librarians, IRB reviewers). The goal is
            not realism - it is{' '}
            <em>coverage of the rubrics a doctoral document is likely to be read against</em>.
          </p>
        </section>

        {/* ── Batching ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How Reviewers Were Run</h2>
          <p className="mb-6">
            Reviewers were run in parallel batches rather than as one fifty-reviewer prompt. The
            batch structure is the part of the method that does the work:
          </p>

          <ul className="list-disc pl-6 space-y-3 mb-6">
            <li>
              <strong>Independence within a batch.</strong> Reviewers in the same batch do not see
              each other&apos;s output. This prevents one early framing from anchoring the rest -
              the failure mode of a single long &ldquo;panel&rdquo; prompt.
            </li>
            <li>
              <strong>Same source-of-truth.</strong> Every reviewer in a round reads the same
              version of the document. Findings can therefore be compared without worrying about
              which draft a critique referred to.
            </li>
            <li>
              <strong>Same output schema.</strong> Each reviewer is asked to return findings in a
              fixed format - a short label, a severity tag, the location in the document, and a
              recommended change. Without a schema the outputs cannot be aggregated; with one, they
              can be sorted and de-duplicated.
            </li>
            <li>
              <strong>Severity is defined before the run.</strong> A finding is labelled{' '}
              <em>critical</em> only if the reviewer believes the document fails on that point as
              currently written. Lower-severity tiers cover suggestions, polish, and out-of-scope
              ideas. The categories are part of the prompt; they are not defined after the fact.
            </li>
          </ul>
        </section>

        {/* ── Aggregation ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How Findings Were Aggregated</h2>
          <p className="mb-6">
            After a batch finishes, the author runs three passes over the combined findings:
          </p>

          <div className="mb-8 space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tabs-teal-deep text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className={H3_CLASSES}>De-duplication</h3>
                <p>
                  Findings that point to the same passage and recommend the same change collapse to
                  one. The number of reviewers raising a duplicate is preserved as a signal of
                  consensus, not as additional weight in the count.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tabs-teal-deep text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className={H3_CLASSES}>Conflict surfacing</h3>
                <p>
                  When two reviewers recommend opposing changes to the same passage, the conflict is
                  preserved rather than averaged. Conflicts are usually the most informative output
                  of the round - they mark places where the document has to make a defensive choice
                  rather than a fix.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tabs-teal-deep text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className={H3_CLASSES}>Triage</h3>
                <p>
                  Each finding is routed to one of three buckets:{' '}
                  <strong>implement before submission</strong>,{' '}
                  <strong>defer to a future revision</strong>, or{' '}
                  <strong>reject with a recorded reason</strong>. The reason matters: a rejection
                  without a reason rots into a hidden assumption.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How rounds shifted focus ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How Rounds Were Sequenced</h2>
          <p className="mb-6">
            Successive rounds were not identical re-runs. The reviewer set was rebalanced between
            rounds so that each round emphasised a different rubric, with earlier rounds covering
            the rubrics most likely to gate committee approval:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Early rounds</strong> emphasised statistical and psychometric rigor - factor
              structure, validity evidence, the chain from theory to measurement.
            </li>
            <li>
              <strong>Middle rounds</strong> emphasised documentation completeness and
              reproducibility - data dictionaries, code availability, regulatory compliance, process
              documentation.
            </li>
            <li>
              <strong>Later rounds</strong> emphasised epistemological positioning - the
              study&apos;s philosophical commitments, the limits of its theoretical frame, and what
              kinds of claims the design can and cannot support.
            </li>
            <li>
              <strong>Final rounds</strong> emphasised generalisability boundaries and the
              constraints that a self-report measurement design imposes on inference.
            </li>
          </ul>

          <p className="mb-6">
            This ordering is deliberate: structural problems are cheaper to fix early; framing
            problems compound when discovered late.
          </p>
        </section>

        {/* ── What the author kept and rejected ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>
            What &ldquo;Reject With a Recorded Reason&rdquo; Looked Like
          </h2>
          <p className="mb-6">
            Not every finding was implemented. The most informative rejections concerned scope - for
            example, suggestions to add AI-specific adoption barriers to the instrument were
            rejected to preserve a technology-agnostic measurement design. The decision was recorded
            so that a later reader (or a future round) can see <em>why</em> the suggestion was
            declined, not just that it was.
          </p>
          <p className="mb-6">
            The rejection log is part of the output of the process. It is the artefact that
            distinguishes &ldquo;the AI didn&apos;t flag it&rdquo; from &ldquo;the AI flagged it and
            the author argued back.&rdquo;
          </p>
        </section>

        {/* ── Verification ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Verification Outside the Reviewer Loop</h2>
          <p className="mb-6">
            Reviewer-suggested edits to the analysis were not trusted on the reviewer&apos;s say-so.
            Modifications that touched data or analysis code were re-run through the project&apos;s
            existing automated statistical checks, so that a change recommended by a persona could
            not silently degrade the analysis. This is the same guardrail used for any AI-suggested
            change to the codebase - see{' '}
            <Link
              href="/making-of-tabs/ai-assisted-development"
              className="text-blue-600 hover:underline"
            >
              AI-Assisted Development
            </Link>{' '}
            for the full quality-gate stack.
          </p>
        </section>

        {/* ── Limitations ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>What This Method Does Not Do</h2>
          <p className="mb-6">
            The 50-reviewer process is a way to find more candidate issues earlier. It does not
            replace any of the things it might look like it&apos;s replacing:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>It is not committee review.</strong> Real committee members carry
              institutional context, programme history, and political read that no persona can
              simulate.
            </li>
            <li>
              <strong>It is not peer review.</strong> The output is unvalidated by external
              reviewers and unblinded by definition - the model knows it is reviewing the
              author&apos;s own document.
            </li>
            <li>
              <strong>It is not empirical validation.</strong> A persona claiming a finding is
              critical does not make it critical. Severity tags are inputs to triage, not
              conclusions.
            </li>
            <li>
              <strong>Self-rated metrics are self-rated.</strong> If a reviewer is asked to score
              the document&apos;s readiness, the score reflects the model&apos;s current opinion of
              the model&apos;s own previous opinion. Such scores can be useful for tracking the
              direction of change between rounds, but they are not external evidence of quality.
            </li>
          </ul>
        </section>

        {/* ── When it's worth running ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>When This Is Worth Running</h2>
          <p className="mb-6">
            The process is most useful for long, structurally complex documents where the cost of a
            late-discovered framing problem is high - dissertations, grant submissions,
            pre-registration protocols, regulatory filings. It is much less useful for short pieces
            where one or two careful human readers will catch more than a panel of personas.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            The fifty reviewers raised candidate findings. The author decided what they meant.
          </p>
        </section>
      </article>
    </div>
  )
}

export default FiftyReviewerProcessPage
